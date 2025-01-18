import {NoArgumentFunctionCall} from "./noArgumentFunctionCall";
import {NowFunction} from "../../../language/expressions/functions/nowFunction";


export class NowFunctionCall extends NoArgumentFunctionCall<NowFunction> {
   protected override className = "builtInDateFunctions";
   protected override methodName = "now";
}
