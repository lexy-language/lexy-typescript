import {RootNodeList} from "../language/rootNodeList";
import {Dependencies} from "./dependencies";

export class DependencyGraphFactory {
   public static create(rootNodes: RootNodeList): Dependencies {
     let dependencies = new Dependencies(rootNodes);
     dependencies.build();
     return dependencies;
   }
}
