import { Injectable } from '@angular/core';
import { ConversionConstants } from '@app/entity/report/_constants/ConversionConstants';
import { ReportingRequest, DurationModel, FilterModel, SortModel, ReportingControllerService } from '@revxui/api-client-ts';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { CheckBoxesObj, ModalObject, GridData, CommonReportingService, ConversionUiMetrics } from '@app/entity/report/_services/common-reporting.service';


@Injectable({
  providedIn: 'root'
})
export class ConvUiService {

  private result: any;
  private masterRequest = {} as ReportingRequest;
  convTypeObjectArr: CheckBoxesObj[] = [];
  advertiser: ModalObject;
  campaign: ModalObject;
  strategy: ModalObject;
  metricList: ConversionUiMetrics[] = [];


  constructor(
    private commonReportingService: CommonReportingService,
    private router: Router,
    private reportingService: ReportingControllerService,
  ) {
    this.setDefaultRequest();
  }

  /**
   * setup the request initially
   */
  setDefaultRequest() {
    //set duration
    this.masterRequest.duration = {} as DurationModel;
    const yesterday = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1);
    this.masterRequest.duration.start_timestamp = this.masterRequest.duration.end_timestamp = this.commonReportingService.getEpoch(yesterday);

    //set initial columnss
    this.masterRequest.columns = this.getPreselectedMetrics()
    this.masterRequest.filters = [];
    this.initConvTypeObject();
    this.initMetrics();
    this.initModalEntities();
  }


  /**
   * these are metrics displayed in metrics selction of conv-reports
   */
  initMetrics() {
    this.metricList = [
      { value: 'advertiser', label: '', isSelected: true, isDisplayed: false },
      { value: 'campaign', label: '', isSelected: true, isDisplayed: false },
      { value: 'strategy', label: '', isSelected: true, isDisplayed: false },
      { value: 'conversion_type', label: 'Type', isSelected: true, isDisplayed: true },
      { value: 'conversion_time', label: 'Timestamp', isSelected: true, isDisplayed: true },
      { value: 'user_ip', label: 'IP', isSelected: true, isDisplayed: true },
      { value: 'user_id', label: 'User ID', isSelected: true, isDisplayed: true },
      { value: 'transaction_id', label: 'Transaction ID', isSelected: true, isDisplayed: true },
      { value: 'transaction_currency', label: 'Transaction Currency', isSelected: true, isDisplayed: true },
      { value: 'transaction_amount', label: 'Transaction Amount', isSelected: true, isDisplayed: true },
      { value: 'transaction_info', label: 'Additional Info', isSelected: true, isDisplayed: true },
      { value: 'time_since_click_minutes', label: 'Time since Click', isSelected: true, isDisplayed: true },
      { value: 'time_since_impression_minutes', label: '', isSelected: true, isDisplayed: false },
    ];
  }


  /**
   * the metrics from above methods which are preseleted (all are pre-selected)
   */
  getPreselectedMetrics(): string[] {
    const allMetrics: any[] = this.getUiMetrics();
    let preselected: string[] = [];
    allMetrics.forEach(x => {
      preselected.push(x.value);
    })
    return preselected;
  }


  /**
   * getter for metrics to be shown at ui
   */
  getUiMetrics() {
    return this.metricList;
  }


  /**
   * setter for metrics to be shown at ui
   */
  setUiMetrics(arr: ConversionUiMetrics[]) {
    this.metricList = arr;
  }


  /**
   * 
   * @param inputArr 
   * update request 
   */
  setRequestColumns() {
    let requestColumns = [];
    this.metricList.forEach((metric) => {
      if (!metric.isDisplayed || (metric.isDisplayed && metric.isSelected)) {
        requestColumns.push(metric.value);
      }
    });

    this.masterRequest.columns = requestColumns;
  }


  /**
   * 
   * @param date 
   * set duration in request
   */
  setDuration(date: Date[]) {
    this.commonReportingService.setDuration(date, this.masterRequest);

  }

  /**
   * getter of date form api-request object
   */
  getDateRange(): Date[] {
    return this.commonReportingService.getDateRange(this.masterRequest);
  }


  /**
   * check boxes for conversion type
   */
  initConvTypeObject() {
    this.convTypeObjectArr = [
      {
        label: 'View Conversion',
        value: ConversionConstants.CONV_TYPE.VIEW,
        select: true
      },
      {
        label: 'Click Conversion',
        value: ConversionConstants.CONV_TYPE.CLICK,
        select: true
      },
    ]
  }


  getConvTypeObject(): CheckBoxesObj[] {
    return this.convTypeObjectArr;
  }

  setConvTypeObject(arr: CheckBoxesObj[]) {
    this.convTypeObjectArr = arr;

    let selected: any[] = this.convTypeObjectArr.filter(x => x.select);
    let localFilter = {} as FilterModel;


    if (selected.length === this.convTypeObjectArr.length) {
      //dont push in filters if all selected
      this.commonReportingService.removeFromMasterFilterArray(ConversionConstants.FILTER_COLUMN.CONVERSION_TYPE, this.masterRequest);
    } else if (selected.length === 1) {
      localFilter.column = ConversionConstants.FILTER_COLUMN.CONVERSION_TYPE;
      localFilter.operator = 'eq';
      localFilter.value = selected[0].value;
      this.commonReportingService.appendToMasterFilterArray(localFilter, this.masterRequest);
    }
  }



  //for modal entities
  setModalEntities(entity, obj: ModalObject) {
    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER:
        this.advertiser = obj;
        break;

      case AppConstants.ENTITY.CAMPAIGN:
        this.campaign = obj;
        break;

      case AppConstants.ENTITY.STRATEGY:
        this.strategy = obj;
        break;
    }
  }


  getModalEntities(entity) {
    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER:
        return this.advertiser;

      case AppConstants.ENTITY.CAMPAIGN:
        return this.campaign

      case AppConstants.ENTITY.STRATEGY:
        return this.strategy
    }
  }


  /**
   * initialize the entities which can be selected form popup modal
   */
  initModalEntities() {
    this.advertiser = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.campaign = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.strategy = { map: new Map<number, boolean>(), set: new Set<GridData>() };
  }


  /**
   * 
   * @param advObj 
   * @param cmpObj 
   * @param strObj 
   * setup the filters of advertiser , campaign , strategy
   */
  setAdvCmpStrFilter(advObj: ModalObject, cmpObj: ModalObject, strObj: ModalObject) {
    let l1_arr = Array.from(advObj.set);
    let l2_arr = Array.from(cmpObj.set);
    let l3_arr = Array.from(strObj.set);

    this.setModalEntities(AppConstants.ENTITY.ADVERTISER, advObj);
    this.setModalEntities(AppConstants.ENTITY.CAMPAIGN, cmpObj);
    this.setModalEntities(AppConstants.ENTITY.STRATEGY, strObj);

    let l1_selected_arr: GridData[] = l1_arr.filter(x => !x.isNotSelected);
    let l1_rejected_arr: GridData[] = l1_arr.filter(x => x.isNotSelected);

    let l2_selected_arr: GridData[] = l2_arr.filter(x => !x.isNotSelected);
    let l2_rejected_arr: GridData[] = l2_arr.filter(x => x.isNotSelected);

    let l3_selected_arr: GridData[] = l3_arr.filter(x => !x.isNotSelected);
    let l3_rejected_arr: GridData[] = l3_arr.filter(x => x.isNotSelected);

    this.commonReportingService.modifyFilterArray(AdvancedConstants.FILTER_COLUMN.ADVERTISER, l1_selected_arr, l1_rejected_arr, advObj.set, this.masterRequest);
    this.commonReportingService.modifyFilterArray(AdvancedConstants.FILTER_COLUMN.CAMPAIGN, l2_selected_arr, l2_rejected_arr, cmpObj.set, this.masterRequest);
    this.commonReportingService.modifyFilterArray(AdvancedConstants.FILTER_COLUMN.STRATEGY, l3_selected_arr, l3_rejected_arr, strObj.set, this.masterRequest);
  }


  show(entity: string): Observable<any> {
    this.setRequestColumns();
    this.masterRequest.interval = ReportingRequest.IntervalEnum.None;//this never changes , and not in ui
    this.masterRequest.currency_of = this.masterRequest.currency_of;

    return this.reportingService.customReportUsingPOST(entity, this.masterRequest);
  }

  setResult(results: any[]) {
    this.result = results;
  }

  getResult() {
    return this.result;
  }

  clearResult() {
    this.result = null;
  }


  /**
   * check if the api-request and ui data is to be resetted 
   * on navigation on some other page or not
   */
  resetOnLeave() {
    const urlParts = this.router.url.split("/");

    const isConvForm = (urlParts.includes('report') && urlParts.includes('conversion')) ? true : false;
    const isConvResult = (isConvForm && urlParts.includes('result')) ? true : false;

    if (!isConvForm && !isConvResult) {
      this.setDefaultRequest();
      this.masterRequest.group_by = [];
    }
  }





  getRequestObject() {
    return this.masterRequest;
  }

  export(entity: string) {
    // this.masterRequest.currency_of = this.masterRequest.currency_of;
    return this.reportingService.customReportCSVUsingPOST(entity, this.masterRequest);
  }





  getPageSize() {
    return this.masterRequest.page_size;
  }

  setPageSize(pageSize: number) {
    this.masterRequest.page_size = pageSize;
  }

  getPageNumber() {
    return this.masterRequest.page_number;
  }

  setPageNumber(pageNumber: number) {
    this.masterRequest.page_number = pageNumber;
  }

  setSortBy(arr: SortModel[]) {
    this.masterRequest.sort_by = arr;
  }

  getSortBy() {
    return this.masterRequest.sort_by;
  }

  getInterval(): ReportingRequest.IntervalEnum {
    return ReportingRequest.IntervalEnum.None;
  }





}
