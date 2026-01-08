import {asExpression, Expression} from "./expression";
import {asHasVariableReference} from "./IHasVariableReference";
import {VariableAccess} from "./variableAccess";
import {NodesWalker} from "../nodesWalker";
import {VariableUsage} from "./variableUsage";
import {Assert} from "../../infrastructure/assert";

function addVariableExpression(expression: Expression | null, results: Array<VariableUsage>) {
  if (expression == null) return;

  const hasVariableReference = asHasVariableReference(expression);
  if (hasVariableReference == null) return;

  const reference = hasVariableReference.variable;
  if (reference != null) {
    const usage = new VariableUsage(reference.path, reference.componentType, reference.variableType, reference.source, VariableAccess.Read);
    results.push(usage);
  }
}

export function getReadVariableUsageNodes(expressions: Array<Expression>): ReadonlyArray<VariableUsage> {
  const results = new Array<VariableUsage>();
  NodesWalker.walkNodes(expressions, node => {
    const expressionNode = Assert.is<Expression>(asExpression, node, "node");
    addVariableExpression(expressionNode, results);
  })
  return results
}

export function getReadVariableUsage(expression: Expression): ReadonlyArray<VariableUsage> {
  const results = new Array<VariableUsage>();
  NodesWalker.walk(expression, node => {
    const expressionNode = Assert.is<Expression>(asExpression, node, "node");
    addVariableExpression(expressionNode, results);
  })
  return results
}