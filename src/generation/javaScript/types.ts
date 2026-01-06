import {VariableType} from "../../language/variableTypes/variableType";
import {VariableTypeName} from "../../language/variableTypes/variableTypeName";
import {asPrimitiveType} from "../../language/variableTypes/primitiveType";
import {asEnumType} from "../../language/variableTypes/enumType";
import {enumClassName, functionClassName, tableClassName} from "./classNames";
import {asTableType} from "../../language/variableTypes/tableType";
import {LexyCodeConstants} from "./lexyCodeConstants";
import {asGeneratedType, GeneratedType} from "../../language/variableTypes/generatedType";
import {GeneratedTypeSource} from "../../language/variableTypes/generatedTypeSource";
import {asDeclaredType} from "../../language/variableTypes/declaredType";

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
      if (tableType == null) throw new Error("Is not table");
      return tableType.tableName;
    }
    case VariableTypeName.GeneratedType: {
      const objectType = asGeneratedType(variableType);
      if (objectType == null) throw new Error("Is not GeneratedType");
      return translateGeneratedType(objectType);
    }
    case VariableTypeName.DeclaredType: {
      const customType = asDeclaredType(variableType);
      if (customType == null) throw new Error("Is not DeclaredType");
      return typeof (customType.type);
    }
    default:
      throw new Error(`Not supported: ${variableType.variableTypeName}`)
  }
}

export function translateGeneratedType(objectType: GeneratedType) {
  switch (objectType.source) {
    case GeneratedTypeSource.FunctionParameters: {
      return `${functionClassName(objectType.name)}.${LexyCodeConstants.parametersType}`;
    }
    case GeneratedTypeSource.FunctionResults: {
      return `${functionClassName(objectType.name)}.${LexyCodeConstants.resultsType}`;
    }
    case GeneratedTypeSource.TableRow: {
      return `${tableClassName(objectType.name)}.${LexyCodeConstants.rowType}`;
    }
    default: {
      throw new Error(`Invalid type: ${objectType.source}`)
    }
  }
}