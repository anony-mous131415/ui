import { Component, OnInit } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DateRange } from '@app/shared/_models/date.range.model';
import { DateRangePickerService } from '@app/shared/_services/date-range-picker.service';

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent implements OnInit {

  public month: number = new Date().getUTCMonth();
  public year: number = new Date().getUTCFullYear();
  public date: number = new Date().getUTCDate();

  public today: Date = new Date(this.year, this.month, this.date);

  //Restricting dates in custom calender
  public minDate: Date = new Date(this.year, this.month - 3, this.date);
  public maxDate: Date = new Date(this.year, this.month, this.date);

  public todayStart: Date = this.today;
  public todayEnd: Date = this.today;

  public yesterdayStart: Date = new Date(this.year, this.month, this.date - 1);
  public yesterdayEnd: Date = new Date(this.year, this.month, this.date - 1);

  public last7DaysStart: Date = new Date(this.year, this.month, this.date - 7);
  public last7DaysEnd: Date = new Date(this.year, this.month, this.date - 1);

  public last14DaysStart: Date = new Date(this.year, this.month, this.date - 14);
  public last14DaysEnd: Date = new Date(this.year, this.month, this.date - 1);

  public last30DaysStart: Date = new Date(this.year, this.month, this.date - 30);
  public last30DaysEnd: Date = new Date(this.year, this.month, this.date - 1);

  public last60DaysStart: Date = new Date(this.year, this.month, this.date - 60);
  public last60DaysEnd: Date = new Date(this.year, this.month, this.date - 1);

  public last90DaysStart: Date = new Date(this.year, this.month, this.date - 90);
  public last90DaysEnd: Date = new Date(this.year, this.month, this.date - 1);

  public thisQuarterStart: Date = new Date(this.year, Math.floor(this.month/3)*3, 1);
  public thisQuarterEnd: Date = new Date(this.year,this.month, this.date -1);

  public monthStart: Date = new Date(this.year, this.month, 1);
  public monthEnd: Date = this.today;

  public lastStart: Date = new Date(new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(1)).toDateString());
  public lastEnd: Date = new Date(new Date(new Date(new Date().setMonth(new Date().getMonth())).setDate(0)).toDateString());

  public dateRange: Date[];

  public selectedDateRange = {} as DateRange;

  constructor(private drpService: DateRangePickerService) { }

  ngOnInit() {
    this.initializeDateRangePicker();
  }

  initializeDateRangePicker() {
    const cachedDateRange = this.drpService.getCachedDateRange();
    this.dateRange = [new Date(cachedDateRange.startDate), new Date(cachedDateRange.endDate)];
  }

  /**
   * Called by changing the data range picker
   */
  changeDateRange(event) {
    const startDate: number = Date.UTC(this.dateRange[0].getFullYear(), this.dateRange[0].getMonth(), this.dateRange[0].getDate());
    const endDate: number = Date.UTC(this.dateRange[1].getFullYear(), this.dateRange[1].getMonth(), this.dateRange[1].getDate());
    // console.log("start date | end date", startDate, endDate);
    this.selectedDateRange.startDate = this.dateRange[0];
    this.selectedDateRange.endDate = this.dateRange[1];
    this.selectedDateRange.startDateEpoch = startDate / 1000;
    // Adding one day to the end day
    this.selectedDateRange.endDateEpoch = endDate / 1000 + 86400;

    // On change of date range it should save in the cache
    localStorage.setItem(AppConstants.CACHED_DATE_RANGE, JSON.stringify(this.selectedDateRange));
    this.drpService.changeDateRange(this.selectedDateRange);
  }
}
