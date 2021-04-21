import { Injectable } from '@angular/core';
import { SlicexData, Duration, DashboardFilters } from '@revxui/api-client-ts';
import { CommonService } from '@app/shared/_services/common.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
// import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { SlicexDateRange } from '@app/entity/report/_components/slicex/slicex.component';
import { SlicexCommonService } from './slicex-common.service';
import { cloneDeep } from "lodash";


const COLOR_SERIES = 'var(--primary-color)';
const COLOR_SERIES_COMPARE = 'var(--secondary-color)';

const FREQUENCY_HOURLY = 'hourly';
const FREQUENCY_DAILY = 'daily';
const FREQUENCY_MONTHLY = 'monthly';

export interface ChartData {
  ContainerID: string;
  Metric: string;
  MetricDisplayName: string;
  MetricUnit: string;
  MetricUnitValue: string;
  Total: any;
  ChartType: string;
  ChartSeries: any[];
  Frequency: string;
}

export const METRICS = {
  revenue: {
    display_name: 'Advertiser Spend',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '1'
  },
  cost: {
    display_name: 'Media Spend',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '2'
  },
  margin: {
    display_name: 'Margin',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '3'
  },
  marginPercentage: {
    display_name: 'Margin %',
    type: AppConstants.NUMBER_TYPE_PERCENTAGE,
    order: '4'
  },
  impressions: {
    display_name: 'Impressions',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '5'
  },
  clicks: {
    display_name: 'Clicks',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '6'
  },
  installs: {
    display_name: 'Installs',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '7'
  },
  impInstalls: {
    display_name: 'View Installs',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '8'
  },
  clickInstalls: {
    display_name: 'Click Installs',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '9'
  },
  conversions: {
    display_name: 'Conversions',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '10'
  },
  clickConversions: {
    display_name: 'Click Conversions',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '11'
  },
  viewConversions: {
    display_name: 'View Conversions',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '12'
  },
  ecpm: {
    display_name: 'eCPM',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '13'
  },
  ecpa: {
    display_name: 'eCPA',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '14'
  },
  ecpc: {
    display_name: 'eCPC',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '15'
  },
  ecpi: {
    display_name: 'eCPI',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '16'
  },
  erpm: {
    display_name: 'eRPM',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '17'
  },
  erpa: {
    display_name: 'eRPA',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '18'
  },
  erpc: {
    display_name: 'eRPC',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '19'
  },
  erpi: {
    display_name: 'eRPI',
    type: AppConstants.NUMBER_TYPE_CURRENCY,
    order: '20'
  },
  ctr: {
    display_name: 'CTR',
    type: AppConstants.NUMBER_TYPE_PERCENTAGE,
    order: '21'
  },
  iti: {
    display_name: 'ITI',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '22'
  },
  ctc: {
    display_name: 'CTC',
    type: AppConstants.NUMBER_TYPE_PERCENTAGE,
    order: '23'
  },
  cvr: {
    display_name: 'CVR',
    type: AppConstants.NUMBER_TYPE_PERCENTAGE,
    order: '24'
  },
  impPerConversion: {
    display_name: 'Imp per Conversion',
    type: AppConstants.NUMBER_TYPE_NOTHING,
    order: '25'
  }
};

export const ENTITIES = {
  licensee: {
    display_name: 'Licensee',
    priority: 1
  },
  advertiser: {
    display_name: 'Advertiser',
    priority: 2
  },
  campaign: {
    display_name: 'Campaign',
    priority: 3
  },
  strategy: {
    display_name: 'Strategy',
    priority: 4
  },
  creativeSize: {
    display_name: 'Creative Size',
    priority: 5
  },
  aggregator: {
    display_name: 'Aggregator',
    priority: 6
  },
  app: {
    display_name: 'App'
  },
  os: {
    display_name: 'OS',
    priority: 7
  },
  creative: {
    display_name: 'Creative',
    priority: 8
  },
  country: {
    display_name: 'Country',
    priority: 9
  },
  // channels: {
  //   display_name: 'Channels',
  //   priority: 10
  // },
  pricing: {
    display_name: 'Pricing Type',
    priority: 10
  },
  campaignObjective: {
    display_name: 'Campaign Objective',
    priority: 11
  },
  advregions: {
    display_name: 'Advertiser Region',
    priority: 12
  }
};

