import Decimal from "decimal.js";

export function deepCopy<T>(obj: T): T {
  if (obj === null) return null as T;
  if (obj instanceof Date) return copyDate(obj) as T;
  if (Decimal.isDecimal(obj)) return copyDecimal(obj as Decimal) as T;
  if (typeof obj !== 'object') return obj;

  return Array.isArray(obj)
    ? copyArray(obj) as unknown as T
    : copyObject(obj);
}

function copyDate(date: Date): Date {
  return new Date(date);
}

function copyDecimal(decimal: Decimal): number {
  return decimal.toNumber();
}

function copyArray<T>(obj: T & any[]) {
  return obj.map(item => deepCopy(item));
}

function copyObject<T extends  {}>(obj: T ): T {
  const copy = {} as { [K in keyof T]: T[K] };
  Object.keys(obj).forEach(key => {
    if (key.startsWith("__")) return;
    copy[key as keyof T] = deepCopy((obj as { [key: string]: any })[key]);
  });
  return copy;
}