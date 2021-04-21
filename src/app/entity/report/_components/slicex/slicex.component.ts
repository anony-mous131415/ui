import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DateRange } from '@app/shared/_models/date.range.model';
import { AlertService } from '@app/shared/_services/alert.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ENTITIES, SlicexChartService } from '../../_services/slicex-chart.service';
import { DateRangerPickerConfig, DATE_PICKER_PRESETS, SlicexDatePickerService } from '../../_services/slicex-date-picker.service';
import { GridOptions, SlicexListService } from '../../_services/slicex-list.service';

const DATE_PICKER_PRIMARY = 'primary';
const DATE_PICKER_COMPARE = 'compare';

const VIEW_MODE_PRIMARY = 0;
const VIEW_MODE_GRAPH = 1;
const VIEW_MODE_LIST = 2;

export interface SlicexDateRange {
  isCompareEnabled: boolean;
  primaryDateRange: DateRange;
  compareDateRange: DateRange;
  chartFrequency: string;
}

@Component({
  selector: 'app-slicex',
  templateUrl: './slicex.component.html',
  styleUrls: ['./slicex.component.scss'],
})
export class SlicexComponent implements OnInit, AfterViewInit, OnDestroy {

  width = 150;
  x = 100;
  oldX = 0;
  grabber = false;

  pageBreadcrumbs: any[];
  mainbreadcrumbs: string;
  dateRangeSubscription: Subscription;
  entitySelectionSubscription: Subscription;
  entityExpandSubscription: Subscription;
  // gridDetailsOpenSubscription: Subscription;
  gridDetailsCloseSubscription: Subscription;
  filterUpdateSubscription: Subscription;

  entity = AppConstants.ENTITY.ADVERTISER;

  cbChecked = false;
  isCheckboxDisabled = false;
  isCompareDatePickerEnabled = false;

  showGrid = false;

  gridOptions: GridOptions = null;
  datePickerPresets: any[] = [];
  datePickerCompPresets: any[] = [];
  dateConfig: DateRangerPickerConfig = {
    dateRange: null,
    saveToLocalStorage: false
  };
  dateCompConfig: DateRangerPickerConfig = null;
  breadcrumbs: any = {};
  error: { isError: boolean, errorMsg: string } = null;
  info: { isInfo: boolean, disableCompare: boolean, infoMsg: string } = null;

  viewMode: number = VIEW_MODE_PRIMARY;
  viewModeLabel = 'Show only graphs';

  slicexDateRange: SlicexDateRange;
  startDateLimit: number;
  isPrimaryDateRangeCustom = false;
  isCompareDateRangeCustom = false;
  validationMessage = '';

  constructor(
    private listService: SlicexListService,
    private chartService: SlicexChartService,
    private drpService: SlicexDatePickerService,
    private alertService: AlertService
  ) { }

  //#region Lifecycle hooks
  ngOnInit() {
    this.dateConfig = this.setDatePickerConfig(1, 1);
    this.datePickerPresets = this.getDatePickerPresets([DATE_PICKER_PRESETS.TODAY,
    DATE_PICKER_PRESETS.YESTERDAY,
    DATE_PICKER_PRESETS.LAST7,
    DATE_PICKER_PRESETS.LAST14,
    DATE_PICKER_PRESETS.LAST30,
    DATE_PICKER_PRESETS.THIS_MONTH,
    DATE_PICKER_PRESETS.LAST_MONTH,
    DATE_PICKER_PRESETS.LAST_3_MONTH]);

    this.dateCompConfig = this.setDatePickerConfig(2, 2);
    this.datePickerCompPresets = this.getDatePickerPresets([DATE_PICKER_PRESETS.PREVIOUS_7_DAYS], this.dateConfig.dateRange);
    this.handleBreadcrumbs();
    this.handleMainBreadcrumbs();
    this.subscribeToEvents();

    const year: number = new Date().getUTCFullYear();
    const month: number = new Date().getUTCMonth();
    const date: number = new Date().getUTCDate();
    const today: Date = new Date(year, month, date);
    this.startDateLimit = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 31) / 1000;

