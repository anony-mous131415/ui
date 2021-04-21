import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { EntitiesConstants } from '@app/shared/_constants/EntitiesConstants';
import { BulkUploadModalComponent } from '@app/shared/_directives/_modals/bulk-upload-modal/bulk-upload-modal.component';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import * as moment from 'moment';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit {

  breadcrumbs: string;

  showConfirmDialog: boolean = false;

  constructor(
    private strService: StrategyService,
    private modal: MatDialog,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.handleBreadcrumbs();
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { campaign: { id: '', name: '' } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  // export(event) {
  //   this.strService.export(event);
  // }

  // import(event: any) {
  //   this.strService.import(event);
  // }

  // TBD: need to find a better way to do this
  public export(event: any) {
    const startTime = moment.unix(event.dateRange.startDateEpoch).format('MMMM D, YYYY');
    const endTime = moment.unix(event.dateRange.endDateEpoch).subtract(1,'days').format('MMMM D, YYYY');

    const msg = `All active Strategies for the selected Campaigns will be exported with performance metrics from
    ${startTime} to ${endTime}.
    You can modify Bid Price, Bid Type, F-Cap, and Strategy Name in the exported file and
    import the file again to bulk edit modified strategies.`;

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.alertService.warning(EntitiesConstants.EXPORTING_DATA, false, true);
          this.strService.exportStrategyData(event);
        }
      }
    );

  }

  // TBD: need to find a better way to do this
  public import(event: any) {
    const modalRef = this.modal.open(BulkUploadModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      data: {
        title: 'Enter Strategies Below',
        isValidateRequired: true,
      },
    });
    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          // console.log(result);
        }
      }
    );
  }



}
