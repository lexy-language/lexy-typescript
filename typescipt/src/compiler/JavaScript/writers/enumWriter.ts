import {IRootNode} from "../../../language/rootNode";
import {IRootTokenWriter} from "../../IRootTokenWriter";
import {asTable} from "../../../language/tables/table";
import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {enumClassName, typeClassName} from "../classNames";
import {CodeWriter} from "./codeWriter";
import {asEnumDefinition, EnumDefinition} from "../../../language/enums/enumDefinition";

export class EnumWriter implements IRootTokenWriter {

  private readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  public createCode(node: IRootNode): GeneratedType {
    const enumDefinition = asEnumDefinition(node);
    if (enumDefinition == null) throw new Error(`Root token not enumDefinition`);

    const enumName = enumClassName(enumDefinition.name.value);

    const codeWriter = new CodeWriter(this.namespace);
    codeWriter.openScope();
    for (const member of enumDefinition.members) {
      codeWriter.writeLine(member.name + ': "' + member.name + '",');
    }
    codeWriter.closeScope();

    return new GeneratedType(GeneratedTypeKind.Enum, node, enumName, codeWriter.toString());
   }
}
