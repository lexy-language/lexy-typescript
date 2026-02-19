import {parseNodes} from "../../parseFunctions";
import {validateOfType} from "../../validateOfType";
import {asSwitchExpression, SwitchExpression} from "../../../src/language/expressions/switchExpression";
import {Verify} from "../../verify";
import {CaseExpression} from "../../../src/language/expressions/caseExpression";
import {VerifyModelContext} from "../../verifyModelContext";

describe('SwitchExpressionTests', () => {
  it('checkSwitchStatement', async () => {
    const code = `function NumberSwitch
  parameters
    number Evil
  results
    number Number
  number temp = 555
  switch Evil
    case 6
      temp = 666
    case 7
      temp = 777
    default
      temp = 888
  Number = temp`;

    const {nodes, logger} = await parseNodes(code);

    logger.assertNoErrors();

    const functionNode = nodes.getFunction("NumberSwitch");

    Verify.model(functionNode, context => context
      .collection(value => value.code.expressions, expressionContext => expressionContext
        .length(3, "value.Code.Expressions")
        .valueModelOfType<SwitchExpression>(1, "SwitchExpression", asSwitchExpression, switchExpression => switchExpression
          .collection(expression => expression.cases, casesContext => casesContext
            .length(3, "value.Code.Expressions[1].Cases")
            .valueModel(0, checkCase("number: 6", "temp = 666"))
            .valueModel(1, checkCase("number: 7", "temp = 777"))
            .valueModel(2, checkCase(null, "temp = 888"))
          )
        )
      )
    );
  });

  function checkCase(literal: string, assignment: string): (context: VerifyModelContext<CaseExpression>) => void {
    return context => context
      .areEqual(value => value.value != null ? value.value.toString() : null, literal)
      .collection(value => value.expressions, expressionContext => expressionContext
        .valueAt(0, value => value != null && value.toString() == assignment)
      );
  }
});
