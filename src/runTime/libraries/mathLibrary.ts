import Decimal from "decimal.js";
import {LibraryFunctionsInfo, LibraryRuntime, Types} from "./libraryRuntime";

function power(number: Decimal, power: Decimal): Decimal {
  return number.pow(power);
}

function round(number: Decimal, digits: Decimal): Decimal {
  const factor = new Decimal(10).pow(digits);
  return number.abs()
    .mul(factor)
    .round()
    .div(factor)
    .mul(number.greaterThanOrEqualTo(0) ? 1 : -1);
}

const functionsInfo: LibraryFunctionsInfo = {
  Power: {
    returnType: Types.Number,
    args: [Types.Number, Types.Number]
  },
  Round: {
    returnType: Types.Number,
    args: [Types.Number, Types.Number]
  },
}

export const MathLibrary: LibraryRuntime = {
  name: "Math",
  functions: {
    Power: power,
    Round: round
  },
  functionsInfo: functionsInfo
};