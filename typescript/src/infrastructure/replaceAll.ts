export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(value: string, find: string, replace: string) {
  return value.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}