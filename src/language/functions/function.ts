import type {IComponentNode} from "../componentNode";
import type {INode} from "../node";
import type {IExpressionFactory} from "../expressions/expressionFactory";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {IComponentNodeList} from "../componentNodeList";
import type {IHasNodeDependencies} from "../IHasNodeDependencies";
import type {INestedNode} from "../nestedNode";

import {ComponentNode} from "../componentNode";
import {FunctionParameters} from "./functionParameters";
import {FunctionResults} from "./functionResults";
import {FunctionCode} from "./functionCode";
import {SourceReference} from "../sourceReference";
import {Keywords} from "../../parser/Keywords";
import {VariableDefinition} from "../variableDefinition";
import {asObjectTypeDeclaration} from "../typeSystem/declarations/objectTypeDeclaration";
import {GeneratedType} from "../typeSystem/objects/generatedType";
import {GeneratedTypeSource} from "../typeSystem/objects/generatedTypeSource";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {Expression} from "../expressions/expression";
import {
  newValidateFunctionArgumentsCallFunctionSuccess,
  newValidateFunctionArgumentsFailed,
  newValidateFunctionArgumentsSuccessAutoMap,
  ValidateFunctionArgumentsResult
} from "./validateFunctionArgumentRsult";
import {Type} from "../typeSystem/type";
import {FunctionSignature} from "./functionSignature";
import {ObjectVariable} from "../typeSystem/objects/objectVariable";
import {instanceOfSpreadExpression} from "../expressions/spreadExpression";
import {INodeWithType} from "../nodeWithType";
import {FunctionType} from "../typeSystem/functionType";
import {isNullOrEmpty} from "../../infrastructure/validationFunctions";
import {isValidIdentifier} from "../../parser/tokens/character";
import {NodeReference} from "../nodeReference";
import {SuggestionEdit} from "../symbols/suggestionEdit";
import {Suggestions} from "../symbols/suggestions";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";
import {VariableSource} from "../variableSource";

export function instanceOfFunction(object: any) {
  return object?.nodeType == NodeType.Function;
}

export function asFunction(object: any): Function | null {
  return instanceOfFunction(object) ? object as Function : null;
}

export class Function extends ComponentNode implements IHasNodeDependencies, INestedNode, INodeWithType {

  private parametersValue: FunctionParameters | null = null;
  private resultsValue: FunctionResults | null = null;
  private readonly codeValue: FunctionCode;

  public static readonly parameterName = `Parameters`;
  public static readonly resultsName = `Results`;

  public readonly hasNodeDependencies = true;

  public readonly nodeType = NodeType.Function;
  public readonly isNestedNode = true;
  public readonly isNodeWithType = true;

  public readonly nested: boolean

  public get parameters(): FunctionParameters | null {
    return this.parametersValue;
  };

  public get results(): FunctionResults | null {
    return this.resultsValue;
  };

  public get code(): FunctionCode {
    return this.codeValue;
  };

  constructor(name: string, nested: boolean, parentReference: NodeReference, reference: SourceReference, factory: IExpressionFactory) {
    super(name, parentReference, reference);
    this.nested = nested;
    this.codeValue = new FunctionCode(this, reference, factory);
  }

  public createType(): Type {
    return new FunctionType(this);
  }

  public getParametersType(): GeneratedType {
    const members = this.getMembers(this.parameters?.variables) ;
    return new GeneratedType(this.name, Function.parameterName, this, GeneratedTypeSource.FunctionParameters, members);
  }

  public getResultsType(): GeneratedType {
    const members = this.getMembers(this.results?.variables) ;
    return new GeneratedType(this.name, Function.resultsName, this, GeneratedTypeSource.FunctionResults, members);
  }

  private getMembers(variables: readonly VariableDefinition[] | undefined) {
    if (!variables) {
      return [];
    }
    return variables.map(parameter => new ObjectVariable(parameter.name, parameter.typeDeclaration.type));
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    let result = new Array<IComponentNode>();
    Function.addObjectTypes(componentNodes, this.parameters?.variables, result);
    Function.addObjectTypes(componentNodes, this.results?.variables, result);
    return result;
  }

  public static create(name: string, nested: boolean, parentReference: NodeReference, reference: SourceReference, factory: IExpressionFactory): Function {
    return new Function(name, nested, parentReference, reference, factory);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let line = context.line;
    if (!line.tokens.isTokenType(0, TokenType.KeywordToken)) {
      return this.parseCode(context);
    }

    var reference = line.tokens.allReference();
    let name = line.tokens.tokenValue(0);
    switch (name) {
      case Keywords.Parameters:
        return this.parametersValue = new FunctionParameters(this, reference);
      case Keywords.Results:
        return this.resultsValue = new FunctionResults(this, reference);
      default:
        return this.parseCode(context);
    }
  }

  private parseCode(context: IParseLineContext) {
    this.code.expandArea(context.line.endPosition);
    return this.code.parse(context);
  }

