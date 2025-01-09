import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";
import {SecondFunction} from "../../../language/expressions/functions/secondFunction";

export class SecondFunctionCall extends SingleArgumentFunctionCall<SecondFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "second";
}
