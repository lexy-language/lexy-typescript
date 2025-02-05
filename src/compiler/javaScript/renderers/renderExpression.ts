import {Expression} from "../../../language/expressions/expression";
import {NodeType} from "../../../language/nodeType";
import {asMemberAccessExpression, MemberAccessExpression} from "../../../language/expressions/memberAccessExpression";
import {asLiteralExpression, LiteralExpression} from "../../../language/expressions/literalExpression";
import {asAssignmentExpression, AssignmentExpression} from "../../../language/expressions/assignmentExpression";
import {asBinaryExpression, BinaryExpression} from "../../../language/expressions/binaryExpression";
import {asBracketedExpression, BracketedExpression} from "../../../language/expressions/bracketedExpression";
import {
  asParenthesizedExpression,
  ParenthesizedExpression
} from "../../../language/expressions/parenthesizedExpression";
import {asIfExpression, IfExpression} from "../../../language/expressions/ifExpression";
import {asSwitchExpression, SwitchExpression} from "../../../language/expressions/switchExpression";
import {CaseExpression} from "../../../language/expressions/caseExpression";
import {ExpressionOperator} from "../../../language/expressions/expressionOperator";
import {asIdentifierExpression, IdentifierExpression} from "../../../language/expressions/identifierExpression";
import {
  asVariableDeclarationExpression,
  VariableDeclarationExpression
} from "../../../language/expressions/variableDeclarationExpression";
import {renderTypeDefaultExpression} from "./renderVariableClass";
import {
  asFunctionCallExpression,
  FunctionCallExpression
} from "../../../language/expressions/functions/functionCallExpression";
import {renderFunctionCall} from "../builtInFunctions/createFunctionCall";
import {matchesLineExpressionException} from "../lineExpressionExceptions/matchesLineExpressionException";
import {TokenType} from "../../../parser/tokens/tokenType";
import {asDateTimeLiteral} from "../../../parser/tokens/dateTimeLiteral";
import {logAssignmentVariables, logLineAndVariables} from "./rendeLogCalls";
import {renderVariableReference} from "./renderVariableReference";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {CodeWriter} from "../writers/codeWriter";
import {asElseifExpression, ElseifExpression} from "../../../language/expressions/elseifExpression";
import {asElseExpression, ElseExpression} from "../../../language/expressions/elseExpression";

function renderExpressionLine(codeWriter: CodeWriter, expression: Expression) {
  logLineAndVariables(expression, codeWriter);
  const line = codeWriter.currentLine;
  codeWriter.startLine()

  const exception = matchesLineExpressionException(expression);
  if (exception != null) {
    exception.render(expression, codeWriter);
  } else {
    renderExpression(expression, codeWriter);
    if (line == codeWriter.currentLine) {
      codeWriter.endLine(";");
    }
  }
  logAssignmentVariables(expression, codeWriter);
  codeWriter.writeLine();
}

