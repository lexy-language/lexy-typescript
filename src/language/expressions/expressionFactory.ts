import type {INode} from "../node";

import {TokenList} from "../../parser/tokens/tokenList";
import {ExpressionSource} from "./expressionSource";
import {newParseExpressionFailed, ParseExpressionResult} from "./parseExpressionResult";
import {Line} from "../../parser/line";
import {NodeReference} from "../nodeReference";

export type FactoryInstance = {
  criteria: (tokens: TokenList) => boolean,
  parse: ((source: ExpressionSource, parentReference: NodeReference) => ParseExpressionResult)
};

export class ExpressionFactory  {

  private static factories: FactoryInstance[] | null = null;

  public static initialize(instances: FactoryInstance[]) {
    if (this.factories == null) {
      this.factories = instances;
    }
  }

  public static parse(parent: NodeReference | INode, tokens: TokenList, currentLine: Line): ParseExpressionResult {

    if (ExpressionFactory.factories == null) {
      throw new Error("Expression factory not initialized. initializeExpressionFactory should be called. " +
        "ExpressionFactory can't initialize it's expressions itself because it generates a circular reference.")
    }

    const parentReference = parent == null
      ? new NodeReference(null, true)
      : (parent as any).nodeType != undefined
        ? new NodeReference(parent as INode)
      : parent as NodeReference;

    const source = new ExpressionSource(currentLine, tokens);
    for (let index = 0; index < ExpressionFactory.factories.length; index++) {
      const factory = ExpressionFactory.factories[index];
      if (factory.criteria(tokens)) {
        return factory.parse(source, parentReference);
      }
    }

    return newParseExpressionFailed("ExpressionFactory", `Invalid expression: ${tokens}`);
  }
}
