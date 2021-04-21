import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { AdvancedUiService } from '@app/entity/report/_services/advanced-ui.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-advanced-metrics',
  templateUrl: './advanced-metrics.component.html',
  styleUrls: ['./advanced-metrics.component.scss']
})
export class AdvancedMetricsComponent implements OnInit, OnDestroy {

  selectionBucket: any[] = [];
  metricUIList: any[] = [];

  allChildCbSub: Subscription;

  constructor(
    private advancedService: AdvancedUiService,
  ) { }

  ngOnInit() {
    this.setupValues();
    this.allChildCbSub = this.advancedService.allChildCb.subscribe((result: boolean) => {
      this.selectAllHandler(result);
    }
    );
  }

  isInBucket(val) {
    return this.selectionBucket.includes(val);
  }

  setupValues() {
    this.metricUIList = this.advancedService.getUIMetrics();
    this.selectionBucket = this.advancedService.getMetrics();
  }

  updateBucket(event: MatCheckboxChange) {
    switch (event.checked) {
      case true:
        this.selectionBucket.push(event.source.value);
        break;
      case false:
        this.selectionBucket.splice(this.selectionBucket.indexOf(event.source.value), 1);
        break;
    }
    this.performPostUpdateOperations();
  }


  performPostUpdateOperations() {
    this.advancedService.setMetrics(this.selectionBucket);
    const signalToMasterCheckbox = (this.selectionBucket.length === this.metricUIList.length) ? true : false;
    this.advancedService.masterCb.next(signalToMasterCheckbox);
  }

  selectAllHandler(bool: boolean) {
    this.selectionBucket = [];
    if (bool) {
      this.metricUIList.forEach(metric => {
        this.selectionBucket.push(metric.value);
      });
    }
    this.performPostUpdateOperations();
  }



  ngOnDestroy() {
    this.allChildCbSub.unsubscribe();
  }


}
