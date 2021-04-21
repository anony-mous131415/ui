import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CpaTargetModalComponent } from '@app/shared/_directives/_modals/cpa-target-modal/cpa-target-modal.component';
import { CommonService } from '@app/shared/_services/common.service';
import { StrategyDTO } from '@revxui/api-client-ts';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { StrategyObjectsService } from '../../_services/strategy-objects.service';
import { bidTypeOpts, budgetPacingOpts, budgetPacingOptsDaily, MODE, StrategyService } from '../../_services/strategy.service';
import { StrategyBulkEditService } from '../../_services/strategy-bulk-edit.service';

@Component({
  selector: 'app-strategy-edit-budget',
  templateUrl: './strategy-edit-budget.component.html',
  styleUrls: ['./strategy-edit-budget.component.scss']
})
// export class StrategyEditBudgetComponent implements OnInit , ComponentCanDeactivate {
export class StrategyEditBudgetComponent implements OnInit {

  strDetailsSub: Subscription;

  @Input('mode') mode: number;
  @Input() isBulkEdit: boolean;  //revx-371 : bulk edit
  @Input() openFromCampaignDetails: boolean;


  strategyDTO: StrategyDTO;
  SCONST = StrategyConstants;
  MODE = MODE;
  title = StrategyConstants.STEP_TITLE_BUDGET;

  lifeTimeMediaBudgetType: number;
  budgetPacing: number;
  bidType: number;
  bidTypeDesc: string;

  campaignBudgetDescUnlimited: string;
  campaignBudgetDescLimitTo: string;
  campaignCurrency: string;

  // these options are hardcoded : ideally should be read from elastic search
  optsBudgetPacing: any[] = budgetPacingOpts;

  // these options are hardcoded : ideally should be read from elastic search
  optBidType: any[] = bidTypeOpts;

  error = cloneDeep(this.strObjService.errorBuget);
  campaign: any = null;
  strBudgetDetails = cloneDeep(this.strObjService.strBudgetDetails);

  cpaTargetOptions: any = null;

