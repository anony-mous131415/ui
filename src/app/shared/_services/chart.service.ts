import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';
import {
  ApiResponseObjectChartDashboardResponse,
  AuditControllerService,
  DashboardControllerService,
  DashboardRequest,
  DashboardData,
  ChartDashboardResponse
} from '@revxui/api-client-ts';
import { ApiResponseObjectListAuditMarker } from '@revxui/api-client-ts/model/apiResponseObjectListAuditMarker';
import { AuditMarker } from '@revxui/api-client-ts/model/auditMarker';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { Observable, Subject, of } from 'rxjs';
import { DateRange } from '@app/shared/_models/date.range.model';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { AuditDetailsModalComponent } from '@app/shared/_directives/_modals/audit-details-modal/audit-details-modal.component';
import { mock } from '../_directives/list/mock';
import { delay } from 'rxjs/operators';

export interface chartSeriesData {
  y: number,
  data: string
}


const CHARS_PER_LINE = 40;
const SHOW_DATA = 'show';
const ZERO_DATA = 'zero';
const HIDE_DATA = 'hide';

const DashData: DashboardData = {
  active: false,
  advRevenue: 0,
  advertiser: null,
  bidsPlaced: 0,
  campaign: null,
  clickConversions: 0,
  clickInstalls: 0,
  clicks: 0,
  conversions: 0,
  cost: 0,
  creative: null,
  ctc: 0,
  ctr: 0,
  currencyId: null,
  cvr: 0,
  day: 0,
  ecpa: 0,
  ecpc: 0,
  ecpi: 0,
  ecpm: 0,
  eligibleBids: 0,
  eligibleUniqUsers: 0,
  endTimestamp: 0,
  erpa: 0,
  erpc: 0,
  erpi: 0,
  erpm: 0,
  hour: 0,
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
  name: null,
  revenue: 0,
  roi: 0,
  startTimestamp: 0,
  strategy: null,
  userReach: 0,
  viewConversions: 0
}



export interface AuditElement {
  userName: string;
  entityId: number;
  entityName: string;
  feildsChanged: string;
}

export interface AuditTooltip {
  campaign?: Array<AuditElement>;
  strategy?: Array<AuditElement>;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  markerClicked = new Subject<any>();

  auditPointMap: Map<number, number>;
  lastChartApiRequest: DashboardRequest;
  dataPointMap: Map<number, any>;
  entityType: string;
  entityId: number;

  constructor(
    private dashboardService: DashboardControllerService,
    private commonService: CommonService,
    private entitiesService: EntitiesService,
    public dialog: MatDialog,
    public auditApiService: AuditControllerService
  ) { }


  /**
   * Api Call to fetch the csv path
   * @param dashboardRequest
   */
  getChartDataCSV(dashboardRequest: DashboardRequest):
    Observable<any> {
    return this.dashboardService.getDashboardDataChartCsvUsingPOST(dashboardRequest);
  }

  /**
   * Api Call to fetch chart data
   * @param dashboardRequest
   * @param entity
   * @param filters
   */
  getChartData(dashboardRequest: DashboardRequest, showUU: boolean, refresh: boolean):
    Observable<ApiResponseObjectChartDashboardResponse> {
    this.lastChartApiRequest = dashboardRequest;
    return this.dashboardService.getDashboardDataChartUsingPOST(dashboardRequest, showUU, refresh);
  }


  // getChartData(dashboardRequest: DashboardRequest, showUU: boolean, refresh: boolean):
  //   Observable<any> {
  //   this.lastChartApiRequest = dashboardRequest;
  //   showUU = (!showUU) ? false : true;
  //   if (showUU == true) {
  //     return of(mock.resp_chart_uu_true).pipe(delay(7000));
  //   } else {
  //     return of(mock.resp_chart_uu_false).pipe(delay(3000));
  //   }
  // }


  //api call for placing markers on charts
  getAuditTooltipData(startEpoch: number, endEpoch: number, _entityType, _entityId): Observable<ApiResponseObjectListAuditMarker> {
    this.entityType = _entityType;
    this.entityId = _entityId;
    return this.auditApiService.getAuditLogUsingGET(endEpoch, _entityType, _entityId, startEpoch);
  }

