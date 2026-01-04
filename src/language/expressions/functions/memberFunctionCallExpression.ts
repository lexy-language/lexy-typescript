import type {IComponentNode} from "../../componentNode";
import type {INode} from "../../node";
import type {IValidationContext} from "../../../parser/validationContext";
import type {IHasNodeDependencies} from "../../IHasNodeDependencies";
import type {IInstanceFunctionCall} from "../../functions/IInstanceFunctionCall";
import type {IInstanceFunction} from "../../functions/IInstanceFunction";
import type {IComponentNodeList} from "../../componentNodeList";

import {Expression} from "../expression";
import {VariableType} from "../../variableTypes/variableType";
import {NodeType} from "../../nodeType";
import {Assert} from "../../../infrastructure/assert";
import {FunctionCallExpression} from "./functionCallExpression";
import {ExpressionSource} from "../expressionSource";
import {IdentifierPath} from "../../identifierPath";
import {asTypeWithMembers} from "../../variableTypes/ITypeWithMembers";

export function instanceOfMemberFunctionCallExpression(object: any): object is MemberFunctionCallExpression {
  return object?.nodeType == NodeType.MemberFunctionCallExpression;
}

export function asMemberFunctionCallExpression(object: any): MemberFunctionCallExpression | null {
  return instanceOfMemberFunctionCallExpression(object) ? object as MemberFunctionCallExpression : null;
}

export class MemberFunctionCallExpression extends FunctionCallExpression implements IHasNodeDependencies {

  private functionCallValue: IInstanceFunctionCall | null = null;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.MemberFunctionCallExpression;

  public readonly functionPath: IdentifierPath;
  public readonly args: ReadonlyArray<Expression>;

  get functionCall(): IInstanceFunctionCall {
    return Assert.notNull(this.functionCallValue, "functionCall");
  }

  constructor(functionPath: IdentifierPath, argumentValues: ReadonlyArray<Expression>, source: ExpressionSource) {
    super(source);
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
    if (result.state != "success") return;

    this.functionCallValue = result.functionCall;
  }

  private getFunction(context: IValidationContext): IInstanceFunction | null {
    const variable = context.variableContext.getVariableTypeByPath(this.functionPath.withoutLastPart(), context);
    if (variable != null) {
      return this.getVariableTypeFunction(context, variable);
    }

    const type = context.componentNodes.getType(this.functionPath.rootIdentifier);
    if (type != null) {
      return this.getVariableTypeFunction(context, type);
    }
    return this.getLibraryFunction(context);
  }

  private getVariableTypeFunction(context: IValidationContext, variable: VariableType): IInstanceFunction | null {
    const typeWithMember = asTypeWithMembers(variable);
    return typeWithMember == null ? null : typeWithMember.getFunction(this.functionPath.lastPart());
  }

  private getLibraryFunction(context: IValidationContext): IInstanceFunction | null {
    const libraryName = this.functionPath.withoutLastPart();
    const library = context.libraries.getLibrary(libraryName);
    const functionName = this.functionPath.lastPart();
    return library == null ? null : library.getFunction(functionName);
  }

  public override deriveType(context: IValidationContext): VariableType | null {
    const functionNode = this.getFunction(context);
    return functionNode == null ? null : functionNode.getResultsType(this.args);
  }
}
