import {Expression} from "../../../language/expressions/expression";
import {FillFunctionStatement} from "./fillFunctionStatement";
import {ExtractFunctionStatement} from "./extractFunctionStatement";
import {AutoMapLexyFunctionStatement} from "./autoMapLexyFunctionStatement";
import {firstOrDefault} from "../../../infrastructure/arrayFunctions";
import {CodeWriter} from "../codeWriter";
import {ExtractResultsFunctionExpression} from "../../../language/expressions/functions/systemFunctions/extractResultsFunctionExpression";
import {VariableDeclarationExpression} from "../../../language/expressions/variableDeclarationExpression";
import {LexyFunctionCallExpression} from "../../../language/expressions/functions/lexyFunctionCallExpression";
import {NewFunctionExpressionStatement} from "./newFunctionStatement";

class Renderer {

  private static allValues: Array<Renderer>;

  public static get all(): Array<Renderer> {
    if (Renderer.allValues == null) {
      Renderer.allValues = Renderer.initialize();
    }
    return this.allValues;
  }

  public matches: (expression: Expression) => boolean;
  public render: (expression: Expression, codeWriter: CodeWriter) => void;

  constructor(
    matches: (expression: Expression) => boolean,
    render: (expression: Expression, codeWriter: CodeWriter) => void) {
    this.matches = matches;
    this.render = render;
  }

  private static initialize() {
    return [
      add<VariableDeclarationExpression>(NewFunctionExpressionStatement.matches, NewFunctionExpressionStatement.render),
      add<VariableDeclarationExpression>(FillFunctionStatement.matches, FillFunctionStatement.render),
      add<ExtractResultsFunctionExpression>(ExtractFunctionStatement.matches, ExtractFunctionStatement.render),
      add<LexyFunctionCallExpression>(AutoMapLexyFunctionStatement.matches, AutoMapLexyFunctionStatement.render)
    ];
  }
}

function add<TExpression extends Expression>(
  matches: (expression: Expression) => boolean,
  render: (expression: TExpression, codeWriter: CodeWriter) => void) {

  function renderCast(expression: Expression, codeWriter: CodeWriter) {
    return render(expression as TExpression, codeWriter);
  }

  return new Renderer(matches, renderCast);
}

export function renderExpressionStatement(expression: Expression) {
  return firstOrDefault(Renderer.all, renderer => renderer.matches(expression));
}