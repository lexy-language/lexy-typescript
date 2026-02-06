import {VariableReference} from "../variableReference";

export function instanceOfHasVariableReference(object: any): object is IHasVariableReference {
   return object?.hasVariableReference == true;
}

export function asHasVariableReference(object: any): IHasVariableReference | null {
   return instanceOfHasVariableReference(object) ? object as IHasVariableReference : null;
}

export interface IHasVariableReference {
   hasVariableReference: true;
   path: string;
   variable: VariableReference | null;
}
