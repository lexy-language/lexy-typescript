import type {IComponentNode} from "./componentNode";

import {asObjectType, ObjectType} from "./typeSystem/objects/objectType";
import {asFunction, Function} from "./functions/function";
import {asTable, Table} from "./tables/table";
import {asEnumDefinition, EnumDefinition, instanceOfEnumDefinition} from "./enums/enumDefinition";
import {where} from "../infrastructure/arrayFunctions";
import {asTypeDefinition, TypeDefinition} from "./types/typeDefinition";
import {asScenario, instanceOfScenario, Scenario} from "./scenarios/scenario";
import {asNodeWithType} from "./nodeWithType";

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

  public get length(): number {
    return this.values.length;
  }

  constructor(values: Array<IComponentNode> | null = null) {
    this.valuesList = values != null ? values : [];
    for (const valuesKey in this.values) {
      this.index.set(valuesKey, this.values[valuesKey]);
    }
  }

  public add(componentNode: IComponentNode): void {
    this.valuesList.push(componentNode);
    if (componentNode.name != null) {
      this.index.set(componentNode.name, componentNode);
    }
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
    if (!this.index.has(node.name)) {
      this.valuesList.push(node);
      this.index.set(node.name, node);
    }
  }

  public getType(name: string): ObjectType | null {

    let node = this.getNode(name);
    let nodeWithType = asNodeWithType(node);
    return asObjectType(nodeWithType?.createType());
  }
}
