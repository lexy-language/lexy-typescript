import {parseNodes} from "../../parseFunctions";
import {validateOfType} from "../../validateOfType";
import {asIfExpression, IfExpression} from "../../../src/language/expressions/ifExpression";
import {asAssignmentExpression, AssignmentExpression} from "../../../src/language/expressions/assignmentExpression";
import {Verify} from "../../verify";

describe('IfExpressionTests', () => {
  it('checkIfStatement', async () => {
    const code = `function If
  parameters
    boolean Evil
  results
    number Number
  number temp = 777
  if Evil
    temp = 666
  Number = temp`;

    const {nodes, logger} = await parseNodes(code);

    logger.assertNoErrors();

    const functionNode = nodes.getFunction("If");

    Verify.model(functionNode, context => context
      .isNotNull(value => value, valueContext => valueContext
        .collection(value => value.code.expressions, expressionsContext => expressionsContext
          .length(3, "value.Code.Expressions")
          .valueModelOfType<IfExpression>(1, "IfExpression", asIfExpression, ifExpressionContext => ifExpressionContext
            .collection(value => value.trueExpressions, trueExpressionContext => trueExpressionContext
              .length(1, "value.TrueExpressions")
              .valueModelOfType<AssignmentExpression>(0, "AssignmentExpression", asAssignmentExpression, assignmentExpression => assignmentExpression
                .areEqual(assignment => assignment.toString(), "temp = 666")
              )
            )
          )
        )
      )
    );
  });
});
