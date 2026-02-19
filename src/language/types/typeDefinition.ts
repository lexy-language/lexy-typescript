import type {IValidationContext} from "../../parser/context/validationContext";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {IParsableNode} from "../parsableNode";
import type {INode} from "../node";
import type {IComponentNode} from "../componentNode";
import type {IComponentNodeList} from "../componentNodeList";
import type {INodeWithType} from "../nodeWithType";

import {ComponentNode} from "../componentNode";
import {VariableDefinition} from "../variableDefinition";
import {SourceReference} from "../sourceReference";
import {VariableSource} from "../variableSource";
import {NodeType} from "../nodeType";
import {asHasNodeDependencies, IHasNodeDependencies} from "../IHasNodeDependencies";
import {selectMany} from "../../infrastructure/arrayFunctions";
import {DeclaredType} from "../typeSystem/objects/declaredType";
import {Type} from "../typeSystem/type";
import {LexyScriptNode} from "../lexyScriptNode";
import {NodeReference} from "../nodeReference";
import {Symbol} from "../symbols/symbol";
import {SymbolKind} from "../symbols/symbolKind";

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

  constructor(name: string, parentReference: LexyScriptNode, reference: SourceReference) {
    super(name, new NodeReference(parentReference), reference);
    this.name = name;
  }

  public createType(): Type {
    return new DeclaredType(this);
  }

  public static parse(name: string, parent: LexyScriptNode, reference: SourceReference): TypeDefinition {
    return new TypeDefinition(name, parent, reference);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    const variableDefinition = VariableDefinition.parse(VariableSource.Parameters, context, new NodeReference(this));
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
    context.inNodeVariableScope(this, super.validateTree.bind(this));
  }

  public override getSymbol(): Symbol | null {
    const builder: string[] = [];
    for (const variable of this.variables) {
      if (builder.length > 0) {
        builder.push("\n");
      }
      builder.push(`- ${variable.typeDeclaration} ${variable.name}`);
    }
    const variablesString = builder.join("");
    return new Symbol(this.reference, `type: ${this.name}`, variablesString, SymbolKind.Type);
  }
}
