export class BuiltInDateFunctions {

  private static readonly millisecondsInDay = 86400000;
  private static readonly millisecondsInHour = 3600000;
  private static readonly millisecondsInMinute = 60000;

  public static now(): Date {
    return new Date();
  }

  public static today(): Date {
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDay());
  }

  public static year(value: Date): number {
    return value.getFullYear();
  }

  public static month(value: Date): number {
    return value.getMonth() + 1;
  }

  public static day(value: Date): number {
    return value.getDate();
  }

  public static hour(value: Date): number {
    return value.getHours();
  }

  public static minute(value: Date): number {
    return value.getMinutes();
  }

  public static second(value: Date): number {
    return value.getSeconds();
  }

  public static years(end: Date, start: Date): number {
    return BuiltInDateFunctions.differenceInYears(end, start);
  }

  public static months(end: Date, start: Date): number {
    return BuiltInDateFunctions.differenceInMonths(end, start);
  }

  public static days(end: Date, start: Date): number {
    return BuiltInDateFunctions.differenceInDays(end, start);
  }

  public static hours(end: Date, start: Date): number {
    return BuiltInDateFunctions.differenceInHours(end, start);
  }

  public static minutes(end: Date, start: Date): number {
    return BuiltInDateFunctions.differenceInMinutes(end, start);
  }

  public static seconds(end: Date, start: Date): number {
    return BuiltInDateFunctions.differenceInSeconds(end, start);
  }

  public static milliseconds(end: Date, start: Date): number {
    return BuiltInDateFunctions.differenceInMilliseconds(end, start);
  }

  private static differenceInCalendarYears(laterDate: Date, earlierDate: Date): number {
    return laterDate.getFullYear() - earlierDate.getFullYear();
  }

  private static compareAsc(dateLeft: Date, dateRight: Date): number {
    const diff = +dateLeft - +dateRight;

    if (diff < 0) return -1;
    else if (diff > 0) return 1;

    // Return 0 if diff is 0; return NaN if diff is NaN
    return diff;
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

  private static round(number: number): number{
    const result = Math.trunc(number);
    // Prevent negative zero
    return result === 0 ? 0 : result;
  };

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

  private static differenceInYears(laterDate: Date, earlierDate: Date,): number {

    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    // -1 if the left date is earlier than the right date
    // 2023-12-31 - 2024-01-01 = -1
    const sign = BuiltInDateFunctions.compareAsc(laterDate_, earlierDate_);

    // First calculate the difference in calendar years
    // 2024-01-01 - 2023-12-31 = 1 year
    const diff = Math.abs(BuiltInDateFunctions.differenceInCalendarYears(laterDate_, earlierDate_));

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
    const partial = BuiltInDateFunctions.compareAsc(laterDate_, earlierDate_) === -sign;

    const result = sign * (diff - +partial);

    // Prevent negative zero
    return result === 0 ? 0 : result;
  }

  private static differenceInCalendarMonths(laterDate: Date, earlierDate: Date): number {
    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    const yearsDiff = laterDate_.getFullYear() - earlierDate_.getFullYear();
    const monthsDiff = laterDate_.getMonth() - earlierDate_.getMonth();

    return yearsDiff * 12 + monthsDiff;
  }

  private static differenceInMonths(laterDate: Date, earlierDate: Date): number {
    const laterDate_ = new Date(laterDate);
    const workingLaterDate = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    const sign = BuiltInDateFunctions.compareAsc(workingLaterDate, earlierDate_);
    const difference = Math.abs(
      BuiltInDateFunctions.differenceInCalendarMonths(workingLaterDate, earlierDate_),
    );

    if (difference < 1) return 0;

    if (workingLaterDate.getMonth() === 1 && workingLaterDate.getDate() > 27)
      workingLaterDate.setDate(30);

    workingLaterDate.setMonth(workingLaterDate.getMonth() - sign * difference);

    let isLastMonthNotFull = BuiltInDateFunctions.compareAsc(workingLaterDate, earlierDate_) === -sign;

    if (
      BuiltInDateFunctions.isLastDayOfMonth(laterDate_) &&
      difference === 1 &&
      BuiltInDateFunctions.compareAsc(laterDate_, earlierDate_) === 1
    ) {
      isLastMonthNotFull = false;
    }

    const result = sign * (difference - +isLastMonthNotFull);
    return result === 0 ? 0 : result;
  }


  private static differenceInCalendarDays(laterDate: Date, earlierDate: Date): number {
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
    return Math.round((laterTimestamp - earlierTimestamp) / BuiltInDateFunctions.millisecondsInDay);
  }

  private static differenceInDays(laterDate: Date, earlierDate: Date): number {
    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);

    const sign = BuiltInDateFunctions.compareLocalAsc(laterDate_, earlierDate_);
    const difference = Math.abs(
      BuiltInDateFunctions.differenceInCalendarDays(laterDate_, earlierDate_),
    );

    laterDate_.setDate(laterDate_.getDate() - sign * difference);

    // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
    // If so, result must be decreased by 1 in absolute value
    const isLastDayNotFull = Number(
      BuiltInDateFunctions.compareLocalAsc(laterDate_, earlierDate_) === -sign,
    );

    const result = sign * (difference - isLastDayNotFull);
    // Prevent negative zero
    return result === 0 ? 0 : result;
  }

  // Like `compareAsc` but uses local time not UTC, which is needed
  // for accurate equality comparisons of UTC timestamps that end up
  // having the same representation in local time, e.g. one hour before
  // DST ends vs. the instant that DST ends.
  private static compareLocalAsc(laterDate: Date, earlierDate: Date): number {
    const diff =
      laterDate.getFullYear() - earlierDate.getFullYear() ||
      laterDate.getMonth() - earlierDate.getMonth() ||
      laterDate.getDate() - earlierDate.getDate() ||
      laterDate.getHours() - earlierDate.getHours() ||
      laterDate.getMinutes() - earlierDate.getMinutes() ||
      laterDate.getSeconds() - earlierDate.getSeconds() ||
      laterDate.getMilliseconds() - earlierDate.getMilliseconds();

    if (diff < 0) return -1;
    if (diff > 0) return 1;

    // Return 0 if diff is 0; return NaN if diff is NaN
    return diff;
  }

  private static differenceInHours(laterDate: Date, earlierDate: Date): number {
    const laterDate_ = new Date(laterDate);
    const earlierDate_ = new Date(earlierDate);
    const diff = (+laterDate_ - +earlierDate_) / BuiltInDateFunctions.millisecondsInHour;
    return BuiltInDateFunctions.round(diff);
  }

  private static differenceInMinutes(laterDate: Date, earlierDate: Date): number {
    const diff =
      BuiltInDateFunctions.differenceInMilliseconds(laterDate, earlierDate) / BuiltInDateFunctions.millisecondsInMinute;
    return BuiltInDateFunctions.round(diff);
  }

  private static differenceInSeconds(laterDate: Date, earlierDate: Date): number {
    const diff = BuiltInDateFunctions.differenceInMilliseconds(laterDate, earlierDate) / 1000;
    return BuiltInDateFunctions.round(diff);
  }

  private static differenceInMilliseconds(laterDate: Date, earlierDate: Date): number {
    return +laterDate - +earlierDate;
  }
}
