import type {IParserLogger} from "../logging/parserLogger";

import {Type} from "../../language/typeSystem/type";
import {SourceReference} from "../../language/sourceReference";
import {IdentifierPath} from "../../language/identifierPath";
import {VariableSource} from "../../language/variableSource";
import {VariableReference} from "../../language/variableReference";
import {ComponentNodeList} from "../../language/componentNodeList";
import {asObjectType} from "../../language/typeSystem/objects/objectType";
import {VariableEntry} from "../../language/variableEntry";

export interface IVariableContext {
  addVariable(variableName: string, type: Type, source: VariableSource): void;

  registerVariableAndVerifyUnique(reference: SourceReference, variableName: string,
                                  type: Type | null, source: VariableSource): void;

  createVariableReference(reference: SourceReference, path: IdentifierPath): VariableReference | null;

  containsName(variableName: string): boolean;
  containsPath(path: IdentifierPath): boolean;

  getTypeByName(variableName: string): Type | null;
  getTypeByPath(identifierPath: IdentifierPath): Type | null;

  getVariable(variableName: string): VariableEntry | null;
}

export class VariableContext implements IVariableContext {

  private readonly index: Map<string, VariableEntry> = new Map();
  private readonly values: VariableEntry[] = [];
  private readonly logger: IParserLogger;
  private readonly componentNodes: ComponentNodeList;
  private readonly parentContext: IVariableContext | null;

  constructor(componentNodes: ComponentNodeList, logger: IParserLogger, parentContext: IVariableContext | null) {
    this.logger = logger;
    this.componentNodes = componentNodes;
    this.parentContext = parentContext;
  }

  public scopedVariables(): readonly VariableEntry[] {
    return this.values;
  }

  public addVariable(name: string, type: Type, source: VariableSource): void {
    if (this.containsName(name)) return;

    const entry = new VariableEntry(name, type, source)
    this.index.set(name, entry)
    this.values.push(entry);
  }

  public registerVariableAndVerifyUnique(reference: SourceReference, name: string,
                                         type: Type | null,
                                         source: VariableSource): void {
    if (this.containsName(name)) {
      this.logger.fail(reference, `Duplicated variable name: '${name}'.`);
      return;
    }

    if (type == null) {
      this.logger.fail(reference, `Variable: '${name}' has no type.`);
      return;
    }

    const entry = new VariableEntry(name, type, source, reference)
    this.index.set(name, entry)
    this.values.push(entry);
  }

  public containsName(name: string): boolean {
    return this.index.has(name) || (this.parentContext != null && this.parentContext.containsName(name));
  }

  public containsPath(path: IdentifierPath): boolean {
    let parent = this.getVariable(path.rootIdentifier);
    if (parent == null) return false;

    return !path.hasChildIdentifiers ||
      this.containsChild(parent.type, path.childrenPath());
  }

  public createVariableReference(reference: SourceReference, path: IdentifierPath): VariableReference | null {

    type CreateHandler = (source: SourceReference, path: IdentifierPath) => VariableReference | null;

    function executeWithPriority(firstPriorityHandler: CreateHandler, secondPriorityHandler: CreateHandler) {
      const value1 = firstPriorityHandler(reference, path);
      return value1 ?? secondPriorityHandler(reference, path);
    }

    const containsMemberAccess = path.parts > 1;
    const fromTypeSystem = this.createVariableReferenceFromTypeSystem.bind(this);
    const fromVariables = this.createVariableReferenceFromRegisteredVariables.bind(this);

    return containsMemberAccess
      ? executeWithPriority(fromTypeSystem, fromVariables)
      : executeWithPriority(fromVariables, fromTypeSystem);
  }

  private createVariableReferenceFromRegisteredVariables(reference: SourceReference, path: IdentifierPath) {
    const variable = this.getVariable(path.rootIdentifier);
    if (variable == null) return null;

    const type = this.getTypeByPath(path);
    return type == null
      ? null
      : new VariableReference(reference, path, null, type, variable.variableSource);
  }

  private createVariableReferenceFromTypeSystem(reference: SourceReference, path: IdentifierPath): VariableReference | null {

    if (path.parts > 2) return null;

    const componentType = this.componentNodes.getType(path.rootIdentifier);
    if (componentType == null) return null;

    if (path.parts == 1) {
      return new VariableReference(reference, path, componentType, componentType, VariableSource.Type);
    }

    const member = path.lastPart();
    let memberType = componentType.memberType(member);
    if (memberType == null) return null;

    return new VariableReference(reference, path, componentType, memberType, VariableSource.Type);
  }

  public getTypeByName(name: string): Type | null {
    const value = this.index.get(name);
    return value != undefined
      ? value.type
      : this.parentContext != null
        ? this.parentContext.getTypeByName(name)
        : null;
  }

  public getTypeByPath(path: IdentifierPath): Type | null {
    let parent = this.getTypeByName(path.rootIdentifier);
    return parent == null || !path.hasChildIdentifiers
      ? parent
      : this.getType(parent, path.childrenPath());
  }

  public getVariable(name: string): VariableEntry | null {
    const value = this.index.get(name);
    return value != undefined
      ? value
      : this.parentContext != null
        ? this.parentContext.getVariable(name)
        : null;
  }

  private containsChild(parentType: Type | null, path: IdentifierPath): boolean {

    let objectType = asObjectType(parentType);

    let memberType = objectType != null ? objectType.memberType(path.rootIdentifier) : null;
    if (memberType == null) return false;

    return !path.hasChildIdentifiers
        || this.containsChild(memberType, path.childrenPath());
  }

  private getType(parentType: Type, path: IdentifierPath): Type | null {

    let objectType = asObjectType(parentType);
    if (objectType == null) return null;

    let memberType = objectType.memberType(path.rootIdentifier);
    if (memberType == null) return null;

    return !path.hasChildIdentifiers
         ? memberType
         : this.getType(memberType, path.childrenPath());
  }
}
