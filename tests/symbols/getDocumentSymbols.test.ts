import {getSymbols} from "./getSymbols"
import {Verify} from "../verify"

describe('GetDocumentSymbolsTest', () => {

  it('function symbols', async () => {
    const code: string = `function Name
  var value1 = 5
  val`;

    const result = await getSymbols(`test.lexy`, code, true);
    const symbols = result.symbols.getSymbols(result.file);

    Verify.collection(symbols, context => context
      .valueModel(0, child => child
        .areEqual(value => value.name, "function: Name")
        .areEqual(value => value.children.length, 4)
      )
    );
  });

  it('function parameters symbols', async () => {
    const code: string = `function Name
  parameters
    string Test1
    string Test2`;

    const result = await getSymbols(`test.lexy`, code, true);
    const symbols = result.symbols.getSymbols(result.file);

    Verify.collection(symbols, context => context
      .valueModel(0, child => child
        .areEqual(value => value.name, "function: Name")
        .areEqual(value => value.children.length, 1)
        .collection(value => value.children, functionChildren => functionChildren
          .valueModel(0, parameters => parameters
            .collection(value => value.children, parametersChildren => parametersChildren
              .valueAt(0, parameter => parameter.name == "parameter: string Test1")
              .valueAt(1, parameter => parameter.name == "parameter: string Test2")
            )
          )
        )
      )
    );
  });
});
