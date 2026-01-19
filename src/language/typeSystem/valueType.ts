import {TypeNames} from "./typeNames";
import {Type} from "./type";
import {TypeKind} from "./typeKind";

export function instanceOfValueType(object: any): object is ValueType {
  return object?.typeKind == TypeKind.ValueType;
}

export function asValueType(object: any): ValueType | null {
  return instanceOfValueType(object) ? object as ValueType : null;
}

export class ValueType extends Type
{
  public static readonly boolean: ValueType = new ValueType(TypeNames.boolean);
  public static readonly string: ValueType = new ValueType(TypeNames.string);
  public static readonly number: ValueType = new ValueType(TypeNames.number);
  public static readonly date: ValueType = new ValueType(TypeNames.date);

  public readonly typeKind = TypeKind.ValueType;

  public type: string;

  private constructor(type: string) {
    super();
    this.type = type;
  }

  public override isAssignableFrom(type: Type): boolean {
    return this.equals(type);
  }

  public override equals(other: Type | null): boolean {
    return other != null
        && instanceOfValueType(other)
        && this.type == other.type;
  }

  public toString() {
    return this.type;
  }

  public static parse(type: string): ValueType {
    switch (type) {
      case TypeNames.boolean:
        return ValueType.boolean;
      case TypeNames.string:
        return ValueType.string;
      case TypeNames.number:
        return ValueType.number;
      case TypeNames.date:
        return ValueType.date;
      default:
        throw new Error(`Invalid value type: '${type}'`)
    }
  }
}
