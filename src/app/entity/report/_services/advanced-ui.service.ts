import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { CheckBoxesObj, CommonReportingService, GridData, ListApiParams, ModalObject } from '@app/entity/report/_services/common-reporting.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import {
  DashboardControllerService,
  DurationModel,
  FilterModel, ReportingControllerService,
  ReportingRequest,
  SearchRequest,
  SortModel
} from '@revxui/api-client-ts';
import { cloneDeep } from "lodash";
import { Observable, Subject } from 'rxjs';
export const GROUP_BY_LIMIT = 7;


@Injectable({
  providedIn: 'root'
})
export class AdvancedUiService {

  private result: any;

  public allChildCb = new Subject<boolean>();
  public masterCb = new Subject<boolean>();

  private masterRequest = {} as ReportingRequest;
  positionObjectArr: CheckBoxesObj[] = [];
  crMediaObjectArr: CheckBoxesObj[] = [];
  channelObjectArr: CheckBoxesObj[] = [];
  pricingObjectArr: CheckBoxesObj[] = [];

  country: ModalObject;
  state: ModalObject;
  city: ModalObject;
  aggregator: ModalObject;
  advertiser: ModalObject;
  campaign: ModalObject;
  strategy: ModalObject;
  creative: ModalObject;
  creative_size: ModalObject;


  constructor(
    private dashboardService: DashboardControllerService,
    private reportingService: ReportingControllerService,
    private commonReportingService: CommonReportingService,
    private router: Router,
    private entityService: EntitiesService
  ) {
    this.setDefaultRequest();
  }


  getRequestObject() {
    return this.masterRequest;
  }

  /**
   * returns the metrics which are to be pre-selected
   */
  getPreselectedMetrics() {
    let allMetrics: any[] = this.getUIMetrics();
    const preselected: string[] = [];
    for (const i in allMetrics) {
      if (allMetrics[i].preselected === true) {
        preselected.push(allMetrics[i].value);
      }
    }
    return preselected;
  }

