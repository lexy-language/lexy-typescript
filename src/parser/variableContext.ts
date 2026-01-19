import type {IParserLogger} from "./parserLogger";

import {Type} from "../language/typeSystem/type";
import {SourceReference} from "./sourceReference";
import {VariableEntry} from "./variableEntry";
import {IdentifierPath} from "../language/identifierPath";
import {VariableSource} from "../language/variableSource";
import {VariableReference} from "../language/variableReference";
import {ComponentNodeList} from "../language/componentNodeList";
import {asObjectType} from "../language/typeSystem/objects/objectType";

export interface IVariableContext {
  addVariable(variableName: string, type: Type, source: VariableSource): void;

  registerVariableAndVerifyUnique(reference: SourceReference, variableName: string,
                                  type: Type | null, source: VariableSource): void;

  containsName(variableName: string): boolean;

  containsPath(path: IdentifierPath): boolean;

  getTypeByName(variableName: string): Type | null;

  getTypeByPath(identifierPath: IdentifierPath): Type | null;

  getVariable(variableName: string): VariableEntry | null;

  createVariableReference(reference: SourceReference, path: IdentifierPath): VariableReference | null;
}

export class VariableContext implements IVariableContext {
  private readonly logger: IParserLogger;
  private readonly componentNodes: ComponentNodeList;
  private readonly parentContext: IVariableContext | null;
  private readonly variables: { [id: string]: VariableEntry; } = {};

  constructor(componentNodes: ComponentNodeList, logger: IParserLogger, parentContext: IVariableContext | null) {
    this.logger = logger;
    this.componentNodes = componentNodes;
    this.parentContext = parentContext;
  }

  public addVariable(name: string, type: Type, source: VariableSource): void {
    if (this.containsName(name)) return;

    this.variables[name] = new VariableEntry(type, source);
  }

  public registerVariableAndVerifyUnique(reference: SourceReference, name: string, type: Type | null,
                                         source: VariableSource): void {
    if (this.containsName(name)) {
      this.logger.fail(reference, `Duplicated variable name: '${name}'`);
      return;
    }

    this.variables[name] = new VariableEntry(type, source);
  }

  public containsName(name: string): boolean {
    return name in this.variables || (this.parentContext != null && this.parentContext.containsName(name));
  }

  public containsPath(path: IdentifierPath): boolean {
    let parent = this.getVariable(path.rootIdentifier);
    if (parent == null) return false;

    return !path.hasChildIdentifiers ||
      this.containsChild(parent.type, path.childrenReference());
  }

  public createVariableReference(reference: SourceReference, path: IdentifierPath): VariableReference | null {

    type CreateHandler = (path: IdentifierPath) => VariableReference | null;

    function executeWithPriority(firstPriorityHandler: CreateHandler, secondPriorityHandler: CreateHandler) {
      const value1 = firstPriorityHandler(path);
      if (value1 != null) return value1;

      const value2 = secondPriorityHandler(path);
      if (value2 != null) return value2;

      return null;
    }

    const containsMemberAccess = path.parts > 1;
    const fromTypeSystem = this.createVariableReferenceFromTypeSystem.bind(this);
    const fromVariables = this.createVariableReferenceFromRegisteredVariables.bind(this);

    return containsMemberAccess
      ? executeWithPriority(fromTypeSystem, fromVariables)
      : executeWithPriority(fromVariables, fromTypeSystem);
  }

  private createVariableReferenceFromRegisteredVariables(path: IdentifierPath) {
    const variable = this.getVariable(path.rootIdentifier);
    if (variable == null) return null;

    const type = this.getTypeByPath(path);
    return type == null
      ? null
      : new VariableReference(path, null, type, variable.variableSource);
  }

  private createVariableReferenceFromTypeSystem(path: IdentifierPath): VariableReference | null {

    if (path.parts > 2) return null;

    const componentType = this.componentNodes.getType(path.rootIdentifier);
    if (componentType == null) return null;

    if (path.parts == 1) {
      return new VariableReference(path, componentType, componentType, VariableSource.Type);
    }

    const member = path.lastPart();
    let memberType = componentType.memberType(member);
    if (memberType == null) return null;

    return new VariableReference(path, componentType, memberType, VariableSource.Type);
  }


  public getTypeByName(name: string): Type | null {
    return name in this.variables
      ? this.variables[name].type
      : this.parentContext != null
        ? this.parentContext.getTypeByName(name)
        : null;
  }

  public getTypeByPath(path: IdentifierPath): Type | null {
    let parent = this.getTypeByName(path.rootIdentifier);
    return parent == null || !path.hasChildIdentifiers
      ? parent
      : this.getType(parent, path.childrenReference());
  }

  public getVariable(name: string): VariableEntry | null {
    return name in this.variables
      ? this.variables[name]
      : this.parentContext != null
        ? this.parentContext.getVariable(name)
        : null;
  }

  private containsChild(parentType: Type | null, path: IdentifierPath): boolean {

    let objectType = asObjectType(parentType);

    let memberType = objectType != null ? objectType.memberType(path.rootIdentifier) : null;
    if (memberType == null) return false;

    return !path.hasChildIdentifiers
      || this.containsChild(memberType, path.childrenReference());
  }

  private getType(parentType: Type, path: IdentifierPath): Type | null {

    let objectType = asObjectType(parentType);
    if (objectType == null) return null;

    let memberType = objectType.memberType(path.rootIdentifier);
    if (memberType == null) return null;

    return !path.hasChildIdentifiers
      ? memberType
      : this.getType(memberType, path.childrenReference());
  }
}
