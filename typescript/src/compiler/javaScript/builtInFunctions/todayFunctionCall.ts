import {NoArgumentFunctionCall} from "./noArgumentFunctionCall";
import {TodayFunction} from "../../../language/expressions/functions/todayFunction";

export class TodayFunctionCall extends NoArgumentFunctionCall<TodayFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "today";
}
