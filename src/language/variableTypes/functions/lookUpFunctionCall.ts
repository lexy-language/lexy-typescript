import {Expression} from "../../expressions/expression";
import {FunctionCallType, IInstanceFunctionCall} from "../../functions/IInstanceFunctionCall";

export function instanceOfLookUpFunctionCall(object: any): object is LookUpFunctionCall {
    return object?.functionCallType == FunctionCallType.LookUpFunctionCall;
}

export function asLookUpFunctionCall(object: any): LookUpFunctionCall | null {
    return instanceOfLookUpFunctionCall(object) ? object as LookUpFunctionCall : null;
}

export class LookUpFunctionCall implements IInstanceFunctionCall {

    public readonly functionCallType = FunctionCallType.LookUpFunctionCall;

    public tableName: string;

    public valueExpression: Expression;

    public discriminatorExpression: Expression | null;

    public resultColumn: string;

    public searchValueColumn: string;

    public discriminatorColumn: string | null;

    constructor(tableName: string, valueExpression: Expression, discriminatorExpression: Expression | null,
                resultColumn: string, searchValueColumn: string, discriminatorColumn: string | null) {
        this.tableName = tableName;
        this.valueExpression = valueExpression;
        this.discriminatorExpression = discriminatorExpression;
        this.resultColumn = resultColumn;
        this.searchValueColumn = searchValueColumn;
        this.discriminatorColumn = discriminatorColumn;
    }
}