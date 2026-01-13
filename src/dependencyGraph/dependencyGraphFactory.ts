import type {IComponentNodeList} from "../language/componentNodeList";
import {Dependencies} from "./dependencies";

export class DependencyGraphFactory {
  public static create(componentNodes: IComponentNodeList): Dependencies {
    let dependencies = new Dependencies(componentNodes);
    dependencies.build();
    return dependencies;
  }
}
