import { Injectable } from '@angular/core';

import { ApiResponseObjectSlicexListResponse, DashboardFilters, SlicexGridData } from '@revxui/api-client-ts';
// import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { CommonService } from '@app/shared/_services/common.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { SlicexDateRange } from '@app/entity/report/_components/slicex/slicex.component';
import { SlicexCommonService } from './slicex-common.service';
import { cloneDeep } from 'lodash';

export interface ListData {
  id: number;
  name: string;
  value: string;
  valueRaw: string;
  valueCompare: string;
  changeFactor: number;
  checked: boolean;
}

export interface RawListData {
  entity: string;
  displayName: string;
  orderMetric: string;
  data: SlicexGridData[];
  listData: ListData[];
}

export interface GridOptions {
  entity: string;
  entityDisplayName: string;
  data: SlicexGridData[];
  orderMetric: string;
  orderMetricUnit: string;
  order: 'ASC' | 'DESC';
  isCompareEnabled?: boolean;
  selections: number[];
}

enum ENTITY {
  LICENSEE = 'licensee',
  ADVERTISER = 'advertiser',
  CAMPAIGN = 'campaign',
  STRATEGY = 'strategy',
  CREATIVESIZE = 'creativeSize',
  AGGREGATOR = 'aggregator',
  APP = 'app',
  OS = 'os',
  CREATIVE = 'creative',
  COUNTRY = 'country',
  PRICING = 'pricing',
  CAMPAIGNOBJECTIVE = 'campaignObjective',
}

const LIST_DISPLAY_LIMIT = 10;

@Injectable({
  providedIn: 'root'
})
export class SlicexListService {

  private rawEntityListData: Map<string, RawListData> = new Map<string, RawListData>();
  public onDateRangeSet = new Subject<{ dateRange: SlicexDateRange }>();
  private entityReqMap: any = {};

  public onEntitySelectionChange = new Subject<{ entity: string, entityID: number, entityValue: string, checked: boolean }>();
  public onUpdateEntitySelection = new Subject<{ entity: string, selections: number[] }>();
  public onClearEntitySelection = new Subject<{ entity: string, entityID: number }>();
  public onEntityExpand = new Subject<{ entity: string, isExpanded: boolean }>();
  public onEntityGridDetailsOpen = new Subject<{
    entity: string, sortOrder: 'ASC' | 'DESC',
    data: SlicexGridData[], selections: number[], orderMetric: string
  }>();
  public onEntityGridDetailsForceExpand = new Subject<{
    entity: string, sortOrder: 'ASC' | 'DESC',
    data: SlicexGridData[], selections: number[], orderMetric: string
  }>();
  public onEntityGridDetailsClose = new Subject<{ entity: string, selection: SlicexGridData[], selectionChanged: boolean }>();
  public onEntityGridDataExport = new Subject<{ entity: string }>();
  public onFiltersUpdated = new Subject<{ breadcrumbs: any, filters: DashboardFilters[] }>();
  public onSortEntityData = new Subject<{ entity: string, metric: string, sortOrder: string, updateGridData: boolean }>();

  private isDateRangeValid = true;
  validationMessage = '';

  constructor(
    // private http: HttpClient,
    private commonService: CommonService,
    private slicexCommonService: SlicexCommonService
  ) { }

  /**
   * GETTER - returns the raw data as obtained by calling getSlicexDataListUsingPOST method from SliceXControllerService
   */
  public getRawEntityListData() {
    return (this.rawEntityListData !== null && this.rawEntityListData !== undefined) ?
      this.rawEntityListData : null;
  }

  /**
   * SETTER - sets the raw data as obtained by calling getSlicexDataListUsingPOST method from SliceXControllerService
   * @param data : array of SlicexGridData
   */
  public setRawEntityListData(data: Map<string, RawListData>) {
    this.rawEntityListData = data;
  }

  /**
   *
   * @param entity
   */
  public getEntityENUM(entity: string) {
    for (const key in ENTITY) {
      if (ENTITY[key] === entity) {
        return ENTITY[key];
      }
    }
  }

  // /**
  //  * TEST only
  //  * @param entitty
  //  * @param req
  //  * @param sort
  //  * @param token
  //  */
  // public getSlicexDataListUsingPOST(entity, requestId, req, sortparam, tokenparam) {
  //   return this.http.post('http://localhost:10045/v2/api/slicex/list/' + entity,
  //     req, {
  //     headers: {
  //       accept: 'application/json',
  //       token: tokenparam,
  //       reqId: requestId,
  //     },
  //     params: {
  //       sort: sortparam
  //     }
  //   });
  // }

