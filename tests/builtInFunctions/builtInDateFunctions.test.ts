import {BuiltInDateFunctions} from "../../src/runTime/builtInDateFunctions";

describe('builtInDateFunctions', () => {
  it("today", async () => {
    const today = BuiltInDateFunctions.today();
    expect(today.getFullYear()).toBe(new Date().getFullYear());
    expect(today.getMonth()).toBe(new Date().getMonth());
    expect(today.getDate()).toBe(new Date().getDate());
  });
});