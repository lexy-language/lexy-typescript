import Decimal from 'decimal.js';
import {LibraryRuntime, Types} from "./libraryRuntime";

function parse(value: string): Decimal {
  let number = new Decimal(value);
  return number;
}

function floor(value: Decimal): Decimal {
  return value.floor();
}

function abs(value: Decimal): Decimal {
  return value.abs();
}

const functionsInfo = {
  Parse: {
    returnType: Types.Number,
    args: [Types.String]
  },
  Floor: {
    returnType: Types.Number,
    args: [Types.Number]
  },
  Abs: {
    returnType: Types.Number,
    args: [Types.Number]
  },
};

export const NumberLibrary: LibraryRuntime = {
  name: "Number",
  functions: {
    Parse: parse,
    Floor: floor,
    Abs: abs,
  },
  functionsInfo: functionsInfo
};