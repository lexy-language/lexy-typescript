import {newVariablePathParseSuccess, VariablePathParseResult} from "./variablePathParseResult";
import {VariablePath} from "../variablePath";
import {isNullOrEmpty} from "../../parser/tokens/character";

export class VariablePathParser {

  public static parse(parts: string[]): VariablePathParseResult {
    let variablePath = new VariablePath(parts);
    return newVariablePathParseSuccess(variablePath);
  }

  static parseString(path: string): VariablePath {
    if (isNullOrEmpty(path)) throw new Error("Invalid empty variable reference.")
    const parts = path.split(".");
    return new VariablePath(parts);
  }
}