  /**
   * 
   * @param apiResponse 
   * @param dateRange 
   * @param entity 
   * @param chartObj 
   * @param auditTooltipData 
   * supplies all required stuff for calling formChart()
   * 
   */
  convertApiDataToHightChartData(apiResponse: ChartDashboardResponse, dateRange: DateRange, entity: string, chartObj, auditTooltipData: any) {
    if (!apiResponse || !apiResponse.data || !apiResponse.data.length) {
      apiResponse = this.getDummyApiResp(dateRange);
    }
    const currencyCode: string = this.getCurrencyCodeForReponse(apiResponse);
    const xAxisLables: any = this.prepareXAxisLabels(dateRange);
    let requiredMaps = this.getMaps(dateRange, apiResponse);
    this.dataPointMap = (requiredMaps && requiredMaps.dataMap) ? requiredMaps.dataMap : null;
    this.auditPointMap = (requiredMaps && requiredMaps.auditMap) ? requiredMaps.auditMap : null;
    let chartOptionObj = this.formChart(apiResponse, xAxisLables, entity, chartObj, currencyCode, auditTooltipData, dateRange);
    return chartOptionObj;
  }


  getDummyApiResp(dateRange: DateRange): ChartDashboardResponse {
    let dummyData: DashboardData[] = [];
    let nowEpoch = Math.floor(Date.now() / 1000);
    dummyData.push(DashData);
    dummyData.push(DashData);
    dummyData[0].id = dateRange.startDateEpoch;
    dummyData[1].id = Math.min(dateRange.endDateEpoch, nowEpoch);
    dummyData[0].currencyId = localStorage.getItem(AppConstants.CACHED_CURRENCY);
    dummyData[1].currencyId = localStorage.getItem(AppConstants.CACHED_CURRENCY);
    let returnObject: ChartDashboardResponse = {
      data: dummyData,
      totalNoOfRecords: 2
    }
    return returnObject;
  }


  /**
   * 
   * @param apiResponse 
   * @param xLabels 
   * @param entity 
   * @param chartObj 
   * @param currencyCode 
   * @param auditTooltipData 
   * 
   * return options for highcharts
   */
  formChart(apiResponse: ChartDashboardResponse, xLabels: string[], entity: string, chartObj, currencyCode, auditTooltipData, dateRange: DateRange) {

    let ylable1: any = this.createYAxisDetails(chartObj, 1, currencyCode);
    let series1: any = this.createChartSeries(apiResponse, chartObj, 1, dateRange);
    let yLables: any[] = [ylable1];
    let seriesData: any[] = [series1];

    if (chartObj.selector2 && chartObj.selector2.length > 0) {
      let ylable2: any = this.createYAxisDetails(chartObj, 2, currencyCode);
      let series2: any = this.createChartSeries(apiResponse, chartObj, 2, dateRange);
      yLables.push(ylable2);
      seriesData.push(series2);
    }

    if (entity.toUpperCase() == AppConstants.ENTITY.CAMPAIGN || entity.toUpperCase() == AppConstants.ENTITY.STRATEGY) {
      let series3: any = this.createAuditSeries(auditTooltipData);
      seriesData.push(series3);
    }


    // Create the chart
    let chartOptions = {

      chart: {
        height: 320,
        // width: 1568,
        spacingLeft: 0,
        zoomType: "xy"
      },

      legend: {
        enabled: true,
        layout: 'vertical',
        align: 'left',
        x: 220,
        verticalAlign: 'top',
        y: 0,
        floating: true,
        backgroundColor: 'rgba(255,255,255,0.25)'
      },

      rangeSelector: {
        enabled: false
      },

      navigator: {
        enabled: false
      },

      title: {
        text: ''
      },

      scrollbar: {
        enabled: false
      },

      credits: {
        enabled: false
      },

      xAxis: [{
        crosshair: false, 
        labels: {
          // step: -1,
          // autoRotation: [-50],
          formatter: function () {
            // console.log(this);
            return xLabels[this.value];
          }
        },
      }],

      yAxis: yLables,

      series: seriesData,

      tooltip: {
        split: false,
        shared: false,
        borderColor: '#fcb57e',
        backgroundColor: '#fff6ef',
        distance: 10,
        useHTML: true,
        animation: true,
        followPointer: false,
        stickOnContact: true,
        formatter: function () {
          return (this.point.dataPointTooltip) ? this.point.dataPointTooltip : this.point.auditPointTooltip;
        }
      },

      plotOptions: {
        line: {
          marker: {
            enabled: true,
            radius: 4.5
          },
          // tooltip: {
          //   stickOnContact: false,
          // },
        },

        flags: {
          stickyTracking: true,
          tooltip: {
            stickOnContact: true,
          },
          states: {
            inactive: {
              opacity: 1
            }
          },
          events: {
            click: (event) => this.clickedMarker(event)
          }
        },

        //no animation , when rendering series
        series: {
          animation: {
            defer: 0,
            duration: 0
          }
        }

      }
    }

    return chartOptions;
  }




