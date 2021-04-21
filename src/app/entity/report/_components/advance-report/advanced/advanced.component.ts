import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { AdvancedUiService } from '@app/entity/report/_services/advanced-ui.service';
import { ReportingRequest } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { AppConstants } from '@app/shared/_constants/AppConstants';
@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss']
})
export class AdvancedComponent implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;
  isRequestValid = false;
  ENTITY = 'rtb';

  currencyArr = [
    { label: 'Licensee', value: ReportingRequest.CurrencyOfEnum.Licensee },
    { label: 'Advertiser', value: ReportingRequest.CurrencyOfEnum.Advertiser },
    // { label: 'Platform', value: ReportingRequest.CurrencyOfEnum.Platform },
  ];
  appConst = AppConstants;
  selCurrency: ReportingRequest.CurrencyOfEnum;
  groupBys = [];
  selGroupBys = [];

  error: any = {
    basic: { msg: '' },
    filter: { msg: '' },
    metric: { msg: '' },
    groupBy: { msg: '' }
  };

  breadcrumbs: string;
  masterCb = false;
  masterCb_sub: Subscription;

  constructor(
    public dialog: MatDialog,
    private advancedService: AdvancedUiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initValues();
    this.subscribeToEvent();
    this.checkIfRequestValid();
    this.handleBreadcrumbs();
  }

  subscribeToEvent() {
    this.masterCb_sub = this.advancedService.masterCb.subscribe((result: boolean) => {
      this.masterCb = result;
      this.checkIfRequestValid();
    });
  }

  ngOnDestroy() {
    this.masterCb_sub.unsubscribe();
    this.advancedService.resetOnLeave();
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { advanced: { id: '', name: '' } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  initValues() {
    this.selCurrency = this.advancedService.getCurrency();
    this.groupBys = this.advancedService.getGroupByData();
    this.selGroupBys = this.advancedService.getGroupBy() ? this.advancedService.getGroupBy() : [];
  }

  changeCurrencey() {
    this.advancedService.setCurrency(this.selCurrency);
  }

  runReport() {
    if (this.isRequestValid) {
      this.advancedService.setPageSize(50);
      this.advancedService.setPageNumber(1);
      this.advancedService.setSortBy([]);
      this.blockUI.start('Fetching report data. Please wait...');
      this.advancedService.show(this.ENTITY)
        .subscribe(
          (resp: any) => {
            if (resp && resp.respObject) {
              this.advancedService.setResult(resp.respObject);
              this.router.navigate(['report', 'advanced', 'result']);
            }
            this.blockUI.stop();
          }, (error: any) => {
            console.log('ERROR ', error);
            this.blockUI.stop();
          }
        );
    }
  }


  pass_event_to_child(event) {
    this.advancedService.allChildCb.next(event.checked);
  }

  isGroupBySelected(groupBy: string) {
    if (this.selGroupBys !== null && this.selGroupBys !== undefined && this.selGroupBys.length > 0) {
      if (this.selGroupBys.indexOf(groupBy) >= 0) {
        return true;
      }
    }

    return false;
  }

  onGroupByCheckboxChange(event: any, groupBy: string) {
    if (event.checked) {
      if (!this.isGroupBySelected(groupBy)) {
        this.selGroupBys.push(groupBy);
      }
    } else {
      const index = this.selGroupBys.indexOf(groupBy);
      if (index >= 0) {
        this.selGroupBys.splice(index, 1);
      }
    }

    this.advancedService.setGroupBy(this.selGroupBys);
    this.checkIfRequestValid();
  }





  checkIfRequestValid() {
    this.isRequestValid = true;
    const reqObj = this.advancedService.getRequestObject();
    if (reqObj.columns === null || reqObj.columns === undefined || !Array.isArray(reqObj.columns) || reqObj.columns.length === 0) {
      this.isRequestValid = false;
      this.error.metric.msg = AdvancedConstants.MESSAGE.NO_METRIC_SELECTED;
    } else {
      this.error.metric.msg = '';
    }

    if (reqObj.group_by !== null && reqObj.group_by !== undefined) {
      if (reqObj.group_by.length > 7) {
        this.isRequestValid = false;
        this.error.groupBy.msg = AdvancedConstants.MESSAGE.GROUPBY_LIMIT;
      } else {
        this.error.groupBy.msg = '';
      }
    }
  }

}
