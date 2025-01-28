import {SourceReference} from "../../parser/sourceReference";
import {NodeType} from "../nodeType";
import {ErrorsNode} from "./errorsNode";

export class ExpectErrors extends ErrorsNode {

  public nodeType: NodeType = NodeType.ScenarioExpectErrors;

  constructor(reference: SourceReference) {
    super(reference);
  }
}