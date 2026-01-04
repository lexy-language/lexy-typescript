import {DateLibrary} from "../../src/runTime/libraries/dateLibrary";

describe('builtInDateFunctions', () => {
  it("today", async () => {
    const today = DateLibrary.functions.Today();
    expect(today.getFullYear()).toBe(new Date().getFullYear());
    expect(today.getMonth()).toBe(new Date().getMonth());
    expect(today.getDate()).toBe(new Date().getDate());
  });
});