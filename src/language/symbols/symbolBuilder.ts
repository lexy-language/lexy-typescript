import {Signatures} from "./signatures";
import {Symbol} from "./symbol";
import {SourceReference} from "../sourceReference";
import {SymbolKind} from "./symbolKind";

class SignatureContext {
  public parameter(name: string, documentation: string): SignatureContext {
    throw new Error();
  }
}

class SignaturesContext {
  public signature(name: string, build: (context: SignatureContext) => void): SignaturesContext {
    throw new Error();
  }
}

export class SymbolBuilder {

  private nameValue: string | null = null;
  private descriptionValue: string | null = null;
  private kindValue: SymbolKind | null = null;
  private signaturesValue: Signatures | null = null;
  private referenceValue: SourceReference | null = null;

  public reference(reference: SourceReference): SymbolBuilder {
    this.referenceValue = reference;
    return this;
  }

  public name(name: string): SymbolBuilder {
    this.nameValue = name;
    return this;
  }

  public description(description: string): SymbolBuilder {
    this.descriptionValue = description;
    return this;
  }

  public kind(kind: SymbolKind): SymbolBuilder {
      this.kindValue = kind;
      return this;
  }

  public signatures(build: (context: SignaturesContext) => void): SymbolBuilder {
    return this;
  }

  private createSymbol(): Symbol {
    if (this.referenceValue == null) throw new Error("reference is not set");
    if (this.nameValue == null) throw new Error("name is not set");
    if (this.descriptionValue == null) throw new Error("description is not set");
    if (this.kindValue == null) throw new Error("kind is not set");
    return new Symbol(this.referenceValue, this.nameValue, this.descriptionValue, this.kindValue, this.signaturesValue);
  }

  public static build(handler: (builder: SymbolBuilder) => void): Symbol {
    let builder = new SymbolBuilder();
    handler(builder);
    return builder.createSymbol();
  }
}
