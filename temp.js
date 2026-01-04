"use strict";
__environment.function__LookUpNumberFunction = function function__LookUpNumberFunction() {
  function __validate(__parameters) {
    const validationErrors = [];
    __Parameters.__validate(null, __parameters, validationErrors);
    if (validationErrors.length > 0) {
      throw new Error("Validation failed: \n" + validationErrors.join("\n"));
    }
  }

  function __run(__parameters, __context) {
    const __result = new __Result();
    __context.setFileName("LookupByDiscriminator.lexy");
    __context.openScope("Execute: LookUpNumberFunction", 8);
    __context.log("Parameters", 8, __parameters);

    const __logLine13 = __context.log("Result = StringTable.LookUp(Discriminator, Value, StringTable.Discriminator, StringTable.SearchValue, StringTable.ResultNumber)", 13, {['Discriminator']: __parameters.Discriminator, ['Value']: __parameters.Value, ['StringTable.Discriminator']: __environment.table__StringTable.Discriminator, ['StringTable.SearchValue']: __environment.table__StringTable.SearchValue, ['StringTable.ResultNumber']: __environment.table__StringTable.ResultNumber});
    __result.Result = __environment.tableLibrary.lookUpBy("Discriminator", __parameters.Discriminator, "SearchValue", __parameters.Value, "StringTable", __environment.table__StringTable.__values, "ResultNumber", __context);
    __logLine13.addVariables({['Result']: __result.Result});

    __context.log("Results",  8, __result);
    __context.closeScope();
    return __result;
  }

  class __Parameters {
    Discriminator = "";
    Value = "";
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.validate.string(__environment.systemFunctions.identifierPath(name, "Discriminator"), value["Discriminator"], false, validationErrors);
      __environment.validate.string(__environment.systemFunctions.identifierPath(name, "Value"), value["Value"], false, validationErrors);
    }
  }

  class __Result {
    Result = __environment.Decimal(0);
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.validate.number(__environment.systemFunctions.identifierPath(name, "Result"), value["Result"], false, validationErrors);
    }
  }

  __run.__Parameters = __Parameters;
  __run.__Result = __Result;
  __run.__validate = __validate;
  return __run;
}();