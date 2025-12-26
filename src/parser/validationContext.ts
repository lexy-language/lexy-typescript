import type {IParserLogger} from "./parserLogger";
import type {IVariableContext} from "./variableContext"
import type {ITreeValidationVisitor} from "./ITreeValidationVisitor";

import {VariableContext} from "./variableContext";
import {Stack} from "../infrastructure/stack";
import {RootNodeList} from "../language/rootNodeList";
import {Expression} from "../language/expressions/expression";
import {VariableType} from "../language/variableTypes/variableType";
import {SourceReference} from "./sourceReference";
import {Assert} from "../infrastructure/assert";

export interface IValidationContext {
  logger: IParserLogger;
  rootNodes: RootNodeList;

  variableContext: IVariableContext;
  visitor: ITreeValidationVisitor;

  createVariableScope(): { [Symbol.dispose]: () => void };

  validateType(expression: Expression, argumentIndex: number, name: string,
               type: VariableType, reference: SourceReference, functionHelp: string): IValidationContext;
}

export class ValidationContext implements IValidationContext {
  private contexts: Stack<IVariableContext> = new Stack<IVariableContext>()
  private variableContextValue: IVariableContext | null = null;
  private visitorValue: ITreeValidationVisitor;

  public logger: IParserLogger;
  public rootNodes: RootNodeList;

  public get variableContext(): IVariableContext {
    if (this.variableContextValue == null) throw new Error(`FunctionCodeContext not set.`);
    return this.variableContextValue;
  }

  public get visitor(): ITreeValidationVisitor {
    return this.visitorValue;
  }

  constructor(logger: IParserLogger, rootNodes: RootNodeList, visitor: ITreeValidationVisitor) {
    this.logger = Assert.notNull(logger, "logger");
    this.rootNodes = Assert.notNull(rootNodes, "rootNodes");
    this.visitorValue = Assert.notNull(visitor, "");
  }

  public createVariableScope(): { [Symbol.dispose]: () => void } {

    this.storeCurrentVariableContext();

    this.variableContextValue = new VariableContext(this.rootNodes, this.logger, this.variableContextValue);

    return {
      [Symbol.dispose]: () => this.revertToPreviousVariableContext()
    };
  }

  private storeCurrentVariableContext() {
    if (this.variableContextValue != null) {
      this.contexts.push(this.variableContextValue);
    }
  }

  public revertToPreviousVariableContext(): void {
    const variableContextValue = this.contexts.pop();
    this.variableContextValue = !!variableContextValue ? variableContextValue : null;
  }

  public validateType(expression: Expression, argumentIndex: number, name: string,
                      type: VariableType, reference: SourceReference, functionHelp: string): IValidationContext {

    let valueTypeEnd = expression.deriveType(this);
    if (valueTypeEnd == null || !valueTypeEnd.equals(type))
      this.logger.fail(reference, `Invalid argument ${argumentIndex}. '${name}' should be of type '${type}' but is '${valueTypeEnd}'. ${functionHelp}`);

    return this;
  }
}
