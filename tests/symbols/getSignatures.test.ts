import {getSymbols} from "./getSymbols"
import {Verify} from "../verify"
import {Position} from "../../src/language/position"

describe('GetSignaturesTest', () => {

  it('function symbols', async () => {
    const code: string = `function Example
  parameters
    string Input
    number Input2

function Caller
  Example("a", 999)`;

    const result = await getSymbols(`test.lexy`, code, true);
    const signatures = result.symbols.getSignatures(result.file, new Position(7, 10));

    expect(signatures).not.toBeNull();

    Verify.collection(signatures.values, context => context
      .valueModel(0, child => child
        .areEqual(value => value.name, "Example")
        .collection(value => value.parameters, functionParameters => functionParameters
          .length(2, "functionParameters")
          .valueModel(0, parameter => parameter
            .areEqual(parameter => parameter.name, "Input")
          )
          .valueModel(1, parameter => parameter
            .areEqual(parameter => parameter.name, "Input2")
          )
        )
      )
    );
  });
});