  /**
   * metrics selection of advanced reports
   */
  getUIMetrics() {
    const metricList: any[] = [
      { value: 'impressions', label: 'Impressions', tooltip: AdvancedConstants.DEFINATION.IMPRESSION, preselected: true, showROuser: true },
      { value: 'clicks', label: 'Clicks', tooltip: AdvancedConstants.DEFINATION.CLICK, preselected: true, showROuser: true },
      {
        value: 'invalid_clicks', label: 'Invalid Clicks', tooltip: AdvancedConstants.DEFINATION.INVALID_CLICK, preselected: true,
        showROuser: false
      },
      { value: 'total_install', label: 'Installs', tooltip: AdvancedConstants.DEFINATION.INSTALL, preselected: true, showROuser: true },
      {
        value: 'imp_installs', label: 'View Installs', tooltip: AdvancedConstants.DEFINATION.VIEW_INSTALL, preselected: true,
        showROuser: false
      },
      {
        value: 'click_installs', label: 'Click Installs', tooltip: AdvancedConstants.DEFINATION.CLICK_INSTALL, preselected: true,
        showROuser: false
      },
      { value: 'conversions', label: 'Conversions', tooltip: AdvancedConstants.DEFINATION.CONVERSION, preselected: true, showROuser: true },

      { value: 'conversions_view', label: 'View Conversions', tooltip: AdvancedConstants.DEFINATION.VIEW_CONV, preselected: true, showROuser: true },
      { value: 'conversions_click', label: 'Click Conversions', tooltip: AdvancedConstants.DEFINATION.CLICK_CONV, preselected: true, showROuser: true },
      { value: 'revenue', label: 'Adv Spend', tooltip: AdvancedConstants.DEFINATION.ADV_SPEND, preselected: true, showROuser: true },
      {
        value: 'spend', label: 'Media Spend', tooltip: AdvancedConstants.DEFINATION.MEDIA_SPEND, preselected: true,
        showROuser: false
      },
      {
        value: 'margin', label: 'Margin', tooltip: AdvancedConstants.DEFINATION.MARGIN, preselected: true,
        showROuser: false
      },
      { value: 'ctr', label: 'CTR', tooltip: AdvancedConstants.DEFINATION.CTR, preselected: true, showROuser: true },
      { value: 'ctc', label: 'CTC', tooltip: AdvancedConstants.DEFINATION.CTC, preselected: true, showROuser: true },

      {
        value: 'cpi', label: 'CPI', tooltip: AdvancedConstants.DEFINATION.CPI, preselected: true,
        showROuser: false
      },
      { value: 'iti', label: 'ITI', tooltip: AdvancedConstants.DEFINATION.ITI, preselected: true, showROuser: true },
      { value: 'conv_rate', label: 'CR', tooltip: AdvancedConstants.DEFINATION.CR, preselected: false, showROuser: true },
      { value: 'cvr', label: 'CVR', tooltip: AdvancedConstants.DEFINATION.CVR, preselected: false, showROuser: true },
      { value: 'click_txn_amount', label: 'Click Adv Revenue', tooltip: AdvancedConstants.DEFINATION.CLICK_ADV_REV, preselected: false, showROuser: true },
      { value: 'view_txn_amount', label: 'View Adv Revenue', tooltip: AdvancedConstants.DEFINATION.VIEW_ADV_REV, preselected: false, showROuser: true },
      { value: 'roi', label: 'ROI', tooltip: AdvancedConstants.DEFINATION.ROI, preselected: false, showROuser: true },

      //REVX-568 : hiding bid price from ui
      // { value: 'bid_price', label: 'Bid Price', tooltip: AdvancedConstants.DEFINATION.BID_PRICE, preselected: false, showROuser: true },
      {
        value: 'imp_per_conv', label: 'Imp per Conv', tooltip: AdvancedConstants.DEFINATION.IMP_PER_CONV, preselected: false,
        showROuser: false
      },
      { value: 'publisher_ecpm', label: 'Publisher eCPM', tooltip: AdvancedConstants.DEFINATION.PUB_ECPM, preselected: false, showROuser: false },
      { value: 'publisher_ecpc', label: 'eCPC', tooltip: AdvancedConstants.DEFINATION.ECPC, preselected: false, showROuser: false },
      { value: 'publisher_ecpa', label: 'eCPA', tooltip: AdvancedConstants.DEFINATION.ECPA, preselected: false, showROuser: false },
      {
        value: 'txn_amount', label: 'Adv Revenue', tooltip: AdvancedConstants.DEFINATION.ADV_REV, preselected: false,
        showROuser: false
      },
      { value: 'advertiser_ecpm', label: 'Advertiser eCPM', tooltip: AdvancedConstants.DEFINATION.ADV_ECPM, preselected: false, showROuser: true }
    ];

    this.entityService.remomveROuserMetrics(metricList);
    return metricList;
  }

