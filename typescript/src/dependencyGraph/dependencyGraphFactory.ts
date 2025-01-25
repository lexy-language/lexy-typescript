import {RootNodeList} from "../language/rootNodeList";
import {Dependencies} from "./dependencies";
import {IRootNode} from "../language/rootNode";

export class DependencyGraphFactory {
  public static create(rootNodes: RootNodeList): Dependencies {
    let dependencies = new Dependencies(rootNodes);
    dependencies.build();
    return dependencies;
  }

  static nodeAndDependencies(rootNodes: RootNodeList, node: IRootNode): Array<IRootNode> {
    let dependencies = new Dependencies(rootNodes);
    dependencies.build();
    return dependencies.nodeAndDependencies(node);
  }
}
