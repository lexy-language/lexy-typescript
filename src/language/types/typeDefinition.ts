import type {IValidationContext} from "../../parser/validationContext";
import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";

import {ComponentNode} from "../componentNode";
import {TypeName} from "./typeName";
import {VariableDefinition} from "../variableDefinition";
import {SourceReference} from "../../parser/sourceReference";
import {VariableSource} from "../variableSource";
import {NodeType} from "../nodeType";
import {asHasNodeDependencies, IHasNodeDependencies} from "../IHasNodeDependencies";
import {selectMany} from "../../infrastructure/arrayFunctions";

export function instanceOfTypeDefinition(object: any) {
  return object?.nodeType == NodeType.TypeDefinition;
}

export function asTypeDefinition(object: any): TypeDefinition | null {
  return instanceOfTypeDefinition(object) ? object as TypeDefinition : null;
}

export interface ITypeDefinition extends IComponentNode {
 get variables(): ReadonlyArray<VariableDefinition>;
}

export class TypeDefinition extends ComponentNode implements IHasNodeDependencies, ITypeDefinition {

  private readonly variablesValue: Array<VariableDefinition> = [];

  public readonly nodeType = NodeType.TypeDefinition;
  public readonly hasNodeDependencies = true;

  public name: TypeName;

  public get variables(): ReadonlyArray<VariableDefinition> {
    return this.variablesValue;
  }

  public override get nodeName() {
    return this.name.value;
  }

  constructor(name: string, reference: SourceReference) {
    super(reference);
    this.name = TypeName.parseName(name);
  }

  public static parse(name: string, reference: SourceReference): TypeDefinition {
    return new TypeDefinition(name, reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let variableDefinition = VariableDefinition.parse(VariableSource.Parameters, context);
    if (variableDefinition != null) this.variablesValue.push(variableDefinition);
    return this;
  }

  public getDependencies(componentNodes: IComponentNodeList): Array<IComponentNode> {
    const dependencies = selectMany(this.variablesValue, variable => {
      const hasDependencies = asHasNodeDependencies(variable.type);
      return hasDependencies != null ? hasDependencies.getDependencies(componentNodes) : [];
    });
    return dependencies;
  }

  public override getChildren(): Array<INode> {
    return [...this.variables];
  }

  protected override validate(context: IValidationContext): void {
  }

  public override validateTree(context: IValidationContext): void {
    const scope = context.createVariableScope();
    try {
      super.validateTree(context);
    } finally {
      scope[Symbol.dispose]();
    }
  }
}
