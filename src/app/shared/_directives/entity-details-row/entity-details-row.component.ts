import { Component, Input, OnInit } from '@angular/core';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';
import { SecondsToTimePipe } from '@app/shared/_pipes/seconds-to-time.pipe';

@Component({
  selector: 'app-entity-details-row',
  templateUrl: './entity-details-row.component.html',
  styleUrls: ['./entity-details-row.component.scss']
})
export class EntityDetailsRowComponent implements OnInit {

  @Input() rowTitle: string;
  @Input() rowValue: string;
  @Input() prefixIcon: string;
  @Input() isGreenPrefixIcon: string;
  @Input() suffixIcon: string;
  @Input() marginBottom: string;

  advConst = AdvConstants;

  constructor(
    private secondsToTimePipe: SecondsToTimePipe
  ) { }

  ngOnInit() {

    if (this.rowTitle === this.advConst.COLUMN_CATALOG_UPDATED_FREQUENCY) {
      this.rowValue = this.secondsToTimePipe.transform(Number(this.rowValue));
    }
  }
}
