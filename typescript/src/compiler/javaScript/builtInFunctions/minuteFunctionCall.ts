import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";
import {MinuteFunction} from "../../../language/expressions/functions/minuteFunction";

export class MinuteFunctionCall extends SingleArgumentFunctionCall<MinuteFunction>{
   protected override className = "builtInDateFunctions";
   protected override methodName = "minute";
}