  /**
   * 
   * @param entity 
   * on popup modal , the metics to be displayed based on entity
   */
  getMetricsForList(entity: any) {
    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER:
      case AppConstants.ENTITY.CREATIVE:
        return this.getAdvertiserMetrics();

      case AdvancedConstants.ENTITY.GROUP_BY:
      case AppConstants.ENTITY.AGGREGATOR:
        return this.getGroupByMetrics();

      case AdvancedConstants.ENTITY.CREATIVE_SIZE:
        return this.getCreativeSizeMetrics();

      case AdvancedConstants.ENTITY.COUNTRY:
        return this.getCountryMetrics();
    }
  }

  getCountryMetrics() {
    return [
      {
        id: 'select', sorting: false, title: ''
      },
      {
        id: 'name', sorting: true, title: 'Name'
      },
      {
        id: 'next', sorting: true, title: ''
      }
    ];

  }


  getAdvertiserMetrics() {
    return [
      {
        id: 'select', sorting: false, title: ''
      },
      {
        id: 'active', sorting: true, title: ''
      },
      {
        id: 'name', sorting: true, title: 'Name'
      },
      {
        id: 'next', sorting: true, title: ''
      }
    ];
  }

  getGroupByMetrics() {
    return [
      {
        id: 'select', sorting: false, title: ''
      },
      {
        id: 'name', sorting: true, title: 'Name'
      }
    ];
  }

  getCreativeSizeMetrics() {
    return [
      {
        id: 'select', sorting: false, title: ''
      },
      {
        id: 'name', sorting: true, title: 'Size'
      },
    ];
  }

  getListDataGroupBy() {
    return this.getGroupByData();
  }

  getListData(entity, params: ListApiParams) {
    return this.getDictionaryData(entity, params.pageNo, params.pageSize, params.refresh, null, params.request, params.sort);
  }

  getDictionaryData(entity: any, pageNumber: number, pageSize: number, refresh?: boolean, reqId?: string,
    request?: SearchRequest, sort?: string): Observable<any> {
    return this.dashboardService.getDictionaryUsingPOST(entity, pageNumber, pageSize, refresh, reqId, request, sort);
  }


  /**
   * group by section metrics for advanced reports form page
   */
  getGroupByData() {

    return [
      { id: 1, name: 'Advertiser', value: 'advertiser' },
      { id: 2, name: 'Aggregator', value: 'aggregator' },
      { id: 3, name: 'Campaign', value: 'campaign' },
      { id: 4, name: 'Strategy', value: 'strategy' },
      { id: 5, name: 'Site', value: 'site' },

      { id: 6, name: 'Creative', value: 'creative' },
      { id: 7, name: 'Creative size', value: 'creative_size' },
      { id: 8, name: 'Offer Type', value: 'creative_offer_type' },
      { id: 9, name: 'Advertiser Pricing Type', value: 'advertiser_pricing' },
      { id: 10, name: 'Country', value: 'country' },

      { id: 11, name: 'State', value: 'state' },
      { id: 12, name: 'City', value: 'city' },
      { id: 13, name: 'Media type', value: 'media_type' },
      { id: 14, name: 'Bid Strategy', value: 'bid_strategy' },
      { id: 15, name: 'Optimization Type', value: 'optimization_type' },

      { id: 16, name: 'Fold Position', value: 'position' },
      { id: 17, name: 'Channels', value: 'source_type' },
      { id: 18, name: 'Brand', value: 'device_brand' },
      { id: 19, name: 'Model', value: 'device_model' },
      { id: 20, name: 'Operating System', value: 'os' },
    ];
  }

  setDuration(date: Date[]) {
    this.commonReportingService.setDuration(date, this.masterRequest);

  }

  getDateRange(): Date[] {
    return this.commonReportingService.getDateRange(this.masterRequest);
  }

  setInterval(value: ReportingRequest.IntervalEnum) {
    this.masterRequest.interval = value;
  }

  getInterval(): ReportingRequest.IntervalEnum {
    return this.masterRequest.interval;
  }

  setMetrics(arr: Array<string>) {
    this.masterRequest.columns = arr;
  }

  getMetrics(): string[] {
    return this.masterRequest.columns;
  }

  setGroupBy(arr: string[]) {
    this.masterRequest.group_by = arr;
  }

  getGroupBy() {
    return this.masterRequest.group_by;
  }

  setSortBy(arr: SortModel[]) {
    this.masterRequest.sort_by = arr;
  }

  getSortBy() {
    return this.masterRequest.sort_by;
  }

  setCurrency(currency: ReportingRequest.CurrencyOfEnum) {
    this.masterRequest.currency_of = currency;
  }

  getCurrency(): ReportingRequest.CurrencyOfEnum {
    return this.masterRequest.currency_of;
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

  initPositionObject() {
    this.positionObjectArr = [
      {
        label: 'Not Available',
        value: AdvancedConstants.POSITIONS.NOT_AVAILABLE,
        select: true
      },
      {
        label: 'Above Fold',
        value: AdvancedConstants.POSITIONS.ABOVE_FOLD,
        select: true
      },
      {
        label: 'Below Fold',
        value: AdvancedConstants.POSITIONS.BELOW_FOLD,
        select: true
      },
      {
        label: 'Partially Above Fold',
        value: AdvancedConstants.POSITIONS.PARTIAL_ABOVE_FOLD,
        select: true
      }
    ];
  }


  initChannelObject() {
    this.channelObjectArr = [
      {
        label: 'Desktop',
        value: AdvancedConstants.CHANNELS.DESKTOP,
        select: true
      },
      {
        label: 'Mobile App',
        value: AdvancedConstants.CHANNELS.MOBILE_APP,
        select: true
      },
      {
        label: 'Mobile Web',
        value: AdvancedConstants.CHANNELS.MOBILE_WEB,
        select: true
      },
    ];
  }

  initCrMediaObject() {
    this.crMediaObjectArr = [
      {
        label: 'Banner',
        value: AdvancedConstants.MEDIA_TYPE.BANNER,
        select: true
      },
      {
        label: 'Pop',
        value: AdvancedConstants.MEDIA_TYPE.POP,
        select: true
      },
    ];
  }


  initPricingObject() {
    this.pricingObjectArr = [
      {
        label: 'CPM',
        value: CampaignConstants.PRICING_ID.CPM,
        select: true
      },
      {
        label: 'CPC',
        value: CampaignConstants.PRICING_ID.CPC,
        select: true
      },
      {
        label: 'CPA',
        value: CampaignConstants.PRICING_ID.CPA,
        select: true
      },
      {
        label: 'CPI',
        value: CampaignConstants.PRICING_ID.CPI,
        select: true
      },
    ];
  }


  /**
   * 
   * @param filterName 
   * get check box array for different check-boxes 
   */
  getCheckBoxObjectArray(filterName: string): CheckBoxesObj[] {
    switch (filterName) {
      case AdvancedConstants.FILTER_COLUMN.POSITION:
        return this.positionObjectArr

      case AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA:
        return this.crMediaObjectArr

      case AdvancedConstants.FILTER_COLUMN.CHANNEL:
        return this.channelObjectArr

      case AdvancedConstants.FILTER_COLUMN.PRICING:
        return this.pricingObjectArr
    }
  }

  /**
  * 
  * @param filterName 
  * set check box array for different check-boxes 
  * and also update the master api-request object
  */
  setCheckBoxObjectArray(filterName: string, inputArr: CheckBoxesObj[]) {
    const tempArr = cloneDeep(inputArr);
    switch (filterName) {
      case AdvancedConstants.FILTER_COLUMN.POSITION:
        this.positionObjectArr = cloneDeep(inputArr);
        break;

      case AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA:
        this.crMediaObjectArr = cloneDeep(inputArr);
        break;

      case AdvancedConstants.FILTER_COLUMN.CHANNEL:
        this.channelObjectArr = cloneDeep(inputArr);
        break;

      case AdvancedConstants.FILTER_COLUMN.PRICING:
        this.pricingObjectArr = cloneDeep(inputArr);
        break;
    }

    const selected = [];
    const rejected = [];
    let localFilter = {} as FilterModel;

    tempArr.forEach(obj => {
      if (obj.select) {
        selected.push(obj.value);
      } else {
        rejected.push(obj.value);
      }
    });

    if (selected.length === tempArr.length) {
      // dont push in filters if all selected
      this.commonReportingService.removeFromMasterFilterArray(filterName, this.masterRequest);
    } else if (rejected.length === tempArr.length) {
      // use 'not-in' operator
      localFilter = this.commonReportingService.formFilterElementWithArray(filterName, rejected, 'value', 'not_in');
      this.commonReportingService.appendToMasterFilterArray(localFilter, this.masterRequest);
    } else {
      // use 'in' operator
      localFilter = this.commonReportingService.formFilterElementWithArray(filterName, selected, 'value');
      this.commonReportingService.appendToMasterFilterArray(localFilter, this.masterRequest);
    }
  }


  /**
   * 
   * @param isAdvertiser 
   * @param l1Object 
   * @param l2Object 
   * @param l3Object 
   * @param l1FilterStr 
   * @param l2FilterStr 
   * @param l3FilterStr 
   * 
   * setup filters for advertiser/campaign/strategy or country/state/city
   * in the api-request filters[]
   */
  setAdvertiserGeographyFilter(isAdvertiser: boolean, l1Object: ModalObject, l2Object: ModalObject, l3Object: ModalObject, l1FilterStr: string, l2FilterStr: string, l3FilterStr: string) {
    const l1Arr = Array.from(l1Object.set);
    const l2Arr = Array.from(l2Object.set);
    const l3Arr = Array.from(l3Object.set);

    if (isAdvertiser) {
      //advertiser-filter
      this.setModalEntities(AppConstants.ENTITY.ADVERTISER, l1Object);
      this.setModalEntities(AppConstants.ENTITY.CAMPAIGN, l2Object);
      this.setModalEntities(AppConstants.ENTITY.STRATEGY, l3Object);
    } else {
      //geography-filter
      this.setModalEntities(AdvancedConstants.ENTITY.COUNTRY, l1Object);
      this.setModalEntities(AdvancedConstants.ENTITY.STATE, l2Object);
      this.setModalEntities(AdvancedConstants.ENTITY.CITY, l3Object);
    }

    const l1SelectedArr: GridData[] = l1Arr.filter(x => !x.isNotSelected);
    const l1RejectedArr: GridData[] = l1Arr.filter(x => x.isNotSelected);

    const l2SelectedArr: GridData[] = l2Arr.filter(x => !x.isNotSelected);
    const l2RejectedArr: GridData[] = l2Arr.filter(x => x.isNotSelected);

    const l3SelectedArr: GridData[] = l3Arr.filter(x => !x.isNotSelected);
    const l3RejectedArr: GridData[] = l3Arr.filter(x => x.isNotSelected);

    this.commonReportingService.modifyFilterArray(l1FilterStr, l1SelectedArr, l1RejectedArr, l1Object.set, this.masterRequest);
    this.commonReportingService.modifyFilterArray(l2FilterStr, l2SelectedArr, l2RejectedArr, l2Object.set, this.masterRequest);
    this.commonReportingService.modifyFilterArray(l3FilterStr, l3SelectedArr, l3RejectedArr, l3Object.set, this.masterRequest);
  }

  /**
   * 
   * @param crSize 
   * setup filter for creative size in api-request
   */
  setCreativeSizeFilter(crSize: ModalObject) {
    this.setModalEntities(AdvancedConstants.ENTITY.CREATIVE_SIZE, crSize);

    const arrFromSet = Array.from(crSize.set);
    const selectedArr: GridData[] = arrFromSet.filter(x => !x.isNotSelected);
    const rejectedArr: GridData[] = arrFromSet.filter(x => x.isNotSelected);
    const heightSelected: any[] = [];
    const widthSelected: any[] = [];

    const heightRejected: any[] = [];
    const widthrejected: any[] = [];

    // name format is WxH
    selectedArr.forEach((x) => {
      const idx = x.name.indexOf('x');
      const w = parseInt(x.name.substring(0, idx));
      const h = parseInt(x.name.substring(idx + 1, x.name.length));
      heightSelected.push(h);
      widthSelected.push(w);
    });

    rejectedArr.forEach((x) => {
      const idx = x.name.indexOf('x');
      const w = parseInt(x.name.substring(0, idx));
      const h = parseInt(x.name.substring(idx + 1, x.name.length));
      heightRejected.push(h);
      widthrejected.push(w);
    });

    this.commonReportingService.modifyFilterArray(AdvancedConstants.FILTER_COLUMN.CR_HEIGHT, heightSelected, heightRejected, crSize.set, this.masterRequest);
    this.commonReportingService.modifyFilterArray(AdvancedConstants.FILTER_COLUMN.CR_WIDTH, widthSelected, widthrejected, crSize.set, this.masterRequest);

  }


  /**
   * 
   * @param entityType 
   * @param filterStr 
   * @param modalObject 
   * for creatives and aggregators , set filters in filter[] of api-req
   */
  setCreativeAggregatorFilter(entityType: string, filterStr: string, modalObject: ModalObject) {
    this.setModalEntities(entityType, modalObject);
    const l1Arr = Array.from(modalObject.set);
    const l1SelectedArr: GridData[] = l1Arr.filter(x => !x.isNotSelected);
    const l1RejectedArr: GridData[] = l1Arr.filter(x => x.isNotSelected);
    this.commonReportingService.modifyFilterArray(filterStr, l1SelectedArr, l1RejectedArr, modalObject.set, this.masterRequest);
  }

  /**
   * setup initial ui-data and api-request
   */
  setDefaultRequest() {
    // set interval  as None
    this.masterRequest.interval = ReportingRequest.IntervalEnum.None;

    // set duration as today
    const today = new Date();
    this.masterRequest.duration = {} as DurationModel;
    this.masterRequest.duration.start_timestamp = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 1000;
    this.masterRequest.duration.end_timestamp = null;

    // set preselected metrics
    this.masterRequest.columns = this.getPreselectedMetrics();

    // set  currencey
    this.masterRequest.currency_of = ReportingRequest.CurrencyOfEnum.Licensee;

    // init checkboxes
    this.masterRequest.filters = [];
    this.initChannelObject();
    this.initPositionObject();
    this.initPricingObject();
    this.initCrMediaObject();
    this.initModalEntities();
  }

  /**
   * initialize the entities which can be selected form popup modal
   */
  initModalEntities() {
    this.country = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.state = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.city = { map: new Map<number, boolean>(), set: new Set<GridData>() };

    this.aggregator = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.creative = { map: new Map<number, boolean>(), set: new Set<GridData>() };

    this.creative_size = { map: new Map<number, boolean>(), set: new Set<GridData>() };

    this.advertiser = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.campaign = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.strategy = { map: new Map<number, boolean>(), set: new Set<GridData>() };
  }


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

      case AppConstants.ENTITY.AGGREGATOR:
        this.aggregator = obj;
        break;

      case AdvancedConstants.ENTITY.COUNTRY:
        this.country = obj;
        break;

      case AdvancedConstants.ENTITY.STATE:
        this.state = obj;
        break;
      case AdvancedConstants.ENTITY.CITY:
        this.city = obj;
        break;

      case AppConstants.ENTITY.CREATIVE:
        this.creative = obj;
        break;

      case AdvancedConstants.ENTITY.CREATIVE_SIZE:
        this.creative_size = obj;
        break;
    }
  }

  getModalEntities(entity) {
    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER:
        return this.advertiser;

      case AppConstants.ENTITY.CAMPAIGN:
        return this.campaign;

      case AppConstants.ENTITY.STRATEGY:
        return this.strategy;

      case AppConstants.ENTITY.AGGREGATOR:
        return this.aggregator;

      case AdvancedConstants.ENTITY.COUNTRY:
        return this.country;

      case AdvancedConstants.ENTITY.STATE:
        return this.state;

      case AdvancedConstants.ENTITY.CITY:
        return this.city;

      case AppConstants.ENTITY.CREATIVE:
        return this.creative;

      case AdvancedConstants.ENTITY.CREATIVE_SIZE:
        return this.creative_size;
    }
  }


  /**
   * 
   * @param type 
   * show on ui if user has made changes to initial selections in check boxes
   */
  getUiIndicatorForCheckBox(type: string): boolean {
    const selected = [];
    const rejected = [];

    let arrRequired: any[] = [];
    switch (type) {
      case AdvancedConstants.ENTITY.POSITIONS:
        arrRequired = this.positionObjectArr;
        break;

      case AdvancedConstants.ENTITY.PRICING:
        arrRequired = this.pricingObjectArr;
        break;

      case AdvancedConstants.ENTITY.CHANNELS:
        arrRequired = this.channelObjectArr;
        break;

    }

    arrRequired.forEach(obj => {
      if (obj.select) {
        selected.push(obj.value);
      } else {
        rejected.push(obj.value);
      }
    });

    const result = (selected.length === arrRequired.length) ? false : true;
    return result;
  }



  show(entity: string) {
    // console.log('[REQ-OBJ] >>> ', this.masterRequest);
    this.masterRequest.currency_of = this.masterRequest.currency_of;
    return this.reportingService.customReportUsingPOST(entity, this.masterRequest);
  }

  export(entity: string) {
    this.masterRequest.currency_of = this.masterRequest.currency_of;
    return this.reportingService.customReportCSVUsingPOST(entity, this.masterRequest);
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

    const isAdvancedUi = (urlParts.includes('report') && urlParts.includes('advanced')) ? true : false;
    const isAdvancedResult = (isAdvancedUi && urlParts.includes('result')) ? true : false;

    if (!isAdvancedResult && !isAdvancedUi) {
      this.setDefaultRequest();
      this.masterRequest.group_by = [];
    }
  }



}
