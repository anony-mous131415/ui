import { Injectable } from '@angular/core';
import {
  AudienceControllerService,
  CatalogControllerService,
  DashboardRequest,
  Duration,
  PixelControllerService,
  SearchRequest
} from '@revxui/api-client-ts';
import { Observable } from 'rxjs';
import { AppConstants } from '../_constants/AppConstants';
import { GenericListApiRequest } from '../_models/generic-list-api-request.model';
import { CommonService } from './common.service';
import { PixelTypePipe } from '../_pipes/pixel-type.pipe';
import { SecondsToTimePipe } from '../_pipes/seconds-to-time.pipe';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { EntitiesService } from './entities.service';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';

export const DURATION = 'duration';
export const START_TIMESTAMP = 'startTimeStamp';
export const END_TIMESTAMP = 'endTimeStamp';

@Injectable({
  providedIn: 'root'
})
export class GenericListService {
  constructor(
    private pixelApiService: PixelControllerService,
    private audienceService: AudienceControllerService,
    private catalogApiService: CatalogControllerService,
    private commonService: CommonService,
    private pixelTypePipe: PixelTypePipe,
    private secondsToTimePipe: SecondsToTimePipe,
    private creativeService: CreativeService,
    private entityService: EntitiesService
  ) { }




  /**
   *
   * @param entity
   * depending on type of entity , return the requied column-metric for table
   */
  getMetricsForList(entity: any) {
    // console.log('entity ::', entity);
    switch (entity) {
      case AppConstants.ENTITY.PIXEL:
        return this.getPixelMetrics();
      case AppConstants.ENTITY.CATALOG:
        return this.getCatalogMetrics();
      case AppConstants.ENTITY.CATALOG_DETAILS:
        const metrics: any[] = this.getCatalogDetailsMetrics();
        const selectedMetrics: any[] = [];
        const selectedMetricsIds = this.getCatalogDetailsMetricsHeader();
        for (const i in metrics) {
          if (selectedMetricsIds.indexOf(metrics[i].id) > -1) {
            selectedMetrics.push(metrics[i]);
          }
        }
        return selectedMetrics;
      case AppConstants.ENTITY.CREATIVE:
        return this.getCreativeMetrics();
      case AppConstants.ENTITY.AUDIENCE:
        return this.getAudienceMetrics();

    }
  }

  /**
   *
   * @param entity
   * @param listApiReq the extra pagination and sort parameters
   * api call to get data for list
   */
  getListData(entity: any, listApiReq: GenericListApiRequest):
    Observable<any> {
    switch (entity) {
      case AppConstants.ENTITY.PIXEL:
        return this.pixelApiService.searchPixelsUsingPOST(listApiReq.advertiserId,
          listApiReq.pageNumber, listApiReq.pageSize, listApiReq.refresh, null, listApiReq.search, listApiReq.sort);
      case AppConstants.ENTITY.CATALOG:
        return this.catalogApiService.getCatalogFeedsUsingPOST(listApiReq.advertiserId, listApiReq.pageNumber,
          listApiReq.pageSize, listApiReq.refresh, null, listApiReq.search, listApiReq.sort);
      case AppConstants.ENTITY.CATALOG_DETAILS:
        return this.catalogApiService.getVariableMappingsUsingPOST(listApiReq.entityId, listApiReq.pageNumber,
          listApiReq.pageSize, listApiReq.refresh, null, listApiReq.search, listApiReq.sort);
      case AppConstants.ENTITY.CREATIVE:
        const search: SearchRequest = listApiReq.search;
        const dashboardReq: DashboardRequest = {};
        dashboardReq.duration = this.extractFiltersFromSearchRequest(search, true);
        dashboardReq.filters = this.extractFiltersFromSearchRequest(search, false);
        dashboardReq.groupBy = '';
        return this.creativeService.getAllCreatives(listApiReq.pageNumber,
          listApiReq.pageSize, listApiReq.refresh, null, dashboardReq, listApiReq.sort);

      case AppConstants.ENTITY.AUDIENCE:
        listApiReq.search.filters = listApiReq.search.filters.filter(item => item.column !== DURATION);
        return this.audienceService.getAllAudienceUsingPOST(null, listApiReq.pageNumber, listApiReq.pageSize,
          listApiReq.refresh, null, listApiReq.search, listApiReq.sort);

    }

  }
  /**
   * Method to filters in Search Request to duration filter and other filters.
   * @param search - Search Request object
   * @param isDurationFilter - boolean indicating to extract duration or other filter.
   */
  extractFiltersFromSearchRequest(search: SearchRequest, isDurationFilter: boolean): any {

    if (search && search.filters && search.filters.length > 0) {
      if (isDurationFilter) {
        const durationIndex = search.filters.findIndex(item => item.column === DURATION);
        if (durationIndex !== -1) {
          return (search.filters[durationIndex].value as Duration);
        }
      } else {
        return search.filters.filter(item => item.column !== DURATION);
      }
    }
    return null;
  }

