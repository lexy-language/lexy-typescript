export function any<TItem>(array: ReadonlyArray<TItem>, where: ((value: TItem) => boolean) | null = null): boolean {
  for (const item of array) {
    if (where == null || where(item)) return true;
  }
  return false;
}

export function firstOrDefault<TItem>(array: ReadonlyArray<TItem>, where: ((value: TItem) => boolean) | null = null): TItem | null {

  if (where == null) return array.length > 0 ? array[0] : null;

  for (const item of array) {
    if (where(item)) return item;
  }
  return null;
}

export function singleOrDefault<TItem>(array: ReadonlyArray<TItem>, where: ((value: TItem) => boolean) | null = null): TItem | null {
  if (where == null) {
    if (array.length > 1) throw new Error("More as one element found in array.");
    return array.length == 1 ? array[0] : null;
  }
  let value: TItem | null = null;
  for (const item of array) {
    if (where(item)) {
      if (value == null) {
        value = item;
      } else {
        throw new Error("More as one element found in array.");
      }
    }
  }
  return value;
}

export function lastOrDefault<TItem>(array: ReadonlyArray<TItem>, where: ((value: TItem) => boolean) | null = null): TItem | null {

  if (where == null) return array.length > 0 ? array[array.length - 1] : null;

  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i];
    if (where(item)) return item;
  }
  return null;
}

export function forEach<TItem>(array: ReadonlyArray<TItem>, action: (value: TItem) => void): ReadonlyArray<TItem> {
  for (const value of array) {
    action(value);
  }
  return array;
}

export function contains<TItem>(array: ReadonlyArray<TItem>, value: TItem): boolean {
  for (const item of array) {
    if (item == value) return true;
  }
  return false;
}

export function where<TItem>(array: ReadonlyArray<TItem>, predicate: (value: TItem) => boolean): Array<TItem> {
  const results = [];
  for (const item of array) {
    if (predicate(item)) {
      results.push(item);
    }
  }
  return results;
}

export function whereSelect<TItem, TResult>(array: ReadonlyArray<TItem>, predicate: (value: TItem) => TResult | null): Array<TResult> {
  const results: Array<TResult> = [];
  for (const item of array) {
    let value = predicate(item);
    if (value != null) {
      results.push(value);
    }
  }
  return results;
}

export function count<TItem>(array: ReadonlyArray<TItem>, predicate: (value: TItem) => boolean): number {
  let results = 0;
  for (const item of array) {
    if (predicate(item)) {
      results++;
    }
  }
  return results;
}

export function sum<TItem>(array: ReadonlyArray<TItem>, predicate: (value: TItem) => number): number {
  let results = 0;
  for (const item of array) {
    const value = predicate(item);
    results += value;
  }
  return results;
}

export function unique<TItem>(array: ReadonlyArray<TItem>, identifierProvider: (value: TItem) => string): Array<TItem> {
  const used: {[key: string]: boolean} = {};
  const results = [];
  for (const item of array) {
    const identifier = identifierProvider(item);
    if (!used[identifier]) {
      results.push(item);
      used[identifier] = true;
    }
  }
  return results;
}

export function selectMany<TItem, TResult>(array: ReadonlyArray<TItem>, select: (value: TItem) => ReadonlyArray<TResult>): Array<TResult> {
  const results: Array<TResult> = [];
  for (const item of array) {
    const values = select(item);
    values.forEach(value => results.push(value));
  }
  return results;
}

export function addRange<TItem, TResult>(destination: Array<TResult>, source: ReadonlyArray<TItem>, selectMany: (value: TItem) => ReadonlyArray<TResult>): void {
  for (const item of source) {
    const values = selectMany(item);
    values.forEach(value => destination.push(value));
  }
}

export function take<TItem>(array: ReadonlyArray<TItem>, amount: number) {
  return array.slice(0, amount);
}