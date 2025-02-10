import {IExecutionContext} from "./executionContext";
import Decimal from "decimal.js";

export class BuiltInTableFunctions {

  public static lookUp(resultName: string,
                       valueName: string,
                       tableName: string,
                       tableValues: any,
                       condition: any,
                       context: IExecutionContext) {
    let functionName = `Lookup '${resultName}' by '${valueName}' from table '${tableName}'`;
    const row =  BuiltInTableFunctions.lookUpIntern(tableValues, () => true, valueName, condition, context, functionName);
    return row[resultName];
  }

  public static lookUpRow(valueName: string,
                          tableName: string,
                          tableValues: any,
                          condition: any,
                          context: IExecutionContext) {
    let functionName = `Lookup row by '${valueName}' from table '${tableName}'`;
    return BuiltInTableFunctions.lookUpIntern(tableValues, () => true, valueName, condition, context, functionName);
  }

  public static lookUpBy(resultName: string,
                         discriminatorName: string,
                         valueName: string,
                         tableName: string,
                         tableValues: any,
                         discriminator: any,
                         condition: any,
                         context: IExecutionContext) {
    let functionName = `Lookup '${resultName}' by discriminator '${discriminatorName}' and value '${valueName}' from table '${tableName}'`;
    const checkDiscriminator = (row: any) => {
      let discriminatorValue = row[discriminatorName];
      return BuiltInTableFunctions.equals(discriminatorValue, discriminator);
    }
    const row = BuiltInTableFunctions.lookUpIntern(tableValues, checkDiscriminator, valueName, condition, context, functionName);
    return row[resultName];
  }

  public static lookUpRowBy(discriminatorName: string,
                            valueName: string,
                            tableName: string,
                            tableValues: any,
                            discriminator: any,
                            condition: any,
                            context: IExecutionContext) {
    let functionName = `Lookup row by discriminator '${discriminatorName}' and value '${valueName}' from table '${tableName}'`;
    const checkDiscriminator = (row: any) => {
      let discriminatorValue = row[discriminatorName];
      return BuiltInTableFunctions.equals(discriminatorValue, discriminator);
    }
    return BuiltInTableFunctions.lookUpIntern(tableValues, checkDiscriminator, valueName, condition, context, functionName);
  }

  private static lookUpIntern(tableValues: any, checkDiscriminator: (row: any) => boolean, valueName: string, condition: any, context: IExecutionContext, functionName: string) {
    let lastRow = null;

    for (let index = 0; index < tableValues.length; index++) {
      let row = tableValues[index];

      if (!checkDiscriminator(row)) continue;

      let value = row[valueName];
      if (this.equals(value, condition)) {
        context.logChild(`${functionName} returned value from row: ${index + 1}`);
        return row;
      }

      if (this.greaterThan(value, condition)) {
        context.logChild(`${functionName} returned value from previous row: ${index}`);

        if (lastRow == null) {
          throw new Error(`${functionName} failed. Search value '${condition}' not found.`);
        }

        return lastRow;
      }

      lastRow = row;
    }

    if (lastRow == null) {
      throw new Error(`${functionName} failed. Search value '${condition}' not found.`);
    }

    context.logChild(`${functionName} returned value from last row: ${tableValues.length}`);
    return lastRow;
  }

  private static equals(value: any, condition: any) {
    if (toString.call(value) === '[object Decimal]' || value instanceof  Decimal) {
      return value.equals(condition);
    }
    return value == condition;
  }

  private static greaterThan(value: any, condition: any) {
    if (toString.call(value) === '[object Decimal]' || value instanceof  Decimal) {
      return value.greaterThan(condition);
    }
    return value > condition;
  }
}