export function renderExpressions(expressions: ReadonlyArray<Expression> | undefined, createScope: boolean, codeWriter: CodeWriter) {
  if (expressions == undefined) return;
  if (createScope) {
    codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.useLastNodeAsScope();`)
  }
  for (const expression of expressions) {
    renderExpressionLine(codeWriter, expression);
  }
  if (createScope) {
    codeWriter.writeLine(`${LexyCodeConstants.contextVariable}.revertToParentScope();`)
  }
}

export function renderValueExpression(expression: Expression, codeWriter: CodeWriter) {

  function render<T>(castFunction: (expression: Expression) => T | null, render: (render: T, codeWriter: CodeWriter) => void) {
    const specificExpression = castFunction(expression);
    if (specificExpression == null) throw new Error(`Invalid expression type: '${expression.nodeType}' cast is null`);
    render(specificExpression, codeWriter);
  }

  switch (expression.nodeType) {
    case NodeType.LiteralExpression:
      return render(asLiteralExpression, renderLiteralExpression);

    case NodeType.IdentifierExpression:
      return render(asIdentifierExpression, renderIdentifierExpression);

    case NodeType.MemberAccessExpression:
      return render(asMemberAccessExpression, renderMemberAccessExpression);

    default:
      throw new Error(`Invalid expression type: ${expression.nodeType}`);
  }
}

export function renderExpression(expression: Expression, codeWriter: CodeWriter) {

  function render<T>(castFunction: (expression: Expression) => T | null, render: (render: T, codeWriter: CodeWriter) => void) {
    const specificExpression = castFunction(expression);
    if (specificExpression == null) throw new Error(`Invalid expression type: '${expression.nodeType}' cast is null`);
    render(specificExpression, codeWriter);
  }

  switch (expression.nodeType) {
    case NodeType.AssignmentExpression:
      return render(asAssignmentExpression, renderAssignmentExpression);

    case NodeType.BinaryExpression:
      return render(asBinaryExpression, renderBinaryExpression);

    case NodeType.BracketedExpression:
      return render(asBracketedExpression, renderBracketedExpression);

    case NodeType.IfExpression:
      return render(asIfExpression, renderIfExpression);

    case NodeType.LiteralExpression:
      return render(asLiteralExpression, renderLiteralExpression);

    case NodeType.IdentifierExpression:
      return render(asIdentifierExpression, renderIdentifierExpression);

    case NodeType.ParenthesizedExpression:
      return render(asParenthesizedExpression, renderParenthesizedExpression);

    case NodeType.SwitchExpression:
      return render(asSwitchExpression, renderSwitchExpression);

    case NodeType.MemberAccessExpression:
      return render(asMemberAccessExpression, renderMemberAccessExpression);

    case NodeType.VariableDeclarationExpression:
      return render(asVariableDeclarationExpression, renderVariableDeclarationExpression);
  }

  const functionCallExpression = asFunctionCallExpression(expression);
  if (functionCallExpression != null) {
    return render(asFunctionCallExpression, renderFunctionCallExpression);
  }

  throw new Error(`Invalid expression type: ${expression.nodeType}`);
}

function renderMemberAccessExpression(memberAccessExpression: MemberAccessExpression, codeWriter: CodeWriter) {
  if (memberAccessExpression.variable == null || memberAccessExpression.variable.path.parts < 2) throw new Error(`Invalid MemberAccessExpression: ${memberAccessExpression}`);
  renderVariableReference(memberAccessExpression.variable, codeWriter);
}

function renderIdentifierExpression(expression: IdentifierExpression, codeWriter: CodeWriter) {
  if (expression.variable == null) throw new Error(`Invalid IdentifierExpression: ${expression}`);
  renderVariableReference(expression.variable, codeWriter);
}

function renderLiteralExpression(expression: LiteralExpression, codeWriter: CodeWriter) {
  function format(digits: number, number: number): string {
    let result = number.toString();
    while (result.length < digits) {
      result = "0" + result;
    }
    return result;
  }

  if (expression.literal.tokenType == TokenType.QuotedLiteralToken) {
    codeWriter.write(`"${expression.literal.value}"`);
  } else if (expression.literal.tokenType == TokenType.DateTimeLiteral) {
    const dateTimeLiteral = asDateTimeLiteral(expression.literal);
    const dateValue = dateTimeLiteral?.dateTimeValue;
    if (dateValue == null) throw new Error("DateTimeLiteral.dateTimeValue expected")
    codeWriter.write(`new Date("${format(4, dateValue.getFullYear())}-${format(2, dateValue.getMonth() + 1)}-${format(2, dateValue.getDate())}T${format(2, dateValue.getHours())}:${format(2, dateValue.getMinutes())}:${format(2, dateValue.getSeconds())}")`);
  } else {
    codeWriter.write(expression.literal.value);
  }
}

function renderAssignmentExpression(expression: AssignmentExpression, codeWriter: CodeWriter) {
  renderExpression(expression.variable, codeWriter);
  codeWriter.write(" = ");
  renderExpression(expression.assignment, codeWriter);
}

function renderBinaryExpression(expression: BinaryExpression, codeWriter: CodeWriter) {
  renderExpression(expression.left, codeWriter);
  codeWriter.write(operatorString(expression.operator));
  renderExpression(expression.right, codeWriter);
}

function operatorString(operator: ExpressionOperator) {
  switch (operator) {
    case ExpressionOperator.Addition:
      return " + ";
    case ExpressionOperator.Subtraction:
      return " - ";
    case ExpressionOperator.Multiplication:
      return " * ";
    case ExpressionOperator.Division:
      return " / ";
    case ExpressionOperator.Modulus:
      return " % ";
    case ExpressionOperator.GreaterThan:
      return " > ";
    case ExpressionOperator.GreaterThanOrEqual:
      return " >= ";
    case ExpressionOperator.LessThan:
      return " < ";
    case ExpressionOperator.LessThanOrEqual:
      return " <= ";
    case ExpressionOperator.And:
      return " && ";
    case ExpressionOperator.Or:
      return " || ";
    case ExpressionOperator.Equals:
      return " == ";
    case ExpressionOperator.NotEqual:
      return " != ";

    default:
      throw new Error("Invalid operator: " + operator)
  }
}

function renderBracketedExpression(expression: BracketedExpression, codeWriter: CodeWriter) {
  codeWriter.write("[");
  renderExpression(expression.expression, codeWriter);
  codeWriter.write("]");
}


function renderIfExpression(expression: IfExpression, codeWriter: CodeWriter) {
  codeWriter.write("if (");
  renderExpression(expression.condition, codeWriter);
  codeWriter.openInlineScope(")");
  renderExpressions(expression.trueExpressions, true, codeWriter);

  for (const childExpression of expression.elseExpressions) {
    const elseExpression = asElseExpression(childExpression);
    if (elseExpression != null) {
      renderElseExpression(elseExpression, codeWriter);
      continue;
    }
    const elseifExpression = asElseifExpression(childExpression);
    if (elseifExpression != null) {
      renderElseifExpression(elseifExpression, codeWriter);
    }
  }

  codeWriter.closeScope();
}

function renderElseExpression(expression: ElseExpression, codeWriter: CodeWriter) {
  codeWriter.writeLine("} else {");
  logLineAndVariables(expression, codeWriter);
  renderExpressions(expression.falseExpressions, true, codeWriter);
}

function renderElseifExpression(expression: ElseifExpression, codeWriter: CodeWriter) {
  codeWriter.startLine("} else if (");
  renderExpression(expression.condition, codeWriter);
  codeWriter.openInlineScope(")");
  renderExpressions(expression.trueExpressions, true, codeWriter);
}

function renderParenthesizedExpression(expression: ParenthesizedExpression, codeWriter: CodeWriter) {
  codeWriter.write("(");
  renderExpression(expression.expression, codeWriter);
  codeWriter.write(")");
}

function renderCaseExpression(caseValue: CaseExpression, codeWriter: CodeWriter) {

  if (caseValue.value == null) {
    codeWriter.openScope("default:");
  } else {
    codeWriter.startLine("case ");
    renderExpression(caseValue.value, codeWriter)
    codeWriter.openInlineScope(":");
  }

  logLineAndVariables(caseValue, codeWriter);
  renderExpressions(caseValue.expressions, true, codeWriter);
  codeWriter.writeLine("break;")
  codeWriter.closeScope()
}

function renderSwitchExpression(expression: SwitchExpression, codeWriter: CodeWriter) {
  codeWriter.write("switch(");
  renderExpression(expression.condition, codeWriter)
  codeWriter.openInlineScope(")");
  for (const caseValue of expression.cases) {
    renderCaseExpression(caseValue, codeWriter)
  }
  codeWriter.closeScope()
}

function renderVariableDeclarationExpression(expression: VariableDeclarationExpression, codeWriter: CodeWriter) {
  codeWriter.write(`let ${expression.name} = `);
  if (expression.assignment != null) {
    renderExpression(expression.assignment, codeWriter);
  } else {
    renderTypeDefaultExpression(expression.type, codeWriter);
  }
}


function renderFunctionCallExpression(expression: FunctionCallExpression, codeWriter: CodeWriter) {
  renderFunctionCall(expression, codeWriter);
}