import type {INode} from "./node";
import type {IHasNodeDependencies} from "./IHasNodeDependencies";
import type {IValidationContext} from "../parser/context/validationContext";
import type {IParseLineContext} from "../parser/context/parseLineContext";
import type {IComponentNode} from "./componentNode";
import type {IComponentNodeList} from "./componentNodeList";

import {Type} from "./typeSystem/type";
import {TypeDeclaration} from "./typeSystem/declarations/typeDeclaration";
import {SourceReference} from "./sourceReference";
import {Expression} from "./expressions/expression";
import {VariableSource} from "./variableSource";
import {Node} from "./node";
import {OperatorType} from "../parser/tokens/operatorType";
import {asOperatorToken, OperatorToken} from "../parser/tokens/operatorToken";
import {validateTypeAndDefault} from "./typeSystem/validationContextExtensions";
import {NodeType} from "./nodeType";
import {TokenType} from "../parser/tokens/tokenType";
import {asHasNodeDependencies} from "./IHasNodeDependencies";
import {TypeDeclarationParser} from "./typeSystem/declarations/typeDeclarationParser";
import {NodeReference} from "./nodeReference";
import {Symbol} from "./symbols/symbol";
import {SymbolKind} from "./symbols/symbolKind";
import {Line} from "../parser/line";
import {TokenList} from "../parser/tokens/tokenList";
import {
  newParseDefaultExpressionFailed,
  newParseDefaultExpressionSuccess,
  ParseDefaultExpressionResult
} from "./expressions/parseDefaultExpressionResult";
import {ExpressionFactory} from "./expressions/expressionFactory";

export function instanceOfVariableDefinition(object: any): object is VariableDefinition {
  return object?.nodeType == NodeType.VariableDefinition;
}

export function asVariableDefinition(object: any): VariableDefinition | null {
  return instanceOfVariableDefinition(object) ? object as VariableDefinition : null;
}

export class VariableDefinitionState {

  public readonly type: Type;

  constructor(type: Type) {
    this.type = type;
  }
}

export class VariableDefinition extends Node implements IHasNodeDependencies {

  public readonly hasNodeDependencies = true;
  public readonly nodeType = NodeType.VariableDefinition;
  public readonly defaultExpression: Expression | null;
  public readonly source: VariableSource;
  public readonly typeDeclaration: TypeDeclaration;
  public readonly name: string;

  private stateValue: VariableDefinitionState | null = null;

  public get state(): VariableDefinitionState | null {
    return this.stateValue;
  }

  public get stateRequired(): VariableDefinitionState {
    if (this.stateValue == null) throw new Error("State not set.")
    return this.stateValue;
  }

  constructor(name: string, typeDeclaration: TypeDeclaration,
              source: VariableSource, parentReference: NodeReference,
              reference: SourceReference, defaultExpression: Expression | null = null) {
    super(parentReference, reference);
    this.typeDeclaration = typeDeclaration;
    this.name = name;
    this.defaultExpression = defaultExpression;
    this.source = source;
  }

  public getDependencies(componentNodes: IComponentNodeList): ReadonlyArray<IComponentNode> {
    const hasDependencies = asHasNodeDependencies(this.typeDeclaration);
    return hasDependencies ? hasDependencies.getDependencies(componentNodes) : [];
  }

  public static parse(source: VariableSource, context: IParseLineContext, parentReference: NodeReference): VariableDefinition | null {
    const line = context.line;
    const tokens = line.tokens;
    const result = context.validateTokens("VariableDefinition")
      .countMinimum(2)
      .stringLiteral(1)
      .isValid;

    if (!result) return null;

    const typeReference = tokens.reference(0, 1);
    if (!tokens.isTokenType(0, TokenType.StringLiteralToken) && !tokens.isTokenType(0, TokenType.MemberAccessToken)) {
      context.logger.fail(typeReference, `Unexpected token.`);
      return null;
    }

    const definitionReference = new NodeReference();
    const name = tokens.tokenValue(1);

    const defaultValue = this.parseDefaultExpression(context, tokens, definitionReference, line);
    if (defaultValue.state != "success") return null;

    const typeToken = tokens.tokenValue(0);
    if (name == null || typeToken == null) return null;

    const typeDeclaration = TypeDeclarationParser.parseString(typeToken, definitionReference, typeReference);
    const variableDefinition = new VariableDefinition(name, typeDeclaration, source, parentReference, tokens.allReference(), defaultValue.result);

    definitionReference.setNode(variableDefinition);
    return variableDefinition;
  }

  private static parseDefaultExpression(context: IParseLineContext, tokens: TokenList,
    definitionReference: NodeReference , line: Line): ParseDefaultExpressionResult {

    if (tokens.length <= 2) {
      return newParseDefaultExpressionSuccess(null);
    }

    if (tokens.token<OperatorToken>(2, asOperatorToken)?.type != OperatorType.Assignment) {
      context.logger.fail(tokens.reference(2, 1), `Invalid variable declaration token. Expected '='.`);
      return newParseDefaultExpressionFailed("variableDefinition", "failed");
    }

    if (tokens.length != 4) {
      context.logger.fail(tokens.allReference(),
        `Invalid variable declaration. Expected literal token.`);
      return newParseDefaultExpressionFailed("variableDefinition", "failed");
    }

    const defaultValue = ExpressionFactory.parse(definitionReference, tokens.tokensFrom(3), line);
    if (defaultValue.state == "failed") {
      context.logger.fail(tokens.reference(3), defaultValue.errorMessage);
      return newParseDefaultExpressionFailed("variableDefinition", "failed");
    }
    return defaultValue;
  }

  public override getChildren(): Array<INode> {
    return this.defaultExpression != null
      ? [this.defaultExpression, this.typeDeclaration]
      : [this.typeDeclaration];
  }

  protected override validate(context: IValidationContext): void {
    if (this.typeDeclaration.type == null) {
      return;
    }
    this.stateValue = new VariableDefinitionState(this.typeDeclaration.type);

    context.variableContext.registerVariableAndVerifyUnique(this.reference, this.name, this.stateValue.type, this.source);

    validateTypeAndDefault(context, this.reference, this.typeDeclaration, this.defaultExpression);
  }

  public override getSymbol(): Symbol | null {
    const kind = this.source == VariableSource.Parameters ? SymbolKind.ParameterVariable : SymbolKind.ResultVariable;
    const label = this.label();
    return new Symbol(this.reference, label, "", kind);
  }

  private label(): string {
    const prefix = this.getPrefix();
    return `${prefix}: ${this.typeDeclaration} ${this.name}`;
  }

  private getPrefix(): string {
    switch (this.source) {
      case VariableSource.Parameters:
        return "parameter";
      case VariableSource.Results:
        return "result";
      case VariableSource.Code:
        return "variable";
      case VariableSource.Type:
        return "type";
      default:
        throw new Error("Invalid source: " + this.source)
    }
  }

  public toString(): string {
    return this.label();
  }
}
