import {Assert} from "../../infrastructure/assert";

export class TypeName {

  private valueValue: string | null = null;

  public get value(): string {
    return Assert.notNull(this.valueValue, "value");
  }

  public parseName(parameter: string): void {
    this.valueValue = parameter;
  }
}
