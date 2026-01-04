export class SystemFunctions {
  public static populate(parameters: any, values: any) {
    for (let key in values) {
      if (values[key] && typeof values[key] === 'object' && values[key].constructor !== Date)  {
        this.populate(parameters[key], values[key]);
      } else if (values[key] != undefined) {
        parameters[key] = values[key];
      }
    }
  }

  public static valuesToArray(value: any) {
    if (value == null) return [];
    const keys = Object.keys(value);
    return keys.map(key => ({name: key, value: value[key]}));
  }

  public static identifierPath(parent: string, name: string) {
    return parent ? parent + "." + name : name;
  }
}