  // public getSlicexDataListForExportUsingPOST(entity, req, sortparam, tokenparam) {
  //   return this.http.post('http://localhost:10045/v2/api/slicex/list/csv/' + entity,
  //     req, {
  //     headers: {
  //       accept: 'application/json',
  //       token: tokenparam,
  //     },
  //     params: {
  //       sort: sortparam
  //     }
  //   });
  // }

  public initListData(entities: any) {
    const entityDataFormatted: any = {};
    Object.keys(entities).forEach(key => {
      entityDataFormatted[key] = {
        entity: key,
        displayName: entities[key],
        data: [],
        listData: []
      };
    });
    this.setRawEntityListData(entityDataFormatted);
    return entityDataFormatted;
  }

  public prepareData(apiResponse: ApiResponseObjectSlicexListResponse, metric: string, metricDetails: any, currEntity?: string) {

    if (!apiResponse.error && apiResponse.respObject !== null && apiResponse.respObject !== undefined
      && apiResponse.respObject.totalNoOfRecords > 0) {
      const entity: string = this.entityReqMap[apiResponse.respId];
      const entityData: RawListData = this.getRawEntityListData()[entity];

      const updateData: boolean = (currEntity) ? (currEntity === entity) ? false : true : true;

      entityData.data = (updateData) ? apiResponse.respObject.data : entityData.data;
      entityData.orderMetric = metric;
      entityData.listData = this.prepareListData(apiResponse.respObject.data// .slice(0, LIST_DISPLAY_LIMIT),
        , metric, metricDetails);

      return entityData;
    }
    return null;
  }

