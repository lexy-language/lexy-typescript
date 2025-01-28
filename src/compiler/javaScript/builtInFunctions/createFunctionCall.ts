import {NodeType} from "../../../language/nodeType";
import {LookUpFunctionCall} from "./lookUpFunctionCall";
import {LookUpRowFunctionCall} from "./lookUpRowFunctionCall";
import {IntFunctionCall} from "./intFunctionCall";
import {AbsFunctionCall} from "./absFunctionCall";
import {PowerFunctionCall} from "./powerFunctionCall";
import {RoundFunctionCall} from "./roundFunctionCall";
import {NowFunctionCall} from "./nowFunctionCall";
import {TodayFunctionCall} from "./todayFunctionCall";
import {YearFunctionCall} from "./yearFunctionCall";
import {MonthFunctionCall} from "./monthFunctionCall";
import {DayFunctionCall} from "./dayFunctionCall";
import {HourFunctionCall} from "./hourFunctionCall";
import {MinuteFunctionCall} from "./minuteFunctionCall";
import {SecondFunctionCall} from "./secondFunctionCall";
import {YearsFunctionCall} from "./yearsFunctionCall";
import {MonthsFunctionCall} from "./monthsFunctionCall";
import {DaysFunctionCall} from "./daysFunctionCall";
import {HoursFunctionCall} from "./hoursFunctionCall";
import {MinutesFunctionCall} from "./minutesFunctionCall";
import {SecondsFunctionCall} from "./secondsFunctionCall";
import {LexyFunctionCall} from "./lexyFunctionCall";
import {FunctionCallExpression} from "../../../language/expressions/functions/functionCallExpression";
import {CodeWriter} from "../writers/codeWriter";

export function renderFunctionCall(expression: FunctionCallExpression, codeWriter: CodeWriter) {
  const functionCall = createFunctionCall(expression);
  if (functionCall == null) throw new Error("Invalid expression function: " + expression.nodeType)
  functionCall.renderExpression(expression, codeWriter);
}

function createFunctionCall(expression: FunctionCallExpression): any | null {

  switch (expression.nodeType) {
    case NodeType.LookupFunction:
      return new LookUpFunctionCall();
    case NodeType.LookupRowFunction:
      return new LookUpRowFunctionCall();
    case NodeType.IntFunction:
      return new IntFunctionCall();
    case NodeType.AbsFunction:
      return new AbsFunctionCall();
    case NodeType.PowerFunction:
      return new PowerFunctionCall();
    case NodeType.RoundFunction:
      return new RoundFunctionCall();

    case NodeType.NowFunction:
      return new NowFunctionCall();
    case NodeType.TodayFunction:
      return new TodayFunctionCall();

    case NodeType.YearFunction:
      return new YearFunctionCall();
    case NodeType.MonthFunction:
      return new MonthFunctionCall();
    case NodeType.DayFunction:
      return new DayFunctionCall();
    case NodeType.HourFunction:
      return new HourFunctionCall();
    case NodeType.MinuteFunction:
      return new MinuteFunctionCall();
    case NodeType.SecondFunction:
      return new SecondFunctionCall();

    case NodeType.YearsFunction:
      return new YearsFunctionCall();
    case NodeType.MonthsFunction:
      return new MonthsFunctionCall();
    case NodeType.DaysFunction:
      return new DaysFunctionCall();
    case NodeType.HoursFunction:
      return new HoursFunctionCall();
    case NodeType.MinutesFunction:
      return new MinutesFunctionCall();
    case NodeType.SecondsFunction:
      return new SecondsFunctionCall();

    case NodeType.LexyFunction:
      return new LexyFunctionCall();

    default:
      return null;
  }
}