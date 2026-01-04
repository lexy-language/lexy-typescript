import {parseExpression} from "./parseExpression";
import {validateOfType} from "../../validateOfType";
import {
  asVariableDeclarationExpression,
  VariableDeclarationExpression
} from "../../../src/language/expressions/variableDeclarationExpression";
import {
  validateBooleanLiteralExpression, validateDateTimeLiteralExpression,
  validateMemberAccessExpression,
  validateNumericLiteralExpression,
  validateQuotedLiteralExpression
} from "./expressionTestExtensions";
import {
  asComplexVariableTypeDeclaration,
  ComplexVariableTypeDeclaration
} from "../../../src/language/variableTypes/declarations/complexVariableTypeDeclaration";
import {
  asPrimitiveVariableTypeDeclaration,
  PrimitiveVariableTypeDeclaration
} from "../../../src/language/variableTypes/declarations/primitiveVariableTypeDeclaration";

describe('VariableDeclaration', () => {
  it('number', async () => {
    let expression = parseExpression(`number temp`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`number`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      expect(variableDeclarationExpression.assignment).toBeNull();
    });
  });

  it('numberWithDefaultValue', async () => {
    let expression = parseExpression(`number temp = 123.45`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`number`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      validateNumericLiteralExpression(variableDeclarationExpression.assignment, 123.45);
    });
  });

  it('string', async () => {
    let expression = parseExpression(`string temp`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`string`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      expect(variableDeclarationExpression.assignment).toBeNull();
    });
  });

  it('stringWithDefaultValue', async () => {
    let expression = parseExpression(`string temp = "abc"`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`string`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      validateQuotedLiteralExpression(variableDeclarationExpression.assignment, `abc`);
    });
  });


  it('boolean', async () => {
    let expression = parseExpression(`boolean temp`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`boolean`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      expect(variableDeclarationExpression.assignment).toBeNull();
    });
  });

  it('booleanWithDefaultValue', async () => {
    let expression = parseExpression(`boolean temp = true`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`boolean`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      validateBooleanLiteralExpression(variableDeclarationExpression.assignment, true);
    });
  });

  it('dateTime', async () => {
    let expression = parseExpression(`date temp`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`date`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      expect(variableDeclarationExpression.assignment).toBeNull();
    });
  });

  it('dateTimeWithDefaultValue', async () => {
    let expression = parseExpression(`date temp = d"2024-12-16T16:51:12"`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<PrimitiveVariableTypeDeclaration>(asPrimitiveVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe("date"));
      expect(variableDeclarationExpression.name).toBe("temp");
      validateDateTimeLiteralExpression(variableDeclarationExpression.assignment, "2024-12-16T16:51:12");
    });
  });

  it('declaredType', async () => {
    let expression = parseExpression(`Custom temp`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<ComplexVariableTypeDeclaration>(asComplexVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`Custom`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      expect(variableDeclarationExpression.assignment).toBeNull();
    });
  });

  it('declaredTypeWithDefault', async () => {
    let expression = parseExpression(`Custom temp = Custom.First`);
    validateOfType<VariableDeclarationExpression>(asVariableDeclarationExpression, expression, variableDeclarationExpression => {
      validateOfType<ComplexVariableTypeDeclaration>(asComplexVariableTypeDeclaration, variableDeclarationExpression.type, type =>
        expect(type.type).toBe(`Custom`));
      expect(variableDeclarationExpression.name).toBe(`temp`);
      validateMemberAccessExpression(variableDeclarationExpression.assignment, `Custom.First`);
    });
  });
});
