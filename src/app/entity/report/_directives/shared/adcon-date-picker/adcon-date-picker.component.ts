import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AdvancedUiService } from '@app/entity/report/_services/advanced-ui.service';
import { ReportingRequest } from '@revxui/api-client-ts';
import * as moment from 'moment';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConvUiService } from '@app/entity/report/_services/conv-ui.service';

@Component({
  selector: 'app-adcon-date-picker',
  templateUrl: './adcon-date-picker.component.html',
  styleUrls: ['./adcon-date-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdconDatePickerComponent implements OnInit {

  @Input() showInterval: any;
  @Input() type: any;

  dayInterval: any[] = [
    { value: ReportingRequest.IntervalEnum.None, label: 'None' },
    { value: ReportingRequest.IntervalEnum.Hourly, label: 'Hourly' },
  ];

  nonWeekInterval: any[] = [
    { value: ReportingRequest.IntervalEnum.None, label: 'None' },
    { value: ReportingRequest.IntervalEnum.Hourly, label: 'Hourly' },
    { value: ReportingRequest.IntervalEnum.Daily, label: 'Daily' },
  ];

  weekInterval: any[] = [
    { value: ReportingRequest.IntervalEnum.None, label: 'None' },
    { value: ReportingRequest.IntervalEnum.Hourly, label: 'Hourly' },
    { value: ReportingRequest.IntervalEnum.Daily, label: 'Daily' },
    { value: ReportingRequest.IntervalEnum.Weekly, label: 'Weekly' },
  ];

  monthInterval: any[] = [
    { value: ReportingRequest.IntervalEnum.None, label: 'None' },
    { value: ReportingRequest.IntervalEnum.Hourly, label: 'Hourly' },
    { value: ReportingRequest.IntervalEnum.Daily, label: 'Daily' },
    { value: ReportingRequest.IntervalEnum.Weekly, label: 'Weekly' },
    { value: ReportingRequest.IntervalEnum.Monthly, label: 'Monthly' },
  ];

  intervalArr: any[] = [];
  presets: any[] = [];
  public month: number = new Date().getMonth();
  public year: number = new Date().getFullYear();
  public date: number = new Date().getDate();

  dateRange: Date[]; // used to make duration array
  selectedInterval: any = 'none';

  // Restricting dates in custom calender
  // public minDate: Date = new Date(this.year, this.month - 3, 1);
  public maxDate: Date = new Date(this.year, this.month, this.date);
  public minDate: Date = new Date(this.year - 1, this.month, this.date);


  todayStart: Date = null;
  todayEnd: Date = null;
  yesterdayStart: Date = null;
  yesterdayEnd: Date = null;
  last7DaysStart: Date = null;
  last7DaysEnd: Date = null;
  last15DaysStart: Date = null;
  last15DaysEnd: Date = null;
  lastMonthStart: Date = null;
  lastMonthEnd: Date = null;
  last3MonthsStart: Date = null;
  last3MonthsEnd: Date = null;
  tillNowStart: Date = null;
  tillNowEnd: Date = null;
  monthStart: Date = null;
  monthEnd: Date = null;

  @ViewChild('msg', { static: true }) msg: ElementRef;
  constructor(
    private advancedService: AdvancedUiService,
    private conversionService: ConvUiService
  ) { }

  ngOnInit() {
    this.initValues();
    this.getValueFromService();
    this.setDuration();
  }

  getValueFromService() {

    const serviceUsed = (this.type === AppConstants.REPORTS.ADVANCED) ? this.advancedService : this.conversionService;

    this.dateRange = serviceUsed.getDateRange();
    this.getDateDiff(this.dateRange);
    setTimeout(() => {
      this.selectedInterval = serviceUsed.getInterval();
      this.changeInterval();
    }, 300);


  }

  getDateDiff(dateRange) {
    const start = moment(dateRange[0]);
    const end = moment(dateRange[1]);
    const diff = Math.abs(start.diff(end, 'days')) + 1;

    const isPresetValueSelected = this.isPresetValueSelected(dateRange[0], dateRange[1]);

    if (isPresetValueSelected) {
      if (diff === 1) {
        this.intervalArr = this.dayInterval;
      } else if (diff > 1 && diff < 7) {
        this.intervalArr = this.nonWeekInterval;
      } else if (diff >= 7 && diff < 30) {
        this.intervalArr = this.weekInterval;
      } else if (diff >= 30) {
        this.intervalArr = this.monthInterval;
      }
    } else {
      this.intervalArr = this.monthInterval;
    }
  }

  initValues() {
    const currDate = new Date();

    const year: number = currDate.getUTCFullYear();
    const month: number = currDate.getUTCMonth();
    const date: number = currDate.getUTCDate();

    const today: Date = new Date(year, month, date);

    this.dateRange = [today, today];

    this.todayStart = today;
    this.todayEnd = today;

    this.yesterdayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    this.yesterdayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    // this.yesterdayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(),
    // today.getMinutes(), today.getSeconds() - 2);


    this.last7DaysStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    this.last7DaysEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    this.last15DaysStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15);
    this.last15DaysEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    this.lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    this.lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    this.last3MonthsStart = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    this.last3MonthsEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    this.tillNowStart = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    this.tillNowEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    this.monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const isStart = today.getDate();

    if (isStart === 1) {
      // If today is the 1st of the month then (monthEnd.Date) should be same as (Month.Start)
      this.monthEnd = this.monthStart;
    } else {
      // If today is NOT the 1st of the month then (monthEnd.Date) should be (monthStart -1)
      this.monthEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    }

    const presetOptions = [
      {
        id: 'today',
        label: 'Today',
        start: this.todayStart,
        end: this.todayEnd,
        priority: 1
      },
      {
        id: 'yesterday',
        label: 'Yesterday',
        start: this.yesterdayStart,
        end: this.yesterdayEnd,
        priority: 2
      },
      {
        id: 'last7',
        label: 'Last 7 days',
        start: this.last7DaysStart,
        end: this.last7DaysEnd,
        priority: 3
      },
      {
        id: 'last15',
        label: 'Last 15 days',
        start: this.last15DaysStart,
        end: this.last15DaysEnd,
        priority: 4
      },
      {
        id: 'thisMonth',
        label: 'This Month',
        start: this.monthStart,
        end: this.monthEnd,
        priority: 6
      },
      {
        id: 'lastMonth',
        label: 'Last Month',
        start: this.lastMonthStart,
        end: this.lastMonthEnd,
        priority: 7
      },
      {
        id: 'last3Month',
        label: 'Last 3 Months',
        start: this.last3MonthsStart,
        end: this.last3MonthsEnd,
        priority: 8
      },
      {
        id: 'tillNow',
        label: 'Till Now',
        start: this.tillNowStart,
        end: this.tillNowEnd,
        priority: 9
      },
    ];

    if (this.type === AppConstants.REPORTS.CONVERSION) {
      presetOptions.splice(0, 1);
    }

    this.presets = presetOptions;
    this.intervalArr = this.dayInterval;
  }

  changeDateRange(event) {

    const isPresetValueSelected = this.isPresetValueSelected(event.startDate, event.endDate);

    if (isPresetValueSelected) {
      if (event.daySpan === 1) {
        this.intervalArr = this.dayInterval;
      } else if (event.daySpan > 1 && event.daySpan < 7) {
        this.intervalArr = this.nonWeekInterval;
      } else if (event.daySpan >= 7 && event.daySpan < 30) {
        this.intervalArr = this.weekInterval;
      } else if (event.daySpan >= 30) {
        this.intervalArr = this.monthInterval;
      }
    } else {
      this.intervalArr = this.monthInterval;
    }
    this.setDuration();
  }

  changeInterval() {
    this.showIntervalMessage();
    this.setInterval();

    // reset min-max selectable range on ui
    const currDate = new Date();
    const year: number = currDate.getUTCFullYear();
    const month: number = currDate.getUTCMonth();
    const date: number = currDate.getUTCDate();

    const today: Date = new Date(year, month, date);
    const last30DaysStart: Date = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const last6MonthsStart: Date = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const last1YearStart: Date = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    switch (this.selectedInterval) {

      case ReportingRequest.IntervalEnum.None:
        break;

      case ReportingRequest.IntervalEnum.Hourly:
        this.minDate = last30DaysStart;
        this.maxDate = today;
        this.updateMinMaxDates();
        break;

      case ReportingRequest.IntervalEnum.Daily:
      case ReportingRequest.IntervalEnum.Weekly:
        this.minDate = last6MonthsStart;
        this.maxDate = today;
        this.updateMinMaxDates();
        break;

      case ReportingRequest.IntervalEnum.Monthly:
        this.minDate = last1YearStart;
        this.maxDate = today;
        this.updateMinMaxDates();
        break;
    }

  }

  updateMinMaxDates() {
    const selectedRangeBegin = this.dateRange[0];
    const selectedRangeEnd = this.dateRange[1];

    if (this.minDate <= selectedRangeBegin && selectedRangeEnd <= this.maxDate) {
      // no change required
    } else if (this.minDate > selectedRangeBegin && selectedRangeEnd <= this.maxDate) {
      // minRange if before permitted minDate and maxRange is fine
      this.dateRange = [this.minDate, selectedRangeEnd];
    } else if (this.minDate <= selectedRangeBegin && selectedRangeEnd > this.maxDate) {
      // minRange if fine  and maxRange is after permitted maxDate
      this.dateRange = [selectedRangeBegin, this.maxDate];
    } else {
      // both lie outside permitted dateRange
      this.dateRange = [this.minDate, this.maxDate];
    }
  }

  showIntervalMessage() {
    const currDate = new Date();

    const year: number = currDate.getUTCFullYear();
    const month: number = currDate.getUTCMonth();
    const date: number = currDate.getUTCDate();

    if (this.selectedInterval === ReportingRequest.IntervalEnum.Hourly) {
      const oneMonthAgo = moment(new Date(year, month - 1, date - 1)).format('DD MMM YYYY');
      const text = 'Data is available only from <strong class="text-primary">' + oneMonthAgo + '</strong>';
      this.msg.nativeElement.innerHTML = text;
      this.msg.nativeElement.classList.add('bg-warning');
    } else {
      this.msg.nativeElement.innerHTML = '';
      this.msg.nativeElement.classList.remove('bg-warning');
    }
  }

  setDuration() {
    if (this.type === AppConstants.REPORTS.ADVANCED) {
      this.advancedService.setDuration(this.dateRange);
    } else if (this.type === AppConstants.REPORTS.CONVERSION) {
      this.conversionService.setDuration(this.dateRange);
    }
  }

  setInterval() {
    if (this.type === AppConstants.REPORTS.ADVANCED) {
      this.advancedService.setInterval(this.selectedInterval);
    } else if (this.type === AppConstants.REPORTS.CONVERSION) {
      // interval not required in conv. reports
    }
  }

  isPresetValueSelected(inpStartDate: Date, inpEndDate: Date): boolean {

    const inputStartTime = inpStartDate.getTime();
    const startTimeArr = [];
    startTimeArr.push(this.todayStart.getTime());
    startTimeArr.push(this.yesterdayStart.getTime());
    startTimeArr.push(this.last7DaysStart.getTime());
    startTimeArr.push(this.last15DaysStart.getTime());
    startTimeArr.push(this.lastMonthStart.getTime());
    startTimeArr.push(this.last3MonthsStart.getTime());
    startTimeArr.push(this.monthStart.getTime());
    startTimeArr.push(this.tillNowStart.getTime());


    const inputEndTime = inpEndDate.getTime();
    const endTimeArr = [];
    endTimeArr.push(this.todayEnd.getTime());
    endTimeArr.push(this.yesterdayEnd.getTime());
    endTimeArr.push(this.last7DaysEnd.getTime());
    endTimeArr.push(this.last15DaysEnd.getTime());
    endTimeArr.push(this.lastMonthEnd.getTime());
    endTimeArr.push(this.last3MonthsEnd.getTime());
    endTimeArr.push(this.monthEnd.getTime());
    endTimeArr.push(this.tillNowEnd.getTime());

    let returnVal = false;
    for (let i = 0; i < startTimeArr.length; i++) {
      const startTime = startTimeArr[i];
      const endTime = endTimeArr[i];
      if (inputStartTime === startTime && inputEndTime === endTime) {
        returnVal = true;
      }
    }
    return returnVal;
  }

}
