export class SystemFunctions {
  public static populate(parameters: any, values: any) {
    for (let key in values) {
      if (values[key] && typeof values[key] === 'object' && values[key].constructor !== Date)  {
        this.populate(parameters[key], values[key]);
      } else {
        parameters[key] = values[key];
      }
    }
  }

  public static validateNumber(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
    if (this.isMissing(name, value, 'number', optional, validationErrors)) return;

    if (typeof value !== 'number') {
      validationErrors.push(`'${name}' should have a 'number' value. Invalid type: ${toString.call(value)}`)
    } else if (isNaN(value) || !isFinite(value)) {
      validationErrors.push(`'${name}' should have a 'number' value. Invalid number value: '${value}'`)
    }
  }

  public static validateString(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
    if (this.isMissing(name, value, 'string', optional, validationErrors)) return;

    if (typeof value !== 'string' && !(value instanceof String)) {
      validationErrors.push(`'${name}' should have a 'string' value. Invalid type: '${toString.call(value)}'`)
    }
  }

  public static validateDate(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
    if (this.isMissing(name, value, 'date', optional, validationErrors)) return;

    if (!(value instanceof Date)) {
      validationErrors.push(`'${name}' should have a 'date' value. Invalid type: '${toString.call(value)}'`)
    } else if (String(value) === 'Invalid Date') {
      validationErrors.push(`'${name}' should have a 'date' value. Invalid date value: '${value}'`)
    }
  }

  public static variablePath(parent: string, name: string) {
    return parent ? parent + "." + name : name;
  }

  public static validateBoolean(name: string, value: any, optional: boolean, validationErrors: Array<string>) {
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
