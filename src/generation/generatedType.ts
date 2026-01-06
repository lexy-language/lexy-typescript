import type {IComponentNode} from "../language/componentNode";

export enum GeneratedTypeKind {
  Function = "Function",
  Enum = "Enum",
  Type = "Type",
  Table = "Table"
}

export class GeneratedType {
  public readonly kind: GeneratedTypeKind;
  public readonly node: IComponentNode;
  public readonly name: string;
  public readonly initializationFunction: string;

  constructor(kind: GeneratedTypeKind, node: IComponentNode, name: string, initializationFunction: string) {
    this.kind = kind;
    this.node = node;
    this.name = name;
    this.initializationFunction = initializationFunction;
  }
}
