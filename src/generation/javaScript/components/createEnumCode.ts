import {GeneratedType, GeneratedTypeKind} from "../../generatedType";
import {enumClassName} from "../classNames";
import {CodeWriter} from "../codeWriter";
import {EnumDefinition} from "../../../language/enums/enumDefinition";
import {LexyCodeConstants} from "../lexyCodeConstants";
import {renderExpression} from "../renderers/renderExpression";

export function createEnumCode(enumDefinition: EnumDefinition): GeneratedType {
    if (enumDefinition == null) throw new Error(`Component token not enumDefinition`);

    const enumName = enumClassName(enumDefinition.name.value);

    const codeWriter = new CodeWriter(renderExpression);
    codeWriter.openScope();
    for (const member of enumDefinition.members) {
      codeWriter.writeLine(`${member.name}: "${enumDefinition.name.value}.${member.name}",`);
    }
    renderValidationFunction(enumDefinition, codeWriter);
    codeWriter.closeScope();

    return new GeneratedType(GeneratedTypeKind.Enum, enumDefinition, enumName, codeWriter.toString());
  }

function renderValidationFunction(enumDefinition: EnumDefinition, codeWriter: CodeWriter) {
  codeWriter.openScope(`${LexyCodeConstants.validateMethod}: function ${LexyCodeConstants.validateMethod}(name, value, optional, validationErrors)`);
  codeWriter.openScope('if (value === null || value === undefined)');
  codeWriter.openScope('if (!optional)');
  codeWriter.writeLine(`validationErrors.push(\`'\${name}' should have a '${enumDefinition.name.value}' value. Value missing.\`);`);
  codeWriter.closeScope();
  codeWriter.writeLine(`return;`);
  codeWriter.closeScope();

  codeWriter.openScope(`if (typeof value !== 'string' && !(value instanceof String))`);
  codeWriter.writeLine(`validationErrors.push(\`'\${name}' should have a '${enumDefinition.name.value}' value. Invalid type: '\${toString.call(value)}\`);`);
  codeWriter.writeLine(`return;`);
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