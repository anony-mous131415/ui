import { Component, Input, OnDestroy, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitySelectorRadioComponent } from '@app/shared/_directives/entity-selector-radio/entity-selector-radio.component';
import { CommonService } from '@app/shared/_services/common.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { StrategyDTO, BaseModel, ApiResponseObjectSkadTargetPrivileges, StrategyControllerService } from '@revxui/api-client-ts';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { StrategyObjectsService } from '../../_services/strategy-objects.service';
import { MODE, StrategyService, SkadSettings, DEFAULT_SKAD_SETTINGS } from '../../_services/strategy.service';
import { MatRadioChange } from '@angular/material';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { AlertService } from '@app/shared/_services/alert.service';
import { StrategyBulkEditService } from '@app/entity/strategy/_services/strategy-bulk-edit.service'


@Component({
  selector: 'app-strategy-edit-basic',
  templateUrl: './strategy-edit-basic.component.html',
  styleUrls: ['./strategy-edit-basic.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StrategyEditBasicComponent implements OnInit, OnDestroy {
  @Input() mode: number;
  @Input() isBulkEdit: boolean;


  // nameOptions = {
  //   allowedBulkEditOpts: [],
  //   selectedBulkEditOpt: null
  // }

  scheduleOptions = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }



  @Output() skadTrigger = new EventEmitter<{ isCampChanged: boolean, cmpId: number }>();


  strDetailsSub: Subscription;
  cmpgnDetailsSub: Subscription;
  advDetailsSub: Subscription;
  reCheckEndTimeFlagSub: Subscription;
  onCampaignDetailsResetSub: Subscription;


  SCONST = StrategyConstants;
  MODE = MODE;
  title = StrategyConstants.STEP_TITLE_BASIC;

  startTimeMin: Date = new Date();
  endTimeMin: Date = new Date();

  startTimeMax: Date = new Date(CampaignConstants.NEVER_ENDING_EPOCH * 1000);
  endTimeMax: Date = new Date(CampaignConstants.NEVER_ENDING_EPOCH * 1000);
  isStartCheckBoxDisabled: boolean;
  isEndCheckBoxDisabled: boolean;

  requestInProgress: boolean = true;
  strategyDTO = {} as StrategyDTO;

  selAdvertiser: any;
  selCampaign: any;

  strBasicDetails = cloneDeep(this.strObjService.strBasicDetails);
  error = cloneDeep(this.strObjService.errorBasic);

  startTimeImmediate: boolean;
  endTimeNeverEnding: boolean;
  campaignFCap: number;
  // isLocalDateInit = false;

  public modalOption: NgbModalOptions = {};

  constructor(
    private router: Router,
    private strService: StrategyService,
    private strObjService: StrategyObjectsService,
    private commonService: CommonService,
    private entityService: EntitiesService,
    private alertService: AlertService,
    private apiService: StrategyControllerService,
    private readonly modalService: NgbModal,
    private bulkEditService: StrategyBulkEditService

  ) { }

  //REVX-371 : strategy bulk edit
  ngOnInit() {
    if (!this.isBulkEdit) {
      if (this.mode === MODE.CREATE) {
        this.setDefaultValueToFormElements();
        this.requestInProgress = false;
      } else { //edit mode
        this.isStartCheckBoxDisabled = true;
      }
    } else {
      this.requestInProgress = false;
      this.setBulkEditParams();
      this.setDefaultValueToFormElements();
    }


    this.subscribeToEvents();

  }

  //REVX-371 : strategy bulk edit
  ngOnDestroy() {
    if (this.strDetailsSub)
      this.strDetailsSub.unsubscribe();
    if (this.cmpgnDetailsSub)
      this.cmpgnDetailsSub.unsubscribe();
    if (this.advDetailsSub)
      this.advDetailsSub.unsubscribe();
    if (this.reCheckEndTimeFlagSub)
      this.reCheckEndTimeFlagSub.unsubscribe();
  }

  navigateToAdvPage() {
    this.router.navigate(['advertiser', 'details', this.strategyDTO.advertiser.id]);
  }

  navigateToCmpgnPage() {
    this.router.navigate(['campaign', 'details', this.strategyDTO.campaign.id]);
  }

  onCheckboxChange(event, type) {
    if (type === 1) {
      this.strBasicDetails.startTime = null;
      this.startTimeImmediate = event.checked;
    } else {
      this.strBasicDetails.endTime = null;
      this.endTimeNeverEnding = event.checked;
    }
  }

  // onSelectChange(event: any) {
  //   this.strBasicDetails.hourlyFcapDuration = event.value;    
  // }

  goToNextStep() {
    this.goToStep(1);
  }

  onReviewAndSave() {
    this.goToStep(5);
  }

  openEntitySelectionModal(entity: string) {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    this.modalOption.centered = true;

    const modal: NgbModalRef = this.modalService.open(EntitySelectorRadioComponent, this.modalOption);
    modal.componentInstance.entityType = entity;

    if (this.selAdvertiser) {
      modal.componentInstance.advId = this.strBasicDetails.advertiser.id;
    }

    modal.result.then((result) => {
      if (result) {
        if (entity === AppConstants.ENTITY.ADVERTISER) {
          this.selAdvertiser = result;
          if (this.strBasicDetails.advertiser === null) {
            this.strBasicDetails.advertiser = {};
          }
          this.strBasicDetails.advertiser = result;
          this.error['advertiser'] = { hasError: false, msg: '' };
          this.selCampaign = null;
          this.setDefaultValueToDateElements();
          this.strBasicDetails.campaign = null;
          this.strService.setAdvertiserDetails(result);
        } else if (entity === AppConstants.ENTITY.CAMPAIGN) {
          this.selCampaign = result;
          this.strService.setCampaignDetailsNoTrigger(this.selCampaign);
          if (this.strBasicDetails.campaign === null) {
            this.strBasicDetails.campaign = {};
          }
          this.strBasicDetails.campaign = result;
          this.campaignFCap = result.fcap;
          this.strBasicDetails.dailyFCapValue = result.fcap;
          this.isCampaignValid(this.strBasicDetails.campaign);
          this.setCampaignDependentParameters(this.strBasicDetails.campaign);
          this.setLocalDateParameters(this.strBasicDetails.campaign);
          this.getCampaignSkadPrivledge();
        }
      }
    });
  }

  private isFormValid() {
    const advertiser = this.strBasicDetails.advertiser;
    if (advertiser === null || advertiser === undefined) {
      this.error['advertiser'] = {
        hasError: true, msg: 'All Strategies must be associated with an advertiser. Please select an advertiser.'
      };
    } else {
      this.error['advertiser'] = { hasError: false, msg: '' };
    }

    const campaign = this.strBasicDetails.campaign;
    if (campaign === null || campaign === undefined) {
      this.error['campaign'] = {
        hasError: true, msg: 'All Strategies must be associated with an campaign. Please select a campaign.'
      };
    } else {
      this.isCampaignValid(this.strBasicDetails.campaign);
    }

    const name = this.strBasicDetails.strategyName;
    if (name === null || name === undefined || name.trim().length === 0) {
      this.error['name'] = { hasError: true, msg: 'Please enter a valid strategy name' };
    } else {
      this.error['name'] = { hasError: false, msg: '' };
    }

    this.validateDate();
    //FCAP VALIDATIONS
    const isUseCampaignFcap = this.strBasicDetails.dailyFCap;
    if (!isUseCampaignFcap) {

      const dailyFcapValue = this.strBasicDetails.dailyFCapValue;
      // if (dailyFcapValue === null || dailyFcapValue === undefined || dailyFcapValue < 1 || !Number.isInteger(dailyFcapValue)) {
      if (!dailyFcapValue || dailyFcapValue < 1 || !Number.isInteger(dailyFcapValue)) {
        this.error['fCap'] = { hasError: true, msg: 'Please enter a value greater than or equal to 1 and an integer value for number of times.' };
      } else {
        this.error['fCap'] = { hasError: false, msg: '' };

        //valid values for fcap interval : 1<= x <= 168
        const fcapFreq = this.strBasicDetails.fcapInterval;
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

    return this.errorExists();
  }


  //revx-371 : refactoring for bulk edit
  validateDate() {
    //START DATE VALIDATIONS
    const startTime = this.strBasicDetails.startTime;
    if (!this.startTimeImmediate) {
      //neither checkbox nor date
      if (startTime === null) {
        this.error['startTime'] = { hasError: true, msg: 'Select a valid start date and time. Alternatively select \'Start Immediately\'' };
      }

      //start date has expired
      const currentEpoch = this.commonService.getEpochFromDate(new Date());
      const strStartEpoch = this.commonService.getEpochFromDate(this.strBasicDetails.startTime);
      if (this.mode === MODE.CREATE && strStartEpoch <= currentEpoch) {
        this.error['startTime'] = {
          hasError: true,
          msg: 'Strategy start date should be greater than current time : ' + this.commonService.epochToDateTimeFormatter(currentEpoch)
        };
      }

      if (!this.error['startTime']) {
        this.error['startTime'] = { hasError: false, msg: '' };
      }

    } else {
      this.error['startTime'] = { hasError: false, msg: '' };
    }

    //END DATE VALIDATIONS
    const endTime = this.strBasicDetails.endTime;
    if (!this.endTimeNeverEnding) {
      //nethier checkbox nor date
      if (endTime === null) {
        this.error['endTime'] = {
          hasError: true,
          msg: 'Select a valid end date and time. (Selecting \'Never Ending\' possible only if Campaign is Never Ending)'
        };
      }

      let errorFound = false;
      const campEndTime = this.strBasicDetails.campaign.endTime;
      const currentEpoch = this.commonService.getEpochFromDate(new Date());
      const strEndTimeEpoch = this.commonService.getEpochFromDate(this.strBasicDetails.endTime);
      const strStartTimeEpoch = (this.startTimeImmediate) ? -1 : this.commonService.getEpochFromDate(this.strBasicDetails.startTime);


      //if end time is more than Campaign end time
      if (strEndTimeEpoch > campEndTime) {
        errorFound = true;
        this.error['endTime'] = {
          hasError: true,
          msg: 'Strategy end date cannot be greater than campaign end date. (selecting \'Never Ending\' possible only if Campaign is Never Ending)'
        }
      }

      //if end time is less than current time
      if (strEndTimeEpoch <= currentEpoch) {
        errorFound = true;
        this.error['endTime'] = {
          hasError: true,
          msg: 'Strategy end date should be greater than current time : ' + this.commonService.epochToDateTimeFormatter(currentEpoch)
        };
      }

      //if start time is greate/equal to end time
      if (strEndTimeEpoch <= strStartTimeEpoch) {
        errorFound = true;
        this.error['endTime'] = {
          hasError: true,
          msg: 'Strategy end date should be greater than Strategy start date'
        };
      }

      if (!errorFound) {
        this.error['endTime'] = { hasError: false, msg: '' };
      }

    } else if (this.endTimeNeverEnding) {
      //if never ending checkbox true
      this.error['endTime'] = { hasError: false, msg: '' };
    }

  }

  //revx-371 : refactoring for bulk edit
  errorExists() {
    const errorList = Object.keys(this.error).filter(key => this.error[key].hasError);
    if (errorList.length > 0) {
      this.strService.scrollToError();
    }
    return (errorList.length > 0) ? false : true;
  }


  onStartTimeChange(event: any) {
    const startTime = event.value;


    // if (startTime !== null) {
    //   this.endTimeMin = startTime;
    //   if (this.strBasicDetails.endTime !== null && this.strBasicDetails.endTime !== undefined) {
    //     const endTimeEpoch = this.commonService.getEpochFromDate(this.strBasicDetails.endTime);
    //     const startTimeEpoch = this.commonService.getEpochFromDate(startTime);
    //     if (startTimeEpoch >= endTimeEpoch) {
    //       this.strBasicDetails.endTime = null;
    //     }
    //   }
    // } else {
    //   const currDateEpoch = this.commonService.getEpochFromDate(this.startTimeMin);
    //   const endTimeMin = (this.strBasicDetails.campaign && this.strBasicDetails.campaign.startTime) ?
    //     (currDateEpoch > this.strBasicDetails.campaign.startTime) ? currDateEpoch :
    //       this.strBasicDetails.campaign.startTime : currDateEpoch;

    //   this.endTimeMin = this.commonService.getDateFromEpoch(endTimeMin);
    // }

    //endTimemin = MAX(current Time , cmpStart Time , ui selected strategy start time)
    let cmpStartEpoch: number = 0;
    let strStartEpoch: number = 0;
    let maxEpoch: number = 0;
    let currEpoch = this.commonService.getEpochFromDate(new Date());

    if (this.strBasicDetails.campaign) {
      cmpStartEpoch = this.strBasicDetails.campaign.startTime; //RHS already an epoch
    }

    if (startTime !== null) {
      strStartEpoch = this.commonService.getEpochFromDate(startTime);
    } else {
      strStartEpoch = -1;
    }

    maxEpoch = (currEpoch >= cmpStartEpoch) ? currEpoch : cmpStartEpoch;
    maxEpoch = (maxEpoch >= strStartEpoch) ? maxEpoch : strStartEpoch;
    this.endTimeMin = this.commonService.getDateFromEpoch(maxEpoch);

    //now check if end date update is required
    let endDateEpoch: number = 0;
    if (!this.endTimeNeverEnding && this.strBasicDetails.endTime) {
      endDateEpoch = this.commonService.getEpochFromDate(this.strBasicDetails.endTime);
      if (endDateEpoch < maxEpoch) {
        this.strBasicDetails.endTime = null;
      }
    }
  }


  private updateStrategyObject() {
    this.strategyDTO = this.strService.getStrDetails();
    if (this.strategyDTO === null || this.strategyDTO === undefined) {
      this.strategyDTO = {} as StrategyDTO;
    }

    this.strategyDTO.advertiser = this.strBasicDetails.advertiser;
    this.strategyDTO.campaign = this.strBasicDetails.campaign;
    this.strategyDTO.name = this.strBasicDetails.strategyName;

    const currDateEpoch = this.commonService.getEpochFromDate(new Date());
    const startTime = (currDateEpoch > this.strBasicDetails.campaign.startTime) ? currDateEpoch : this.strBasicDetails.campaign.startTime;
    this.strategyDTO.startTime = (this.startTimeImmediate) ?
      -1 : this.strBasicDetails.startTime === null ?
        startTime : this.commonService.getEpochFromDate(this.strBasicDetails.startTime);
    this.strategyDTO.endTime = (this.endTimeNeverEnding) ?
      -1 : this.strBasicDetails.endTime === null ?
        this.strBasicDetails.campaign.endTime : this.commonService.getEpochFromDate(this.strBasicDetails.endTime);

    this.strategyDTO.fcapEnabled = true;
    this.strategyDTO.campaignFcap = this.strBasicDetails.dailyFCap;
    this.strategyDTO.fcapFrequency = (!this.strBasicDetails.dailyFCap) ?
      this.strBasicDetails.dailyFCapValue : this.strBasicDetails.campaign.fcap;
    this.strategyDTO.active = true;
    // this.strategyDTO.hourlyUserFcap = this.strBasicDetails.hourlyUserFcap;
    // this.strategyDTO.hourlyFcapDuration = this.strBasicDetails.hourlyFcapDuration;
    // this.strategyDTO.isHourlyFcap = this.strBasicDetails.isHourlyFcap;

    this.strategyDTO.fcapInterval = (this.strBasicDetails.dailyFCap) ? null : +this.strBasicDetails.fcapInterval;

    this.strService.setStrDetails(this.strategyDTO, true, this.isBulkEdit, true);

    // console.log(this.strategyDTO);

  }

  private isCampaignValid(campaign: any) {
    // check expiration
    const compareDate = new Date();
    const campaignEndTime = moment(this.commonService.getDateFromEpoch(campaign.endTime));
    const isExpired = campaignEndTime.isSameOrBefore(moment(compareDate));
    if (isExpired) {
      this.error['campaign'] = { hasError: true, msg: 'Campaign is expired. Please edit the campaign first.' };
      return;
    } else {
      this.error['campaign'] = { hasError: false, msg: '' };
    }

    // check lifetimebudget is not null
    if (campaign.lifetimeBudget === null || campaign.lifetimeBudget === undefined) {
      this.error['campaign'] = { hasError: true, msg: 'Campaign is invalid. Please edit the campaign first.' };
      return;
    } else {
      this.error['campaign'] = { hasError: false, msg: '' };
    }

    // check fcap is not null
    if (campaign.fcap === null || campaign.fcap === undefined) {
      this.error['campaign'] = { hasError: true, msg: 'Campaign is invalid. Please edit the campaign first.' };
      return;
    } else {
      this.error['campaign'] = { hasError: false, msg: '' };
    }
  }



  private setDefaultValueToFormElements() {
    this.setDefaultValueToDateElements();
    this.strBasicDetails.dailyFCap = true;
    // this.strBasicDetails.isHourlyFcap = false;
    this.campaignFCap = (this.selCampaign) ? this.selCampaign.campaign.fcap : null;
  }

  private setDefaultValueToDateElements() {
    this.startTimeImmediate = true;
    this.endTimeNeverEnding = true;
    this.isStartCheckBoxDisabled = false;
    this.isEndCheckBoxDisabled = false;
    this.strBasicDetails.startTime = null;
    this.strBasicDetails.endTime = null;
  }


  private subscribeToEvents() {
    this.strDetailsSub = this.strService.onStrategyDetailsSet.subscribe(
      param => {
        this.handleStrategyDetailsSet(param.strDetails);
        this.resetErrorObject();
      }
    );

    this.cmpgnDetailsSub = this.strService.onCampaignDetailsSet.subscribe(
      param => {
        this.selCampaign = param.details;
        this.strService.setCampaignDetailsNoTrigger(this.selCampaign);
        this.isCampaignValid(this.selCampaign);
        this.setCampaignDependentParameters(this.selCampaign);
        this.setLocalDateParameters(this.selCampaign);
        this.campaignFCap = this.selCampaign.fcap;
        this.strBasicDetails.campaign = this.selCampaign;
      });

    this.advDetailsSub = this.strService.onAdvertiserDetailsSet.subscribe(
      param => {
        this.selAdvertiser = param.details;
        this.strBasicDetails.advertiser = this.selAdvertiser;
      });

    this.reCheckEndTimeFlagSub = this.strService.reCheckEndTimeFlag.subscribe((reCheck: boolean) => {
      if (reCheck) {
        if (this.isBulkEdit) {
          this.isFormValidForBulkEdit();
        } else {
          this.isFormValid();
        }
      }
    });


    this.onCampaignDetailsResetSub = this.strService.onCampaignDetailsReset.subscribe((isReset: boolean) => {
      if (isReset) {
        this.selCampaign = null;
        this.strBasicDetails.campaign = null;
        this.campaignFCap = 0;
      }
    });

  }

  resetErrorObject() {
    this.error = {
      advertiser: { hasError: false, msg: '' },
      campaign: { hasError: false, msg: '' },
      name: { hasError: false, msg: '' },
      startTime: { hasError: false, msg: '' },
      endTime: { hasError: false, msg: '' },
      fCap: { hasError: false, msg: '' },
      // hCap: { hasError: false, msg: '' }
    };
  }


  private handleStrategyDetailsSet(strDetails: StrategyDTO) {
    if (strDetails !== null) {
      this.strategyDTO = strDetails;
      this.setBasicDetails(strDetails);
    }
    this.requestInProgress = false;
  }

  private setBasicDetails(strDetails: StrategyDTO) {

    this.selAdvertiser = strDetails.advertiser;
    this.selCampaign = strDetails.campaign;
    this.strService.setCampaignDetailsNoTrigger(this.selCampaign);

    this.startTimeImmediate = strDetails.startTime === -1 ? true : false;
    this.endTimeNeverEnding = strDetails.endTime === -1 ? true : false;

    this.campaignFCap = strDetails.campaign['fcap'];

    this.strBasicDetails = {
      advertiser: strDetails.advertiser,
      campaign: strDetails.campaign,
      channel: 'Display',
      strategyName: strDetails.name,
      // startTime: (strDetails.startTime === -1) ?
      //   null : (!this.isLocalDateInit) ?
      //     this.strService.getLocalDate(strDetails.startTime) : this.commonService.getDateFromEpoch(strDetails.startTime),
      // endTime: (strDetails.endTime === -1) ?
      //   null : (!this.isLocalDateInit) ?
      //     this.strService.getLocalDate(strDetails.endTime) : this.commonService.getDateFromEpoch(strDetails.endTime),
      startTime: (strDetails.startTime === -1) ?
        null : this.commonService.getDateFromEpoch(strDetails.startTime),
      endTime: (strDetails.endTime === -1) ?
        null : this.commonService.getDateFromEpoch(strDetails.endTime),
      dailyFCap: strDetails.campaignFcap,
      dailyFCapValue: strDetails.fcapFrequency,
      // hourlyFcapDuration: strDetails.hourlyFcapDuration,
      // hourlyUserFcap: strDetails.hourlyUserFcap,
      // isHourlyFcap: strDetails.isHourlyFcap

      //hour
      fcapInterval: strDetails.fcapInterval,
    };
    // this.isLocalDateInit = true;
    this.setCampaignDependentParameters(this.strBasicDetails.campaign);
  }


  private setCampaignDependentParameters(campaign: any) {
    this.isEndCheckBoxDisabled = (campaign.endTime === CampaignConstants.NEVER_ENDING_EPOCH) ? false : true;
    //max limit of start and end calender must be not more than campaign end date
    this.startTimeMax = this.commonService.getDateFromEpoch(campaign.endTime);
    this.endTimeMax = this.commonService.getDateFromEpoch(campaign.endTime);


    const currEpoch = this.commonService.getEpochFromDate(new Date());
    if (campaign.startTime > currEpoch) {  //if campaign will start in future then update Min dates
      this.startTimeMin = this.commonService.getDateFromEpoch(campaign.startTime);
      this.endTimeMin = this.commonService.getDateFromEpoch(campaign.startTime);
    } else { //if campaign has already started
      this.startTimeMin = this.commonService.getDateFromEpoch(currEpoch);
      this.endTimeMin = this.commonService.getDateFromEpoch(currEpoch);
    }
  }

  setLocalDateParameters(campaign: any) {
    this.startTimeImmediate = true;
    this.strBasicDetails.startTime = null;
    if (campaign.endTime === CampaignConstants.NEVER_ENDING_EPOCH) {
      this.endTimeNeverEnding = true;
      this.strBasicDetails.endTime = null;
    } else {
      this.endTimeNeverEnding = false;
      this.strBasicDetails.endTime = this.commonService.getDateFromEpoch(campaign.endTime); //first time set after campaign is known
    }
  }

  private goToStep(stepNo: number) {
    const isValid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (isValid) {
      this.updateBulkEditSelection()
      this.updateStrategyObject();
      this.strService.setMaxStepperVisited(1);
      this.strService.setStepperIndex(stepNo);
    }
  }

  validate() {
    const isValid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (isValid) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
    }
  }

  //REVX-724 : skad ui changes
  getCampaignSkadPrivledge() {
    let id = (this.strBasicDetails && this.strBasicDetails.campaign) ? this.strBasicDetails.campaign.id : null;
    this.skadTrigger.emit({ isCampChanged: true, cmpId: id });
  }






  //revx-371 : bulk edit
  setBulkEditParams() {
    let requiredParams = this.bulkEditService.getBulkEditSettings(this.SCONST.STEP_TITLE_BASIC);

    // if (requiredParams && requiredParams["name"]) {
    //   this.nameOptions = requiredParams["name"];
    // }

    if (requiredParams && requiredParams["schedule"]) {
      this.scheduleOptions = requiredParams["schedule"];
    }

  }



  //revx-371 in bulk edit only dates are validated
  isFormValidForBulkEdit() {
    if (this.scheduleOptions.selectedBulkEditOpt === this.SCONST.NO_CHANGE) {
      return true;
    }
    this.validateDate();
    return this.errorExists();
  }


  updateBulkEditSelection() {
    if (this.isBulkEdit) {
      // this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.NAME, this.nameOptions.selectedBulkEditOpt);
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.SCHEDULE, this.scheduleOptions.selectedBulkEditOpt);
    }
  }



  isToBeHidden(bulkEditId) {
    if (this.isBulkEdit) {
      if (bulkEditId === 0) {
        // return this.nameOptions.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      } else if (bulkEditId === 1) {
        return this.scheduleOptions.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      }
      return false;
    }
    return false;

  }



}
