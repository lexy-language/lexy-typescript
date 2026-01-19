import {CompilerResult} from "../generation/compilerResult";
import {Type} from "../language/typeSystem/type";
import {asEnumType, EnumType} from "../language/typeSystem/enumType";
import {asValueType, ValueType} from "../language/typeSystem/valueType";
import {TypeNames} from "../language/typeSystem/typeNames";

export class TypeConverter {
   public static convert(compilerResult: CompilerResult, value: object, type: Type): any {

     const enumType = asEnumType(type);
     if (enumType != null) {
       return this.convertEnum(compilerResult, enumType, value);
     }

     const valueType = asValueType(type);
     if (valueType != null) {
       return this.convertValue(valueType, value);
     }

     throw new Error(`Invalid type: '${type}'`);
   }

  private static convertEnum(compilerResult: CompilerResult, enumType: EnumType, value: object) {
    let enumTypeObject = compilerResult.getEnumType(enumType.typeKind);
    if (enumTypeObject == null) throw new Error(`Unknown enum: ${enumType.typeKind}`);

    let enumValueName = value.toString();
    let indexOfSeparator = enumValueName.indexOf(`.`);
    return enumValueName.substring(indexOfSeparator + 1);
  }

  private static convertValue(valueType: ValueType, value: object) {
    switch (valueType.type) {
      case TypeNames.number:
        return parseFloat(value.toString());

      case TypeNames.date:
        return value.constructor == Date ? value : new Date(value.toString());

      case TypeNames.boolean:
        return value.toString() === 'true';

      case TypeNames.string:
        return value;
      default:
        throw new Error(`Invalid type: '${valueType.type}'`)
    }
  }
}
