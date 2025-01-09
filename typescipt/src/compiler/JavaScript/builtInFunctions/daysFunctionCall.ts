import {EndStartDateFunctionCall} from "./endStartDateFunctionCall";
import {DaysFunction} from "../../../language/expressions/functions/daysFunction";

export class DaysFunctionCall extends EndStartDateFunctionCall<DaysFunction> {
  protected override className = "BuiltInDateFunctions";
  protected override methodName = "days";
}
