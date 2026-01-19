import type {IValidationContext} from "../../parser/validationContext";
import type {SourceReference} from "../../parser/sourceReference";

import {Expression} from "../expressions/expression";
import {TypeDeclaration} from "./declarations/typeDeclaration";
import {asObjectTypeDeclaration, ObjectTypeDeclaration} from "./declarations/objectTypeDeclaration";
import {asValueTypeDeclaration, ValueTypeDeclaration} from "./declarations/valueTypeDeclaration";
import {instanceOfEnumType} from "./enumType";
import {asMemberAccessExpression} from "../expressions/memberAccessExpression";
import {TypeNames} from "./typeNames";
import {asLiteralExpression} from "../expressions/literalExpression";
import {TypeKind} from "./typeKind";
import {IdentifierPath} from "../identifierPath";

function validateCustomType(context: IValidationContext,
                            reference: SourceReference,
                            objectTypeDeclaration: ObjectTypeDeclaration,
                            defaultValueExpression: Expression | null) {

  const identifierPathObject = IdentifierPath.parseString(objectTypeDeclaration.typeName);
  const variable = context.variableContext.createVariableReference(reference, identifierPathObject);
  let type = variable?.type;
  if (type == null ||
    (type.typeKind != TypeKind.EnumType
    && type.typeKind != TypeKind.DeclaredType
    && type.typeKind != TypeKind.GeneratedType)) {
    //logged by objectTypeDeclaration
    return;
  }

  if (defaultValueExpression == null) {
    return;
  }

  if (!(instanceOfEnumType(type))) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${objectTypeDeclaration.type}') does not support a default value.`);
    return;
  }

  const memberAccessExpression = asMemberAccessExpression(defaultValueExpression);
  if (memberAccessExpression == null || memberAccessExpression.identifierPath == null) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${objectTypeDeclaration.type}')`);
    return;
  }

  const identifierPath = memberAccessExpression.identifierPath;
  if (identifierPath.parts != 2) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${objectTypeDeclaration.type}')`);
  }
  if (identifierPath.rootIdentifier != objectTypeDeclaration.typeName) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. Invalid enum type. (type: '${objectTypeDeclaration.type}')`);
  }

  const enumDeclaration = context.componentNodes.getEnum(identifierPath.rootIdentifier);
  if (enumDeclaration == null || !enumDeclaration.containsMember(identifierPath.path[1])) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. Invalid member. (type: '${objectTypeDeclaration.type}')`);
  }
}

function validateValueType(context: IValidationContext, reference: SourceReference,
                                       valueTypeDeclaration: ValueTypeDeclaration, defaultValueExpression: Expression | null) {

  if (defaultValueExpression == null) return;

  switch (valueTypeDeclaration.typeName) {
    case TypeNames.number:
      validateDefaultLiteral("NumberLiteralToken", context, reference, valueTypeDeclaration,
        defaultValueExpression);
      break;

    case TypeNames.string:
      validateDefaultLiteral("QuotedLiteralToken", context, reference, valueTypeDeclaration,
        defaultValueExpression);
      break;

    case TypeNames.boolean:
      validateDefaultLiteral("BooleanLiteralToken", context, reference, valueTypeDeclaration,
        defaultValueExpression);
      break;

    case TypeNames.date:
      validateDefaultLiteral("DateTimeLiteralToken", context, reference, valueTypeDeclaration,
        defaultValueExpression);
      break;

    default:
      throw new Error(`Unexpected type: ${valueTypeDeclaration.type}`);
  }
}

function validateDefaultLiteral(literalType: string,
                                context: IValidationContext,
                                reference: SourceReference,
                                valueTypeDeclaration: ValueTypeDeclaration,
                                defaultValueExpression: Expression | null) {
  const literalExpression = asLiteralExpression(defaultValueExpression);
  if (literalExpression == null) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${valueTypeDeclaration.type}')`);
    return;
  }

  if (literalExpression.literal.tokenType != literalType) {
    context.logger.fail(reference,
      `Invalid default value '${defaultValueExpression}'. (type: '${valueTypeDeclaration.type}')`);
  }
}

export function validateTypeAndDefault(context: IValidationContext, reference: SourceReference,
                                       type: TypeDeclaration, defaultValueExpression: Expression | null) {

  const customType = asObjectTypeDeclaration(type);
  if (customType != null) {
    validateCustomType(context, reference, customType, defaultValueExpression);
    return;
  }

  const valueType = asValueTypeDeclaration(type);
  if (valueType != null) {
    validateValueType(context, reference, valueType, defaultValueExpression);
    return;
  }

  throw new Error(`Invalid Type: ${type.nodeType}`);
}
