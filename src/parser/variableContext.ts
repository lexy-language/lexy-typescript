import type {IParserLogger} from "./parserLogger";
import type {IObjectType} from "../language/variableTypes/objectType";
import {asObjectType} from "../language/variableTypes/objectType";
import type {IValidationContext} from "./validationContext";

import {VariableType} from "../language/variableTypes/variableType";
import {SourceReference} from "./sourceReference";
import {VariableEntry} from "./variableEntry";
import {IdentifierPath} from "../language/identifierPath";
import {VariableSource} from "../language/variableSource";
import {VariableReference} from "../language/variableReference";
import {ComponentNodeList} from "../language/componentNodeList";

export interface IVariableContext {
  addVariable(variableName: string, type: VariableType, source: VariableSource): void;

  registerVariableAndVerifyUnique(reference: SourceReference, variableName: string, type: VariableType | null,
                                  source: VariableSource): void;

  containsName(variableName: string): boolean;

  containsPath(path: IdentifierPath, context: IValidationContext): boolean;

  getVariableTypeByName(variableName: string): VariableType | null;

  getVariableTypeByPath(identifierPath: IdentifierPath, context: IValidationContext): VariableType | null;

  getVariable(variableName: string): VariableEntry | null;

  createVariableReference(reference: SourceReference, path: IdentifierPath, validationContext: IValidationContext): VariableReference | null;
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

  public addVariable(name: string, type: VariableType, source: VariableSource): void {
    if (this.containsName(name)) return;

    this.variables[name] = new VariableEntry(type, source);
  }

  public registerVariableAndVerifyUnique(reference: SourceReference, name: string, type: VariableType | null,
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

  public containsPath(path: IdentifierPath, context: IValidationContext): boolean {
    let parent = this.getVariable(path.rootIdentifier);
    if (parent == null) return false;

    return !path.hasChildIdentifiers ||
      this.containsChild(parent.variableType, path.childrenReference(), context);
  }

  public createVariableReference(reference: SourceReference, path: IdentifierPath, validationContext: IValidationContext): VariableReference | null {

    type CreateHandler = (path: IdentifierPath, validationContext: IValidationContext) => VariableReference | null;

    function executeWithPriority(firstPriorityHandler: CreateHandler, secondPriorityHandler: CreateHandler) {
      const value1 = firstPriorityHandler(path, validationContext);
      if (value1 != null) return value1;

      const value2 = secondPriorityHandler(path, validationContext);
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

  private createVariableReferenceFromRegisteredVariables(path: IdentifierPath, validationContext: IValidationContext) {
    const variable = this.getVariable(path.rootIdentifier);
    if (variable == null) return null;

    const variableType = this.getVariableTypeByPath(path, validationContext);
    return variableType == null
      ? null
      : new VariableReference(path, null, variableType, variable.variableSource);
  }

  private createVariableReferenceFromTypeSystem(path: IdentifierPath, validationContext: IValidationContext): VariableReference | null {

    if (path.parts > 2) return null;

    const componentVariableType = this.componentNodes.getType(path.rootIdentifier);
    if (componentVariableType == null) return null;

    if (path.parts == 1) {
      return new VariableReference(path, componentVariableType, componentVariableType, VariableSource.Type);
    }

    const member = path.lastPart();
    let memberType = componentVariableType.memberType(member, validationContext.componentNodes);
    if (memberType == null) return null;

    return new VariableReference(path, componentVariableType, memberType, VariableSource.Type);
  }


  public getVariableTypeByName(name: string): VariableType | null {
    return name in this.variables
      ? this.variables[name].variableType
      : this.parentContext != null
        ? this.parentContext.getVariableTypeByName(name)
        : null;
  }

  public getVariableTypeByPath(path: IdentifierPath, context: IValidationContext): VariableType | null {
    let parent = this.getVariableTypeByName(path.rootIdentifier);
    return parent == null || !path.hasChildIdentifiers
      ? parent
      : this.getVariableType(parent, path.childrenReference(), context);
  }

  public getVariable(name: string): VariableEntry | null {
    return name in this.variables
      ? this.variables[name]
      : this.parentContext != null
        ? this.parentContext.getVariable(name)
        : null;
  }

  private containsChild(parentType: VariableType | null, path: IdentifierPath, context: IValidationContext): boolean {
    let objectType = (parentType as any).objectType == true ? (parentType as any) as IObjectType : null;

    let memberVariableType = objectType != null ? objectType.memberType(path.rootIdentifier, context.componentNodes) : null;
    if (memberVariableType == null) return false;

    return !path.hasChildIdentifiers
      || this.containsChild(memberVariableType, path.childrenReference(), context);
  }

  private getVariableType(parentType: VariableType, path: IdentifierPath,
                          context: IValidationContext): VariableType | null {

    let objectType = asObjectType(parentType);
    if (objectType == null) return null;

    let memberVariableType = objectType.memberType(path.rootIdentifier, context.componentNodes);
    if (memberVariableType == null) return null;

    return !path.hasChildIdentifiers
      ? memberVariableType
      : this.getVariableType(memberVariableType, path.childrenReference(), context);
  }
}
