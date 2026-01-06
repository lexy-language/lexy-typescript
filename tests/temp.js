"use strict";
__environment.function__CallSingleTypeArgumentWithTypeFunctionFunction = function function__CallSingleTypeArgumentWithTypeFunctionFunction() {
  function __validate(__parameters) {
    const validationErrors = [];
    __Parameters.__validate(null, __parameters, validationErrors);
    if (validationErrors.length > 0) {
      throw new Error("Validation failed: \n" + validationErrors.join("\n"));
    }
  }

  function __run(__parameters, __context) {
    const __result = new __Result();
    __context.setFileName("FunctionCallInlineArguments.lexy");
    __context.openScope("Execute: CallSingleTypeArgumentWithTypeFunctionFunction", 26);
    __context.log("Parameters", 26, __parameters);

    const __logLine28 = __context.log("  SimpleType params", 28, {});
    let params = new __environment.type__SimpleType();
    __logLine28.addVariables({['params']: params});

    const __logLine29 = __context.log("  params.ValueString = 'efg'", 29, {});
    params.ValueString = "efg";
    __logLine29.addVariables({['params.ValueString']: params.ValueString});

    const __logLine30 = __context.log("  params.ValueBoolean = true", 30, {});
    params.ValueBoolean = true;
    __logLine30.addVariables({['params.ValueBoolean']: params.ValueBoolean});

    const __logLine31 = __context.log("  params.ValueDate = d'2025-01-05T09:20:45'", 31, {});
    params.ValueDate = new Date("2025-01-05T09:20:45");
    __logLine31.addVariables({['params.ValueDate']: params.ValueDate});

    const __logLine32 = __context.log("  var result = SingleTypeArgumentWithTypeFunction(params)", 32, {['params']: params});
    let result = __environment.function__SingleTypeArgumentWithTypeFunction(params, __context);
    __logLine32.addVariables({['result']: result});

    const __logLine33 = __context.log("  Result = result", 33, {['result']: result});
    __result.Result = result;
    __logLine33.addVariables({['Result']: __result.Result});

    __context.log("Results",  26, __result);
    __context.closeScope();
    return __result;
  }

  function __inline(__run) {
    return function __inline(    __context) {
      const __parameters = new __run.__Parameters();
      return __run(__parameters, __context);
    }
  }

  class __Parameters {
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
    }
  }

  class __Result {
    Result = new __environment.function__SingleTypeArgumentWithTypeFunction.__Result();
    static __validate(name, value, validationErrors) {
      value = !!value ? value : {};
      __environment.function__SingleTypeArgumentWithTypeFunction.__Result.__validate(__environment.systemFunctions.identifierPath(name, "Result"), value["Result"], validationErrors);
    }
  }

  __run.__inline = __inline(__run);
  __run.__Parameters = __Parameters;
  __run.__Result = __Result;
  __run.__validate = __validate;
  return __run;
}();