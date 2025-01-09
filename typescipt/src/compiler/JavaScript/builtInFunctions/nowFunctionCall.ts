import {NoArgumentFunctionCall} from "./noArgumentFunctionCall";
import {NowFunction} from "../../../language/expressions/functions/nowFunction";


export class NowFunctionCall extends NoArgumentFunctionCall<NowFunction> {
   protected override className = "BuiltInDateFunctions";
   protected override methodName = "now";
}