    this.validationMessage = `Invalid date range selected. Please select a date range on or after
     ${moment(new Date(this.startDateLimit * 1000)).format('MMMM D, YYYY')}. Please select a valid date range to continue.`;
    this.listService.setValidationMessage(this.validationMessage);
  }

  ngAfterViewInit() {
    const slicexDateRange = {
      isCompareEnabled: false,
      primaryDateRange: this.dateConfig.dateRange,
      compareDateRange: null
    } as SlicexDateRange;
    this.setSlicexDateRange(slicexDateRange);
  }

  ngOnDestroy() {
    this.dateRangeSubscription.unsubscribe();
    this.entitySelectionSubscription.unsubscribe();
    // this.gridDetailsOpenSubscription.unsubscribe();
    this.gridDetailsCloseSubscription.unsubscribe();
    this.filterUpdateSubscription.unsubscribe();
  }
  //#endregion

  switchViewMode(mode: number) {
    this.viewMode = mode;
    if (this.viewMode === VIEW_MODE_GRAPH || this.viewMode === VIEW_MODE_PRIMARY) {
      this.chartService.resetChartWidth();
    }
  }

  //#region UI event handlers
  onClearBreadcrumSelection(param: { entity: string, entityID: number, entityValue: string }) {
    this.listService.onEntitySelectionChanged(param.entity, param.entityID, param.entityValue, false);
  }

  onCompareCheckboxChange(event) {
    this.isCompareDatePickerEnabled = event.checked;
    if (event.checked) {
      this.dateCompConfig = this.setDatePickerConfigFromDate(this.dateConfig.dateRange);
    }

    const slicexDateRange = {
      isCompareEnabled: this.cbChecked,
      primaryDateRange: this.dateConfig.dateRange,
      compareDateRange: this.cbChecked ? this.dateCompConfig.dateRange : null
    } as SlicexDateRange;
    this.setSlicexDateRange(slicexDateRange);
  }

  onError(event: any) {
    if (this.error === null) {
      this.error = event;
    }
  }

  closeError() {
    this.error = null;
  }


  //REVX-507
  onInfoMsg(event: any) {
    this.info = event;
    this.toggleCompareFunctions(this.info && this.info.disableCompare ? this.info.disableCompare : false);
  }

  //REVX-507
  closeInfo() {
    this.info = null;
  }

  onGridExport(entity) {
    this.listService.onExportEntityGridData(entity);
  }

  onGridOptionsChange(options: GridOptions) {
    this.showGrid = true;
    this.gridOptions = options;
  }

  resetFilters() {
    const filteredList = [];
    Object.keys(this.breadcrumbs).forEach(key => {
      filteredList.push(...this.breadcrumbs[key].values.map(item => {
        return { id: item.id, entity: key };
      }));
    });
    this.handleFilterClear({ remainingList: {}, removedList: filteredList });
  }

  checkBreadcrumbs(breadcrumbs) {
    const bc = {};
    for (const prop in breadcrumbs) {
      if (prop !== null && prop !== undefined && breadcrumbs[prop].values !== null
        && breadcrumbs[prop].values !== undefined && Array.isArray(breadcrumbs[prop].values)
        && breadcrumbs[prop].values.length > 0) {
        bc[prop] = {
          ...breadcrumbs[prop]
        };
      }
    }
    breadcrumbs = bc;
    return breadcrumbs;
  }

  private handleFilterClear(result) {
    this.breadcrumbs = result;
    this.chartService.updateFilters(result.remainingList);
    this.listService.updateFilters(result.remainingList);
    result.removedList.forEach(item => {
      this.listService.onEntitySelectionClear(item.entity, item.id);
    });
  }

  handleMainBreadcrumbs(id?: string) {
    const breadcrumbsObj = { slicex: { id: '', name: '' } };
    this.mainbreadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbs = [];
    const usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (usrRole !== 'ROLE_SADMIN' && usrRole !== 'ROLE_ADMIN') {
      breadcrumbs.push({ id: 'licensee', entity: 'Licensee', name: localStorage.getItem(AppConstants.CACHED_LICENSEE_NAME) });
    }
    breadcrumbs.push({ id: 'slicex', entity: 'Report', name: 'SLICEX' });
    this.pageBreadcrumbs = breadcrumbs;
  }
  //#endregion

  //#region private methods

  private updateCustomDateRange(param: any) {
    if (param.id === DATE_PICKER_PRIMARY) {
      this.isPrimaryDateRangeCustom = param.isCustomDateRange;
    } else {
      this.isCompareDateRangeCustom = param.isCustomDateRange;
    }
  }

  private handleInvalidDateSelection() {
    this.alertService.error(this.validationMessage);
  }

  private subscribeToEvents() {
    this.dateRangeSubscription = this.drpService.dateRangeWatcher().subscribe(
      (param: any) => {
        this.updateCustomDateRange(param);
        this.dateRangeChanged(param.range, param.id === DATE_PICKER_PRIMARY ?
          false : true);
      }
    );

    this.entitySelectionSubscription = this.listService.onEntitySelectionChange
      .subscribe(param => this.handleEntitySelections(param));

    // this.gridDetailsOpenSubscription = this.listService.onEntityGridDetailsOpen.subscribe(
    //   param => {
    //     // this.showGrid = true;
    //     // this.gridOptions = {
    //     //   entity: param.entity,
    //     //   entityDisplayName: ENTITIES[param.entity].display_name,
    //     //   data: param.data,
    //     //   orderMetric: param.orderMetric,
    //     //   orderMetricUnit: METRICS[param.orderMetric].type,
    //     //   order: param.sortOrder,
    //     //   isCompareEnabled: this.isCompareDatePickerEnabled,
    //     //   selections: param.selections
    //     // };
    //   });

    this.gridDetailsCloseSubscription = this.listService.onEntityGridDetailsClose.subscribe(
      param => {
        this.showGrid = false;
        // if (this.breadcrumbs[param.entity] === null || this.breadcrumbs[param.entity] === undefined) {
        //   this.breadcrumbs[param.entity] = {
        //     name: ENTITIES[param.entity].display_name,
        //     values: []
        //   };
        // } else {
        //   this.breadcrumbs[param.entity].values = [];
        // }
        this.breadcrumbs[param.entity] = null;
        param.selection.forEach(item => {
          this.addToBreadcrumbs(param.entity, item.id, item.name);
        });
        setTimeout(() => {
          this.listService.onUpdateEntitySelections(param.entity, param.selection);
        }, 0);

        let bc = null;
        Object.keys(this.breadcrumbs).forEach(key => {
          if (bc === null) {
            bc = {};
          }
          if (this.breadcrumbs[key] !== null) {
            bc[key] = { ...this.breadcrumbs[key] };
          }
        });
        this.breadcrumbs = bc;
      });

    this.filterUpdateSubscription = this.listService.onFiltersUpdated.subscribe(
      param => this.handleFilterUpdate(param));
  }

  private dateRangeChanged(inpDateRange: DateRange, isCompareDatePicker: boolean) {
    const date: DateRangerPickerConfig = { dateRange: { ...inpDateRange }, saveToLocalStorage: false };
    if (!isCompareDatePicker) {
      this.dateConfig = Object.assign(this.dateConfig, date);
      this.dateCompConfig = this.setDatePickerConfigFromDate(inpDateRange);
    } else {
      this.dateCompConfig = Object.assign(this.dateCompConfig, date);
    }

    if (!isCompareDatePicker || (isCompareDatePicker && this.cbChecked)) {
      const slicexDateRange = {
        isCompareEnabled: this.cbChecked,
        primaryDateRange: this.dateConfig.dateRange,
        compareDateRange: this.cbChecked ? this.dateCompConfig.dateRange : null
      } as SlicexDateRange;
      this.setSlicexDateRange(slicexDateRange);
    }
  }

  private handleEntitySelections(param: any) {
    if (param.checked) {
      this.addToBreadcrumbs(param.entity, param.entityID, param.entityValue);
    } else {
      this.removeFromBreadcrumbs(param.entity, param.entityID);
    }
  }

  private handleFilterUpdate(param: any) {
    this.breadcrumbs = Object.entries(param.breadcrumbs).length === 0 ? null : param.breadcrumbs;
  }

  private addToBreadcrumbs(entity: string, entityID: number, entityValue: string) {
    if (this.breadcrumbs === null) {
      this.breadcrumbs = {};
    }
    if (this.breadcrumbs[entity] === null || this.breadcrumbs[entity] === undefined) {
      this.breadcrumbs[entity] = {
        name: ENTITIES[entity].display_name,
        values: []
      };
    }

    const values = this.breadcrumbs[entity].values;
    if (values.map(val => val.id).indexOf(entityID) === -1) {
      this.breadcrumbs[entity].values.push({
        id: entityID,
        title: entityValue
      });
    }
  }

  private removeFromBreadcrumbs(entity: string, entityID: number) {
    const values = this.breadcrumbs[entity].values;
    const index = values.map(val => val.id).indexOf(entityID);
    this.breadcrumbs[entity].values.splice(index, 1);
    if (this.breadcrumbs[entity].values === null || this.breadcrumbs[entity].values === undefined
      || this.breadcrumbs[entity].values.length === 0) {
      this.breadcrumbs[entity] = null;
    }

    let bc = null;
    Object.keys(this.breadcrumbs).forEach(key => {
      if (bc === null) {
        bc = {};
      }
      if (this.breadcrumbs[key] !== null) {
        bc[key] = { ...this.breadcrumbs[key] };
      }
    });
    this.breadcrumbs = bc;
  }

  private getDateComparePresets(period: number, dateRange: DateRange) {
    let datePickerCompPresets = [];
    if (period <= 15) {
      this.toggleCompareFunctions(false);
      datePickerCompPresets = this.getDatePickerPresets([], dateRange);
    } else {
      // disable the compare options
      const year: number = new Date().getUTCFullYear();
      const month: number = new Date().getUTCMonth();
      const date: number = new Date().getUTCDate();
      const today: Date = new Date(year, month, date);
      const lastMonthStart: number = Date.UTC(today.getFullYear(), today.getMonth() - 1, 1) / 1000;
      const lastMonthEnd: number = Date.UTC(today.getFullYear(), today.getMonth(), 0) / 1000 + 86400;

      if (dateRange.startDateEpoch === lastMonthStart && dateRange.endDateEpoch === lastMonthEnd) {
        this.isCheckboxDisabled = false;
        this.isCompareDatePickerEnabled = false;
        datePickerCompPresets = this.getDatePickerPresets([], dateRange);
      } else {
        this.toggleCompareFunctions(true);

      }
    }
    return datePickerCompPresets;
  }

  private getDatePickerPresets(presets: string[], dateRange?: DateRange) {
    let presetOptions = [];

    if (dateRange === null || dateRange === undefined) {
      const month: number = new Date().getUTCMonth();
      const year: number = new Date().getUTCFullYear();
      const date: number = new Date().getUTCDate();

      const today: Date = new Date(year, month, date);

      const todayStart: Date = today;
      const todayEnd: Date = today;

      const yesterdayStart: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      const yesterdayEnd: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

      const last7DaysStart: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      const last7DaysEnd: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

      const last14DaysStart: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
      const last14DaysEnd: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

      const last30DaysStart: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
      const last30DaysEnd: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

      const lastMonthStart: Date = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd: Date = new Date(today.getFullYear(), today.getMonth(), 0);

      const last3MonthsStart: Date = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      const last3MonthsEnd: Date = new Date(today.getFullYear(), today.getMonth(), 0);

      // const monthStart: Date = new Date(new Date(new Date().setDate(1)).toDateString());
      const monthStart: Date = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd: Date = today;

      presetOptions = [
        {
          id: 'today',
          label: 'Today',
          start: todayStart,
          end: todayEnd,
          priority: 1
        },
        {
          id: 'yesterday',
          label: 'Yesterday',
          start: yesterdayStart,
          end: yesterdayEnd,
          priority: 2
        },
        {
          id: 'previousDay',
          label: 'Previous day',
          start: yesterdayStart,
          end: yesterdayEnd,
          priority: 2
        },
        {
          id: 'last7',
          label: 'Last 7 days',
          start: last7DaysStart,
          end: last7DaysEnd,
          priority: 3
        },
        {
          id: 'last14',
          label: 'Last 14 days',
          start: last14DaysStart,
          end: last14DaysEnd,
          priority: 4
        },
        {
          id: 'last30',
          label: 'Last 30 days',
          start: last30DaysStart,
          end: last30DaysEnd,
          priority: 5
        },
        {
          id: 'thisMonth',
          label: 'This Month',
          start: monthStart,
          end: monthEnd,
          priority: 6
        },
        {
          id: 'lastMonth',
          label: 'Last Month',
          start: lastMonthStart,
          end: lastMonthEnd,
          priority: 7
        },
        {
          id: 'last3Month',
          label: 'Last 3 Months',
          start: last3MonthsStart,
          end: last3MonthsEnd,
          priority: 8
        }
      ];
      presetOptions = presetOptions.filter(preset => presets.indexOf(preset.id) !== -1);
    } else {
      const prevYear: number = dateRange.startDate.getUTCFullYear();
      const prevMonth: number = dateRange.startDate.getUTCMonth();
      const prevDate: number = dateRange.startDate.getUTCDate();

      const period = moment(dateRange.endDate).diff(moment(dateRange.startDate), 'days') + 1;
      const previousDayStart: Date = new Date(prevYear, prevMonth, prevDate - period);
      const previousDayEnd: Date = new Date(prevYear, prevMonth, prevDate - 1);

      if (period > 1) {
        presetOptions = [
          {
            id: `previous${period}Day`,
            label: `Previous ${period} days`,
            start: previousDayStart,
            end: previousDayEnd,
            priority: 1
          }
        ];
      } else {
        presetOptions = [
          {
            id: `previousDay`,
            label: `Previous day`,
            start: previousDayStart,
            end: previousDayEnd,
            priority: 1
          }
        ];
      }
    }

    return presetOptions;
  }

  private setDatePickerConfig(minusInStartDate: number, minusInEndDate: number, dateRange?: DateRange) {
    const datePickerConfig: DateRangerPickerConfig = {
      dateRange: this.drpService.getDateRange(minusInStartDate, minusInEndDate),
      saveToLocalStorage: false
    };

    return datePickerConfig;
  }

  private setDatePickerConfigFromDate(dateRange: DateRange) {
    let datePickerConfig: DateRangerPickerConfig = null;

    const period = moment(dateRange.endDate).diff(moment(dateRange.startDate), 'days') + 1;
    const isLastMonth = this.checkLastMonthSelection(dateRange);
    datePickerConfig = {
      dateRange: isLastMonth ? this.getPrevMonth(dateRange) : this.drpService.getDateRangeFromDate(dateRange.startDate, period, 1),
      saveToLocalStorage: false
    };

    this.datePickerCompPresets = this.getDateComparePresets(period < 30 ? period : 30, dateRange);
    return datePickerConfig;
  }

  private checkLastMonthSelection(dateRange: DateRange) {
    const newDate = new Date();
    const year: number = newDate.getUTCFullYear();
    const month: number = newDate.getUTCMonth();
    const date: number = newDate.getUTCDate();
    const today: Date = new Date(year, month, date);
    const lastMonthStart: number = Date.UTC(today.getFullYear(), today.getMonth() - 1, 1) / 1000;
    const lastMonthEnd: number = Date.UTC(today.getFullYear(), today.getMonth(), 0) / 1000 + 86400;

    if (dateRange.startDateEpoch === lastMonthStart && dateRange.endDateEpoch === lastMonthEnd) {
      return true;
    } else {
      return false;
    }
  }

  private getPrevMonth(inpRange: DateRange) {
    const month: number = inpRange.startDate.getMonth();
    const year: number = inpRange.startDate.getFullYear();
    const date: number = inpRange.startDate.getDate();

    const dateRange = {} as DateRange;
    const startDate: Date = new Date(year, month - 1, date);
    const endDate: Date = new Date(year, month, date - 1);

    dateRange.startDate = startDate;
    dateRange.endDate = endDate;
    dateRange.startDateEpoch = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) / 1000;
    dateRange.endDateEpoch = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) / 1000 + 86400;
    return dateRange;
  }

  private toggleCompareFunctions(isDisable: boolean) {
    if (isDisable) {
      this.isCheckboxDisabled = true;
      this.cbChecked = false;
      this.isCompareDatePickerEnabled = false;
    } else {
      this.isCheckboxDisabled = false;
    }
  }

  private setSlicexDateRange(dateRange: SlicexDateRange) {
    // this.slicexDateRange = {
    //   isCompareEnabled: dateRange.isCompareEnabled,
    //   primaryDateRange: { ...dateRange.primaryDateRange },
    //   compareDateRange: { ...dateRange.compareDateRange },
    //   chartFrequency: dateRange.chartFrequency
    // } as SlicexDateRange;

    const isValid = this.validateDateRange(dateRange);
    if (isValid) {
      this.chartService.setDateRange(dateRange);
      this.listService.setDateRange(dateRange);
      this.chartService.setIsDateRangeValid(true);
      this.listService.setIsDateRangeValid(true);
    } else {
      this.chartService.setIsDateRangeValid(false);
      this.listService.setIsDateRangeValid(false);
      this.handleInvalidDateSelection();
    }
  }

  private validateDateRange(dateRange: SlicexDateRange) {
    let isPrimaryDateRangeValid = false;
    let isCompareDateRangeValid = false;

    // if not custom ie. using preset , then its valid
    if (!this.isPrimaryDateRangeCustom) {
      isPrimaryDateRangeValid = true;
    } else {
      //if custom date range , then must be within last 31 days
      isPrimaryDateRangeValid = (dateRange.primaryDateRange.startDateEpoch >= this.startDateLimit);
    }

    if (dateRange.isCompareEnabled) {
      const year: number = new Date().getUTCFullYear();
      const month: number = new Date().getUTCMonth();
      const date: number = new Date().getUTCDate();
      const today: Date = new Date(year, month, date);
      const twoMonthsBackStart = Date.UTC(today.getFullYear(), today.getMonth() - 2, 1) / 1000;
      const twoMonthsBackEnd = Date.UTC(today.getFullYear(), today.getMonth() - 1, 0) / 1000 + + 86400;

      if (twoMonthsBackStart === dateRange.compareDateRange.startDateEpoch
        && twoMonthsBackEnd === dateRange.compareDateRange.endDateEpoch) {
        // can be atmost last 2 month back
        isCompareDateRangeValid = true;
      } else {
        //else ,  must be within last 31 days
        isCompareDateRangeValid = (dateRange.compareDateRange.startDateEpoch >= this.startDateLimit);
      }

      return (isPrimaryDateRangeValid && isCompareDateRangeValid);
    }

    return isPrimaryDateRangeValid;

  }

  //#endregion


  // for resizing div
  // @HostListener('document:mousemove', ['$event'])
  // onMouseMove(event: MouseEvent) {
  //   if (!this.grabber) {
  //     return;
  //   }
  //   this.resizer(event.clientX - this.oldX);
  //   this.oldX = event.clientX;
  // }

  // @HostListener('document:mouseup', ['$event'])
  // onMouseUp(event: MouseEvent) {
  //   this.grabber = false;
  // }

  // resizer(offsetX: number) {
  //   this.width += offsetX;
  // }


  // @HostListener('document:mousedown', ['$event'])
  // onMouseDown(event: MouseEvent) {
  //   this.grabber = true;
  //   this.oldX = event.clientX;
  // }

}
