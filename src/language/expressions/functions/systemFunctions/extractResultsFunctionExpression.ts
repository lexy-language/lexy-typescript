import type {IValidationContext} from "../../../../parser/validationContext";
import type {INode} from "../../../node";

import {Mapping, mapToUsedVariable, VariablesMapping} from "../../mapping";
import {Expression} from "../../expression";
import {SourceReference} from "../../../../parser/sourceReference";
import {IdentifierExpression} from "../../identifierExpression";
import {asGeneratedType, GeneratedType} from "../../../variableTypes/generatedType";
import {VariableSource} from "../../../variableSource";
import {VariableType} from "../../../variableTypes/variableType";
import {VoidType} from "../../../variableTypes/voidType";
import {NodeType} from "../../../nodeType";
import {VariableUsage} from "../../variableUsage";
import {VariableAccess} from "../../variableAccess";
import {FunctionCallExpression} from "../functionCallExpression";
import {ExpressionSource} from "../../expressionSource";

export function instanceOfExtractResultsFunctionExpression(object: any): object is ExtractResultsFunctionExpression {
  return object?.nodeType == NodeType.ExtractResultsFunction;
}

export function asExtractResultsFunctionExpression(object: any): ExtractResultsFunctionExpression | null {
  return instanceOfExtractResultsFunctionExpression(object) ? object as ExtractResultsFunctionExpression : null;
}

export class ExtractResultsFunctionExpression extends FunctionCallExpression {

  public readonly nodeType = NodeType.ExtractResultsFunction;
  public static readonly functionName: string = `extract`;

  private get functionHelp() {
    return `${ExtractResultsFunctionExpression.functionName} expects 1 argument. extract(variable)`;
  }

  public functionResultVariable: string | null;
  public valueExpression: Expression;

  public mapping: VariablesMapping | null;

  constructor(valueExpression: Expression, source: ExpressionSource) {
    super(source);
    this.valueExpression = valueExpression;
    const identifierExpression = valueExpression as IdentifierExpression
    this.functionResultVariable = identifierExpression != null ? identifierExpression.identifier : null;
    this.mapping = null;
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    if (this.functionResultVariable == null) {
      context.logger.fail(this.reference, `Invalid variable argument. ${(this.functionHelp)}`);
      return;
    }

    let variableType = context.variableContext.getVariableTypeByName(this.functionResultVariable);
    if (variableType == null) {
      context.logger.fail(this.reference, `Unknown variable: '${(this.functionResultVariable)}'. ${(this.functionHelp)}`);
      return;
    }

    const generatedType = asGeneratedType(variableType);
    if (generatedType == null) {
      context.logger.fail(this.reference,
        `Invalid variable type: '${this.functionResultVariable}'. ` +
        `Should be Function Results. ` +
        `Use new(Function.results) or fill(Function.results) to create new function results. ${this.functionHelp}`);
      return;
    }

    this.mapping = ExtractResultsFunctionExpression.getMapping(this.reference, context, generatedType);
  }

  public static getMapping(reference: SourceReference, context: IValidationContext, generatedType: GeneratedType | null):
    VariablesMapping | null {

    if (generatedType == null) return null;

    const mapping = new Array<Mapping>();
    for (const member of generatedType.members) {
      const variable = context.variableContext.getVariable(member.name);
      if (variable == null || variable.variableSource == VariableSource.Parameters) continue;

      if (variable.variableType == null || !variable.variableType?.equals(member.type)) {
        context.logger.fail(reference,
          `Invalid parameter mapping. Variable '${member.name}' of type '${variable.variableType}' can't be mapped to parameter '${member.name}' of type '${member.type}'.`);
      } else {
        mapping.push(new Mapping(member.name, variable.variableType, variable.variableSource));
      }
    }

    if (mapping.length == 0) {
      context.logger.fail(reference,
        `Invalid parameter mapping. No parameter could be mapped from variables.`);
      return null;
    }

    return new VariablesMapping(generatedType, mapping);
  }

  public override deriveType(context: IValidationContext): VariableType {
    return new VoidType();
  }

  public static create(source: ExpressionSource, expression: Expression): FunctionCallExpression {
    return new ExtractResultsFunctionExpression(expression, source);
  }

  public override usedVariables(): ReadonlyArray<VariableUsage> {
    if (!this.mapping) return super.usedVariables();
    let callbackfn = mapToUsedVariable(VariableAccess.Write);
    let variableUsages = this.mapping.values.map(callbackfn);
    return [
      ...super.usedVariables(),
      ...variableUsages,
    ];
  }
}