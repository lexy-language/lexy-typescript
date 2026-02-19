import type {IParsableNode} from "../parsableNode";
import type {IParseLineContext} from "../../parser/context/parseLineContext";
import type {INode} from "../node";
import type {IValidationContext} from "../../parser/context/validationContext";
import type {INestedNode} from "../nestedNode";
import type {INodeWithType} from "../nodeWithType";

import {ComponentNode} from "../componentNode";
import {EnumMember} from "./enumMember";
import {SourceReference} from "../sourceReference";
import {any, lastOrDefault} from "../../infrastructure/arrayFunctions";
import {DuplicateChecker} from "../duplicateChecker";
import {NodeType} from "../nodeType";
import {EnumType} from "../typeSystem/enumType";
import {Type} from "../typeSystem/type";
import {isNullOrEmpty} from "../../infrastructure/validationFunctions";
import {isValidIdentifier} from "../../parser/tokens/character";
import {NodeReference} from "../nodeReference";
import {SymbolKind} from "../symbols/symbolKind";
import {Symbol} from "../symbols/symbol";

export function instanceOfEnumDefinition(object: any) {
  return object?.nodeType == NodeType.EnumDefinition;
}

export function asEnumDefinition(object: any): EnumDefinition | null {
  return instanceOfEnumDefinition(object) ? object as EnumDefinition : null;
}

export class EnumDefinition extends ComponentNode implements INestedNode, INodeWithType {

  public readonly nodeType = NodeType.EnumDefinition;
  public readonly isNestedNode = true;
  public readonly isNodeWithType = true;

  public readonly nested;

  public readonly members: Array<EnumMember> = [];

  constructor(name: string, nested: boolean, parentReference: NodeReference, reference: SourceReference) {
    super(name, parentReference, reference);
    this.nested = nested;
  }

  public static parse(name: string, nested: boolean, parent: INode, reference: SourceReference): EnumDefinition {
    return new EnumDefinition(name, nested, new NodeReference(parent), reference);
  }

  public createType(): Type {
    return new EnumType(this);
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let lastIndex = lastOrDefault(this.members)?.numberValue ?? -1;
    let member = EnumMember.parse(context, this, lastIndex);
    if (member != null) this.members.push(member);
    return this;
  }

  public override getChildren(): Array<INode> {
    return this.members;
  }

  protected override validate(context: IValidationContext): void {
    if (this.members.length == 0) {
      context.logger.fail(this.reference, `Enum has no members defined.`);
      return;
    }

    DuplicateChecker.validate(
      context,
      member => member.reference,
      member => member.name,
      member => `Enum member name should be unique. Duplicate name: '${member.name}'`,
      this.members);

    if (isNullOrEmpty(this.name)) {
      context.logger.fail(this.reference, `Invalid enum name: ${this.name}. name should not be empty.`);
    } else if (!isValidIdentifier(this.name)) {
      context.logger.fail(this.reference, `Invalid enum name: ${this.name}.`);
    }
  }

  public containsMember(name: string): boolean {
    return any(this.members, member => member.name == name);
  }

  public override getSymbol(): Symbol | null {
    return new Symbol(this.reference, `enum: ${this.name}`, "", SymbolKind.Enum);
  }
}
