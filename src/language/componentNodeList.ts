import type {IComponentNode} from "./componentNode";

import {ObjectType} from "./variableTypes/objectType";
import {asFunction, Function} from "./functions/function";
import {asTable, Table} from "./tables/table";
import {asEnumDefinition, EnumDefinition, instanceOfEnumDefinition} from "./enums/enumDefinition";
import {where} from "../infrastructure/arrayFunctions";
import {asTypeDefinition, TypeDefinition} from "./types/typeDefinition";
import {asScenario, instanceOfScenario, Scenario} from "./scenarios/scenario";
import {TableType} from "./variableTypes/tableType";
import {FunctionType} from "./variableTypes/functionType";
import {EnumType} from "./variableTypes/enumType";
import {DeclaredType} from "./variableTypes/declaredType";

export interface IComponentNodeList {

  readonly values: readonly IComponentNode[];

  getNode(name: string | null): IComponentNode | null;

  contains(name: string): boolean;

  getFunction(name: string): Function | null;

  getTable(name: string): Table | null;

  getDeclaredType(name: string): TypeDefinition | null;

  getScenarios(): Array<Scenario>;

  getEnum(name: string): EnumDefinition | null;

  getType(name: string): ObjectType | null;
}

export class ComponentNodeList implements IComponentNodeList {

  private readonly index: Map<string, IComponentNode> = new Map();
  private readonly valuesList: IComponentNode[];

  public get values(): readonly IComponentNode[] {
    return this.valuesList;
  }

  constructor(values: Array<IComponentNode> | null = null) {
    this.valuesList = values != null ? values : [];
    for (const valuesKey in this.values) {
      this.index.set(valuesKey, this.values[valuesKey]);
    }
  }

  public get length(): number {
    return this.values.length;
  }

  public add(componentNode: IComponentNode): void {
    this.valuesList.push(componentNode);
    this.index.set(componentNode.nodeName, componentNode);
  }

  public containsEnum(enumName: string): boolean {
    let component = this.index.get(enumName);
    return !!component && instanceOfEnumDefinition(component);
  }

  public getNode(name: string | null): IComponentNode | null {
    if (name == null) return null;
    let component = this.index.get(name);
    return !!component ? component : null;
  }

  public contains(name: string): boolean {
    return this.index.has(name);
  }

  public getFunction(name: string): Function | null {
    return asFunction(this.index.get(name));
  }

  public getTable(name: string): Table | null {
    return asTable(this.index.get(name));
  }

  public getDeclaredType(name: string): TypeDefinition | null {
    return asTypeDefinition(this.index.get(name));
  }

  public getScenarios(): Array<Scenario> {
    return where(this.values, value => instanceOfScenario(value))
      .map(value => asScenario(value) as Scenario);
  }

  public getEnum(name: string): EnumDefinition | null {
    return asEnumDefinition(this.index.get(name));
  }

  public addIfNew(node: IComponentNode): void {
    if (!this.index.has(node.nodeName)) {
      this.valuesList.push(node);
      this.index.set(node.nodeName, node);
    }
  }

  public getType(name: string): ObjectType | null {
    let node = this.getNode(name);

    let table = asTable(node);
    if (table != null) return new TableType(name, table);

    let functionValue = asFunction(node);
    if (functionValue != null) return new FunctionType(name, functionValue);

    let enumDefinition = asEnumDefinition(node);
    if (enumDefinition != null) return new EnumType(name, enumDefinition);

    let typeDefinition = asTypeDefinition(node);
    if (typeDefinition != null) return new DeclaredType(name, typeDefinition);

    return null;
  }
}
