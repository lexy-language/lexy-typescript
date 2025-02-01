import type {IParserLogger} from "./parserLogger";
import type {ITypeWithMembers} from "../language/variableTypes/ITypeWithMembers";
import {asTypeWithMembers} from "../language/variableTypes/ITypeWithMembers";
import type {IValidationContext} from "./validationContext";

import {VariableType} from "../language/variableTypes/variableType";
import {SourceReference} from "./sourceReference";
import {VariableEntry} from "./variableEntry";
import {VariablePath} from "../language/variablePath";
import {VariableSource} from "../language/variableSource";
import {VariableReference} from "../language/variableReference";
import {RootNodeList} from "../language/rootNodeList";

export interface IVariableContext {
  addVariable(variableName: string, type: VariableType, source: VariableSource): void;

  registerVariableAndVerifyUnique(reference: SourceReference, variableName: string, type: VariableType | null,
                                  source: VariableSource): void;

  containsName(variableName: string): boolean;

  containsPath(path: VariablePath, context: IValidationContext): boolean;

  getVariableTypeByName(variableName: string): VariableType | null;

  getVariableTypeByPath(variablePath: VariablePath, context: IValidationContext): VariableType | null;

  getVariable(variableName: string): VariableEntry | null;

  createVariableReference(reference: SourceReference, path: VariablePath, validationContext: IValidationContext): VariableReference | null;
}

export class VariableContext implements IVariableContext {
  private readonly logger: IParserLogger;
  private readonly rootNodes: RootNodeList;
  private readonly parentContext: IVariableContext | null;
  private readonly variables: { [id: string]: VariableEntry; } = {};

  constructor(rootNodes: RootNodeList, logger: IParserLogger, parentContext: IVariableContext | null) {
    this.logger = logger;
    this.rootNodes = rootNodes;
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

  public containsPath(path: VariablePath, context: IValidationContext): boolean {
    let parent = this.getVariable(path.parentIdentifier);
    if (parent == null) return false;

    return !path.hasChildIdentifiers ||
      this.containChild(parent.variableType, path.childrenReference(), context);
  }

  public createVariableReference(reference: SourceReference, path: VariablePath, validationContext: IValidationContext): VariableReference | null {

    type CreateHandler = (path: VariablePath, validationContext: IValidationContext) => VariableReference | null;

    function executeWithPriority(firstPriorityHandler: CreateHandler, secondPriorityHandler: CreateHandler, logger: IParserLogger) {
      const value1 = firstPriorityHandler(path, validationContext);
      if (value1 != null) return value1;

      const value2 = secondPriorityHandler(path, validationContext);
      if (value2 != null) return value2;

      logger.fail(reference, `Unknown variable name: '${path.fullPath()}'`);
      return null;
    }

    const containsMemberAccess = path.parts > 1;
    const fromTypeSystem = this.createVariableReferenceFromTypeSystem.bind(this);
    const fromVariables = this.createVariableReferenceFromRegisteredVariables.bind(this);

    return containsMemberAccess
      ? executeWithPriority(fromTypeSystem, fromVariables, this.logger)
      : executeWithPriority(fromVariables, fromTypeSystem, this.logger);
  }

  private createVariableReferenceFromRegisteredVariables(path: VariablePath, validationContext: IValidationContext) {
    const variable = this.getVariable(path.parentIdentifier);
    if (variable == null) return null;

    const variableType = this.getVariableTypeByPath(path, validationContext);
    return variableType == null
      ? null
      : new VariableReference(path, null, variableType, variable.variableSource);
  }

  private createVariableReferenceFromTypeSystem(path: VariablePath, validationContext: IValidationContext): VariableReference | null {

    if (path.parts > 2) return null;

    const rootVariableType = this.rootNodes.getType(path.parentIdentifier);
    if (rootVariableType == null) return null;

    if (path.parts == 1) {
      return new VariableReference(path, rootVariableType, rootVariableType, VariableSource.Type);
    }

    const member = path.lastPart();
    let memberType = rootVariableType.memberType(member, validationContext);
    if (memberType == null) return null;

    return new VariableReference(path, rootVariableType, memberType, VariableSource.Type);
  }


  public getVariableTypeByName(name: string): VariableType | null {
    return name in this.variables
      ? this.variables[name].variableType
      : this.parentContext != null
        ? this.parentContext.getVariableTypeByName(name)
        : null;
  }

  public getVariableTypeByPath(path: VariablePath, context: IValidationContext): VariableType | null {
    let parent = this.getVariableTypeByName(path.parentIdentifier);
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

  private containChild(parentType: VariableType | null, path: VariablePath, context: IValidationContext): boolean {
    let typeWithMembers = (parentType as any).typeWithMember == true ? (parentType as any) as ITypeWithMembers : null;

    let memberVariableType = typeWithMembers != null ? typeWithMembers.memberType(path.parentIdentifier, context) : null;
    if (memberVariableType == null) return false;

    return !path.hasChildIdentifiers
      || this.containChild(memberVariableType, path.childrenReference(), context);
  }

  private getVariableType(parentType: VariableType, path: VariablePath,
                          context: IValidationContext): VariableType | null {

    let typeWithMembers = asTypeWithMembers(parentType);
    if (typeWithMembers == null) return null;

    let memberVariableType = typeWithMembers.memberType(path.parentIdentifier, context);
    if (memberVariableType == null) return null;

    return !path.hasChildIdentifiers
      ? memberVariableType
      : this.getVariableType(memberVariableType, path.childrenReference(), context);
  }
}
