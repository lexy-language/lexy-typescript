import {Expression} from "../../../language/expressions/expression";
import {CodeWriter} from "../writers/codeWriter";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {replaceAll} from "../../../infrastructure/replaceAll";
import {unique, where} from "../../../infrastructure/arrayFunctions";
import {VariableAccess} from "../../../language/expressions/variableAccess";
import {VariableUsage} from "../../../language/expressions/variableUsage";
import {renderVariableReference} from "./renderVariableReference";

function getUsedVariables(expression: Expression, access: VariableAccess) {
  const usage = expression.usedVariables();
  return unique(where(usage, variable => variable.access == access), variable => variable.path.fullPath());
}

function getReadVariables(expression: Expression): Array<VariableUsage> {
  return getUsedVariables(expression, VariableAccess.Read);
}

function getWriteVariables(expression: Expression) {
  return getUsedVariables(expression, VariableAccess.Write);
}

function renderLogVariablesParameter(variable: VariableUsage, index: number, codeWriter: CodeWriter, last: boolean) {
  codeWriter.write(`['${variable.path.fullPath()}']: `);
  renderVariableReference(variable, codeWriter);
  if (!last) {
    codeWriter.write(", ");
  }
}

function renderLogVariablesParameters(variables: Array<VariableUsage>, codeWriter: CodeWriter) {
  if (!variables || variables.length == 0) return;
  for (let index = 0; index < variables.length; index++) {
    const variable = variables[index];
    renderLogVariablesParameter(variable, index, codeWriter, index == variables.length - 1);
  }
}

export function logLineAndVariables(expression: Expression, codeWriter: CodeWriter) {
  const variables = getReadVariables(expression);
  const codeLine = replaceAll(expression.source.line.content.substring(2), "\"", "'");
  codeWriter.startLine(`const __logLine${expression.source.line.index} = ${LexyCodeConstants.contextVariable}.log("${codeLine}", ${expression.source.line.index}, {`);
  renderLogVariablesParameters(variables, codeWriter);
  codeWriter.endLine('});')
}

export function logAssignmentVariables(expression: Expression, codeWriter: CodeWriter) {
  const variables = getWriteVariables(expression);
  codeWriter.startLine(`__logLine${expression.source.line.index}.addVariables({`);
  renderLogVariablesParameters(variables, codeWriter);
  codeWriter.endLine('});')
}