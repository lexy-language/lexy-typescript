import Decimal from "decimal.js";

export class BuiltInDateFunctions {

  private static readonly millisecondsInDay = 86400000;
  private static readonly millisecondsInHour = 3600000;
  private static readonly millisecondsInMinute = 60000;

  public static format(value: Date): string {
    return value.getFullYear()
      + "-" + ("0" + (value.getMonth() + 1)).slice(-2)
      + "-" + ("0" + value.getDate()).slice(-2)
      + " " + ("0" + value.getHours()).slice(-2)
      + ":" + ("0" + value.getMinutes()).slice(-2)
      + ":" + ("0" + value.getSeconds()).slice(-2)
  }

  public static now(): Date {
    return new Date();
  }

  public static today(): Date {
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  public static year(value: Date): Decimal {
    return Decimal(value.getFullYear());
  }

  public static month(value: Date): Decimal {
    return Decimal(value.getMonth() + 1);
  }

  public static day(value: Date): Decimal {
    return Decimal(value.getDate());
  }

  public static hour(value: Date): Decimal {
    return Decimal(value.getHours());
  }

  public static minute(value: Date): Decimal {
    return Decimal(value.getMinutes());
  }

  public static second(value: Date): Decimal {
    return Decimal(value.getSeconds());
  }

  public static years(end: Date, start: Date): Decimal {
    return BuiltInDateFunctions.differenceInYears(end, start);
  }

  public static months(end: Date, start: Date): Decimal {
    return BuiltInDateFunctions.differenceInMonths(end, start);
  }

  public static days(end: Date, start: Date): Decimal {
    return BuiltInDateFunctions.differenceInDays(end, start);
  }

  public static hours(end: Date, start: Date): Decimal {
    return BuiltInDateFunctions.differenceInHours(end, start);
  }

  public static minutes(end: Date, start: Date): Decimal {
    return BuiltInDateFunctions.differenceInMinutes(end, start);
  }

  public static seconds(end: Date, start: Date): Decimal {
    return BuiltInDateFunctions.differenceInSeconds(end, start);
  }

  public static milliseconds(end: Date, start: Date): Decimal {
    return BuiltInDateFunctions.differenceInMilliseconds(end, start);
  }

  private static differenceInCalendarYears(laterDate: Date, earlierDate: Date): Decimal {
    return Decimal(laterDate.getFullYear()).sub(earlierDate.getFullYear());
  }

  private static compareAsc(dateLeft: Date, dateRight: Date): Decimal {
    const diff = +dateLeft - +dateRight;

    if (diff < 0) return Decimal(-1);
    else if (diff > 0) return Decimal(1);

    // Return 0 if diff is 0; return NaN if diff is NaN
    return Decimal(diff);
  }

  private static startOfDay(date: Date): Date {
    const _date = new Date(date);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  private static endOfDay(date: Date): Date {
    const _date = new Date(date);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  private static endOfMonth(date: Date): Date {
    const _date = new Date(date);
    const month = _date.getMonth();
    _date.setFullYear(_date.getFullYear(), month + 1, 0);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  private static isLastDayOfMonth(date: Date): boolean {
    const _date = new Date(date);
    return +BuiltInDateFunctions.endOfDay(_date) === +BuiltInDateFunctions.endOfMonth(_date);
  }

  private static getTimezoneOffsetInMilliseconds(date: Date): number {
    const _date = new Date(date);
    const utcDate = new Date(
      Date.UTC(
        _date.getFullYear(),
        _date.getMonth(),
        _date.getDate(),
        _date.getHours(),
        _date.getMinutes(),
        _date.getSeconds(),
        _date.getMilliseconds(),
      ),
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
  }

  private static differenceInYears(laterDate: Date, earlierDate: Date,): Decimal {

    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    // -1 if the left date is earlier than the right date
    // 2023-12-31 - 2024-01-01 = -1
    const sign = BuiltInDateFunctions.compareAsc(laterDate_, earlierDate_);

    // First calculate the difference in calendar years
    // 2024-01-01 - 2023-12-31 = 1 year
    const diff = BuiltInDateFunctions.differenceInCalendarYears(laterDate_, earlierDate_).abs();

    // Now we need to calculate if the difference is full. To do that we set
    // both dates to the same year and check if the both date's month and day
    // form a full year.
    laterDate_.setFullYear(1584);
    earlierDate_.setFullYear(1584);

    // For it to be true, when the later date is indeed later than the earlier date
    // (2026-02-01 - 2023-12-10 = 3 years), the difference is full if
    // the normalized later date is also later than the normalized earlier date.
    // In our example, 1584-02-01 is earlier than 1584-12-10, so the difference
    // is partial, hence we need to subtract 1 from the difference 3 - 1 = 2.
    const partial = BuiltInDateFunctions.compareAsc(laterDate_, earlierDate_).equals(sign.negated());

    return sign.mul(diff.sub(+partial));
  }

  private static differenceInCalendarMonths(laterDate: Date, earlierDate: Date): Decimal {
    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    const yearsDiff = Decimal(laterDate_.getFullYear() - earlierDate_.getFullYear());
    const monthsDiff = Decimal(laterDate_.getMonth() - earlierDate_.getMonth());

    return yearsDiff.mul(12).add(monthsDiff);
  }

  private static differenceInMonths(laterDate: Date, earlierDate: Date): Decimal {
    const laterDate_ = new Date(laterDate);
    const workingLaterDate = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    const sign = BuiltInDateFunctions.compareAsc(workingLaterDate, earlierDate_);
    const difference = BuiltInDateFunctions.differenceInCalendarMonths(workingLaterDate, earlierDate_).abs();

    if (difference.lessThan(1)) return Decimal(0);

    if (workingLaterDate.getMonth() === 1 && workingLaterDate.getDate() > 27)
      workingLaterDate.setDate(30);

    workingLaterDate.setMonth(workingLaterDate.getMonth() - sign.mul(difference).toNumber());

    let isLastMonthNotFull = BuiltInDateFunctions.compareAsc(workingLaterDate, earlierDate_).equals(sign.negated());

    if (
      BuiltInDateFunctions.isLastDayOfMonth(laterDate_) &&
      difference.equals(1) &&
      BuiltInDateFunctions.compareAsc(laterDate_, earlierDate_).equals(1)
    ) {
      isLastMonthNotFull = false;
    }

    return sign.mul(difference.sub(+isLastMonthNotFull));
  }

  private static differenceInCalendarDays(laterDate: Date, earlierDate: Date): Decimal {
    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    const laterStartOfDay = BuiltInDateFunctions.startOfDay(laterDate_);
    const earlierStartOfDay = BuiltInDateFunctions.startOfDay(earlierDate_);

    const laterTimestamp =
      +laterStartOfDay - BuiltInDateFunctions.getTimezoneOffsetInMilliseconds(laterStartOfDay);
    const earlierTimestamp =
      +earlierStartOfDay - BuiltInDateFunctions.getTimezoneOffsetInMilliseconds(earlierStartOfDay);

    // Round the number of days to the nearest integer because the number of
    // milliseconds in a day is not constant (e.g. it's different in the week of
    // the daylight saving time clock shift).
    return Decimal((laterTimestamp - earlierTimestamp) / BuiltInDateFunctions.millisecondsInDay).round();
  }

  private static differenceInDays(laterDate: Date, earlierDate: Date): Decimal {
    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    const sign = BuiltInDateFunctions.compareLocalAsc(laterDate_, earlierDate_);
    const difference = BuiltInDateFunctions.differenceInCalendarDays(laterDate_, earlierDate_).abs();

    laterDate_.setDate(laterDate_.getDate() - sign.mul(difference).toNumber());

    // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
    // If so, result must be decreased by 1 in absolute value
    const isLastDayNotFull = Number(
      BuiltInDateFunctions.compareLocalAsc(laterDate_, earlierDate_).equals(-sign),
    );

    return sign.mul(difference.sub(isLastDayNotFull));
  }

  // Like `compareAsc` but uses local time not UTC, which is needed
  // for accurate equality comparisons of UTC timestamps that end up
  // having the same representation in local time, e.g. one hour before
  // DST ends vs. the instant that DST ends.
  private static compareLocalAsc(laterDate: Date, earlierDate: Date): Decimal {
    const diff =
      laterDate.getFullYear() - earlierDate.getFullYear() ||
      laterDate.getMonth() - earlierDate.getMonth() ||
      laterDate.getDate() - earlierDate.getDate() ||
      laterDate.getHours() - earlierDate.getHours() ||
      laterDate.getMinutes() - earlierDate.getMinutes() ||
      laterDate.getSeconds() - earlierDate.getSeconds() ||
      laterDate.getMilliseconds() - earlierDate.getMilliseconds();

    if (diff < 0) return Decimal(-1);
    if (diff > 0) return Decimal(1);

    // Return 0 if diff is 0; return NaN if diff is NaN
    return Decimal(diff);
  }

  private static differenceInHours(laterDate: Date, earlierDate: Date): Decimal {
    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);
    const diff = Decimal(+laterDate_ - +earlierDate_).div(BuiltInDateFunctions.millisecondsInHour);
    return diff.round();
  }

  private static differenceInMinutes(laterDate: Date, earlierDate: Date): Decimal {
    const diff =
      BuiltInDateFunctions.differenceInMilliseconds(laterDate, earlierDate).div(BuiltInDateFunctions.millisecondsInMinute);
    return diff.round();
  }

  private static differenceInSeconds(laterDate: Date, earlierDate: Date): Decimal {
    const diff = BuiltInDateFunctions.differenceInMilliseconds(laterDate, earlierDate).div(1000);
    return diff.round();
  }

  private static differenceInMilliseconds(laterDate: Date, earlierDate: Date): Decimal {
    return Decimal(+laterDate - +earlierDate);
  }
}
