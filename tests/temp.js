"use strict";
__environment.function__TableRowAsResultsFunction = function function__TableRowAsResultsFunction() {
  function __validate(__parameters) {
    const validationErrors = [];
    __Parameters.__validate(null, __parameters, validationErrors);
    if (validationErrors.length > 0) {
      throw new Error("Validation failed: \n" + validationErrors.join("\n"));
    }
  }

  function __run(__parameters, __context) {
    const __result = new __Result();
    __context.setFileName("ComplexVariables.lexy");
    __context.openScope("Execute: TableRowAsResultsFunction", 6);
    __context.log("Parameters", 6, __parameters);

    const __logLine9 = __context.log("Result = SimpleTable.LookUpRow(2, SimpleTable.Search)", 9, {['SimpleTable.Search']: __environment.table__SimpleTable.Search});
    __result.Result = __environment.tableLibrary.lookUp("Search", __environment.Decimal(2), "SimpleTable", __environment.table__SimpleTable.__values, "undefined", __context);
    __logLine9.addVariables({['Result']: __result.Result});

    __context.log("Results",  6, __result);
    __context.closeScope();
    return __result;
  }

  class __Parameters {
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
    }
  }

  class __Result {
    Result = new __environment.table__SimpleTable.__Row();
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.table__SimpleTable.__Row.__validate(__environment.systemFunctions.identifierPath(name, "Result"), value["Result"], validationErrors);
    }
  }

  __run.__Parameters = __Parameters;
  __run.__Result = __Result;
  __run.__validate = __validate;
  return __run;
}();