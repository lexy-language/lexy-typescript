import {Expression} from "../../expressions/expression";
import {IMemberFunctionCall, MemberFunctionCallType} from "./memberFunctionCall";

export function instanceOfLookUpFunctionCall(object: any): object is LookUpFunctionCall {
    return object?.functionCallType == MemberFunctionCallType.LookUpFunctionCall;
}

export function asLookUpFunctionCall(object: any): LookUpFunctionCall | null {
    return instanceOfLookUpFunctionCall(object) ? object as LookUpFunctionCall : null;
}

export class LookUpFunctionCall implements IMemberFunctionCall {

    public readonly functionCallType = MemberFunctionCallType.LookUpFunctionCall;

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