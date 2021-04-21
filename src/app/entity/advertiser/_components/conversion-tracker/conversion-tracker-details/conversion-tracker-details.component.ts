import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { PixelConstants } from '@app/entity/advertiser/_constants/PixelConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { Pixel } from '@revxui/api-client-ts';

@Component({
  selector: 'app-conversion-tracker-details',
  templateUrl: './conversion-tracker-details.component.html',
  styleUrls: ['./conversion-tracker-details.component.scss']
})
export class ConversionTrackerDetailsComponent implements OnInit {

  advId: string;
  pixelId: string;
  pixelConst = PixelConstants;
  pixel = {} as Pixel;

  pixelMaxTimeClickToConv: string;
  pixelMaxTimeViewToConv: string;
  countPerUser: number;
  breadcrumbs: string;
  entityId: number;
  entity: string;
  appConst = AppConstants;

  //REVX-588 : ui shows loader when calling api
  showProgressBar: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advService: AdvertiserService,
    private entitiesService: EntitiesService,
    public alertService: AlertService,
    private modal: MatDialog
  ) { }

  ngOnInit() {
    this.entity = 'Conversion-tracker';
    this.route.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      const pid = params.get('pid');
      if (!isNaN(Number(id)) && !isNaN(Number(pid))) {
        this.advId = id;
        this.pixelId = pid;
        this.getDetailsById(Number(id));
        this.getPixelDetails(Number(pid));
      } else {
        this.router.navigate(['']);
      }

    });

  }


  //REVX-588 : ui shows loader when calling api
  getPixelDetails(id: number) {
    this.showProgressBar = true;
    this.advService.getPixelById(id).subscribe(response => {
      this.pixel = response.respObject;
      this.showProgressBar = false;
    }, (error: any) => {
      this.alertService.error("Error while fetching conversion tracker details");
      this.showProgressBar = false;
    });
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  // updateUIdata() {
  //   // this.pixelMaxTimeClickToConv = this.getDuration(this.pixel.clickValidityWindow);
  // }

  // getDuration(seconds: number) {
  //   let str = '';
  //   if(seconds >= 86400){

  //   }
  //   return str;
  // }

  updateStatus(activate: number) {
    let msg = 'The Conversion-tracker will be deactivated';
    if (activate === 1) {
      msg = 'The Conversion-tracker will be activated';
    }
    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', msg)
    //   .then((confirmed) => {
    //     if (confirmed && activate === 1) {// PERFORM ACTIVATION
    //       this.advService.activatePixels(this.pixelId).subscribe(apiResp => {
    //         this.getPixelDetails(Number(this.pixelId));
    //         this.showMessageAfterAction(apiResp, "Successfully activated Conversion-tracker", "Error while activating Conversion-tracker!!");
    //       });
    //     } else if (confirmed && activate === 0) {// PERFORM DE-activation
    //       this.advService.deactivatePixels(this.pixelId).subscribe(apiResp => {
    //         this.getPixelDetails(Number(this.pixelId));
    //         this.showMessageAfterAction(apiResp, "Successfully de-activated Conversion-tracker", "Error while de-activating Conversion-tracker!!");
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
          this.advService.activatePixels(this.pixelId).subscribe(apiResp => {
            this.getPixelDetails(Number(this.pixelId));
            this.showMessageAfterAction(apiResp, 'Successfully activated Conversion-tracker',
              'Error while activating Conversion-tracker!!');
          });
        } else if (confirmed && activate === 0) {// PERFORM DE-activation
          this.advService.deactivatePixels(this.pixelId).subscribe(apiResp => {
            this.getPixelDetails(Number(this.pixelId));
            this.showMessageAfterAction(apiResp, 'Successfully de-activated Conversion-tracker',
              'Error while de-activating Conversion-tracker!!');
          });
        }
      }
    );
  }

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 2000);

  }




}
