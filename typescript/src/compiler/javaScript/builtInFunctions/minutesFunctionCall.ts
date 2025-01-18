import {EndStartDateFunctionCall} from "./endStartDateFunctionCall";
import {MinutesFunction} from "../../../language/expressions/functions/minutesFunction";

export class MinutesFunctionCall extends EndStartDateFunctionCall<MinutesFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "minutes";
}
