import {SourceReference} from "../../sourceReference";
import {Keywords} from "../../../parser/Keywords";
import {ImplicitTypeDeclaration} from "./implicitTypeDeclaration";
import {TypeNames} from "../typeNames";
import {ValueTypeDeclaration} from "./valueTypeDeclaration";
import {ObjectTypeDeclaration} from "./objectTypeDeclaration";
import {TypeDeclaration} from "./typeDeclaration";
import {NodeReference} from "../../nodeReference";
import {Token} from "../../../parser/tokens/token";
import {Assert} from "../../../infrastructure/assert";

export class TypeDeclarationParser {
  public static parse(typeToken: Token, parentReference: NodeReference, reference: SourceReference): TypeDeclaration {

    const type = typeToken.value;

    if (type == Keywords.ImplicitTypeDeclaration) return new ImplicitTypeDeclaration(parentReference, reference);
    if (TypeNames.contains(type)) return new ValueTypeDeclaration(type, parentReference, reference);

    return new ObjectTypeDeclaration(type, parentReference, reference);
  }

  public static parseString(type: string, parentReference: NodeReference, reference: SourceReference): TypeDeclaration {

    if (type == Keywords.ImplicitTypeDeclaration) return new ImplicitTypeDeclaration(parentReference, reference);
    if (TypeNames.contains(type)) return new ValueTypeDeclaration(type, parentReference, reference);

    return new ObjectTypeDeclaration(type, parentReference, reference);
  }
}