  // REVX-588 disabling sorting on impression....ctc
  // as api in giving inconsistent result
  getCreativeMetrics() {
    return [
      {
        id: 'action', hover: 'Select', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Select', type: '', cell: (element: any) => `${element.select}`
      },
      {
        id: 'dropdown', hover: 'Action', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Action', type: '', cell: (element: any) => `${element.action}`
      },
      {
        id: 'active', hover: 'Status', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Status', type: '', cell: (element: any) => `${element.active}`
      },
      {
        id: 'name', hover: 'Name', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Name', type: '', cell: (element: any) => `${element.name}`
      },
      {
        id: 'id', hover: 'Use this ID to track your creative', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Id', type: '', cell: (element: any) => `${element.id}`
      },
      {
        id: 'icon', hover: 'Check if the media is correct', showROuser: true, showSelectOption: true,
        title: 'Media', type: '', cell: (element: any) => `${element.type}`
      },
      {
        id: 'type', hover: 'Types of creatives allowed' +
        '\n 1. Image' +
        '\n 2. NativeImage (Native to platform)' +
        '\n 3. Native Image (DCO)' +
        '\n 4. Video' +
        '\n 5. Native Video (Native to platform' +
        '\n 6. zipped HTML' +
        '\n 7. zipped HTML (DCO)' +
        '\n 8. zipped HTML (Template)' +
        '\n 9. zipped HTML (Template-DCO)' +
        '\n 10. HTML', 
        showROuser: true, showSelectOption: true, sorting: false,
        // title: 'Type', type: '', cell: (element: any) => `${element.type} ${element.dcoAd ? '(DCO)' : ''}`
        title: 'Type', type: '', cell: (element: any) => `${element.type} ${this.getCreativeType(element)}`
      },
      {
        id: 'size', hover: 'Image: 1200x627,1280x720,1200x800\n' +
        'Native video: 1:1, 16:9, 9:16\n' +
        'Video: Any size (but the video and end card dimension should be same)',
         showROuser: true, showSelectOption: true, sorting: false,
        title: 'Size', type: '', cell: (element: any) => `${element.size.width}x${element.size.height}`
      },
      {
        id: 'creationTime', hover: 'Uploaded On', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Created On', type: '', cell: (element: any) => `${this.commonService.epochToDateFormatter(element.creationTime)}`
      },

      {
        id: 'impressions', hover: 'Count of ads served',
        showROuser: true, showSelectOption: true, sorting: false,
        title: "Imp's", type: '', 
        showToolTip: true,
        cellTooltip: (element: any) => `${element.performanceData && element.performanceData.impressions ?
          this.commonService.nrFormatTooltip(element.performanceData.impressions, AppConstants.NUMBER_TYPE_NOTHING) : 0}`,
        cell: (element: any) => `${element.performanceData && element.performanceData.impressions ?
          this.commonService.nrFormat(element.performanceData.impressions) : 0}`
      },
      {
        id: 'clicks', hover: 'Times clicked by users',
        showROuser: true, showSelectOption: true, sorting: false,
        title: 'Clicks', type: '',
        showToolTip: true,
        cellTooltip: (element: any) => `${element.performanceData && element.performanceData.clicks ?
          this.commonService.nrFormatTooltip(element.performanceData.clicks, AppConstants.NUMBER_TYPE_NOTHING) : 0}`,
        cell: (element: any) => `${element.performanceData && element.performanceData.clicks ?
          this.commonService.nrFormat(element.performanceData.clicks) : 0}`
      },
      {
        id: 'conversions', hover: 'No. of users this creative helped convert',
        showROuser: true, showSelectOption: true, sorting: false,
        title: "Conv's", type: '',
        showToolTip: true,
        cellTooltip: (element: any) => `${element.performanceData && element.performanceData.conversions ?
          this.commonService.nrFormatTooltip(element.performanceData.conversions, AppConstants.NUMBER_TYPE_NOTHING) : 0}`,
        cell: (element: any) => `${element.performanceData && element.performanceData.conversions ?
          this.commonService.nrFormat(element.performanceData.conversions) : 0}`
      },
      {
        id: 'ctr', hover: 'Click Through Ratio (Click Upon Impressions X 100)',
        showROuser: true, showSelectOption: true, sorting: false,
        title: 'CTR', type: '', cell: (element: any) => `${element.performanceData && element.performanceData.ctr ?
          element.performanceData.ctr + '%' : '0%'}`
      },
      {
        id: 'ctc', hover: '(Click Conversions/Clicks)*100\n' +
        'Click to conversion ratio',
        showROuser: true, showSelectOption: true, sorting: false,
        title: 'CTC', type: '', cell: (element: any) => `${element.performanceData && element.performanceData.ctc ?
          element.performanceData.ctc + '%' : '0%'}`
      },
    ];

  }

