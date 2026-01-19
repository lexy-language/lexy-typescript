import type {IValidationContext} from "../../parser/validationContext";
import type {IParseLineContext} from "../../parser/ParseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";
import type {INodeWithType} from "../nodeWithType";

import {ComponentNode} from "../componentNode";
import {VariableDefinition} from "../variableDefinition";
import {SourceReference} from "../../parser/sourceReference";
import {VariableSource} from "../variableSource";
import {NodeType} from "../nodeType";
import {asHasNodeDependencies, IHasNodeDependencies} from "../IHasNodeDependencies";
import {selectMany} from "../../infrastructure/arrayFunctions";
import {DeclaredType} from "../typeSystem/objects/declaredType";
import {Type} from "../typeSystem/type";

export function instanceOfTypeDefinition(object: any) {
  return object?.nodeType == NodeType.TypeDefinition;
}

export function asTypeDefinition(object: any): TypeDefinition | null {
  return instanceOfTypeDefinition(object) ? object as TypeDefinition : null;
}

export interface ITypeDefinition extends IComponentNode {
 get variables(): ReadonlyArray<VariableDefinition>;
}

export class TypeDefinition extends ComponentNode implements ITypeDefinition, IHasNodeDependencies, INodeWithType {

  private readonly variablesValue: Array<VariableDefinition> = [];

  public readonly nodeType = NodeType.TypeDefinition;
  public readonly hasNodeDependencies = true;
  public readonly isNodeWithType = true;

  public override name: string;

  public get variables(): ReadonlyArray<VariableDefinition> {
    return this.variablesValue;
  }

  constructor(name: string, reference: SourceReference) {
    super(reference);
    this.name = name;
  }
  public createType(): Type {
    return new DeclaredType(this);
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
      const hasDependencies = asHasNodeDependencies(variable.typeDeclaration);
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
