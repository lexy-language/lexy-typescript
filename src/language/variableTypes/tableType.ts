import type {IValidationContext} from "../../parser/validationContext";

import {TypeWithMembers} from "./typeWithMembers";
import {Table} from "../tables/table";
import {VariableType} from "./variableType";
import {PrimitiveType} from "./primitiveType";
import {VariableTypeName} from "./variableTypeName";
import {ComplexType} from "./complexType";
import {ComplexTypeSource} from "./complexTypeSource";
import {IComponentNodeList} from "../componentNodeList";

export function instanceOfTableType(object: any): object is TableType {
  return object?.variableTypeName == VariableTypeName.TableType;
}

export function asTableType(object: any): TableType | null {
  return instanceOfTableType(object) ? object as TableType : null;
}

export class TableType extends TypeWithMembers {

  public readonly variableTypeName = VariableTypeName.TableType;
  public readonly tableName: string;
  public readonly table: Table;

  constructor(tableName: string, table: Table) {
    super();
    this.tableName = tableName;
    this.table = table;
  }

  public override equals(other: VariableType): boolean {
    return other != null && instanceOfTableType(other) && this.tableName == other.tableName;
  }

  public toString(): string {
    return this.tableName;
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {

    if (name == `Count`) return PrimitiveType.number;
    if (name == Table.rowName) return this.tableRowType(componentNodes);
    if (this.table.header?.getColumn(name) != null) return new ComplexType(name, this.table, ComplexTypeSource.TableColumn, []);
    return null;
  }

  private tableRowType(componentNodes: IComponentNodeList): ComplexType | null {
    let complexType = componentNodes.getTable(this.tableName)?.getRowType();
    return !!complexType ? complexType : null;
  }
}
