import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '../_services/common.service';

@Pipe({
  name: 'epochDateFormat'
})
export class EpochDateFormatPipe implements PipeTransform {

  constructor(
    private commonService: CommonService
  ) { }

  transform(number: number): any {
    return this.commonService.epochToDateFormatter(number);
  }

}
