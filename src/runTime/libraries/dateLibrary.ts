import Decimal from "decimal.js";
import {LibraryRuntime, Types} from "./libraryRuntime";

const millisecondsInDay = 86400000;
const millisecondsInHour = 3600000;
const millisecondsInMinute = 60000;

function compareAsc(dateLeft: Date, dateRight: Date): Decimal {
  const diff = +dateLeft - +dateRight;

  if (diff < 0) return Decimal(-1);
  else if (diff > 0) return Decimal(1);

  // Return 0 if diff is 0; return NaN if diff is NaN
  return Decimal(diff);
}

function startOfDay(date: Date): Date {
  const _date = new Date(date);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

function endOfDay(date: Date): Date {
  const _date = new Date(date);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

function endOfMonth(date: Date): Date {
  const _date = new Date(date);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

function isLastDayOfMonth(date: Date): boolean {
  const _date = new Date(date);
  return +endOfDay(_date) === +endOfMonth(_date);
}

function getTimezoneOffsetInMilliseconds(date: Date): number {
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

function differenceInCalendarYears(laterDate: Date, earlierDate: Date): Decimal {
  return Decimal(laterDate.getFullYear()).sub(earlierDate.getFullYear());
}

function differenceInYears(laterDate: Date, earlierDate: Date,): Decimal {

  const laterDate_ = new Date(laterDate);
  const earlierDate_ = new Date(earlierDate);

  // -1 if the left date is earlier than the right date
  // 2023-12-31 - 2024-01-01 = -1
  const sign = compareAsc(laterDate_, earlierDate_);

  // First calculate the difference in calendar years
  // 2024-01-01 - 2023-12-31 = 1 year
  const diff = differenceInCalendarYears(laterDate_, earlierDate_).abs();

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
  const partial = compareAsc(laterDate_, earlierDate_).equals(sign.negated());

  return sign.mul(diff.sub(+partial));
}

function differenceInCalendarMonths(laterDate: Date, earlierDate: Date): Decimal {
  const laterDate_ = new Date(laterDate);
  const earlierDate_ = new Date(earlierDate);

  const yearsDiff = Decimal(laterDate_.getFullYear() - earlierDate_.getFullYear());
  const monthsDiff = Decimal(laterDate_.getMonth() - earlierDate_.getMonth());

  return yearsDiff.mul(12).add(monthsDiff);
}

function differenceInMonths(laterDate: Date, earlierDate: Date): Decimal {
  const laterDate_ = new Date(laterDate);
  const workingLaterDate = new Date(laterDate);
  const earlierDate_ = new Date(earlierDate);

  const sign = compareAsc(workingLaterDate, earlierDate_);
  const difference = differenceInCalendarMonths(workingLaterDate, earlierDate_).abs();

  if (difference.lessThan(1)) return Decimal(0);

  if (workingLaterDate.getMonth() === 1 && workingLaterDate.getDate() > 27)
    workingLaterDate.setDate(30);

  workingLaterDate.setMonth(workingLaterDate.getMonth() - sign.mul(difference).toNumber());

  let isLastMonthNotFull = compareAsc(workingLaterDate, earlierDate_).equals(sign.negated());

  if (
    isLastDayOfMonth(laterDate_) &&
    difference.equals(1) &&
    compareAsc(laterDate_, earlierDate_).equals(1)
  ) {
    isLastMonthNotFull = false;
  }

  return sign.mul(difference.sub(+isLastMonthNotFull));
}

function differenceInCalendarDays(laterDate: Date, earlierDate: Date): Decimal {
  const laterDate_ = new Date(laterDate);
  const earlierDate_ = new Date(earlierDate);

  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);

  const laterTimestamp =
    +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp =
    +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);

  // Round the number of days to the nearest integer because the number of
  // milliseconds in a day is not constant (e.g. it's different in the week of
  // the daylight saving time clock shift).
  return Decimal((laterTimestamp - earlierTimestamp) / millisecondsInDay).round();
}

function differenceInDays(laterDate: Date, earlierDate: Date): Decimal {
  const laterDate_ = new Date(laterDate);
  const earlierDate_ = new Date(earlierDate);

  const sign = compareLocalAsc(laterDate_, earlierDate_);
  const difference = differenceInCalendarDays(laterDate_, earlierDate_).abs();

  laterDate_.setDate(laterDate_.getDate() - sign.mul(difference).toNumber());

  // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
  // If so, result must be decreased by 1 in absolute value
  const isLastDayNotFull = Number(
    compareLocalAsc(laterDate_, earlierDate_).equals(-sign),
  );

  return sign.mul(difference.sub(isLastDayNotFull));
}

// Like `compareAsc` but uses local time not UTC, which is needed
// for accurate equality comparisons of UTC timestamps that end up
// having the same representation in local time, e.g. one hour before
// DST ends vs. the instant that DST ends.
function compareLocalAsc(laterDate: Date, earlierDate: Date): Decimal {
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

function differenceInHours(laterDate: Date, earlierDate: Date): Decimal {
  const laterDate_ = new Date(laterDate);
  const earlierDate_ = new Date(earlierDate);
  const diff = Decimal(+laterDate_ - +earlierDate_).div(millisecondsInHour);
  return diff.round();
}

function differenceInMinutes(laterDate: Date, earlierDate: Date): Decimal {
  const diff =
    differenceInMilliseconds(laterDate, earlierDate).div(millisecondsInMinute);
  return diff.round();
}

function differenceInSeconds(laterDate: Date, earlierDate: Date): Decimal {
  const diff = differenceInMilliseconds(laterDate, earlierDate).div(1000);
  return diff.round();
}

function differenceInMilliseconds(laterDate: Date, earlierDate: Date): Decimal {
  return Decimal(+laterDate - +earlierDate);
}

function format(value: Date): string {
  return value.getFullYear()
    + "-" + ("0" + (value.getMonth() + 1)).slice(-2)
    + "-" + ("0" + value.getDate()).slice(-2)
    + " " + ("0" + value.getHours()).slice(-2)
    + ":" + ("0" + value.getMinutes()).slice(-2)
    + ":" + ("0" + value.getSeconds()).slice(-2)
}

function now(): Date {
  return new Date();
}

function today(): Date {
  let now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function year(value: Date): Decimal {
  return Decimal(value.getFullYear());
}

function month(value: Date): Decimal {
  return Decimal(value.getMonth() + 1);
}

function day(value: Date): Decimal {
  return Decimal(value.getDate());
}

function hour(value: Date): Decimal {
  return Decimal(value.getHours());
}

function minute(value: Date): Decimal {
  return Decimal(value.getMinutes());
}

function second(value: Date): Decimal {
  return Decimal(value.getSeconds());
}

function millisecond(value: Date): Decimal {
  return Decimal(value.getMilliseconds());
}

function years(end: Date, start: Date): Decimal {
  return differenceInYears(end, start);
}

function months(end: Date, start: Date): Decimal {
  return differenceInMonths(end, start);
}

function days(end: Date, start: Date): Decimal {
  return differenceInDays(end, start);
}

function hours(end: Date, start: Date): Decimal {
  return differenceInHours(end, start);
}

function minutes(end: Date, start: Date): Decimal {
  return differenceInMinutes(end, start);
}

function seconds(end: Date, start: Date): Decimal {
  return differenceInSeconds(end, start);
}

export function milliseconds(end: Date, start: Date): Decimal {
  return differenceInMilliseconds(end, start);
}

const singleDateReturnsNumber = {
  returnType: Types.Number,
  args: [Types.Date]
};

const doubleDateReturnsNumber = {
  returnType: Types.Number,
  args: [Types.Date, Types.Date]
};

const functionsInfo ={
  Format: {
    returnType: Types.String,
    args: [Types.Date]
  },
  Now: {
    returnType: Types.Date,
    args: []
  },
  Today: {
    returnType: Types.Date,
    args: []
  },
  Year: singleDateReturnsNumber,
  Month: singleDateReturnsNumber,
  Day: singleDateReturnsNumber,
  Hour: singleDateReturnsNumber,
  Minute: singleDateReturnsNumber,
  Second: singleDateReturnsNumber,
  Millisecond: singleDateReturnsNumber,
  Years: doubleDateReturnsNumber,
  Months: doubleDateReturnsNumber,
  Days: doubleDateReturnsNumber,
  Hours: doubleDateReturnsNumber,
  Minutes: doubleDateReturnsNumber,
  Seconds: doubleDateReturnsNumber,
  Milliseconds: doubleDateReturnsNumber,
}

export const DateLibrary: LibraryRuntime = {
  name: "Date",
  functions: {
    Format: format,

    Now: now,
    Today: today,

    Year: year,
    Month: month,
    Day: day,
    Hour: hour,
    Minute: minute,
    Second: second,
    Millisecond: millisecond,

    Years: years,
    Months: months,
    Days: days,
    Hours: hours,
    Minutes: minutes,
    Seconds: seconds,
    Milliseconds: milliseconds,
  },
  functionsInfo: functionsInfo
};