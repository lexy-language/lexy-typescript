export class TypeNames
{
  public static readonly number: string = "number";
  public static readonly boolean: string = "boolean";
  public static readonly date: string = "date";
  public static readonly string: string = "string";

  public static readonly values = [
    TypeNames.number,
    TypeNames.boolean,
    TypeNames.date,
    TypeNames.string
  ];

  public static contains(parameterType: string): boolean {
    return this.values.indexOf(parameterType) > -1;
  }
}
