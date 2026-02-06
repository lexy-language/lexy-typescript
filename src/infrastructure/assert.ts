export class Assert {
  public static notNull<TValue>(value: TValue | null | undefined, name: string): TValue {
    if (value == null) {
      throw new Error(`Value '${name}' is null.`);
    }
    return value;
  }

  public static is<TValue>(castFunction: (object: any) => TValue | null, value: any, name: string): TValue {
    Assert.notNull(value, name);
    const casted = castFunction(value);
    if (!casted) {
      throw new Error(`Value '${name}' is not of correct type.`);
    }
    return value;
  }

  public static false(value: boolean, name: string) {
    if (value) {
      throw new Error(`Value '${name}' is false.`);
    }
    return value;
  }

  static true(value: boolean, name: string) {
    if (!value) {
      throw new Error(`Value '${name}' is true.`);
    }
    return value;
  }
}
