import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ConversionConstants } from '@app/entity/report/_constants/ConversionConstants';
import { EntitySelectorComponent } from '@app/entity/report/_directives/shared/entity-selector/entity-selector.component';
import { ViewSelectionComponent } from '@app/entity/report/_directives/shared/view-selection/view-selection.component';
import {
  CheckBoxesObj,
  CommonReportingService,
  ConversionUiMetrics, GridData, ModalObject
} from '@app/entity/report/_services/common-reporting.service';
import { ConvUiService } from '@app/entity/report/_services/conv-ui.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { cloneDeep } from 'lodash';
import { BlockUI, NgBlockUI } from 'ng-block-ui';


@Component({
  selector: 'app-conversion',
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class ConversionComponent implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;
  isRequestValid = false;
  ENTITY = 'conversionreport';

  convConst = ConversionConstants;
  appConst = AppConstants;

  metricUIList: ConversionUiMetrics[] = [];
  advertiser: ModalObject;
  campaign: ModalObject;
  strategy: ModalObject;
  convType: CheckBoxesObj[] = [];
  breadcrumbs: string;
  validated = true;

  constructor(
    private convService: ConvUiService,
    public dialog: MatDialog,
    private alertService: AlertService,
    private commonReportingService: CommonReportingService,
    private router: Router,
  ) { }

  ngOnDestroy(): void {
    this.convService.resetOnLeave();
  }


  ngOnInit() {
    this.commonReportingService.getRequiredMetrics(AppConstants.REPORTS.ADVANCED);
    this.commonReportingService.getRequiredMetrics(AppConstants.REPORTS.CONVERSION);
    this.getValueFromService();
    this.handleBreadcrumbs();
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { conversion: {id: '', name: ''}};
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  /**
   * when user presses GO BACK from results page , this methods updates the selection made
   * or when he lands first time on this route
   */
  getValueFromService() {
    this.metricUIList = cloneDeep(this.convService.getUiMetrics());
    this.advertiser = this.convService.getModalEntities(AppConstants.ENTITY.ADVERTISER);
    this.campaign = this.convService.getModalEntities(AppConstants.ENTITY.CAMPAIGN);
    this.strategy = this.convService.getModalEntities(AppConstants.ENTITY.STRATEGY);
    this.convType = this.convService.getConvTypeObject();
  }

  /**
   *
   * @param obj - obj
   * updates the type of conversion
   */
  changeConvType(obj: CheckBoxesObj) {
    obj.select = !obj.select;
    this.convService.setConvTypeObject(this.convType);
  }



  /**
   * open up popup modal for selecting adv,camp,str
   */
  openModalForAdvCmpStr() {
    const dialogRef = this.dialog.open(EntitySelectorComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Select Strategy through Advertisers',
        entity: [AppConstants.ENTITY.ADVERTISER, AppConstants.ENTITY.CAMPAIGN, AppConstants.ENTITY.STRATEGY],
        header: ['Advertisers', 'Campaigns', 'Strategies'],
        l1_object: { ...this.advertiser },
        l2_object: { ...this.campaign },
        l3_object: { ...this.strategy }
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.advertiser = result.l1_object;
        this.campaign = result.l2_object;
        this.strategy = result.l3_object;
        this.convService.setAdvCmpStrFilter(this.advertiser, this.campaign, this.strategy);
      }
    });
  }

  /**
   * open up popup modal for viewing selected adv,camp,str
   */
  openViewModal() {
    const dialogRef = this.dialog.open(ViewSelectionComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Selection',
        entity: AppConstants.ENTITY.ADVERTISER,
        type: AppConstants.REPORTS.CONVERSION
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }


  /**
   * when user hits reset selection button
   */
  resetSelection() {
    this.alertService.success('Reset was successful.', false, true);
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);

    this.advertiser = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.campaign = { map: new Map<number, boolean>(), set: new Set<GridData>() };
    this.strategy = { map: new Map<number, boolean>(), set: new Set<GridData>() };

    // REVX-313 : set in service too
    this.convService.setAdvCmpStrFilter(this.advertiser, this.campaign, this.strategy);
  }


  /**
   * @param event- event
   * update selected metrics
   */
  updateBucket(event: MatCheckboxChange, metric: ConversionUiMetrics) {
    metric.isSelected = !metric.isSelected;
    this.performPostUpdateOperations();
  }

  /**
   *
   * @param event
   * when user hits select all check box
   */
  onSelectAll(event: MatCheckboxChange) {
    this.metricUIList.forEach(metric => {
      metric.isSelected = (metric.isDisplayed) ? event.checked : true;
    });
    this.performPostUpdateOperations();
  }


  performPostUpdateOperations() {
    this.convService.setUiMetrics(this.metricUIList);
  }




  getSelectAllStatus(): boolean {
    const selectedUi: any[] = this.metricUIList.filter((metric) => metric.isDisplayed && metric.isSelected);
    return (selectedUi.length === 9) ? true : false;
  }


  /**
   * @param filterIdx - filterIdx
   * ui tick indicator
   */
  checkForIndicator(filterIdx: number): boolean {
    if (filterIdx === 0) {
      // use method in common reporting service
      const l1 = this.commonReportingService.getUiIndicatorForModals(this.advertiser);
      const l2 = this.commonReportingService.getUiIndicatorForModals(this.campaign);
      const l3 = this.commonReportingService.getUiIndicatorForModals(this.strategy);
      return l1 || l2 || l3;

    } else if (filterIdx === 1) {
      const selectedTypes = this.convType.filter(x => x.select === true);
      return (selectedTypes.length !== 2);
    }
  }


  /**
   * runs the reports after all selections are made
   */
  runReport() {
    this.convService.setPageSize(50);
    this.convService.setPageNumber(1);
    this.convService.setSortBy([]);
    this.blockUI.start('Fetching report data. Please wait...');
    this.convService.show(this.ENTITY)
      .subscribe(
        (resp: any) => {
          if (resp && resp.respObject) {
            this.convService.setResult(resp.respObject);
            this.router.navigate(['report', 'conversion', 'result']);
          }
          this.blockUI.stop();
        }, (error: any) => {
          // console.log('ERROR ', error);
          this.blockUI.stop();
        }
      );
  }



}



