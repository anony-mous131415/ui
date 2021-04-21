import { Injectable } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DashboardFilters } from '@revxui/api-client-ts';
import { flatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SlicexCommonService {

  constructor() { }

  /**
   * 
   * @param v1 
   * @param v2 
   * find percentage change from v1 to v2
   */

  computeChange(v1: number, v2: number) {
    if (!v1 || !v2 || v1 === 0 || v2 === 0) {
      return null;
    }
    return ((v2 - v1) / v1) * 100;
  }

  /**
   * 
   * @param value 
   * @param type can be currency , percentage or no-units
   * @param currency 
   * 
   * format the number to display on ui
   */

  formatNumber(value: number, type: string, currency: string) {
    currency = !(currency) ? localStorage.getItem(AppConstants.CACHED_CURRENCY) : AppConstants.CURRENCY_MAP[currency];
    value = (!value) ? 0 : value;
    let numStr: string = value.toString();

    if (value !== undefined && !isNaN(value)) {
      numStr = numStr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    if (type !== undefined) {
      switch (type) {
        case AppConstants.NUMBER_TYPE_CURRENCY:
          numStr = currency + ' ' + numStr;
          break;
        case AppConstants.NUMBER_TYPE_PERCENTAGE:
          numStr += '%';
          break;
      }
    }

    return numStr;

  }



  /**
   * 
   * @param inpBreadcrums 
   * take the input and converts into dashboardFilter[]
   */
  getFilters(inpBreadcrums: any): DashboardFilters[] {
    const ftrs: DashboardFilters[] = [];
    Object.keys(inpBreadcrums).forEach(key => {
      ftrs.push(...inpBreadcrums[key].values.map(item => {
        return {
          column: key,
          value: item.id.toString()
        };
      }));
    });
    return ftrs;
  }



}
