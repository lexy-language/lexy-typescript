import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {ErrorsNode} from "./errorsNode";
import {Scenario} from "./scenario";
import {NodeReference} from "../nodeReference";

export class ExpectExecutionErrors extends ErrorsNode {

  public nodeType: NodeType = NodeType.ScenarioExpectExecutionErrors;

  constructor(scenario: Scenario, reference: SourceReference) {
    super(new NodeReference(scenario), reference);
  }
}
