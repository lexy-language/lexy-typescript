import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";

import {ObjectType} from "./objects/objectType";
import {EnumDefinition} from "../enums/enumDefinition";
import {Type} from "./type";
import {firstOrDefault} from "../../infrastructure/arrayFunctions";
import {TypeKind} from "./typeKind";
import {ObjectVariable} from "./objects/objectVariable";
import {IObjectMember} from "./objects/objectMember";
import {SourceReference} from "../sourceReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";
import {IHasNodeDependencies} from "../IHasNodeDependencies";
import {Assert} from "../../infrastructure/assert";

export function instanceOfTableColumnType(object: any): object is TableColumnType {
  return object?.typeKind == TypeKind.TableColumnType;
}

export function asTableColumnType(object: any): TableColumnType | null {
  return instanceOfTableColumnType(object) ? object as TableColumnType : null;
}

export class TableColumnType extends Type implements IHasNodeDependencies {

  private readonly node: IComponentNode;

  public readonly typeKind = TypeKind.TableColumnType;
  public readonly hasNodeDependencies = true;

  public readonly typeName: string
  public readonly memberName: string
  public readonly name: string;

  constructor(typeName: string, memberName: string, node: IComponentNode) {
    super();
    this.typeName = typeName;
    this.memberName = memberName;
    this.name = `${typeName}.${memberName}`;
    this.node = Assert.notNull(node, "node");
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    return [this.node];
  }

  public override isAssignableFrom(type: Type): boolean {
    return this.equals(type);
  }

  override equals(other: Type | null): boolean {
    let tableColumnType = asTableColumnType(other);
    return tableColumnType != null && tableColumnType.name == this.name;
  }

  public override getSymbol(reference: SourceReference): Symbol {
    return new Symbol(reference, `table column: ${this.name}`, "", SymbolKind.TableColumn);
  }

  public override toString(): string  {
    return this.name;
  }
}
