import {IdentifierPath} from "../../src/language/identifierPath";
import {ValueType} from "../../src/language/typeSystem/valueType";
import {Libraries} from "../../src/functionLibraries/libraries";

describe('libraries', () => {
  it('should contain math library', async () => {
    let libraries = new Libraries([]);
    let path = new IdentifierPath(["Math"]);
    let math = libraries.getLibrary(path);
    expect(math).not.toBeNull();
    let func = math.getFunction("Power");
    expect(func).not.toBeNull();
    expect(func.getResultsType([])).toEqual(ValueType.number);
  });

  it('should contain date library', async () => {
    let libraries = new Libraries([]);
    let path = new IdentifierPath(["Date"]);
    let date = libraries.getLibrary(path);
    expect(date).not.toBeNull();
    let func = date.getFunction("Now");
    expect(func).not.toBeNull();
    expect(func.getResultsType([])).toEqual(ValueType.date);
  });

  it('should contain number library', async () => {
    let libraries = new Libraries([]);
    let path = new IdentifierPath(["Number"]);
    let number = libraries.getLibrary(path);
    expect(number).not.toBeNull();
    let func = number.getFunction("Floor");
    expect(func).not.toBeNull();
    expect(func.getResultsType([])).toEqual(ValueType.number);
  });
});
