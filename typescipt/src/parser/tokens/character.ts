const digit0 = '0'.charCodeAt(0);
const digit9 = '9'.charCodeAt(0);
const letterSmallA = 'a'.charCodeAt(0);
const letterSmallZ = 'z'.charCodeAt(0);
const letterA = 'A'.charCodeAt(0);
const letterZ = 'Z'.charCodeAt(0);
const space = ' '.charCodeAt(0);
const tab =  '\t'.charCodeAt(0);

export function isDigit(value: Character) {
  return value >= digit0 && value <= digit9;
}

export function isCharacter(value: Character) {
  return (value >= letterSmallA && value <= letterSmallZ)
    || (value >= letterA && value <= letterZ);
}

export function isDigitOrLetter(value: Character) {
  return isDigit(value) || isCharacter(value);
}

export function isWhitespace(value: Character) {
  return value == space || value == tab;
}

export type Character = number;
