import type {IRootNode} from "../../../language/rootNode";
import type {IRootTokenWriter} from "../../IRootTokenWriter";
import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {enumClassName} from "../classNames";
import {CodeWriter} from "./codeWriter";
import {asEnumDefinition, EnumDefinition} from "../../../language/enums/enumDefinition";
import {LexyCodeConstants} from "../lexyCodeConstants";

export class EnumWriter implements IRootTokenWriter {

  public createCode(node: IRootNode): GeneratedType {
    const enumDefinition = asEnumDefinition(node);
    if (enumDefinition == null) throw new Error(`Root token not enumDefinition`);

    const enumName = enumClassName(enumDefinition.name.value);

    const codeWriter = new CodeWriter();
    codeWriter.openScope();
    for (const member of enumDefinition.members) {
      codeWriter.writeLine(`${member.name}: "${enumDefinition.name.value}.${member.name}",`);
    }
    EnumWriter.renderValidationFunction(enumDefinition, codeWriter);
    codeWriter.closeScope();

    return new GeneratedType(GeneratedTypeKind.Enum, node, enumName, codeWriter.toString());
  }

  private static renderValidationFunction(enumDefinition: EnumDefinition, codeWriter: CodeWriter) {
    codeWriter.openScope(`${LexyCodeConstants.validateMethod}: function ${LexyCodeConstants.validateMethod}(name, value, optional, validationErrors)`);
    codeWriter.openScope('if (value === null || value === undefined)');
    codeWriter.openScope('if (!optional)');
    codeWriter.writeLine(`validationErrors.push(\`'\${name}' should have a '${enumDefinition.name.value}' value. Value missing.\`);`);
    codeWriter.closeScope();
    codeWriter.writeLine(`return;`);
    codeWriter.closeScope();

    codeWriter.openScope(`if (typeof value !== 'string' && !(value instanceof String))`);
    codeWriter.writeLine(`validationErrors.push(\`'\${name}' should have a '${enumDefinition.name.value}' value. Invalid type: '\${toString.call(value)}\`);`);
    codeWriter.closeScope();


    codeWriter.writeLine('if (');
    for (let index = 0; index < enumDefinition.members.length; index++){
      const member = enumDefinition.members[index];
      if (index < enumDefinition.members.length - 1) {
        codeWriter.writeLine(`    value !== "${enumDefinition.name.value}.${member.name}" &&`);
      } else {
        codeWriter.writeLine(`    value !== "${enumDefinition.name.value}.${member.name}"`);
      }
    }
    codeWriter.openScope('   )');
    codeWriter.writeLine(`validationErrors.push(\`'\${name}' should have a '${enumDefinition.name.value}' value. Invalid value: '\${value}'\`);`);
    codeWriter.closeScope();

    codeWriter.closeScope();
  }
}
