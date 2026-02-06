import {IToken} from "./token";
import {Type} from "../../language/typeSystem/type";

import type {IValidationContext} from "../context/validationContext";

export interface ILiteralToken extends IToken {

  tokenIsLiteral: boolean;

  typedValue: Object;
  value: string;

  deriveType(context: IValidationContext) : Type | null;
}
