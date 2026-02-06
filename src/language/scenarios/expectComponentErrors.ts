import {SourceReference} from "../sourceReference";
import {NodeType} from "../nodeType";
import {ErrorsNode} from "./errorsNode";
import {NodeReference} from "../nodeReference";
import {Scenario} from "./scenario";

export class ExpectComponentErrors extends ErrorsNode {

  public nodeType: NodeType = NodeType.ScenarioExpectComponentErrors;

  constructor(scenario: Scenario, reference: SourceReference) {
    super(new NodeReference(scenario), reference);
  }
}
