export class Validate {
  public static number(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
    if (this.isMissing(name, value, 'number', optional, validationErrors)) return;

    if (toString.call(value) !== '[object Decimal]') {
      validationErrors.push(`'${name}' should have a 'number' value. Invalid type: ${toString.call(value)}. Use decimal.js.`)
    } else if (value.isNaN() || !value.isFinite()) {
      validationErrors.push(`'${name}' should have a 'number' value. Invalid number value: '${value}'`)
    }
  }

  public static string(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
    if (this.isMissing(name, value, 'string', optional, validationErrors)) return;

    if (typeof value !== 'string' && !(value instanceof String)) {
      validationErrors.push(`'${name}' should have a 'string' value. Invalid type: '${toString.call(value)}'`)
    }
  }

  public static date(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
    if (this.isMissing(name, value, 'date', optional, validationErrors)) return;

    if (!(value instanceof Date)) {
      validationErrors.push(`'${name}' should have a 'date' value. Invalid type: '${toString.call(value)}'`)
    } else if (String(value) === 'Invalid Date') {
      validationErrors.push(`'${name}' should have a 'date' value. Invalid date value: '${value}'`)
    }
  }

  public static boolean(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
    if (this.isMissing(name, value, 'boolean', optional, validationErrors)) return;

    const type = toString.call(value);
    if (type !== '[object Boolean]') {
      validationErrors.push(`'${name}' should have a 'boolean' value. Invalid type: ${type}`)
    }
  }

  private static isMissing(name: string, value: any, type: string, optional: boolean, validationErrors: Array<string>) {
    if (!(value === null || value === undefined)) {
      return false;
    }
    if (!optional) {
      validationErrors.push(`'${name}' should have a '${type}' value. Value missing.`)
    }
    return true;
  }
}