  // methods for helper maps initialization 
  getMaps(dateRange: DateRange, apiResponse: any) {
    if (!apiResponse || !apiResponse.data || !apiResponse.data.length) {
      return null;
    }

    const dateDiff: number = (dateRange.endDateEpoch - dateRange.startDateEpoch) / 86400;
    const day = 86400;
    const hour = 3600;
    const incrementalVal = (dateDiff > 2) ? day : hour;

    const utcCurrDate = new Date().getUTCDate();
    const utcCurrMonth = new Date().getUTCMonth();
    const utcCurrYear: number = new Date().getUTCFullYear();

    const utcReqEndDate = dateRange.endDate.getDate();
    const utcReqEndMonth = dateRange.endDate.getMonth();

    const isTodayInReq = (utcCurrDate === utcReqEndDate && utcCurrMonth === utcReqEndMonth) ? true : false;

    let requiredMaps = this.initializeMaps(dateRange, apiResponse, incrementalVal);

    let dataPointMap: Map<number, any> = requiredMaps.dataMap;

    const maxRespTimestamp = this.getMaxEpoch(apiResponse);
    const utcEpochToday12am = Date.UTC(utcCurrYear, utcCurrMonth, utcCurrDate, 0, 0, 0) / 1000;

    //if today is a part of request then we need to remove those entries from map for which data is not there : bcz that time may be future
    if (isTodayInReq) {
      for (const [key, value] of dataPointMap.entries()) {
        if (key >= utcEpochToday12am && key > maxRespTimestamp) {
          dataPointMap.set(key, HIDE_DATA);
        }
      }
    }

    return requiredMaps;
  }

  /**
   * 
   * @param dateRange 
   * @param apiResponse 
   * @param incrementalVal 
   * based on date range , initialize maps required
   */

  initializeMaps(dateRange: DateRange, apiResponse: any, incrementalVal: number) {

    let dataPointMap = new Map<number, any>();
    let auditPointMap = new Map<number, number>();
    let keyEpoch = dateRange.startDateEpoch;
    let storedCordinate = 0; 
    const epochs_in_apiResp: any[] = apiResponse.data.map(x => x.id);

    //1st point in grapgh is a dummy point which will not show in ui , just for padding
    // dataPointMap.set(-1, HIDE_DATA);

    while (keyEpoch < dateRange.endDateEpoch) {
      if (epochs_in_apiResp.includes(keyEpoch)) {
        dataPointMap.set(keyEpoch, SHOW_DATA);
      } else {
        dataPointMap.set(keyEpoch, ZERO_DATA);
      }

      auditPointMap.set(keyEpoch, storedCordinate);
      storedCordinate += 1;
      keyEpoch += incrementalVal;
    }

    //last point in grapgh is a dummy point which will not show in ui , just for padding
    dataPointMap.set(CampaignConstants.NEVER_ENDING_EPOCH, HIDE_DATA);

    let returnMap = {
      dataMap: dataPointMap,
      auditMap: auditPointMap
    };
    return returnMap;
  }


  /**
   * 
   * @param apiResponse 
   * get max epoch from response epochs
   */
  getMaxEpoch(apiResponse: any) {
    let idsInApiResp: any[] = apiResponse.data.map(x => x.id);
    idsInApiResp.sort();
    return idsInApiResp[idsInApiResp.length - 1];
  }



