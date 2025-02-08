import Decimal from 'decimal.js';

export class BuiltInNumberFunctions {

  public static int(value: Decimal): Decimal {
    return value.floor();
  }

  public static abs(value: Decimal): Decimal {
    return value.abs();
  }

  public static power(number: Decimal, power: Decimal): Decimal {
    return number.pow(power);
  }

  public static round(number: Decimal, digits: Decimal): Decimal {
    const factor = new Decimal(10).pow(digits);
    return number.abs()
      .mul(factor)
      .round()
      .div(factor)
      .mul(number.greaterThanOrEqualTo(0) ? 1 : -1);
  }
}
