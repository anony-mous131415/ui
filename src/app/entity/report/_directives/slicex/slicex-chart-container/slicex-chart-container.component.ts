import { AfterViewInit, Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { SlicexDateRange } from '@app/entity/report/_components/slicex/slicex.component';
import { ChartData, FREQUENCIES, METRICS, SlicexChartService } from '@app/entity/report/_services/slicex-chart.service';
import { SlicexDatePickerService } from '@app/entity/report/_services/slicex-date-picker.service';
import { SlicexListService } from '@app/entity/report/_services/slicex-list.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DateRange } from '@app/shared/_models/date.range.model';
import {
  ApiResponseObjectSlicexChartResponse,
  DashboardFilters,
  Duration, SliceXControllerService,
  SlicexRequest
} from '@revxui/api-client-ts';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

Highcharts.Point.prototype['highlight'] = function (event) {
  event = this.series.chart.pointer.normalize(event);
  this.onMouseOver(); // Show the hover marker
  // this.series.chart.tooltip.refresh(this); // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

Highcharts.Pointer.prototype.reset = function () {
  return undefined;
};

const DATE_PICKER_PRIMARY = 'primary';
const DATE_PICKER_COMPARE = 'compare';

const FREQ_DAILY = 'daily';
const FREQ_HOURLY = 'hourly';
const FREQ_MONTHLY = 'monthly';

@Component({
  selector: 'app-slicex-chart-container',
  templateUrl: './slicex-chart-container.component.html',
  styleUrls: ['./slicex-chart-container.component.scss']
})
export class SlicexChartContainerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  // @Input('data') chartData: ChartData[] = [];
  // @Input() isCompareEnabled: boolean = false;
  // @Input() date: DateRange = this.drpService.getDateRange(7, 1);
  // @Input() compareDate: DateRange = this.drpService.getDateRange(14, 8);

  @Output() onError: EventEmitter<{ isError: boolean, errorMsg: string }> = new EventEmitter();

  //REVX-507 : for info msg only
  @Output() onInfoMsg: EventEmitter<{ isInfo: boolean, disableCompare: boolean, infoMsg: string }> = new EventEmitter();


  dateRangeSubscription: Subscription;
  entitySelectionSubscription: Subscription;
  gridDetailsCloseSubscription: Subscription;
  filterUpdateSubscription: Subscription;

  chartData: ChartData[] = [];
  baseChartOptions: any = {
    chart: {
      animation: true,
      type: '',
      height: 125,
      marginRight: 65,
      spacingTop: 15,
      spacingBottom: 5
    },
    title: {
      text: '',
      align: 'left',
      margin: 10,
      style: {
        fontSize: '15px'
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      //shared: this.isCompareEnabled,
      animation: false,
      positioner() {
        return {
          x: 0,
          y: -5
        };
      },
      borderWidth: 0,
      backgroundColor: 'none',
      shadow: false,
      style: {
        fontSize: '12px'
      },
    },
    xAxis: {
      type: 'datetime',
      crosshair: true,
      events: {
        setExtremes: function (e) {
          const thisChart = this.chart;

          if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
            Highcharts.each(Highcharts.charts, function (chart) {
              if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                  chart.xAxis[0].setExtremes(
                    e.min,
                    e.max,
                    undefined,
                    false,
                    { trigger: 'syncExtremes' }
                  );
                }
              }
            });
          }
        }
      },
      labels: {
        style: {
          // color: '#b3b3b3'
          color: '#000000'
        },
      },
      dateTimeLabelFormats: { // don't display the dummy year
        month: '%e %b',
        hour: '%I %p'
      }
    },
    yAxis: {
      title: {
        text: null
      },
      gridLineWidth: 1,
      opposite: true,
      labels: {
        style: {
          // color: '#b3b3b3'
          color: '#000000'
        },
      }
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2
        },
        states: {
          hover: {
            lineWidthPlus: 0,
            halo: {
              size: 0,
            }
          },
          inactive: {
            opacity: 1
          }
        }
      }
    },
    series: [
      {
        data: []
      }
    ]
  };

  showChartProgressBar = false;

  toggleUASelection: boolean = false;
  toggleRTSelection: boolean = false;
  chartMetricsUA: string[] = ['installs', 'ecpi', 'impressions', 'iti', 'revenue'];
  chartMetricsRT: string[] = ['revenue', 'cost', 'ecpa', 'ctr', 'ctc'];
  chartMetricsDefault: string[] = ['revenue', 'cost', 'margin', 'ctr', 'ctc'];

  selChartMetrics: string[] = ['revenue', 'cost', 'margin', 'ctr', 'ctc'];
  selFrequency = 'daily';

  ddMetrics = [];
  frequencies: { id: string, title: string, disabled: boolean }[] = [];

  authToken: string = null;
  reqChart: SlicexRequest = {
    compareToDuration: null,
    duration: {
      startTimeStamp: null,
      endTimeStamp: null
    },
    filters: [],
    groupBy: 'daily'
  };
  isCompareEnabled: boolean = false;
  dateRange: SlicexDateRange;

  constructor(
    private apiService: SliceXControllerService,
    private chartService: SlicexChartService,
    private listService: SlicexListService,
    private drpService: SlicexDatePickerService
  ) { }

  //#region Lifecycle hooks
  ngOnInit() {

    this.ddMetrics = Object.keys(this.filterMetricsBasedOnRole(METRICS)).map((key: string) => {
      return { id: key, title: METRICS[key].display_name };
    });

    this.chartMetricsRT = this.filterBasedOnRole(this.chartMetricsRT);
    this.chartMetricsUA = this.filterBasedOnRole(this.chartMetricsUA);
    this.chartMetricsDefault = this.filterBasedOnRole(this.chartMetricsDefault);

    this.authToken = this.getAuthToken();
  }

  ngAfterViewInit() {
    this.frequencies = [...FREQUENCIES.map(freq => ({ ...freq }))];
    // const last7days = this.drpService.getDateRange(7, 1);
    // const duration = {
    //   startTimeStamp: last7days.startDateEpoch,
    //   endTimeStamp: last7days.endDateEpoch
    // };

    // this.reqChart.duration = duration;

    this.subscribeToEvents();
  }

  ngOnDestroy() {
    this.dateRangeSubscription.unsubscribe();
    this.entitySelectionSubscription.unsubscribe();
    this.gridDetailsCloseSubscription.unsubscribe();
    this.filterUpdateSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {

    // if (changes.isCompareEnabled !== null && changes.isCompareEnabled !== undefined) {
    //   this.isCompareEnabled = changes.isCompareEnabled.currentValue;
    // }
    // if (changes.compareDate !== null && changes.compareDate !== undefined) {
    //   this.compareDate = changes.compareDate.currentValue;
    // }
    // if (changes.date !== null && changes.date !== undefined) {
    //   this.date = changes.date.currentValue;
    // }

    // if (changes.dateRange !== null && changes.dateRange !== undefined && !changes.dateRange.isFirstChange) {
    //   this.dateRange = changes.dateRange.currentValue;
    //   this.onCompareChange();
    // }
  }

  // ngAfterViewInit() {
  //   const container = document.querySelector('slicex-chart-container-base');
  //   container.bind('mousemove mousemove touchstart', function (e) {
  //     if (!this.isCompareEnabled) {
  //       var chart, point, i, event;
  //       for (i = 0; i < Highcharts.charts.length; i = i + 1) {
  //         chart = Highcharts.charts[i];
  //         event = chart.pointer.normalize(e); // Find coordinates within the chart
  //         point = chart.series[0].searchPoint(event, true); // Get the hovered point
  //         if (point) {
  //           point.highlight(e);
  //         }
  //       }
  //     } else {
  //       var chart, points, i;

  //       for (i = 0; i < Highcharts.charts.length; i++) {
  //         chart = Highcharts.charts[i];
  //         e = chart.pointer.normalize(e); // Find coordinates within the chart
  //         points = [chart.series[0].searchPoint(e, true), chart.series[1].searchPoint(e, true)]; // Get the hovered point

  //         if (points !== null && points !== undefined && Array.isArray(points) && points.length >= 2) {
  //           points.forEach(pt => {
  //             if (pt !== null && pt !== undefined) {
  //               pt.highlight(e);
  //             }
  //           });
  //         }
  //       }
  //     }
  //   });
  // }
  //#endregion

  //#region UI event handlers
  onChartMetricSelectionChanged(event) {
    if (event.isUserInput) {
      const value = event.source.value;
      this.toggleUASelection = false;
      this.toggleRTSelection = false;
      if (!event.source.selected) {
        this.chartData = this.chartData.filter(item => {
          // REVX-628
          // return (item.Metric === value);
          return (item.Metric !== value);

        });
      } else {
        this.prepareChartData(value, METRICS[value], this.selFrequency);
      }
    }
  }

  onFrequencySelectionChanged(event) {
    const value = event.value;
    this.reqChart.groupBy = value;
    this.getChartData(this.reqChart, false);
  }

  onUASelected() {
    // const currValue = this.toggleUASelection;
    // this.toggleUASelection = !currValue;
    // this.toggleRTSelection = !this.toggleUASelection;
    // const checked: boolean = this.toggleUASelection;
    // if (checked) {
    //   this.chartData = [];
    //   this.selChartMetrics = this.chartMetricsUA;
    //   this.resetChartData(this.selChartMetrics);
    // } else {
    //   this.chartData = [];
    //   this.selChartMetrics = this.chartMetricsRT;
    //   this.resetChartData(this.selChartMetrics);
    // }

    this.toggleRTSelection = false;
    this.toggleUASelection = !this.toggleUASelection;
    this.chartData = [];
    this.selChartMetrics = this.toggleUASelection ? this.chartMetricsUA : this.chartMetricsDefault;
    this.resetChartData(this.selChartMetrics);
  }

  onRTSelected() {
    // const currValue = this.toggleRTSelection;
    // this.toggleRTSelection = !currValue;
    // this.toggleUASelection = !this.toggleRTSelection;
    // const checked: boolean = this.toggleRTSelection;
    // if (checked) {
    //   this.chartData = [];
    //   this.selChartMetrics = this.chartMetricsRT;
    //   this.resetChartData(this.selChartMetrics);
    // } else {
    //   this.chartData = [];
    //   this.selChartMetrics = this.chartMetricsUA;
    //   this.resetChartData(this.selChartMetrics);
    // }

    this.toggleUASelection = false;
    this.toggleRTSelection = !this.toggleRTSelection;
    this.chartData = [];
    this.selChartMetrics = this.toggleRTSelection ? this.chartMetricsRT : this.chartMetricsDefault;
    this.resetChartData(this.selChartMetrics);
  }

  //#endregion

  //#region subscriptions
  private subscribeToEvents() {
    this.dateRangeSubscription = this.chartService.onDateRangeSet.subscribe(
      param => this.handleDateRangeChange(param));

    this.entitySelectionSubscription = this.listService.onEntitySelectionChange
      .subscribe(param => this.handleEntitySelections(param));

    this.gridDetailsCloseSubscription = this.listService.onEntityGridDetailsClose
      .subscribe(param => this.handleGridDetailsClose(param));

    this.filterUpdateSubscription = this.chartService.onFiltersUpdated.subscribe(
      param => this.handleFilterUpdate(param));
  }
  //#endregion

  //#region private methods
  synchronizeTooltips(e) {
    if (!this.isCompareEnabled) {
      var chart, point, i, event;
      for (i = 0; i < Highcharts.charts.length; i = i + 1) {
        chart = Highcharts.charts[i];
        if (chart !== null && chart !== undefined && chart.pointer !== null && chart.pointer !== undefined) {
          event = chart.pointer.normalize(e); // Find coordinates within the chart
          if (chart.series !== null && chart.series !== undefined
            && Array.isArray(chart.series) && chart.series.length > 0) {
            point = chart.series[0].searchPoint(event, true); // Get the hovered point
            if (point) {
              point.highlight(e);
            }
          }
        }
      }
    } else {
      var chart, points, i;

      for (i = 0; i < Highcharts.charts.length; i++) {
        chart = Highcharts.charts[i];
        if (chart !== null && chart !== undefined && chart.pointer !== null && chart.pointer !== undefined) {
          e = chart.pointer.normalize(e); // Find coordinates within the chart
          if (chart.series !== null && chart.series !== undefined
            && Array.isArray(chart.series) && chart.series.length > 1) {
            points = [chart.series[0].searchPoint(e, true), chart.series[1].searchPoint(e, true)]; // Get the hovered point

            if (points !== null && points !== undefined && Array.isArray(points) && points.length >= 2) {
              points.forEach(pt => {
                if (pt !== null && pt !== undefined) {
                  pt.highlight(e);
                }
              });
            }
          }
        }
      }
    }
  }

  // syncExtremes(e) {
  //   const thisChart = this.chart;

  //   if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
  //     Highcharts.each(Highcharts.charts, function (chart) {
  //       if (chart !== thisChart) {
  //         if (chart.xAxis[0].setExtremes) { // It is null while updating
  //           chart.xAxis[0].setExtremes(
  //             e.min,
  //             e.max,
  //             undefined,
  //             false,
  //             { trigger: 'syncExtremes' }
  //           );
  //         }
  //       }
  //     });
  //   }
  // }

  private getAuthToken() {
    return localStorage.getItem(AppConstants.CACHED_TOKEN) ?
      localStorage.getItem(AppConstants.CACHED_TOKEN) : localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
  }

  private getChartData(req: SlicexRequest, isInit: boolean) {
    let isValid = 'false';
    let message: string = null;

    //REVX-507
    let isInfo = 'false';
    let infoMessage: string = null;
    [isInfo, infoMessage] = this.checkForInfo(req);

    [isValid, message] = this.validateRequest(req);

    if (isValid === 'true') {
      this.showChartProgressBar = true;
      // this.chartService.getSlicexDataChartUsingPOST(req, this.getAuthToken())

      //REVX-507 : emit info 
      if (isInfo === 'true' && infoMessage !== null) {
        this.onInfoMsg.emit({
          isInfo: true,
          disableCompare: true,
          infoMsg: infoMessage
        });
      } else {
        this.onInfoMsg.emit(null);
      }

      this.apiService.getSlicexDataChartUsingPOST(req, this.getAuthToken())
        .subscribe(
          (response: ApiResponseObjectSlicexChartResponse) => {
            this.chartService.setRawChartData(response.respObject.data);
            this.chartService.setRawChartDataCompare(response.respObject.compareData);
            this.chartData = [];
            isInit ? this.initChartData(this.filterMetricsBasedOnRole(METRICS)) :
              this.resetChartData(this.selChartMetrics);
          },
          (error) => {
            this.showChartProgressBar = false;
          }
        );
    } else {
      if (message !== null) {
        this.onError.emit({
          isError: true,
          errorMsg: message
        });
      }
    }
  }

  //REVX-507
  private checkForInfo(req: SlicexRequest) {
    const month: number = new Date().getUTCMonth();
    const year: number = new Date().getUTCFullYear();
    const date: number = new Date().getUTCDate();
    const today: Date = new Date(year, month, date);
    const lastMonthStart: Date = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd: Date = new Date(today.getFullYear(), today.getMonth(), 0);

    const last3MonthsStart: Date = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const last3MonthsEnd: Date = new Date(today.getFullYear(), today.getMonth(), 0);

    const lastMonthStartEpoch: number = Date.UTC(lastMonthStart.getFullYear(), lastMonthStart.getMonth(), lastMonthStart.getDate()) / 1000;
    const lastMonthEndEpoch: number = Date.UTC(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), lastMonthEnd.getDate()) / 1000 + 86400;

    const last3MonthsStartEpoch: number = Date.UTC(last3MonthsStart.getFullYear(), last3MonthsStart.getMonth(), last3MonthsStart.getDate()) / 1000;
    const last3MonthsEndEpoch: number = Date.UTC(last3MonthsEnd.getFullYear(), last3MonthsEnd.getMonth(), last3MonthsEnd.getDate()) / 1000 + 86400;

    if (req && req.duration) {
      const case1 = (req.duration.startTimeStamp === lastMonthStartEpoch && req.duration.endTimeStamp === lastMonthEndEpoch);
      const case2 = (req.duration.startTimeStamp === last3MonthsStartEpoch && req.duration.endTimeStamp === last3MonthsEndEpoch);
      if (case1 || case2) {
        return ['true', 'Data comparison is not allowed for the selected time period.'];
      }
    }
    return ['false', null];
  }

  private initChartData(metrics: any) {
    // const temp = [];
    // Object.keys(metrics).slice(0, 5).forEach(metric => {
    //   temp.push(metric);
    // });

    this.selChartMetrics = this.chartMetricsDefault;
    this.resetChartData(this.selChartMetrics);
  }

  private resetChartData(metrics: any[]) {
    metrics = this.filterBasedOnRole(metrics); //REVX-919 : ro user must not be able to see margin and media spend(cost)
    metrics.forEach((metric: string) => {
      this.showChartProgressBar = true;
      this.prepareChartData(metric, METRICS[metric], this.selFrequency);
    });
  }

  private prepareChartData(metric: string, metricDetails: any, frequency: string) {
    const promise = this.chartService.prepareChartData(metric, metricDetails, frequency,
      this.reqChart.duration, this.reqChart.compareToDuration);
    promise.then(result => {
      this.chartData.push(result);
    }, error => {
      // console.log(error);
    }).finally(() => {
      this.showChartProgressBar = false;
    });
  }

  private handleDateRangeChange(param) {
    this.dateRange = param.dateRange;
    this.checkPeriod(param.dateRange.primaryDateRange);
    this.onCompareChange();
  }

  private isLastMonth(duration: DateRange) {
    const year: number = new Date().getUTCFullYear();
    const month: number = new Date().getUTCMonth();
    const date: number = new Date().getUTCDate();
    const today: Date = new Date(year, month, date);
    const lastMonthStart: number = Date.UTC(today.getFullYear(), today.getMonth() - 1, 1) / 1000;
    const lastMonthEnd: number = Date.UTC(today.getFullYear(), today.getMonth(), 0) / 1000 + 86400;

    // console.log(lastMonthStart, lastMonthEnd, duration);

    return (duration.startDateEpoch === lastMonthStart && duration.endDateEpoch === lastMonthEnd);
  }

  private checkPeriod(duration: DateRange) {
    const period = this.getDatePeriod({
      startTimeStamp: duration.startDateEpoch,
      endTimeStamp: duration.endDateEpoch
    } as Duration);

    this.resetFrequency();
    const isLastMonth = this.isLastMonth(duration);
    if (period === 1) {
      // set frequency to hourly and disable daily
      this.selFrequency = FREQ_HOURLY;
      this.reqChart.groupBy = FREQ_HOURLY;
      this.disableFrequency(FREQ_DAILY);
    }

    if (period > 1 && period < 3) {
      this.selFrequency = FREQ_HOURLY;
      this.reqChart.groupBy = FREQ_HOURLY;
    }

    if (period > 2 && period < 15) {
      this.selFrequency = FREQ_DAILY;
      this.reqChart.groupBy = FREQ_DAILY;
    }

    if (period >= 15 && period <= 31) {
      if (isLastMonth) {
        this.selFrequency = FREQ_MONTHLY;
        this.reqChart.groupBy = FREQ_MONTHLY;
        this.disableFrequency(FREQ_HOURLY);
        this.disableFrequency(FREQ_DAILY);
      } else {
        this.selFrequency = FREQ_DAILY;
        this.reqChart.groupBy = FREQ_DAILY;
        this.disableFrequency(FREQ_HOURLY);
      }
      if (period > 15) {
        this.reqChart.compareToDuration = null;
      }
    }

    if (period > 31) {
      this.selFrequency = FREQ_MONTHLY;
      this.reqChart.groupBy = FREQ_MONTHLY;
      this.disableFrequency(FREQ_HOURLY);
      this.disableFrequency(FREQ_DAILY);
      // this.disableFrequency(FREQ_MONTHLY);
      this.frequencies.forEach(freq => {
        if (freq.id === 'monthly') {
          freq.disabled = false;
        }
      });
    }
  }

  // private handleDateRangeChange(dateRange: DateRange, isCompareDatePicker: boolean) {
  //   const duration = {
  //     startTimeStamp: dateRange.startDateEpoch,
  //     endTimeStamp: dateRange.endDateEpoch
  //   };
  //   if (isCompareDatePicker) {
  //     if (this.isCompareEnabled) {
  //       this.reqChart.compareToDuration = duration;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     this.reqChart.duration = duration;
  //     const period = this.getDatePeriod(duration);

  //     this.resetFrequency();
  //     if (period === 1) {
  //       // set frequency to hourly and disable daily
  //       this.selFrequency = FREQ_HOURLY;
  //       this.reqChart.groupBy = FREQ_HOURLY;
  //       this.disableFrequency(FREQ_DAILY);
  //     }

  //     if (period > 1 && period < 15) {
  //       if (this.selFrequency === FREQ_MONTHLY) {
  //         this.selFrequency = FREQ_DAILY;
  //         this.reqChart.groupBy = FREQ_DAILY;
  //       }
  //     }

  //     if (period >= 15 && period <= 31) {
  //       this.selFrequency = FREQ_DAILY;
  //       this.reqChart.groupBy = FREQ_DAILY;
  //       this.disableFrequency(FREQ_HOURLY);
  //       if (period > 15) {
  //         this.reqChart.compareToDuration = null;
  //       }
  //     }

  //     if (period > 30) {
  //       this.selFrequency = FREQ_MONTHLY;
  //       this.reqChart.groupBy = FREQ_MONTHLY;
  //       this.disableFrequency(FREQ_HOURLY);
  //       this.disableFrequency(FREQ_DAILY);
  //       this.disableFrequency(FREQ_MONTHLY);
  //     }
  //     if (!this.isCompareEnabled) {
  //     }
  //   }
  // }


  private resetFrequency() {
    this.frequencies = [...FREQUENCIES.map(freq => ({ ...freq }))];
  }

  private disableFrequency(frequency: string) {
    this.frequencies.forEach(item => item.id === frequency ? item.disabled = true : null);
  }

  private handleEntitySelections(param: any) {
    let filters: DashboardFilters[] = this.reqChart.filters;
    let makeAPIRequest = false;
    if (param.checked) {
      const paramExists: boolean = filters.filter(item => item.column === param.entity
        && item.value === param.entityID.toString()).length > 0;

      if (!paramExists) {
        makeAPIRequest = true;
        filters.push({
          column: param.entity,
          value: param.entityID.toString()
        });
      }
    } else {
      makeAPIRequest = true;
      filters = filters.filter(item => {
        return !(item.column === param.entity && item.value.toString() === param.entityID.toString());
      });
    }

    if (makeAPIRequest) {
      this.reqChart.filters = filters;
      this.getChartData(this.reqChart, false);
    }
  }

  private handleGridDetailsClose(param) {
    if (param.selectionChanged) {
      // remove all the filters with the column = param.entity
      const filters: DashboardFilters[] = this.reqChart.filters.filter(item => (item.column !== param.entity));
      filters.push(...param.selection.map(item => {
        return {
          column: param.entity,
          value: item.id
        };
      }));
      this.reqChart.filters = filters;
      this.getChartData(this.reqChart, false);
    }
  }

  private handleFilterUpdate(param: any) {
    this.reqChart.filters = [];
    this.reqChart.filters.push(...param.filters);
    this.getChartData(this.reqChart, false);
  }

  private onCompareChange() {
    // if (!this.isCompareEnabled) {
    //   this.reqChart.compareToDuration = null;
    // } else {
    //   const duration = {
    //     startTimeStamp: this.compareDate.startDateEpoch,
    //     endTimeStamp: this.compareDate.endDateEpoch
    //   };
    //   this.reqChart.compareToDuration = duration;
    // }

    this.isCompareEnabled = this.dateRange.isCompareEnabled;
    this.reqChart.duration = {
      startTimeStamp: this.dateRange.primaryDateRange.startDateEpoch,
      endTimeStamp: this.dateRange.primaryDateRange.endDateEpoch
    };
    if (this.dateRange.isCompareEnabled) {
      const duration = {
        startTimeStamp: this.dateRange.compareDateRange.startDateEpoch,
        endTimeStamp: this.dateRange.compareDateRange.endDateEpoch
      };
      this.reqChart.compareToDuration = duration;
    } else {
      this.reqChart.compareToDuration = null;
    }
    this.reqChart.groupBy = this.selFrequency; // 'daily';

    this.getChartData(this.reqChart, false);
  }

  private validateRequest(req: SlicexRequest) {
    const duration: Duration = req.duration;
    const compDuration: Duration = req.compareToDuration;

    if (this.isNull(duration)) { return ['false', null]; }

    if (!this.isNull(compDuration)) {
      const period1 = this.getDatePeriod(duration);
      const period2 = this.getDatePeriod(compDuration);
      return (period1 === period2) ? ['true', null] :
        ['false', 'Please ensure the selected ranges in the date pickers have the same period.'];
    }
    return ['true', null];
  }

  private isNull(duration: Duration) {
    return (duration === null || duration.startTimeStamp === null || duration.endTimeStamp === null);
  }

  private getDatePeriod(duration: Duration) {
    const end = new Date(duration.endTimeStamp * 1000);
    const start = new Date(duration.startTimeStamp * 1000);
    return moment(end).diff(moment(start), 'days');
  }

  private filterMetricsBasedOnRole(metrics) {
    const metricObj = {};
    const metricsToBeRemoved = ['cost', 'ecpa', 'ecpc', 'ecpm', 'ecpi', 'margin', 'marginPercentage'];

    const usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (usrRole === 'ROLE_RO') {
      Object.keys(metrics).forEach(key => {
        if (metricsToBeRemoved.indexOf(key) === -1) {
          metricObj[key] = metrics[key];
        }
      });
    } else {
      Object.assign(metricObj, metrics);
    }
    return metricObj;
  }

  private filterBasedOnRole(metrics) {
    const filteredMetrics = [];
    const metricsToBeRemoved = ['cost', 'ecpa', 'ecpc', 'ecpm', 'ecpi', 'margin', 'marginPercentage'];

    const usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (usrRole === 'ROLE_RO') {
      metrics.forEach(metric => {
        if (metricsToBeRemoved.indexOf(metric) === -1) {
          filteredMetrics.push(metric);
        }
      });
    } else {
      filteredMetrics.push(...metrics);
    }
    return filteredMetrics;
  }
  //#endregion

}
