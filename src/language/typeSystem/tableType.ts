import type {IComponentNodeList} from "../componentNodeList";
import {ObjectType} from "./objects/objectType";
import {Table} from "../tables/table";
import {Type} from "./type";
import {TypeKind} from "./typeKind";
import {GeneratedType} from "./objects/generatedType";
import {GeneratedTypeSource} from "./objects/generatedTypeSource";
import {IObjectMember} from "./objects/objectMember";
import {ObjectVariable} from "./objects/objectVariable";
import {ObjectNestedType} from "./objects/objectNestedType";
import {ValueType} from "./valueType";
import {LookUpFunction} from "./functions/lookUpFunction";
import {LookUpRowFunction} from "./functions/lookUpRowFunction";

export function instanceOfTableType(object: any): object is TableType {
  return object?.typeKind == TypeKind.TableType;
}

export function asTableType(object: any): TableType | null {
  return instanceOfTableType(object) ? object as TableType : null;
}

export class TableType extends ObjectType {

  public readonly typeKind = TypeKind.TableType;
  public readonly table: Table;

  constructor(table: Table) {
    super(table.name);
    this.table = table;
  }

  override isAssignableFrom(type: Type): boolean {
    return this.equals(type);
  }

  public override equals(other: Type): boolean {
    return other != null && instanceOfTableType(other) && this.name == other.name;
  }


  protected override createMembers(): IObjectMember[] {

    const members: IObjectMember[] = [
      new ObjectVariable(Table.rowsCountName, ValueType.number),
      new ObjectNestedType(Table.rowName, this.table.getRowType())
    ];

    if (!!this.table.header?.columns) {
      for (let column of this.table.header?.columns) {
        let columnType = new GeneratedType(column.name, this.table, GeneratedTypeSource.TableColumn, []);
        members.push(new ObjectVariable(column.name, columnType ));
      }
    }

    members.push(new LookUpFunction(this.table));
    members.push(new LookUpRowFunction(this.table));

    return members;
  }
}
