import type {IValidationContext} from "../parser/validationContext";

import {contains} from "../infrastructure/enumerableExtensions";
import {SourceReference} from "../parser/sourceReference";

export class DuplicateChecker {

   public static validate<T>(context: IValidationContext, getReference: ((value: T) => SourceReference) ,
     getName: ((value: T) => string), getErrorMessage: ((value: T) => string), values: Array<T>): void {

     const found = new Array<string>();
     for (const item of values) {
       const name = getName(item);
       if (contains(found, name)) {
         context.logger
         context.logger.fail(getReference(item), getErrorMessage(item));
       } else {
         found.push(name);
       }
     }
   }
}
