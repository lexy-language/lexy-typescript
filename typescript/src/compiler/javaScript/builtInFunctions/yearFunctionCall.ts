import {YearFunction} from "../../../language/expressions/functions/yearFunction";
import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";

export class YearFunctionCall extends SingleArgumentFunctionCall<YearFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "year";
}
