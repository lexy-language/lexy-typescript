import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";
import {HourFunction} from "../../../language/expressions/functions/hourFunction";

export class HourFunctionCall extends SingleArgumentFunctionCall<HourFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "hour";
}