  budget = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }

  constructor(
    private strService: StrategyService,
    private strObjService: StrategyObjectsService,
    private commonService: CommonService,
    private modal: MatDialog,
    private bulkEditService: StrategyBulkEditService

  ) { }

  ngOnInit() {

    if (this.isBulkEdit) {
      this.setBulkEditParams();
    }
    this.subscribeToEvents();
  }

  onLifeTimeMediaBudgetChange(event) {
    if (event.value === 1) {
      this.strategyDTO.budgetValue = null;
    }
  }

  onLifetimeMediaBudgetValueChange(event) {
    const budget = this.campaign['lifetimeBudget'];
    if (budget !== null && budget !== undefined && budget !== -1) {
      this.campaignBudgetDescLimitTo = `[ ${this.getCampaignBudgetPercentage(budget, +event.target.value)} of Campaign's budget ]`;
    }
  }

  onDailyMediaBudgetValueChange(event) {
    const value = event.target.value;
    if (value.trim().length === 0) {
      this.optsBudgetPacing = budgetPacingOpts;
      this.strBudgetDetails.pacing = 1;
    } else {
      this.optsBudgetPacing = budgetPacingOptsDaily;
      this.strBudgetDetails.pacing = 6;
    }
  }

  onBidTypeChange(event: any) {
    // console.log('[onBidTypeChange]', event);
    const index = this.optBidType.findIndex(item => item.value === event.value);
    if (index !== -1) {
      this.bidTypeDesc = this.optBidType[index].desc;

      // REVX-352 : check if CPA target value is populated for the campaing.
      this.checkCampaignCPATarget(this.optBidType[index].id);

      if (this.optBidType[index].id === 'cpa' && !this.isPixelAssociatedWithCampaign(this.strategyDTO)) {
        this.error.bidType = { hasError: true, msg: 'A pixel on parent campign must be selected when the pricing type is CPA' };
      } else {
        this.error.bidType = { hasError: false, msg: '' };
      }
    } else {
      this.bidTypeDesc = '';
    }
  }

  goToPrevStep() {
    const confirmation = confirm(AppConstants.WARNING_MSG);
    if (confirmation) {
      if (this.mode === MODE.CREATE) {
        this.resetLocalValues();
      }
      this.goToStep(2, false);
    }
  }

  resetLocalValues() {
    // this.lifeTimeMediaBudgetType
    // this.budgetPacing
    // this.bidType
    // this.bidTypeDesc

    // this.campaignBudgetDescUnlimited
    // this.campaignBudgetDescLimitTo;
    // this.campaignCurrency
    this.error = cloneDeep(this.strObjService.errorBuget);
    // campaign: any = null;
    this.strBudgetDetails = cloneDeep(this.strObjService.strBudgetDetails);
  }

  goToNextStep() {
    if (this.isBulkEdit && !this.openFromCampaignDetails) {
      this.goToStep(5, true);
    } else {
      this.goToStep(4, true);
    }
  }

  onReviewAndSave() {
    this.goToStep(5, true);
  }

  private isFormValid() {
    const isLifetimeMediaBudgetUnlimited = this.strBudgetDetails.lifetimeMediaBudget === -1 ? true : false;
    if (isLifetimeMediaBudgetUnlimited) {
      this.error.lifetimeBudget = { hasError: false, msg: '' };
    } else {
      if (this.strBudgetDetails.lifetimeMediaBudgetValue === null ||
        this.strBudgetDetails.lifetimeMediaBudgetValue === undefined ||
        this.strBudgetDetails.lifetimeMediaBudgetValue.toString().trim().length === 0) {
        this.error.lifetimeBudget = {
          hasError: true,
          msg: 'Enter a valid budget. Do not use special characters (.,&,$,@). Alternately select \'Unlimited\''
        };
      } else {
        if (this.strService.hasSpecialCharacters(this.strBudgetDetails.lifetimeMediaBudgetValue)) {
          this.error.lifetimeBudget = {
            hasError: true,
            msg: 'Please enter a valid number.'
          };
        } else if (+this.strBudgetDetails.lifetimeMediaBudgetValue <= 0) {
          this.error.lifetimeBudget = {
            hasError: true,
            msg: 'Please enter a value greater than 0'
          };
        } else {
          const cmpgnBudget = this.strategyDTO.campaign['lifetimeBudget'];
          if (!(cmpgnBudget === null || cmpgnBudget === undefined || cmpgnBudget === -1)
            && +this.strBudgetDetails.lifetimeMediaBudgetValue > cmpgnBudget) {
            this.error.lifetimeBudget = {
              hasError: true,
              msg: 'Lifetime media budget cannot be greater than campaign budget.'
            };
          } else {
            this.error.lifetimeBudget = { hasError: false, msg: '' };
          }
        }
      }
    }

    if (this.strBudgetDetails.dailyMediaBudgetValue === null || this.strBudgetDetails.dailyMediaBudgetValue === undefined ||
      this.strBudgetDetails.dailyMediaBudgetValue.toString().trim().length === 0) {
      if (this.strBudgetDetails.pacing === 1 || this.strBudgetDetails.pacing === 6) {
        this.error.dailyMediaBudget = { hasError: false, msg: '' };
      } else {
        this.error.dailyMediaBudget = { hasError: true, msg: 'Please enter a valid number.' };
      }
    } else {
      if (this.strService.hasSpecialCharacters(this.strBudgetDetails.dailyMediaBudgetValue)) {
        this.error.dailyMediaBudget = { hasError: true, msg: 'Please enter a valid number.' };
      } else if (+this.strBudgetDetails.dailyMediaBudgetValue <= 0) {
        this.error.dailyMediaBudget = { hasError: true, msg: 'Please enter a value greater than 0' };
      } else if (!isLifetimeMediaBudgetUnlimited && this.strBudgetDetails.lifetimeMediaBudgetValue !== null
        && +this.strBudgetDetails.lifetimeMediaBudgetValue < +this.strBudgetDetails.dailyMediaBudgetValue) {
        this.error.dailyMediaBudget = { hasError: true, msg: 'Please enter a value less than or equal to lifetime budget.' };
      } else if (isLifetimeMediaBudgetUnlimited && this.strBudgetDetails.dailyMediaBudgetValue !== null
        && this.strBudgetDetails.dailyMediaBudgetValue !== undefined) {
        const cmpgnBudget = (this.strategyDTO.campaign as any).lifetimeBudget;
        if (cmpgnBudget > 0 && +this.strBudgetDetails.dailyMediaBudgetValue >= cmpgnBudget) {
          this.error.dailyMediaBudget = { hasError: true, msg: 'Please enter a value less than campaign budget.' };
        } else {
          this.error.dailyMediaBudget = { hasError: false, msg: '' };
        }
      } else {
        this.error.dailyMediaBudget = { hasError: false, msg: '' };
      }
    }

    if (this.strBudgetDetails.bidType === null || this.strBudgetDetails.bidType === undefined) {
      this.error.bidType = { hasError: true, msg: 'Select the pricing type.' };
    } else {
      const index = this.optBidType.findIndex(item => item.value === this.strBudgetDetails.bidType);
      if (this.optBidType[index].id === 'cpa' && !this.isPixelAssociatedWithCampaign(this.strategyDTO)) {
        this.error.bidType = { hasError: true, msg: 'A pixel on parent campign must be selected when the pricing type is CPA' };
      } else {
        this.error.bidType = { hasError: false, msg: '' };
      }
    }

    if (this.strBudgetDetails.bidPrice === null || this.strBudgetDetails.bidPrice === undefined ||
      this.strBudgetDetails.bidPrice.toString().trim().length === 0) {
      this.error.bidPrice = { hasError: true, msg: 'Enter a valid price value. Do not use special characters (.,&,$,@).' };
    } else {
      if (this.strService.hasSpecialCharacters(this.strBudgetDetails.bidPrice, /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/)) {
        this.error.bidPrice = { hasError: true, msg: 'Enter a valid price value. Do not use special characters (.,&,$,@).' };
      } else if (+this.strBudgetDetails.bidPrice <= 0) {
        this.error.bidPrice = { hasError: true, msg: 'Please enter a value greater than 0' };
      } else {
        this.error.bidPrice = { hasError: false, msg: '' };
      }
    }

    if (this.strBudgetDetails.bidRangeMin === null || this.strBudgetDetails.bidRangeMin === undefined ||
      this.strBudgetDetails.bidRangeMin.toString().trim().length === 0) {
      this.error.bidRangeMin = { hasError: false, msg: '' };
    } else {
      if (this.strService.hasSpecialCharacters(this.strBudgetDetails.bidRangeMin, /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/)) {
        this.error.bidRangeMin = { hasError: true, msg: 'Enter a valid number in min.' };
      } else if (+this.strBudgetDetails.bidRangeMin < 0) {
        this.error.bidRangeMin = { hasError: true, msg: 'Please enter a value greater than or equal to 0 in min.' };
      } else {
        const bidMax = (this.strBudgetDetails.bidRangeMax) ? +this.strBudgetDetails.bidRangeMax : 0;
        if (+bidMax !== 0 && +this.strBudgetDetails.bidRangeMin >= bidMax) {
          this.error.bidRangeMin = { hasError: true, msg: 'Bid Range Min value should be less than max value.' };
        } else {
          this.error.bidRangeMin = { hasError: false, msg: '' };
        }
      }
    }

    if (this.strBudgetDetails.bidRangeMax === null || this.strBudgetDetails.bidRangeMax === undefined ||
      this.strBudgetDetails.bidRangeMax.toString().trim().length === 0) {
      this.error.bidRangeMax = { hasError: false, msg: '' };
    } else {
      if (this.strService.hasSpecialCharacters(this.strBudgetDetails.bidRangeMax, /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/)) {
        this.error.bidRangeMax = { hasError: true, msg: 'Enter a valid number in max.' };
      } else if (+this.strBudgetDetails.bidRangeMax <= 0) {
        this.error.bidRangeMax = { hasError: true, msg: 'Please enter a value greater than 0 in max.' };
      } else {
        // const bidMin = (this.strBudgetDetails.bidRangeMin) ? +this.strBudgetDetails.bidRangeMin : 0;
        // if (+this.strBudgetDetails.bidRangeMax < bidMin) {
        //   this.error.bidRangeMax = { hasError: true, msg: 'Bid Range Min value should be less than Max value.' };
        // } else {
        this.error.bidRangeMax = { hasError: false, msg: '' };
        // }
      }
    }

    // if(this.strBudgetDetails.bidRangeMin !== null && this.strBudgetDetails.bidRangeMin !== undefined )

    const errorList = Object.keys(this.error).filter(key => this.error[key].hasError);
    if (errorList.length > 0) {
      this.strService.scrollToError();
    }
    return (errorList.length > 0) ? false : true;
  }

  private updateStrategyObject() {
    this.strategyDTO = this.strService.getStrDetails();

    this.strategyDTO.budgetValue = this.strBudgetDetails.lifetimeMediaBudget === -1 ? -1 :
      this.strBudgetDetails.lifetimeMediaBudgetValue;

    this.strategyDTO.pacingBudgetValue = (this.strBudgetDetails.dailyMediaBudgetValue) ?
      +this.strBudgetDetails.dailyMediaBudgetValue : null;
    this.strategyDTO.pacingType = { id: this.strBudgetDetails.pacing };

    this.strategyDTO.pricingType = { id: this.strBudgetDetails.bidType };
    this.strategyDTO.pricingValue = (this.strBudgetDetails.bidPrice) ? +this.strBudgetDetails.bidPrice : null;

    this.strategyDTO.bidCapMin = this.strBudgetDetails.bidRangeMin;
    this.strategyDTO.bidCapMax = this.strBudgetDetails.bidRangeMax;

    /**
     * REVX-352: Strategy DTO should have a new fields
     * cpaTargetValue: number - value to update in the DB
     * This field should be updated according to the value selected by the user in the "Campaign CPA Value" pop-up
     */
    if (this.cpaTargetOptions) {
      if (this.cpaTargetOptions.copyBidPriceToCPATarget) {
        this.strategyDTO.cpaTargetValue = this.strategyDTO.pricingValue;
      } else {
        this.strategyDTO.cpaTargetValue = this.cpaTargetOptions.cpaTargetValue;
      }
    } else {
      this.strategyDTO.cpaTargetValue = null;
    }

    this.strService.setStrDetails(this.strategyDTO);
  }

  private subscribeToEvents() {
    this.strDetailsSub = this.strService.onStrategyDetailsSet.subscribe(
      param => {
        this.handleStrategyDetailsSet(param.strDetails);
        this.resetErrorObject();
      }
    );
  }

  resetErrorObject() {
    this.error = cloneDeep(this.strObjService.errorBuget);
  }

  private handleStrategyDetailsSet(strDetails: StrategyDTO) {
    if (strDetails !== null) {
      this.strategyDTO = strDetails;
      this.setBudgetAndBiddingDetails(strDetails);
    }
  }

  private setBudgetAndBiddingDetails(strDetails: StrategyDTO) {

    this.campaign = strDetails.campaign;
    this.strBudgetDetails.lifetimeMediaBudget = (!strDetails.budgetValue) ? -1 : (strDetails.budgetValue === -1) ? -1 : 1;
    this.strBudgetDetails.lifetimeMediaBudgetValue = (strDetails.budgetValue === -1) ? null : strDetails.budgetValue;
    this.strBudgetDetails.dailyMediaBudgetValue = strDetails.pacingBudgetValue;

    const budget = strDetails.campaign ? strDetails.campaign['lifetimeBudget'] : null;
    this.campaignCurrency = strDetails.campaign ? strDetails.campaign['currencyCode'] : null;
    this.campaignBudgetDescUnlimited = (budget === null || budget === undefined || budget === -1) ? `[ Campaign Budget is unlimited ]` :
      `[ Campaign Budget is ${budget} ${this.campaignCurrency} ]`;
    this.campaignBudgetDescLimitTo = (budget === null || budget === undefined || budget === -1) ? `[ Campaign Budget is unlimited ]` :
      `[ ${this.getCampaignBudgetPercentage(budget, this.strBudgetDetails.lifetimeMediaBudgetValue)} of Campaign's budget ]`;

    const budgetPacing = (strDetails.pacingType) ? strDetails.pacingType.id : 1;
    if (budgetPacing === 1 || (strDetails.pacingBudgetValue && strDetails.pacingBudgetValue.toString().trim().length === 0)) {
      this.optsBudgetPacing = budgetPacingOpts;
    } else {
      this.optsBudgetPacing = budgetPacingOptsDaily;
    }
    this.strBudgetDetails.pacing = budgetPacing;
    this.strBudgetDetails.bidType = (strDetails.pricingType) ? strDetails.pricingType.id : null;
    const index = this.optBidType.findIndex(item => item.value === this.strBudgetDetails.bidType);
    this.bidTypeDesc = (index !== -1) ? this.optBidType[index].desc : '';
    this.strBudgetDetails.bidPrice = strDetails.pricingValue;
    this.strBudgetDetails.bidRangeMin = strDetails.bidCapMin;
    this.strBudgetDetails.bidRangeMax = (strDetails && strDetails.bidCapMax) ?
      (strDetails.bidCapMax === -1) ?
        null : strDetails.bidCapMax :
      null;

  }

  private getCampaignBudgetPercentage(cmpgnBudget: number, inpValue?: number) {

    if (cmpgnBudget === null || cmpgnBudget === undefined || cmpgnBudget <= 0 ||
      inpValue === null || inpValue === undefined || inpValue <= 0) {
      return '0%';
    }
    const percent = (inpValue * 100) / cmpgnBudget;
    return this.commonService.nrFormat(percent, AppConstants.NUMBER_TYPE_PERCENTAGE);
  }

  private isPixelAssociatedWithCampaign(strategyDTO: StrategyDTO) {
    const campaign: any = strategyDTO.campaign;
    const pixel: any = strategyDTO.pixels;

    if (pixel !== null && pixel !== undefined) {
      return true;
    }

    if (campaign !== null && campaign !== undefined && campaign.pixelId !== null && campaign.pixelId !== undefined) {
      return true;
    }

    return false;
  }

  private goToStep(stepNo: number, performValidation: boolean) {
    if (!performValidation) {
      this.strService.setStepperIndex(stepNo);
    }


    const valid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (performValidation && valid) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
      this.strService.setMaxStepperVisited(4);
      this.strService.setStepperIndex(stepNo);
    }
  }

  /**
   * REVX-352: if Bid Type == CPA
   * Check if the parent campaign has cpaTarget value filled.
   * If filled - do nothing
   * else show Campaign CPA Value popup
   */
  private checkCampaignCPATarget(bidType) {
    if (bidType === 'cpa') {
      const campaignDetails = this.strService.getCampaignDetails();
      console.log(campaignDetails);
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
  validate() {
    const valid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (valid) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
    }
  }





  setBulkEditParams() {
    let requiredParams = this.bulkEditService.getBulkEditSettings(this.SCONST.STEP_TITLE_BUDGET);
    if (requiredParams) {
      this.budget = requiredParams as any;
    }
  }


  //revx-371 : bulk edit
  updateBulkEditSelection() {
    if (this.isBulkEdit) {
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.BUDGET, this.budget.selectedBulkEditOpt);
    }
  }


  isToBeHidden() {
    if (this.isBulkEdit) {
      return this.budget.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
    }
    return false;
  }


  //revx-371 in bulk edit only dates are validated
  isFormValidForBulkEdit() {
    if (this.budget.selectedBulkEditOpt === this.SCONST.NO_CHANGE) {
      return true;
    }
    return this.isFormValid();
  }




}
