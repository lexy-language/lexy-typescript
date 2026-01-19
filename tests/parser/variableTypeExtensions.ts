import {TypeDeclaration} from "../../src/language/typeSystem/declarations/typeDeclaration";
import {
  asValueTypeDeclaration,
} from "../../src/language/typeSystem/declarations/valueTypeDeclaration";

export function shouldBeValueType(type: TypeDeclaration | null | undefined, name: string): void {

  const valueTypeDeclaration = asValueTypeDeclaration(type);
  expect(valueTypeDeclaration).not.toBeNull();
  expect(valueTypeDeclaration?.typeName).toBe(name);
}
