import type {IComponentNode} from "../componentNode";
import type {INode} from "../node";
import type {IExpressionFactory} from "../expressions/expressionFactory";
import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {IValidationContext} from "../../parser/validationContext";
import type {IComponentNodeList} from "../componentNodeList";
import type {IHasNodeDependencies} from "../IHasNodeDependencies";

import {ComponentNode} from "../componentNode";
import {FunctionName} from "./functionName";
import {FunctionParameters} from "./functionParameters";
import {FunctionResults} from "./functionResults";
import {FunctionCode} from "./functionCode";
import {SourceReference} from "../../parser/sourceReference";
import {Keywords} from "../../parser/Keywords";
import {VariableDefinition} from "../variableDefinition";
import {asObjectVariableTypeDeclaration} from "../variableTypes/declarations/objectVariableTypeDeclaration";
import {GeneratedType} from "../variableTypes/generatedType";
import {GeneratedTypeSource} from "../variableTypes/generatedTypeSource";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";
import {Expression} from "../expressions/expression";
import {
  newValidateFunctionArgumentsCallFunctionSuccess,
  newValidateFunctionArgumentsFailed,
  newValidateFunctionArgumentsSuccessAutoMap,
  ValidateFunctionArgumentsResult
} from "./validateFunctionArgumentRsult";
import {VariableType} from "../variableTypes/variableType";
import {FunctionSignature} from "./functionSignature";
import {ObjectTypeVariable} from "../variableTypes/objectTypeVariable";
import {instanceOfSpreadExpression} from "../expressions/spreadExpression";

export function instanceOfFunction(object: any) {
  return object?.nodeType == NodeType.Function;
}

export function asFunction(object: any): Function | null {
  return instanceOfFunction(object) ? object as Function : null;
}

export class Function extends ComponentNode implements IHasNodeDependencies {

  private readonly factory: IExpressionFactory;

  private readonly parametersValue: FunctionParameters;
  private readonly resultsValue: FunctionResults;
  private readonly codeValue: FunctionCode;

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
    Function.addObjectTypes(componentNodes, this.parameters.variables, result);
    Function.addObjectTypes(componentNodes, this.results.variables, result);
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

  private static addObjectTypes(componentNodes: IComponentNodeList, variableDefinitions: ReadonlyArray<VariableDefinition>,
                              result: Array<IComponentNode>) {
    for (const parameter of variableDefinitions) {

      const enumVariableType = asObjectVariableTypeDeclaration(parameter.type);
      if (enumVariableType == null) continue;

      let dependency = componentNodes.getNode(enumVariableType.type);
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
      ? variableDefinitions.map(parameter => new ObjectTypeVariable(parameter.name, parameter.type.variableType))
      : [];

    return new GeneratedType(this.name.value, this, source, members);
  }

  public validateArguments(context: IValidationContext, args: ReadonlyArray<Expression>, reference: SourceReference): ValidateFunctionArgumentsResult {
    return this.hasSpreadArgument(args)
      ? this.validateAutoMap()
      : this.validateWithArguments(context, args, reference);
  }

  private validateAutoMap(): ValidateFunctionArgumentsResult {
    return newValidateFunctionArgumentsSuccessAutoMap(this.getParametersType());
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

  private getParametersTypes(): ReadonlyArray<VariableType | null> {
    return this.parametersValue.variables.map(parameter => parameter.variableType);
  }

  private getArgumentTypes(args: ReadonlyArray<Expression>, context: IValidationContext):
    ReadonlyArray<VariableType | null> {

    return this.hasSpreadArgument(args)
      ? [this.getResultsType()]
      : args.map(argument => argument.deriveType(context));
  }

  private hasSpreadArgument(args: ReadonlyArray<Expression>): boolean {
    return args.length == 1 && instanceOfSpreadExpression(args[0]);
  }
}
