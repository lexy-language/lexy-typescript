import type {IRootNode} from "../rootNode";
import type {INode} from "../node";
import type {IExpressionFactory} from "../expressions/expressionFactory";
import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {IValidationContext} from "../../parser/validationContext";
import type {IRootNodeList} from "../rootNodeList";

import {RootNode} from "../rootNode";
import {IHasNodeDependencies} from "../IHasNodeDependencies";
import {FunctionName} from "./functionName";
import {FunctionParameters} from "./functionParameters";
import {FunctionResults} from "./functionResults";
import {FunctionCode} from "./functionCode";
import {SourceReference} from "../../parser/sourceReference";
import {Keywords} from "../../parser/Keywords";
import {KeywordToken} from "../../parser/tokens/keywordToken";
import {VariableDefinition} from "../variableDefinition";
import {asCustomVariableDeclarationType} from "../variableTypes/customVariableDeclarationType";
import {ComplexType} from "../variableTypes/complexType";
import {ComplexTypeMember} from "../variableTypes/complexTypeMember";
import {ComplexTypeSource} from "../variableTypes/complexTypeSource";
import {NodeType} from "../nodeType";
import {TokenType} from "../../parser/tokens/tokenType";

export function instanceOfFunction(object: any) {
  return object?.nodeType == NodeType.Function;
}

export function asFunction(object: any): Function | null {
  return instanceOfFunction(object) ? object as Function : null;
}

export class Function extends RootNode implements IHasNodeDependencies {

  private readonly factory: IExpressionFactory;
  private parametersValue: FunctionParameters | null = null;
  private resultsValue: FunctionResults | null = null;
  private codeValue: FunctionCode | null = null;

  public static readonly parameterName = `Parameters`;
  public static readonly resultsName = `Results`;

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.Function;

  public readonly name: FunctionName;

  public get parameters(): FunctionParameters | null {
    return this.parametersValue;
  };

  public get results(): FunctionResults | null {
    return this.resultsValue;
  };

  public get code(): FunctionCode | null {
    return this.codeValue;
  };

  public override get nodeName() {
    return this.name.value;
  }

  constructor(name: string, reference: SourceReference, factory: IExpressionFactory) {
    super(reference);
    this.factory = factory;
    this.name = FunctionName.parseName(name, reference);
  }

  public getDependencies(rootNodeList: IRootNodeList): Array<IRootNode> {
    let result = new Array<IRootNode>();
    if (this.parameters != null) {
      Function.addEnumTypes(rootNodeList, this.parameters.variables, result);
    }
    if (this.results != null) {
      Function.addEnumTypes(rootNodeList, this.results.variables, result);
    }
    return result;
  }

  public static create(name: string, reference: SourceReference, factory: IExpressionFactory): Function {
    return new Function(name, reference, factory);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let line = context.line;
    let name = line.tokens.tokenValue(0);
    if (!line.tokens.isTokenType<KeywordToken>(0, TokenType.KeywordToken)) return this.invalidToken(name, context);

    switch (name) {
      case Keywords.Parameters:
        if (this.parametersValue == null) {
          this.parametersValue = new FunctionParameters(line.lineStartReference());
        }
        return this.parametersValue;
      case Keywords.Results:
        if (this.resultsValue == null) {
          this.resultsValue = new FunctionResults(line.lineStartReference());
        }
        return this.resultsValue;
      case Keywords.Code:
        if (this.codeValue == null) {
          this.codeValue = new FunctionCode(line.lineStartReference(), this.factory);
        }
        return this.codeValue;
      default:
        return this.invalidToken(name, context)
    }
  }

  private invalidToken(name: string | null, parserContext: IParseLineContext): IParsableNode {
    parserContext.logger.fail(this.reference, `Invalid token '${name}'.`);
    return this;
  }

  private static addEnumTypes(rootNodeList: IRootNodeList, variableDefinitions: ReadonlyArray<VariableDefinition>,
                              result: Array<IRootNode>) {
    for (const parameter of variableDefinitions) {

      const enumVariableType = asCustomVariableDeclarationType(parameter.type);
      if (enumVariableType == null) continue;

      let dependency = rootNodeList.getEnum(enumVariableType.type);
      if (dependency != null) result.push(dependency);
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

  public getParametersType(): ComplexType {
    return this.complexType(this.parameters?.variables, ComplexTypeSource.FunctionParameters);
  }

  public getResultsType(): ComplexType {
    return this.complexType(this.results?.variables, ComplexTypeSource.FunctionResults);
  }

  private complexType(variableDefinitions: ReadonlyArray<VariableDefinition> | undefined, source: ComplexTypeSource) {
    let members = variableDefinitions
      ? variableDefinitions.map(parameter => new ComplexTypeMember(parameter.name, parameter.type.variableType))
      : [];

    return new ComplexType(this.name.value, this, source, members);
  }
}
