import { Injectable } from '@angular/core';
import { GridData, ListApiParams } from '@app/entity/report/_services/common-reporting.service';
import { ApiResponseObjectDictionaryResponse, DashboardControllerService, FilterModel, ReportingControllerService, ReportingRequest } from '@revxui/api-client-ts';
import * as moment from 'moment';
import { Subject } from 'rxjs';
export const OPTION_TYPE = {
  STATIC: "STATIC",
  ENTITY: "ENTITY",
  FROM_LIST: "FROM_LIST"
}

export const ELEMENT_TYPE = {
  DATE_RANGE_WITH_INTERVAL: "DATE_RANGE_WITH_INTERVAL",
  DATE_RANGE: "DATE_RANGE",
  INTERVAL: "INTERVAL",
  CHECKBOX: "CHECKBOX",
  RADIO: "RADIO",
  INPUT_NUMBER: "INPUT_NUMBER",
  INPUT_TEXT: "INPUT_TEXT",
  SINGLE_SELECT: "SINGLE_SELECT",
  MULTI_SELECT: "MULTI_SELECT",
  ENTITY_SELECTOR: "ENTITY_SELECTOR",
  SELECTALL_CHECKBOX: "SELECTALL_CHECKBOX"
}

export interface OptParams {
  id?: any;
  name?: string;
  isSelected?: boolean;
  tooltip?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportBuilderService {

  constructor(
    private dashboardService: DashboardControllerService,
    private reportingService: ReportingControllerService,
  ) { }

  public onGetOptions = new Subject<{ option: string }>();
  public onActionChanged = new Subject<{ params: any }>();

  result: any;
  request = {} as ReportingRequest;
  valueMap: Map<string, any> = new Map<string, any>();
  optionsMap: Map<string, OptParams> = new Map<string, OptParams>();
  report_type: string;

  getConfig() {
    return this.reportingService.reportConfigUsingGET();
  }

  buildReportParams(config: any) {
    if (config && Array.isArray(config) && config.length > 0) {
      let children = [];
      config.forEach(section => {
        if (section.children) {
          if (!section.children.isGrouped) {
            section.children.options.forEach(opt => {
              if (opt.type === ELEMENT_TYPE.DATE_RANGE_WITH_INTERVAL) {
                const option = { ...opt };
                const interval = { ...option.interval };
                option.interval = null;
                option.type = ELEMENT_TYPE.DATE_RANGE;
                children.push(option, interval);
              } else {
                children.push(opt);
              }
            });
          } else {
            section.children.options.forEach(opt => {
              children = children.concat(opt.items);
            });
          }
        }
        if(section.actions && section.actions.length > 0) {
          section.actions.forEach(action => children.push(action));
        }
      });
      children.forEach(child => {
        this.valueMap[child.id] = this.getInitValueForElement(child);
        if (child.source) {
          this.buildOptionsMap(child);
        }
      })
    }
    return { valueMap: this.valueMap, optionsMap: this.optionsMap };
  }

  buildOptionsMap(option: any) {
    this.optionsMap[option.id] = [];
    switch (option.source.type) {
      case OPTION_TYPE.ENTITY:
        this.getEntityOptions(option).subscribe((params: ApiResponseObjectDictionaryResponse) => {
          this.optionsMap[option.id] = this.formatEntityOptions(params, option)
        });
        break;
      case OPTION_TYPE.FROM_LIST:
        this.getOptions(option);
        break;
      case OPTION_TYPE.STATIC:
        this.optionsMap[option.id] = option.source.options;
        this.valueMap[option.id] = option.source.options
          .filter(item => item.isSelected)
          .map(item => item.id);
        break;
      default:
        break;
    }
  }

  getInitValueForElement(child: any): any {
    if (child) {
      switch (child.type) {
        case ELEMENT_TYPE.DATE_RANGE:
          return {};
        case ELEMENT_TYPE.INTERVAL:
        case ELEMENT_TYPE.SINGLE_SELECT:
        case ELEMENT_TYPE.INPUT_NUMBER:
        case ELEMENT_TYPE.INPUT_TEXT:
        case ELEMENT_TYPE.RADIO:
          return null;
        case ELEMENT_TYPE.CHECKBOX:
        case ELEMENT_TYPE.MULTI_SELECT:
          return [];
        case ELEMENT_TYPE.ENTITY_SELECTOR:
          return {
            l1_object: { map: new Map<number, boolean>(), set: new Set<GridData>() }, 
            l2_object: { map: new Map<number, boolean>(), set: new Set<GridData>() },
            l3_object: { map: new Map<number, boolean>(), set: new Set<GridData>() }
          }
        case ELEMENT_TYPE.SELECTALL_CHECKBOX:
          return false;
        default:
          return null;
      }
    }
  }

  getOptions(option: any): any {
    this.onGetOptions.next({ option: option });
  }

  setOptions(key: string, options: any[]) {
    this.formatOptionsForKey(key, options);
  }

  getEntityOptions(option: any, params?: ListApiParams) {
    return this.dashboardService.getDictionaryUsingPOST(option.source.entity);
  }

  actionChanged(action: any, event?: any) {
    let params = { ...action };
    if (event) {
      params = { ...params, ...event };
      if(action.id === 'select_all') {
        const isChecked = event.checked;
        let result = [];
        this.optionsMap[action.child].forEach(item => {
          item.isSelected = isChecked;
          if(isChecked) 
            result.push(item.id);
        });
        this.valueMap[action.child] = result;
      }
    }
    this.onActionChanged.next(params);
  }

  getReportType() {
    return this.report_type;
  }

  setReportType(type) {
    this.report_type = type; 
  }

  getValueMap() {
    return this.valueMap;
  }

  setValueMap(map: Map<string, any>) {
    this.valueMap = map;
  }

  formatOptionsForKey(key: string, options: OptParams[]) {

    this.optionsMap[key] = options;
    const selectedValues = options.filter(item => item.isSelected).map(item => item.id);
    this.valueMap[key].push(...selectedValues);
  }

  formatEntityOptions(params: ApiResponseObjectDictionaryResponse, option: any) {

    let result: OptParams[] = [];
    if (params && params.respObject && params.respObject.data) {
      result = params.respObject.data.map(opt => {
        return {
          id: opt.id,
          name: opt.name,
          isSelected: false,
          tooltip: null
        } as OptParams;
      });
      const selectedValues = result.filter(item => item.isSelected).map(item => item.id);
      this.valueMap[option.id].push(...selectedValues);
    }
    return result;
  }

  getDateRange(key): Date[] {
    const dateArr: Date[] = [];
    const duration = this.valueMap[key];
    if (duration.end_timestamp === null) {
      duration.end_timestamp = duration.start_timestamp;
    }
    const enddate = (duration.start_timestamp === duration.end_timestamp) ?
      duration.start_timestamp : duration.end_timestamp - 86400;
    dateArr[0] = new Date(moment.utc(duration.start_timestamp * 1000).format('llll')); // start Date
    dateArr[1] = new Date(moment.utc(enddate * 1000).format('llll')); // end Date
    return dateArr;
  }

  getInterval(key)  {
    return this.valueMap[key].interval;
  }

  setInterval(value: ReportingRequest.IntervalEnum,key) {
    this.valueMap[key].interval = value;
  }

  setDuration(date: Date[], option) {
    const duration = {
        start_timestamp: null,
        end_timestamp: null,
        interval: this.valueMap[option].interval ? this.valueMap[option].interval : 'none'
    };
    const isYestOrToday: boolean = this.isYesterdayOrToday(this.getEpoch(date[0]));
    duration.start_timestamp = this.getEpoch(date[0]);
    duration.end_timestamp = this.getEpoch(date[1]) + 86400;
    this.valueMap[option] = duration;

    if (isYestOrToday) {
      duration.end_timestamp = null;
      this.valueMap[option] = duration;
    }
  }

  getEpoch(inpDate: Date) {
    const date: number = Date.UTC(inpDate.getFullYear(), inpDate.getMonth(), inpDate.getDate());
    const epoch = date / 1000;
    return epoch;
  }

  isYesterdayOrToday(startDate: number) {
    const currDate = new Date();
    const year: number = currDate.getUTCFullYear();
    const month: number = currDate.getUTCMonth();
    const date: number = currDate.getUTCDate();
    const today: Date = new Date(year, month, date);
    const yesterday: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return (startDate === this.getEpoch(today) || startDate === this.getEpoch(yesterday)) ? true : false;
  }

  setEntitySelectorResult(key,result) {
    this.valueMap[key] = result;
  }

  getEntitySelectorResult(key, object) {
    return object in this.valueMap[key] ? this.valueMap[key][object] : { map: new Map<number, boolean>(), set: new Set<GridData>() };
  }

  getModalEntities(key, object) {
    return object in this.valueMap[key] ? this.valueMap[key][object] : { map: new Map<number, boolean>(), set: new Set<GridData>() };
  }

  buildEntityFilterRequestObject(object, entities, actual_filter) {
    const l1Arr: GridData[] = Array.from(object.l1_object.set);
    const l2Arr: GridData[] = Array.from(object.l2_object.set);
    const l3Arr: GridData[] = Array.from(object.l3_object.set);
    const l1SelectedArr: GridData[] = l1Arr.filter(x => !x.isNotSelected);
    const l1RejectedArr: GridData[] = l1Arr.filter(x => x.isNotSelected);
    const l2SelectedArr: GridData[] = l2Arr.filter(x => !x.isNotSelected);
    const l2RejectedArr: GridData[] = l2Arr.filter(x => x.isNotSelected);
    const l3SelectedArr: GridData[] = l3Arr.filter(x => !x.isNotSelected);
    const l3RejectedArr: GridData[] = l3Arr.filter(x => x.isNotSelected);
    let result = actual_filter;
    if(l1SelectedArr.length !== object.l1_object.set.size && l1RejectedArr.length !== object.l1_object.set.size) {
      const filter = {} as FilterModel;
      filter.column = entities[0].toLowerCase();
      if(l1SelectedArr.length <= l1RejectedArr.length) {
        filter.operator = 'in';
        filter.value = l1SelectedArr.map(item=>item.id);
      } else {
        filter.operator = 'not_in';
        filter.value = l1RejectedArr.map(item=>item.id);
      }
      result.push(filter);
    }
    if(l2SelectedArr.length !== object.l2_object.set.size && l2RejectedArr.length !== object.l2_object.set.size) {
      const filter = {} as FilterModel;
      filter.column = entities.length>=2 ? entities[1].toLowerCase() : null;
      if(l2SelectedArr.length <= l2RejectedArr.length) {
        filter.operator = 'in';
        filter.value = l2SelectedArr.map(item=>item.id);
      } else {
        filter.operator = 'not_in';
        filter.value = l2RejectedArr.map(item=>item.id);
      }
      result.push(filter);
    }
    if(l3SelectedArr.length !== object.l3_object.set.size && l3RejectedArr.length !== object.l3_object.set.size) {
      const filter = {} as FilterModel;
      filter.column = entities.length >=3 ? entities[2].toLowerCase() : null;
      if(l3SelectedArr.length <= l3RejectedArr.length) {
        filter.operator = 'in';
        filter.value = l3SelectedArr.map(item=>item.id);
      } else {
        filter.operator = 'not_in';
        filter.value = l3RejectedArr.map(item=>item.id);
      }
      result.push(filter);
    }
    return result;
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

  getRequestObject() {
    return this.request;
  }

  setRequestObject(request) {
    this.request = request;
  }

  resetOnLeave() {
    //
  }

  setPageNumber(number) {
    this.request.page_number = number;
  }

  setPageSize(size) {
    this.request.page_size = size;
  }

  show(entity: string) {
    return this.reportingService.customReportUsingPOST(entity, this.request);
  }

  export(entity: string) {
    return this.reportingService.customReportCSVUsingPOST(entity, this.request);
  }

  

}
