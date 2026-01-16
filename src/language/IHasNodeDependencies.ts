import type {IComponentNode} from "./componentNode";
import type {IComponentNodeList} from "./componentNodeList";
import type {INode} from "./node";

export function instanceOfHasNodeDependencies(object: any): object is IHasNodeDependencies {
   return object?.hasNodeDependencies == true;
}

export function asHasNodeDependencies(object: any): IHasNodeDependencies | null {
   return instanceOfHasNodeDependencies(object) ? object as IHasNodeDependencies : null;
}

export interface IHasNodeDependencies extends INode {
   hasNodeDependencies: true;
   getDependencies(componentNodes: IComponentNodeList): ReadonlyArray<IComponentNode>;
}
