import {VariableDeclarationType} from "../../src/language/variableTypes/variableDeclarationType";
import {
  asPrimitiveVariableDeclarationType,
} from "../../src/language/variableTypes/primitiveVariableDeclarationType";

export function shouldBePrimitiveType(type: VariableDeclarationType | null | undefined, name: string): void {

  const primitiveVariableDeclarationType = asPrimitiveVariableDeclarationType(type);
  expect(primitiveVariableDeclarationType).not.toBeNull();
  expect(primitiveVariableDeclarationType?.type).toBe(name);
}
