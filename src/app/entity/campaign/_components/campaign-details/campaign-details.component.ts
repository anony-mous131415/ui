import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { CampaignService } from '@app/entity/campaign/_services/campaign.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { CampaignDTO } from '@revxui/api-client-ts';
import { StrategyBulkEditService } from '@app/entity/strategy/_services/strategy-bulk-edit.service';
import { BulkEditActivityLogComponent } from '@app/entity/strategy/_directives/_modals/bulk-edit-activity-log/bulk-edit-activity-log.component';


interface DisaplayDTO {
  active?: any; // boolean;
  advertiserId?: any; // number;
  attributionRatio?: any; // number;
  budget?: any; // number;
  createdBy?: any; // number;
  creationTime?: any; // number;
  currency?: any; // BaseModel;
  currencyCode?: any; // string;
  dailyBudget?: any; // number;
  dailyDeliveryCap?: any; // number;
  dailyUserFcap?: any; // number;
  daysDuration?: any; // number;
  daysElapsed?: any; // number;
  endTime?: any; // number;
  fcap?: any; // number;
  flowRate?: any; // number;
  id?: any; // number;
  ivsDistribution?: any; // number;
  licensee?: any; // BaseModel;
  licenseeId?: any; // number;
  lifetimeBudget?: any; // number;
  lifetimeDeliveryCap?: any; // number;
  lifetimeUserFcap?: any; // number;
  modifiedBy?: any; // number;
  modifiedTime?: any; // number;
  name?: any; // string;
  objective?: any; // string;
  pixel?: any; // BaseModel;
  platformMargin?: any; // number;
  pricingId?: any; // number;
  region?: any; // BaseModel;
  retargeting?: any; // boolean;
  startTime?: any; // number;
  userFcapDuration?: any; // number;
  cpaTarget?: number;
}

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.scss']
})
export class CampaignDetailsComponent implements OnInit {

  cmpId: number;
  column = 'campaignId';
  breadcrumbs: string;
  cmpConst = CampaignConstants;
  campaignDTO; displayDTO;
  appConst = AppConstants;


  currencyUnits: string;
  deliveryCapUnits: string;

