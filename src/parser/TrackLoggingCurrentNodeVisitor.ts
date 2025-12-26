import type {ITreeValidationVisitor} from "./ITreeValidationVisitor";
import type {IComponentNode} from "../language/componentNode";
import type {INode} from "../language/node";
import type {IParserLogger} from "./parserLogger";
import {Stack} from "../infrastructure/stack";
import {Assert} from "../infrastructure/assert";
import {asComponentNode, instanceOfComponentNode} from "../language/componentNode";

export class TrackLoggingCurrentNodeVisitor implements ITreeValidationVisitor {

  private nodeStack: Stack<IComponentNode> = new Stack<IComponentNode>()
  private logger: IParserLogger;

  constructor(logger: IParserLogger) {
    this.logger = Assert.notNull(logger, "logger");
  }

  public enter(node: INode) {

    const componentNode = asComponentNode(node)
    if (componentNode == null) return;

    this.addCurrentNodeToStack(componentNode);
    this.logger.setCurrentNode(componentNode);
  }

  public leave(node: INode) {
    if (!instanceOfComponentNode(node)) return;

    this.removeCurrentNodeFromStack();
    this.revertToPreviousNode();
  }

  private addCurrentNodeToStack(componentNode: IComponentNode) {
    this.nodeStack.push(componentNode);
  }

  private removeCurrentNodeFromStack() {
    this.nodeStack.pop();
  }

  private revertToPreviousNode() {
    const previousNode = this.nodeStack.peek();
    if (previousNode != null) {
      this.logger.setCurrentNode(previousNode);
    }
  }
}
