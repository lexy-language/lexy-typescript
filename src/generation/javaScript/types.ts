import {Type} from "../../language/typeSystem/type";
import {TypeKind} from "../../language/typeSystem/typeKind";
import {asValueType} from "../../language/typeSystem/valueType";
import {asEnumType} from "../../language/typeSystem/enumType";
import {enumClassName, functionClassName, tableClassName} from "./classNames";
import {asTableType} from "../../language/typeSystem/tableType";
import {LexyCodeConstants} from "./lexyCodeConstants";
import {asGeneratedType, GeneratedType} from "../../language/typeSystem/objects/generatedType";
import {GeneratedTypeSource} from "../../language/typeSystem/objects/generatedTypeSource";
import {asDeclaredType} from "../../language/typeSystem/objects/declaredType";

export function translateType(type: Type): string {

  switch (type.typeKind) {
    case TypeKind.ValueType: {
      const valueType = asValueType(type);
      if (valueType == null) throw new Error("Is not valueType");
      return valueType.type;
    }
    case TypeKind.EnumType: {
      const enumType = asEnumType(type);
      if (enumType == null) throw new Error("Is not enumType");
      return enumClassName(enumType.name);
    }
    case TypeKind.TableType: {
      const tableType = asTableType(type);
      if (tableType == null) throw new Error("Is not table");
      return tableType.name;
    }
    case TypeKind.GeneratedType: {
      const objectType = asGeneratedType(type);
      if (objectType == null) throw new Error("Is not GeneratedType");
      return translateGeneratedType(objectType);
    }
    case TypeKind.DeclaredType: {
      const customType = asDeclaredType(type);
      if (customType == null) throw new Error("Is not DeclaredType");
      return typeof (customType.name);
    }
    default:
      throw new Error(`Not supported: ${type.typeKind}`)
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
