import {SingleArgumentFunctionCall} from "./singleArgumentFunctionCall";
import {IntFunction} from "../../../language/expressions/functions/intFunction";

export class IntFunctionCall extends SingleArgumentFunctionCall<IntFunction>{
   protected override className = "BuiltInNumberFunctions";
   protected override methodName = "int";
}
