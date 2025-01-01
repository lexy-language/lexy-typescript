import {Token} from "./token";
import {ILiteralToken} from "./ILiteralToken";
import {TokenCharacter} from "./tokenCharacter";
import {IValidationContext} from "../IValidationContext";
import {VariableType} from "../../language/variableTypes";

export class StringLiteralToken extends Token implements ILiteralToken {

  public value: string;

  public tokenIsLiteral: boolean = true;
  public tokenType: string = 'StringLiteralToken';

  constructor(value: string, character: TokenCharacter) {
    super(character);
    this.value = value;
  }

  public get typedValue() {
    return this.value;
  }

  public deriveType(context: IValidationContext): VariableType {
    throw new Error("Not supported. Type should be defined by node or expression.");
  }

  public toString() {
    return this.value;
  }
}