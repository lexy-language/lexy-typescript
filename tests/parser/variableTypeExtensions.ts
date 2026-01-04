import {VariableTypeDeclaration} from "../../src/language/variableTypes/declarations/variableTypeDeclaration";
import {
  asPrimitiveVariableTypeDeclaration,
} from "../../src/language/variableTypes/declarations/primitiveVariableTypeDeclaration";

export function shouldBePrimitiveType(type: VariableTypeDeclaration | null | undefined, name: string): void {

  const primitiveVariableTypeDeclaration = asPrimitiveVariableTypeDeclaration(type);
  expect(primitiveVariableTypeDeclaration).not.toBeNull();
  expect(primitiveVariableTypeDeclaration?.type).toBe(name);
}
