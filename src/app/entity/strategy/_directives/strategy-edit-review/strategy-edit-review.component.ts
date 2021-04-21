import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { ApiResponseObjectStrategyDTO, StrategyControllerService, StrategyDTO, TargetMobileDeviceModels, BulkEditStrategiesDTO, BulkStrategyControllerService } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { CommonService } from '@app/shared/_services/common.service';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { MODE, StrategyService } from '../../_services/strategy.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { StrategyBulkEditService } from '../../_services/strategy-bulk-edit.service';
import { req, res } from '../../_services/mock';

@Component({
  selector: 'app-strategy-edit-review',
  templateUrl: './strategy-edit-review.component.html',
  styleUrls: ['./strategy-edit-review.component.scss']
})
export class StrategyEditReviewComponent implements OnInit {
  strDetailsSub: Subscription;

  @BlockUI() blockUI: NgBlockUI;
  @Input() mode: number;
  @Input() isBulkEdit: boolean;
  @Input() openFromCampaignDetails: boolean;



  timeExpiredFlag: boolean;
  appConst = AppConstants;
  startImmediateFlag: boolean;


  strategyDTO: StrategyDTO;
  SCONST = StrategyConstants;
  MODE = MODE;
  title = StrategyConstants.STEP_TITLE_REVIEW;

  summaryDetails: any;

  // isStrategySkadSub: Subscription;
  @Input() isStrategySkad: boolean;

  constructor(
    private strService: StrategyService,
    private apiService: StrategyControllerService,
    private router: Router,
    private alertService: AlertService,
    private commonService: CommonService,
    private menuService: MenucrumbsService,
    private strBulkEditService: StrategyBulkEditService,
    private bulkEditApiService: BulkStrategyControllerService
    // private http: HttpClient
  ) { }

  ngOnInit() {
    this.subscribeToEvents();
    this.blockUI.stop();
  }

  goToPrevStep() {
    this.strService.setStrDetails(this.strategyDTO);
    this.strService.setStepperIndex(4);
  }

