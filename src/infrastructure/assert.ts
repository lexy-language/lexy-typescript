export class Assert {
  public static notNull<TValue>(value: TValue | null | undefined, name: string): TValue {
    if (!value) {
      throw new Error(`Value '${name}' is null.`);
    }
    return value;
  }
}