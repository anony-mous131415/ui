import { Injectable } from '@angular/core';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { PixelTypePipe } from '@app/shared/_pipes/pixel-type.pipe';
import { AppConstants } from '../_constants/AppConstants';
import { SecondsToTimePipe } from '../_pipes/seconds-to-time.pipe';
import { CommonService } from './common.service';


@Injectable({
  providedIn: 'root'
})
export class EntitySelectorRadioService {

  constructor(
    private pixelTypePipe: PixelTypePipe,
    private secondsToTimePipe: SecondsToTimePipe,
    private commonService: CommonService
  ) { }


  /**
   * 
   * @param entity 
   * controller for the metrics returned , depending on entity
   */
  getMetricsForList(entity: string) {
    switch (entity) {
      case AppConstants.ENTITY.PIXEL:
        return this.getPixelMetrics();
      case AppConstants.ENTITY.CAMPAIGN:
        return this.getCampaignMetrics();
      case AppConstants.ENTITY.ADVERTISER:
        return this.getAdvertiserMetrics();
    }
  }

  /**
   * get pixel metrics , for popup modal in campaign form
   */

  getPixelMetrics() {
    return [
      {
        id: 'selected', title: '', cell: (element: any) => ``
      },
      {
        id: 'active', title: 'Status', cell: (element: any) => `${element.active}`
      },
      {
        id: 'name', title: 'Name', cell: (element: any) => `${element.name}`
      },
      {
        id: 'clickValidityWindow', title: 'MAX TIME',
        cell: (element: any) => `${element.clickValidityWindow === -1 ? 'No Limit' : (element.clickValidityWindow === 0 ? '0 Day' : this.secondsToTimePipe.transform(element.clickValidityWindow))}`
      },
      {
        id: 'userFcap', title: 'COUNT PER USER', cell: (element: any) =>
          `${!element.userFcap || element.userFcap === -1 ? 'No Limit' : element.userFcap + ' every ' + (element.fcapDuration === 0 ? '0 day' : this.secondsToTimePipe.transform(element.fcapDuration))}`
      },
      {
        id: 'type', title: 'PIXEL TYPE', cell: (element: any) => `${this.pixelTypePipe.transform(element.type.name)}`
      },
    ];
  }

  /**
   * get campaign metrics ,for popup modal in strategy form
   */

  getCampaignMetrics() {
    return [
      {
        id: 'selected', title: '', cell: (element: any) => ``
      },
      {
        id: 'active', title: 'Status', cell: (element: any) => `${element.active}`
      },
      {
        id: 'name', title: 'Name', cell: (element: any) => `${element.name}`
      },
      {
        id: 'startTime', title: 'START TIME',
        cell: (element: any) => `${this.commonService.epochToDateTimeFormatter(element.startTime)}`
      },
      {
        id: 'endTime', title: 'END TIME', cell: (element: any) =>
          `${element.endTime == CampaignConstants.NEVER_ENDING_EPOCH ? 'Never Ending' : this.commonService.epochToDateTimeFormatter(element.endTime)}`
      },
      {
        id: 'budget', title: 'BUDGET', cell: (element: any) => `${(element.lifetimeBudget === null || element.lifetimeBudget === -1) ? 'Unlimited' : element.lifetimeBudget + element.currencyCode}`
      },

      //REVX-724 : skad ui changes
      {
        id: 'skadTarget', title: 'SKAD N/W Target', cell: (element: any) => `${(element && element.skadTarget) ? 'Yes' : 'No'}`
      },
    ];

  }


  /**
   * get advertiser metrics , for popup modal in campaign/strategy form
   */
  getAdvertiserMetrics() {
    return [
      {
        id: 'selected', title: '', cell: (element: any) => ``
      },
      {
        id: 'active', title: 'Status', cell: (element: any) => `${element.active}`
      },
      {
        id: 'name', title: 'Name', cell: (element: any) => `${element.name}`
      },
    ];

  }


}
