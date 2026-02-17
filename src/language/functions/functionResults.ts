import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";

import {VariableDefinition} from "../variableDefinition";
import {SourceReference} from "../sourceReference";
import {IParsableNode, ParsableNode} from "../parsableNode";
import {VariableSource} from "../variableSource";
import {NodeType} from "../nodeType";
import {Symbol} from "../symbols/symbol";
import {Function} from "./function";
import {NodeReference} from "../nodeReference";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfFunctionResults(object: any) {
  return object?.nodeType == NodeType.FunctionResults;
}

export function asFunctionResults(object: any): FunctionResults | null {
  return instanceOfFunctionResults(object) ? object as FunctionResults : null;
}

export class FunctionResults extends ParsableNode {

  private variablesValue: Array<VariableDefinition> = [];

  public readonly nodeType = NodeType.FunctionResults;

  public get variables(): ReadonlyArray<VariableDefinition> {
    return this.variablesValue;
  }

  constructor(parent: Function, reference: SourceReference) {
    super(new NodeReference(parent), reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    const variableDefinition = VariableDefinition.parse(VariableSource.Results, context, new NodeReference(this));
    if (variableDefinition == null) return this;

    if (variableDefinition.defaultExpression != null) {
      context.logger.fail(this.reference,
        `Result variable '${variableDefinition.name}' should not have a default value.`);
      return this;
    }

    this.variablesValue.push(variableDefinition);

    return this;
  }

  public override getChildren(): Array<INode> {
    return [...this.variables];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, "results", "function result variables", SymbolKind.Keyword);
  }
}
