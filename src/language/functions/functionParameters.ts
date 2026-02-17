import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParseLineContext} from "../../parser/context/parseLineContext";

import {IParsableNode, ParsableNode} from "../parsableNode";
import {VariableDefinition} from "../variableDefinition";
import {SourceReference} from "../sourceReference";
import {VariableSource} from "../variableSource";
import {NodeType} from "../nodeType";
import {NodeReference} from "../nodeReference";
import {Function} from "./function";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfFunctionParameters(object: any) {
  return object?.nodeType == NodeType.FunctionParameters;
}

export function asFunctionParameters(object: any): FunctionParameters | null {
  return instanceOfFunctionParameters(object) ? object as FunctionParameters : null;
}

export class FunctionParameters extends ParsableNode {

  private variablesValue: Array<VariableDefinition> = [];

  public readonly nodeType = NodeType.FunctionParameters;

  public get variables(): readonly VariableDefinition[] {
    return this.variablesValue;
  }

  constructor(parent: Function, reference: SourceReference) {
    super(new NodeReference(parent), reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    const variableDefinition = VariableDefinition.parse(VariableSource.Parameters, context, new NodeReference(this));
    if (variableDefinition != null) {
      this.variablesValue.push(variableDefinition);
    }
    return this;
  }

  public override getChildren(): Array<INode> {
    return [...this.variables];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, "parameters", "function parameter variables", SymbolKind.Keyword);
  }
}
