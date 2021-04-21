import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReportingRequest } from '@revxui/api-client-ts';
import * as moment from 'moment';
import { ReportBuilderService } from '../../../_services/report-builder.service';

@Component({
  selector: 'app-report-builder-date-picker',
  templateUrl: './report-builder-date-picker.component.html',
  styleUrls: ['./report-builder-date-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportBuilderDatePickerComponent implements OnInit {
  @Input() data: any;
  intervalOptions: any;
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

  @ViewChild('msg', { static: true }) msg: ElementRef;
  constructor(
    private reportBuilderService: ReportBuilderService
  ) { }

  ngOnInit() {
    this.intervalOptions = this.data.interval.source.options;
    this.initValues();
    // this.getValueFromService();
    this.setDuration();
  }

  ngAfterViewInit() {
    switch(this.data.limits.unit) {
      case 'DAYS': this.minDate = new Date(this.year, this.month, this.date + this.data.limits.start); break;
      case 'MONTHS': this.minDate = new Date(this.year, this.month + this.data.limits.start, this.date); break;
      case 'YEARS': this.minDate = new Date(this.year + this.data.limits.start, this.month, this.date); break;
    }
  }

  // getValueFromService() {
  //   this.dateRange = this.reportBuilderService.getDateRange(this.key);
  //   this.getDateDiff(this.dateRange);
  //   setTimeout(() => {
  //     this.selectedInterval = this.reportBuilderService.getInterval(this.key);
  //     this.changeInterval();
  //   }, 300);
  // }

  getDateDiff(dateRange) {
    const start = moment(dateRange[0]);
    const end = moment(dateRange[1]);
    const diff = Math.abs(start.diff(end, 'days')) + 1;
    const isPresetValueSelected = this.isPresetValueSelected(dateRange[0], dateRange[1]);
    if (isPresetValueSelected) {
      if (diff === 1) {
        this.intervalArr = this.intervalOptions.slice(0,2);
      } else if (diff > 1 && diff < 7) {
        this.intervalArr = this.intervalOptions.slice(0,3);
      } else if (diff >= 7 && diff < 30) {
        this.intervalArr = this.intervalOptions.slice(0,4);
      } else if (diff >= 30) {
        this.intervalArr = this.intervalOptions.slice(0,5);
      }
    } else {
        this.intervalArr = this.intervalOptions.slice(0,5);
    }
  }

  initValues() {
    const currDate = new Date();
    const year: number = currDate.getUTCFullYear();
    const month: number = currDate.getUTCMonth();
    const date: number = currDate.getUTCDate();
    const today: Date = new Date(year, month, date);
    this.dateRange = [today, today];
    let presetOptions = this.data.presets;
    const isStart = today.getDate();
    presetOptions = presetOptions.map(item=>{
      switch(item.unit) {
        case 'DAYS': 
          item.start = new Date(today.getFullYear(), today.getMonth(), item.start === 'FIRST' ? 1 : today.getDate() + item.start); 
          item.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + ( item.start === 'FIRST' && isStart ===1 ? -1 : item.end));
          break;
        case 'MONTHS': 
          item.start = new Date(today.getFullYear(), today.getMonth() + item.start, item.end === 'LAST' ? 1 : today.getDate());
          item.end = new Date(today.getFullYear(), today.getMonth() + (item.end === 'LAST' ? 0 : item.end), item.end === 'LAST' ? 0 : today.getDate());
          break;
        case 'YEARS': 
          item.start = new Date(today.getFullYear() + item.start, today.getMonth(), today.getDate()); 
          item.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (item.end === 'YESTERDAY' ? -1 : 0));
          break;
      }
      return item;
    });
    this.presets = presetOptions;
    this.intervalArr = this.intervalOptions.slice(0,2);
  }

  changeDateRange(event) {
    const isPresetValueSelected = this.isPresetValueSelected(event.startDate, event.endDate);
    if (isPresetValueSelected) {
      if (event.daySpan === 1) {
        this.intervalArr = this.intervalOptions.slice(0,2);
      } else if (event.daySpan > 1 && event.daySpan < 7) {
        this.intervalArr = this.intervalOptions.slice(0,3);
      } else if (event.daySpan >= 7 && event.daySpan < 30) {
        this.intervalArr = this.intervalOptions.slice(0,4);
      } else if (event.daySpan >= 30) {
        this.intervalArr = this.intervalOptions.slice(0,5);
      }
    } else {
        this.intervalArr = this.intervalOptions.slice(0,5);
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
    this.reportBuilderService.setDuration(this.dateRange, this.data.id);
  }

  setInterval() {
    this.reportBuilderService.setInterval(this.selectedInterval, this.data.id);
  }

  isPresetValueSelected(inpStartDate: Date, inpEndDate: Date): boolean {
    const inputStartTime = inpStartDate.getTime();
    const startTimeArr = [];
    const inputEndTime = inpEndDate.getTime();
    const endTimeArr = [];
    this.presets.forEach(item=> {
      startTimeArr.push(item.start.getTime());
      endTimeArr.push(item.end.getTime());
    });
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
