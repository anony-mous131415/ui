import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EntitiesConstants } from '@app/shared/_constants/EntitiesConstants';
import { DateRange } from '@app/shared/_models/date.range.model';
import { DateRangePickerService } from '@app/shared/_services/date-range-picker.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { WidgetsService } from '@app/shared/_services/widgets.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { ChartDashboardResponse, DashboardData, DashboardFilters, DashboardRequest, Duration } from '@revxui/api-client-ts';
import * as Highcharts2 from 'highcharts/highstock';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/shared/_services/chart.service';
// import { UIConfig } from 'assets/config/config';
import { UserInfo } from '@revxui/auth-client-ts';


const KEY_REFRESH = 'refresh';
const KEY_ONCHANGE = 'onChanges';
const KEY_ONINIT = 'onInit';
const KEY_DATE_CHANGE = 'date';



@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges, OnInit {
  @Input() column: string;
  @Input() entityId: string;
  @Input() entity: string;
  @Input() licensee: string;
  // FOR UI only
  showProgressBar = false;
  disableChart = false;
  disableWidget = false;
  compareChart = false;
  appConst = AppConstants;
  // uiConfig = UIConfig;

  dateRange = {} as DateRange;

  // chart data api resp
  apiResponse = {} as ChartDashboardResponse;
  // private widgetData: DashboardData;
  formattedWidgetData: any;

  chartObj = {
    metrics: this.entitiesService.getChartMetrics(),
    selector1: 'revenue',
    selector2: '',
    tooltipSelector: 'mData',
    tooltipOptions: this.getTooptipOptions()
  };

  dateRangeSubscription: Subscription;
  // auditMap: Map<number, number>;

  // audit data api resp
  auditResponse: any;

  // passed options to draw chat
  highChartOptions: any;
  lswitcherSubscription: Subscription;


  uuRespReceived: boolean = true;



  constructor(
    public dialog: MatDialog,
    private drpService: DateRangePickerService,
    private widgetService: WidgetsService,
    private entitiesService: EntitiesService,
    private commonService: CommonService,
    private authUIService: AuthenticationService,
    private alertService: AlertService,
    private chartService: ChartService,
  ) { }

  /**
   * This detect the changes of the input parameters
   * If parameter changes in the direcive, the below will be called
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {

    if (this.dateRange && !this.dateRange.startDate) {
      this.dateRange = this.drpService.getCachedDateRange();
    }
    if (changes.entityId && changes.entityId.currentValue) {
      this.entityId = changes.entityId.currentValue;
    }

    if (changes.column && changes.column.currentValue) {
      this.column = changes.column.currentValue;
    }

    this.fetchAPIData(false, KEY_ONCHANGE);
    // this.fetchAPIDataWithUUData();


  }

  ngOnInit() {
    this.subscribeDateRange();
    this.lswitcherSubscription = this.authUIService.licenseeSelectionWatcher().subscribe((item: UserInfo) => {
      this.entity = 'licensee'; //audit markers were coming on HOME without this
      this.fetchAPIData(false, KEY_ONINIT);

    });
  }

  subscribeDateRange() {
    this.dateRangeSubscription = this.drpService.dateRangeWatcher().subscribe(dateRange => {
      if (dateRange && (this.commonService.getRouteURL() == "/" + AppConstants.URL_HOME || this.entityId)) {
        this.dateRange = dateRange;
        this.fetchAPIData(false, KEY_DATE_CHANGE);
        // this.fetchAPIDataWithUUData();
      }
    });
  }

  ngOnDestroy() {
    this.dateRangeSubscription.unsubscribe();
    if (this.lswitcherSubscription != null) {
      this.lswitcherSubscription.unsubscribe();
    }
  }

  downloadCSV() {
    let dashboardReq = {} as DashboardRequest;
    dashboardReq = this.getDashboardReq();

    this.alertService.warning(EntitiesConstants.EXPORTING_DATA, false, true);
    this.chartService.getChartDataCSV(dashboardReq).subscribe(response => {
      // console.log("chart csv resposne:: -- ", response);
      if (response && response.respObject) {
        let fileUrl = response.respObject.fileDownloadUrl;
        let link = document.createElement('a');
        link.href = fileUrl;
        link.click();
      }
      this.alertService.clear(true);
    }, catchError => {
      this.alertService.clear(true);
    });
  }

  reload() {
    // console.log("refresh called");
    this.alertService.warning(EntitiesConstants.REFRESHING_DATA, false, true);
    this.fetchAPIData(true, KEY_REFRESH);
    // this.fetchAPIDataWithUUData(true);
  }

  compareOtherMetrics() {
    this.compareChart = true;

  }

  removeCompareChart() {
    this.compareChart = false;
    this.chartObj.selector2 = "";
    this.drawChart();
  }

  private getDashboardReq() {
    let dashboardReq = {} as DashboardRequest;
    let duration = {} as Duration;
    duration.startTimeStamp = this.dateRange.startDateEpoch;
    duration.endTimeStamp = this.dateRange.endDateEpoch;
    dashboardReq.duration = duration;

    let dateDiff: number = (this.dateRange.endDateEpoch - this.dateRange.startDateEpoch) / 86400;
    // console.log("duration ", dateDiff);
    if (dateDiff < 3) {
      dashboardReq.groupBy = "hour";
    } else {
      dashboardReq.groupBy = "day";
    }

    if (this.column && this.entityId) {
      let dashboardFilters: DashboardFilters[] = [];
      let dashboardFilter = {} as DashboardFilters;
      dashboardFilter.column = this.column;
      dashboardFilter.value = this.entityId;
      dashboardFilters.push(dashboardFilter);
      dashboardReq.filters = dashboardFilters;
    }
    return dashboardReq;
  }

  /**
   * Method to call data from API and populate the chart and widgets
   * @param refresh
   */
  private fetchAPIData(refresh: boolean = false, key?: string) {
    let dashboardReq = {} as DashboardRequest;
    dashboardReq = this.getDashboardReq();
    this.showProgressBar = true;
    this.chartService.getChartData(dashboardReq, false, refresh)
      .subscribe(response => {
        this.showProgressBar = false;
        this.alertService.clear(true);
        this.auditResponse = null;
        this.apiResponse = response.respObject;
        this.drawChart();
        this.drawWidgets(response.respObject.widgetData);

        if (response.respObject.widgetData == null) {
          this.disableWidget = true;
        } else {
          this.disableWidget = false;
        }

        //sequential calls 
        let callerKeyForSeqApi = [KEY_REFRESH, KEY_ONCHANGE, KEY_ONINIT, KEY_DATE_CHANGE];

        // api-call for audit data
        const isROUser: boolean = (localStorage.getItem(AppConstants.CACHED_USER_ROLE) === AppConstants.USER_ROLE.READ_ONLY) ? true : false;
        const currEntity = this.entity.toUpperCase();
        const isAUditRequired: boolean = (!isROUser && (currEntity === AppConstants.ENTITY.CAMPAIGN || currEntity === AppConstants.ENTITY.STRATEGY));

        if (isAUditRequired) {
          const startEpoch = dashboardReq.duration.startTimeStamp;
          const endEpoch = dashboardReq.duration.endTimeStamp;
          this.chartService.getAuditTooltipData(startEpoch, endEpoch, this.entity.toUpperCase(), +this.entityId).subscribe(auditData => {
            if (auditData.respObject && auditData.respObject.length > 0) {
              this.auditResponse = auditData.respObject;
              this.drawChart();
            }

            //REVX-578
            //we need to fetch uu data , after getting audit data
            if (callerKeyForSeqApi.includes(key)) {
              this.fetchAPIDataWithUUData(refresh);
            }
          }, (error) => {
            this.showProgressBar = false;
            this.alertService.clear(true);
          });
        }

        //if we do not need audit data , still we need to fetch uu data
        else {
          if (callerKeyForSeqApi.includes(key)) {
            //REVX-578
            this.fetchAPIDataWithUUData(refresh);
          }
        }


      }, (error) => {
        this.showProgressBar = false;
        this.alertService.clear(true);
      });
  }


  fetchAPIDataWithUUData(refresh: boolean = false) {
    let dashboardReq = {} as DashboardRequest;
    dashboardReq = this.getDashboardReq();
    this.uuRespReceived = false;
    this.chartService.getChartData(dashboardReq, true, refresh)
      .subscribe(response => {
        this.uuRespReceived = true;
        this.alertService.clear(true);
        // this.auditResponse = null;
        this.apiResponse = response.respObject;
        this.drawChart();
        this.drawWidgets(response.respObject.widgetData);

        if (response.respObject.widgetData == null) {
          this.disableWidget = true;
        } else {
          this.disableWidget = false;
        }

      }, (error) => {
        this.uuRespReceived = false;
        this.alertService.clear(true);
      });
  }





  /**
   * 1 retrieveChartData
   * 2 covertDataToHighChartFormat
   * 3 populateDataToChart
   */
  drawChart() {
    const auditData = (this.auditResponse === null) ? null : this.auditResponse;
    this.highChartOptions = this.chartService.convertApiDataToHightChartData(this.apiResponse,
      this.dateRange, this.entity, this.chartObj, auditData);
    Highcharts2.stockChart('chart-container', this.highChartOptions);
  }



  drawWidgets(widgetData: DashboardData) {
    this.formattedWidgetData = this.widgetService.convertApiDataToWidgetData(widgetData);
  }

  private getTooptipOptions() {
    // const showFunnelData = this.uiConfig.showFunnelDataOption;
    const showFunnelData = true;
    const options = [{ id: 'mData', title: 'Metrics Data' }];
    if (showFunnelData) {
      options.push({ id: 'fData', title: 'Funnel Data' });
    }

    return options;
  }

  nrFormatTooltip(value: number, type: string) {
    return this.commonService.nrFormatTooltip(value,type);
  }



}

