import {Expression} from "../../../language/expressions/expression";
import {firstOrDefault} from "../../../infrastructure/arrayFunctions";
import {CodeWriter} from "../codeWriter";
import {FunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {LexyFunctionCall} from "./lexyFunctionCall";
import {MemberFunctionCallExpression} from "../../../language/expressions/functions/memberFunctionCallExpression";
import {LexyFunctionCallExpression} from "../../../language/expressions/functions/lexyFunctionCallExpression";
import {LibraryFunctionCall} from "./libraryFunctionCall";
import {TableLookUpFunctionCall} from "./lookUpFunctionCall";
import {TableLookUpRowFunctionCall} from "./lookUpRowFunctionCall";

class Renderer {

  private static allValues: Array<Renderer>;

  public static get all(): Array<Renderer> {
    if (Renderer.allValues == null) {
      Renderer.allValues = Renderer.initialize();
    }
    return this.allValues;
  }

  public matches: (expression: FunctionCallExpression) => boolean;
  public render: (expression: FunctionCallExpression, codeWriter: CodeWriter) => void;

  constructor(
    matches: (expression: Expression) => boolean,
    render: (expression: Expression, codeWriter: CodeWriter) => void) {
    this.matches = matches;
    this.render = render;
  }

  private static initialize() {
    return [
      add<MemberFunctionCallExpression>(TableLookUpFunctionCall.matches, TableLookUpFunctionCall.render),
      add<MemberFunctionCallExpression>(TableLookUpRowFunctionCall.matches, TableLookUpRowFunctionCall.render),
      add<LexyFunctionCallExpression>(LexyFunctionCall.matches, LexyFunctionCall.render),
      add<MemberFunctionCallExpression>(LibraryFunctionCall.matches, LibraryFunctionCall.render)
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

export function renderFunctionCall(expression: FunctionCallExpression, codeWriter: CodeWriter) {
  const renderer = firstOrDefault(Renderer.all, renderer => {
    let matches = renderer.matches(expression)
    return matches;
  });
  if (renderer == null) {
    throw new Error(`Couldn't find creator for expression: '${expression.nodeType}'`)
  }
  return renderer.render(expression, codeWriter);
}