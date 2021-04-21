import { Pipe, PipeTransform } from '@angular/core';
import { AppConstants } from '../_constants/AppConstants';
import { CommonService } from '../_services/common.service';

@Pipe({
  name: 'numFormat'
})
export class NumFormatPipe implements PipeTransform {

  constructor(
    private commonService: CommonService
  ) {

  }
  transform(num: number, type?: string, currencyCode?: string): any {
    return this.commonService.nrFormat(num, type, currencyCode);
  }

}
