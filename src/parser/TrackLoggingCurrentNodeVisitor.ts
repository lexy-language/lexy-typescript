import type {ITreeValidationVisitor} from "./ITreeValidationVisitor";
import type {IRootNode} from "../language/rootNode";
import type {INode} from "../language/node";
import type {IParserLogger} from "./parserLogger";
import {Stack} from "../infrastructure/stack";
import {Assert} from "../infrastructure/assert";
import {asRootNode, instanceOfRootNode} from "../language/rootNode";

export class TrackLoggingCurrentNodeVisitor implements ITreeValidationVisitor {

  private nodeStack: Stack<IRootNode> = new Stack<IRootNode>()
  private logger: IParserLogger;

  constructor(logger: IParserLogger) {
    this.logger = Assert.notNull(logger, "logger");
  }

  public enter(node: INode) {

    const rootNode = asRootNode(node)
    if (rootNode == null) return;

    this.addCurrentNodeToStack(rootNode);
    this.logger.setCurrentNode(rootNode);
  }

  public leave(node: INode) {
    if (!instanceOfRootNode(node)) return;

    this.removeCurrentNodeFromStack();
    this.revertToPreviousNode();
  }

  private addCurrentNodeToStack(rootNode: IRootNode) {
    this.nodeStack.push(rootNode);
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
