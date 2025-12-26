import {compileFunction} from "../compiler/compileFunction";
import {ExecutableFunction} from "../../src/compiler/executableFunction";
import {ExecutionLogEntry} from "../../src/runTime/executionLogEntry";
import {LexyCodeConstants} from "../../src/compiler/javaScript/lexyCodeConstants";

describe('executionLogging', () => {

  function walkLogging(logging: ReadonlyArray<ExecutionLogEntry>, handler: (log: ExecutionLogEntry) => void) {
    for (const log of logging) {
      handler(log);
      walkLogging(log.entries, handler);
    }
  }

  function expectNoTableValuesProperty(script: ExecutableFunction) {
    let result = script.run();
    walkLogging(result.logging, log => {
      console.log(JSON.stringify(log))
      const table = log.readVariables[LexyCodeConstants.valuesVariable];
      if (table != null) {
        const values = table["__values"];
        if (values != null) {
          throw new Error("Table values should not be stored:" + JSON.stringify(values))
        }
      }
    })
  }

  it('tableVariablesShouldNotStoreFullTableInLogging', async () => {
    let script = compileFunction(`table SimpleTable
// Validate table keywords
  | number Search | number Value |
  | 0 | 0 |
  | 1 | 1 |

function ValidateTableKeywordFunction
// Validate table keywords
  parameters
  results
    number Result
  Result = LOOKUP(SimpleTable, 2, SimpleTable.Search, SimpleTable.Value)`);

    expectNoTableValuesProperty(script);
  });

  it('tableVariablesShouldNotStoreFullTableInLoggingRow', async () => {
    let script = compileFunction(`table SimpleTable
// Validate table keywords
  | number Search | number Value | string Extra |
  | 0 | 0 | "ext" |
  | 1 | 1 | "ra"  | 

function ValidateTableKeywordFunction
// Validate table keywords
  parameters
  results
    SimpleTable.Row Result
  Result = LOOKUPROW(SimpleTable, 2, SimpleTable.Search)`);

    expectNoTableValuesProperty(script);
  });
});
