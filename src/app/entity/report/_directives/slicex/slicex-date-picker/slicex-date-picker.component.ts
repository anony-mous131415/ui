import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DateRangerPickerConfig, SlicexDatePickerService } from '@app/entity/report/_services/slicex-date-picker.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DateRange } from '@app/shared/_models/date.range.model';

@Component({
  selector: 'app-slicex-date-picker',
  templateUrl: './slicex-date-picker.component.html',
  styleUrls: ['./slicex-date-picker.component.scss']
})
export class SlicexDatePickerComponent implements OnInit, OnChanges {

  public month: number = new Date().getMonth();
  public year: number = new Date().getFullYear();
  public date: number = new Date().getDate();

  // Restricting dates in custom calender
  public minDate: Date = new Date(this.year, this.month, this.date - 31);
  public maxDate: Date = new Date(this.year, this.month, this.date);

  public dateRange: Date[];

  public selectedDateRange = {} as DateRange;

  public visible = true;

  @Input('identifier') identifier: string;
  @Input('enabled') datePickerEnabled = false;
  @Input('presets') presets: string[] = [];
  @Input('config') config: DateRangerPickerConfig = null;
  @Input('border') border: string = 'secondary';

  constructor(private drpService: SlicexDatePickerService) { }

  ngOnInit() {
    this.initializeDateRangePicker();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.handlePresetChanges(changes);
    this.handleConfigChanges(changes);
  }

  initializeDateRangePicker() {
    const cachedDateRange = (this.config.dateRange) ? this.config.dateRange : this.drpService.getCachedDateRange();
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
    if (this.config.saveToLocalStorage) {
      localStorage.setItem(AppConstants.CACHED_DATE_RANGE, JSON.stringify(this.selectedDateRange));
    }
    const isCustomDateRange = this.isCustomDateRange(this.selectedDateRange, this.presets);
    this.drpService.changeDateRange(this.identifier, this.selectedDateRange, isCustomDateRange);
  }

  private isCustomDateRange(selDate: DateRange, presets: any[]) {
    // console.log(selDate, presets);
    const list = presets.filter((preset: any) => new Date(preset.start).getTime() === new Date(selDate.startDate).getTime()
      && new Date(preset.end).getTime() === new Date(selDate.endDate).getTime());
    return (list && list.length > 0) ? false : true;
  }

  private handlePresetChanges(changes: SimpleChanges) {
    if (changes.presets !== null && changes.presets !== undefined && changes.presets.currentValue.length > 0) {
      this.reRenderDatePicker();
    }
  }

  private handleConfigChanges(changes: SimpleChanges) {
    if (changes.config !== null && changes.config !== undefined) {
      this.dateRange = [new Date(changes.config.currentValue.dateRange.startDate),
      new Date(changes.config.currentValue.dateRange.endDate)];
    }
  }

  private reRenderDatePicker() {
    this.visible = false;
    setTimeout(() => {
      this.visible = true;
    }, 0);
  }

}
