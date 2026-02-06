import type {IValidationContext} from "../../parser/context/validationContext";

import {Node} from "../node";
import {ExpressionSource} from "./expressionSource";
import {SourceReference} from "../sourceReference";
import {Type} from "../typeSystem/type";
import {VariableUsage} from "./variableUsage";
import {NodeReference} from "../nodeReference";
import {NodeType} from "../nodeType";

export function instanceOfExpression(object: any): object is Expression {
  return object?.isExpression == true;
}

export function asExpression(object: any): Expression | null {
  return instanceOfExpression(object) ? object as Expression : null;
}

export abstract class Expression extends Node {

  public readonly isExpression = true;
  public source: ExpressionSource;

  protected constructor(source: ExpressionSource, parentReference: NodeReference, reference: SourceReference) {
    super(parentReference, reference);
    this.source = source;
  }

  public toString(): string {
    const writer = new Array<string>();
    writer.push(`(${this.nodeType}) `);

    for (let index = 0; index < this.source.tokens.length; index++) {
      let token = this.source.tokens.get(index);
      writer.push(token.value);
      if (index < this.source.tokens.length - 1) {
        writer.push(" ");
      }
    }
    return writer.join('');
  }

  public abstract deriveType(context: IValidationContext): Type | null;

  public usedVariables(): ReadonlyArray<VariableUsage> {
    return [];
  }
}
