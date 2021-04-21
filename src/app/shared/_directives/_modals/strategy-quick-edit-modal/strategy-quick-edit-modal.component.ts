import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CampaignService } from '@app/entity/campaign/_services/campaign.service';
import { StrategyConstants } from '@app/entity/strategy/_constants/StrategyConstants';
import { bidTypeOpts, StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { QuickEditService } from '@app/shared/_services/quick-edit.service';
import { CampaignDTO, StrategyQuickEditDTO } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CpaTargetModalComponent } from '../cpa-target-modal/cpa-target-modal.component';

@Component({
  selector: 'app-strategy-quick-edit-modal',
  templateUrl: './strategy-quick-edit-modal.component.html',
  styleUrls: ['./strategy-quick-edit-modal.component.scss']
})
export class StrategyQuickEditModalComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;

  bidTypeDesc: string;

  SCONST = StrategyConstants;
  showProgressBar = false;
  strQuickEditDTO = {} as StrategyQuickEditDTO;
  campaignDTO = {} as CampaignDTO;

  quickEditGetResp: StrategyQuickEditDTO;
  appConst = AppConstants;
  // these options are hardcoded : ideally should be read from elastic search
  optBidType: any[] = bidTypeOpts;

  campaignFCap: number;
  campaignCurrency: string;

  strQuickDetails: any = {
    strategyName: null,
    dailyFCap: null, // boolean : is cmp fcap or not
    dailyFCapValue: null,
    fcapInterval: null,
    bidType: null,
    bidPrice: null,
    bidRangeMin: null,
    bidRangeMax: null
  };

  error: any = {
    name: { hasError: false, msg: '' },
    fCap: { hasError: false, msg: '' },
    bidPrice: { hasError: false, msg: '' },
    bidRangeMin: { hasError: false, msg: '' },
    bidRangeMax: { hasError: false, msg: '' },
    bidType: { hasError: false, msg: '' }
  };

  cpaTargetOptions: any = null;

  constructor(
    private modalRef: MatDialogRef<StrategyQuickEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private quickEditService: QuickEditService,
    private strService: StrategyService,
    private cmpService: CampaignService,
    public alertService: AlertService,
    private modal: MatDialog
  ) { }

  ngOnInit() {
    this.getDetails();
    this.blockUI.stop();
  }


  getDetails() {
    // call api to get
    this.showProgressBar = true;

    // this.setUpLocalObject(); //TESTING
    this.quickEditService.getQuickEditDetails(this.configData.strategyId).subscribe(resp => {
      if (resp && resp.respObject) {
        this.quickEditGetResp = resp.respObject;
        this.setUpLocalObject();
        this.cmpService.getById(this.quickEditGetResp.campaignId).subscribe(resp => {
          // assign campaign variables used in HTML
          if (resp && resp.respObject) {
            this.setCampaignDependentFeilds(resp.respObject);
            this.showProgressBar = false;
          } else {
            // DTO not received
          }

        }, (error: any) => {
          this.showProgressBar = false;
          this.blockUI.stop();

        });
      }
    }, (error: any) => {
      this.showProgressBar = false;
      this.blockUI.stop();

    });
  }

  setCampaignDependentFeilds(campaign: CampaignDTO) {
    this.campaignDTO = campaign;
    this.campaignFCap = campaign.dailyUserFcap; // daily default fcap of campaign
    this.campaignCurrency = campaign.currency.name;
  }

  setUpLocalObject() {
    this.strQuickDetails.strategyName = this.quickEditGetResp.name;
    this.strQuickDetails.dailyFCap = this.quickEditGetResp.campaignFcap;
    this.strQuickDetails.dailyFCapValue = this.quickEditGetResp.fcapFrequency;

    this.strQuickDetails.bidType = this.quickEditGetResp.pricingType;
    this.strQuickDetails.bidPrice = this.quickEditGetResp.pricingValue;

    this.strQuickDetails.bidRangeMin = this.quickEditGetResp.bidCapMin;
    this.strQuickDetails.bidRangeMax = (this.quickEditGetResp && this.quickEditGetResp.bidCapMax) ?
      (this.quickEditGetResp.bidCapMax === -1) ?
        null : this.quickEditGetResp.bidCapMax :
      null;

    //revx-656
    this.strQuickDetails.fcapInterval = this.quickEditGetResp.fcapInterval;
  }

  done() {
    if (this.isFormValid()) {
      this.blockUI.start();
      this.updateStrategyQuickEditPojo();
      // call api to save;
      this.quickEditService.updateQuickEditDetails(this.configData.strategyId, this.strQuickEditDTO).subscribe(resp => {
        this.showMessageAfterAction(resp);
        this.modalRef.close(true);
        this.blockUI.stop();
      }, (error: any) => {
        this.modalRef.close(null);
        this.blockUI.stop();
      });
    }
  }

  private isFormValid() {
    // Name validation
    const name = this.strQuickDetails.strategyName;
    if (name === null || name === undefined || name.trim().length === 0) {
      this.error['name'] = { hasError: true, msg: 'Please enter a valid strategy name' };
    } else {
      this.error['name'] = { hasError: false, msg: '' };
    }

    // dailyFcap validation
    const isUseCampaignFcap = this.strQuickDetails.dailyFCap;
    if (!isUseCampaignFcap) {
      // this.strQuickDetails.dailyFCapValue = parseInt(this.strQuickDetails.dailyFCapValue);
      const dailyFcapValue = this.strQuickDetails.dailyFCapValue;
      let bool1 = isNaN(+dailyFcapValue);
      let bool2 = this.hasSpclChar(dailyFcapValue.toString());
      let bool3 = (+dailyFcapValue) < 1;
      if (dailyFcapValue === null || dailyFcapValue === undefined || bool1 || bool2 || bool3) {
        this.error['fCap'] = { hasError: true, msg: 'Please enter a value greater than or equal to 1 and an integer value.' };
      } else {
        this.error['fCap'] = { hasError: false, msg: '' };


        //REVX-656
        //valid values for fcap interval : 1<= x <= 168
        const fcapFreq = this.strQuickDetails.fcapInterval;
        if (!fcapFreq || !Number.isInteger(fcapFreq) || +fcapFreq < 1 || +fcapFreq > 168) {
          // REVX-689
          this.error['fCap'] = { hasError: true, msg: 'Please enter a value from 1 till 168 for number of hours.' };
        } else {
          this.error['fCap'] = { hasError: false, msg: '' };
        }

      }
    } else {
      this.error['fCap'] = { hasError: false, msg: '' };
    }

    // Bid Type validation
    if (this.strQuickDetails.bidType === null || this.strQuickDetails.bidType === undefined) {
      this.error.bidType = { hasError: true, msg: 'Select the pricing type.' };
    } else {
      const index = this.optBidType.findIndex(item => item.value === this.strQuickDetails.bidType);
      if (this.optBidType[index].id === 'cpa' && !this.isPixelAssociatedWithCampaign()) {
        this.error.bidType = { hasError: true, msg: 'A pixel on parent campaign must be selected when the pricing type is CPA' };
      } else {
        this.error.bidType = { hasError: false, msg: '' };
      }
    }

    // Bid price validation
    if (this.strQuickDetails.bidPrice === null || this.strQuickDetails.bidPrice === undefined ||
      this.strQuickDetails.bidPrice.toString().trim().length === 0) {
      this.error.bidPrice = { hasError: true, msg: 'Enter a valid price value. Do not use special characters (.,&,$,@).' };
    } else {
      if (this.strService.hasSpecialCharacterCustom(this.strQuickDetails.bidPrice.toString(), /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/)) {
        this.error.bidPrice = { hasError: true, msg: 'Enter a valid price value. Do not use special characters (.,&,$,@).' };
      } else if (+this.strQuickDetails.bidPrice <= 0) {
        this.error.bidPrice = { hasError: true, msg: 'Please enter a value greater than 0' };
      } else {
        this.error.bidPrice = { hasError: false, msg: '' };
      }
    }

    // Bid Price Min validation
    if (this.strQuickDetails.bidRangeMin === null || this.strQuickDetails.bidRangeMin === undefined ||
      this.strQuickDetails.bidRangeMin.toString().trim().length === 0) {
      this.error.bidRangeMin = { hasError: false, msg: '' };
    } else {
      if (this.strService.hasSpecialCharacterCustom(this.strQuickDetails.bidRangeMin.toString(), /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/)) {
        this.error.bidRangeMin = { hasError: true, msg: 'Enter a valid number in min.' };
      } else if (+this.strQuickDetails.bidRangeMin < 0) {
        this.error.bidRangeMin = { hasError: true, msg: 'Please enter a value greater than or equal to 0 in min.' };
      } else {
        const bidMax = (this.strQuickDetails.bidRangeMax) ? +this.strQuickDetails.bidRangeMax : 0;
        if (+bidMax !== 0 && +this.strQuickDetails.bidRangeMin >= bidMax) {
          this.error.bidRangeMin = { hasError: true, msg: 'Bid Range Min value should be less than max value.' };
        } else {
          this.error.bidRangeMin = { hasError: false, msg: '' };
        }
      }
    }

    // Bid Price Max validation
    if (this.strQuickDetails.bidRangeMax === null || this.strQuickDetails.bidRangeMax === undefined ||
      this.strQuickDetails.bidRangeMax.toString().trim().length === 0) {
      this.error.bidRangeMax = { hasError: false, msg: '' };
    } else {
      if (this.strService.hasSpecialCharacterCustom(this.strQuickDetails.bidRangeMax.toString(), /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/)) {
        this.error.bidRangeMax = { hasError: true, msg: 'Enter a valid number in max.' };
      } else if (+this.strQuickDetails.bidRangeMax <= 0) {
        this.error.bidRangeMax = { hasError: true, msg: 'Please enter a value greater than 0 in max.' };
      } else {
        this.error.bidRangeMax = { hasError: false, msg: '' };
      }
    }

    // console.log(this.strQuickDetails);
    const errorList = Object.keys(this.error).filter(key => this.error[key].hasError);
    return (errorList.length > 0) ? false : true;
  }

  hasSpclChar(fcapManual: string): boolean {
    if (fcapManual.includes('.') || this.strService.hasSpecialCharacterCustom(fcapManual))
      return true;
    return false;
  }

  updateStrategyQuickEditPojo() {
    this.strQuickEditDTO.name = this.strQuickDetails.strategyName;

    this.strQuickEditDTO.campaignFcap = this.strQuickDetails.dailyFCap;
    this.strQuickEditDTO.fcapFrequency = (this.strQuickDetails.dailyFCap) ? (this.campaignFCap) : +this.strQuickDetails.dailyFCapValue;

    this.strQuickEditDTO.pricingType = this.strQuickDetails.bidType;
    // this.strQuickEditDTO.pricingValue = (this.strQuickDetails.bidPrice) ? +this.strQuickDetails.bidPrice : null;
    this.strQuickEditDTO.pricingValue = +this.strQuickDetails.bidPrice;

    const isNullMin = (!this.strQuickDetails.bidRangeMin) ? true : false;
    this.strQuickEditDTO.bidCapMin = (isNullMin) ? 0 : +this.strQuickDetails.bidRangeMin;

    const isNullMax = (!this.strQuickDetails.bidRangeMax) ? true : false;
    this.strQuickEditDTO.bidCapMax = (isNullMax) ? (-1) : +this.strQuickDetails.bidRangeMax;

    this.strQuickEditDTO.strategyType = this.quickEditGetResp.strategyType; // not to be edited
    this.strQuickEditDTO.campaignId = this.campaignDTO.id;
    this.strQuickEditDTO.id = this.configData.strategyId;

    /**
     * REVX-417: Strategy DTO should have a new fields
     * cpaTargetValue: number - value to update in the DB
     * This field should be updated according to the value selected by the user in the "Campaign CPA Value" pop-up
     */
    if (this.cpaTargetOptions) {
      if (this.cpaTargetOptions.copyBidPriceToCPATarget) {
        this.strQuickEditDTO.cpaTargetValue = this.strQuickEditDTO.pricingValue;
      } else {
        this.strQuickEditDTO.cpaTargetValue = this.cpaTargetOptions.cpaTargetValue;
      }
    } else {
      this.strQuickEditDTO.cpaTargetValue = null;
    }


    //REVX-656
    this.strQuickEditDTO.fcapInterval = (this.strQuickDetails.dailyFCap) ? null : +this.strQuickDetails.fcapInterval;


  }

  isPixelAssociatedWithCampaign() {
    const campaign: any = this.campaignDTO;
    const pixel: any = this.campaignDTO.pixel;

    if (pixel !== null && pixel !== undefined) {
      return true;
    }

    if (campaign !== null && campaign !== undefined && campaign.pixelId !== null && campaign.pixelId !== undefined) {
      return true;
    }
    return false;
  }

  cancel() {
    this.modalRef.close(null);
  }


  showMessageAfterAction(quickEditGetResp) {
    const successMsg = 'Successfully updated the strategy.';
    const errorMsg = 'Error while updating strategy';
    if (quickEditGetResp && quickEditGetResp.respObject) {
      this.alertService.success(successMsg, false, true);
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(function () {
      that.alertService.clear(true);
    }, 2500);

  }

  onBidTypeChange(event: any) {
    // console.log('[onBidTypeChange]', event);
    const index = this.optBidType.findIndex(item => item.value === event.value);
    if (index !== -1) {
      this.bidTypeDesc = this.optBidType[index].desc;

      // REVX-417 : check if CPA target value is populated for the campaing.
      this.checkCampaignCPATarget(this.optBidType[index].id);

      if (this.optBidType[index].id === 'cpa' && !this.isPixelAssociatedWithCampaign()) {
        this.error.bidType = { hasError: true, msg: 'A pixel on parent campign must be selected when the pricing type is CPA' };
      } else {
        this.error.bidType = { hasError: false, msg: '' };
      }
    } else {
      this.bidTypeDesc = '';
    }
  }

  /**
   * REVX-417: if Bid Type == CPA
   * Check if the parent campaign has cpaTarget value filled.
   * If filled - do nothing
   * else show Campaign CPA Value popup
   */
  private checkCampaignCPATarget(bidType) {
    if (bidType === 'cpa') {
      const campaignDetails = this.campaignDTO;
      if (!campaignDetails.cpaTarget) {

        const modalRef = this.modal.open(CpaTargetModalComponent, {
          maxHeight: '90vh',
          disableClose: true
        });

        modalRef.afterClosed().subscribe(
          result => {
            if (result !== null) {
              this.cpaTargetOptions = result;
            }
          }
        );

      }
    } else {
      this.cpaTargetOptions = null;
    }
  }

}
