import { Injectable } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { DashboardControllerService, SearchRequest, AdvertiserControllerService, ApiResponseObjectSkadTargetPrivileges } from '@revxui/api-client-ts';
import { Observable, of } from 'rxjs';
import { BreadcrumbsService } from './breadcrumbs.service';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  constructor(
    private commonService: CommonService,
    private dashboardService: DashboardControllerService,
    private breadCrumbService: BreadcrumbsService,
    private advControllerService: AdvertiserControllerService
  ) { }

  // REVX-647 : all metrics will be selectable from drp down and all will be tolltips
  // RO user restriction is still there
  /**
   * get ui metric for chart
   */
  getChartMetrics() {
    const chartMetrics: any[] = [
      {
        id: 'revenue', showROuser: true, showInTooltip: true, value: 0,
        title: 'Advertiser Spend', type: AppConstants.NUMBER_TYPE_CURRENCY
      },

      {
        id: 'cost', showROuser: false, showInTooltip: true, value: 0,
        title: 'Media Spend', type: AppConstants.NUMBER_TYPE_CURRENCY
      },

      {
        id: 'margin', showROuser: false, showInTooltip: true, value: 0,
        title: 'Margin', type: AppConstants.NUMBER_TYPE_PERCENTAGE
      },

      {
        id: 'impressions', showROuser: true, showInTooltip: true, value: 0,
        title: 'Impressions', type: AppConstants.NUMBER_TYPE_NOTHING
      },

      {
        id: 'clicks', showROuser: true, showInTooltip: true, value: 0,
        title: 'Clicks', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'installs', showROuser: true, showInTooltip: true, value: 0,
        title: 'Installs', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'conversions', showROuser: true, showInTooltip: true, value: 0,
        title: 'Conversions', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'clickConversions', showROuser: true, showInTooltip: true, value: 0,
        title: 'Click Conversions', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'viewConversions', showROuser: true, showInTooltip: true, value: 0,
        title: 'View Conversions', type: AppConstants.NUMBER_TYPE_NOTHING
      },

      //ecpm denotes publisher ecpm (not adv_ecpm)
      {
        id: 'ecpm', showROuser: false, showInTooltip: true, value: 0,
        title: 'eCPM', type: AppConstants.NUMBER_TYPE_CURRENCY
      },
      {
        id: 'ecpa', showROuser: false, showInTooltip: true, value: 0,
        title: 'eCPA', type: AppConstants.NUMBER_TYPE_CURRENCY
      },
      {
        id: 'ecpc', showROuser: false, showInTooltip: true, value: 0,
        title: 'eCPC', type: AppConstants.NUMBER_TYPE_CURRENCY
      },
      {
        id: 'ecpi', showROuser: false, showInTooltip: true, value: 0,
        title: 'eCPI', type: AppConstants.NUMBER_TYPE_CURRENCY
      },

      {
        id: 'erpm', showROuser: true, showInTooltip: true, value: 0,
        title: 'eRPM', type: AppConstants.NUMBER_TYPE_CURRENCY
      },
      {
        id: 'erpa', showROuser: true, showInTooltip: true, value: 0,
        title: 'eRPA', type: AppConstants.NUMBER_TYPE_CURRENCY
      },
      {
        id: 'erpc', showROuser: true, showInTooltip: true, value: 0,
        title: 'eRPC', type: AppConstants.NUMBER_TYPE_CURRENCY
      },
      {
        id: 'erpi', showROuser: true, showInTooltip: true, value: 0,
        title: 'eRPI', type: AppConstants.NUMBER_TYPE_CURRENCY
      },

      {
        id: 'ctr', showROuser: true, showInTooltip: true, value: 0,
        title: 'CTR', type: AppConstants.NUMBER_TYPE_PERCENTAGE
      },
      {
        id: 'iti', showROuser: true, showInTooltip: true, value: 0,
        title: 'ITI', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'ctc', showROuser: true, showInTooltip: true, value: 0,
        title: 'CTC', type: AppConstants.NUMBER_TYPE_PERCENTAGE
      },
      {
        id: 'cvr', showROuser: true, showInTooltip: true, value: 0,
        title: 'CVR', type: AppConstants.NUMBER_TYPE_PERCENTAGE
      },
      {
        id: 'advRevenue', showROuser: true, showInTooltip: true, value: 0,
        title: 'Advertiser Revenue', type: AppConstants.NUMBER_TYPE_CURRENCY
      },
      {
        id: 'roi', showROuser: true, showInTooltip: true, value: 0,
        title: 'ROI', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'userReach', showROuser: true, showInTooltip: true, value: 0,
        title: 'Reach', type: AppConstants.NUMBER_TYPE_PERCENTAGE
      },

      {
        id: 'eligibleUniqUsers', showROuser: true, showInTooltip: true, value: 0,
        title: "Eligible UU's", type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'impressionUniqUsers', showROuser: true, value: 0, showInTooltip: true,
        title: "Impression UU's", type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'eligibleBids', value: 0, showROuser: true, showInTooltip: true,
        title: 'Eligible Bids', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'bidsPlaced', value: 0, showROuser: true, showInTooltip: true,
        title: 'Bid Placed', type: AppConstants.NUMBER_TYPE_NOTHING
      },
      {
        id: 'invalidClicks', value: 0, showROuser: true, showInTooltip: true,
        title: 'Invalid Clicks', type: AppConstants.NUMBER_TYPE_NOTHING
      },
    ];

    // if RO USER remove the row from the metrics array
    //total metrics = 29
    //out of 29 , for RO user we have 23 metrics only (6 are hidden)
    this.remomveROuserMetrics(chartMetrics);

    return chartMetrics;
  }

  /**
   * get tooltip[] for chart 
   */
  getChartTooltipMetrics() {
    const chartMetrics = this.getChartMetrics();
    const tooltipMetrics: any[] = [];
    for (const i in chartMetrics) {
      if (chartMetrics[i].showInTooltip) {
        tooltipMetrics.push(chartMetrics[i]);
      }
    }
    return tooltipMetrics;
  }


  /**
   * get funnel metrics when user selects funnel view
   */
  getFunnelMetrics() {
    const funnelMetrics: any[] = [
      {
        id: 'eligibleBids', value: 0, title: 'Eligible Bids', child: {
          id: 'eligibleUniqUsers', value: 0,
          title: 'Unique Users'
        }
      },
      { id: 'bidsPlaced', value: 0, title: 'Bid Placed', child: null },
      {
        id: 'impressions', value: 0, title: 'Impressions', child: {
          id: 'impressionUniqUsers', value: 0,
          title: 'Unique Users'
        }
      },
      { id: 'clicks', value: 0, title: 'Clicks', child: { id: 'invalidClicks', value: 0, title: 'Invalid Clicks' } },
      { id: 'installs', value: 0, title: 'Installs', child: { id: 'iti', value: 0, title: 'ITI' } },
      { id: 'conversions', value: 0, title: 'Conversions', child: null },
    ];
    return funnelMetrics;
  }

  /**
   * 
   * @param entity 
   * since strategy has quick-edit feature , so we need to pass seperate set of metrics
   * through this method
   */
  getListMetrics(entity: string): any[] {
    switch (entity) {
      case AppConstants.ENTITY.STRATEGY.toLowerCase():
        return this.getStrategyMetrics();
      default:
        return this.getNonStrategyMetrics();

    }
  }

  /**
   * get metrics for strategy list only
   */
  getStrategyMetrics() {
    let metrics: any[] = this.getNonStrategyMetrics(); //RO user is handled in this call 

    //strategy list has (quick-edit) extra (disable for RO user)
    const userRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (userRole != AppConstants.USER_ROLE.READ_ONLY) {
      let dropDownObj = {
        id: 'dropdown', hover: 'Action', showROuser: false, showSelectOption: true, sorting: false,
        title: 'Action', type: '', cell: (element: any) => `${element.action}`
      }
      metrics.splice(1, 0, dropDownObj);
    }
    return metrics;
  }

  /**
   * get metics for advertiser/campaign metrics
   */
  getNonStrategyMetrics() {
    const metrics = [
      {
        id: 'action', hover: 'Action', showROuser: true, showSelectOption: false, preSelected: false,
        title: 'Action', type: '', cell: (element: any) => `${element.action}`
      },
      {
        id: 'active', hover: 'Active', showROuser: true, showSelectOption: false, preSelected: false,
        title: 'Status', type: '', cell: (element: any) => `${element.active}`
      },
      {
        id: 'name', hover: 'Name', showROuser: true, showSelectOption: false, preSelected: false,
        title: 'Name', type: '', cell: (element: any) => `${element.name}`
      },
      {
        id: 'id', hover: 'ID', showROuser: true, showSelectOption: false, preSelected: false,
        title: 'Id', type: '',
        cellTooltip: (element: any) => `${element.id}`,
        cell: (element: any) => `${element.id}`
      },
      {
        id: 'impressions', hover: 'Count of ads served to users', showROuser: true, showSelectOption: true, preSelected: true,
        title: "Imp's", type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.impressions, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.impressions, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      {
        id: 'clicks', hover: 'If user clicked on the Impression then that event is counted as a click', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'Clicks', type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.clicks, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.clicks, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      {
        id: 'installs', hover: 'Number of times the app has been installed', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'Installs', type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.installs, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.installs, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      // { id: 'viewConversions', hover:'View conversions' , showSelectOption: true, preSelected:true,
      // title: 'View Conversions', type: AppConstants.NUMBER_TYPE_NOTHING },
      // { id: 'clickConversions', hover:'Click conversions' , showSelectOption: true, preSelected:true,
      // title: 'Click Conversions', type: AppConstants.NUMBER_TYPE_NOTHING },
      {
        id: 'conversions', hover: 'Total number of conversions coming from ad served/Impressions ', showROuser: true, showSelectOption: true, preSelected: true,
        title: "Conv's", type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.conversions, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.conversions, AppConstants.NUMBER_TYPE_NOTHING)}`
      },

      {
        id: 'ecpm', hover: 'Effective Cost Per Million Impressions', showROuser: false, showSelectOption: true, preSelected: false,
        title: 'eCPM', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.ecpm, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.ecpm, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },
      {
        id: 'ecpc', hover: 'Effective cost per click', showROuser: false, showSelectOption: true, preSelected: false,
        title: 'eCPC', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.ecpc, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.ecpc, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },
      {
        id: 'ecpi', hover: 'Effective cost per install', showROuser: false, showSelectOption: true, preSelected: false,
        title: 'eCPI', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.ecpi, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.ecpi, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },
      {
        id: 'ecpa', hover: 'Effective cost per aquisition', showROuser: false, showSelectOption: true, preSelected: false,
        title: 'eCPA', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.ecpa, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.ecpa, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },

      {
        id: 'erpm', hover: 'Effective revenue per mille impression', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'eRPM', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.erpm, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.erpm, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },
      {
        id: 'erpc', hover: 'Effective revenue per click', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'eRPC', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.erpc, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.erpc, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },
      {
        id: 'erpi', hover: 'Effective revenue per install', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'eRPI', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.erpi, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.erpi, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },
      {
        id: 'erpa', hover: 'Effective revenue per acquisition', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'eRPA', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.erpa, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.erpa, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },

      {
        id: 'ctr', hover: 'Click Through Ratio or Click per impression x 100', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'CTR', type: AppConstants.NUMBER_TYPE_PERCENTAGE,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.ctr, AppConstants.NUMBER_TYPE_PERCENTAGE)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.ctr, AppConstants.NUMBER_TYPE_PERCENTAGE)}`
      },
      {
        id: 'iti', hover: 'Impressions / Installs', showROuser: true, showSelectOption: true, preSelected: false,
        title: 'ITI', type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.iti, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.iti, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      {
        id: 'ctc', hover: 'Conversions upon clicks/clicks X 100', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'CTC', type: AppConstants.NUMBER_TYPE_PERCENTAGE,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.ctc, AppConstants.NUMBER_TYPE_PERCENTAGE)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.ctc, AppConstants.NUMBER_TYPE_PERCENTAGE)}`
      },
      {
        id: 'roi', hover: 'Advertiser revenue divided by advertiser spend', showROuser: true, showSelectOption: true, preSelected: true,
        title: 'ROI', type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.roi, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.roi, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      {
        id: 'revenue', hover: 'Total revenue spend of advertiser',
        showROuser: true, showSelectOption: true, preSelected: true,
        title: 'Adv Spend', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.revenue, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.revenue, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },

      {
        id: 'cost', hover: 'Cost of showing the impressions.', showROuser: false, showSelectOption: true, preSelected: true,
        title: 'Media Spend', type: AppConstants.NUMBER_TYPE_CURRENCY,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.cost, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.cost, AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
      },

      {
        id: 'margin', hover: '(Advertiser spend - Media spend)/Advertiser spend X 100 ', showROuser: false, showSelectOption: true, preSelected: true,
        title: 'Margin', type: AppConstants.NUMBER_TYPE_PERCENTAGE,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.margin, AppConstants.NUMBER_TYPE_PERCENTAGE)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.margin, AppConstants.NUMBER_TYPE_PERCENTAGE)}`
      },
      {
        id: 'eligibleUniqUsers', hover: 'Users belonging to the targeted demography', showROuser: true, showSelectOption: true, preSelected: false,
        title: "Eligible UU's", type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.eligibleUniqUsers, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.eligibleUniqUsers, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      {
        id: 'impressionUniqUsers', hover: 'Number of times users belonging to the targeted demography received the ad', showROuser: true, showSelectOption: true,
        preSelected: false, title: "Imp UU's", type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.impressionUniqUsers, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.impressionUniqUsers, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      {
        id: 'userReach', hover: 'Reach', showROuser: true, showSelectOption: true,
        preSelected: false, title: 'Reach', type: AppConstants.NUMBER_TYPE_PERCENTAGE,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.userReach, AppConstants.NUMBER_TYPE_PERCENTAGE)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.userReach, AppConstants.NUMBER_TYPE_PERCENTAGE)}`
      },

      {
        id: 'campaign', hover: 'Campaign', showROuser: true, showSelectOption: false,
        preSelected: false, title: 'Campaign', type: '',
        cellTooltip: (element: any) => `${element.campaign}`,
        cell: (element: any) => `${element.campaign}`
      },
      {
        id: 'strategy', hover: 'Strategy', showROuser: true, showSelectOption: false,
        preSelected: false, title: 'Strategy', type: '',
        cellTooltip: (element: any) => `${element.strategy}`,
        cell: (element: any) => `${element.strategy}`
      },

      // { id: 'mediaSpend', hover:'' , showSelectOption: true, preSelected:true, title: 'Media Spend',
      // type: AppConstants.NUMBER_TYPE_CURRENCY },
      // { id: 'cvr', hover:'Conversions upon clicks/impressions X 100' , showSelectOption: true,
      // preSelected:true, title: 'CVR', type: AppConstants.NUMBER_TYPE_PERCENTAGE },
      // { id: 'advRevenue', hover:'' , showSelectOption: true, preSelected:true,
      // title: 'Advertiser Revenue', type: AppConstants.NUMBER_TYPE_CURRENCY },

      // { id: 'eligibleUniqUsers', hover:'Eligible unique users' ,  showROuser: true,
      // showSelectOption: true, value: 0, title: "Eligible UU's", type: AppConstants.NUMBER_TYPE_NOTHING,
      // cell: (element: any) => `${this.commonService.nrFormat(element.eligibleUniqUsers, AppConstants.NUMBER_TYPE_NOTHING)}` },
      // { id: 'impressionUniqUsers', hover:'Impression unique users' ,  showROuser: true,
      // showSelectOption: true, value: 0, title: "Impression UU's", type: AppConstants.NUMBER_TYPE_NOTHING,
      // cell: (element: any) => `${this.commonService.nrFormat(element.impressionUniqUsers, AppConstants.NUMBER_TYPE_NOTHING)}`  },
      {
        id: 'eligibleBids', hover: '', value: 0, showROuser: true, showSelectOption: true,
        title: 'Eligible Bids', type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.eligibleBids, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.eligibleBids, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
      {
        id: 'bidsPlaced', hover: 'Bids placed', value: 0, showROuser: true, showSelectOption: true,
        title: 'Bid Placed', type: AppConstants.NUMBER_TYPE_NOTHING,
        cellTooltip: (element: any) => `${this.commonService.nrFormatTooltip(element.bidsPlaced, AppConstants.NUMBER_TYPE_NOTHING)}`,
        cell: (element: any) => `${this.commonService.nrFormat(element.bidsPlaced, AppConstants.NUMBER_TYPE_NOTHING)}`
      },
    ];

    // if RO USER remove the row from the metrics array
    this.remomveROuserMetrics(metrics);

    return metrics;
  }

  /**
   * 
   * @param metrics 
   * remove those metric for which showROuser=false
   */
  public remomveROuserMetrics(metrics) {
    const userRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (userRole === AppConstants.USER_ROLE.READ_ONLY) {
      const indicesToRemove = [];
      for (const idx in metrics) {
        if (metrics[idx].showROuser === false) {
          indicesToRemove.push(idx);
        }
      }

      // console.log("indicesToRemove", indicesToRemove);

      for (const i in indicesToRemove) {
        // console.log("indicesToRemove", indicesToRemove[i]);
        metrics.splice(parseInt(indicesToRemove[i]) - parseInt(i), 1);
        // console.log(chartMetrics);
      }
    }
  }


  getDetailsById(id: number, entity: any):
    Observable<any> {
    return this.dashboardService.getDetailByIdUsingGET(id, entity);
  }

  /**
   * 
   * @param response 
   * create bread-crumbs from the input api-resp
   */
  createBCObject(response) {
    return this.breadCrumbService.createBCObject(response);
  }


  /**
   * 
   * @param entity advertiser/campaign/strategy
   * @param pageNumber 
   * @param pageSize 
   * call dictionary api
   */
  getDictionaryUsingGET(entity: any, pageNumber: number, pageSize: number):
    Observable<any> {
    return this.dashboardService.getDictionaryUsingPOST(entity, pageNumber, pageSize);
  }




  //REVX-724
  getSkadPrivledge(columnName: string, id: number): Observable<ApiResponseObjectSkadTargetPrivileges> {
    let req: SearchRequest = {
      filters: [{ column: columnName, value: id.toString() }]
    }
    return this.advControllerService.getSkadTargetPrivilegesUsingPOST(req);

    // let obj: ApiResponseObjectSkadTargetPrivileges = {
    //   error: null,
    //   respId: '',
    //   respObject: {
    //     allowed: false,
    //     data: [],
    //     totalNoOfRecords: 100
    //   }
    // }
    // return of(obj);

  }





}
