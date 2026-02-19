import {DateTimeLiteralToken} from "../../parser/tokens/dateTimeLiteralToken";

export class ConstantValue {
  public value: any;

  constructor(value: any) {
    this.value = value;
  }

  public toString(): string {
    if (this.value instanceof Date) {
      return DateTimeLiteralToken.formatDate(this.value as Date);
    }
    return this.value != null ? this.value.toString() : "null";
  }
}
