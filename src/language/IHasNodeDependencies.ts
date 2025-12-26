import type {IComponentNode} from "./componentNode";
import type {IComponentNodeList} from "./componentNodeList";

export function instanceOfHasNodeDependencies(object: any): object is IHasNodeDependencies {
   return object?.hasNodeDependencies == true;
}

export function asHasNodeDependencies(object: any): IHasNodeDependencies | null {
   return instanceOfHasNodeDependencies(object) ? object as IHasNodeDependencies : null;
}

export interface IHasNodeDependencies {
   hasNodeDependencies: true;
   getDependencies(componentNodeList: IComponentNodeList): ReadonlyArray<IComponentNode>;
}
