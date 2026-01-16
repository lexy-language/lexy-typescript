export function instanceOfNestedNode(object: any): object is INestedNode {
  return object?.isNestedNode == true;
}

export function asNestedNode(object: any): INestedNode | null {
  return instanceOfNestedNode(object) ? object as INestedNode : null;
}

export interface INestedNode {
  isNestedNode: true;
  nested: boolean;
}
