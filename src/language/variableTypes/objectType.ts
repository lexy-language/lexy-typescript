import type {IComponentNodeList} from "../componentNodeList";
import type {IObjectTypeFunction} from "./objectTypeFunction";
import type {IObjectTypeVariable} from "./objectTypeVariable";

import {VariableType} from "./variableType";

export function instanceOfObjectType(object: any): object is IObjectType {
   return object?.objectType == true;
}

export function asObjectType(object: any): IObjectType | null {
   return instanceOfObjectType(object) ? object as IObjectType : null;
}

export interface IObjectType {
   objectType: boolean;

   memberType(name: string , componentNodes: IComponentNodeList): VariableType | null;

   getVariables(): ReadonlyArray<IObjectTypeVariable>;
   getFunctions(): ReadonlyArray<IObjectTypeFunction>;

   getVariable(name: string): IObjectTypeVariable | null;
   getFunction(name: string): IObjectTypeFunction | null;
}

export abstract class ObjectType extends VariableType implements IObjectType {

   public objectType = true;

   public getVariables(): ReadonlyArray<IObjectTypeVariable> {
      return [];
   }

   public getFunctions(): ReadonlyArray<IObjectTypeFunction> {
      return [];
   }

   public abstract memberType(name: string, componentNodes: IComponentNodeList): VariableType | null;

   public abstract getVariable(name: string): IObjectTypeVariable | null;
   public abstract getFunction(name: string): IObjectTypeFunction | null;

   public override isAssignableFrom(type: VariableType): boolean {

      const otherComplexType = asObjectType(type);
      if (otherComplexType == null) return false;

      return this.variablesAssignableFrom(otherComplexType);
   }

   private variablesAssignableFrom(otherComplexType: IObjectType): boolean {

      const neededVariables = otherComplexType.getVariables();
      for (const neededVariable of neededVariables) {
         const ownVariable = this.getVariable(neededVariable.name);
         if (ownVariable == null
           || neededVariable.type == null
           || ownVariable.type == null
           || !neededVariable.type.isAssignableFrom(ownVariable.type))
         {
            return false;
         }
      }
      return true;
   }
}
