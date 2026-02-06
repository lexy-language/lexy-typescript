import {Expression} from "../../expressions/expression";
import {FunctionCallStateType, IFunctionCallState} from "./functionCallState";
import {SourceReference} from "../../sourceReference";
import {Type} from "../type";
import {LookUpRowFunctionSymbol} from "./lookUpRowFunctionSymbol";
import {Symbol} from "../../symbols/symbol";

export function instanceOfLookUpRowFunctionCallState(object: any): object is LookUpRowFunctionCallState {
    return object?.functionCallStateType == FunctionCallStateType.LookUpRow;
}

export function asLookUpRowFunctionCallState(object: any): LookUpRowFunctionCallState | null {
    return instanceOfLookUpRowFunctionCallState(object) ? object as LookUpRowFunctionCallState : null;
}

export class LookUpRowFunctionCallState implements IFunctionCallState {

  public readonly functionCallStateType = FunctionCallStateType.LookUpRow;

  public readonly tableName: string;

  public readonly valueExpression: Expression;
  public readonly discriminatorExpression: Expression | null;

  public readonly searchValueColumn: string;
  public readonly discriminatorColumn: string | null;

  public readonly resultType: Type | null;
  public readonly reference: SourceReference;

  constructor(reference: SourceReference, tableName: string,
              valueExpression: Expression, discriminatorExpression: Expression | null,
              searchValueColumn: string, discriminatorColumn: string | null,
              resultType: Type | null) {
    this.reference = reference;
    this.tableName = tableName;
    this.valueExpression = valueExpression;
    this.discriminatorExpression = discriminatorExpression;
    this.searchValueColumn = searchValueColumn;
    this.discriminatorColumn = discriminatorColumn;
    this.resultType = resultType;
  }

  public getSymbol(): Symbol {
    return LookUpRowFunctionSymbol.create(this.reference, this.tableName, this.resultType);
  }
}
