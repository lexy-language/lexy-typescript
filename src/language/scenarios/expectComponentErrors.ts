import {SourceReference} from "../../parser/sourceReference";
import {NodeType} from "../nodeType";
import {ErrorsNode} from "./errorsNode";

export class ExpectComponentErrors extends ErrorsNode {

  public nodeType: NodeType = NodeType.ScenarioExpectComponentErrors;

  constructor(reference: SourceReference) {
    super(reference);
  }
}