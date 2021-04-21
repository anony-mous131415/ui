import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StrategyBulkEditService } from '../../_services/strategy-bulk-edit.service';
import { BulkEditReviewRequestResponseComponent } from '../../_directives/_modals/bulk-edit-review-request-response/bulk-edit-review-request-response.component';
import { MatDialog } from '@angular/material';
import { BulkEditActivityLogComponent } from '../../_directives/_modals/bulk-edit-activity-log/bulk-edit-activity-log.component';

@Component({
  selector: 'app-strategy-list',
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.scss']
})
export class StrategyListComponent implements OnInit {

  breadcrumbs: string;

  constructor(
    private router: Router,
    private strBulkEditService: StrategyBulkEditService,
    private modal: MatDialog,

  ) { }

  ngOnInit() {
    this.handleBreadcrumbs();
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { strategy: { id: '', name: '' } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }



  //REVX-371 : strategy bulk edit
  navigateToStrBulkEit(event) {
    if (event.navigate) {
      this.router.navigate(['strategy', 'bulkEdit']);
      this.strBulkEditService.strDetails.next(event.data);
      this.strBulkEditService.setStrategiesForBulkEdit(event.data.strategyList);
    }
  }



  openBulkEditLogModal(event: boolean) {
    if (event) {
      const modalRef = this.modal.open(BulkEditActivityLogComponent, {
        width: '70%',
        maxHeight: '90vh',
        disableClose: false,
        data: {},
      });
      modalRef.afterClosed().subscribe(result => { });
    }
  }



}
