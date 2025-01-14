import {SourceReference} from "../../../parser/sourceReference";
import {
  newParseExpressionFunctionsFailed,
  newParseExpressionFunctionsSuccess,
  ParseExpressionFunctionsResult
} from "../parseExpressionFunctionsResult";
import {Expression} from "../expression";
import {IntFunction} from "./intFunction";
import {AbsFunction} from "./absFunction";
import {PowerFunction} from "./powerFunction";
import {RoundFunction} from "./roundFunction";
import {NowFunction} from "./nowFunction";
import {TodayFunction} from "./todayFunction";
import {YearFunction} from "./yearFunction";
import {MonthFunction} from "./monthFunction";
import {DayFunction} from "./dayFunction";
import {HourFunction} from "./hourFunction";
import {MinuteFunction} from "./minuteFunction";
import {SecondFunction} from "./secondFunction";
import {YearsFunction} from "./yearsFunction";
import {MonthsFunction} from "./monthsFunction";
import {DaysFunction} from "./daysFunction";
import {HoursFunction} from "./hoursFunction";
import {MinutesFunction} from "./minutesFunction";
import {SecondsFunction} from "./secondsFunction";
import {LookupFunction} from "./lookupFunction";
import {LookupRowFunction} from "./lookupRowFunction";
import {NewFunction} from "./newFunction";
import {FillParametersFunction} from "./fillParametersFunction";
import {ExtractResultsFunction} from "./extractResultsFunction";
import {ExpressionFunction} from "./expressionFunction";


export class BuiltInExpressionFunctions {
   private static readonly values: { 
     key: string, 
     factory: (value: string, reference: SourceReference, expressions: Array<Expression>) => ParseExpressionFunctionsResult }[] = [
         { key: IntFunction.functionName, factory: BuiltInExpressionFunctions.create1(IntFunction.create) },
         { key: AbsFunction.functionName, factory: BuiltInExpressionFunctions.create1(AbsFunction.create) },
         { key: PowerFunction.functionName, factory: BuiltInExpressionFunctions.create2(PowerFunction.create) },
         { key: RoundFunction.functionName, factory: BuiltInExpressionFunctions.create2(RoundFunction.create) },

         { key: NowFunction.functionName, factory: BuiltInExpressionFunctions.create0(NowFunction.create) },
         { key: TodayFunction.functionName, factory: BuiltInExpressionFunctions.create0(TodayFunction.create) },

         { key: YearFunction.functionName, factory: BuiltInExpressionFunctions.create1(YearFunction.create) },
         { key: MonthFunction.functionName, factory: BuiltInExpressionFunctions.create1(MonthFunction.create) },
         { key: DayFunction.functionName, factory: BuiltInExpressionFunctions.create1(DayFunction.create) },
         { key: HourFunction.functionName, factory: BuiltInExpressionFunctions.create1(HourFunction.create) },
         { key: MinuteFunction.functionName, factory: BuiltInExpressionFunctions.create1(MinuteFunction.create) },
         { key: SecondFunction.functionName, factory: BuiltInExpressionFunctions.create1(SecondFunction.create) },

         { key: YearsFunction.functionName, factory: BuiltInExpressionFunctions.create2(YearsFunction.create) },
         { key: MonthsFunction.functionName, factory: BuiltInExpressionFunctions.create2(MonthsFunction.create) },
         { key: DaysFunction.functionName, factory: BuiltInExpressionFunctions.create2(DaysFunction.create) },
         { key: HoursFunction.functionName, factory: BuiltInExpressionFunctions.create2(HoursFunction.create) },
         { key: MinutesFunction.functionName, factory: BuiltInExpressionFunctions.create2(MinutesFunction.create) },
         { key: SecondsFunction.functionName, factory: BuiltInExpressionFunctions.create2(SecondsFunction.create) },

         { key: LookupFunction.functionName, factory: LookupFunction.parse },
         { key: LookupRowFunction.functionName, factory: LookupRowFunction.parse },

         { key: NewFunction.functionName, factory: BuiltInExpressionFunctions.create1(NewFunction.create) },
         { key: FillParametersFunction.functionName, factory: BuiltInExpressionFunctions.create1(FillParametersFunction.create) },
         { key: ExtractResultsFunction.functionName, factory: BuiltInExpressionFunctions.create1(ExtractResultsFunction.create) }
       ];

   public static parse(functionName: string, reference: SourceReference, argumentValues: Array<Expression>): ParseExpressionFunctionsResult | null {
     for (let index = 0; index < this.values.length ; index ++) {
       let functionValue = this.values[index];
       if (functionValue.key == functionName) {
         return functionValue.factory(functionName, reference, argumentValues);
       }
     }
     return null;
   }

   private static create0(factory: (reference: SourceReference) => ExpressionFunction):
    (value: string, reference: SourceReference, expressions: Array<Expression>) => ParseExpressionFunctionsResult {

    return function(name: string, reference: SourceReference, argumentValues: Array<Expression>) {
      if (argumentValues.length != 0) {
        return newParseExpressionFunctionsFailed(`Invalid number of arguments. No arguments expected.`);
      }

      const functionNode = factory(reference);
      return newParseExpressionFunctionsSuccess(functionNode);
    };
  }

  private static create1(factory: (reference: SourceReference, expression: Expression) => ExpressionFunction):
    (value: string, reference: SourceReference, expressions: Array<Expression>) => ParseExpressionFunctionsResult {

    return function(name: string, reference: SourceReference, argumentValues: Array<Expression>) {
      if (argumentValues.length != 1) {
        return newParseExpressionFunctionsFailed(`Invalid number of arguments. 1 argument expected.`);
      }

       let functionNode = factory(reference, argumentValues[0]);
       return newParseExpressionFunctionsSuccess(functionNode);
     };
   }

  private static create2(factory: (reference: SourceReference, expression: Expression, expression2: Expression) => ExpressionFunction):
    (value: string, reference: SourceReference, expressions: Array<Expression>) => ParseExpressionFunctionsResult {

    return function(name: string, reference: SourceReference, argumentValues: Array<Expression>) {
      if (argumentValues.length != 2) {
        return newParseExpressionFunctionsFailed(`Invalid number of arguments. 2 arguments expected.`);
      }

       let functionNode = factory(reference, argumentValues[0], argumentValues[1]);
       return newParseExpressionFunctionsSuccess(functionNode);
     };
   }
}
