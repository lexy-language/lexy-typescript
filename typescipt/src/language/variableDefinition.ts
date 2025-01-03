import {IHasNodeDependencies} from "./IHasNodeDependencies";
import {VariableType} from "./variableTypes/variableType";
import {VariableDeclarationType} from "./variableTypes/variableDeclarationType";
import {SourceReference} from "../parser/sourceReference";
import {Expression} from "./expressions/expression";
import {VariableSource} from "./variableSource";
import {INode, Node} from "./node";
import {RootNodeList} from "./rootNodeList";
import {IRootNode} from "./rootNode";
import {asEnumType} from "./variableTypes/enumType";
import {asCustomType} from "./variableTypes/customType";
import {IParseLineContext} from "../parser/ParseLineContext";
import {OperatorType} from "../parser/tokens/operatorType";
import {OperatorToken} from "../parser/tokens/operatorToken";
import {ExpressionFactory} from "./expressions/expressionFactory";
import {IValidationContext} from "../parser/validationContext";
import {validateTypeAndDefault} from "./variableTypes/validationContextExtensions";

export class VariableDefinition extends Node implements IHasNodeDependencies {

  private variableTypeValue: VariableType | null;

  public readonly hasNodeDependencies: true;
  public readonly nodeType: "VariableDefinition";
  public readonly defaultExpression: Expression | null;
  public readonly source: VariableSource;
  public readonly type: VariableDeclarationType;
  public readonly name: string;

  public get variableType(): VariableType | null {
     return this.variableTypeValue;
   }

   constructor(name: string, type: VariableDeclarationType,
     source: VariableSource, reference: SourceReference, defaultExpression: Expression | null = null) {
     super(reference);
     this.type = type;
     this.name = name;
     this.defaultExpression = defaultExpression;
     this.source = source;
   }

   public getDependencies(rootNodeList: RootNodeList): Array<IRootNode> {

    const enumType = asEnumType(this.variableType);
     if (enumType != null) {
       var enumDefinition = rootNodeList.getEnum(enumType.type);
       return enumDefinition != null ? [enumDefinition] : [];
     }

     const customType = asCustomType(this.variableType);
     return customType != null ? [customType.typeDefinition] : [];
   }

   public static parse(source: VariableSource, context: IParseLineContext): VariableDefinition | null {
     let line = context.line;
     let result = context.validateTokens("VariableDefinition")
       .countMinimum(2)
       .stringLiteral(0)
       .stringLiteral(1)
       .isValid;

     if (!result) return null;

     let tokens = line.tokens;
     let name = tokens.tokenValue(1);
     let type = tokens.tokenValue(0);
     if (name == null || type == null) return null;

     let variableType = VariableDeclarationType.parse(type, line.tokenReference(0));
     if (variableType == null) return null;

     if (tokens.length == 2) return new VariableDefinition(name, variableType, source, line.lineStartReference());

     if (tokens.token<OperatorToken>(2, OperatorToken)?.type != OperatorType.Assignment) {
       context.logger.fail(line.tokenReference(2), `Invalid variable declaration token. Expected '='.`);
       return null;
     }

     if (tokens.length != 4) {
       context.logger.fail(line.lineEndReference(),
         `Invalid variable declaration. Expected literal token.`);
       return null;
     }

     const defaultValue = ExpressionFactory.parse(tokens.tokensFrom(3), line);
     if (defaultValue.state == "failed") {
       context.logger.fail(line.tokenReference(3), defaultValue.errorMessage);
       return null;
     }

     return new VariableDefinition(name, variableType, source, line.lineStartReference(), defaultValue.result);
   }

   public override getChildren(): Array<INode> {
    return this.defaultExpression != null ? [this.defaultExpression, this.type] : [this.type];
   }

   protected override validate(context: IValidationContext): void {
     this.variableTypeValue = this.type.createVariableType(context);

     context.variableContext.registerVariableAndVerifyUnique(this.reference, this.name, VariableType, this.source);

     validateTypeAndDefault(context, this.reference, this.type, this.defaultExpression);
   }
}
