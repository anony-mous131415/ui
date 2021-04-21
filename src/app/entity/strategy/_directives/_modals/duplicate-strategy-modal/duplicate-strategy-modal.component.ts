import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { StrategyConstants } from '@app/entity/strategy/_constants/StrategyConstants';
import { MODE, StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-duplicate-strategy-modal',
  templateUrl: './duplicate-strategy-modal.component.html',
  styleUrls: ['./duplicate-strategy-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DuplicateStrategyModalComponent implements OnInit {

  SCONST = StrategyConstants;
  MODE = MODE;
  startTimeImmediate = true;
  endTimeNeverEnding = false;
  appConst = AppConstants;

  startTimeMin: Date = new Date();
  endTimeMin: Date = new Date();
  startTimeMax: Date = new Date(CampaignConstants.NEVER_ENDING_EPOCH * 1000);
  endTimeMax: Date = new Date(CampaignConstants.NEVER_ENDING_EPOCH * 1000);
  isStartCheckBoxDisabled: boolean;
  isEndCheckBoxDisabled: boolean;

  strDupDetails: any = {
    strategyName: null,
    startTime: null,
    endTime: null,
    geoTargeting: true,
    audienceTargeting: true,
    mobileTargeting: true,
    daypartTargeting: true,
    placementTargeting: true,
    connectionTypeTargeting: true,
    inventoryTargeting: true,
    creativeAttached: true
  };
  error: any = {
    strategyName: { hasError: false, msg: '' },
    startTime: { hasError: false, msg: '' },
    endTime: { hasError: false, msg: '' }
  };

  targetingOptions = [
    { id: 'geoTargeting', title: 'Geography' },
    // { id: 'audienceTargeting', title: 'Audience' },
    { id: 'connectionTypeTargeting', title: 'Connection Type' },
    { id: 'mobileTargeting', title: 'Mobile' },
    { id: 'daypartTargeting', title: 'Daypart' },
    { id: 'placementTargeting', title: 'Placement' }
  ];

  constructor(
    private modalRef: MatDialogRef<DuplicateStrategyModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private strService: StrategyService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.setCampaignDependentParameters();
    this.setLocalDateParameters();
  }

  get config() {
    return this.configData;
  }

  onSaveClick() {
    let isInvalid: boolean = this.isFromValid();
    if (!isInvalid) {
      this.updateStrDupDetails();
      this.modalRef.close({
        ...this.strDupDetails
      });
    }
  }

  onCancelClick() {
    this.modalRef.close(null);
  }

  onCheckboxChange(event, type) {
    if (type === 1) {
      this.strDupDetails.startTime = null;
      this.startTimeImmediate = event.checked;
    } else {
      this.strDupDetails.endTime = null;
      this.endTimeNeverEnding = event.checked;
    }
  }

  private isFromValid(): boolean {
    const name = this.strDupDetails.strategyName;
    if (name === null || name === undefined || name.trim().length === 0) {
      this.error['strategyName'] = { hasError: true, msg: 'Please enter a valid strategy name' };
    } else {
      this.error['strategyName'] = { hasError: false, msg: '' };
    }

    //start time validation
    const startTime = this.strDupDetails.startTime;
    if (!this.startTimeImmediate) {

      if (startTime === null) {
        this.error['startTime'] = { hasError: true, msg: 'Select a valid start date and time. Alternatively select \'Start Immediately\'' };
      }

      //check if time given has expired
      const currentEpoch = this.commonService.getEpochFromDate(new Date());
      if (this.commonService.getEpochFromDate(this.strDupDetails.startTime) <= (currentEpoch + 59)) {
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

    //end time validation
    const endTime = this.strDupDetails.endTime;
    if (!this.endTimeNeverEnding) {
      //nethier checkbox nor date
      if (endTime === null) {
        this.error['endTime'] = {
          hasError: true,
          msg: 'Select a valid end date and time. (selecting \'Never Ending\' possible only if Campaign is Never Ending)'
        };
      }

      let errorFound = false;
      const campEndTime = this.configData.cmpEnd;
      const currentEpoch = this.commonService.getEpochFromDate(new Date());
      const strEndTimeEpoch = this.commonService.getEpochFromDate(this.strDupDetails.endTime);
      const strStartTimeEpoch = (this.startTimeImmediate) ? -1 : this.commonService.getEpochFromDate(this.strDupDetails.startTime);

      //if end time is more than Campaign end time
      if (strEndTimeEpoch > campEndTime) {
        errorFound = true;
        this.error['endTime'] = {
          hasError: true,
          msg: 'Strategy end date cannot be greater than campaign end date. (selecting \'Never Ending\' possible only if Campaign is Never Ending)'
        }
      }

      //if end time is less than current time
      if (strEndTimeEpoch <= (currentEpoch + 59)) {
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


    const errorList = Object.keys(this.error).filter(key => this.error[key].hasError);
    return (errorList.length > 0);
  }

  private updateStrDupDetails() {
    //ASSIGN START TIME IN DTO
    const currDateEpoch = this.commonService.getEpochFromDate(new Date());
    const maxOfCurrentAndCmpStart = (currDateEpoch > this.configData.cmpStart) ? currDateEpoch : this.configData.cmpStart;
    let startTimeEpoch: number = 0;

    if (!this.startTimeImmediate && this.strDupDetails.startTime) {
      startTimeEpoch = this.commonService.getEpochFromDate(this.strDupDetails.startTime);
    }

    this.strDupDetails.startTime = (this.startTimeImmediate) ? maxOfCurrentAndCmpStart : startTimeEpoch;

    // this.strDupDetails.startTime = (this.startTimeImmediate) ? this.commonService.getEpochFromDate(new Date()))
    //   : this.strService.getUTCDate(this.commonService.getEpochFromDate(startTime));

    const endTime = this.strDupDetails.endTime;
    this.strDupDetails.endTime = (this.endTimeNeverEnding) ? 7258118399 : this.commonService.getEpochFromDate(endTime);
  }

  private setCampaignDependentParameters() {
    this.isEndCheckBoxDisabled = (this.configData.cmpEnd === CampaignConstants.NEVER_ENDING_EPOCH) ? false : true;
    //max limit of start and end calender must be not more than campaign end date
    this.startTimeMax = this.commonService.getDateFromEpoch(this.configData.cmpEnd);
    this.endTimeMax = this.commonService.getDateFromEpoch(this.configData.cmpEnd);


    const currEpoch = this.commonService.getEpochFromDate(new Date());
    if (this.configData.cmpStart > currEpoch) {  //if campaign will start in future then update Min dates
      this.startTimeMin = this.commonService.getDateFromEpoch(this.configData.cmpStart);
      this.endTimeMin = this.commonService.getDateFromEpoch(this.configData.cmpStart);
    } else { //if campaign has already started
      this.startTimeMin = this.commonService.getDateFromEpoch(currEpoch);
      this.endTimeMin = this.commonService.getDateFromEpoch(currEpoch);
    }
  }

  setLocalDateParameters() {
    this.startTimeImmediate = true;
    this.strDupDetails.startTime = null;
    if (this.configData.cmpEnd === CampaignConstants.NEVER_ENDING_EPOCH) {
      this.endTimeNeverEnding = true;
      this.strDupDetails.endTime = null;
    } else {
      this.endTimeNeverEnding = false;
      this.strDupDetails.endTime = this.commonService.getDateFromEpoch(this.configData.cmpEnd);
    }
  }

  onStartTimeChange(event: any) {
    const startTime = event.value;

    let cmpStartEpoch: number = this.configData.cmpStart;
    let strStartEpoch: number = 0;
    let maxEpoch: number = 0;
    let currEpoch = this.commonService.getEpochFromDate(new Date());

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
    if (!this.endTimeNeverEnding && this.strDupDetails.endTime) {
      endDateEpoch = this.commonService.getEpochFromDate(this.strDupDetails.endTime);
      if (endDateEpoch < maxEpoch) {
        this.strDupDetails.endTime = null;
      }
    }
  }



}

