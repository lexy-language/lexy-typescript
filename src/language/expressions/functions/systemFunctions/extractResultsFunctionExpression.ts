import type {IValidationContext} from "../../../../parser/context/validationContext";
import type {INode} from "../../../node";
import type {IObjectMember} from "../../../typeSystem/objects/objectMember";
import type {IdentifierExpression} from "../../identifierExpression";

import {Mapping, mapToUsedVariable, VariablesMapping} from "../../mapping";
import {Expression} from "../../expression";
import {SourceReference} from "../../../sourceReference";
import {asGeneratedType, GeneratedType} from "../../../typeSystem/objects/generatedType";
import {VariableSource} from "../../../variableSource";
import {Type} from "../../../typeSystem/type";
import {VoidType} from "../../../typeSystem/voidType";
import {NodeType} from "../../../nodeType";
import {VariableUsage} from "../../variableUsage";
import {VariableAccess} from "../../variableAccess";
import {FunctionCallExpression} from "../functionCallExpression";
import {ExpressionSource} from "../../expressionSource";
import {NodeReference} from "../../../nodeReference";
import {Symbol} from "../../../symbols/symbol";
import {SymbolKind} from "../../../symbols/symbolKind";

export function instanceOfExtractResultsFunctionExpression(object: any): object is ExtractResultsFunctionExpression {
  return object?.nodeType == NodeType.ExtractResultsFunction;
}

export function asExtractResultsFunctionExpression(object: any): ExtractResultsFunctionExpression | null {
  return instanceOfExtractResultsFunctionExpression(object) ? object as ExtractResultsFunctionExpression : null;
}

export class ExtractResultsFunctionState {

  public mapping: VariablesMapping;

  constructor(mapping: VariablesMapping) {
    this.mapping = mapping;
  }
}

export class ExtractResultsFunctionExpression extends FunctionCallExpression {

  public static readonly functionName: string = `extract`;

  private get functionHelp() {
    return `${ExtractResultsFunctionExpression.functionName} expects 1 argument. extract(variable)`;
  }

  private stateValue: ExtractResultsFunctionState | null = null;

  public readonly nodeType = NodeType.ExtractResultsFunction;

  public functionResultVariable: string | null;
  public valueExpression: Expression;

  public get state(): ExtractResultsFunctionState | null {
    return this.stateValue;
  }

  public get stateRequired(): ExtractResultsFunctionState {
    if (this.stateValue == null) throw new Error("State not set.")
    return this.stateValue;
  }

  public readonly name: string = ExtractResultsFunctionExpression.functionName;

  constructor(valueExpression: Expression, parentReference: NodeReference, source: ExpressionSource) {
    super(parentReference, source);
    this.valueExpression = valueExpression;
    const identifierExpression = valueExpression as IdentifierExpression
    this.functionResultVariable = identifierExpression != null ? identifierExpression.identifier : null;
  }

  public override getChildren(): Array<INode> {
    return [this.valueExpression];
  }

  protected override validate(context: IValidationContext): void {
    if (this.functionResultVariable == null) {
      context.logger.fail(this.reference, `Invalid variable argument. ${(this.functionHelp)}`);
      return;
    }

    let type = context.variableContext.getTypeByName(this.functionResultVariable);
    if (type == null) {
      context.logger.fail(this.reference, `Unknown variable: '${(this.functionResultVariable)}'. ${(this.functionHelp)}`);
      return;
    }

    const generatedType = asGeneratedType(type);
    if (generatedType == null) {
      context.logger.fail(this.reference,
        `Invalid variable type: '${this.functionResultVariable}'. ` +
        `Should be Function Results. ` +
        `Use new(Function.results) or fill(Function.results) to create new function results. ${this.functionHelp}`);
      return;
    }

    const mapping = ExtractResultsFunctionExpression.getMapping(this.reference, context, generatedType);
    if (mapping == null) return;

    this.stateValue = new ExtractResultsFunctionState(mapping);
  }

  public static getMapping(reference: SourceReference, context: IValidationContext, generatedType: GeneratedType | null):
    VariablesMapping | null {

    if (generatedType == null) return null;

    const mapping = new Array<Mapping>();
    for (const member of generatedType.members) {
      this.addMapping(reference, context, member, mapping);
    }

    if (mapping.length == 0) {
      context.logger.fail(reference,
        `Invalid parameter mapping. No parameter could be mapped from variables.`);
      return null;
    }

    return new VariablesMapping(generatedType, mapping);
  }

  private static addMapping(reference: SourceReference, context: IValidationContext, member: IObjectMember, mapping: Mapping[]) {

    const variable = context.variableContext.getVariable(member.name);
    if (variable == null || variable.variableSource == VariableSource.Parameters) return;

    if (variable.type == null || !variable.type?.equals(member.type)) {
      context.logger.fail(reference,
        `Invalid parameter mapping. Variable '${member.name}' of type '${variable.type}' can't be mapped to parameter '${member.name}' of type '${member.type}'.`);
    } else {
      mapping.push(new Mapping(reference, member.name, variable.type, variable.variableSource));
    }
  }

  public override deriveType(context: IValidationContext): Type {
    return new VoidType();
  }

  public static create(expression: Expression, parent: NodeReference, source: ExpressionSource): FunctionCallExpression {
    return new ExtractResultsFunctionExpression(expression, parent, source);
  }

  public override usedVariables(): ReadonlyArray<VariableUsage> {
    if (!this.state?.mapping) return super.usedVariables();
    let variableUsages = this.state.mapping.values.map(mapToUsedVariable(VariableAccess.Write));
    return [
      ...super.usedVariables(),
      ...variableUsages,
    ];
  }

  public override getSymbol(): Symbol {
    return new Symbol(this.reference, ExtractResultsFunctionExpression.functionName, this.functionHelp, SymbolKind.SystemFunction);
  }
}