export const FREQUENCIES = [
  { id: 'hourly', title: 'Hourly', disabled: false },
  { id: 'daily', title: 'Daily', disabled: false },
  { id: 'monthly', title: 'Monthly', disabled: true }
];

@Injectable({
  providedIn: 'root'
})
export class SlicexChartService {

  private rawChartData: SlicexData[] = [];
  private rawChartDataCompare: SlicexData[] = [];

  public onFiltersUpdated = new Subject<{ breadcrumbs: any, filters: DashboardFilters[] }>();
  public onChartDimensionsReset = new Subject();
  public onDateRangeSet = new Subject<{ dateRange: SlicexDateRange }>();

  isDateRangeValid = true;

  constructor(
    private commonService: CommonService,
    // private http: HttpClient
    private slicexCommonService: SlicexCommonService
  ) { }


  // public getSlicexDataChartUsingPOST(req: SlicexRequest, inpToken: string) {
  //   return this.http.post('http://localhost:10045/v2/api/slicex/chart',
  //     req, {
  //     headers: {
  //       accept: 'application/json',
  //       token: inpToken
  //     },
  //   });
  // }

  /**
   * GETTER - returns the raw data as obtained by calling getSlicexDataChartUsingPOST method from SliceXControllerService
   */
  public getRawChartData() {
    return (this.rawChartData !== null && this.rawChartData !== undefined
      && Array.isArray(this.rawChartData) && this.rawChartData.length > 0) ?
      this.rawChartData : null;
  }

  /**
   * SETTER - sets the raw data as obtained by calling getSlicexDataChartUsingPOST method from SliceXControllerService
   * @param data : array of SlicexData
   */
  public setRawChartData(data: SlicexData[]) {
    this.rawChartData = data;
  }

  /**
   * GETTER - returns the raw data as obtained by calling the getSlicexDataChartUsingPOST method from SliceXControllerService
   */
  public getRawChartDataCompare() {
    return (this.rawChartDataCompare !== null && this.rawChartDataCompare !== undefined
      && Array.isArray(this.rawChartDataCompare) && this.rawChartDataCompare.length > 0) ?
      this.rawChartDataCompare : null;
  }

  /**
   * SETTER - sets the raw data as obtained by calling getSlicexDataChartUsingPOST method from SliceXControllerService
   * @param data : array of SlicexData
   */
  public setRawChartDataCompare(data: SlicexData[]) {
    this.rawChartDataCompare = data;
  }

  public updateFilters(inpBreadcrums: any) {
    // const ftrs: DashboardFilters[] = [];
    // Object.keys(inpBreadcrums).forEach(key => {
    //   ftrs.push(...inpBreadcrums[key].values.map(item => {
    //     return {
    //       column: key,
    //       value: item.id.toString()
    //     };
    //   }));
    // });

    let ftrs: DashboardFilters[] = [];
    ftrs = cloneDeep(this.slicexCommonService.getFilters(inpBreadcrums))
    this.onFiltersUpdated.next({ breadcrumbs: inpBreadcrums, filters: ftrs });
  }