  /**
   *
   * @param metric
   */
  public prepareListData(list: SlicexGridData[], metric: string, metricDetails: any) {
    const listData: ListData[] = list.map((data: SlicexGridData) => {
      const percentChange = this.computeChange(data.compareToValue, data[metric]);
      const changeFact = (!percentChange) ? 0 : percentChange > 0 ? 1 : -1;

      const obj: ListData = {
        id: data.id,
        name: data.name,
        value: this.commonService.nrFormatWithCurrency(data[metric], metricDetails.type, data.currencyId),
        valueRaw: this.formatNumber(data[metric], metricDetails.type, data.currencyId),
        valueCompare: (percentChange) ?
          this.commonService.nrFormatWithCurrency(percentChange, AppConstants.NUMBER_TYPE_PERCENTAGE, data.currencyId) :
          this.commonService.nrFormatWithCurrency(0, AppConstants.NUMBER_TYPE_PERCENTAGE, data.currencyId),
        changeFactor: changeFact,
        checked: false
      };
      return obj;
    });


    return listData;
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

  // public prepareGridData() {
  //   return null;
  // }

  public changeDisplayMetric(metric: string, metricDetails: any, activeEntitiesList: string[], sortOrder?: 'ASC' | 'DESC') {
    const entityDataList: any = Object.assign({}, this.getRawEntityListData());
    Object.keys(entityDataList).forEach((key: string) => {
      if (activeEntitiesList.indexOf(key) !== -1) {
        const ids: number[] = entityDataList[key].listData.map(item => item.id);
        const data: SlicexGridData[] = entityDataList[key].data
          .filter(item => ids.indexOf(item.id) !== -1)
          .sort((item1, item2) => {
            if (sortOrder === null || sortOrder === undefined) {
              return item2[metric] - item1[metric];
            } else {
              return (sortOrder === 'DESC') ? item2[metric] - item1[metric] : item1[metric] - item2[metric];
            }
          });
        entityDataList[key] = { ...entityDataList[key], orderMetric: metric };
        entityDataList[key].listData = data// .slice(0, LIST_DISPLAY_LIMIT)
          .map((item: SlicexGridData) => {
            const percentChange = this.computeChange(item.compareToValue, item[metric]);
            const changeFact = (!percentChange) ? null : percentChange > 0 ? 1 : -1;

            return {
              id: item.id,
              name: item.name,
              value: this.commonService.nrFormatWithCurrency(item[metric], metricDetails.type, item.currencyId),
              valueRaw: this.formatNumber(item[metric], metricDetails.type, item.currencyId),
              valueCompare: (percentChange) ? this.commonService.nrFormatWithCurrency(percentChange,
                AppConstants.NUMBER_TYPE_PERCENTAGE, item.currencyId) : null,
              changeFactor: changeFact,
              checked: false
            };

          });
      } else {
        entityDataList[key] = {
          ...entityDataList[key],
          listData: [],
          data: []
        };
      }
    });
    return entityDataList;

  }

  public updateEntityRequestMap(entity: string) {
    const id = this.guid();
    this.entityReqMap[id] = entity;
    return id;
  }

  public setValidationMessage(msg: string) {
    this.validationMessage = msg;
  }

  public getValidationMessage() {
    return this.validationMessage;
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

  public guid() {
    // function s4() {
    //   return Math.floor((1 + Math.random()) * 0x10000)
    //     .toString(16)
    //     .substring(1);
    // }
    // return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    //   s4() + '-' + s4() + s4() + s4();
    return this.commonService.getReqID();
  }

  public onEntitySelectionChanged(inpEntity: string, inpEntityID: number, inpEntityValue: string, inpChecked: boolean) {
    this.onEntitySelectionChange.next({
      entity: inpEntity,
      entityID: inpEntityID,
      entityValue: inpEntityValue,
      checked: inpChecked
    });
  }

  public onEntityExpanded(inpEntity: string, inpIsExpanded: boolean) {
    this.onEntityExpand.next({ entity: inpEntity, isExpanded: inpIsExpanded });
  }

  public onOpenEntityGridDetails(
    inpEntity: string, inpSortOrder: 'ASC' | 'DESC', inpData: SlicexGridData[],
    inpListSelections: number[], metric: string) {

    this.onEntityGridDetailsOpen.next({
      entity: inpEntity,
      sortOrder: inpSortOrder,
      data: inpData,
      selections: inpListSelections,
      orderMetric: metric
    });
  }

  public onForceExpandEntityGridDetails(
    inpEntity: string, inpSortOrder: 'ASC' | 'DESC', inpData: SlicexGridData[],
    inpListSelections: number[], metric: string) {

    this.onEntityGridDetailsForceExpand.next({
      entity: inpEntity,
      sortOrder: inpSortOrder,
      data: inpData,
      selections: inpListSelections,
      orderMetric: metric
    });
  }

  public onCloseEntityGridDetails(inpEntity: string, rowSelection: SlicexGridData[], inpSelectionChanged: boolean) {
    this.onEntityGridDetailsClose.next({
      entity: inpEntity,
      selection: rowSelection,
      selectionChanged: inpSelectionChanged
    });
  }

  public onUpdateEntitySelections(inpEntity: string, rowSelections: SlicexGridData[]) {
    this.onUpdateEntitySelection.next({
      entity: inpEntity,
      selections: rowSelections.map(row => row.id)
    });
  }

  public onEntitySelectionClear(inpEntity: string, inpEntityID: number) {
    this.onClearEntitySelection.next({
      entity: inpEntity,
      entityID: inpEntityID
    });
  }

  public onExportEntityGridData(inpEntity: string) {
    this.onEntityGridDataExport.next({ entity: inpEntity });
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
    ftrs = cloneDeep(this.slicexCommonService.getFilters(inpBreadcrums));
    this.onFiltersUpdated.next({ breadcrumbs: inpBreadcrums, filters: ftrs });
  }

  public sortEntityData(inpEntity: string, inpMetric: string, inpSortOrder: string, inpUpdateGridData?: boolean) {
    this.onSortEntityData.next({
      entity: inpEntity,
      metric: inpMetric,
      sortOrder: inpSortOrder,
      updateGridData: (inpUpdateGridData) ? inpUpdateGridData : true
    });
  }

  computeChange(v1: number, v2: number) {
    // if (!v1 || !v2 || v1 === 0 || v2 === 0) {
    //   return null;
    // }

    // return ((v2 - v1) / v1) * 100;
    return this.slicexCommonService.computeChange(v1, v2);
  }

  /**
   * Method to get the entity based on the response. A Map is maintained with ReqId to Entity Mapping
   * @param apiResponse - api response
   */
  getEntityFromResponse(apiResponse: ApiResponseObjectSlicexListResponse) {

    if (apiResponse && apiResponse.respId) {
      return this.entityReqMap[apiResponse.respId];
    }

    return null;
  }

}
