import {SourceReference} from "../../parser/sourceReference";
import {NodeType} from "../nodeType";
import {ErrorsNode} from "./errorsNode";

export class ExpectExecutionErrors extends ErrorsNode {

  public nodeType: NodeType = NodeType.ScenarioExpectExecutionErrors;

  constructor(reference: SourceReference) {
    super(reference);
  }
}