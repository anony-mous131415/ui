import { AfterViewInit, Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { SlicexDateRange } from '@app/entity/report/_components/slicex/slicex.component';
import { ENTITIES, METRICS } from '@app/entity/report/_services/slicex-chart.service';
import { SlicexDatePickerService } from '@app/entity/report/_services/slicex-date-picker.service';
import { GridOptions, RawListData, SlicexListService } from '@app/entity/report/_services/slicex-list.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import {
  ApiResponseObjectSlicexListResponse,
  DashboardFilters,
  Duration, SliceXControllerService, SlicexRequest
} from '@revxui/api-client-ts';
import * as moment from 'moment';
import { from, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const DATE_PICKER_PRIMARY = 'primary';
const DATE_PICKER_COMPARE = 'compare';

const SORT_ORDER_DESC: string = '-';
const SORT_ORDER_ASC: string = '+';

//REVX-629 : undefined in slicex request
const DEFAULT_SORT_METRIC: string = 'revenue';


@Component({
  selector: 'app-slicex-list-container',
  templateUrl: './slicex-list-container.component.html',
  styleUrls: ['./slicex-list-container.component.scss']
})
export class SlicexListContainerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  // @Input() isCompareEnabled: boolean = false;
  // @Input() date: DateRange = this.drpService.getDateRange(7, 1);
  // @Input() compareDate: DateRange = this.drpService.getDateRange(14, 8);
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onError: EventEmitter<{ isError: boolean, errorMsg: string }> = new EventEmitter();
  @Output() onGridOptionsChange: EventEmitter<GridOptions> = new EventEmitter();

  dateRangeSubscription: Subscription;
  entitySelectionSubscription: Subscription;
  entityExpandSubscription: Subscription;
  gridDetailsOpenSubscription: Subscription;
  gridDetailsForceExpandSubscription: Subscription;
  gridDetailsCloseSubscription: Subscription;
  gridExportSubscription: Subscription;
  filterUpdateSubscription: Subscription;
  sortEntityDataSubscription: Subscription;

  listData: Map<string, RawListData> = new Map<string, RawListData>();

  ddMetrics = [];
  ddEntities = {};

  selEntityMetric = 'revenue';
  sortOrder = SORT_ORDER_DESC;
  activeEntitiesList: string[] = [];
  entityReqMap: any = {};

  progressBar: any = {};

  authToken: string = null;
  reqList: SlicexRequest = {
    compareToDuration: null,
    duration: {
      startTimeStamp: null,
      endTimeStamp: null
    },
    filters: [],
    groupBy: 'daily'
  };
  showGridView = true;
  gridParams: any = null;
  showGridDetails = false;

  col1Entities: any[] = ['licensee', 'advertiser', 'campaign', 'strategy', 'creative', 'campaignObjective', 'advregions'];
  col2Entities: any[] = ['creativeSize', 'aggregator', 'app', 'os', 'country', 'pricing'];

  dateRange: SlicexDateRange;
  isCompareEnabled = false;

  constructor(
    private apiService: SliceXControllerService,
    private listService: SlicexListService,
    private drpService: SlicexDatePickerService
  ) { }

  //#region Lifecycle hooks
  ngOnInit() {
    Object.keys(this.filterEntitiesBasedOnRole(ENTITIES)).forEach((key: string) => {
      this.ddEntities[key] = ENTITIES[key].display_name;
      this.progressBar[key] = false;
    });

    this.ddMetrics = Object.keys(this.filterMetricsBasedOnRole(METRICS)).map((key: string) => {
      return { id: key, title: METRICS[key].display_name };
    });

    this.col1Entities = this.filterListColumnBasedOnRole(this.col1Entities);

    this.authToken = this.getAuthToken();
  }

  ngAfterViewInit() {

    // const last7days = this.drpService.getDateRange(7, 1);
    // const duration = {
    //   startTimeStamp: last7days.startDateEpoch,
    //   endTimeStamp: last7days.endDateEpoch
    // };

    // this.reqList.duration = duration;

    // this.activeEntitiesList = Object.keys(this.filterEntitiesBasedOnRole(ENTITIES))
    //   .slice(0, 4).map(ent => this.listService.getEntityENUM(ent));

    this.activeEntitiesList = this.col1Entities.slice(0, 2).map(ent => this.listService.getEntityENUM(ent));
    this.activeEntitiesList.push(...this.col2Entities.slice(0, 2).map(ent => this.listService.getEntityENUM(ent)));

    this.listData = this.listService.initListData(this.ddEntities);
    // this.getListDataInit(this.activeEntitiesList, this.reqList, this.selEntityMetric + this.sortOrder);

    this.subscribeToEvents();
  }

  ngOnDestroy() {
    this.dateRangeSubscription.unsubscribe();
    this.entitySelectionSubscription.unsubscribe();
    this.entityExpandSubscription.unsubscribe();
    this.gridDetailsOpenSubscription.unsubscribe();
    this.gridDetailsForceExpandSubscription.unsubscribe();
    this.gridDetailsCloseSubscription.unsubscribe();
    this.gridExportSubscription.unsubscribe();
    this.filterUpdateSubscription.unsubscribe();
    this.sortEntityDataSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.dateRange !== null && changes.dateRange !== undefined && !changes.dateRange.isFirstChange) {
    //   this.dateRange = changes.dateRange.currentValue;
    //   this.onCompareChange();
    // }
    // if (changes.compareDate !== null && changes.compareDate !== undefined) {
    //   this.compareDate = changes.compareDate.currentValue;
    // }

  }
  //#endregion

  //#region getters
  get list() {
    return Object.keys(this.listData);
  }
  //#endregion

  //#region subscriptions
  private subscribeToEvents() {
    this.dateRangeSubscription = this.listService.onDateRangeSet.subscribe(
      param => this.handleDateRangeChange(param));

    this.entitySelectionSubscription = this.listService.onEntitySelectionChange
      .subscribe(param => this.handleEntitySelections(param));

    this.entityExpandSubscription = this.listService.onEntityExpand
      .subscribe(param => this.handleEntityExpansion(param));

    this.gridDetailsCloseSubscription = this.listService.onEntityGridDetailsClose.subscribe(
      param => this.handleGridDetailsClose(param));

    this.gridExportSubscription = this.listService.onEntityGridDataExport.subscribe(
      param => this.handleGridDataExport(param));

    this.filterUpdateSubscription = this.listService.onFiltersUpdated.subscribe(
      param => this.handleFilterUpdate(param));

    this.sortEntityDataSubscription = this.listService.onSortEntityData.subscribe(
      param => this.handleEntityDataSort(param));

    this.gridDetailsOpenSubscription = this.listService.onEntityGridDetailsOpen.subscribe(
      param => this.handleGridDetailsOpen(param));

    this.gridDetailsForceExpandSubscription = this.listService.onEntityGridDetailsForceExpand.subscribe(
      param => this.handleGridDetailsForceExpand(param));
  }
  //#endregion

  //#region UI event handlers
  onEntityMetricSelectionChanged(event) {
    if (event.isUserInput) {
      this.selEntityMetric = event.source.value;
      if (!this.isCompareEnabled) {
        this.listData = this.listService.changeDisplayMetric(event.source.value,
          METRICS[event.source.value], this.activeEntitiesList, this.sortOrder === SORT_ORDER_DESC ? 'DESC' : 'ASC');
      } else {
        this.listData = this.listService.initListData(this.ddEntities);
        this.getListDataInit(this.activeEntitiesList, this.reqList,
          event.source.value + this.sortOrder);
      }
    }
  }

  toggleView(type: number) {
    switch (type) {
      case 1:
        this.showGridView = true;
        break;
      case 2:
        this.showGridView = false;
        break;
    }
  }

  isActiveEntity(entity: string) {
    return this.activeEntitiesList.findIndex(item => item === entity) === -1 ? false : true;
  }
  //#endregion

  //#region private methods
  private getAuthToken() {
    return localStorage.getItem(AppConstants.CACHED_TOKEN) ?
      localStorage.getItem(AppConstants.CACHED_TOKEN) : localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
  }

  private getListDataInit(entities: string[], req: SlicexRequest, sort: string, currEntity?: string, emitGridChanges?: boolean) {
    let isValid = 'false';
    let message: string = null;
    [isValid, message] = this.validateRequest(req);

    //REVX-629 : undefined in slicex request
    sort = (sort && sort.length) ? sort : DEFAULT_SORT_METRIC.concat(SORT_ORDER_DESC);

    if (isValid === 'true') {
      entities.forEach(entity => this.progressBar[entity] = true);
      // fork merge
      from(entities).pipe(
        mergeMap((ent: any) => {
          const reqID = this.listService.updateEntityRequestMap(ent);
          return this.apiService.getSlicexDataListUsingPOST(ent, req, reqID,
            sort, this.getAuthToken());
          // return this.listService.getSlicexDataListUsingPOST(ent, reqID, req,
          //   sort, this.getAuthToken());
        })
      ).subscribe(
        (result: ApiResponseObjectSlicexListResponse) => {
          if (result !== null && result !== undefined) {
            this.prepareListData(result, currEntity, emitGridChanges);
          }
        }, error => {
          entities.forEach(entity => this.progressBar[entity] = false);
        });
    } else {
      if (message !== null) {
        this.onError.emit({
          isError: true,
          errorMsg: message
        });
      }
    }
  }

  private getListData(entity: any, req: SlicexRequest, sort: string) {
    let isValid = 'false';
    let message: string = null;
    [isValid, message] = this.validateRequest(req);

    //REVX-629 : undefined in slicex request
    sort = (sort && sort.length) ? sort : DEFAULT_SORT_METRIC.concat(SORT_ORDER_DESC);;

    if (isValid === 'true') {
      this.progressBar[entity] = true;

      const reqID = this.listService.updateEntityRequestMap(entity);
      this.apiService.getSlicexDataListUsingPOST(entity, req, reqID,
        sort, this.getAuthToken())
        .subscribe((result: ApiResponseObjectSlicexListResponse) => {
          if (result !== null && result !== undefined) {
            this.prepareListData(result);
            this.orderListData();
            this.progressBar[entity] = false;
          }
        }, error => {
          this.handleError(error, entity);
        });
    } else {
      if (message !== null) {
        this.onError.emit({
          isError: true,
          errorMsg: message
        });
      }
    }
  }

  private forceExpandEntityGridDetails(param: any, entity: any, req: SlicexRequest, sort: string) {

    this.progressBar[entity] = true;

    //REVX-629 : undefined in slicex request
    sort = (sort && sort.length) ? sort : DEFAULT_SORT_METRIC.concat(SORT_ORDER_DESC);

    const reqID = this.listService.updateEntityRequestMap(entity);
    this.apiService.getSlicexDataListUsingPOST(entity, req, reqID,
      sort, this.getAuthToken())
      .subscribe((result: ApiResponseObjectSlicexListResponse) => {
        if (result !== null && result !== undefined) {
          this.prepareListData(result);
          this.orderListData();
          this.progressBar[entity] = false;

          this.listService.onOpenEntityGridDetails(entity, param.sortOrder, this.listData[entity].data,
            param.selections, param.orderMetric);
        }
      }, error => {
        this.handleError(error, entity);
      });
  }

  private handleError(error: any, entity: any) {
    const entityIndex = this.activeEntitiesList.indexOf(entity);
    this.activeEntitiesList = entityIndex > -1
      ? this.activeEntitiesList.splice(entityIndex, 1) : this.activeEntitiesList;
    this.progressBar[entity] = false;
  }

  private prepareListData(result: ApiResponseObjectSlicexListResponse, currEntity?: string, emitGridChanges?: boolean) {
    const entityData: RawListData = this.listService.prepareData(result, this.selEntityMetric,
      METRICS[this.selEntityMetric], currEntity);

    const respEntity: string = this.listService.getEntityFromResponse(result);
    if (respEntity) {
      this.progressBar[respEntity] = false;
    }

    if (entityData) {
      this.listData[entityData.entity] = Object.assign({}, entityData);

      if (this.gridParams !== null && this.showGridDetails && this.gridParams.entity === entityData.entity) {
        const gridOptions: GridOptions = {
          entity: this.gridParams.entity,
          entityDisplayName: ENTITIES[this.gridParams.entity].display_name,
          data: entityData.data,
          orderMetric: this.selEntityMetric,
          orderMetricUnit: METRICS[this.selEntityMetric].type,
          order: this.sortOrder === '+' ? 'ASC' : 'DESC',
          isCompareEnabled: this.dateRange.isCompareEnabled,
          selections: this.gridParams.selections
        };
        if (emitGridChanges) {
          this.onGridOptionsChange.emit(gridOptions);
        }
      }
    } else {
      const tempData = { ...this.listData[respEntity] };
      tempData.data = [];
      tempData.listData = [];
      this.listData[respEntity] = Object.assign({}, tempData);
    }
  }

  private handleDateRangeChange(param) {
    this.dateRange = param.dateRange;
    this.onCompareChange();
  }

  // private handleDateRangeChange(dateRange: DateRange, isCompareDatePicker: boolean) {
  //   const duration = {
  //     startTimeStamp: dateRange.startDateEpoch,
  //     endTimeStamp: dateRange.endDateEpoch
  //   };
  //   if (isCompareDatePicker) {
  //     if (this.isCompareEnabled) {
  //       this.reqList.compareToDuration = duration;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     this.reqList.duration = duration;
  //     const period = this.getDatePeriod(duration);
  //     if (period >= 30) {
  //       this.isCompareEnabled = false;
  //       this.reqList.compareToDuration = null;
  //     }
  //     if (!this.isCompareEnabled) {
  //       this.getListDataInit(this.activeEntitiesList, this.reqList,
  //         this.selEntityMetric + this.sortOrder);
  //     } else {
  //       return false;
  //     }
  //   }
  // }

  private handleEntitySelections(param: any) {
    let filters: DashboardFilters[] = this.reqList.filters;
    let makeAPIRequest = false;
    if (param.checked) {
      const paramExists: boolean = filters.filter(item => item.column === param.entity
        && item.value === param.entityID.toString()).length > 0;

      if (!paramExists) {
        makeAPIRequest = true;
        filters.push({
          column: param.entity,
          value: param.entityID.toString()
        });
      }
    } else {
      makeAPIRequest = true;
      filters = filters.filter(item => {
        return !(item.column === param.entity && item.value.toString() === param.entityID.toString());
      });

      this.listService.onEntitySelectionClear(param.entity, param.entityID);
    }

    if (makeAPIRequest) {
      this.reqList.filters = filters;
      this.getListDataInit(this.activeEntitiesList// .filter(item => item !== param.entity),
        , this.reqList, this.selEntityMetric + this.sortOrder, param.entity);
    }
  }

  private handleEntityExpansion(param) {
    if (param.isExpanded) {
      if (this.activeEntitiesList.indexOf(param.entity) === -1) {
        this.activeEntitiesList.push(param.entity);
        this.getListData(param.entity, this.reqList, this.selEntityMetric + this.sortOrder);
      }
    } else {
      const index = this.activeEntitiesList.indexOf(param.entity);
      this.activeEntitiesList.splice(index, 1);
      this.listData[param.entity] = {
        ...this.listData[param.entity],
        listData: [],
        data: []
      };
      this.orderListData();
    }
  }

  private handleGridDetailsOpen(param: any) {
    this.gridParams = param;
    this.showGridDetails = true;

    const filters = this.reqList.filters.filter(item => item.column !== param.entity);
    const req = { ...this.reqList };
    req.filters = filters;

    //REVX-629 : undefined in slicex request
    let localOrderMetric: string = (param && param.orderMetric) ? param.orderMetric : DEFAULT_SORT_METRIC;
    let direction = (param && param.sortOrder === 'DESC') ? SORT_ORDER_DESC : SORT_ORDER_ASC;
    let sortString = localOrderMetric.concat(direction);

    this.progressBar[param.entity] = true;
    this.apiService.getSlicexDataListUsingPOST(param.entity, req, this.listService.guid(),
      sortString, this.getAuthToken())
      .subscribe((result: ApiResponseObjectSlicexListResponse) => {
        if (result !== null && result !== undefined) {
          this.progressBar[param.entity] = false;
          const entityData: RawListData = {
            entity: param.entity,
            displayName: ENTITIES[param.entity].display_name,
            orderMetric: localOrderMetric,
            data: result.respObject.data,
            listData: this.listService.prepareListData(result.respObject.data, localOrderMetric, METRICS[localOrderMetric])
          };

          if (entityData) {
            if (this.gridParams !== null && this.showGridDetails && this.gridParams.entity === entityData.entity) {
              const gridOptions: GridOptions = {
                entity: this.gridParams.entity,
                entityDisplayName: ENTITIES[entityData.entity].display_name,
                data: entityData.data,
                orderMetric: entityData.orderMetric,
                orderMetricUnit: METRICS[entityData.orderMetric].type,
                order: this.sortOrder === '+' ? 'ASC' : 'DESC',
                isCompareEnabled: this.dateRange.isCompareEnabled,
                selections: this.gridParams.selections
              };
              this.onGridOptionsChange.emit(gridOptions);
            }
          }

        }
      }, error => {
        this.progressBar[param.entity] = false;
        // console.log('[handleGridDetailsOpen][getSlicexDataListUsingPOST] ERROR', error);
      });

  }


  private handleGridDetailsForceExpand(param: any) {
    if (this.activeEntitiesList.indexOf(param.entity) === -1) {
      this.activeEntitiesList.push(param.entity);
      this.forceExpandEntityGridDetails(param, param.entity, this.reqList, this.selEntityMetric + this.sortOrder);
    }
  }

  private handleGridDetailsClose(param) {
    this.showGridDetails = false;
    if (param.selectionChanged) {
      // remove all the filters with the column = param.entity
      const filters: DashboardFilters[] = this.reqList.filters.filter(item => (item.column !== param.entity));
      filters.push(...param.selection.map(item => {
        return {
          column: param.entity,
          value: item.id
        };
      }));
      this.reqList.filters = filters;
      this.getListDataInit(this.activeEntitiesList // .filter(item => item !== param.entity),
        , this.reqList, this.selEntityMetric + this.sortOrder, param.entity, false);
    }
  }

  private handleGridDataExport(param) {
    this.apiService.getSlicexListDataForExportUsingPOST(param.entity, this.reqList,
      null, this.selEntityMetric + this.sortOrder, this.getAuthToken())
      .subscribe(
        (resp: any) => {
          if (resp !== null && resp.fileDownloadUrl !== null) {
            const fileUrl = resp.fileDownloadUrl;
            const link = document.createElement('a');
            link.href = fileUrl;
            link.click();
          }
        }, err => {
          // console.log('[EXPORT] ERROR', err);
        }
      );
  }

  private handleFilterUpdate(param: any) {
    this.reqList.filters = [];
    this.reqList.filters.push(...param.filters);
    this.getListDataInit(this.activeEntitiesList, this.reqList, this.selEntityMetric + this.sortOrder);
  }

  private handleEntityDataSort(param) {
    this.selEntityMetric = param.metric;
    this.sortOrder = param.sortOrder === 'desc' ? SORT_ORDER_DESC : SORT_ORDER_ASC;
    this.getListDataInit(this.activeEntitiesList, this.reqList, this.selEntityMetric + this.sortOrder);

    const filters = this.reqList.filters.filter(item => item.column !== param.entity);
    const req = { ...this.reqList };
    req.filters = filters;

    //REVX-629 : undefined in slicex request
    let localOrderMetric: string = (param && param.orderMetric) ? param.orderMetric : DEFAULT_SORT_METRIC;
    let direction = (param && param.sortOrder === 'DESC') ? SORT_ORDER_DESC : SORT_ORDER_ASC;
    let sortString = localOrderMetric.concat(direction);

    this.apiService.getSlicexDataListUsingPOST(param.entity, req, this.listService.guid(),
      sortString, this.getAuthToken())
      .subscribe((result: ApiResponseObjectSlicexListResponse) => {
        if (result !== null && result !== undefined) {

          const entityData: RawListData = {
            entity: param.entity,
            displayName: ENTITIES[param.entity].display_name,
            orderMetric: localOrderMetric,
            data: result.respObject.data,
            listData: this.listService.prepareListData(result.respObject.data, localOrderMetric, METRICS[localOrderMetric])
          };

          if (entityData) {
            if (this.gridParams !== null && this.showGridDetails && this.gridParams.entity === entityData.entity) {
              const gridOptions: GridOptions = {
                entity: this.gridParams.entity,
                entityDisplayName: ENTITIES[entityData.entity].display_name,
                data: entityData.data,
                orderMetric: entityData.orderMetric,
                orderMetricUnit: METRICS[entityData.orderMetric].type,
                order: this.sortOrder === '+' ? 'ASC' : 'DESC',
                isCompareEnabled: this.dateRange.isCompareEnabled,
                selections: this.gridParams.selections
              };
              this.onGridOptionsChange.emit(gridOptions);
            }
          }

        }
      }, error => {
      });
  }

  private orderListData() {
    const expandedEntitiesCol1: string[] = [];
    const collapsedEntitiesCol1: string[] = [];

    const expandedEntitiesCol2: string[] = [];
    const collapsedEntitiesCol2: string[] = [];

    this.col1Entities.forEach(item => {
      this.listData[item].listData.length === 0 ? collapsedEntitiesCol1.push(item) : expandedEntitiesCol1.push(item);
    });
    this.col2Entities.forEach(item => {
      this.listData[item].listData.length === 0 ? collapsedEntitiesCol2.push(item) : expandedEntitiesCol2.push(item);
    });

    expandedEntitiesCol1.sort((e1, e2) => {
      return ENTITIES[e1].priority - ENTITIES[e2].priority;
    });

    expandedEntitiesCol2.sort((e1, e2) => {
      return ENTITIES[e1].priority - ENTITIES[e2].priority;
    });

    collapsedEntitiesCol1.sort((e1, e2) => {
      return ENTITIES[e1].priority - ENTITIES[e2].priority;
    });

    collapsedEntitiesCol2.sort((e1, e2) => {
      return ENTITIES[e1].priority - ENTITIES[e2].priority;
    });

    this.col1Entities = [];
    this.col1Entities.push(...expandedEntitiesCol1);
    this.col1Entities.push(...collapsedEntitiesCol1);
    this.col2Entities = [];
    this.col2Entities.push(...expandedEntitiesCol2);
    this.col2Entities.push(...collapsedEntitiesCol2);
  }

  private onCompareChange() {
    // if (!this.isCompareEnabled) {
    //   this.reqList.compareToDuration = null;
    // } else {
    //   const duration = {
    //     startTimeStamp: this.compareDate.startDateEpoch,
    //     endTimeStamp: this.compareDate.endDateEpoch
    //   };
    //   this.reqList.compareToDuration = duration;
    //   this.listData = this.listService.initListData(this.ddEntities);
    //   this.getListDataInit(this.activeEntitiesList, this.reqList,
    //     this.selEntityMetric + this.sortOrder);
    // }

    this.isCompareEnabled = this.dateRange.isCompareEnabled;
    this.reqList.duration = {
      startTimeStamp: this.dateRange.primaryDateRange.startDateEpoch,
      endTimeStamp: this.dateRange.primaryDateRange.endDateEpoch
    };
    if (this.dateRange.isCompareEnabled) {
      const duration = {
        startTimeStamp: this.dateRange.compareDateRange.startDateEpoch,
        endTimeStamp: this.dateRange.compareDateRange.endDateEpoch
      };
      this.reqList.compareToDuration = duration;
    } else {
      this.reqList.compareToDuration = null;
    }

    this.getListDataInit(this.activeEntitiesList, this.reqList,
      this.selEntityMetric + this.sortOrder, null, this.showGridDetails);
  }

  private validateRequest(req: SlicexRequest) {
    const duration: Duration = req.duration;
    const compDuration: Duration = req.compareToDuration;

    if (this.isNull(duration)) { return ['false', null]; }

    if (!this.isNull(compDuration)) {
      const period1 = this.getDatePeriod(duration);
      const period2 = this.getDatePeriod(compDuration);
      return (period1 === period2) ? ['true', null] :
        ['false', 'Please ensure the selected ranges in the date pickers have the same period.'];
    }
    return ['true', null];
  }

  private isNull(duration: Duration) {
    return (duration === null || duration.startTimeStamp === null || duration.endTimeStamp === null);
  }

  private getDatePeriod(duration: Duration) {
    const end = new Date(duration.endTimeStamp * 1000);
    const start = new Date(duration.startTimeStamp * 1000);
    return moment(end).diff(moment(start), 'days');
  }

  private filterListColumnBasedOnRole(colList) {
    const usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (!(usrRole === 'ROLE_SADMIN' || usrRole === 'ROLE_ADMIN')) {
      return colList.filter(item => (item !== 'licensee'));
    } else {
      return colList;
    }
  }

  private filterMetricsBasedOnRole(metrics) {
    const metricObj = {};
    const metricsToBeRemoved = ['cost', 'ecpa', 'ecpc', 'ecpm', 'ecpi', 'margin', 'marginPercentage'];

    const usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (usrRole === 'ROLE_RO') {
      Object.keys(metrics).forEach(key => {
        if (metricsToBeRemoved.indexOf(key) === -1) {
          metricObj[key] = metrics[key];
        }
      });
    } else {
      Object.assign(metricObj, metrics);
    }
    return metricObj;
  }

  private filterEntitiesBasedOnRole(entities) {
    const entityObj = {};
    const usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (usrRole !== 'ROLE_SADMIN' && usrRole !== 'ROLE_ADMIN') {
      Object.keys(entities).forEach(key => {
        if (key !== 'licensee') {
          entityObj[key] = entities[key];
        }
      });
    } else {
      Object.assign(entityObj, entities);
    }
    return entityObj;
  }
  //#endregion
}
