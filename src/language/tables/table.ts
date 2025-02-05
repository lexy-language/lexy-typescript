import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/validationContext";

import {RootNode} from "../rootNode";
import {TableName} from "./tableName";
import {TableHeader} from "./tableHeader";
import {TableRow} from "./tableRow";
import {SourceReference} from "../../parser/sourceReference";
import {ComplexType} from "../variableTypes/complexType";
import {ComplexTypeMember} from "../variableTypes/complexTypeMember";
import {NodeType} from "../nodeType";
import {ComplexTypeSource} from "../variableTypes/complexTypeSource";

export function instanceOfTable(object: any) {
  return object?.nodeType == NodeType.Table;
}

export function asTable(object: any): Table | null {
  return instanceOfTable(object) ? object as Table : null;
}

export class Table extends RootNode {

  private invalidHeader: boolean = false;

  private rowsValue: Array<TableRow> = [];
  private headerValue: TableHeader | null = null;

  public static readonly rowName: string = `Row`;

  public readonly nodeType = NodeType.Table;
  public readonly name: TableName = new TableName();

  public get header(): TableHeader | null {
    return this.headerValue;
  }

  get rows(): Array<TableRow> {
    return this.rowsValue;
  }

  public override get nodeName() {
    return this.name.value;
  }

  constructor(name: string, reference: SourceReference) {
    super(reference);
    this.name.parseName(name);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    if (this.invalidHeader) return this;

    if (this.headerValue == null) {
      this.headerValue = TableHeader.parse(context);
      if (this.headerValue == null){
        this.invalidHeader = true;
      }
      return this;
    }

    const tableRow = TableRow.parse(context, this.headerValue);
    if (tableRow != null) {
      this.rows.push(tableRow);
    }
    return this;
  }

  public override getChildren(): Array<INode> {
    if (this.header != null) {
      return [this.header, ...this.rows];
    } else {
      return [...this.rows];
    }
  }

  protected override validate(context: IValidationContext): void {
    if (this.header == null) {
      context.logger.fail(this.reference, "No tableName header found.");
    }
  }

  public override validateTree(context: IValidationContext): void {
    const scope = context.createVariableScope();
    try {
      super.validateTree(context);
    } finally {
      scope[Symbol.dispose]();
    }
  }

  public getRowType(): ComplexType {
    if (this.header == null) throw new Error("Header not set.");
    const members = this.header.columns.map(column => {
      const type = column.type.variableType;
      return new ComplexTypeMember(column.name, type)
    });

    return new ComplexType(this.name.value, this, ComplexTypeSource.TableRow, members);
  }
}
