const __environment = {};
__en
vironment.function__TestSimpleReturn = function function__TestSimpleReturn() {
  function __validateParameters(__parameters) {
    const validationErrors = [];
    __Parameters.__validate(__parameters, validationErrors);
    if (validationErrors.length > 0) {
      throw new Error("Validation failed: \n" + validationErrors.join("\n"));
    }
  }

  function __run(__parameters, __context) {
    __validateParameters(__parameters);

    const __result = new __Result();
    __result.Result = __parameters.Input;
    return __result;
  }

  class __Parameters {
    Input = 5;
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.systemFunctions.validateNumber("Input", value["Input"], false, validationErrors);
    }
  }

  class __Result {
    Result = 0;
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.systemFunctions.validateNumber("Result", value["Result"], true, validationErrors);
    }
  }

  __run.__Parameters = __Parameters;
  __run.__Result = __Result;
  return __run;
}();