  /**
   *
   * @param metric : the metric for which the data needs to be prepared.
   * @param metricDetails : object containing the other details associated with the metric
   * @param frequency :
   */
  public prepareChartData(metric: string, metricDetails: any, frequency: string, duration: Duration, compDuration: Duration):
    Promise<ChartData> {

    const promise = new Promise<ChartData>((res, rej) => {

      // let total = 0;
      // let compTotal = 0;

      let data: SlicexData[] = this.getRawChartData();
      let compareData: SlicexData[] = this.getRawChartDataCompare();
      const isCompareDatePickerEnabled: boolean = compareData ? true : false;

      if (data === null || data === undefined) {
        rej(null);
      }

      const series = [{ data: [], color: COLOR_SERIES, lineWidth: 2 }];
      if (isCompareDatePickerEnabled) {
        series.push({ data: [], color: COLOR_SERIES_COMPARE, lineWidth: 1 });
      }
      const currency = data.length > 0 ? data[0].currencyId : 'USD';
      data = this.fillMissingValues(data, duration, frequency, currency);
      compareData = this.fillMissingValues(compareData, compDuration, frequency, currency);

      data.forEach((item, index) => {
        // total += +item[metric];

        const xAxis = frequency === FREQUENCY_HOURLY ? new Date(0).setUTCHours(item.hour, null, item.day) :
          new Date(0).setUTCSeconds(item.day);
        series[0].data.push([xAxis, +item[metric]]);

        if (isCompareDatePickerEnabled && (compareData != null && compareData.length > 0)) {
          const compItem = compareData[index];
          // compTotal += (compItem !== null && compItem !== undefined) ? +compItem[metric] : 0;
          series[1].data.push([xAxis, (compItem !== null && compItem !== undefined) ? +compItem[metric] : 0]);
        }
      });

      const total = this.calculateTotal(data, metric);
      const compTotal = this.calculateTotal(compareData, metric);

      const percentChange = this.computeChange(compTotal, total);
      const changeFact = (!percentChange) ? null : percentChange > 0 ? 1 : -1;


      const response: ChartData = {
        ContainerID: `chart-container-${metric}`,
        Metric: metric,
        MetricDisplayName: metricDetails.display_name,
        MetricUnit: metricDetails.type,
        MetricUnitValue: currency,
        Total: {
          value: this.commonService.nrFormatWithCurrency(total, metricDetails.type, currency),
          valueRaw: this.formatNumber(total, metricDetails.type, currency),
          compValue: compTotal > 0 ?
            this.commonService.nrFormatWithCurrency(compTotal, metricDetails.type, currency) : null,
          compValueRaw: compTotal > 0 ?
            this.formatNumber(compTotal, metricDetails.type, currency) : null,
          change: (!percentChange) ? null :
            this.commonService.nrFormatWithCurrency(Math.abs(percentChange), AppConstants.NUMBER_TYPE_PERCENTAGE, currency),
          changeFactor: changeFact
        },
        ChartSeries: series,
        ChartType: 'line',
        Frequency: frequency,
      };

      res(response);
    });

    return promise;
  }

  formatNumber(value: number, type: string, currency: string) {
    // currency = !(currency) ? localStorage.getItem(AppConstants.CACHED_CURRENCY) : AppConstants.CURRENCY_MAP[currency];

    // let numStr: string;
    // if (value !== null && value !== undefined) {
    //   numStr = value.toString();
    //   if (type !== undefined) {
    //     switch (type) {
    //       case AppConstants.NUMBER_TYPE_CURRENCY:
    //         numStr = `${currency} ${numStr}`;
    //         break;
    //       case AppConstants.NUMBER_TYPE_PERCENTAGE:
    //         numStr += '%';
    //         break;
    //     }
    //   }
    // }

    // return numStr;

    return this.slicexCommonService.formatNumber(value, type, currency);
  }

  public resetChartWidth() {
    this.onChartDimensionsReset.next();
  }

  public setIsDateRangeValid(isValid: boolean) {
    this.isDateRangeValid = isValid;
  }

  public getIsDateRangeValid() {
    return this.isDateRangeValid;
  }

  public setDateRange(inpDateRange: SlicexDateRange) {
    this.isDateRangeValid = true;
    this.onDateRangeSet.next({ dateRange: inpDateRange });
  }

  private fillMissingValues(data: SlicexData[], duration: Duration, frequency: string, currency: string): SlicexData[] {
    if (data === null || data === undefined || !Array.isArray(data) || data.length === 0) { return null; }
    if (duration === null || duration === undefined) { return null; }

    const period = this.getDatePeriod(duration, frequency);
    if (data.length === period) {
      return data;
    } else {
      if (frequency === FREQUENCY_DAILY) {
        return this.handleMissingValuesDaily(data, duration, currency);
      } else if (frequency === FREQUENCY_HOURLY) {
        return this.handleMissingValuesHourly(data, duration, currency);
      } else {
        return data;
      }
    }
  }

  private getDatePeriod(duration: Duration, frequency: string) {
    const end = new Date(duration.endTimeStamp * 1000);
    const start = new Date(duration.startTimeStamp * 1000);
    return (frequency === FREQUENCY_HOURLY) ? moment(end).diff(moment(start), 'days') * 24 :
      moment(end).diff(moment(start), 'days');
  }

