import {SourceReference} from "../../../parser/sourceReference";
import {Keywords} from "../../../parser/Keywords";
import {ImplicitVariableTypeDeclaration} from "./implicitVariableTypeDeclaration";
import {TypeNames} from "../typeNames";
import {PrimitiveVariableTypeDeclaration} from "./primitiveVariableTypeDeclaration";
import {ObjectVariableTypeDeclaration} from "./objectVariableTypeDeclaration";
import {VariableTypeDeclaration} from "./variableTypeDeclaration";

export class VariableTypeDeclarationParser {
  public static parse(type: string, reference: SourceReference): VariableTypeDeclaration {
    if (type == Keywords.ImplicitVariableTypeDeclaration) return new ImplicitVariableTypeDeclaration(reference);
    if (TypeNames.contains(type)) return new PrimitiveVariableTypeDeclaration(type, reference);

    return new ObjectVariableTypeDeclaration(type, reference);
  }
}