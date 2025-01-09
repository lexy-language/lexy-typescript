/*

internal static class Types {
   public static translateDate(dateTimeLiteral: DateTimeLiteral): ExpressionSyntax {
     return TranslateDate(dateTimeLiteral.DateTimeValue);
   }

   private static translateDate(dateTimeValue: Date): ExpressionSyntax {
     return ObjectCreationExpression(
         QualifiedName(
           IdentifierName(`System`),
           IdentifierName(`Date`)))
       .WithArgumentList(
         ArgumentList(
           SeparatedArray<ArgumentSyntax>(
             new SyntaxNodeOrToken[] {
               Arguments.Numeric(dateTimeValue.Year),
               Token(SyntaxKind.CommaToken),
               Arguments.Numeric(dateTimeValue.Month),
               Token(SyntaxKind.CommaToken),
               Arguments.Numeric(dateTimeValue.Day),
               Token(SyntaxKind.CommaToken),
               Arguments.Numeric(dateTimeValue.Hour),
               Token(SyntaxKind.CommaToken),
               Arguments.Numeric(dateTimeValue.Minute),
               Token(SyntaxKind.CommaToken),
               Arguments.Numeric(dateTimeValue.Second)
             })));
   }

   public static syntax(variableDefinition: VariableDefinition): TypeSyntax {
     return Syntax(variableDefinition.Type);
   }

   public static syntax(type: string): TypeSyntax {
     return type switch {
       TypeNames.String => PredefinedType(Token(SyntaxKind.StringKeyword)),
       TypeNames.Number => PredefinedType(Token(SyntaxKind.DecimalKeyword)),
       TypeNames.Date => ParseName(`System.Date`),
       TypeNames.Boolean => PredefinedType(Token(SyntaxKind.BoolKeyword)),
       _ => throw new Error(`Couldn't map type: ` + type)
     };
   }


 */

import {VariableType} from "../../language/variableTypes/variableType";
import {VariableTypeName} from "../../language/variableTypes/variableTypeName";
import {asPrimitiveType} from "../../language/variableTypes/primitiveType";
import {asEnumType} from "../../language/variableTypes/enumType";
import {enumClassName, functionClassName, tableClassName, typeClassName} from "./classNames";
import {asTableType} from "../../language/variableTypes/tableType";
import {asComplexType, ComplexType} from "../../language/variableTypes/complexType";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {ComplexTypeSource} from "../../language/variableTypes/complexTypeSource";
import {asCustomType} from "../../language/variableTypes/customType";

export function translateType(variableType: VariableType): string {

  switch (variableType.variableTypeName) {
    case VariableTypeName.PrimitiveType: {
      const primitiveType = asPrimitiveType(variableType);
      if (primitiveType == null) throw new Error("Is not primitiveType");
      return primitiveType.type;
    }
    case VariableTypeName.EnumType: {
      const enumType = asEnumType(variableType);
      if (enumType == null) throw new Error("Is not enumType");
      return enumClassName(enumType.type);
    }
    case VariableTypeName.TableType: {
      const tableType = asTableType(variableType);
      if (tableType == null) throw new Error("Is not tableType");
      return tableType.tableName;
    }
    case VariableTypeName.ComplexType: {
      const complexType = asComplexType(variableType);
      if (complexType == null) throw new Error("Is not complexType");
      return translateComplexType(complexType);
    }
    case VariableTypeName.CustomType: {
      const customType = asCustomType(variableType);
      if (customType == null) throw new Error("Is not customType");
      return typeof (customType.type);
    }
    default:
      throw new Error("Not supported: " + variableType.variableTypeName)
  }
}

export function translateComplexType(complexType: ComplexType) {
  switch (complexType.source) {
    case ComplexTypeSource.FunctionParameters: {
      return functionClassName(complexType.name) + "." + LexyCodeConstants.parametersType;
    }
    case ComplexTypeSource.FunctionResults: {
      return functionClassName(complexType.name) + "." + LexyCodeConstants.resultsType;
    }
    case ComplexTypeSource.TableRow: {
      return tableClassName(complexType.name) + "." + LexyCodeConstants.rowType;
    }
    default: {
      throw new Error(`Invalid type: ${complexType.source}`)
    }
  }
}

/*

private static
complexTypeSyntax(complexType
:
ComplexType
):
TypeSyntax
{
  switch (complexType.Source) {
    case ComplexTypeSource.FunctionParameters:
      return QualifiedName(
        IdentifierName(ClassNames.FunctionClassName(complexType.Name)),
        IdentifierName(LexyCodeConstants.ParametersType));
    case ComplexTypeSource.FunctionResults:
      return QualifiedName(
        IdentifierName(ClassNames.FunctionClassName(complexType.Name)),
        IdentifierName(LexyCodeConstants.resultsType));
    case ComplexTypeSource.TableRow:
      return QualifiedName(
        IdentifierName(ClassNames.TableClassName(complexType.Name)),
        IdentifierName(LexyCodeConstants.RowType));
    case ComplexTypeSource.Custom:
      return IdentifierName(ClassNames.TypeClassName(complexType.Name));
    default:
      throw new Error($`Invalid type: {complexType}`);
  }
}

public static
syntax(type
:
VariableDeclarationType
):
TypeSyntax
{
  return type
  switch {
    PrimitiveVariableDeclarationType primitive => Syntax(primitive.Type),
    CustomVariableDeclarationType customVariable => IdentifierNameSyntax(customVariable),
    ImplicitVariableDeclaration implicitVariable => Syntax(implicitVariable.VariableType),
    _
    =>
      throw new Error(`Couldn't map type: ` + type)
}
  ;
}

private static
customVariableIdentifier(customVariable
:
CustomVariableDeclarationType
):
IdentifierNameSyntax
{
  return customVariable.VariableType
  switch {
    EnumType enumType => IdentifierName(ClassNames.EnumClassName(enumType.Type)),
    TableType tableType => IdentifierName(ClassNames.TableClassName(tableType.Type)),
    CustomType customType => IdentifierName(ClassNames.TypeClassName(customType.Type)),
    _
    =>
      throw new Error(`Couldn't map type: ` + customVariable.VariableType)
}
  ;
}
}
*/