  private handleMissingValuesDaily(data: SlicexData[], duration: Duration, currency: string) {
    const currDays: number[] = data.map(item => item.day);
    let curr = duration.startTimeStamp;
    const end = duration.endTimeStamp;
    while (curr < end) {
      const date = new Date(curr * 1000);
      if (currDays.indexOf(curr) === -1) {
        data.push(this.initSlicexDataRow(currency, curr, null));
      }

      date.setDate(date.getDate() + 1);
      curr = date.getTime() / 1000;
    }

    return this.sortSlicexData(data, FREQUENCY_DAILY);
  }

  handleMissingValuesHourly(data: SlicexData[], duration: Duration, currency: string) {
    // const currDayHours: Map<number, number[]> = new Map<number, number[]>();
    // const days = [...new Set(data.map(item => item.day))];
    // days.forEach(day => {
    //   currDayHours[day] = data.filter(rec => rec.day === day);
    // });
    // const period = this.getDatePeriod(duration, FREQUENCY_DAILY);
    // if (period !== currDayHours.size) {

    // }
    return data;
  }

  initSlicexDataRow(currency: string, inpDay: number, inpHour: number): SlicexData {
    return {
      advRevenue: 0,
      bidsPlaced: 0,
      clickConversions: 0,
      clickInstalls: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      ctc: 0,
      ctr: 0,
      currencyId: currency,
      cvr: 0,
      day: inpDay,
      ecpa: 0,
      ecpc: 0,
      ecpi: 0,
      ecpm: 0,
      eligibleBids: 0,
      eligibleUniqUsers: 0,
      erpa: 0,
      erpc: 0,
      erpi: 0,
      erpm: 0,
      hour: inpHour,
      id: 0,
      impInstalls: 0,
      impressionUniqUsers: 0,
      impressions: 0,
      installs: 0,
      invalidClicks: 0,
      iti: 0,
      margin: 0,
      modifiedBy: 0,
      modifiedTime: 0,
      name: '',
      revenue: 0,
      roi: 0,
      userReach: 0,
      viewConversions: 0
    };
  }

  sortSlicexData(data: SlicexData[], frequency: string) {
    // if (frequency === FREQUENCY_DAILY) {
    //   return data.sort((item1, item2) => {
    //     return item1.day - item2.day;
    //   });
    // } else {
    //   return data.sort((item1, item2) => {
    //     return item1.day - item2.day;
    //   });

    // }
    return data.sort((item1, item2) => {
      return item1.day - item2.day;
    });
  }

  computeChange(v1: number, v2: number) {
    // if (v1 === 0 || v2 === 0) {
    //   return null;
    // }

    // return ((v2 - v1) / v1) * 100;
    return this.slicexCommonService.computeChange(v1, v2);
  }

