import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { ParentBasedObject } from '@revxui/api-client-ts';
import { ConfirmationModalComponent } from '../_modals/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-adv-static-header',
  templateUrl: './adv-static-header.component.html',
  styleUrls: ['./adv-static-header.component.scss']
})
export class AdvStaticHeaderComponent implements OnInit, OnChanges {

  @Input() entityId: number;
  @Input() activeTab: number;
  @Input() showEditOption: string;
  appConst = AppConstants;

  advCompact = {} as ParentBasedObject;

  constructor(
    private entitiesService: EntitiesService,
    private advService: AdvertiserService,
    private alertService: AlertService,
    public router: Router,
    private menuService: MenucrumbsService,
    private modal: MatDialog
  ) { }

  ngOnInit() {
    // this.setAdvCompact();
    this.initActiveTab(this.router.url);

  }
  ngOnChanges() {
    this.setAdvCompact();
    this.initActiveTab(this.router.url);
  }

  setAdvCompact() {
    this.entitiesService.getDetailsById(this.entityId, AppConstants.ENTITY.ADVERTISER).subscribe(resp => {
      // console.log('resp', resp);
      this.advCompact = resp.respObject;
    });
  }

  updateStatus(activate: number) {
    let msg = 'The Advertiser will be deactivated';
    if (activate === 1) {
      msg = 'The Advertiser will be activated';
    }
    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', msg)
    //   .then((confirmed) => {
    //     if (confirmed && activate === 1) {// PERFORM ACTIVATION
    //       this.advService.activateAdvs(this.entityId).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, 'Successfully activated advertiser', 'Error while activating advertiser!!');
    //       });

    //     } else if (confirmed && activate === 0) {// PERFORM DE-activation
    //       this.advService.deactivateAdvs(this.entityId).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, 'Successfully de-activated advertiser', 'Error while de-activating advertiser!!');
    //       });

    //     }
    //   });

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed && activate === 1) {// PERFORM ACTIVATION
          this.advService.activateAdvs(this.entityId).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully activated advertiser', 'Error while activating advertiser!!');
          });

        } else if (confirmed && activate === 0) {// PERFORM DE-activation
          this.advService.deactivateAdvs(this.entityId).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully de-activated advertiser', 'Error while de-activating advertiser!!');
          });

        }
      }
    );

  }

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
      this.advService.refreshDetails(true);
      this.setAdvCompact();
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);
  }

  onHeaderClickRedirect(entity: string) {
    this.advService.setActiveLink(entity);

    if (entity === 'details') {
      this.router.navigate(['/advertiser', 'details', this.entityId.toString()]);
    } else {
      this.router.navigate(['/advertiser/details/', this.entityId.toString(), entity]);
    }
  }

  isLinkActive(entity: string) {
    return (this.advService.getActiveLink() === entity) ? true : false;
  }

  initActiveTab(url: string) {
    if (url && url.indexOf('advertiser/details/' + this.entityId) !== -1) {
      const entityParts: string[] = url.split('/');
      if (entityParts) {
        const entity: any = entityParts[entityParts.length - 1];
        if (!isNaN(entity)) {
          this.advService.setActiveLink('details');
        } else {
          this.advService.setActiveLink(entity);
        }
        return;
      }
    }
    return;
  }

}
