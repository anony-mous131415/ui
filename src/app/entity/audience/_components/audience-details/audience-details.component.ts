import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { AudienceDTO } from '@revxui/api-client-ts';

export interface DisplayText {
  displayedRules: any[];
  audIcon: string;
  audSource: string;

  showUserExpiry: boolean;
  userExpiry: string;

  fileDetailsIcon: string;
  fileDetailsString: string;

  nextRunTime: any;
  lastSuccessTime: any;
}

@Component({
  selector: 'app-audience-details',
  templateUrl: './audience-details.component.html',
  styleUrls: ['./audience-details.component.scss']
})
export class AudienceDetailsComponent implements OnInit {

  audDto;
  audConst = AudienceConstants;
  audId: number;
  breadcrumbs: string;
  isClicker: boolean;
  dispText = {} as DisplayText;

  rmList: any[] = [];
  appConst = AppConstants;

  constructor(
    private audService: AudienceService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private commonService: CommonService,
    private entitiesService: EntitiesService,
    private menuService: MenucrumbsService,
    private modal: MatDialog
  ) { }

  ngOnInit() {
    this.audDto = {} as AudienceDTO;
    this.route.paramMap.subscribe(params => {
      const id = params.get('audId');
      if (id && !isNaN(Number(id))) {
        this.audId = Number(id);
        this.getAudienceDetails();
      } else {
        this.router.navigate(['']);
      }
    });
  }

  getAudienceDetails() {
    this.audService.getAudienceById(this.audId).subscribe(audResp => {
      // console.log('dto===>', audResp.respObject);
      if (audResp && audResp.respObject) {
        this.audDto = audResp.respObject;
        this.getDetailsById();
        this.setDisplayText();
      }
    });
  }

  setDisplayText() {
    if (this.audDto.ruleExpression) {
      // WEBSITE and MOBILE-RULE
      let allAssignerRules = this.audService.ruleDtoToReqRules(this.audDto.ruleExpression);
      this.audService.getRules().subscribe(resp => {
        this.dispText.displayedRules = this.audService.getDispRules(allAssignerRules, resp.respObject.metaRules);
        if (this.audDto.segmentType === AudienceConstants.SEGMENT_TYPE.CLICKER) {
          this.isClicker = true;
        } else {
          this.isClicker = false;
        }
        // console.log('clicker==>>', this.isClicker);
      });
    }

    if (this.audDto.remoteSegmentId) {
      // DMP audience
      // console.log('DMP')
      this.dispText.showUserExpiry = false;
      this.dispText.audIcon = 'fa-users'
      this.dispText.audSource = AudienceConstants.SOURCE_TEXT.DMP;
    } else if (this.audDto.ruleExpression && !this.audDto.pixelDataFile && !this.audDto.pixelDataSchedule
      && this.audDto.userDataType === AudienceConstants.USER_DATA_TYPE.WEBSITE) {
      // WEBSITE
      // console.log('WEBSITE')
      this.dispText.showUserExpiry = true;
      this.dispText.audIcon = 'fa-laptop'
      this.dispText.audSource = AudienceConstants.SOURCE_TEXT.WEBSITE;
    } else {
      // MOBILE
      this.dispText.audIcon = 'fa-mobile'
      this.dispText.audSource = AudienceConstants.SOURCE_TEXT.MOBILE;
      if (this.audDto.ruleExpression) {
        // MOBILE-RULE based
        // console.log('mobile-rule')
        this.dispText.showUserExpiry = true;
      } else if (this.audDto.pixelDataFile) {
        // MOBILE-LOCAL file based
        // console.log('mobile-local')
        this.dispText.showUserExpiry = false;
        this.dispText.fileDetailsString = 'Local file ( ' + this.audDto.pixelDataFile.name + ' )';
        this.dispText.fileDetailsIcon = 'fa-check'
      } else if (this.audDto.pixelDataSchedule) {
        // MOBILE-REMOTE file based
        // console.log('mobile-remote');
        this.dispText.showUserExpiry = false;
        this.dispText.fileDetailsString = 'Remote file ( ' + this.audDto.pixelDataSchedule.url + ' )';
        this.dispText.fileDetailsIcon = 'fa-check';

        if (this.audDto.pixelDataSchedule.nextRunTime) {
          this.dispText.nextRunTime = this.commonService.epochToDateFormatter(this.audDto.pixelDataSchedule.nextRunTime);
        } else {
          this.dispText.nextRunTime = '--';
        }

        if (this.audDto.pixelDataSchedule.lastSuccessTime) {
          this.dispText.lastSuccessTime = this.commonService.epochToDateFormatter(this.audDto.pixelDataSchedule.lastSuccessTime);
        } else {
          this.dispText.lastSuccessTime = '--';
        }


      }
    }
    this.dispText.userExpiry = 'User expires after ' + this.audDto.duration + ' '
      + this.audDto.durationUnit.toLowerCase() + '(s) from this audience.';
  }


  getDetailsById() {
    this.entitiesService.getDetailsById(this.audId, AppConstants.ENTITY.AUDIENCE).subscribe(response => {
      let breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      if (Object.entries(breadcrumbsObj).length === 0) {
        breadcrumbsObj = {
          audience: { id: this.audDto.id, name: this.audDto.name },
        };
      }
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  updateStatus(activate: number) {
    let msg = 'The Audience will be deactivated.';
    if (activate === 1) {
      msg = 'The Audience will be activated.';
    }
    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', msg)
    //   .then((confirmed) => {
    //     if (confirmed && activate === 1) {// PERFORM ACTIVATION
    //       this.audService.activateAudience(this.audId).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, 'Successfully activated audience', 'Error while activating audience!!');
    //       });

    //     } else if (confirmed && activate === 0) {// PERFORM DE-activation
    //       this.audService.deactivateAudience(this.audId).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, 'Successfully de-activated audience', 'Error while de-activating audience!!');
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
          this.audService.activateAudience(this.audId).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully activated audience', 'Error while activating audience!!');
          });

        } else if (confirmed && activate === 0) {// PERFORM DE-activation
          this.audService.deactivateAudience(this.audId).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully de-activated audience', 'Error while de-activating audience!!');
          });

        }
      }
    );

  }

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
      this.getAudienceDetails();
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);
  }

  syncNow() {
    let syncMsg = 'The Audience will be synced.';
    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', syncMsg)
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.audService.syncOnDetailsPage(this.audDto.id).subscribe(resp => {
    //         this.showMessageAfterSync(resp, 'Sync successfull.', 'Sync already running ...', 'Sync failed.');
    //       });
    //     }
    //   });

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: syncMsg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.audService.syncOnDetailsPage(this.audDto.id).subscribe(resp => {
            this.showMessageAfterSync(resp, 'Sync successfull.', 'Sync already running ...', 'Sync failed.');
          });
        }
      }
    );
  }

  showMessageAfterSync(apiResp, successMsg, warningMsg, errorMsg) {
    // console.log(apiResp);
    this.getAudienceDetails();
    if (apiResp && apiResp.respObject) {
      switch (apiResp.respObject.name) {
        case 'SUCCESS':
          this.alertService.success(successMsg, false, true);
          break;
        case 'RUNNING':
          this.alertService.warning(warningMsg, false, true);
          break;
      }

    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 2500);
  }

  sendDuplicateAud() {
    this.router.navigate(['/audience/duplicate/' + this.audDto.id]);
  }

}
