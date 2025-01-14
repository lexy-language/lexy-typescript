import type {IParserLogger} from "./parserLogger";
import type {IVariableContext} from "./variableContext"

import {VariableContext} from "./variableContext";
import {Stack} from "../infrastructure/stack";
import {RootNodeList} from "../language/rootNodeList";
import {Expression} from "../language/expressions/expression";
import {VariableType} from "../language/variableTypes/variableType";
import {SourceReference} from "./sourceReference";

export interface IValidationContext {
  logger: IParserLogger;
  rootNodes: RootNodeList;

  variableContext: IVariableContext;
  createVariableScope() : { [Symbol.dispose]: () => void };

  validateType(expression: Expression, argumentIndex: number, name: string,
               type: VariableType, reference: SourceReference, functionHelp: string): IValidationContext;
}

export class ValidationContext implements IValidationContext {
   private contexts: Stack<IVariableContext> = new Stack<IVariableContext>()
   private variableContextValue: IVariableContext | null = null;

   public logger: IParserLogger;
   public rootNodes: RootNodeList;

   constructor(logger: IParserLogger, rootNodes: RootNodeList) {
     this.logger = logger;
     this.rootNodes = rootNodes;
   }

   public get variableContext(): IVariableContext {
     if (this.variableContextValue == null) throw new Error(`FunctionCodeContext not set.`);
     return this.variableContextValue;
   }

  public dispose(): void {
     if (this.contexts.size() == 0) {
       this.variableContextValue = null;
     }

     let variableContextValue = this.contexts.pop();
     this.variableContextValue = !!variableContextValue ? variableContextValue : null;
  }

  public createVariableScope(): { [Symbol.dispose]: () => void } {
     if (this.variableContextValue != null) {
       this.contexts.push(this.variableContextValue);
     }

     this.variableContextValue = new VariableContext(this.logger, this.variableContextValue);

     return {
       [Symbol.dispose]: () => this.dispose()
     };
   }

  public validateType(expression: Expression, argumentIndex: number, name: string,
                      type: VariableType, reference: SourceReference, functionHelp: string): IValidationContext {

    let valueTypeEnd = expression.deriveType(this);
    if (valueTypeEnd == null || !valueTypeEnd.equals(type))
    this.logger.fail(reference, `Invalid argument ${argumentIndex}. '${name}' should be of type '${type}' but is '${valueTypeEnd}'. ${functionHelp}`);

    return this;
  }
}
