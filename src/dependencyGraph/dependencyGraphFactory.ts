import {ComponentNodeList} from "../language/componentNodeList";
import {Dependencies} from "./dependencies";
import {IComponentNode} from "../language/componentNode";

export class DependencyGraphFactory {
  public static create(componentNodes: ComponentNodeList): Dependencies {
    let dependencies = new Dependencies(componentNodes);
    dependencies.build();
    return dependencies;
  }

  static nodeAndDependencies(componentNodes: ComponentNodeList, node: IComponentNode): Array<IComponentNode> {
    let dependencies = new Dependencies(componentNodes);
    dependencies.build();
    return dependencies.nodeAndDependencies(node);
  }
}
