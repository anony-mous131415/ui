import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { AdvancedUiService } from '@app/entity/report/_services/advanced-ui.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonReportingService, DisaplayUi } from '@app/entity/report/_services/common-reporting.service';
import { ReportBuilderService }  from '../../../_services/report-builder.service';
import { ConvUiService } from '@app/entity/report/_services/conv-ui.service';


@Component({
  selector: 'app-view-selection',
  templateUrl: './view-selection.component.html',
  styleUrls: ['./view-selection.component.scss']
})
export class ViewSelectionComponent implements OnInit {
  advancedConst = AdvancedConstants;
  appConst = AppConstants;

  l1_disp: DisaplayUi;
  l2_disp: DisaplayUi;
  l3_disp: DisaplayUi;
  heading = []
  title = 'Selection'

  constructor(
    private modalRef: MatDialogRef<ViewSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) private injectedData: any,
    private commonReportingService: CommonReportingService,
    private advancedService: AdvancedUiService,
    private convService: ConvUiService,
    private reportBuilderService: ReportBuilderService,
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    if(this.injectedData.type === AppConstants.REPORTS.REPORT_BUILDER) {
      if(this.injectedData.entity.includes(AppConstants.ENTITY.CREATIVE)) {
        this.l1_disp = this.commonReportingService.getUiData(this.reportBuilderService.getModalEntities(this.injectedData.key,'l2_object'));
        this.heading = ['Creatives'];
      } else {
        this.l1_disp = this.commonReportingService.getUiData(this.reportBuilderService.getModalEntities(this.injectedData.key,'l1_object'));
        this.l2_disp = this.commonReportingService.getUiData(this.reportBuilderService.getModalEntities(this.injectedData.key,'l2_object'));
        this.l3_disp = this.commonReportingService.getUiData(this.reportBuilderService.getModalEntities(this.injectedData.key,'l3_object'));
        this.heading = this.injectedData.entity;
      }
    } else {
      switch (this.injectedData.entity) {
        case AppConstants.ENTITY.ADVERTISER:
          let serviceUsed = (this.injectedData.type === AppConstants.REPORTS.ADVANCED) ? this.advancedService : this.convService;

          this.l1_disp = this.commonReportingService.getUiData(serviceUsed.getModalEntities(AppConstants.ENTITY.ADVERTISER));
          this.l2_disp = this.commonReportingService.getUiData(serviceUsed.getModalEntities(AppConstants.ENTITY.CAMPAIGN));
          this.l3_disp = this.commonReportingService.getUiData(serviceUsed.getModalEntities(AppConstants.ENTITY.STRATEGY));
          this.heading = ['Advertisers', 'Campaigns', 'Strategies'];
          break;

        case AppConstants.ENTITY.AGGREGATOR:
          this.heading = ['Aggregators'];
          this.l1_disp = this.commonReportingService.getUiData(this.advancedService.getModalEntities(AppConstants.ENTITY.AGGREGATOR));
          break;

        case AdvancedConstants.ENTITY.GEOGRAPHY:
          this.l1_disp = this.commonReportingService.getUiData(this.advancedService.getModalEntities(AdvancedConstants.ENTITY.COUNTRY));
          this.l2_disp = this.commonReportingService.getUiData(this.advancedService.getModalEntities(AdvancedConstants.ENTITY.STATE));
          this.l3_disp = this.commonReportingService.getUiData(this.advancedService.getModalEntities(AdvancedConstants.ENTITY.CITY));
          this.heading = ['Countries', 'States', 'Cities'];
          break;

        case AppConstants.ENTITY.CREATIVE:
          this.l1_disp = this.commonReportingService.getUiData(this.advancedService.getModalEntities(AppConstants.ENTITY.CREATIVE));
          this.heading = ['Creatives'];
          break;

        case AdvancedConstants.ENTITY.CREATIVE_SIZE:
          this.l1_disp = this.commonReportingService.getUiData(this.advancedService.getModalEntities(AdvancedConstants.ENTITY.CREATIVE_SIZE));
          this.heading = ['Sizes'];
          break;
      }
    }
  }

  done() {
    this.modalRef.close(null);
  }

}
