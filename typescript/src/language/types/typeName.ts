import {Assert} from "../../infrastructure/assert";

export class TypeName {

  private readonly valueValue: string | null = null;

  constructor(name: string) {
    this.valueValue = name;
  }

  public get value(): string {
    return Assert.notNull(this.valueValue, "value");
  }

  public static parseName(parameter: string): TypeName {
    return new TypeName(parameter);
  }
}
