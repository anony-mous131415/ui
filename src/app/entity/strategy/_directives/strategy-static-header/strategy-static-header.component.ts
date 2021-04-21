import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { StrategyControllerService } from '@revxui/api-client-ts';
import { StrategyService } from '../../_services/strategy.service';

@Component({
  selector: 'app-strategy-static-header',
  templateUrl: './strategy-static-header.component.html',
  styleUrls: ['./strategy-static-header.component.scss']
})
export class StrategyStaticHeaderComponent implements OnInit {

  @Input() strategyID: number;
  @Input() strategyName: string;
  @Input() isActive: boolean;
  appConst = AppConstants;
  @Output() onDuplicate: EventEmitter<{ strId: number }> = new EventEmitter();

  constructor(
    private router: Router,
    private apiService: StrategyControllerService,
    private strService: StrategyService,
    private alertService: AlertService,
    private menuService: MenucrumbsService,
    private modal: MatDialog
  ) { }

  ngOnInit() {
  }

  onEditStrategy() {
    this.router.navigate(['/strategy', 'edit', this.strategyID]);
  }

  duplicateStrategy() {
    this.onDuplicate.emit({ strId: this.strategyID });
  }

  updateStatus(type) {

    let msg = `This strategy (${this.strategyName}) will be stopped. Are you sure you want to continue?`;
    if (type === 1) {
      msg = `The strategy (${this.strategyName}) will be started. Are you sure you want to continue?`;
    }

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed && type === 1) {// PERFORM ACTIVATION
          this.apiService.activateStrategyUsingPOST(this.strategyID.toString(), null, this.strService.getAuthToken())
            .subscribe((apiResp) => {
              this.menuService.invalidateMenucrumbsData();
              this.showMessageAfterAction(apiResp, 'Successfully started strategy.', 'Error while starting strategy.');
            });

        } else if (confirmed && type === 0) {// PERFORM DE-activation
          this.apiService.deactivateStrategyUsingPOST(this.strategyID.toString(), null, this.strService.getAuthToken())
            .subscribe((apiResp) => {
              this.menuService.invalidateMenucrumbsData();
              this.showMessageAfterAction(apiResp, 'Successfully stopped strategy.', 'Error while stopping strategy.');
            });

        }
      }
    );


    // this.confirmationModalService.confirmNew(StrategyConfirmationModalComponent, 'Warning', msg)
    //   .then((confirmed) => {
    //     if (confirmed && type === 1) {// PERFORM ACTIVATION
    //       this.apiService.activateStrategyUsingPOST(this.strategyID.toString(), null, this.strService.getAuthToken())
    //         .subscribe((apiResp) => {
    //           this.menuService.invalidateMenucrumbsData();
    //           this.showMessageAfterAction(apiResp, 'Successfully started strategy.', 'Error while starting strategy.');
    //         });

    //     } else if (confirmed && type === 0) {// PERFORM DE-activation
    //       this.apiService.deactivateStrategyUsingPOST(this.strategyID.toString(), null, this.strService.getAuthToken())
    //         .subscribe((apiResp) => {
    //           this.menuService.invalidateMenucrumbsData();
    //           this.showMessageAfterAction(apiResp, 'Successfully stopped strategy.', 'Error while stopping strategy.');
    //         });

    //     }
    //   });
  }

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
      this.isActive = !this.isActive;
    } else {
      this.alertService.error(errorMsg, false, true);
      this.isActive = false;
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);
  }
}