  getPixelMetrics() {
    const metrics = [
      {
        id: 'action', hover: 'Select', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Select', type: '', cell: (element: any) => `${element.select}`
      },

      // hide edit dropdown for RO
      {
        id: 'dropdown', hover: 'Action', showROuser: false, showSelectOption: true, sorting: false,
        title: 'Action', type: '', cell: (element: any) => `${element.action}`
      },
      {
        id: 'active', hover: 'Status', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Status', type: '', cell: (element: any) => `${element.active}`
      },
      {
        id: 'name', hover: 'Name', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Name', type: '', cell: (element: any) => `${element.name}`
      },
      {
        id: 'id', hover: 'Id', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Id', type: '', cell: (element: any) => `${element.id}`
      },
      // {
      //   id: 'pixelHitCount', hover: 'Number of items the active pixel was fired since its creation',
      //   showROuser: true, showSelectOption: true, sorting: true,
      //   title: 'TIMES FIRED', type: '', cell: (element: any) => `${element.pixelHitCount ? element.pixelHitCount : 0}`
      // },
      {
        id: 'conversions', hover: 'Number of items the active pixel was fired since its creation',
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Times Fired', type: '', cell: (element: any) => `${element.conversions ? element.conversions : 0}`
      },
      {
        id: 'clickValidityWindow', hover: 'The maximum amount of time that can elapse between a clisk and its conversion',
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Max Time', type: '',
        cell: (element: any) => `${element.clickValidityWindow === -1 ? 'No Limit' : (element.clickValidityWindow === 0 ?
          '0 Day' : this.secondsToTimePipe.transform(element.clickValidityWindow))}`
      },
      {
        id: 'userFcap', hover: 'The number of clicks allowed per user in a given time period',
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Count per User', type: '', cell: (element: any) =>
          `${!element.userFcap || element.userFcap === -1 ? 'No Limit' : element.userFcap + ' every ' + (element.fcapDuration === 0 ?
            '0 day' : this.secondsToTimePipe.transform(element.fcapDuration))}`
      },
      {
        id: 'type', hover: 'The type of pixel that monitors converison based on the most recent clisk, view or both',
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Type', type: '', cell: (element: any) => `${this.pixelTypePipe.transform(element.type.name)}`
      },
    ];

    // if RO USER remove the row from the metrics array
    this.entityService.remomveROuserMetrics(metrics);
    return metrics;
  }

