import {SourceReference} from "../../../parser/sourceReference";
import {Keywords} from "../../../parser/Keywords";
import {ImplicitTypeDeclaration} from "./implicitTypeDeclaration";
import {TypeNames} from "../typeNames";
import {ValueTypeDeclaration} from "./valueTypeDeclaration";
import {ObjectTypeDeclaration} from "./objectTypeDeclaration";
import {TypeDeclaration} from "./typeDeclaration";

export class TypeDeclarationParser {
  public static parse(type: string, reference: SourceReference): TypeDeclaration {
    if (type == Keywords.ImplicitTypeDeclaration) return new ImplicitTypeDeclaration(reference);
    if (TypeNames.contains(type)) return new ValueTypeDeclaration(type, reference);

    return new ObjectTypeDeclaration(type, reference);
  }
}
