import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";
import {DayFunction} from "../../../language/expressions/functions/dayFunction";

export class DayFunctionCall extends SingleArgumentFunctionCall<DayFunction> {
  protected override className = "builtInDateFunctions";
  protected override methodName = "day";
}
