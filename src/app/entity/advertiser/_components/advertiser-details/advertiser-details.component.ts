import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesConstants } from '@app/shared/_constants/EntitiesConstants';
import { BulkUploadModalComponent } from '@app/shared/_directives/_modals/bulk-upload-modal/bulk-upload-modal.component';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { AdvertiserPojo, ApiResponseObjectSkadTargetPrivileges, BaseModel } from '@revxui/api-client-ts';
import * as moment from 'moment';

@Component({
  selector: 'app-advertiser-details',
  templateUrl: './advertiser-details.component.html',
  styleUrls: ['./advertiser-details.component.scss']
})
export class AdvertiserDetailsComponent implements OnInit {

  entityId: string;
  column = 'advertiserId';
  breadcrumbs = '';
  advPojo;
  advConst = AdvConstants;
  dateCreated: string;

  skadCampaignExist: boolean = false;
  skadCampaign: BaseModel = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService,
    private advService: AdvertiserService,
    private strService: StrategyService,
    private commonService: CommonService,
    private modal: MatDialog,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.advPojo = {} as AdvertiserPojo;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      // console.log(params.get('id'))
      if (id && !isNaN(Number(id))) {
        this.entityId = id;
        // this.getDetailsById(Number(id));
        this.getAdvertiserDetails(Number(id));
        this.getSkadDetails(Number(id));
      } else {
        this.router.navigate(['']);
      }

    });
    this.advService.refreshDetailsWatcher().subscribe(refresh => {
      if (refresh) {
        this.getAdvertiserDetails(Number(this.entityId));
      }
    });
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
      // console.log('breadcrumbs obj', breadcrumbsObj);
    });
  }

  getAdvertiserDetails(id: number) {
    this.advService.getById(id).subscribe(response => {
      // console.log('response ,', response);
      this.advPojo = response.respObject;

      // REVX-450: AdvertiserPojo should have an additional parameter "defaultLogoLink", which holds the advertiser logo url (cdn)

      this.dateCreated = this.commonService.epochToDateTimeFormatter(this.advPojo.creationTime);
    });
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


  //REVX-724
  getSkadDetails(id: number) {
    this.entitiesService.getSkadPrivledge('advertiserId', id).subscribe((resp: ApiResponseObjectSkadTargetPrivileges) => {
      console.log(resp);
      this.skadCampaignExist = (resp && resp.respObject && resp.respObject.data && resp.respObject.data.length > 0) ? true : false;
      this.skadCampaign = {
        id: resp.respObject.data[0].id,
        name: resp.respObject.data[0].name
      }
    }, (error: any) => {
      this.skadCampaignExist = false;
      this.skadCampaign = null;
    });
  }



}