  public pricingList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService,
    private cmpService: CampaignService,
    private commonService: CommonService,
    private alertService: AlertService,
    private menuService: MenucrumbsService,
    private modal: MatDialog,
    private strBulkEditService: StrategyBulkEditService,

  ) { }

  ngOnInit() {
    this.campaignDTO = {} as CampaignDTO;
    this.displayDTO = {} as DisaplayDTO;

    this.route.paramMap.subscribe(params => {
      const cid = params.get('cid');
      if (!isNaN(Number(cid))) {
        this.cmpId = Number(params.get('cid'));
        this.getDetailsById();
        this.getCampaignDetails();
      } else {
        this.router.navigate(['']);
      }
    });
  }

  // for breadcrumbs
  getDetailsById() {
    this.entitiesService.getDetailsById(this.cmpId, AppConstants.ENTITY.CAMPAIGN).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  fetchPricingList() {
    this.commonService.getDictionary('PRICING', 1, 1000).subscribe(resp => {
      const indexToBeRemoved = resp.respObject.data.findIndex(x => x.name === CampaignConstants.PRICING.REV_SHARE);
      resp.respObject.data.splice(indexToBeRemoved, 1);

      this.pricingList = resp.respObject.data;
      this.currencyUnits = ' ' + this.campaignDTO.currency.name; // set currency units
      switch (this.pricingList[this.pricingList.findIndex(x => x.id === this.campaignDTO.pricingId)].name) {
        case CampaignConstants.PRICING.CPM:
          this.deliveryCapUnits = ' Impressions';
          break;
        case CampaignConstants.PRICING.CPC:
          this.deliveryCapUnits = ' Clicks';
          break;
        case CampaignConstants.PRICING.CPA:
          this.deliveryCapUnits = ' Conversions';
          break;
      }
      // console.log(this.pricingList);
      this.initDisplayDto(this.campaignDTO);
    });
  }

  getCampaignDetails() {
    this.cmpService.getById(this.cmpId).subscribe(response => {
      // console.log('campaing DTO==>', response);
      this.campaignDTO = response.respObject;
      this.fetchPricingList();
    });
  }

  initDisplayDto(resp: CampaignDTO) {
    // --------------------first 8 rows --------------------------------------------------------
    this.displayDTO.active = resp.active;
    this.displayDTO.startTime = this.commonService.epochToDateTimeFormatter(resp.startTime);
    this.displayDTO.creationTime = this.commonService.epochToDateTimeFormatter(resp.creationTime);

    // Lifetime Media Budget
    if (resp.lifetimeBudget === -1) {
      this.displayDTO.lifetimeBudget = 'Unlimited';
    } else {
      this.displayDTO.lifetimeBudget = this.commonService.nrFormatWithComma(resp.lifetimeBudget) + this.currencyUnits;
    }
    // Lifetime Delivery Cap
    if (resp.lifetimeDeliveryCap === null) {
      this.displayDTO.lifetimeDeliveryCap = 'Delivery cap not set';
    } else {
      this.displayDTO.lifetimeDeliveryCap = this.commonService.nrFormatWithComma(resp.lifetimeDeliveryCap) + this.deliveryCapUnits;
    }
    // Default Daily Frequency Cap
    this.displayDTO.dailyUserFcap = 'Show ad no more than ' + resp.dailyUserFcap + ' times in one day';

    const value = (resp && resp.fcap) ? resp.fcap : resp.dailyUserFcap;
    this.displayDTO.fcap = 'Show ad no more than ' + value + ' times in one day';

    // PRICING
    if (this.pricingList[this.pricingList.findIndex(x => x.id === resp.pricingId)].name === 'Margin') {
      // random behaviour on margin of 28 => 28.000000000004
      const rate: number = (resp.flowRate * 100);
      let rateStr: string;
      if (rate.toString().includes('.')) {
        rateStr = rate.toFixed(2);
        rateStr = (rateStr.endsWith('.00')) ? rateStr.split('.')[0] : rateStr; // truncate trailing zeros
      } else {
        rateStr = rate.toString();
      }

      this.displayDTO.pricingId = 'Margin ' + rateStr + '%';
    } else {
      this.displayDTO.pricingId = this.pricingList[this.pricingList
        .findIndex(x => x.id === resp.pricingId)].name + ' ' + (resp.flowRate) + this.currencyUnits;
    }

    // Lifetime Frequency Cap
    if (resp.lifetimeUserFcap === -1 || resp.lifetimeUserFcap === null) {
      this.displayDTO.lifetimeUserFcap = 'Unlimited';
    } else {
      this.displayDTO.lifetimeUserFcap = 'Show ad no more than ' + resp.lifetimeUserFcap + ' times';
    }
    // --------------------last 7 rows --------------------------------------------------------

    // Id
    this.displayDTO.id = resp.id;
    // attribution ratio
    this.displayDTO.attributionRatio = (resp.attributionRatio * 100) + ' % (attribute all post-view conversions)';
    // endtime
    if (resp.endTime >= CampaignConstants.NEVER_ENDING_EPOCH) {
      this.displayDTO.endTime = 'Never Ending';
    } else {
      this.displayDTO.endTime = this.commonService.epochToDateTimeFormatter(resp.endTime);
      // this.displayDTO.endTime = moment.utc(resp.endTime * 1000).format('llll');
    }
    // dailymedia budget
    if (resp.dailyBudget === -1) {
      this.displayDTO.dailyBudget = 'Unlimited';
    } else {
      this.displayDTO.dailyBudget = this.commonService.nrFormatWithComma(resp.dailyBudget) + this.currencyUnits;
    }
    // Daily Delivery Cap
    if (resp.dailyDeliveryCap === null) {
      this.displayDTO.dailyDeliveryCap = 'Daily Delivery cap not set';

    } else {
      this.displayDTO.dailyDeliveryCap = this.commonService.nrFormatWithComma(resp.dailyDeliveryCap) + this.deliveryCapUnits;

    }
    // pixel
    this.displayDTO.pixel = resp.pixel;
    // console.log(this.displayDTO);

    // REVX-352: set the CPA Traget value in displayDTO
    this.displayDTO.cpaTarget = (resp && resp['cpaTarget']) ? resp['cpaTarget'] : 'NA';
  }


  // for acctivate and deactivate
  updateStatus(activate: number) {
    let msg = 'The Campaign will be deactivated';
    if (activate === 1) {
      msg = 'The Campaign will be activated';
    }
    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', msg)
    //   .then((confirmed) => {
    //     if (confirmed && activate === 1) {// PERFORM ACTIVATION
    //       this.cmpService.activateCmps(this.cmpId).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, "Successfully activated campaign", "Error while activating campaign!!");
    //       });

    //     } else if (confirmed && activate === 0) {// PERFORM DE-activation
    //       this.cmpService.deactivateCmps(this.cmpId).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, "Successfully de-activated campaign", "Error while de-activating campaign!!");
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
          this.cmpService.activateCmps(this.cmpId).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully activated campaign', 'Error while activating campaign!!');
          });

        } else if (confirmed && activate === 0) {// PERFORM DE-activation
          this.cmpService.deactivateCmps(this.cmpId).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully de-activated campaign', 'Error while de-activating campaign!!');
          });

        }
      }
    );

  }

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
      this.getCampaignDetails();
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);
  }

  gotoPixel() {
    // goto : advertiser/:id/pixel/details/:pid
    this.router.navigate(['advertiser', this.campaignDTO.advertiserId, 'pixel', 'details', this.campaignDTO.pixel.id]);
  }




  //revx-371 : bulk edit
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