  private static addObjectTypes(componentNodes: IComponentNodeList,
                                variableDefinitions: readonly VariableDefinition[] | undefined,
                                result: Array<IComponentNode>) {

    if (!variableDefinitions) return;

    for (const parameter of variableDefinitions) {
      const objectType = asObjectTypeDeclaration(parameter.typeDeclaration);
      if (objectType == null) continue;

      let dependency = objectType.getNode(componentNodes);
      if (dependency != null) {
        result.push(dependency);
      }
    }
  }

  public override validateTree(context: IValidationContext): void {
    context.inNodeVariableScope(this, super.validateTree.bind(this));
  }

  public override getChildren(): Array<INode> {
    const result: Array<INode> = [];
    if (this.parameters != null) result.push(this.parameters);
    if (this.results != null) result.push(this.results);
    result.push(this.code);
    return result;
  }

  protected override validate(context: IValidationContext): void {
    if (isNullOrEmpty(this.name)) {
      context.logger.fail(this.reference, `Invalid function name: '${this.name}'. Name should not be empty.`);
    }
    if (!isValidIdentifier(this.name)) {
      context.logger.fail(this.reference, `Invalid function name: '${this.name}'.`);
    }
  }

  public validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>, reference: SourceReference): ValidateFunctionArgumentsResult {
    return this.hasSpreadArgument(args)
      ? this.validateAutoMap()
      : this.validateWithArguments(context, args, reference);
  }

  private validateAutoMap(): ValidateFunctionArgumentsResult {

    const parametersType = this.getParametersType();

    return newValidateFunctionArgumentsSuccessAutoMap(parametersType);
  }

  private validateWithArguments(context: IValidationContext, args: ReadonlyArray<Expression>, reference: SourceReference): ValidateFunctionArgumentsResult {

    let argumentTypes = this.getArgumentTypes(args, context);
    let overloads = this.getFunctions();

    for (const overload of overloads) {
      if (overload.matches(argumentTypes)) {
        return newValidateFunctionArgumentsCallFunctionSuccess(overload);
      }
    }

    var error = this.buildErrorMessage(overloads);
    context.logger.fail(reference, error);

    return newValidateFunctionArgumentsFailed();
  }

  private buildErrorMessage(overloads: Array<FunctionSignature>): string {

    const stringBuilder = [`Invalid function arguments: '${this.name}'. Function overloads:\n`];

    for (const overload of overloads) {
      stringBuilder.push(`- ${this.name}(`);
      Function.addParameters(overload, stringBuilder);
      stringBuilder.push(`)\n`);
    }

    return stringBuilder.join("");
  }

  private static addParameters(signature: FunctionSignature, stringBuilder: Array<string>) {

    for (let index = 0; index < signature.parametersTypes.length; index++) {
      let parametersType = signature.parametersTypes[index];
      if (parametersType) {
        stringBuilder.push(parametersType.toString());
      }
      if (index < signature.parametersTypes.length - 1)
      {
        stringBuilder.push(", ");
      }
    }
  }

  private getFunctions(): Array<FunctionSignature> {
    return [
      this.getSingleParameterArgumentFunction(),
      this.inlineParametersArgumentsFunction(),
    ];
  }

  private getSingleParameterArgumentFunction(): FunctionSignature {
    return new FunctionSignature([this.getParametersType()], this.getResultsType());
  }

  private inlineParametersArgumentsFunction(): FunctionSignature {
    const parameters = this.getParametersTypes();
    const resultsType = this.getResultsType();
    return new FunctionSignature(parameters,  resultsType);
  }

  private getParametersTypes(): readonly (Type | null)[] {
    return this.parametersValue == null
      ? []
      : this.parametersValue.variables.map(parameter => parameter.state ? parameter.state.type : null);
  }

  private getArgumentTypes(args: ReadonlyArray<Expression>, context: IValidationContext):
    ReadonlyArray<Type | null> {

    return this.hasSpreadArgument(args)
      ? [this.getResultsType()]
      : args.map(argument => argument.deriveType(context));
  }

  private hasSpreadArgument(args: ReadonlyArray<Expression>): boolean {
    return args.length == 1 && instanceOfSpreadExpression(args[0]);
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, `function: ${this.name}`, "", SymbolKind.Function);
  }

  public override getSuggestions(): readonly SuggestionEdit[] {
    return Suggestions.edit(withSuggestions => withSuggestions
      .keyword(Keywords.Parameters)
      .keyword(Keywords.Results)
      .keyword(Keywords.If)
      .keyword(Keywords.Switch)
    );
  }

  public addParametersAndResultsForVariables(context: IValidationContext): void {
    this.addVariablesForValidation(context, this.parameters?.variables, VariableSource.Parameters);
    this.addVariablesForValidation(context, this.results?.variables, VariableSource.Results);
  }

  private addVariablesForValidation(context: IValidationContext,
                                    definitions: readonly VariableDefinition[] | undefined,
                                    source: VariableSource): void {

    if (!definitions) return;

    for (const definition of definitions) {
      const type = definition.typeDeclaration.type;
      if (type) {
        context.variableContext.addVariable(definition.name, type, source);
      }
    }
  }
}