  /**
   * 
   * @param apiData 
   * grouping logic , to club all changes based on time
   */
  groupAuditDetailsByTime(apiData: AuditMarker[]): Map<number, AuditTooltip> {
    let tooltipMap = new Map<number, AuditTooltip>();
    let newData: AuditTooltip = {
      campaign: [],
      strategy: []
    };

    apiData.forEach(apiRespElement => {

      const newChange: AuditElement = {
        userName: this.commonService.getUserName(apiRespElement.user_name),
        entityId: apiRespElement.entity_id,
        entityName: apiRespElement.entity_name,
        feildsChanged: apiRespElement.message
      };

      let nearestEpochKey = this.getNearestEpochKey(apiRespElement.timestamp);
      let present = tooltipMap.has(nearestEpochKey)
      let valueToInsert = (present) ? cloneDeep(tooltipMap.get(nearestEpochKey)) : cloneDeep(newData);

      // for change in CAMPAIGN
      if (apiRespElement.entity_type === AppConstants.ENTITY.CAMPAIGN) {
        let idx = valueToInsert.campaign.findIndex(x => x.userName === newChange.userName);

        //if the user has already made a change  , we need to club 
        //current change with his prev changes as comma-seperated string
        if (idx != -1) {
          valueToInsert.campaign[idx].feildsChanged = valueToInsert.campaign[idx].feildsChanged.concat(',' + newChange.feildsChanged)
        }

        //if current change is made by an new user , then new array entry should be added
        else {
          valueToInsert.campaign.push(newChange);
        }
      }


      // for change in STRATEGY
      else if (apiRespElement.entity_type === AppConstants.ENTITY.STRATEGY) {
        // valueToInsert.strategy.push(newChange);
        let idx = valueToInsert.strategy.findIndex(x => x.userName === newChange.userName);
        if (idx != -1) {
          valueToInsert.strategy[idx].feildsChanged = valueToInsert.strategy[idx].feildsChanged.concat(',' + newChange.feildsChanged)
        }
        else {
          valueToInsert.strategy.push(newChange);
        }
      }

      tooltipMap.set(nearestEpochKey, valueToInsert);
    });

    return tooltipMap;
    // console.log(tooltipMap);
  }


  /**
   * 
   * @param epoch 
   * this is to round off an audit epoch to data point epoch
   */
  getNearestEpochKey(epoch: number): number {

    if (!this.auditPointMap || !this.auditPointMap.size) {
      return 0;
    }

    let returnEpoch = Number.MAX_VALUE;
    let calculatedDifference = Number.MAX_VALUE;
    for (let [key, value] of this.auditPointMap) {
      if (key <= epoch) {
        if (epoch - key < calculatedDifference) {
          calculatedDifference = epoch - key;
          returnEpoch = key;
        }
      } else {
        break;
      }
    }
    return returnEpoch;
  }


  /**
   * 
   * @param auditApiResponse 
   * based on audit api resp , create seperate series for audit data
   */
  createAuditSeries(auditApiResponse: AuditMarker[]) {
    let groupedDataMap = (auditApiResponse && auditApiResponse.length > 0) ? this.groupAuditDetailsByTime(auditApiResponse) : null;
    let auditSeriesData: any[] = [];
    let isAuditDataShown: boolean = (this.auditPointMap && this.auditPointMap.size) ? true : false; //check if audit data map is valid

    if (isAuditDataShown && groupedDataMap != null) {
      for (let [key, value] of groupedDataMap) {
        let obj = {
          x: this.auditPointMap.get(key),
          epoch: key,
          auditPointTooltip: this.getAuditTooltip(key, value)
        };
        auditSeriesData.push(obj);
      }
    }

    let auditSeries = {
      id: 'flag-series',
      name: 'flag-series',
      type: 'flags',
      data: auditSeriesData,
      onSeries: '',
      shape: 'url(/assets/marker.png)',
      y: -20,
      x: 100,
      title: " ",
      cursor: 'pointer',
      showInLegend: false,
      zIndex: 999,
      visible: isAuditDataShown
    };

    return auditSeries;
  }