  onSaveStrategy() {

    //revx-371 bulk edit flow
    if (this.isBulkEdit) {
      let rquest: BulkEditStrategiesDTO = this.strBulkEditService.convertStrategyDtoToBulkEditRequestDto(this.strategyDTO);

      this.blockUI.start();

      this.bulkEditApiService.editStrategiesUsingPOST(rquest).subscribe(resp => {
        console.log('bulk edit api resp ===>')
        console.log(resp);
        let msg = (resp && resp.respObject && resp.respObject.message) ? resp.respObject.message : 'Request for bulk editing strategy is forwarded to the server.';
        if (resp && resp.respObject && resp.respObject.code === 200) {
          this.alertService.success(msg, false, true);
        } else {
          this.alertService.error(msg, false, true);
        }

        const that = this;
        setTimeout(() => {
          that.alertService.clear(true);
        }, 8000);
        this.router.navigate(['strategy']);
      }, (error: any) => {
        this.router.navigate(['strategy']);
        this.blockUI.stop();

      });
    }


    //non-bulk edit flow
    else {

      this.updateStrategyObject();
      console.log('non-bulk edit strDto ==>');
      console.log(this.strategyDTO);

      this.checkIfTimeHasExpired();
      if (this.timeExpiredFlag) {
        this.strService.setStepperIndex(0); // goto basic details section
        this.strService.setReCheckEndTimeFlag(true);
        return;
      }
      this.strService.setReCheckEndTimeFlag(false);

      this.performSkadChangesInRequest();

      this.blockUI.start();
      if (this.mode === MODE.EDIT) {
        this.apiService.updateStrategyUsingPOST(this.strategyDTO.id, this.strategyDTO, null, this.strService.getAuthToken()).subscribe(
          (response: ApiResponseObjectStrategyDTO) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(response, 'Strategy updated successfully.',
              'Failed to update strategy. Please try again later.', response.respObject.id);
          },
          error => {
            this.blockUI.stop();
          }
        );

      } else if (this.mode === MODE.CREATE) {
        this.apiService.createStrategyUsingPOST(this.strategyDTO, null, this.strService.getAuthToken()).subscribe(
          (response: ApiResponseObjectStrategyDTO) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(response, 'New strategy successfully created.',
              'Failed to create new strategy. Please try again later.', response.respObject.id);
          },
          error => {
            this.blockUI.stop();
          }
        );
      }

    }
  }



  checkIfTimeHasExpired() {
    // check if endtime is provided && it has expired when save button was clicked
    this.timeExpiredFlag = false;
    const currentEpoch = this.commonService.getEpochFromDate(new Date());
    if (this.strategyDTO.endTime > 0 && this.strategyDTO.endTime <= currentEpoch) {
      // end time expired
      this.timeExpiredFlag = true;
    }
    if (this.mode === MODE.CREATE && !this.startImmediateFlag && this.strategyDTO.startTime <= currentEpoch) {
      // if start immediate is NOT selected and proivided date got exipred
      this.timeExpiredFlag = true;
    }

    if (this.strategyDTO.endTime <= this.strategyDTO.startTime) {
      this.timeExpiredFlag = true;
    }
  }

  private updateStrategyObject() {
    const active = this.getActive();
    if (active !== null) {
      this.strategyDTO.active = active;
    }

    if (this.mode === MODE.EDIT) {
      this.strategyDTO.endTime = this.strategyDTO.endTime === null || this.strategyDTO.endTime === -1 ?
        ((this.strategyDTO.campaign) as any).endTime : this.strategyDTO.endTime;
      this.strategyDTO.startTime = this.strategyDTO.startTime;
      // this.strategyDTO.endTime = this.strService.getUTCDate(this.strategyDTO.endTime);

    } else {
      const currDateEpoch = this.commonService.getEpochFromDate(new Date());
      const startTime = (currDateEpoch > ((this.strategyDTO.campaign) as any).startTime) ?
        currDateEpoch : ((this.strategyDTO.campaign) as any).startTime;

      // checking if user seleccted start immediate
      if (this.strategyDTO.startTime === null || this.strategyDTO.startTime === -1) {
        this.startImmediateFlag = true;
      } else {
        this.startImmediateFlag = false;
      }

      this.strategyDTO.startTime = this.strategyDTO.startTime === null || this.strategyDTO.startTime === -1 ?
        startTime : this.strategyDTO.startTime;

      this.strategyDTO.endTime = this.strategyDTO.endTime === null || this.strategyDTO.endTime === -1 ?
        ((this.strategyDTO.campaign) as any).endTime : this.strategyDTO.endTime;

      this.strategyDTO.endTime = (this.strategyDTO.endTime === null ||
        this.strategyDTO.endTime === -1 || this.strategyDTO.endTime === 7258118399) ? 7258118399 :
        this.strategyDTO.endTime;
    }

    if (this.strategyDTO.targetMobileDevices) {
      this.strategyDTO.targetMobileDevices.targetMobileModels = null as TargetMobileDeviceModels;
    }

    // CONNECTION TYPE: if all connection type is selected, then null
    if (this.strategyDTO.connectionTypes !== null && this.strategyDTO.connectionTypes !== undefined
      && Array.isArray(this.strategyDTO.connectionTypes)) {
      const connTypes = this.strategyDTO.connectionTypes;
      const reqConnTypes = [
        StrategyDTO.ConnectionTypesEnum.WIFI,
        StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK2G,
        StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK3G,
        StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK4G,
        StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK5G
      ];
      if (reqConnTypes.filter(item => connTypes.indexOf(item) !== -1).length === 5) {
        this.strategyDTO.connectionTypes = null;
      }
    }

    // DAYPART: if all days and hours selected, then send targetDays as null
    if (this.strategyDTO && this.strategyDTO.targetDays && this.strategyDTO.targetDays.daypart) {
      const daypart = this.strategyDTO.targetDays.daypart;
      if (daypart !== null) {
        // check for all days and all hours
        if (daypart.length === 7) {
          const isAllHours = daypart.filter(part => part.hours.length === 24).length === 7 ? true : false;
          if (isAllHours) {
            this.strategyDTO.targetDays.daypart = null;
          }
        }
      }
    }
  }

  private getActive() {
    const statusIndex = this.summaryDetails.findIndex(item => item.id === 'status');
    if (statusIndex !== null && statusIndex !== undefined && statusIndex !== -1) {
      const statusObj = this.summaryDetails[statusIndex];
      if (statusObj !== null && statusObj !== undefined && statusObj.value !== null
        && statusObj.value !== undefined && Array.isArray(statusObj.value) && statusObj.value.length > 0) {
        const obj = statusObj.value[0];
        return obj.value;
      }
    }
    return null;
  }

  private subscribeToEvents() {
    this.strDetailsSub = this.strService.onStrategyDetailsSet.subscribe(
      param => this.handleStrategyDetailsSet(param.strDetails)
    );

    //REVX-724 : skad ui changes
    // this.isStrategySkadSub = this.strService.isStrategySkad.subscribe((param: boolean) => {
    //   this.isStrategySkad = param;
    // });
  }

  private handleStrategyDetailsSet(strDetails: StrategyDTO) {
    this.strategyDTO = strDetails;
    // get summary details

    if (this.isBulkEdit) {
      let bulkEditRequest = this.strBulkEditService.convertStrategyDtoToBulkEditRequestDto(this.strategyDTO);
      let strategys = this.strBulkEditService.getStrategiesForBulkEdit();

      const hideCreativeSection: boolean = (this.openFromCampaignDetails) ? false : true;

      this.summaryDetails = this.strBulkEditService.convertBulkEditReqToUi(bulkEditRequest, strategys, hideCreativeSection);
    } else {
      this.summaryDetails = this.strService.getStrReviewSummaryForEditPage();
    }
  }

  private showMessageAfterAction(apiResp, successMsg, errorMsg, id?: number) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
      this.strService.setIsSaved(true);
      (id) ? this.router.navigate(['strategy', 'details', id]) : this.router.navigate(['strategy']);
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    this.blockUI.stop();
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 5000);
  }



  //REVX-724 : skad ui changes
  performSkadChangesInRequest() {
    if (this.isStrategySkad) {
      this.strategyDTO.targetAndroidCategories = null;
      this.strategyDTO.targetMobileDevices.targetOperatingSystems.selectAllOperatingSystems = false;
      this.strategyDTO.targetAppSegments = null;
      this.strategyDTO.targetWebSegments = null;
      this.strategyDTO.targetDmpSegments = null;
    }
    // console.log('DTO==>');
    // console.log(this.strategyDTO);
  }





}