  calculateTotal(data: SlicexData[], metric: string) {

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    if (data === null || data === undefined) return 0;

    let total = 0;
    switch (metric) {
      case 'revenue':
      case 'cost':
      case 'impressions':
      case 'clicks':
      case 'impInstalls':
      case 'clickInstalls':
      case 'clickConversions':
      case 'viewConversions':
        total = data.map(item => +item[metric]).reduce(reducer, 0);
        break;

      case 'margin':
        const marginRevenueSummation = data.map(item => +item.revenue).reduce(reducer, 0);
        const marginCostSummation = data.map(item => +item.cost).reduce(reducer, 0);
        total = marginRevenueSummation - marginCostSummation;
        break;

      case 'installs':
        total = data.map(item => +item.impInstalls + +item.clickInstalls).reduce(reducer, 0);
        break;

      case 'conversions':
        total = data.map(item => +item.viewConversions + +item.clickConversions).reduce(reducer, 0);
        break;

      case 'ecpm':
        const ecpmCostSummation = data.map(item => +item.cost).reduce(reducer, 0);
        const ecpmImpSummation = data.map(item => +item.impressions).reduce(reducer, 0);
        total = (ecpmImpSummation === 0) ? 0 : (ecpmCostSummation * 1000) / ecpmImpSummation;
        break;

      case 'ecpa':
        const ecpaConvertionSummation = data.map(item => +item.viewConversions + +item.clickConversions).reduce(reducer, 0);
        const ecpaCostSummation = data.map(item => +item.cost).reduce(reducer, 0);
        total = (ecpaConvertionSummation === 0) ? 0 : ecpaCostSummation / ecpaConvertionSummation;
        break;

      case 'ecpc':
        const ecpcCostSummation = data.map(item => +item.cost).reduce(reducer, 0);
        const ecpcClickSummation = data.map(item => +item.clicks).reduce(reducer, 0);
        total = (ecpcClickSummation === 0) ? 0 : ecpcCostSummation / ecpcClickSummation;
        break;

      case 'ecpi':
        const ecpiInstallSummation = data.map(item => +item.impInstalls + +item.clickInstalls).reduce(reducer, 0);
        const ecpiCostSummation = data.map(item => +item.cost).reduce(reducer, 0);
        total = (ecpiInstallSummation === 0) ? 0 : ecpiCostSummation / ecpiInstallSummation;
        break;

      case 'erpm':
        const erpmRevenueSummation = data.map(item => +item.revenue).reduce(reducer, 0);
        const erpmImpSummation = data.map(item => +item.impressions).reduce(reducer, 0);
        total = (erpmImpSummation === 0) ? 0 : (erpmRevenueSummation * 1000) / erpmImpSummation;
        break;

      case 'erpa':
        const erpaConvertionSummation = data.map(item => +item.viewConversions + +item.clickConversions).reduce(reducer, 0);
        const erpaRevenueSummation = data.map(item => +item.revenue).reduce(reducer, 0);
        total = (erpaConvertionSummation === 0) ? 0 : erpaRevenueSummation / erpaConvertionSummation;
        break;

      case 'erpc':
        const erpcRevenueSummation = data.map(item => +item.revenue).reduce(reducer, 0);
        const erpcClickSummation = data.map(item => +item.clicks).reduce(reducer, 0);
        total = (erpcClickSummation === 0) ? 0 : erpcRevenueSummation / erpcClickSummation;
        break;

      case 'erpi':
        const erpiInstallSummation = data.map(item => +item.impInstalls + +item.clickInstalls).reduce(reducer, 0);
        const erpiRevenueSummation = data.map(item => +item.revenue).reduce(reducer, 0);
        total = (erpiInstallSummation === 0) ? 0 : erpiRevenueSummation / erpiInstallSummation;
        break;

      case 'ctr':
        const ctrClickSummation = data.map(item => +item.clicks).reduce(reducer, 0);
        const ctrImpSummation = data.map(item => +item.impressions).reduce(reducer, 0);
        total = (ctrImpSummation === 0) ? 0 : (ctrClickSummation * 100) / ctrImpSummation;
        break;

      case 'iti':
        const itiInstallSummation = data.map(item => +item.impInstalls + +item.clickInstalls).reduce(reducer, 0);
        const itiImpSummation = data.map(item => +item.impressions).reduce(reducer, 0);
        total = (itiInstallSummation === 0) ? 0 : itiImpSummation / itiInstallSummation;
        break;

      case 'ctc':
        const ctcClickSummation = data.map(item => +item.clicks).reduce(reducer, 0);
        const ctcConversionsSummation = data.map(item => +item.viewConversions + +item.clickConversions).reduce(reducer, 0);
        total = (ctcClickSummation === 0) ? 0 : (ctcConversionsSummation * 100) / ctcClickSummation;
        break;

      case 'cvr':
        const cvrImpSummation = data.map(item => +item.impressions).reduce(reducer, 0);
        const cvrConversionsSummation = data.map(item => +item.viewConversions + +item.clickConversions).reduce(reducer, 0);
        total = (cvrImpSummation === 0) ? 0 : (cvrConversionsSummation * 100) / cvrImpSummation;
        break;

      case 'marginPercentage':
        const marginPercentRevenueSummation = data.map(item => +item.revenue).reduce(reducer, 0);
        const marginPercentCostSummation = data.map(item => +item.cost).reduce(reducer, 0);
        total = (marginPercentRevenueSummation === 0) ? 0 :
          ((marginPercentRevenueSummation - marginPercentCostSummation) * 100) / marginPercentRevenueSummation;
        break;

      case 'impPerConversion':
        const impPerConvConversionSummation = data.map(item => +item.viewConversions + +item.clickConversions).reduce(reducer, 0);
        const impPerConvImpSummation = data.map(item => +item.impressions).reduce(reducer, 0);
        total = (impPerConvConversionSummation === 0) ? 0 : impPerConvImpSummation / impPerConvConversionSummation;
        break;

      default:
        total = 0;
        break;
    }
    return total;
  }
}
