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
import {ExpressionSource} from "../expressionSource";
import {LexyFunction} from "./lexyFunction";
import {FunctionCallExpression} from "./functionCallExpression";
import {
  newParseFunctionCallExpressionsFailed,
  newParseFunctionCallExpressionsSuccess,
  ParseFunctionCallExpressionResult
} from "../parseFunctionparseFunctionCallExpressionResultCallExpressionResult";

export class FunctionCallExpressions {
  private static readonly values: {
    key: string,
    factory: (value: string, source: ExpressionSource, expressions: Array<Expression>) => ParseFunctionCallExpressionResult
  }[] = [
    {key: IntFunction.functionName, factory: FunctionCallExpressions.create1(IntFunction.create)},
    {key: AbsFunction.functionName, factory: FunctionCallExpressions.create1(AbsFunction.create)},
    {key: PowerFunction.functionName, factory: FunctionCallExpressions.create2(PowerFunction.create)},
    {key: RoundFunction.functionName, factory: FunctionCallExpressions.create2(RoundFunction.create)},

    {key: NowFunction.functionName, factory: FunctionCallExpressions.create0(NowFunction.create)},
    {key: TodayFunction.functionName, factory: FunctionCallExpressions.create0(TodayFunction.create)},

    {key: YearFunction.functionName, factory: FunctionCallExpressions.create1(YearFunction.create)},
    {key: MonthFunction.functionName, factory: FunctionCallExpressions.create1(MonthFunction.create)},
    {key: DayFunction.functionName, factory: FunctionCallExpressions.create1(DayFunction.create)},
    {key: HourFunction.functionName, factory: FunctionCallExpressions.create1(HourFunction.create)},
    {key: MinuteFunction.functionName, factory: FunctionCallExpressions.create1(MinuteFunction.create)},
    {key: SecondFunction.functionName, factory: FunctionCallExpressions.create1(SecondFunction.create)},

    {key: YearsFunction.functionName, factory: FunctionCallExpressions.create2(YearsFunction.create)},
    {key: MonthsFunction.functionName, factory: FunctionCallExpressions.create2(MonthsFunction.create)},
    {key: DaysFunction.functionName, factory: FunctionCallExpressions.create2(DaysFunction.create)},
    {key: HoursFunction.functionName, factory: FunctionCallExpressions.create2(HoursFunction.create)},
    {key: MinutesFunction.functionName, factory: FunctionCallExpressions.create2(MinutesFunction.create)},
    {key: SecondsFunction.functionName, factory: FunctionCallExpressions.create2(SecondsFunction.create)},

    {key: LookupFunction.functionName, factory: LookupFunction.create},
    {key: LookupRowFunction.functionName, factory: LookupRowFunction.create},

    {key: NewFunction.functionName, factory: FunctionCallExpressions.create1(NewFunction.create)},
    {key: FillParametersFunction.functionName, factory: FunctionCallExpressions.create1(FillParametersFunction.create)},
    {key: ExtractResultsFunction.functionName, factory: FunctionCallExpressions.create1(ExtractResultsFunction.create)}
  ];

  public static parse(functionName: string, source: ExpressionSource, argumentValues: Array<Expression>): ParseFunctionCallExpressionResult {
    for (let index = 0; index < this.values.length; index++) {
      let functionValue = this.values[index];
      if (functionValue.key == functionName) {
        return functionValue.factory(functionName, source, argumentValues);
      }
    }
    return newParseFunctionCallExpressionsSuccess(new LexyFunction(functionName, argumentValues, source));
  }

  private static create0(factory: (source: ExpressionSource) => FunctionCallExpression):
    (value: string, source: ExpressionSource, expressions: Array<Expression>) => ParseFunctionCallExpressionResult {

    return function (name: string, source: ExpressionSource, argumentValues: Array<Expression>) {
      if (argumentValues.length != 0) {
        return newParseFunctionCallExpressionsFailed(`Invalid number of arguments. No arguments expected.`);
      }

      const functionNode = factory(source);
      return newParseFunctionCallExpressionsSuccess(functionNode);
    };
  }

  private static create1(factory: (source: ExpressionSource, expression: Expression) => FunctionCallExpression):
    (value: string, source: ExpressionSource, expressions: Array<Expression>) => ParseFunctionCallExpressionResult {

    return function (name: string, source: ExpressionSource, argumentValues: Array<Expression>) {
      if (argumentValues.length != 1) {
        return newParseFunctionCallExpressionsFailed(`Invalid number of arguments. 1 argument expected.`);
      }

      let functionNode = factory(source, argumentValues[0]);
      return newParseFunctionCallExpressionsSuccess(functionNode);
    };
  }

  private static create2(factory: (source: ExpressionSource, expression: Expression, expression2: Expression) => FunctionCallExpression):
    (value: string, source: ExpressionSource, expressions: Array<Expression>) => ParseFunctionCallExpressionResult {

    return function (name: string, source: ExpressionSource, argumentValues: Array<Expression>) {
      if (argumentValues.length != 2) {
        return newParseFunctionCallExpressionsFailed(`Invalid number of arguments. 2 arguments expected.`);
      }

      let functionNode = factory(source, argumentValues[0], argumentValues[1]);
      return newParseFunctionCallExpressionsSuccess(functionNode);
    };
  }
}