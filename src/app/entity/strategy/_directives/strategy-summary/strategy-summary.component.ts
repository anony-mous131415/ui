import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { CREATIVE_IMAGE_API, PARTS_STR } from '../../_services/strategy.service';


@Component({
  selector: 'app-strategy-summary',
  templateUrl: './strategy-summary.component.html',
  styleUrls: ['./strategy-summary.component.scss']
})
export class StrategySummaryComponent implements OnInit {

  @Input() isBulkEdit: boolean;

  @Input() data: any;
  @Output() goToPixel: EventEmitter<number> = new EventEmitter();
  CREATIVE_IMAGE_API = CREATIVE_IMAGE_API;
  strategyID: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.strategyID = param['id'];
      }
    );
  }

  onPixelClick(pixelId: number) {
    this.goToPixel.emit(pixelId);
  }

  goToCreativeDetailsPage(creative: any) {
    if (document && document.location) {
      const url = document.location.origin + '/creative/details/' + creative.id;
      this.router.navigate([]).then(result => { window.open(url, '_blank'); });
    }
  }

  editPart(part: any) {
    this.router.navigate(['strategy', 'edit', this.strategyID], { queryParams: { index: this.getStepperIndex(part) } });
    // setTimeout(() => {
    //   this.strService.setStepperIndex(this.getStepperIndex(part));
    // }, 1000);
  }

  getStepperIndex(part: any) {
    switch (part.id) {
      case PARTS_STR.BASIC: return 0;
      case PARTS_STR.INVENTORY: return 1;
      case PARTS_STR.TARGETING: return 2;
      case PARTS_STR.BUDGET: return 3;
      case PARTS_STR.CREATIVE: return 4;
      case PARTS_STR.REVIEW: return 5;
      default: return 0;
    }
  }

  getHourSplit(data) {
    if (data && data.hours && data.hours.length > 0) {
      return data.hours.map(tuple => {
        return ` (${tuple[0]}:00 - ${tuple[1] + 1}:00)`;
      }).join(', ');
    } else {
      return 'NA';
    }
  }

  getInCSVFormat(data) {
    return data.map(item => {
      if (item.type) {
        return item.name + '(' + this.getAudienceTypeString(item.type) + ')';
      } else {
        return item.name;
      }
    }).join(', ');
  }

  getAudienceTypeString(audType: string) {
    let audTypeStr = '';
    switch (audType) {
      case AudienceConstants.TYPE.APP:
        audTypeStr = AudienceConstants.LABEL.APP;
        break;
      case AudienceConstants.TYPE.WEB:
        audTypeStr = AudienceConstants.LABEL.WEB;
        break;
      case AudienceConstants.TYPE.DMP:
        audTypeStr = AudienceConstants.LABEL.DMP;
        break;
    }

    return audTypeStr;
  }
}
