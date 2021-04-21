import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';

@Pipe({
  name: 'secondsToTime'
})
export class SecondsToTimePipe implements PipeTransform {

  transform(seconds: number) {

    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);

    let dDisplay = d > 0 ? d + (d == 1 ? " day  " : " days  ") : "";
    let hDisplay = h > 0 ? h + (h == 1 ? " hour  " : " hours  ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute  " : " minutes  ") : "";
    return dDisplay + hDisplay + mDisplay;
  }

}
