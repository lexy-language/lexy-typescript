"use strict";
__environment.function__CallSimpleFunctionImplicitParametersFunction = function function__CallSimpleFunctionImplicitParametersFunction() {
  function __validate(__parameters) {
    const validationErrors = [];
    __Parameters.__validate(null, __parameters, validationErrors);
    if (validationErrors.length > 0) {
      throw new Error("Validation failed: \n" + validationErrors.join("\n"));
    }
  }

  function __run(__parameters, __context) {
    const __result = new __Result();
    __context.setFileName("FunctionCall.lexy");
    __context.openScope("Execute: CallSimpleFunctionImplicitParametersFunction", 9);
    __context.log("Parameters", 9, __parameters);

    const __logLine13 = __context.log("  SimpleFunction()", 13, {});
    const __parameters_16 = new __environment.function__SimpleFunction.__Parameters();
    let __result_16 = __environment.function__SimpleFunction(__parameters_16, __context);
    __logLine13.addVariables({});

    __context.log("Results",  9, __result);
    __context.closeScope();
    return __result;
  }

  function __inline(__run) {
    return function __inline(Value,     __context) {
      const __parameters = new __run.__Parameters();
      __parameters.Value = Value;
      return __run(__parameters, __context);
    }
  }

  class __Parameters {
    Value = __environment.Decimal(0);
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.validate.number(__environment.systemFunctions.identifierPath(name, "Value"), value["Value"], false, validationErrors);
    }
  }

  class __Result {
    Result = __environment.Decimal(0);
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.validate.number(__environment.systemFunctions.identifierPath(name, "Result"), value["Result"], false, validationErrors);
    }
  }

  __run.__inline = __inline(__run);
  __run.__Parameters = __Parameters;
  __run.__Result = __Result;
  __run.__validate = __validate;
  return __run;
}();