  /**
   * 
   * @param epoch 
   * @param inputObject 
   * given an epoch  and changes on that time , get tooltip html string
   */
  getAuditTooltip(epoch: number, inputObject: AuditTooltip) {
    //date
    //user
    //changes
    let formattedDay = this.commonService.epochToDateFormatter(epoch);
    let user = "";
    let feilds = "";
    let entityChanged = "";
    let toolTipString = ""

    toolTipString += "<div>"
    toolTipString += "<p class='pb-1 , m-0' style='position: sticky;top:0;'>"
    toolTipString += "<strong>" + formattedDay + "</strong></p>"
    toolTipString += "<hr class='pt-1' style='border:solid #fcb57e; border-width:2px 0 0 0; height:0;width:auto;line-height:0px;margin:0;padding:0;'>"

    toolTipString += "<div class='auditTooltip'>"
    toolTipString += "<ul style='padding-left:1rem;padding-right:1rem;'>"

    inputObject.campaign.forEach(changeByUser => {
      user = changeByUser.userName;
      entityChanged = changeByUser.entityName;
      feilds = changeByUser.feildsChanged;

      //testing
      // feilds += "," + feilds + "," + feilds + "," + feilds + "," + feilds + "," + feilds + "," + feilds;

      toolTipString += "<li class='pt-2'><strong>" + user + "</strong>";
      toolTipString += " changed the following feilds : " + "<br>";
      toolTipString += "<strong>" + entityChanged + "</strong>" + " <br>";

      let feildsDisplayArr = feilds.split(',');
      let feildHtmlStr = '';

      feildsDisplayArr.forEach((nextChange, idx) => {
        let lastBreakIdx = feildHtmlStr.lastIndexOf('<br>');
        //add 1st feild-name
        if (idx === 0) {
          feildHtmlStr += nextChange + ' , ';
        }
        //oterwise , check length of substing after <br>
        else {
          lastBreakIdx = (lastBreakIdx === -1) ? 0 : lastBreakIdx + 3;
          let subStr = feildHtmlStr.substring(lastBreakIdx);
          let lengthAfterLastBreak = subStr.length + nextChange.length + 3
          if (subStr && lengthAfterLastBreak > CHARS_PER_LINE) {
            feildHtmlStr += '<br>';
          }
          feildHtmlStr += nextChange + ' , ';
        }
      });

      feildHtmlStr = feildHtmlStr.slice(0, -3); //due to above logic , string ends with comman , which is to be removed
      toolTipString += feildHtmlStr + "</li>";

    });

    // TODO : for strategy changes we need to show 1st the changes for current-logged in user(if any)
    // after that we show changes done by other users
    inputObject.strategy.forEach((strategy) => {
      user = strategy.userName;
      entityChanged = strategy.entityName;
      feilds = strategy.feildsChanged;

      //testing
      // feilds += "," + feilds + "," + feilds + "," + feilds;
      toolTipString += "<li class='pt-2'><strong>" + user + "</strong>";
      toolTipString += " changed the following feilds : " + "<br>";
      toolTipString += "<strong>" + entityChanged + "</strong>" + " <br>";

      let feildsDisplayArr = feilds.split(',');
      let feildHtmlStr = '';

      feildsDisplayArr.forEach((nextChange, idx) => {
        let lastBreakIdx = feildHtmlStr.lastIndexOf('<br>');
        //add 1st feild-name
        if (idx === 0) {
          feildHtmlStr += nextChange + ' , ';
        }
        //oterwise , check length of substing after <br>
        else {
          lastBreakIdx = (lastBreakIdx === -1) ? 0 : lastBreakIdx + 3;
          let subStr = feildHtmlStr.substring(lastBreakIdx);
          let lengthAfterLastBreak = subStr.length + nextChange.length + 3
          if (subStr && lengthAfterLastBreak > CHARS_PER_LINE) {
            feildHtmlStr += '<br>';
          }
          feildHtmlStr += nextChange + ' , ';
        }
      });

      feildHtmlStr = feildHtmlStr.slice(0, -3); //due to above logic , string ends with comman , which is to be removed
      toolTipString += feildHtmlStr + "</li>";

    });


    toolTipString += "</ul></div></div>";
    return toolTipString;
  }





  /**
   * 
   * @param dateRange 
   * depending on date range , form the labels on x-axis
   */
  prepareXAxisLabels(dateRange) {
    let categories: string[] = [];
    // categories.push(null);
    // REVX-1056 Removing these as forcing padding is removing start dates from x-axis labels
    let dateDiff: number = (dateRange.endDateEpoch - dateRange.startDateEpoch) / 86400;
    let startDate: Date = dateRange.startDate;
    let endDate: Date = dateRange.endDate;

    let month: number = startDate.getMonth();
    let year: number = startDate.getFullYear();
    let date: number = startDate.getDate();
    let hours: number = startDate.getHours();

    //no skipping of points in below if-else
    if (dateDiff > 2) {

      for (let i = 0; i < dateDiff; i++) {
        let fDate: Date = new Date(year, month, date + i);
        let formattedDate: string = this.formatChartDate(fDate);
        categories.push(formattedDate);
      }
    } else {
      for (let dateIndex = 0; dateIndex < dateDiff; dateIndex++) {
        for (let i = 0; i < 24; i++) {
          let fDate: Date = new Date(year, month, date + dateIndex, hours, i * 60);
          // console.log("f Date ", fDate);
          let formattedTime: string = this.formatChartTime(fDate);
          categories.push(formattedTime);
        }
      }
    }


    // categories.push(null);
    return categories;

  }

