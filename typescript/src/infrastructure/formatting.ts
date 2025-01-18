export function format<TItem>(enumerable: ReadonlyArray<TItem> | null | undefined, indentLevel: number): string {

  const indent = indentLevel > 0 ? ' '.repeat(indentLevel * 2) : '';
  const builder: Array<string> = [];
  builder.push('\n');

  if (!enumerable) {
    builder.push(indent + "No entries\n");
  } else {
    for (const item of enumerable) {
      builder.push(indent + item + "\n");
    }
  }

  return builder.join('');
}

export function formatLine<TItem>(enumerable: ReadonlyArray<TItem>, separator: string): string {

  const builder: Array<string> = [];
  for (const item of enumerable)
  {
    if (builder.length > 0) builder.push(separator);
    builder.push((item as any)?.toString());
  }

  return builder.join('');
}
