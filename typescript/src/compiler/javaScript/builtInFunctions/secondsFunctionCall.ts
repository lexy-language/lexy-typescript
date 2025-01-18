import {EndStartDateFunctionCall} from "./endStartDateFunctionCall";
import {SecondsFunction} from "../../../language/expressions/functions/secondsFunction";

export class SecondsFunctionCall extends EndStartDateFunctionCall<SecondsFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "seconds";
}