  /**
   * 
   * @param chartObj 
   * @param chartIndex 
   * @param currencyCode 
   * create label on left/right side , label color etc
   */
  createYAxisDetails(chartObj, chartIndex: number, currencyCode: string) {
    const align = chartIndex === 1 ? 'left' : 'right';
    let numType = AppConstants.NUMBER_TYPE_NOTHING;
    let yAxisText = '';

    const chartMetrics = chartObj.metrics;
    const selectedMetric = chartIndex === 1 ? chartObj.selector1 : (chartObj.selector2) ? chartObj.selector2 : "margin";

    for (const i in chartMetrics) {
      if (chartMetrics[i].id === selectedMetric) {
        numType = chartMetrics[i].type;
        yAxisText = chartMetrics[i].title;
        break;
      }
    }

    const yAxisFormatter = this.YAxisLabelFormatter(numType, align, currencyCode);
    const oppositeYAxis = chartIndex === 2 ? true : false;

    const yAxisDetailsModel: any = {
      labels: yAxisFormatter,
      title: {
        text: yAxisText,
        style: { color: '#333333' }
      },
      opposite: oppositeYAxis,
      showLastLabel: true, //show topmost lable on y-axis
      visible: true, //hide/show this y-axis
    };

    return yAxisDetailsModel;
  }

