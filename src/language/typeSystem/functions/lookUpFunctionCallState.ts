import {Expression} from "../../expressions/expression";
import {FunctionCallStateType, IFunctionCallState} from "./functionCallState";
import {Type} from "../type";
import {SourceReference} from "../../sourceReference";
import {LookUpFunctionSymbol} from "./lookUpFunctionSymbol";
import {Symbol} from "../../symbols/symbol";

export function instanceOfLookUpFunctionCallState(object: any): object is LookUpFunctionCallState {
  return object?.functionCallStateType == FunctionCallStateType.LookUp;
}

export function asLookUpFunctionCallState(object: any): LookUpFunctionCallState | null {
  return instanceOfLookUpFunctionCallState(object) ? object as LookUpFunctionCallState : null;
}

export class LookUpFunctionCallState implements IFunctionCallState {

  public readonly functionCallStateType = FunctionCallStateType.LookUp;

  public readonly tableName: string;

  public readonly valueExpression: Expression;
  public readonly discriminatorExpression: Expression | null;

  public readonly resultColumn: string;
  public readonly resultColumnType: Type | null;

  public readonly searchValueColumn: string;
  public readonly discriminatorColumn: string | null;

  public readonly reference: SourceReference;

  constructor(reference: SourceReference, tableName: string, valueExpression: Expression,
              discriminatorExpression: Expression | null, resultColumn: string,
              resultColumnType: Type | null, searchValueColumn: string,
              discriminatorColumn: string | null) {
    this.tableName = tableName;
    this.valueExpression = valueExpression;
    this.discriminatorExpression = discriminatorExpression;
    this.resultColumn = resultColumn;
    this.resultColumnType = resultColumnType;
    this.searchValueColumn = searchValueColumn;
    this.discriminatorColumn = discriminatorColumn;
    this.reference = reference;
  }

  public getSymbol(): Symbol {
    return LookUpFunctionSymbol.create(this.reference, this.tableName, this.resultColumnType);
  }
}
