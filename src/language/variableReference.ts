import {VariableSource} from "./variableSource";
import {IdentifierPath} from "./identifierPath";
import {Type} from "./typeSystem/type";
import {SourceReference} from "./sourceReference";
import {Symbol} from "./symbols/symbol";
import {SymbolKind} from "./symbols/symbolKind";
import {instanceOfEnumType} from "./typeSystem/enumType";
import {instanceOfGeneratedType} from "./typeSystem/objects/generatedType";

export class VariableReference {

  public readonly reference: SourceReference;
  public readonly path: IdentifierPath;
  public readonly source: VariableSource;
  public readonly componentType: Type | null;
  public readonly type: Type | null;

  constructor(reference: SourceReference, path: IdentifierPath,
              componentType: Type | null,
              type: Type | null, source: VariableSource) {
    this.reference = reference;
    this.path = path;
    this.componentType = componentType;
    this.type = type;
    this.source = source;
  }

  public getSymbol(): Symbol {

    switch (this.source)  {
      case VariableSource.Parameters:
        return new Symbol(this.reference, `parameter: ${this.type} ${this.path}`, "", SymbolKind.ParameterVariable);
      case VariableSource.Results:
        return new Symbol(this.reference, `result: ${this.type} ${this.path}`, "", SymbolKind.ResultVariable);
      case VariableSource.Code:
        return new Symbol(this.reference, `variable: ${this.type} ${this.path}`, "", SymbolKind.Variable);
      case VariableSource.Type:
        return this.typeSymbol();
      default:
        throw new Error("Invalid source: " + this.source);
    }
  }

  private typeSymbol(): Symbol
  {
    if (instanceOfEnumType(this.type)) {
      return new Symbol(this.reference, `enum member: ${this.path}`, "", SymbolKind.EnumMember);
    }
    return instanceOfGeneratedType(this.type)
         ? new Symbol(this.reference, `type: ${this.path}`, "", SymbolKind.GeneratedType)
         : new Symbol(this.reference, `variable: ${this.type} ${this.path}`, "", SymbolKind.Variable);
  }

  public toString(): string {
    return this.getSymbol().toString();
  }
}
