import type {IComponentNode} from "../componentNode";
import {ComponentNode} from "../componentNode";
import type {INode} from "../node";
import type {IExpressionFactory} from "../expressions/expressionFactory";
import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {IValidationContext} from "../../parser/validationContext";
import type {IComponentNodeList} from "../componentNodeList";
import {IHasNodeDependencies} from "../IHasNodeDependencies";
import {FunctionName} from "./functionName";
import {FunctionParameters} from "./functionParameters";
import {FunctionResults} from "./functionResults";
import {FunctionCode} from "./functionCode";
import {SourceReference} from "../../parser/sourceReference";
import {Keywords} from "../../parser/Keywords";
import {KeywordToken} from "../../parser/tokens/keywordToken";
import {VariableDefinition} from "../variableDefinition";
import {asComplexVariableTypeDeclaration} from "../variableTypes/declarations/complexVariableTypeDeclaration";
import {GeneratedType} from "../variableTypes/generatedType";
import {GeneratedTypeMember} from "../variableTypes/generatedTypeMember";
import {GeneratedTypeSource} from "../variableTypes/generatedTypeSource";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {Expression} from "../expressions/expression";
import {
  newValidateFunctionArgumentsFailed,
  newValidateFunctionArgumentsSuccess,
  newValidateFunctionArgumentsSuccessAutoMap,
  ValidateFunctionArgumentsResult
} from "./validateFunctionArgumentRsult";

export function instanceOfFunction(object: any) {
  return object?.nodeType == NodeType.Function;
}

export function asFunction(object: any): Function | null {
  return instanceOfFunction(object) ? object as Function : null;
}

export class Function extends ComponentNode implements IHasNodeDependencies {

  private readonly factory: IExpressionFactory;

  private parametersValue: FunctionParameters;
  private resultsValue: FunctionResults;
  private codeValue: FunctionCode;

  public static readonly parameterName = `Parameters`;
  public static readonly resultsName = `Results`;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.Function;

  public readonly name: FunctionName;

  public get parameters(): FunctionParameters {
    return this.parametersValue;
  };

  public get results(): FunctionResults {
    return this.resultsValue;
  };

  public get code(): FunctionCode {
    return this.codeValue;
  };

  public override get nodeName() {
    return this.name.value;
  }

  constructor(name: string, reference: SourceReference, factory: IExpressionFactory) {
    super(reference);
    this.factory = factory;
    this.parametersValue = new FunctionParameters(reference);
    this.resultsValue = new FunctionResults(reference);
    this.codeValue = new FunctionCode(reference, this.factory);
    this.name = FunctionName.parseName(name, reference);
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    let result = new Array<IComponentNode>();
    Function.addEnumTypes(componentNodes, this.parameters.variables, result);
    Function.addEnumTypes(componentNodes, this.results.variables, result);
    return result;
  }

  public static create(name: string, reference: SourceReference, factory: IExpressionFactory): Function {
    return new Function(name, reference, factory);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let line = context.line;
    if (!line.tokens.isTokenType(0, TokenType.KeywordToken)) {
      return this.codeValue.parse(context);
    }

    let name = line.tokens.tokenValue(0);
    switch (name) {
      case Keywords.Parameters:
        return this.parametersValue;
      case Keywords.Results:
        return this.resultsValue;
      default:
        return this.codeValue.parse(context);
    }
  }

  private static addEnumTypes(componentNodes: IComponentNodeList, variableDefinitions: ReadonlyArray<VariableDefinition>,
                              result: Array<IComponentNode>) {
    for (const parameter of variableDefinitions) {

      const enumVariableType = asComplexVariableTypeDeclaration(parameter.type);
      if (enumVariableType == null) continue;

      let dependency = componentNodes.getEnum(enumVariableType.type);
      if (dependency != null) {
        result.push(dependency);
      }
    }
  }

  public override validateTree(context: IValidationContext): void {
    const scope = context.createVariableScope();
    try {
      super.validateTree(context);
    } finally {
      scope[Symbol.dispose]();
    }
  }

  public override getChildren(): Array<INode> {
    const result: Array<INode> = [this.name];
    if (this.parameters != null) result.push(this.parameters);
    if (this.results != null) result.push(this.results);
    if (this.code != null) result.push(this.code);
    return result;
  }

  protected override validate(context: IValidationContext): void {
  }

  public getParametersType(): GeneratedType {
    return this.generatedType(this.parameters?.variables, GeneratedTypeSource.FunctionParameters);
  }

  public getResultsType(): GeneratedType {
    return this.generatedType(this.results?.variables, GeneratedTypeSource.FunctionResults);
  }

  private generatedType(variableDefinitions: ReadonlyArray<VariableDefinition> | undefined, source: GeneratedTypeSource) {
    let members = variableDefinitions
      ? variableDefinitions.map(parameter => new GeneratedTypeMember(parameter.name, parameter.type.variableType))
      : [];

    return new GeneratedType(this.name.value, this, source, members);
  }

  public validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>): ValidateFunctionArgumentsResult {
    return args.length == 0
      ? this.validateNoArgumentCall()
      : this.validateWithArguments(context, args);
  }

  private validateNoArgumentCall(): ValidateFunctionArgumentsResult {
    return newValidateFunctionArgumentsSuccessAutoMap(this.getParametersType(), this.getResultsType());
  }

  private validateWithArguments(context: IValidationContext, args: ReadonlyArray<Expression>): ValidateFunctionArgumentsResult {

    if (args.length != 1) {
      context.logger.fail(this.reference, `Invalid number of function arguments: '${this.name}'. `);
      return newValidateFunctionArgumentsFailed();
    }

    let argumentType = args[0].deriveType(context);
    let resultsType = this.getResultsType();
    let parametersType = this.getParametersType();

    if (argumentType == null || !argumentType.equals(parametersType)) {
      context.logger.fail(this.reference, `Invalid function argument: '${this.name}'. ` +
        "Argument should be of type function parameters. Use new(Function) of fill(Function) to create an variable of the function result type.");

      return newValidateFunctionArgumentsFailed();
    }

    return newValidateFunctionArgumentsSuccess(resultsType);
  }
}



