import {ObjectType} from "./objectType";
import {Table} from "../tables/table";
import {VariableType} from "./variableType";
import {PrimitiveType} from "./primitiveType";
import {VariableTypeName} from "./variableTypeName";
import {GeneratedType} from "./generatedType";
import {GeneratedTypeSource} from "./generatedTypeSource";
import {IComponentNodeList} from "../componentNodeList";
import {LookUpFunction} from "./functions/lookUpFunction";
import {LookUpRowFunction} from "./functions/lookUpRowFunction";
import {IObjectTypeFunction} from "./objectTypeFunction";
import {IObjectTypeVariable} from "./objectTypeVariable";

export function instanceOfTableType(object: any): object is TableType {
  return object?.variableTypeName == VariableTypeName.TableType;
}

export function asTableType(object: any): TableType | null {
  return instanceOfTableType(object) ? object as TableType : null;
}

export class TableType extends ObjectType {

  public readonly variableTypeName = VariableTypeName.TableType;
  public readonly tableName: string;
  public readonly table: Table;

  constructor(tableName: string, table: Table) {
    super();
    this.tableName = tableName;
    this.table = table;
  }

  override isAssignableFrom(type: VariableType): boolean {
    return this.equals(type);
  }

  public override memberType(name: string, componentNodes: IComponentNodeList): VariableType | null {

    if (name == Table.countName) return PrimitiveType.number;
    if (name == Table.rowName) return this.tableRowType(componentNodes);
    return this.tableColumnType(name);
  }

  public override getVariable(name: string): IObjectTypeVariable | null {
    return null;
  }

  public override getFunction(name: string): IObjectTypeFunction | null {
    switch (name) {
      case LookUpFunction.functionName:
        return new LookUpFunction(this.table);
      case LookUpRowFunction.functionName:
        return new LookUpRowFunction(this.table);
    }
    return null;
  }

  private tableRowType(componentNodes: IComponentNodeList): GeneratedType | null {
    let generatedType = componentNodes.getTable(this.tableName)?.getRowType();
    return !!generatedType ? generatedType : null;
  }


  public override equals(other: VariableType): boolean {
    return other != null && instanceOfTableType(other) && this.tableName == other.tableName;
  }

  public toString(): string {
    return this.tableName;
  }

  private tableColumnType(name: string) {
    if (this.table.header?.getColumn(name) != null) {
      return new GeneratedType(name, this.table, GeneratedTypeSource.TableColumn, []);
    }
    return null;
  }
}
