import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {INodeWithType} from "../nodeWithType";

import {ComponentNode} from "../componentNode";
import {TableHeader} from "./tableHeader";
import {TableRow} from "./tableRow";
import {SourceReference} from "../sourceReference";
import {GeneratedType} from "../typeSystem/objects/generatedType";
import {NodeType} from "../nodeType";
import {GeneratedTypeSource} from "../typeSystem/objects/generatedTypeSource";
import {ObjectVariable} from "../typeSystem/objects/objectVariable";
import {TableType} from "../typeSystem/tableType";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

export function instanceOfTable(object: any) {
  return object?.nodeType == NodeType.Table;
}

export function asTable(object: any): Table | null {
  return instanceOfTable(object) ? object as Table : null;
}

export class Table extends ComponentNode implements INodeWithType {

  private invalidHeader: boolean = false;

  private rowsValue: Array<TableRow> = [];
  private headerValue: TableHeader | null = null;

  public static readonly rowsCountName: string = `RowsCount`;
  public static readonly rowName: string = `Row`;

  public readonly nodeType = NodeType.Table;
  public readonly isNodeWithType = true;

  public get header(): TableHeader | null {
    return this.headerValue;
  }

  get rows(): Array<TableRow> {
    return this.rowsValue;
  }

  constructor(name: string, parentReference: NodeReference, reference: SourceReference) {
    super(name, parentReference, reference);
  }

  public createType() {
    return new TableType(this);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    if (this.invalidHeader) return this;

    if (this.headerValue == null) {
      this.headerValue = TableHeader.parse(context, this);
      if (this.headerValue == null){
        this.invalidHeader = true;
      }
      return this;
    }

    const tableRow = TableRow.parse(context, this);
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
      context.logger.fail(this.reference, "No table header found.");
    }
  }

  public override validateTree(context: IValidationContext): void {
    context.inNodeVariableScope(this, super.validateTree.bind(this));
  }

  public getRowType(): GeneratedType {
    if (this.header == null) throw new Error("Header not set.");
    const members = this.header.columns.map(column => {
      const type = column.typeDeclaration.type;
      return new ObjectVariable(column.name, type)
    });

    return new GeneratedType(this.name, Table.rowName, this, GeneratedTypeSource.TableRow, members);
  }

  public override getSymbol(): Symbol | null {

    if (this.header == null) return null;

    const builder: string[] = [];
    for (const column of this.header.columns) {
      if (builder.length > 0) {
        builder.push("\n");
      }
      builder.push(`- ${column.typeDeclaration} ${column.name}`);
    }
    const variablesString = builder.join("");
    return new Symbol(this.reference, `table: ${this.name}`, variablesString, SymbolKind.Table);
  }
}
