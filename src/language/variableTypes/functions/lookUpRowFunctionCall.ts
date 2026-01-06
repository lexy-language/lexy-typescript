import {Expression} from "../../expressions/expression";
import {IMemberFunctionCall, MemberFunctionCallType} from "./memberFunctionCall";

export function instanceOfLookUpRowFunctionCall(object: any): object is LookUpRowFunctionCall {
    return object?.functionCallType == MemberFunctionCallType.LookUpRowFunctionCall;
}

export function asLookUpRowFunctionCall(object: any): LookUpRowFunctionCall | null {
    return instanceOfLookUpRowFunctionCall(object) ? object as LookUpRowFunctionCall : null;
}

export class LookUpRowFunctionCall implements IMemberFunctionCall {

    public readonly functionCallType = MemberFunctionCallType.LookUpRowFunctionCall;

    public tableName: string;

    public valueExpression: Expression;

    public discriminatorExpression: Expression | null;

    public searchValueColumn: string;

    public discriminatorColumn: string | null;

    constructor(tableName: string, valueExpression: Expression, discriminatorExpression: Expression | null,
                searchValueColumn: string, discriminatorColumn: string | null) {
        this.tableName = tableName;
        this.valueExpression = valueExpression;
        this.discriminatorExpression = discriminatorExpression;
        this.searchValueColumn = searchValueColumn;
        this.discriminatorColumn = discriminatorColumn;
    }
}