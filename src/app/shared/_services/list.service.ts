import { Injectable } from '@angular/core';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { CampaignService } from '@app/entity/campaign/_services/campaign.service';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ListApiParams } from '@app/shared/_directives/list/list.component';
import { AlertService } from '@app/shared/_services/alert.service';
import {
  ApiResponseObjectDashboardResponse,
  DashboardControllerService,
  DashboardRequest
} from '@revxui/api-client-ts';
import { Observable, of } from 'rxjs';
import { EntitiesService } from './entities.service';
import { CommonService } from './common.service';
import { mock } from '../_directives/list/mock';
import { delay } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor(
    private dashboardService: DashboardControllerService,
    private entitiesService: EntitiesService,
    private advertiserService: AdvertiserService,
    private cmpService: CampaignService,
    private strService: StrategyService,
    private alertService: AlertService,
    private commonService: CommonService
  ) { }

  /**
   * Api Call to fetch the csv path
   */
  getListDataCSV(dashboardRequest: DashboardRequest, entity: any):
    Observable<any> {
    return this.dashboardService.getDashboardDataListCsvUsingPOST(dashboardRequest, entity);
  }

  /**
   * 
   * @param dashboardRequest the filtering of data using this
   * @param listApiParams parameters like sort and refresh etc are passed in this object
   * api call to fetch the data to be displayed in list
   */
  public getListData(dashboardRequest: DashboardRequest, listApiParams: ListApiParams):
    Observable<ApiResponseObjectDashboardResponse> {
    return this.dashboardService.getDashboardDataListUsingPOST(dashboardRequest,
      listApiParams.entity, listApiParams.showUU, listApiParams.pageNo, listApiParams.pageSize,
      listApiParams.refresh, null, listApiParams.sort);
  }

  // public getListData(dashboardRequest: DashboardRequest, listApiParams: ListApiParams):
  //   Observable<any> {
  //   if (listApiParams.showUU == false) {
  //     return of(mock.resp_uu_false).pipe(delay(3000));
  //   } else {
  //     return of(mock.resp_uu_true).pipe(delay(6000));
  //   }
  // }

  public getMetricsForList(selectedMetricsIds?: string[], entity?: string) {

    const metrics: any[] = this.entitiesService.getListMetrics(entity);
    const selectedMetrics: any[] = [];

    // console.log("selected Metrics length ", selectedMetricsIds);
    if (selectedMetricsIds && selectedMetricsIds.length !== 0) {
      selectedMetrics.push(metrics[0]);
      selectedMetrics.push(metrics[1]);
      selectedMetrics.push(metrics[2]);
      selectedMetrics.push(metrics[3]);

      if (entity === AppConstants.ENTITY.STRATEGY.toLowerCase()) {
        selectedMetrics.push(metrics[4]);
      }

      for (const i in metrics) {
        if (selectedMetricsIds.indexOf(metrics[i].id) > -1 && selectedMetrics.map(item => item.id).indexOf(metrics[i].id) === -1) {
          selectedMetrics.push(metrics[i]);
        }
      }

      // console.log("selected metrics ", selectedMetricsIds, selectedMetrics);
      return selectedMetrics;
    } else if (selectedMetricsIds) {
      selectedMetrics.push(metrics[0]);
      selectedMetrics.push(metrics[1]);
      selectedMetrics.push(metrics[2]);
      selectedMetrics.push(metrics[3]);
      if (entity === AppConstants.ENTITY.STRATEGY.toLowerCase()) {
        selectedMetrics.push(metrics[4]);
      }

      return selectedMetrics;
    }

    return metrics;
  }

  /**
   * some metrics have showSelectOption = true , this methods returns only those metrics
   */
  getMetricsOptions() {
    const metrics = this.getMetricsForList();
    const options: any[] = [];
    for (const i in metrics) {
      if (metrics[i].showSelectOption === true) {
        options.push(metrics[i]);
      }
    }
    return options;
  }

  /**
   * some metrics have pre-selected = true , this methods returns only those metrics
   */
  getPreSelectedMetrics() {
    const metrics = this.getMetricsForList();
    const options: string[] = [];
    for (const i in metrics) {
      if (metrics[i].preSelected === true) {
        options.push(metrics[i].id);
      }
    }
    return options;
  }

  /**
   * 
   * @param entity 
   * @param ids 
   * activate entity(advertiser/campaign/strategy) from grid 
   */
  activateEntity(entity: string, ids: number[]) {
    let idString = this.commonService.convertIdsToCommaSeperatedString(ids);
    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER.toLowerCase():
        return this.advertiserService.activateAdvs(idString);

      case AppConstants.ENTITY.CAMPAIGN.toLocaleLowerCase():
        return this.cmpService.activateCmps(idString);

      case AppConstants.ENTITY.STRATEGY.toLowerCase():
        return this.strService.updateStrategyStatus(true, idString);
    }
  }

  /**
   * 
   * @param entity 
   * @param ids 
   * de-activate entity(advertiser/campaign/strategy) from grid 
   */
  deactivateEntity(entity: string, ids: number[]) {
    let idString = this.commonService.convertIdsToCommaSeperatedString(ids);

    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER.toLowerCase():
        return this.advertiserService.deactivateAdvs(idString);

      case AppConstants.ENTITY.CAMPAIGN.toLocaleLowerCase():
        return this.cmpService.deactivateCmps(idString);

      case AppConstants.ENTITY.STRATEGY.toLowerCase():
        return this.strService.updateStrategyStatus(false, idString);

    }
  }

  /**
   * 
   * @param apiResp 
   * @param successMsg 
   * @param errorMsg 
   * show success/err msg depending on the apiResponse
   */

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
    }
    else {
      this.alertService.error(errorMsg, false, true);

    }
    var that = this;
    setTimeout(function () {
      that.alertService.clear(true);
    }, 2500);

  }




}
