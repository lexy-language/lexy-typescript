"use strict";
const type = function scope() {
  class __Row {
    SearchValue = "";
    ResultNumber = 0;
    ResultString = "";
    ResultBoolean = false;
    ResultDate = new Date("0001-01-01T00:00:00");
    constructor(SearchValue, ResultNumber, ResultString, ResultBoolean, ResultDate) {
      this.SearchValue = SearchValue != undefined ? SearchValue : this.SearchValue;
      this.ResultNumber = ResultNumber != undefined ? ResultNumber : this.ResultNumber;
      this.ResultString = ResultString != undefined ? ResultString : this.ResultString;
      this.ResultBoolean = ResultBoolean != undefined ? ResultBoolean : this.ResultBoolean;
      this.ResultDate = ResultDate != undefined ? ResultDate : this.ResultDate;
    }
  }
  const __values =  [
    new __Row("a",222,"222",false,new Date(2024, 11, 24, 23, 22, 22)),
    new __Row("b",333,"333",true,new Date(2024, 11, 24, 23, 33, 33)),
    new __Row("c",444,"444",false,new Date(2024, 11, 24, 23, 44, 44)),
    new __Row("d",555,"555",true,new Date(2024, 11, 24, 23, 55, 55)),
  ]
  return {
    __Row: __Row,
    Count: __values.length,
    Values: __values
  };
}();

