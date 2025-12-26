import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";
import type {IHasNodeDependencies} from "../IHasNodeDependencies";
import type {IComponentNodeList} from "../componentNodeList";

import {Function} from "../functions/function";
import {IComponentNode, ComponentNode} from "../componentNode";
import {ScenarioName} from "./scenarioName";
import {EnumDefinition} from "../enums/enumDefinition";
import {Table} from "../tables/table";
import {ExpectErrors} from "./expectErrors";
import {ExpectComponentErrors} from "./expectComponentErrors";
import {Results} from "./results";
import {Parameters} from "./parameters";
import {functionName} from "./functionName";
import {SourceReference} from "../../parser/sourceReference";
import {NodeName} from "../../parser/nodeName";
import {KeywordToken} from "../../parser/tokens/keywordToken";
import {Keywords} from "../../parser/Keywords";
import {VariableSource} from "../variableSource";
import {VariableDefinition} from "../variableDefinition";
import {NodeType} from "../nodeType";
import {ExpectExecutionErrors} from "./expectExecutionErrors";
import {ExecutionLogging} from "./executionLogging";
import {TokenType} from "../../parser/tokens/tokenType";
import {ValidationTable} from "./validationTable";

export function instanceOfScenario(object: any) {
  return object?.nodeType == NodeType.Scenario;
}

export function asScenario(object: any): Scenario | null {
  return instanceOfScenario(object) ? object as Scenario : null;
}

export class Scenario extends ComponentNode implements IHasNodeDependencies {

  private functionNodeValue: Function | null = null;
  private enumValue: EnumDefinition | null = null;
  private tableValue: Table | null = null;

  private functionNameValue: functionName | null = null;
  private parametersValue: Parameters | null = null;
  private resultsValue: Results | null = null;
  private validationTableValue: ValidationTable | null = null;
  private executionLoggingValue: ExecutionLogging | null = null;

  private expectErrorsValue: ExpectErrors | null = null;
  private expectComponentErrorsValue: ExpectComponentErrors | null = null;
  private expectExecutionErrorsValue: ExpectExecutionErrors | null = null;

  public readonly nodeType = NodeType.Scenario;
  public readonly hasNodeDependencies = true;
  public readonly name: ScenarioName;

  public get functionName(): functionName | null {
    return this.functionNameValue;
  }

  public get functionNode(): Function | null {
    return this.functionNodeValue;
  }

  public get enum(): EnumDefinition | null {
    return this.enumValue;
  }

  public get parameters(): Parameters | null {
    return this.parametersValue;
  }

  public get results(): Results | null {
    return this.resultsValue;
  }

  public get executionLogging(): ExecutionLogging | null {
    return this.executionLoggingValue;
  }

  public get table(): Table | null {
    return this.tableValue;
  }

  public get validationTable(): ValidationTable | null {
    return this.validationTableValue;
  }

  public get expectErrors(): ExpectErrors | null {
    return this.expectErrorsValue;
  }

  public get expectComponentErrors(): ExpectComponentErrors | null {
    return this.expectComponentErrorsValue;
  }

  public get expectExecutionErrors(): ExpectExecutionErrors | null {
    return this.expectExecutionErrorsValue;
  }

  public override get nodeName() {
    return this.name.value;
  }

  constructor(name: string, reference: SourceReference) {
    super(reference);
    this.name = ScenarioName.parseName(name, reference);
  }

