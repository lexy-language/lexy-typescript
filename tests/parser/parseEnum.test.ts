import {parseEnum} from "../parseFunctions";

describe('ParseEnumTests', () => {
  it('simpleEnum', async () => {
    const code = `enum Enum1
  First
  Second`;

    let {enumDefinition} = await parseEnum(code);

    expect(enumDefinition.name.value).toBe(`Enum1`);
    expect(enumDefinition.members.length).toBe(2);
    expect(enumDefinition.members[0].name).toBe(`First`);
    expect(enumDefinition.members[0].numberValue).toBe(0);
    expect(enumDefinition.members[0].valueLiteral).toBeNull();
    expect(enumDefinition.members[1].name).toBe(`Second`);
    expect(enumDefinition.members[1].numberValue).toBe(1);
    expect(enumDefinition.members[1].valueLiteral).toBeNull();
  });

  it('enumWithValues', async () => {
    const code = `enum Enum2
  First = 5
  Second = 6`;

    let {enumDefinition, _} = await parseEnum(code);

    expect(enumDefinition.name.value).toBe(`Enum2`);
    expect(enumDefinition.members.length).toBe(2);
    expect(enumDefinition.members[0].name).toBe(`First`);
    expect(enumDefinition.members[0].numberValue).toBe(5);
    expect(enumDefinition.members[0].valueLiteral?.numberValue).toBe(5);
    expect(enumDefinition.members[1].name).toBe(`Second`);
    expect(enumDefinition.members[1].numberValue).toBe(6);
    expect(enumDefinition.members[1].valueLiteral?.numberValue).toBe(6);
  });
});
