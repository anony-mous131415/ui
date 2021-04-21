import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { CampaignService } from '@app/entity/campaign/_services/campaign.service';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitySelectorRadioComponent } from '@app/shared/_directives/entity-selector-radio/entity-selector-radio.component';
import { ComponentCanDeactivate } from '@app/shared/_guard/pending-changes.guard';
import { CommonService } from '@app/shared/_services/common.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CampaignDTO, DashboardControllerService, ApiResponseObjectSkadTargetPrivileges } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { CampaignObjectiveModalComponent } from '../../_directives/_modals/campaign-objective-modal/campaign-objective-modal.component';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';

export interface Assigner {
  // SCHEDULE
  // start-date
  minStartDate: Date;
  startDateCb: boolean;
  startDate: Date;
  // end-date
  minEndDate: Date;
  endDateCb: boolean;
  endDate: Date;
  // PRICING AND BUDGETING
  flowRate: any;
  dailyBudget: any;

  // ADVANCED SETTINGS
  attributionRatio: any; // string;
  cpaTarget: any;
}

@Component({
  selector: 'app-campaign-create',
  templateUrl: './campaign-create.component.html',
  styleUrls: ['./campaign-create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CampaignCreateComponent implements OnInit, AfterViewInit, ComponentCanDeactivate {
  @BlockUI() blockUI: NgBlockUI;

  errScrollId: string;
  appConst = AppConstants;

  // baseModels (& supporters) to be manupulated while saving
  bmForAdvertiser: any;
  editAdvAllowed: boolean; // disable edit for advertiser/:id/campaign/create
  editPxlAllowed: boolean; // disable/enable pixel edit
  bmForPricing: any;
  ngModelPricing = { radio: 1, inpt: 0 };
  ngModelAdvanced = { radio: 1, inpt: 0 };
  assigner = {} as Assigner;

  campaignDto = {} as CampaignDTO;
  cmpConst;
  showAdvStngs = false; // ui only
  formValidated = true;

  saveClicked: boolean; // to disable propmt on saving campaign

  cmpId: number; // for the path campaign/create/:id
  breadcrumbs: string;

  // these properties are for NGX-mat-select-search
  public listCtrl: FormControl = new FormControl();
  public listFilterCtrl: FormControl = new FormControl();
  public filteredLists: any[] = []; // list after applying search filter
  public pricingLists: any[] = []; // full list from api

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('cpaTarget', { static: false }) cpaTarget: ElementRef;
  @ViewChild('flowRate', { static: false }) flowRate: ElementRef;

  public modalOption: NgbModalOptions = {};
  expiredEndDateMsg: string;
  expiredStartDateMsg: string;
  previousEndEpoch: number;

  closed = false;
  skadAllowed: boolean = false;

  @HostListener('window:beforeunload', [])
  canDeactivate(): Observable<boolean> | boolean {
    if (this.saveClicked) {
      return true
    }
    return false;
  }

  constructor(
    private commonService: CommonService,
    private readonly modalService: NgbModal,
    private advService: AdvertiserService,
    private campaignService: CampaignService,
    private entitiesService: EntitiesService,
    private dashboardService: DashboardControllerService,
    private router: Router,
    private route: ActivatedRoute,
    private menuService: MenucrumbsService,
    private location: Location,
    private strService: StrategyService
  ) { }

  /**
   * if campaign pricing is CPA, then copy the flow rate value to CPA Target field
   */
  onFlowRateChange() {
    if (this.bmForPricing && this.bmForPricing.name === CampaignConstants.PRICING.CPA) {
      this.setCPATargetValue();
    }
  }

  private setCPATargetValue() {
    const flowRate = this.flowRate.nativeElement.value;
    if (!this.isInvalidNumber(flowRate) && this.isValidFlowRate(flowRate)) {
      this.cpaTarget.nativeElement.value = flowRate;
      this.assigner.cpaTarget = flowRate;
    }
  }

  onCmpgnCancel() {
    if (!this.cmpId) {
      this.router.navigate(['campaign']);
    } else {
      this.router.navigate(['campaign', 'details', this.cmpId]);
    }
    // this.location.back();
  }

  ngAfterViewInit() {
    this.scrollToTop();
  }

  setMinDates() {
    const now = new Date();
    this.assigner.minStartDate = now;
    this.assigner.minEndDate = now;
  }


  initAssigner() {
    this.assigner.startDateCb = true;
    this.assigner.endDateCb = true;
    this.assigner.attributionRatio = 100;
    this.campaignDto.dailyUserFcap = 8;
  }

  ngOnInit() {
    this.cmpConst = CampaignConstants;
    this.fetchRequiredEntities();
    this.setMinDates(); // handles update and create cases
    this.saveClicked = false;
    this.blockUI.stop();
    this.breadcrumbs = JSON.stringify({ 'campaignCreate': {id: '', name: ''}});
    this.route.paramMap.subscribe(params => {
      // console.log(params);
      const id = params.get('id');
      const cid = params.get('cid');

      if (!id && !cid) {
        this.editAdvAllowed = true;
        this.editPxlAllowed = true;
        this.openObjectiveModal();
        this.initAssigner();
      } else if (!id && cid && !isNaN(Number(cid))) {
        this.cmpId = Number(cid);
        this.getCampaignDetails();
        this.getDetailsById();
        this.editAdvAllowed = false; // cant change advertiser
      } else if (id && !isNaN(Number(id)) && !cid) {
        const advEntity: any = AppConstants.ENTITY.ADVERTISER;
        this.editPxlAllowed = true;
        this.initAssigner();
        this.openObjectiveModal();
        this.dashboardService.getDetailByIdUsingGET(Number(id), advEntity).subscribe(resp => {
          this.bmForAdvertiser = { id: resp.respObject.id, name: resp.respObject.name };
          this.checkAdvSkadPrivledge();
        });
        this.editAdvAllowed = false; // cant change advertiser
      } else if (id && !isNaN(Number(id)) && cid && !isNaN(Number(cid))) {
        const advEntity: any = AppConstants.ENTITY.ADVERTISER;
        this.dashboardService.getDetailByIdUsingGET(Number(id), advEntity).subscribe(resp => {
          this.bmForAdvertiser = { id: resp.respObject.id, name: resp.respObject.name };
        });
        this.editAdvAllowed = false; // cant change advertiser
        this.cmpId = Number(cid);
        this.getCampaignDetails();
        this.getDetailsById();
      }
    });

  }

  getDetailsById() {
    this.entitiesService.getDetailsById(this.cmpId, AppConstants.ENTITY.CAMPAIGN).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  getCampaignDetails() {
    // we need to fetch pricing list first and the populate form , else app breaks
    this.commonService.getDictionary('PRICING', 1, 1000).subscribe(resp => {
      const indexToBeRemoved = resp.respObject.data.findIndex(x => x.name === CampaignConstants.PRICING.REV_SHARE);
      resp.respObject.data.splice(indexToBeRemoved, 1);
      this.pricingLists = resp.respObject.data;
      this.filteredLists = this.pricingLists;
      this.campaignService.getById(this.cmpId).subscribe(response => {
        this.campaignDto = response.respObject;

        this.previousEndEpoch = this.campaignDto.endTime; // used for validation
        if (!this.campaignDto.pixel) {
          this.editPxlAllowed = true;
        }
        this.populateForm();
      }, (error: any) => {

      });
    }, (error: any) => {

    });

  }

  populateForm() {
    this.bmForPricing = this.pricingLists[this.pricingLists.findIndex(x => x.id === this.campaignDto.pricingId)];

    // BASIC DETAILS
    const advEntity: any = AppConstants.ENTITY.ADVERTISER;
    this.dashboardService.getByIdUsingGET3(this.campaignDto.advertiserId, advEntity).subscribe(advResp => {
      if (advResp && advResp.respObject) {
        this.bmForAdvertiser = { id: advResp.respObject.id, name: advResp.respObject.name };
      }
    });

    // SCHEDULE
    // start time (read-only)
    if (this.campaignDto.startTime === CampaignConstants.START_IMMEDIATE_EPOCH) {
      this.assigner.startDate = null;
      this.assigner.startDateCb = true;
    } else {
      this.assigner.startDate = this.commonService.getDateFromEpoch(this.campaignDto.startTime);
      this.assigner.startDateCb = false;
    }

    if (this.campaignDto.endTime >= CampaignConstants.NEVER_ENDING_EPOCH) {
      this.assigner.endDateCb = true;
    } else {
      this.assigner.endDateCb = false;
      // this.assigner.endDate = new Date(this.commonService.epochToDateTimeFormatter(this.campaignDto.endTime));
      this.assigner.endDate = this.commonService.getDateFromEpoch(this.campaignDto.endTime);
    }

    // PRICING AND BUDGETING
    if (this.campaignDto.pricingId === this.pricingLists[this.pricingLists.findIndex(x => x.name === CampaignConstants.PRICING.MARGIN)].id) {// margin pricing id
      this.assigner.flowRate = (this.campaignDto.flowRate * 100);

      const rate = this.assigner.flowRate;
      let rateStr: string;
      if (rate.toString().includes('.')) {
        rateStr = rate.toFixed(2);
        rateStr = (rateStr.endsWith('.00')) ? rateStr.split('.')[0] : rateStr; // truncate trailing zeros
      } else {
        rateStr = rate.toString();
      }
      this.assigner.flowRate = Number(rateStr);

    } else {
      this.assigner.flowRate = this.campaignDto.flowRate;
    }
    if (this.campaignDto.lifetimeBudget === -1) { // radio for lifetime media budget
      this.ngModelPricing.radio = 1;
    } else {
      this.ngModelPricing.radio = 2;
      this.ngModelPricing.inpt = this.campaignDto.lifetimeBudget;
    }
    if (this.campaignDto.dailyBudget === -1) { // daily media budget
      this.assigner.dailyBudget = null;
    } else {
      this.assigner.dailyBudget = this.campaignDto.dailyBudget;
    }

    // ADVANCED SETTINGS
    if (this.campaignDto.lifetimeUserFcap === null) {
      this.ngModelAdvanced.radio = 1;
    } else {
      this.ngModelAdvanced.radio = 2;
      this.ngModelAdvanced.inpt = this.campaignDto.lifetimeUserFcap;
    }
    this.assigner.attributionRatio = (this.campaignDto.attributionRatio * 100);

    // REVX-352 - set the cpa traget value; if pricing is CPA, the disable the input field
    this.assigner.cpaTarget = this.campaignDto && this.campaignDto.cpaTarget ? this.campaignDto.cpaTarget : null;
    if (this.bmForPricing.name === CampaignConstants.PRICING.CPA) {
      this.cpaTarget.nativeElement.disabled = true;
    }
    // console.log(this.assigner);
  }

  fetchRequiredEntities() {
    this.commonService.getDictionary('PRICING', 1, 1000).subscribe(resp => {
      const indexToBeRemoved = resp.respObject.data.findIndex(x => x.name === 'REV_SHARE');
      resp.respObject.data.splice(indexToBeRemoved, 1);
      this.pricingLists = resp.respObject.data;
      this.filteredLists = this.pricingLists;
    });
  }

  openObjectiveModal() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = null;
    this.modalOption.centered = true;
    const modal: NgbModalRef = this.modalService.open(CampaignObjectiveModalComponent, this.modalOption);
    modal.result.then((result) => {
      if (result) {
        // console.log(result);
        this.campaignDto.objective = result;
      }
    });
  }

  openModal(type: string) {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    this.modalOption.centered = true;
    this.campaignDto.pixel = null; // reset pixel on change
    // const modal: NgbModalRef = this.modalService.open(FormBrowseModalComponent, this.modalOption);
    // modal.componentInstance.entity = type;
    const modal: NgbModalRef = this.modalService.open(EntitySelectorRadioComponent, this.modalOption);
    modal.componentInstance.entityType = type; // advertiser, campaign , pixel
    if (this.bmForAdvertiser) {
      modal.componentInstance.advId = this.bmForAdvertiser.id; // required for campaign and pixel
    }
    if (type === AppConstants.ENTITY.PIXEL) {
      modal.componentInstance.advBaseModelForPxlFrom = this.bmForAdvertiser;
    }

    modal.result.then((result) => {
      if (result) {
        if (type == AppConstants.ENTITY.ADVERTISER) {
          this.bmForAdvertiser = result;
          this.checkAdvSkadPrivledge();
        } else if (type == AppConstants.ENTITY.PIXEL) {
          this.campaignDto.pixel = result;
        }
      }
    });
  }


  save() {
    this.validateUIModel();
    if (!this.formValidated) {
      this.scrollToError();
      return;
    }

    this.saveClicked = true;
    this.convertUiToDto();

    // console.log(this.campaignDto);
    // return;

    if (this.cmpId) { // update-campaign
      // console.log('UPDATE CMP');
      this.blockUI.start();
      this.campaignService.updateCmp(this.cmpId, this.campaignDto).subscribe(resp => {
        // console.log(resp);
        this.menuService.invalidateMenucrumbsData();
        this.router.navigate(['/campaign/details/' + resp.respObject.id]);
        this.blockUI.stop();
      }, (error: any) => {
        this.saveClicked = false;
        this.blockUI.stop();
      });

    } else { // new-campaign , BUT FIRST setting some necessary feilds
      // console.log('CREATE CMP');
      this.advService.getById(this.campaignDto.advertiserId).subscribe(fullAdv => {
        if (fullAdv && fullAdv.respObject) {
          // console.log(fullAdv);
          this.campaignDto.currency = fullAdv.respObject.currency;
          this.campaignDto.currencyCode = fullAdv.respObject.currency.name;
          this.campaignDto.region = fullAdv.respObject.region;
          this.campaignDto.ivsDistribution = 1; // hardcoded
          // console.log(this.campaignDto);
          this.blockUI.start();
          this.campaignService.create(this.campaignDto).subscribe(resp => {
            // console.log(resp);
            this.menuService.invalidateMenucrumbsData();
            this.router.navigate(['/campaign/details/' + resp.respObject.id]);
            this.blockUI.stop();
          },
            error => {
              this.blockUI.stop();
            });
        }
      }, (error: any) => {
        this.saveClicked = false;
      });
    }
  }

  validateUIModel() {
    let validated = true;
    // BASIC DETAILS : ("retargeting" is optional and "pixel" depends on "pricing id" so not validated here)
    if (!this.bmForAdvertiser || !this.campaignDto.name || !this.campaignDto.objective) {
      validated = false;
      // console.log('invalid==> basic details');
      this.errScrollId = 'tile-basic';
      this.formValidated = validated;
      return validated;
    }

    // SCHEDULE
    // check if start time not given
    if (!this.cmpId && !this.assigner.startDateCb && !this.assigner.startDate) {
      /// !cmpId => create mode
      validated = false;
      // console.log('invalid==> start date');
      this.errScrollId = 'tile-schedule';
      this.formValidated = validated;
      return validated;
    }
    // check if end time not given
    if (!this.assigner.endDateCb && !this.assigner.endDate) {
      validated = false;
      // console.log('invalid==> end date');
      this.errScrollId = 'tile-schedule';
      this.formValidated = validated;
      return validated;
    }


    // (create mode) && (date is given) and (it got expired by the time save button clicked)
    let nowEpoch = this.commonService.getEpochFromDate(new Date());
    nowEpoch = nowEpoch + 59;
    if (!this.cmpId) {
      // start date
      if (!this.assigner.startDateCb && this.assigner.startDate) {
        if (nowEpoch >= this.commonService.getEpochFromDate(this.assigner.startDate)) {
          validated = false;
          this.errScrollId = 'tile-schedule';
          this.setExpiredStartDateMsg(nowEpoch);
          this.formValidated = validated;
          return validated;
        } else {
          this.expiredStartDateMsg = null;
        }
      }

      // end date
      nowEpoch = this.commonService.getEpochFromDate(new Date());
      nowEpoch = nowEpoch + 59;
      if (!this.assigner.endDateCb && this.assigner.endDate) {
        if (nowEpoch >= this.commonService.getEpochFromDate(this.assigner.endDate)) {
          validated = false;
          this.errScrollId = 'tile-schedule';
          this.setExpiredEndDateMsg(nowEpoch);
          this.formValidated = validated;
          return validated;
        } else {
          this.expiredEndDateMsg = null;
        }
      }

      // start time >= end time
      if (!this.assigner.startDateCb && !this.assigner.endDateCb && this.assigner.startDate && this.assigner.endDate) {
        if (this.commonService.getEpochFromDate(this.assigner.startDate) >= this.commonService.getEpochFromDate(this.assigner.endDate)) {
          validated = false;
          // console.log('invalid==> end date less than start date');
          this.errScrollId = 'tile-schedule';
          this.formValidated = validated;
          return validated;
        }
      }
    }

    // if (edit mode) and (user tries to change end time then he must give a non-expired time)
    nowEpoch = this.commonService.getEpochFromDate(new Date());
    nowEpoch = nowEpoch + 59;
    if (this.cmpId && !this.assigner.endDateCb && this.assigner.endDate) {
      const newEndEpoch = this.commonService.getEpochFromDate(this.assigner.endDate);
      const startEpoch = this.commonService.getEpochFromDate(this.assigner.startDate);
      if (this.previousEndEpoch != newEndEpoch && nowEpoch >= newEndEpoch) {
        validated = false;
        this.errScrollId = 'tile-schedule';
        this.setExpiredEndDateMsg(nowEpoch);
        this.formValidated = validated;
        return validated;
      } else if (startEpoch >= newEndEpoch) {
        validated = false;
        this.errScrollId = 'tile-schedule';
        this.setExpiredEndDateMsg(-1);
        this.formValidated = validated;
        return validated;
      } else {
        this.expiredEndDateMsg = null;
      }
    }


    // PRICING AND BUDGETING (check if "pricing type" is selected and "flow-rate" is valid )
    if (!this.bmForPricing || this.isInvalidNumber(this.assigner.flowRate) || !this.isValidFlowRate(Number(this.assigner.flowRate))) {
      validated = false;
      // console.log('invalid==> pricing not selected or invalid flow rate ');
      this.errScrollId = 'tile-pricing';
      this.formValidated = validated;
      return validated;
    }

    if (this.ngModelPricing.radio === 2 && this.isInvalidNumber(this.ngModelPricing.inpt)) {
      validated = false;
      // console.log('invalid==> ngModel-Pricing-inpt');
      this.errScrollId = 'tile-pricing';
      this.formValidated = validated;
      return validated;
    }

    validated = this.validationBasedOnPricing(); // we have checked valid "flow-rate" and valid "radio input" of ngModelPricing
    if (!validated) {
      this.formValidated = validated;
      return validated;
    }

    // ADVANCED SETTINGS
    if (!this.isNEU(this.assigner.attributionRatio) && (this.isInvalidNumber(this.assigner.attributionRatio) || !this.isValidAttrRatio(this.assigner.attributionRatio))) {
      validated = false;
      // console.log('invalid==> attr. ratio');
      this.errScrollId = 'tile-advanced';
      this.formValidated = validated;
      return validated;
    }

    // first check if "dailyUserFcap" is valid
    if (this.isNEU(this.campaignDto.dailyUserFcap) || this.isInvalidNumber(this.campaignDto.dailyUserFcap) || (Number(this.campaignDto.dailyUserFcap) < 1)) {
      validated = false;
      // console.log('invalid==> daily-FCAP');
      this.errScrollId = 'tile-advanced';
      this.formValidated = validated;
      return validated;
    }
    // "dailyUserFcap" is valid , so now check if "dailyUserFcap" > "lifteimeFcap"
    if (this.ngModelAdvanced.radio === 2) {
      if (this.isInvalidNumber(this.ngModelAdvanced.inpt) || (Number(this.campaignDto.dailyUserFcap) > Number(this.ngModelAdvanced.inpt))) {
        validated = false;
        // console.log('invalid==> daily-FCAP > lifetime-FCAP');
        this.errScrollId = 'tile-advanced';
        this.formValidated = validated;
        return validated;
      }
    }

    /**
     * REVX-352: Validate CPA target field
     * 1. Create
     * 1.1. If Campaign Pricing is CPA, then bid price should be same as CPA target
     * 2. Update
     * 2.1. If strategies under this campaign has CPA strategies, then CPA target is mandatory
     */

    // If Campaign Pricing is CPA, then flow rate should be equal to CPA target
    if (this.bmForPricing && this.bmForPricing.name === CampaignConstants.PRICING.CPA
      && this.assigner.flowRate && this.assigner.cpaTarget) {
      if (this.getNum(this.assigner.cpaTarget) !== this.getNum(this.assigner.flowRate)) {
        validated = false;
        this.formValidated = validated;
        return validated;
      }
    }

    // If value is enteried for CPA target field, it has to be validated with rules similar to flow rate
    if (!this.isValidCPATarget(this.assigner.cpaTarget)) {
      validated = false;
      this.formValidated = validated;
      return validated;
    }

    // if update
    // check if any of the strategies under this campaign has CPA strategies

    this.formValidated = validated;
    return validated;
  }

  validationBasedOnPricing(): boolean {
    let validatedPricing = false;
    const pricing = this.bmForPricing.name;
    switch (this.bmForPricing.name) {
      case CampaignConstants.PRICING.MARGIN:
        this.campaignDto.lifetimeDeliveryCap = null;
        this.campaignDto.dailyDeliveryCap = null;
        if (this.ngModelPricing.radio === 1) {
          this.campaignDto.lifetimeBudget = -1;
          if (this.isNEU(this.assigner.dailyBudget)) {
            // entered flow rate as number and daily budget is empty(valid flow-rate)
            validatedPricing = true;
            this.campaignDto.flowRate = (Number(this.assigner.flowRate) / 100);
            this.campaignDto.dailyBudget = -1;
          }
          if (!this.isNEU(this.assigner.dailyBudget) && !this.isInvalidNumber(this.assigner.dailyBudget)) {
            // entered flow rate and daily budget as numbers
            validatedPricing = true;
            this.campaignDto.flowRate = (Number(this.assigner.flowRate) / 100);
            this.campaignDto.dailyBudget = Number(this.assigner.dailyBudget);
          }

        } else if (this.ngModelPricing.radio === 2) {
          if (!this.isInvalidNumber(this.ngModelPricing.inpt) && this.isNEU(this.assigner.dailyBudget)) {
            // entered lifetime-Budget as number and daily budget is empty (valid flow-rate)
            validatedPricing = true;
            this.campaignDto.flowRate = Number(this.assigner.flowRate);
            this.campaignDto.lifetimeBudget = Number(this.ngModelPricing.inpt);
            this.campaignDto.dailyBudget = -1;
          }
          if (!this.isInvalidNumber(this.ngModelPricing.inpt) && !this.isInvalidNumber(this.assigner.dailyBudget) &&
            Number(this.assigner.dailyBudget) <= Number(this.ngModelPricing.inpt)) {
            // entered lifetime-Budget as number and daily budget is empty (valid flow-rate)
            validatedPricing = true;
            this.campaignDto.flowRate = (Number(this.assigner.flowRate) / 100);
            this.campaignDto.lifetimeBudget = Number(this.ngModelPricing.inpt);
            this.campaignDto.dailyBudget = Number(this.assigner.dailyBudget);
          }
        }
        break;
      case CampaignConstants.PRICING.CPI:
        // pb-3 and pb-5 will be null
        this.campaignDto.lifetimeDeliveryCap = null;
        this.campaignDto.dailyDeliveryCap = null;
        if (this.ngModelPricing.radio === 1) {
          this.campaignDto.lifetimeBudget = -1;
          if (this.isNEU(this.assigner.dailyBudget)) {
            // entered flow rate as number and daily budget is empty(valid flow-rate)
            validatedPricing = true;
            this.campaignDto.flowRate = Number(this.assigner.flowRate);
            this.campaignDto.dailyBudget = -1;
          }
          if (!this.isInvalidNumber(this.assigner.dailyBudget) && Number(this.assigner.flowRate) <= Number(this.assigner.dailyBudget)) {
            // entered flow rate and daily budget as numbers
            validatedPricing = true;
            this.campaignDto.flowRate = Number(this.assigner.flowRate);
            this.campaignDto.dailyBudget = Number(this.assigner.dailyBudget);
          }
        } else if (this.ngModelPricing.radio === 2) {
          if (!this.isInvalidNumber(this.ngModelPricing.inpt) && this.isNEU(this.assigner.dailyBudget)) {
            // entered lifetime-Budget as number and daily budget is empty (valid flow-rate)
            validatedPricing = true;
            this.campaignDto.flowRate = Number(this.assigner.flowRate);
            this.campaignDto.lifetimeBudget = Number(this.ngModelPricing.inpt);
            this.campaignDto.dailyBudget = -1;
          }
          if (!this.isInvalidNumber(this.ngModelPricing.inpt) && !this.isInvalidNumber(this.assigner.dailyBudget) &&
            Number(this.assigner.dailyBudget) <= Number(this.ngModelPricing.inpt) && Number(this.assigner.flowRate) <= Number(this.assigner.dailyBudget)) {
            // entered lifetime-Budget as number and daily budget is empty (valid flow-rate)
            validatedPricing = true;
            this.campaignDto.flowRate = Number(this.assigner.flowRate);
            this.campaignDto.lifetimeBudget = Number(this.ngModelPricing.inpt);
            this.campaignDto.dailyBudget = Number(this.assigner.dailyBudget);
          }
        }
        break;

      case CampaignConstants.PRICING.CPM:
      case CampaignConstants.PRICING.CPC:
      case CampaignConstants.PRICING.CPA:
        // CPA(exclusive - begins)---------------------------
        if (pricing === 'CPA' && !this.campaignDto.pixel) {
          // pixel not selected (ONLY FOR "CPA")
          this.errScrollId = 'tile-basic';
          validatedPricing = false;
          return validatedPricing;
        }
        // CPA(exclusive - ends)---------------------------

        if (this.ngModelPricing.radio === 1) {
          this.campaignDto.lifetimeBudget = -1; // unlimited value(pb-2)
          if (this.isNEU(this.assigner.dailyBudget)) {
            // pb-4 is empty
            validatedPricing = this.deliveryCapAssign();
            this.campaignDto.flowRate = Number(this.assigner.flowRate);
            this.campaignDto.dailyBudget = -1;

          }
          if (!this.isNEU(this.assigner.dailyBudget) && !this.isInvalidNumber(this.assigner.dailyBudget) && Number(this.assigner.flowRate) <= Number(this.assigner.dailyBudget)) {
            // pb-4 and flow rate is number
            validatedPricing = this.deliveryCapAssign();
            this.campaignDto.flowRate = Number(this.assigner.flowRate);
            this.campaignDto.dailyBudget = Number(this.assigner.dailyBudget);
          }

        } else if (this.ngModelPricing.radio === 2) {
          if (!this.isInvalidNumber(this.ngModelPricing.inpt)) {
            if (this.isNEU(this.assigner.dailyBudget)) {
              // pb-4 is empty
              validatedPricing = this.deliveryCapAssign();
              this.campaignDto.flowRate = Number(this.assigner.flowRate);
              this.campaignDto.lifetimeBudget = Number(this.ngModelPricing.inpt);
              this.campaignDto.dailyBudget = -1;
            }
            if (!this.isNEU(this.assigner.dailyBudget) && !this.isInvalidNumber(this.assigner.dailyBudget) && Number(this.assigner.flowRate) <= Number(this.assigner.dailyBudget) &&
              Number(this.assigner.dailyBudget) <= Number(this.ngModelPricing.inpt)) {
              // pb-4 is number and all are in valid comparison state
              validatedPricing = this.deliveryCapAssign();
              this.campaignDto.flowRate = Number(this.assigner.flowRate);
              this.campaignDto.lifetimeBudget = Number(this.ngModelPricing.inpt);
              this.campaignDto.dailyBudget = Number(this.assigner.dailyBudget);

            }
          }
        }
        break;

    }
    if (!validatedPricing) {
      // console.log('failed in pricing-validation')
      this.errScrollId = 'tile-pricing';
    } else {
      // console.log('PASSED in pricing-validation')
    }
    return validatedPricing;


  }

  deliveryCapAssign() {
    // lifetime : empty && daily : empty
    if (this.isNEU(this.campaignDto.lifetimeDeliveryCap) && this.isNEU(this.campaignDto.dailyDeliveryCap)) {
      this.campaignDto.dailyDeliveryCap = null;
      this.campaignDto.lifetimeDeliveryCap = null;
      return true;

    }

    // lifetime : empty && daily : >=0
    if (this.isNEU(this.campaignDto.lifetimeDeliveryCap) && !this.isNEU(this.campaignDto.dailyDeliveryCap) && !this.isInvalidNumber(this.campaignDto.dailyDeliveryCap)) {
      this.campaignDto.dailyDeliveryCap = Number(this.campaignDto.dailyDeliveryCap);
      this.campaignDto.lifetimeDeliveryCap = null;
      return true;
    }

    // lifetime : >=0 && daily : empty
    if (!this.isNEU(this.campaignDto.lifetimeDeliveryCap) && !this.isInvalidNumber(this.campaignDto.lifetimeDeliveryCap) && this.isNEU(this.campaignDto.dailyDeliveryCap)) {
      this.campaignDto.dailyDeliveryCap = null;
      this.campaignDto.lifetimeDeliveryCap = Number(this.campaignDto.lifetimeDeliveryCap);
      return true;
    }

    // lifetime : >=0 && daily : >=0 && lifetime >= daily
    if (!this.isNEU(this.campaignDto.lifetimeDeliveryCap) && !this.isNEU(this.campaignDto.dailyDeliveryCap) &&
      !this.isInvalidNumber(this.campaignDto.lifetimeDeliveryCap) && !this.isInvalidNumber(this.campaignDto.dailyDeliveryCap) &&
      Number(this.campaignDto.lifetimeDeliveryCap) >= Number(this.campaignDto.dailyDeliveryCap)) {
      this.campaignDto.dailyDeliveryCap = Number(this.campaignDto.dailyDeliveryCap);
      this.campaignDto.lifetimeDeliveryCap = Number(this.campaignDto.lifetimeDeliveryCap);
      return true;
    }

    this.errScrollId = 'tile-pricing';
    return false;
  }

  convertUiToDto() {
    // BASIC DETAILS - advertiserId
    this.campaignDto.advertiserId = this.bmForAdvertiser.id;

    // SCHEDULE - startDate(only for new campaigns) and end date
    if (!this.cmpId) {
      if (this.assigner.startDateCb) {
        // this.campaignDto.startTime = this.campaignService.getEpochValue(new Date());
        this.campaignDto.startTime = CampaignConstants.START_IMMEDIATE_EPOCH;
      } else if (!this.assigner.startDateCb) {
        this.campaignDto.startTime = this.commonService.getEpochFromDate(this.assigner.startDate);
      }
    }
    if (this.assigner.endDateCb) {
      this.campaignDto.endTime = CampaignConstants.NEVER_ENDING_EPOCH;
    } else if (!this.assigner.endDateCb) {
      this.campaignDto.endTime = this.commonService.getEpochFromDate(this.assigner.endDate);
    }

    // PRICING AND BUDGETING - pricingId and FlowRate
    this.campaignDto.pricingId = this.bmForPricing.id;
    if (this.campaignDto.pricingId === 5) {
      this.campaignDto.flowRate = (Number(this.assigner.flowRate) / 100);

    } else {
      this.campaignDto.flowRate = Number(this.assigner.flowRate);
    }

    // ADVANCED- dailyuserfcap , lifetimeUserFcap , Attr.Ratio
    this.campaignDto.dailyUserFcap = Math.ceil(Number(this.campaignDto.dailyUserFcap));
    if (this.ngModelAdvanced.radio === 1) {
      this.campaignDto.lifetimeUserFcap = null;
    } else {
      this.campaignDto.lifetimeUserFcap = Number(this.ngModelAdvanced.inpt);
    }
    this.campaignDto.attributionRatio = (Number(this.assigner.attributionRatio) / 100);

    /**
     * REVX-352: Add the CPA target value into the CampaignDTO object
     */
    this.campaignDto.cpaTarget = (this.assigner && this.assigner.cpaTarget) ? Number(this.assigner.cpaTarget) : null;
  }

  isNEU(x) {
    if (x === null || x === undefined || x === '') {
      return true;
    }
    return false;
  }

  pricingIdChange(type: string, event?, pb3_input?, pb3_after?, pb4_input?, pb4_after?, pb5_input?, pb5_after?) {
    let pricing: string;
    if (type === 'dummy') {
      pricing = event.value.name;
    } else {
      pricing = type;
    }

    // REVX-352: Reset state of CPA target
    this.cpaTarget.nativeElement.disabled = false;
    this.cpaTarget.nativeElement.value = null;
    this.assigner.cpaTarget = null;

    switch (pricing) {
      case CampaignConstants.PRICING.MARGIN:
        pb3_input.disabled = true;
        pb3_input.value = null;
        pb3_after.innerText = ' ';
        // pb4_input.disabled
        // pb4_after.innerText
        pb5_input.disabled = true;
        pb5_input.value = null;
        pb5_after.innerText = ' ';
        break;
      case CampaignConstants.PRICING.CPC:
        pb3_input.disabled = false;
        pb3_after.innerText = 'Clicks';
        // pb4_input.disabled
        // pb4_after.innerText
        pb5_input.disabled = false;
        pb5_after.innerText = 'Clicks';
        break;
      case CampaignConstants.PRICING.CPI:
        pb3_input.disabled = true;
        pb3_input.value = null;
        pb3_after.innerText = 'Installs';
        // pb4_input.disabled
        // pb4_after.innerText
        pb5_input.disabled = true;
        pb5_input.value = null;
        pb5_after.innerText = 'Installs';
        break;
      case CampaignConstants.PRICING.CPM:
        pb3_input.disabled = false;
        pb3_after.innerText = 'Impressions';
        // pb4_input.disabled
        // pb4_after.innerText
        pb5_input.disabled = false;
        pb5_after.innerText = 'Impressions';
        break;
      case CampaignConstants.PRICING.CPA:
        pb3_input.disabled = false;
        pb3_after.innerText = 'Conversions';
        // pb4_input.disabled
        // pb4_after.innerText
        pb5_input.disabled = false;
        pb5_after.innerText = 'Conversions';

        // REVX-352: If campaign pricing is CPA, CPA Campaign Price = CPA Target (CPA target field will be non editable in this case)
        this.cpaTarget.nativeElement.disabled = true;
        this.setCPATargetValue();
        break;


    }
  }

  isValidFlowRate(flwRate): boolean {
    if (this.bmForPricing && this.bmForPricing.name === CampaignConstants.PRICING.MARGIN) {
      const y: boolean = (Math.ceil(parseFloat(flwRate)) >= 0 && Math.ceil(parseFloat(flwRate)) <= 99); // only for margin(0<=X<=99)
      return y;
    } else if (this.bmForPricing && this.bmForPricing.name !== CampaignConstants.PRICING.MARGIN) {
      const z: boolean = (Math.ceil(parseFloat(flwRate)) > 0); // others X>=0
      return z;
    }
  }

  // function to check if the entered CPA target value is valid
  isValidCPATarget(target): boolean {
    let isValid = true;
    if (target) {
      isValid = (Math.ceil(parseFloat(target)) > 0);
    }
    return isValid;
  }

  isValidAttrRatio(attrRatio: string): boolean {
    const y: boolean = (Math.ceil(parseFloat(attrRatio)) >= 0 && Math.ceil(parseFloat(attrRatio)) <= 100); // only for attr-ratio
    return y;

  }

  isInvalidNumber(x): boolean {
    // returns true if number is not valid(string or negative or spcl chars)
    const reg = new RegExp('^[0-9]+(?:\.[0-9]+)?$'); // regex for floating numbers
    if (parseFloat(x) < 0 || !reg.test(x)) {
      return true;
    }
    return false;
  }


  getNum(str) {
    return Number(str);
  }

  hasSpclChars(str) {
    // used for ui only
    if (!isNaN(Number(str))) {
      return false; // if string has number (positive or negative)
    } else {
      const reg = new RegExp('/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$');
      if (str && !reg.test(str)) {
        return true;
      }
      return false;
    }
  }

  search(query: string) {
    let result;
    result = this.selectFilter(query);
    this.filteredLists = result;
  }

  selectFilter(query: string): string[] {
    const result: string[] = [];
    for (const a of this.pricingLists) {
      if (a.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
        result.push(a);
      }
    }
    return result;
  }

  resetFilterList(myInput) {
    myInput.value = null;
    this.filteredLists = this.pricingLists;
  }

  scrollToError() {
    const el = document.getElementById(this.errScrollId);
    if (el)
      el.scrollIntoView({ behavior: 'smooth' });
  }


  private scrollToTop() {
    const pageContainer = document.querySelector('.cmp-form-container');
    if (pageContainer !== null && pageContainer !== undefined) {
      setTimeout(() => { pageContainer.scrollIntoView({ behavior: 'smooth' }); }, 500);
    }
  }

  onCheckboxChange(event, type) {
    if (type === 1) {
      this.assigner.startDate = null;
    } else {
      this.assigner.endDate = null;
    }
  }



  onStartTimeChange(event: any) {
    // endTimemin = MAX(current Time , ui selected strategy start time)
    const uiStartTime = event.value;
    let cmpStartEpoch = 0;
    let maxEpoch = 0;
    const currEpoch = this.commonService.getEpochFromDate(new Date());

    if (uiStartTime !== null) {
      cmpStartEpoch = this.commonService.getEpochFromDate(uiStartTime);
    } else {
      cmpStartEpoch = -1;
    }

    maxEpoch = (currEpoch >= cmpStartEpoch) ? currEpoch : cmpStartEpoch;
    this.assigner.minEndDate = this.commonService.getDateFromEpoch(maxEpoch);

    // if (CREATE mode) &&  (ui form end date) < (min end date) => update is required
    let endDateEpoch = 0;
    if (!this.cmpId && !this.assigner.endDateCb && this.assigner.endDate) {
      endDateEpoch = this.commonService.getEpochFromDate(this.assigner.endDate);
      if (endDateEpoch < maxEpoch) {
        this.assigner.endDate = null;
      }
    }

  }

  setExpiredEndDateMsg(nowEpoch: number) {
    if (nowEpoch === -1) {
      this.expiredEndDateMsg = CampaignConstants.VALIDATION_SCHEDULE;
    } else {
      this.expiredEndDateMsg = CampaignConstants.END_DATE_EXPIRED + this.commonService.epochToDateTimeFormatter(nowEpoch - 59);
    }
  }

  setExpiredStartDateMsg(nowEpoch: number) {
    this.expiredStartDateMsg = CampaignConstants.START_DATE_EXPIRED + this.commonService.epochToDateTimeFormatter(nowEpoch);
  }


  gotoPixel() {
    // goto : advertiser/:id/pixel/details/:pid
    this.router.navigate(['advertiser', this.bmForAdvertiser.id, 'pixel', 'details', this.campaignDto.pixel.id]);
  }

  gotoAdv() {
    // goto  : advertiser/details/:id
    this.router.navigate(['advertiser', 'details', this.bmForAdvertiser.id]);
  }

  getEpochValue(date: Date) {
    return this.commonService.getEpochFromDate(date);
  }



  //REVX-724 : 
  //CREATE FLOW
  //if advertiser has privledge :
  //  1. Skad check box will be enabled , if user checks it : set objective as app install and disable objective selection further
  //  2. if user 1st selects and then unselects the check box , reset the objective setion
  //else if advertiser does not has privledge : continue as normal , skad check box is disabled

  //EDIT FLOW
  //we cannot change skad checkbox form true to false in edit slow

  onSkadCbChange(event) {
    //reset advanced section to default value
    this.campaignDto.dailyUserFcap = 8;
    this.ngModelAdvanced.radio = 1;
    this.assigner.cpaTarget = null;
    this.assigner.attributionRatio = 100;

    //if skad : reset objective and disable retargeting checkbox 
    if (event) {
      this.campaignDto.objective = CampaignConstants.MOBILE_APP_INSTALLS;
      this.campaignDto.retargeting = false;
    } else {
      this.campaignDto.objective = null;
      this.campaignDto.retargeting = false;

    }
  }


  checkAdvSkadPrivledge() {
    let advId = (this.bmForAdvertiser && this.bmForAdvertiser.id >= 0) ? this.bmForAdvertiser.id : null;
    this.entitiesService.getSkadPrivledge('advertiserId', advId).subscribe((resp: ApiResponseObjectSkadTargetPrivileges) => {
      this.skadAllowed = (resp && resp.respObject && resp.respObject.allowed) ? true : false;
    }, (error: any) => {
      this.skadAllowed = false;
    })
  }

  showObjectiveEditOption(): boolean {
    if (this.cmpId >= 0) {
      return false;
    }
    if (this.campaignDto && this.campaignDto.skadTarget) {
      return false;
    }
    return true;
  }



}
