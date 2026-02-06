import type {IComponentNode} from "../../componentNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/context/validationContext";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IObjectFunction} from "../../typeSystem/objects/objectFunction";
import type {IComponentNodeList} from "../../componentNodeList";

import {Expression} from "../expression";
import {Type} from "../../typeSystem/type";
import {NodeType} from "../../nodeType";
import {Assert} from "../../../infrastructure/assert";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";
import {IdentifierPath} from "../../identifierPath";
import {asObjectType} from "../../typeSystem/objects/objectType";
import {NodeReference} from "../../nodeReference";
import {Symbol} from "../../symbols/symbol";
import {IFunctionCallState} from "../../typeSystem/functions/functionCallState";

export function instanceOfMemberFunctionCallExpression(object: any): object is MemberFunctionCallExpression {
  return object?.nodeType == NodeType.MemberFunctionCallExpression;
}

export function asMemberFunctionCallExpression(object: any): MemberFunctionCallExpression | null {
  return instanceOfMemberFunctionCallExpression(object) ? object as MemberFunctionCallExpression : null;
}

export class MemberFunctionCallExpression extends FunctionCallExpression implements IHasNodeDependencies {

  private stateValue: IFunctionCallState | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.MemberFunctionCallExpression;

  public readonly functionPath: IdentifierPath;
  public readonly args: ReadonlyArray<Expression>;

  get state(): IFunctionCallState {
    if (this.stateValue == null) throw new Error("State not set.")
    return this.stateValue;
  }

  public get name(): string {
    return this.functionPath.lastPart();
  };

  constructor(functionPath: IdentifierPath, argumentValues: ReadonlyArray<Expression>,
              parentReference: NodeReference, source: ExpressionSource) {
    super(parentReference, source);
    this.functionPath = Assert.notNull(functionPath, "functionPath");
    this.args = Assert.notNull(argumentValues, "args");
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    let component = componentNodes.getNode(this.functionPath.rootIdentifier);
    return component != null ? [component] : [];
  }

  public override getChildren(): Array<INode> {
    return [...this.args];
  }

  protected override validate(context: IValidationContext): void {
    if (this.functionPath.parts == 0) {
      context.logger.fail(this.reference, `Invalid function name: '${this.functionPath}'. Invalid number of parts: ${this.functionPath}.`);
      return;
    }

    const functionNode = this.getFunction(context);
    if (functionNode == null) {
      context.logger.fail(this.reference, `Invalid function name: '${this.functionPath}'. Function is null.`);
      return;
    }

    const result = functionNode.validateArguments(context, this.args, this.reference);
    if (result.state != "success") {
      return;
    }

    this.stateValue = result.functionCallState;
  }

  private getFunction(context: IValidationContext): IObjectFunction | null {
    const variable = context.variableContext.getTypeByPath(this.functionPath.withoutLastPart());
    if (variable != null) {
      return this.getTypeFunction(variable);
    }

    const type = context.componentNodes.getType(this.functionPath.rootIdentifier);
    if (type != null) {
      return this.getTypeFunction(type);
    }
    return this.getLibraryFunction(context);
  }

  private getTypeFunction(variable: Type): IObjectFunction | null {
    const objectType = asObjectType(variable);
    return objectType == null ? null : objectType.getFunction(this.functionPath.lastPart());
  }

  private getLibraryFunction(context: IValidationContext): IObjectFunction | null {
    const libraryName = this.functionPath.withoutLastPart();
    const library = context.libraries.getLibrary(libraryName);
    const functionName = this.functionPath.lastPart();
    return library == null ? null : library.getFunction(functionName);
  }

  public override deriveType(context: IValidationContext): Type | null {
    const functionNode = this.getFunction(context);
    return functionNode == null ? null : functionNode.getResultsType(this.args);
  }

  public override getSymbol(): Symbol | null {
    return this.state ? this.state.getSymbol() : null;
  }
}
