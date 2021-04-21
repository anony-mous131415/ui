import { Injectable } from '@angular/core';
// import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DateRange } from '@app/shared/_models/date.range.model';
import { Observable, Subject } from 'rxjs';
import { DateRangePickerService } from '@app/shared/_services/date-range-picker.service';

export const DATE_PICKER_PRESETS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST7: 'last7',
  LAST14: 'last14',
  LAST30: 'last30',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  LAST_3_MONTH: 'last3Month',
  PREVIOUS_DAY: 'previousDay',
  PREVIOUS_7_DAYS: 'previous7Days',
  PREVIOUS_14_DAYS: 'previous14Days'
};

export interface DateRangerPickerConfig {
  dateRange: DateRange;
  saveToLocalStorage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SlicexDatePickerService {


  private subject = new Subject<{ id: string, range: DateRange, isCustomDateRange: boolean }>();
  private dateRange = {} as DateRange;

  constructor(
    private dateRangePickerService: DateRangePickerService
  ) { }


  public changeDateRange(identifier: string, dateRange: DateRange, isCustomRange: boolean) {
    this.subject.next({ id: identifier, range: dateRange, isCustomDateRange: isCustomRange });
  }

  /**
   * Date Range change watcher
   * If the date range is changed the subscribed methods will called
   */
  public dateRangeWatcher(): Observable<{ id: string, range: DateRange, isCustomDateRange: boolean }> {
    return this.subject.asObservable();
  }

  public formatDate(date) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const day = date.getUTCDate();
    const monthIndex = date.getUTCMonth();
    const year = date.getUTCFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  public getDateRange(minusInStartDate: number, minusInEndDate: number): DateRange {
    // const currDate = new Date();
    // const month: number = currDate.getUTCMonth();
    // const year: number = currDate.getUTCFullYear();
    // const date: number = currDate.getUTCDate();

    // const dateRange = {} as DateRange;
    // const startDate: Date = new Date(year, month, date - minusInStartDate);
    // const endDate: Date = new Date(year, month, date - minusInEndDate);

    // dateRange.startDate = startDate;
    // dateRange.endDate = endDate;
    // dateRange.startDateEpoch = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) / 1000;
    // dateRange.endDateEpoch = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) / 1000 + 86400;
    // return dateRange;
    return this.dateRangePickerService.getDateRange(minusInStartDate, minusInEndDate);
  }

  public getDateRangeFromDate(inpDate: Date, minusInStartDate: number, minusInEndDate: number): DateRange {
    // const month: number = inpDate.getMonth();
    // const year: number = inpDate.getFullYear();
    // const date: number = inpDate.getDate();

    // const dateRange = {} as DateRange;
    // const startDate: Date = new Date(year, month, date - minusInStartDate);
    // const endDate: Date = new Date(year, month, date - minusInEndDate);

    // dateRange.startDate = startDate;
    // dateRange.endDate = endDate;
    // dateRange.startDateEpoch = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) / 1000;
    // dateRange.endDateEpoch = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) / 1000 + 86400;
    // return dateRange;
    return this.dateRangePickerService.getDateRangeFromDate(inpDate, minusInStartDate, minusInEndDate);
  }

  public getCachedDateRange() {
    // let cachedDateRange = {} as DateRange;

    // const cachedDateRangeStr = localStorage.getItem(AppConstants.CACHED_DATE_RANGE);
    // if (cachedDateRangeStr) {
    //   cachedDateRange = JSON.parse(cachedDateRangeStr);
    //   cachedDateRange.startDate = new Date(cachedDateRange.startDate);
    //   cachedDateRange.endDate = new Date(cachedDateRange.endDate);

    //   return cachedDateRange;
    // }

    // // Setting default Date range to Last 7 days data
    // cachedDateRange = this.getDateRange(7, 1);
    // localStorage.setItem(AppConstants.CACHED_DATE_RANGE, JSON.stringify(cachedDateRange));

    // return cachedDateRange;
    return this.dateRangePickerService.getCachedDateRange();
  }


}
