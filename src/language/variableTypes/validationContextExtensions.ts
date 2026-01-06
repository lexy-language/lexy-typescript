import type {IValidationContext} from "../../parser/validationContext";
import type {SourceReference} from "../../parser/sourceReference";

import {Expression} from "../expressions/expression";
import {VariableTypeDeclaration} from "./declarations/variableTypeDeclaration";
import {asObjectVariableTypeDeclaration, ObjectVariableTypeDeclaration} from "./declarations/objectVariableTypeDeclaration";
import {asPrimitiveVariableTypeDeclaration, PrimitiveVariableTypeDeclaration} from "./declarations/primitiveVariableTypeDeclaration";
import {instanceOfEnumType} from "./enumType";
import {asMemberAccessExpression} from "../expressions/memberAccessExpression";
import {TypeNames} from "./typeNames";
import {asLiteralExpression} from "../expressions/literalExpression";
import {VariableTypeName} from "./variableTypeName";
import {IdentifierPath} from "../identifierPath";

function validateCustomVariableType(context: IValidationContext,
                                    reference: SourceReference,
                                    ObjectVariableTypeDeclaration: ObjectVariableTypeDeclaration,
                                    defaultValueExpression: Expression | null) {

  const identifierPathObject = IdentifierPath.parseString(ObjectVariableTypeDeclaration.type);
  const variable = context.variableContext.createVariableReference(reference, identifierPathObject, context);
  let type = variable?.variableType;
  if (type == null ||
    (type.variableTypeName != VariableTypeName.EnumType
    && type.variableTypeName != VariableTypeName.DeclaredType
    && type.variableTypeName != VariableTypeName.GeneratedType)) {
    //logged by ObjectVariableTypeDeclaration
    return;
  }

  if (defaultValueExpression == null) {
    return;
  }

  if (!(instanceOfEnumType(type))) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${ObjectVariableTypeDeclaration.type}') does not support a default value.`);
    return;
  }

  const memberAccessExpression = asMemberAccessExpression(defaultValueExpression);
  if (memberAccessExpression == null || memberAccessExpression.identifierPath == null) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${ObjectVariableTypeDeclaration.type}')`);
    return;
  }

  const identifierPath = memberAccessExpression.identifierPath;
  if (identifierPath.parts != 2) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${ObjectVariableTypeDeclaration.type}')`);
  }
  if (identifierPath.rootIdentifier != ObjectVariableTypeDeclaration.type) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. Invalid enum type. (type: '${ObjectVariableTypeDeclaration.type}')`);
  }

  const enumDeclaration = context.componentNodes.getEnum(identifierPath.rootIdentifier);
  if (enumDeclaration == null || !enumDeclaration.containsMember(identifierPath.path[1])) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. Invalid member. (type: '${ObjectVariableTypeDeclaration.type}')`);
  }
}

function validatePrimitiveVariableType(context: IValidationContext, reference: SourceReference,
                                       primitiveVariableTypeDeclaration: PrimitiveVariableTypeDeclaration, defaultValueExpression: Expression | null) {

  if (defaultValueExpression == null) return;

  switch (primitiveVariableTypeDeclaration.type) {
    case TypeNames.number:
      validateDefaultLiteral("NumberLiteralToken", context, reference, primitiveVariableTypeDeclaration,
        defaultValueExpression);
      break;

    case TypeNames.string:
      validateDefaultLiteral("QuotedLiteralToken", context, reference, primitiveVariableTypeDeclaration,
        defaultValueExpression);
      break;

    case TypeNames.boolean:
      validateDefaultLiteral("BooleanLiteralToken", context, reference, primitiveVariableTypeDeclaration,
        defaultValueExpression);
      break;

    case TypeNames.date:
      validateDefaultLiteral("DateTimeLiteralToken", context, reference, primitiveVariableTypeDeclaration,
        defaultValueExpression);
      break;

    default:
      throw new Error(`Unexpected type: ${primitiveVariableTypeDeclaration.type}`);
  }
}

function validateDefaultLiteral(literalType: string, context: IValidationContext, reference: SourceReference,
                                primitiveVariableTypeDeclaration: PrimitiveVariableTypeDeclaration,
                                defaultValueExpression: Expression | null) {
  const literalExpression = asLiteralExpression(defaultValueExpression);
  if (literalExpression == null) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${primitiveVariableTypeDeclaration.type}')`);
    return;
  }

  if (literalExpression.literal.tokenType != literalType) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${primitiveVariableTypeDeclaration.type}')`);
  }
}

export function validateTypeAndDefault(context: IValidationContext, reference: SourceReference,
                                       type: VariableTypeDeclaration, defaultValueExpression: Expression | null) {

  const customVariableType = asObjectVariableTypeDeclaration(type);
  if (customVariableType != null) {
    validateCustomVariableType(context, reference, customVariableType, defaultValueExpression);
    return;
  }

  const primitiveVariableType = asPrimitiveVariableTypeDeclaration(type);
  if (primitiveVariableType != null) {
    validatePrimitiveVariableType(context, reference, primitiveVariableType, defaultValueExpression);
    return;
  }

  throw new Error(`Invalid Type: ${type.nodeType}`);
}