  /**
   * 
   * @param apiResponse 
   * @param chartObj 
   * @param chartIndex 
   * plot data points to be placed in series[]
   */
  createChartSeries(apiResponse: ChartDashboardResponse, chartObj, chartIndex: number, dateRange: DateRange) {
    let chartSeriesDataList: chartSeriesData[] = [];
    let chartMetrics = chartObj.metrics;
    let tooltipMetrics = this.entitiesService.getChartTooltipMetrics();

    let yAxisText = "";
    let selectedMetric = chartIndex == 1 ? chartObj.selector1 : (chartObj.selector2) ? chartObj.selector2 : "margin";
    for (let i in chartMetrics) {
      if (chartMetrics[i].id == selectedMetric) {
        yAxisText = chartMetrics[i].title;
        break;
      }
    }

    // let dateDiff: number = (dateRange.endDateEpoch - dateRange.startDateEpoch) / 86400;
    let chartSeriesData: any;

    //if empty map : no data
    if (!this.dataPointMap || !this.dataPointMap.size) {
      return this.getSeriesObject(chartObj, chartIndex, yAxisText);
    }

    // console.log(Array.from(this.dataPointMap.entries()))
    //NEW LOGIC : ITERATE OVER MAP
    for (let entry of Array.from(this.dataPointMap.entries())) {

      const showDataOnUi = (entry[1] !== HIDE_DATA) ? true : false;
      const IDX = (showDataOnUi) ? apiResponse.data.findIndex(x => x.id === entry[0]) : (-1);  //search index in apiResp if data is there , else assign (-1)
      const yAxisValue = (!showDataOnUi) ? null : (entry[1] === SHOW_DATA) ? apiResponse.data[IDX][selectedMetric] : 0;

      let isDataPresent: boolean;
      if (showDataOnUi && entry[1] === SHOW_DATA) {
        isDataPresent = true;
      } else if (showDataOnUi && entry[1] === ZERO_DATA) {
        isDataPresent = false
      }
      let dateTime;
      if (isDataPresent) {
        const dateDiff: number = (dateRange.endDateEpoch - dateRange.startDateEpoch) / 86400;
        const day = apiResponse.data[IDX]['day'];
        const hour = apiResponse.data[IDX]['hour'];
        dateTime = dateDiff > 2 ? this.commonService.epochToDateFormatter(day) : this.commonService.epochToTimeFormatter(hour);
      }
      //Below code it only for creating tooltips of chart
      let toolTipHTMLTemplate = "";
      if (chartObj.tooltipSelector == "mData") {
        toolTipHTMLTemplate += "<div id='metrics-tooltip' class = 'uiChartTooltip'><table>";      
        toolTipHTMLTemplate += 
          "<thead><tr style='font-size:10px;border-bottom:1px dashed #333333'>" +
          "<th colspan='2'><strong>" + dateTime + "</strong></th></tr></thead>";
        toolTipHTMLTemplate += "<tbody class='uiChartTooltipBody'>";
        for (const index in tooltipMetrics) {
          let title = tooltipMetrics[index].title;
          let val_to_be_formatted_1 = (isDataPresent) ? apiResponse.data[IDX][tooltipMetrics[index].id] : 0;
          let curr_id = (isDataPresent) ? apiResponse.data[IDX].currencyId : null;
          let value = this.commonService.nrFormatWithComma(val_to_be_formatted_1, tooltipMetrics[index].type);

          value = tooltipMetrics[index].id == selectedMetric ? "<strong>" + value + "</strong>" : value;
          title = tooltipMetrics[index].id == selectedMetric ? "<strong>" + title + "</strong>" : title;

          toolTipHTMLTemplate +=
            "<tr style='font-size:10px;border-bottom:1px dashed #333333'><td>" + title + ":</td>" +
            "<td>" + value + "<td><tr>";
        }
        toolTipHTMLTemplate += "</tbody></table></div>";
      } else {
        let funnelMetrics = this.entitiesService.getFunnelMetrics();
        toolTipHTMLTemplate += "<div id='chart-funnel-tooltip'>";
        toolTipHTMLTemplate += "<div style='text-align:center'><strong>" + dateTime + "</strong></div>";
        for (let index in funnelMetrics) {
          let title = funnelMetrics[index].title;
          let val_to_be_formatted_2 = (isDataPresent) ? apiResponse.data[IDX][funnelMetrics[index].id] : 0;

          let value = this.commonService.nrFormat(val_to_be_formatted_2, AppConstants.NUMBER_TYPE_NOTHING);

          // for UU funnel-data slab
          if (funnelMetrics[index].id === 'eligibleBids') {

            let requiredUUInfo: string = '';

            if (apiResponse && apiResponse.showUU == true) {
              requiredUUInfo = "<div class='c-left'>" + value + ": </div>";
            } else {
              requiredUUInfo = "<div class='c-left ' title='spinner'>" + "<i class='fa fa-spinner fa-spin'></i>" + ": </div>";
            }

            toolTipHTMLTemplate +=
              "<div class='tooltip-row" + "-" + index + "'>" +
              "<div class='left-triangle'></div>" +
              "<div class='center-part'>" +
              "<div class='cp-child'>" +
              requiredUUInfo +
              "<div class='c-right'>" + title + "</div>" +
              "<div class='clearfix'></div>";
            if (funnelMetrics[index].child != null) {
              let cTitle = funnelMetrics[index].child.title;
              let val_to_be_formatted_3 = (isDataPresent) ? apiResponse.data[IDX][funnelMetrics[index].child.id] : 0;
              let cValue = this.commonService.nrFormat(val_to_be_formatted_3, AppConstants.NUMBER_TYPE_NOTHING);

              let requiredUUChildInfo: string = '';
              if (apiResponse && apiResponse.showUU == true) {
                requiredUUChildInfo = "<div class='cc-left'>" + cValue + ": </div>";
              } else {
                requiredUUChildInfo = "<div class='cc-left'>" + "<i class='fa fa-spinner fa-spin'></i>" + ": </div>";
              }

              toolTipHTMLTemplate +=
                requiredUUChildInfo +
                "<div class='cc-right'>" + cTitle + "</div>" +
                "<div class='clearfix'></div>";
            }
          }

          // for other funnel-data slab
          else {

            toolTipHTMLTemplate +=
              "<div class='tooltip-row" + "-" + index + "'>" +
              "<div class='left-triangle'></div>" +
              "<div class='center-part'>" +
              "<div class='cp-child'>" +
              "<div class='c-left'>" + value + ": </div>" +
              // "<div class='c-left'>" + "LOL" + ": </div>" +

              "<div class='c-right'>" + title + "</div>" +
              "<div class='clearfix'></div>";
            if (funnelMetrics[index].child != null) {
              let cTitle = funnelMetrics[index].child.title;
              let val_to_be_formatted_3 = (isDataPresent) ? apiResponse.data[IDX][funnelMetrics[index].child.id] : 0;
              let cValue = this.commonService.nrFormat(val_to_be_formatted_3, AppConstants.NUMBER_TYPE_NOTHING);
              toolTipHTMLTemplate += "<div class='cc-left'>" + cValue + ": </div>" +
                "<div class='cc-right'>" + cTitle + "</div>" +
                "<div class='clearfix'></div>";
            }

          }

          toolTipHTMLTemplate += "</div></div>" +
            "<div class='right-triangle'></div>" +
            "<div class='clearfix'></div>" +
            "</div>";
        }
        toolTipHTMLTemplate += "</div>";
      }

      chartSeriesData = {
        y: yAxisValue,
        dataPointTooltip: toolTipHTMLTemplate
      };
      chartSeriesDataList.push(chartSeriesData);

    }

    let series: any;
    series = {
      name: yAxisText,
      type: "line",
      yAxis: 1,
      data: chartSeriesDataList,
      stickyTracking: false, //this was the reason for vanishing flag tooltips
      visible: true,
      showInLegend: true,
    }

    if (chartIndex == 1) {
      series = {
        name: yAxisText,
        type: "line",
        data: chartSeriesDataList,
        color: "var(--primary-color)",
        stickyTracking: false,
        visible: true,
        showInLegend: true,

      }
    }

    return series;
  }



