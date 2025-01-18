const digit0 = '0'.charCodeAt(0);
const digit9 = '9'.charCodeAt(0);
const letterSmallA = 'a'.charCodeAt(0);
const letterSmallZ = 'z'.charCodeAt(0);
const letterA = 'A'.charCodeAt(0);
const letterZ = 'Z'.charCodeAt(0);
const space = ' '.charCodeAt(0);
const tab =  '\t'.charCodeAt(0);
const underscore =  '_'.charCodeAt(0);

export function isDigit(value: Character) {
  return value >= digit0 && value <= digit9;
}

export function isLetter(value: Character) {
  return (value >= letterSmallA && value <= letterSmallZ)
    || (value >= letterA && value <= letterZ);
}

export function isDigitOrLetter(value: Character) {
  return isDigit(value) || isLetter(value);
}

export function isWhitespace(value: Character) {
  return value == space || value == tab;
}

export function isValidIdentifier(value: string | null): boolean {

  if (value == null || value == '') return false;

  let startCharacter = value.charCodeAt(0);
  if (!isLetter(startCharacter)) return false;

  for (let index = 1 ; index < value.length ; index++) {
    let character = value.charCodeAt(index);
    if (!isLetter(character) && !isDigit(character) && character != underscore) {   //todo allow underscore
      return false;
    }
  }
  return true;
}

export function isNullOrEmpty(value: string | null) {
  return value == null || value == '';
}


export type Character = number;
