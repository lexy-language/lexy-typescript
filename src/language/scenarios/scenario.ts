import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IHasNodeDependencies} from "../IHasNodeDependencies";
import type {IComponentNodeList} from "../componentNodeList";

import {Function} from "../functions/function";
import {IComponentNode, ComponentNode} from "../componentNode";
import {EnumDefinition} from "../enums/enumDefinition";
import {Table} from "../tables/table";
import {ExpectErrors} from "./expectErrors";
import {ExpectComponentErrors} from "./expectComponentErrors";
import {Results} from "./results";
import {Parameters} from "./parameters";
import {functionName} from "./functionName";
import {SourceReference} from "../sourceReference";
import {NodeName} from "../../parser/nodeName";
import {Keywords} from "../../parser/Keywords";
import {NodeType} from "../nodeType";
import {ExpectExecutionErrors} from "./expectExecutionErrors";
import {ExecutionLogging} from "./executionLogging";
import {TokenType} from "../../parser/tokens/tokenType";
import {ValidationTable} from "./validationTable";
import {isNullOrEmpty} from "../../infrastructure/validationFunctions";
import {isValidIdentifier} from "../../parser/tokens/character";
import {LexyScriptNode} from "../lexyScriptNode";
import {NodeReference} from "../nodeReference";
import {SuggestionEdit} from "../symbols/suggestionEdit";
import {Suggestions} from "../symbols/suggestions";
import {SymbolKind} from "../symbols/symbolKind";
import {Symbol} from "../symbols/symbol";

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

  constructor(name: string, parentReference: LexyScriptNode, reference: SourceReference) {
    super(name, new NodeReference(parentReference), reference);
  }

  public static parse(name: string, parent: LexyScriptNode, reference: SourceReference): Scenario {
    return new Scenario(name, parent, reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let line = context.line;
    let name = line.tokens.tokenValue(0);
    let reference = line.tokens.allReference();
    if (!line.tokens.isTokenType(0, TokenType.KeywordToken)) {
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
        return this.parametersValue = new Parameters(this, reference);
      case Keywords.Results:
        return this.resultsValue = new Results(this, reference);
      case Keywords.ValidationTable:
        return this.validationTableValue = new ValidationTable(`${this.name}Table`, this, reference);

      case Keywords.ExecutionLogging:
        return this.executionLoggingValue = new ExecutionLogging(this, reference);

      case Keywords.ExpectErrors:
        return this.expectErrorsValue = new ExpectErrors(this, reference);
      case Keywords.ExpectComponentErrors:
        return this.expectComponentErrorsValue = new ExpectComponentErrors(this, reference);
      case Keywords.ExpectExecutionErrors:
        return this.expectExecutionErrorsValue = new ExpectExecutionErrors(this, reference);
      default:
        return this.invalidToken(context, name, reference);
    }
  }

  private parseFunction(context: IParseLineContext, reference: SourceReference): IParsableNode {
    if (this.functionNodeValue != null) {
      context.logger.fail(reference, `Duplicated inline Function '${this.name}'.`);
      return this.functionNodeValue;
    }

    let tokenName = NodeName.parse(context);
    if (tokenName != null && tokenName.name != null) {
      return this.parseFunctionName(context, reference);
    }

    this.functionNodeValue = Function.create(`${this.name}Function`, true, new NodeReference(this), reference);
    context.logger.setCurrentNode(this.functionNodeValue);
    return this.functionNodeValue;
  }

  private parseFunctionName(context: IParseLineContext, reference: SourceReference) {
    this.functionNameValue = functionName.parse(context, this, reference)
    return this;
  }

  private parseEnum(context: IParseLineContext, reference: SourceReference): IParsableNode {
    if (this.enum != null) {
      context.logger.fail(reference, `Duplicated inline Enum '${this.name}'.`);
      return this.enum;
    }

    let tokenName = NodeName.parse(context);
    if (tokenName == null || tokenName.name == null) return this;

    this.enumValue = EnumDefinition.parse(tokenName.name, true, this, reference);
    context.logger.setCurrentNode(this.enumValue);
    return this.enumValue;
  }

  private parseTable(context: IParseLineContext, reference: SourceReference): IParsableNode {
    if (this.tableValue != null) {
      context.logger.fail(reference, `Duplicated inline table '${this.name}'.`);
      return this.tableValue;
    }

    let tokenName = NodeName.parse(context);
    if (tokenName == null || tokenName.name == null) return this;

    this.tableValue = new Table(tokenName.name, new NodeReference(this), reference);
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
    context.inNodeVariableScope(this, (_ =>
    {
      this.addFunctionParametersAndResultsForValidation(context);
      super.validateChild(context, child);
    })); //todo.bind(this));
  }

  private addFunctionParametersAndResultsForValidation(context: IValidationContext): void {
    let functionNode = this.functionNode ?? (this.functionName?.hasValue ? context.componentNodes.getFunction(this.functionName.value) : null);
    if (functionNode == null) return;

    functionNode.addParametersAndResultsForVariables(context);
  }

  protected override validate(context: IValidationContext): void {
    if ((this.functionName == null || this.functionName?.isEmpty())
      && this.functionNode == null
      && this.enum == null
      && this.table == null
      && (this.expectComponentErrors == null || !this.expectComponentErrors?.hasValues)) {
      context.logger.fail(this.reference, `Scenario has no function, enum, table or expect errors.`);
    }

    if (isNullOrEmpty(this.name)) {
      context.logger.fail(this.reference, `Invalid scenario name: '${this.name}'. Name should not be empty.`);
    }
    if (!isValidIdentifier(this.name)) {
      context.logger.fail(this.reference, `Invalid scenario name: '${this.name}'.`);
    }
  }

  public getDependencies(componentNodes: IComponentNodeList): ReadonlyArray<IComponentNode> {
    const result: Array<IComponentNode> = [];
    if (this.functionNode != null) result.push(this.functionNode);
    if (this.functionName?.hasValue) {
      let functionNode = componentNodes.getFunction(this.functionName.value);
      if (functionNode != null) {
        result.push(functionNode);
      }
    }
    if (this.enum != null) result.push(this.enum);
    if (this.tableValue != null) result.push(this.tableValue);
    return result;
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, "scenario: " + this.name, "Test scenario", SymbolKind.Scenario);
  }

  public override getSuggestions(): readonly SuggestionEdit[] {
    return Suggestions.edit(withSuggestions => withSuggestions
      .keyword(Keywords.Parameters)
      .keyword(Keywords.Results)
      .keyword(Keywords.ValidationTable)
      //Omit system language keywords (Expect..., Execute...)
    );
  }
}
