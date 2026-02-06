import type {IComponentNode} from "./componentNode";
import type {IParseLineContext} from "../parser/context/parseLineContext";
import type {IParsableNode} from "./parsableNode";
import type {INode} from "./node";
import type {IValidationContext} from "../parser/context/validationContext";
import type {IExpressionFactory} from "./expressions/expressionFactory";

import {Function} from "./functions/function";
import {ComponentNode} from "./componentNode";
import {Comments} from "./comments";
import {Include} from "./include";
import {ComponentNodeList} from "./componentNodeList";
import {SourceReference} from "./sourceReference";
import {Symbol} from "./symbols/symbol";
import {NodeName} from "../parser/nodeName";
import {Keywords} from "../parser/Keywords";
import {EnumDefinition} from "./enums/enumDefinition";
import {Scenario} from "./scenarios/scenario";
import {Table} from "./tables/table";
import {TypeDefinition} from "./types/typeDefinition";
import {DuplicateChecker} from "./duplicateChecker";
import {where} from "../infrastructure/arrayFunctions";
import {NodeType} from "./nodeType";
import {asNestedNode} from "./nestedNode";
import {NodeReference} from "./nodeReference";
import {Suggestions} from "./symbols/suggestions";
import {SuggestionsScope} from "./symbols/suggestionsScope";
import {SuggestionEdit} from "./symbols/suggestionEdit";

export function instanceOfLexyScriptNode(object: any) {
  return object?.nodeType == NodeType.LexyScriptNode;
}

export function asLexyScriptNode(object: any): Table | null {
  return instanceOfLexyScriptNode(object) ? object as Table : null;
}

export class LexyScriptNode extends ComponentNode {

  private readonly includes: Array<Include> = [];
  private readonly expressionFactory: IExpressionFactory;
  private sortedNodes: Array<IComponentNode> | null = null;

  public readonly nodeType = NodeType.LexyScriptNode;

  public readonly comments: Comments;
  public componentNodes: ComponentNodeList = new ComponentNodeList();

  constructor(expressionFactory: IExpressionFactory) {
    super("LexyScriptNode", new NodeReference(null, true), new SourceReference(`LexyScript`, 1, 1, 1));
    this.comments = new Comments(new NodeReference(this), this.reference);
    this.expressionFactory = expressionFactory;
  }

  public override parse(context: IParseLineContext): IParsableNode {
    let line = context.line;

    if (line.tokens.isComment()) return this.comments;

    let componentNode = this.parseComponentNode(context);
    if (componentNode == null) return this;

    this.componentNodes.add(componentNode);
    context.symbols.addNode(componentNode);

    return componentNode;
  }

  private parseComponentNode(context: IParseLineContext): IComponentNode | null {
    if (Include.isValid(context.line)) {
      let include = Include.parse(context);
      if (include != null) {
        this.includes.push(include);
        return null;
      }
    }

    let reference = context.line.tokens.allReference();

    let tokenName = NodeName.parse(context);
    if (tokenName == null || tokenName.name == null) {
      const token = context.line.tokens.length > 0 ? context.line.tokens.get(0)?.value : context.line.content;
      context.logger.fail(reference, `Invalid token '${token}'. Keyword and name expected.`);
      return null;
    }

    switch (tokenName.keyword) {
      case Keywords.Function:
        return Function.create(tokenName.name, false, new NodeReference(this), reference, this.expressionFactory);
      case Keywords.EnumKeyword:
        return EnumDefinition.parse(tokenName.name, false, this, reference);
      case Keywords.ScenarioKeyword:
        return Scenario.parse(tokenName.name, this, reference);
      case Keywords.TableKeyword:
        return new Table(tokenName.name, new NodeReference(this), reference);
      case Keywords.TypeKeyword:
        return TypeDefinition.parse(tokenName.name, this, reference);
      default:
        return this.invalidNode(tokenName, context, reference)
    }
  }

  private invalidNode(tokenName: NodeName, context: IParseLineContext, reference: SourceReference): IComponentNode | null {
    context.logger.fail(reference, `Unknown keyword: ${tokenName.keyword}`);
    return null;
  }

  public override getChildren(): readonly INode[] {
    return this.sortedNodes ? this.sortedNodes : this.componentNodes.values;
  }

  protected override validate(context: IValidationContext): void {
    DuplicateChecker.validate(
      context,
      node => node.reference,
      node => node.name,
      node => `Duplicated node name: '${node.name}'`,
      this.componentNodes.values);
  }

  public getDueIncludes(): ReadonlyArray<Include> {
    return where(this.includes, include => include.state?.isProcessed != true);
  }

  public sortByDependency(sortedNodes: readonly IComponentNode[]) {
    this.sortedNodes = this.withoutScenarioInlineNode(sortedNodes);
  }

  private withoutScenarioInlineNode(sortedNodes: readonly IComponentNode[]) {
    return sortedNodes.filter(where => asNestedNode(where)?.nested != true);
  }

  public override getSymbol(): Symbol | null {
    return null;
  }

  public override getSuggestions(): readonly SuggestionEdit[] {
    return Suggestions.editScope(SuggestionsScope.CurrentLevel, withSuggestions => withSuggestions
      .keyword(Keywords.Function)
      .keyword(Keywords.EnumKeyword)
      .keyword(Keywords.TypeKeyword)
      .keyword(Keywords.TableKeyword)
      .keyword(Keywords.ScenarioKeyword)
      .keyword(Keywords.Include)
    );
  }
}
