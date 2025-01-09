import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";
import {DayFunction} from "../../../language/expressions/functions/dayFunction";

export class DayFunctionCall extends SingleArgumentFunctionCall<DayFunction> {
  protected override className = "BuiltInDateFunctions";
  protected override methodName = "day";
}