  // /**
  //  * 
  //  * @param compareWith 
  //  * either returns "you" or the actual user-name
  //  */
  // getUserName(compareWith: string): string {
  //   if (!compareWith || !compareWith.length) {
  //     return 'NA';
  //   }
  //   return (localStorage.getItem(AppConstants.CACHED_USERNAME) === compareWith) ? 'You' : compareWith;
  // }

  getCurrencyCodeForReponse(apiResponse) {
    if (apiResponse && apiResponse.widgetData) {
      return apiResponse.widgetData.currencyId;
    }
    return null;
  }


  /**
   * 
   * @param chartObj 
   * @param chartIndex 
   * @param yAxisText
   * get basic object used for y-axis series 
   */
  getSeriesObject(chartObj, chartIndex, yAxisText) {
    let series: any;
    if (!chartObj.selector2) {
      series = {
        name: yAxisText,
        type: "line",
        data: [],
        color: "var(--primary-color)",
      }
    } else {
      if (chartIndex == 1) {
        series = {
          name: yAxisText,
          type: "line",
          data: [],
          color: "var(--primary-color)"
        }
      } else {
        series = {
          name: yAxisText,
          type: "line",
          yAxis: 1,
          data: []
        }
      }
    }
    return series;
  }

  /**
   * 
   * @param date 
   * format chart date on x-ais
   */
  formatChartDate(date) {
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
   * @param date 
   * format chart date-time on x-ais
   */
  formatChartTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let timeStr = hours + ':' + minutes + ' ' + ampm;
    //showing date instead of 12am in the chart
    if (ampm == "am" && hours == 12) {
      timeStr = this.formatChartDate(date);
    }
    return timeStr;
  }

  /**
   * 
   * @param numType 
   * @param Y_LABEL_ALIGNMENT 
   * @param currencyCode 
   * gives the label on y-axis
   * 
   */
  YAxisLabelFormatter(numType, Y_LABEL_ALIGNMENT, currencyCode) {
    //inline number formatter is added : method call won't work here
    return {
      style: { color: "#333333" },
      align: Y_LABEL_ALIGNMENT,
      x: 2,
      y: -2,
      formatter: function (): string {
        // console.log('currency code ', currencyCode);
        const currency = (!currencyCode) ? localStorage.getItem(AppConstants.CACHED_CURRENCY) : AppConstants.CURRENCY_MAP[currencyCode];
        let number = this.value;
        let type = numType;
        let numStr: string;
        if (number != undefined && !isNaN(number)) {
          let abs = Math.abs(number);
          if (abs >= Math.pow(10, 12)) {
            numStr = (number / Math.pow(10, 12)).toFixed(2) + "T";
          }
          else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
            numStr = (number / Math.pow(10, 9)).toFixed(2) + "B";
          }
          else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
            numStr = (number / Math.pow(10, 6)).toFixed(2) + "M";
          }
          else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
            numStr = (number / Math.pow(10, 3)).toFixed(2) + "K";
          } else {
            if (type === AppConstants.NUMBER_TYPE_CURRENCY
              || type === AppConstants.NUMBER_TYPE_PERCENTAGE) {
              numStr = number.toFixed(2);
            } else {
              numStr = number.toFixed(0);
            }
          }
        }
        //console.log( number);
        if (type != undefined) {
          switch (type) {
            case AppConstants.NUMBER_TYPE_CURRENCY:
              numStr = currency + " " + numStr;
              break;
            case AppConstants.NUMBER_TYPE_PERCENTAGE:
              numStr += "%";
              break;
          }
        }

        return numStr;
      }
    }
  }



  /**
   * 
   * @param event 
   * takes in the cordinte and epoch of audit marker
   * and opens up a popup for viewing full audit details
   */
  clickedMarker(event: any) {
    event.stopPropagation();
    let _entityType = this.entityType;
    let _entityId = this.entityId;
    let groupBy = (this.lastChartApiRequest.groupBy) ? this.lastChartApiRequest.groupBy : "day";
    let _startEpoch = event.point.options.epoch;
    let _endEpoch = (groupBy === "day") ? _startEpoch + 86400 : _startEpoch + 36000;
    let _dateTitle = moment.utc(_startEpoch * 1000).format('LL');

    let dialogRef = this.dialog.open(AuditDetailsModalComponent, {
      width: '85%',
      maxHeight: '70%',
      height: 'auto',

      data: {
        entityType: _entityType,
        entityId: _entityId,
        startEpoch: _startEpoch,
        endEpoch: _endEpoch,
        dateTitle: _dateTitle
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

}
