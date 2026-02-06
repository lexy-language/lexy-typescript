import type {IParserLogger} from "../logging/parserLogger";
import type {IVariableContext} from "./variableContext"
import type {ITreeValidationVisitor} from "../ITreeValidationVisitor";

import {VariableContext} from "./variableContext";
import {Stack} from "../../infrastructure/stack";
import {ComponentNodeList} from "../../language/componentNodeList";
import {Expression} from "../../language/expressions/expression";
import {Type} from "../../language/typeSystem/type";
import {SourceReference} from "../../language/sourceReference";
import {Assert} from "../../infrastructure/assert";
import {ILibraries} from "../../functionLibraries/libraries";
import {INode} from "../../language/node";
import {DocumentsSymbols} from "../symbols/documentsSymbols";

export interface IValidationContext {

  logger: IParserLogger;
  componentNodes: ComponentNodeList;

  variableContext: IVariableContext;
  visitor: ITreeValidationVisitor;
  libraries: ILibraries;

  inNodeVariableScope(node: INode, action: (context: IValidationContext) => void): void;

  validateType(expression: Expression, argumentIndex: number, name: string,
               type: Type, reference: SourceReference, functionHelp: string): IValidationContext;
}

export class ValidationContext implements IValidationContext {
  private contexts: Stack<VariableContext> = new Stack<VariableContext>()
  private variableContextValue: VariableContext | null = null;
  private visitorValue: ITreeValidationVisitor;

  public libraries: ILibraries;
  public logger: IParserLogger;
  public symbols: DocumentsSymbols;
  public componentNodes: ComponentNodeList;

  public get variableContext(): IVariableContext {
    if (this.variableContextValue == null) throw new Error(`FunctionCodeContext not set.`);
    return this.variableContextValue;
  }

  public get visitor(): ITreeValidationVisitor {
    return this.visitorValue;
  }

  constructor(logger: IParserLogger, componentNodes: ComponentNodeList,
              visitor: ITreeValidationVisitor, libraries: ILibraries,
              symbols: DocumentsSymbols) {
    this.logger = Assert.notNull(logger, "logger");
    this.componentNodes = Assert.notNull(componentNodes, "componentNodes");
    this.visitorValue = Assert.notNull(visitor, "visitor");
    this.libraries = Assert.notNull(libraries, "libraries");
    this.symbols = Assert.notNull(symbols, "symbols")
  }

  public inNodeVariableScope(node: INode, action: (context: IValidationContext) => void): void  {

    this.storeCurrentVariableContext();

    this.variableContextValue = new VariableContext(this.componentNodes, this.logger, this.variableContextValue);

    action(this);

    const result = this.variableContextValue.scopedVariables();
    this.symbols.addNodeVariables(node, result);

    this.revertToPreviousVariableContext();
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
                      type: Type, reference: SourceReference, functionHelp: string): IValidationContext {

    let valueTypeEnd = expression.deriveType(this);
    if (valueTypeEnd == null || !valueTypeEnd.equals(type)) {
      this.logger.fail(reference, `Invalid argument ${argumentIndex} '${name}' should be of type '${type}' but is '${valueTypeEnd}'. ${functionHelp}`);
    }

    return this;
  }
}