  public static parse(name: string, reference: SourceReference): Scenario {
    return new Scenario(name, reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let line = context.line;
    let name = line.tokens.tokenValue(0);
    let reference = line.lineStartReference();
    if (!line.tokens.isTokenType<KeywordToken>(0, TokenType.KeywordToken)) {
      context.logger.fail(reference, `Invalid token '${name}'. Keyword expected.`);
      return this;
    }

    switch (name) {
      case Keywords.Function:
        return this.parseFunction(context, reference);
      case Keywords.EnumKeyword:
        return this.parseEnum(context, reference);
      case Keywords.TableKeyword:
        return this.parseTable(context, reference);

      case Keywords.Parameters:
        return this.parametersValue = new Parameters(reference);
      case Keywords.Results:
        return this.resultsValue = new Results(reference);
      case Keywords.ValidationTable:
        return this.validationTableValue = new ValidationTable(`${this.name.value}Table`, reference);

      case Keywords.ExecutionLogging:
        return this.executionLoggingValue = new ExecutionLogging(reference);

      case Keywords.ExpectErrors:
        return this.expectErrorsValue = new ExpectErrors(reference);
      case Keywords.ExpectComponentErrors:
        return this.expectComponentErrorsValue = new ExpectComponentErrors(reference);
      case Keywords.ExpectExecutionErrors:
        return this.expectExecutionErrorsValue = new ExpectExecutionErrors(reference);
      default:
        return this.invalidToken(context, name, reference);
    }
  }

  private parseFunction(context: IParseLineContext, reference: SourceReference): IParsableNode {
    if (this.functionNodeValue != null) {
      context.logger.fail(reference, `Duplicated inline Function '${this.nodeName}'.`);
      return this.functionNodeValue;
    }

    let tokenName = NodeName.parse(context);
    if (tokenName != null && tokenName.name != null) {
      return this.parseFunctionName(context, reference);
    }

    this.functionNodeValue = Function.create(`${this.name.value}Function`, reference, context.expressionFactory);
    context.logger.setCurrentNode(this.functionNodeValue);
    return this.functionNodeValue;
  }

  private parseFunctionName(context: IParseLineContext, reference: SourceReference) {
    this.functionNameValue = functionName.parse(context, reference)
    return this;
  }

  private parseEnum(context: IParseLineContext, reference: SourceReference): IParsableNode {
    if (this.enum != null) {
      context.logger.fail(reference, `Duplicated inline Enum '${this.nodeName}'.`);
      return this.enum;
    }

    let tokenName = NodeName.parse(context);
    if (tokenName == null || tokenName.name == null) return this;

    this.enumValue = EnumDefinition.parse(tokenName.name, reference);
    context.logger.setCurrentNode(this.enumValue);
    return this.enumValue;
  }

  private parseTable(context: IParseLineContext, reference: SourceReference): IParsableNode {
    if (this.tableValue != null) {
      context.logger.fail(reference, `Duplicated inline table '${this.nodeName}'.`);
      return this.tableValue;
    }

    let tokenName = NodeName.parse(context);
    if (tokenName == null || tokenName.name == null) return this;

    this.tableValue = new Table(tokenName.name, reference);
    context.logger.setCurrentNode(this.tableValue);
    return this.tableValue;
  }

  private invalidToken(context: IParseLineContext, name: string | null, reference: SourceReference): IParsableNode {
    context.logger.fail(reference, `Invalid token '${name}'.`);
    return this;
  }

  public override getChildren(): Array<INode> {
    const result: Array<INode> = [];
    if (this.functionNodeValue != null) result.push(this.functionNodeValue);
    if (this.enumValue != null) result.push(this.enumValue);
    if (this.tableValue != null) result.push(this.tableValue);
    result.push(this.name);
    if (this.functionName != null) result.push(this.functionName);
    if (this.parameters != null) result.push(this.parameters);
    if (this.results != null) result.push(this.results);
    if (this.validationTable != null) result.push(this.validationTable);
    if (this.expectErrors != null) result.push(this.expectErrors);
    if (this.expectComponentErrors != null) result.push(this.expectComponentErrors);
    return result;
  }

  protected override validateChild(context: IValidationContext, child: INode): void {
    if (child == this.functionNode) {
      super.validateChild(context, child);
    } else {
      this.validateWithFunctionVariables(context, child);
    }
  }

  private validateWithFunctionVariables(context: IValidationContext, child: INode): void {
    const scope = context.createVariableScope();
    try {
      this.addFunctionParametersAndResultsForValidation(context);
      super.validateChild(context, child);
    } finally {
      scope[Symbol.dispose]();
    }
  }

  private addFunctionParametersAndResultsForValidation(context: IValidationContext): void {
    let functionNode = this.functionNode ?? (this.functionName?.hasValue ? context.componentNodes.getFunction(this.functionName.value) : null);
    if (functionNode == null) return;

    Scenario.addVariablesForValidation(context, functionNode.parameters?.variables, VariableSource.Parameters);
    Scenario.addVariablesForValidation(context, functionNode.results?.variables, VariableSource.Results);
  }

  private static addVariablesForValidation(context: IValidationContext,
                                           definitions: ReadonlyArray<VariableDefinition> | undefined,
                                           source: VariableSource) {

    if (definitions == null) return;
    for (const definition of definitions) {
      let variableType = definition.type.variableType;
      if (variableType == null) continue;
      context.variableContext.addVariable(definition.name, variableType, source);
    }
  }

  protected override validate(context: IValidationContext): void {
    if ((this.functionName == null || this.functionName?.isEmpty())
      && this.functionNode == null
      && this.enum == null
      && this.table == null
      && (this.expectComponentErrors == null || !this.expectComponentErrors?.hasValues)) {
      context.logger.fail(this.reference, `Scenario has no function, enum, table or expect errors.`);
    }
  }

  public getDependencies(componentNodeList: IComponentNodeList): ReadonlyArray<IComponentNode> {
    const result: Array<IComponentNode> = [];
    if (this.functionNode != null) result.push(this.functionNode);
    if (this.functionName?.hasValue) {
      let functionNode = componentNodeList.getFunction(this.functionName.value);
      if (functionNode != null) {
        result.push(functionNode);
      }
    }
    if (this.enum != null) result.push(this.enum);
    if (this.tableValue != null) result.push(this.tableValue);
    return result;
  }
}
