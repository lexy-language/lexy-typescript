import type {IRootNode} from "../language/rootNode";

export enum GeneratedTypeKind {
  Function = "Function",
  Enum = "Enum",
  Type = "Type",
  Table = "Table"
}

export class GeneratedType {
  public readonly kind: GeneratedTypeKind;
  public readonly node: IRootNode;
  public readonly name: string;
  public readonly initializationFunction: string;

  constructor(kind: GeneratedTypeKind, node: IRootNode, name: string, initializationFunction: string) {
    this.kind = kind;
    this.node = node;
    this.name = name;
    this.initializationFunction = initializationFunction;
  }
}
