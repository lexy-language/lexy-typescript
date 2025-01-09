import {AbsFunction} from "../../../language/expressions/functions/absFunction";
import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";

export class AbsFunctionCall extends SingleArgumentFunctionCall<AbsFunction> {
  protected override className = "BuiltInNumberFunctions";
  protected override methodName = "abs";
}