  getCatalogMetrics() {
    return [
      {
        id: 'leftPad', hover: '', showROuser: true, showSelectOption: true, sorting: false,
        title: '', type: '', cell: (element: any) => ``
      },
      // {
      //   id: 'action', hover: 'Action', showROuser: true, showSelectOption: true,
      //   title: '', type: '', cell: (element: any) => `${ element.action }`
      // },
      // {
      //   id: 'dropdown', hover: '', showROuser: true, showSelectOption: true,
      //   title: '', type: '', cell: (element: any) => `${ element.dropdown }`
      // },
      {
        id: 'active', hover: 'Active', showROuser: true, showSelectOption: true, sorting: false,
        title: '', type: '', cell: (element: any) => `${element.active}`
      },
      // {
      //   id: 'id', hover: 'Id', showROuser: true, showSelectOption: true,
      //   title: 'Id', type: '', cell: (element: any) => `${ element.id }`
      // },
      {
        id: 'name', hover: AdvConstants.FEED_TOOLTIP_NAME, showROuser: true, showSelectOption: true, sorting: true,
        title: 'Feed Name', type: '', cell: (element: any) => `${element.name}`
      },
      {
        id: 'source', hover: AdvConstants.FEED_TOOLTIP_SOURCE,
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Feed Source', type: '', cell: (element: any) => `${element.source}`
      },
      {
        id: 'updateFrequency', hover: AdvConstants.FEED_TOOLTIP_UPDATED_FREQ,
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Updated Frequency', type: '', cell: (element: any) => `${this.secondsToTimePipe.transform(element.updateFrequency)}`
      },
      {
        id: 'lastUpdated', hover: AdvConstants.FEED_TOOLTIP_LAST_UPDATED,
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Last Updated', type: '', cell: (element: any) => `${this.commonService.epochToDateFormatter(element.lastUpdated)}`
      },
      {
        id: 'updatedStatus', hover: AdvConstants.FEED_TOOLTIP_UPDATED_STATUS,
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Updated Status', type: '', cell: (element: any) => `${element.updatedStatus}`
      },

      {
        id: 'itemsImported', hover: AdvConstants.FEED_TOOLTIP_ITEMS_IMPORTED,
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Items Imported', type: '', cell: (element: any) => `${element.objectsParsed ? element.objectsParsed : 0} / ${element.objectsFound ? element.objectsFound : 0}`
      },

      {
        id: 'successRate', hover: AdvConstants.FEED_TOOLTIP_SUCCESS_RATE,
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Success Rate', type: '', cell: (element: any) => `${element.successRate ? element.successRate + '%' : '0.00%'}`
      },
    ];

  }

  getCatalogDetailsMetrics() {
    return [
      {
        id: 'leftPad', hover: '', showROuser: true, showSelectOption: true, sorting: false,
        title: '', type: '', cell: (element: any) => ``
      },
      {
        id: 'name', hover: '', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Feeds Variables', type: '', cell: (element: any) => `${element.name}`
      },
      {
        id: 'variablePath', hover: '', showROuser: true, showSelectOption: false, sorting: true,
        title: 'Variable Path', type: '', cell: (element: any) => `${element.variablePath}`
      },
      {
        id: 'standardVariable', hover: '',
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Standard Variables', type: '', cell: (element: any) => `${element.standardVariable}`
      },
      {
        id: 'description', hover: 'Name', showROuser: true, showSelectOption: false, sorting: true,
        title: 'Feed Description', type: '', cell: (element: any) => `${element.description}`
      },
      {
        id: 'samples', hover: '',
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Samples', type: '', cell: (element: any) => `${element.samples}`
      }
    ];

  }

  getCatalogDetailsMetricsHeader() {
    const metrics = this.getCatalogDetailsMetrics();
    const options: string[] = [];
    for (const i in metrics) {
      if (metrics[i].showSelectOption === true) {
        options.push(metrics[i].id);
      }
    }
    // console.log('options', options);
    return options;
  }


