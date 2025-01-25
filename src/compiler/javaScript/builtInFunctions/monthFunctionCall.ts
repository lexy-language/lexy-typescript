import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";
import {MonthFunction} from "../../../language/expressions/functions/monthFunction";

export class MonthFunctionCall extends SingleArgumentFunctionCall<MonthFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "month";
}
