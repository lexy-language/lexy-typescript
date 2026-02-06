import {Verify} from "../verify";
import {Position} from "../../src/language/position";
import {asFunction} from "../../src/language/functions/function";
import {instanceOfImplicitTypeDeclaration} from "../../src/language/typeSystem/declarations/implicitTypeDeclaration";
import {instanceOfVariableDeclarationExpression} from "../../src/language/expressions/variableDeclarationExpression";
import {instanceOfFunctionResults} from "../../src/language/functions/functionResults";
import {instanceOfFunctionParameters} from "../../src/language/functions/functionParameters";
import {instanceOfFunctionCode} from "../../src/language/functions/functionCode";
import {getSymbols} from "./getSymbols";

const twoFunctionCode = `function Example
  parameters
    number Value1
    number Value2
  results
    number Result1
    number Result2
  var a = 2 + 3
  var b = 4 + 5
  Result1 = a + b

function Example2
  parameters
    number Value3
    number Value4
  results
    number Result5
    number Result6
  var a2 = 22 + 23
  var b2 = 24 + 25
  Result5 = a2 + b2
`;

describe('GetDocumentNodesInScopeTests', () => {
  it('functionNodes', async () => {
    const symbols = await getSymbols("test.lexy", twoFunctionCode, true);
    const documentSymbols = symbols.symbols.document("test.lexy");

    const nodes = documentSymbols.getNodesInScope(new Position(8, 4));
    Verify.collection(nodes, _ => _
      .length(6, "nodes.length")
      .valueAt(0, node => {
        const functionNode = asFunction(node.value);
        return functionNode != null && functionNode.name == "Example";
      })
      .valueAt(1, node => instanceOfFunctionParameters(node.value))
      .valueAt(2, node => instanceOfFunctionResults(node.value))
      .valueAt(3, node => instanceOfFunctionCode(node.value))
      .valueAt(4, node => instanceOfVariableDeclarationExpression(node.value))
      .valueAt(5, node => instanceOfImplicitTypeDeclaration(node.value))
      .valueAt(0, node => node.level == 0)
      .valueAt(1, node => node.level == 1)
      .valueAt(2, node => node.level == 1)
      .valueAt(3, node => node.level == 1)
      .valueAt(4, node => node.level == 2)
      .valueAt(5, node => node.level == 3)
    );
  });

  it('secondFunctionKeyword', async () => {
    const symbols = await getSymbols("test.lexy", twoFunctionCode, true);
    const documentSymbols = symbols.symbols.document("test.lexy");

    const nodes = documentSymbols.getNodesInScope(new Position(20, 4));
    Verify.collection(nodes, _ => _
      .length(7, "nodes.length")
      .valueAt(0, node => {
        const functionNode = asFunction(node.value);
        return functionNode != null && functionNode.name == "Example2";
      })
      .valueAt(1, node => instanceOfFunctionParameters(node.value))
      .valueAt(2, node => instanceOfFunctionResults(node.value))
      .valueAt(3, node => instanceOfFunctionCode(node.value))
      .valueAt(4, node => instanceOfVariableDeclarationExpression(node.value))
      .valueAt(5, node => instanceOfVariableDeclarationExpression(node.value))
      .valueAt(6, node => instanceOfImplicitTypeDeclaration(node.value))
      .valueAt(0, node => node.level == 0)
      .valueAt(1, node => node.level == 1)
      .valueAt(2, node => node.level == 1)
      .valueAt(3, node => node.level == 1)
      .valueAt(4, node => node.level == 2)
      .valueAt(5, node => node.level == 2)
      .valueAt(6, node => node.level == 3)
    );
  });
});