  activateEntity(entity: string, selectedRowIds: number[]) {
    let idString = this.commonService.convertIdsToCommaSeperatedString(selectedRowIds);
    switch (entity) {
      case AppConstants.ENTITY.PIXEL:
        return this.pixelApiService.activateUsingPOST(idString);
      case AppConstants.ENTITY.AUDIENCE:
        return this.audienceService.activateAudienceUsingPOST(idString);
      case AppConstants.ENTITY.CREATIVE:
        return this.creativeService.activateCreatives(idString);
    }
  }


  deactivateEntity(entity: string, selectedRowIds: number[]) {
    const idString = this.commonService.convertIdsToCommaSeperatedString(selectedRowIds);
    switch (entity) {
      case AppConstants.ENTITY.PIXEL:
        return this.pixelApiService.deactivateUsingPOST(idString);
      case AppConstants.ENTITY.AUDIENCE:
        return this.audienceService.deactivateAudienceUsingPOST(idString);
      case AppConstants.ENTITY.CREATIVE:
        return this.creativeService.deactivateCreatives(idString);
    }
  }


  getAudienceMetrics() {
    return [
      {
        id: 'action', hover: 'Select', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Select', type: '', cell: (element: any) => `${element.select}`
      },
      // {
      //   id: 'dropdown', hover: 'Action', showROuser: true, showSelectOption: true, sorting: false,
      //   title: 'Action', type: '', cell: (element: any) => `${element.action}`
      // },
      {
        id: 'active', hover: 'Status', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Status', type: '', cell: (element: any) => `${element.active}`
      },
      {
        id: 'name', hover: 'Name', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Name', type: '', cell: (element: any) => `${element.name}`
      },
      {
        id: 'id', hover: 'Id', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Id', type: '', cell: (element: any) => `${element.id}`
      },

      //disabled sorting on advertiser name
      {
        id: 'advertiserName', hover: 'Advertiser Name', showROuser: true, showSelectOption: true, sorting: false,
        title: 'Advertiser Name', type: '', cell: (element: any) => `${element.advertiserName}`
      },

      //for sorting on advertiser id
      {
        id: 'advertiserId', hover: 'Advertiser Id', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Advertiser Id', type: '', cell: (element: any) => `${element.advertiserId}`
      },
      {
        id: 'totalUU', hover: 'Total Unique Users', showROuser: true, showSelectOption: true, sorting: true,
        title: 'Total Unique Users', type: '',
        // cell: (element: any) => `${element.totalUU ? element.totalUU : 0}`
        showToolTip: true,
        cellTooltip: (element: any) => `${element.totalUU ? this.commonService.nrFormatTooltip(element.totalUU, AppConstants.NUMBER_TYPE_NOTHING) : 0}`,
        cell: (element: any) => `${element.totalUU ? this.commonService.nrFormat(element.totalUU, AppConstants.NUMBER_TYPE_NOTHING) : 0}`
      },
      {
        id: 'dailyUU', hover: 'Daily Unique Users',
        showROuser: true, showSelectOption: true, sorting: true,
        title: 'Daily Unique Users', type: '',
        // cell: (element: any) => `${element.dailyUU ? element.dailyUU : 0}`
        showToolTip: true,
        cellTooltip: (element: any) => `${element.dailyUU ? this.commonService.nrFormatTooltip(element.dailyUU, AppConstants.NUMBER_TYPE_NOTHING) : 0}`,
        cell: (element: any) => `${element.dailyUU ? this.commonService.nrFormat(element.dailyUU, AppConstants.NUMBER_TYPE_NOTHING) : 0}`

      },
    ];

  }

  getCreativeType(element) {
    // title: 'Type', type: '', cell: (element: any) => `${element.type} ${element.dcoAd ? '(DCO)' : ''}`
    if(element.dcoAd) {
      return element.templateBased ? '(Template-DCO)' : '(DCO)';
    }
    return element.templateBased ? '(Template)' : '';
  }


}
