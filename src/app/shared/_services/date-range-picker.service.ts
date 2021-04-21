import { Injectable } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { Observable, Subject } from 'rxjs';
import { DateRange } from '../_models/date.range.model';

@Injectable({
  providedIn: 'root'
})
export class DateRangePickerService {

  private subject = new Subject<DateRange>();
  private dateRange = {} as DateRange;

  constructor() { }


  public changeDateRange(range: DateRange) {
    // console.log("change range in date range sesrvice");
    // let result=this.subject.next(range);
    // console.log(result);
    this.subject.next(range);
  }

  /**
   * Date Range change watcher
   * If the date range is changed the subscribed methods will called
   */
  public dateRangeWatcher(): Observable<DateRange> {
    return this.subject.asObservable();
  }

  /**
   * 
   * @param date input dta
   * format date into ui displayable form
   */
  public formatDate(date) {
    var monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  /**
   * 
   * @param minusInStartDate 
   * @param minusInEndDate 
   * get date object from subtracting the input params from todays UTC date
   */
  public getDateRange(minusInStartDate: number, minusInEndDate: number): DateRange {
    let month: number = new Date().getUTCMonth();
    let year: number = new Date().getUTCFullYear();
    let date: number = new Date().getUTCDate();

    let dateRange = {} as DateRange;
    let startDate: Date = new Date(year, month, date - minusInStartDate);
    let endDate: Date = new Date(year, month, date - minusInEndDate);

    dateRange.startDate = startDate;
    dateRange.endDate = endDate;
    dateRange.startDateEpoch = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) / 1000;
    dateRange.endDateEpoch = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) / 1000 + 86400;
    return dateRange;
  }

  /**
   * 
   * @param inpDate 
   * @param minusInStartDate 
   * @param minusInEndDate 
   * given an input date
   * form the date object
   */
  public getDateRangeFromDate(inpDate: Date, minusInStartDate: number, minusInEndDate: number): DateRange {
    let month: number = inpDate.getMonth();
    let year: number = inpDate.getFullYear();
    let date: number = inpDate.getDate();

    let dateRange = {} as DateRange;
    let startDate: Date = new Date(year, month, date - minusInStartDate);
    let endDate: Date = new Date(year, month, date - minusInEndDate);

    dateRange.startDate = startDate;
    dateRange.endDate = endDate;
    dateRange.startDateEpoch = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) / 1000;
    dateRange.endDateEpoch = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) / 1000 + 86400;
    return dateRange;
  }


  /**
   * form date object form key-value pair in local-storage
   */
  public getCachedDateRange() {
    let cachedDateRange = {} as DateRange;

    // let cachedDateRangeStr = localStorage.getItem(AppConstants.CACHED_DATE_RANGE);
    if (localStorage.getItem(AppConstants.CACHED_DATE_RANGE)) {
      cachedDateRange = JSON.parse(localStorage.getItem(AppConstants.CACHED_DATE_RANGE));
      cachedDateRange.startDate = new Date(cachedDateRange.startDate);
      cachedDateRange.endDate = new Date(cachedDateRange.endDate);

      return cachedDateRange;
    }

    //Setting default Date range to Last 7 days data
    cachedDateRange = this.getDateRange(7, 1);
    localStorage.setItem(AppConstants.CACHED_DATE_RANGE, JSON.stringify(cachedDateRange));

    return cachedDateRange;
  }
}


