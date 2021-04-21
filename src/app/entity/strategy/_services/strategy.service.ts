import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesConstants } from '@app/shared/_constants/EntitiesConstants';
import { BulkUploadModalComponent } from '@app/shared/_directives/_modals/bulk-upload-modal/bulk-upload-modal.component';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { environment } from '@env/environment';
import {
  BaseModel,
  BulkstrategiesRequest,
  BulkStrategyControllerService,
  CreativeDTO,
  RTBSites,
  StrategyControllerService,
  StrategyDTO,
  TargetingObject,
  AudienceStrDTO,
  DealCategoryDTO,
  TargetMobileDevices,
  DayPart
} from '@revxui/api-client-ts';
import * as moment from 'moment';
import { ReplaySubject, Subject } from 'rxjs';
import { StrategyConstants } from '../_constants/StrategyConstants';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MODE = {
  CREATE: 0,
  EDIT: 1
};

export const PARTS = {
  BASIC: 0,
  INVENTORY: 1,
  TARGETING: 2,
  BUDGET: 3,
  CREATIVE: 4,
  REVIEW: 5
};

export const PARTS_STR = {
  BASIC: 'basic',
  INVENTORY: 'inventory',
  TARGETING: 'targeting',
  BUDGET: 'budget',
  CREATIVE: 'creative',
  REVIEW: 'review'
};

// export const CREATIVE_IMAGE_API = environment.CREATIVE_API_PATH + '/creatives';
export const CREATIVE_IMAGE_API = environment.hosts.origin + '/creatives';

// these options are hardcoded : ideally should be read from elastic search
export const budgetPacingOpts: any[] = [
  { id: 'asap', value: 1, title: 'ASAP (Lifetime)', disabled: false },
  { id: 'evenly', value: 10, title: 'Evenly (Lifetime)', disabled: true }
];

// these options are hardcoded : ideally should be read from elastic search
export const budgetPacingOptsDaily: any[] = [
  { id: 'asap', value: 6, title: 'ASAP (Daily)', disabled: false },
  { id: 'evenly', value: 7, title: 'Evenly (Daily)', disabled: false }
];

// these options are hardcoded : ideally should be read from elastic search
export const bidTypeOpts: any[] = [
  { id: 'cpm', value: 1, title: 'CPM', desc: 'Bid for Impressions' },
  { id: 'cpc', value: 2, title: 'CPC', desc: 'Bid for Clicks' },
  { id: 'cpa', value: 3, title: 'CPA', desc: 'Bid for Acquisitions' },
  { id: 'cpi', value: 6, title: 'CPI', desc: 'Bid for Installs' },
];

export interface GridData {
  id: number;
  name: string;
  isTargetted?: boolean;
  isBlocked?: boolean;
}

export interface AudienceElement {
  id: number;
  name: string;
  active?: boolean;
  type?: string;
}

export interface AudienceTBObject {
  app: TargetingObject;
  web: TargetingObject;
  dmp: TargetingObject;
}

//REVX-724 : skad-ui changes
export interface SkadSettings {
  SKAD_CAMPAIGN: {
    ANDROID_APP_CATAGORIES: boolean
    AUDIENCE_TARGETING: {
      APP_AUDIENCE: boolean,
      DMP_AUDIENCE: boolean,
      WEB_AUDIENCE: boolean,
    },
    MOBILE_OPERATING_SYSTEM: {
      ANDROID: boolean
    }
  }
}

//REVX-724 : skad ui changes
export const DEFAULT_SKAD_SETTINGS: SkadSettings = {
  SKAD_CAMPAIGN: {
    ANDROID_APP_CATAGORIES: true,
    AUDIENCE_TARGETING: {
      APP_AUDIENCE: true,
      DMP_AUDIENCE: true,
      WEB_AUDIENCE: true,
    },
    MOBILE_OPERATING_SYSTEM: {
      ANDROID: true
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class StrategyService {

  // public onStrategyDetailsSet = new ReplaySubject<{ strDetails: StrategyDTO }>();

  public onStrategyDetailsSet = new Subject<{ strDetails: StrategyDTO, callCreativeApi: boolean }>();


  public onCampaignDetailsSet = new Subject<{ details: any }>();
  public onAdvertiserDetailsSet = new Subject<{ details: any }>();
  public onStepperIndexChange = new Subject<number>();

  public advDmpAccessSubject = new ReplaySubject<boolean>();

  public reCheckEndTimeFlag = new Subject<boolean>();


  //REVX-724 : skad ui changes
  // public isStrategySkad = new Subject<boolean>();
  public skadSettings = new Subject<SkadSettings>();
  onCampaignDetailsReset = new Subject<boolean>();


  private strID: number;
  private strName: string;
  private strIsActive: boolean;
  private isSaved: boolean;

  private campaignDetails: any;
  private advertiserDetails: any;

  //this is used to allow jumping in create flow
  maxStepperVisited: number;
  public maxStepperVisitedSubject = new Subject<number>();

  // whole
  private strDetails: StrategyDTO;

  // part
  private strBasicDetails: any;
  private strInventoryDetails: any;
  private strTragetingDetails: any;
  private strBudgetDetails: any;
  private strCreativeDetails: any;

  //stepper
  // private stepper: MatHorizontalStepper;

  constructor(
    private apiService: StrategyControllerService,
    private bulkStrategyApiService: BulkStrategyControllerService,
    private alertService: AlertService,
    private audienceService: AudienceService,
    private commonService: CommonService,
    private modal: MatDialog,
  ) { }

  public setReCheckEndTimeFlag(toBeChecked: boolean) {
    this.reCheckEndTimeFlag.next(toBeChecked);
  }

  // getter setter : isSaved
  public getIsSaved() {
    return this.isSaved;
  }

  public setIsSaved(saved: boolean) {
    this.isSaved = saved;
  }

  // getter setter : isSaved
  public getAdvertiserDetails() {
    return this.advertiserDetails;
  }

  public setAdvertiserDetails(data: any) {
    this.advertiserDetails = data;
    this.onAdvertiserDetailsSet.next({ details: this.advertiserDetails });
  }

  // getter setter : campaignDetails
  public getCampaignDetails() {
    return this.campaignDetails;
  }

  public setCampaignDetails(data: any) {
    this.campaignDetails = data;
    this.onCampaignDetailsSet.next({ details: this.campaignDetails });
  }

  public setCampaignDetailsNoTrigger(data: any) {
    this.campaignDetails = data;
  }

  resetCampaignDetails() {
    this.campaignDetails = null;
    // this.onCampaignDetailsSet.next({ details: this.campaignDetails });
    this.onCampaignDetailsReset.next(true);
  }

  // getter setter : strID
  public getStrID() {
    return (this.strID) ? this.strID : 'NA';
  }

  public setStrID(id: number) {
    this.strID = id;
  }

  // getter setter : strName
  public getStrName() {
    return this.strName;
  }

  public setStrName(name: string) {
    this.strName = name;
  }

  // getter setter : strIsActive
  public getStrIsActive() {
    return this.strIsActive;
  }

  public setStrIsActive(active: boolean) {
    this.strIsActive = active;
  }

  // getter setter : strDetails
  public getStrDetails() {
    return this.strDetails;
  }

  public setStrDetails(details: StrategyDTO, isBasicDetails?: boolean, isBulkEdit?: boolean, callCreativesApi?: boolean) {
    this.strDetails = details;

    if (details && details.id)
      this.setStrID(details.id);

    if (details && details.name)
      this.setStrName(details.name);

    if (details && details.active !== null && details.active !== undefined)
      this.setStrIsActive(details.active);

    this.onStrategyDetailsSet.next({ strDetails: details, callCreativeApi: callCreativesApi });

    if (isBasicDetails) {
      if (!isBulkEdit)
        this.checkAdvertiserDmpAccess();
      else
        this.advDmpAccessSubject.next(true);

    }
  }


  checkAdvertiserDmpAccess() {
    const advId = (this.strDetails && this.strDetails.advertiser && this.strDetails.advertiser.id) ? this.strDetails.advertiser.id : 0;
    this.audienceService.getAccess(advId).subscribe(resp => {
      const hasDmpAccess = (resp && resp.respObject && resp.respObject.isDmpAccess) ? resp.respObject.isDmpAccess : false;
      this.advDmpAccessSubject.next(hasDmpAccess);
    }, error => {
      this.advDmpAccessSubject.next(false);
    })
  }

  public clearStrategyDetails() {
    this.strDetails = {} as StrategyDTO;
  }

  public updateStrategyStatus(isActivate: boolean, ids: any) {
    if (isActivate) {
      return this.apiService.activateStrategyUsingPOST(ids, null, this.getAuthToken());
    } else {
      return this.apiService.deactivateStrategyUsingPOST(ids, null, this.getAuthToken());
    }
  }

  // getter setter : strBasicDetails
  public getStrBasicDetails() {
    return this.strBasicDetails;
  }

  public setStrBasicDetails(details: any) {
    this.strBasicDetails = details;
  }

  // getter setter : strInventoryDetails
  public getStrInventoryDetails() {
    return this.strInventoryDetails;
  }

  public setStrInventoryDetails(details: any) {
    this.strInventoryDetails = details;
  }

  // getter setter : strTragetingDetails
  public getStrTragetingDetails() {
    return this.strTragetingDetails;
  }

  public setStrTragetingDetails(details: any) {
    this.strTragetingDetails = details;
  }

  // getter setter : strBasicDetails
  public getStrBudgetDetails() {
    return this.strBudgetDetails;
  }

  public setStrBudgetDetails(details: any) {
    this.strBudgetDetails = details;
  }

  // getter setter : strBasicDetails
  public getStrCreativeDetails() {
    return this.strCreativeDetails;
  }

  public setStrCreativeDetails(details: any) {
    this.strCreativeDetails = details;
  }

  // getter setter : strReviewSummaryForDetailsPage
  // REVX-127 adding aution details for summary here
  public getStrReviewSummaryForDetailsPage() {
    return [
      { id: PARTS_STR.BASIC, header: 'BASICS', showEdit: true, value: this.getBasicPart(true) },
      { id: PARTS_STR.BUDGET, header: 'BUDGET & BIDDING', showEdit: true, value: this.getBudgetPart(true) },
      { id: PARTS_STR.TARGETING, header: 'DELIVERY TARGETING', showEdit: true, value: this.getTargetingPart() },
      { id: PARTS_STR.INVENTORY, header: 'INVENTORY', showEdit: true, value: this.getInventoryPart() },
      { id: PARTS_STR.CREATIVE, header: 'CREATIVE', showEdit: true, value: this.getCreativePart() }
    ];
  }

  // getter setter : strReviewSummaryForEditPage
  // REVX-127 adding aution details for summary here
  public getStrReviewSummaryForEditPage() {
    return [
      { id: PARTS_STR.BASIC, header: 'Details', splitVertically: true, showEdit: false, value: this.getBasicPart(false) },
      { id: PARTS_STR.BUDGET, header: 'Budget & Bidding', splitVertically: true, showEdit: false, value: this.getBudgetPart(false) },
      { id: PARTS_STR.TARGETING, header: 'Targeting', splitVertically: false, showEdit: false, value: this.getTargetingPart() },
      { id: PARTS_STR.INVENTORY, header: 'Inventory', splitVertically: false, showEdit: false, value: this.getInventoryPart() },
      { id: PARTS_STR.CREATIVE, header: 'Creative', splitVertically: false, showEdit: false, value: this.getCreativePart() },
      {
        id: 'status', header: 'Status', splitVertically: false, showEdit: false, value: [
          { type: 'status', id: 'status', title: '', value: true },
        ]
      }
    ];
  }

  public getReqID() {
    // function s4() {
    //   return Math.floor((1 + Math.random()) * 0x10000)
    //     .toString(16)
    //     .substring(1);
    // }
    // return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    //   s4() + '-' + s4() + s4() + s4();
    return this.commonService.getReqID();
  }

  public getAuthToken() {
    return localStorage.getItem(AppConstants.CACHED_TOKEN) ?
      localStorage.getItem(AppConstants.CACHED_TOKEN) : localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
  }

  public setStepperIndex(index: number) {
    this.onStepperIndexChange.next(index);
  }

  public filterAndTransformData(entity: string, data: BaseModel[], filterProp?: string, filterValue?: any) {
    let gridData: GridData[] = [];

    switch (entity) {
      case 'STATE':
        gridData = data.map((item: any) => {
          return {
            id: item.id,
            name: `${item.countryName} - ${item.name}`
          };
        });
        break;
      case 'CITY':
        gridData = data.map((item: any) => {
          return {
            id: item.id,
            name: `${item.countryName} - ${item.stateName} - ${item.name}`
          };
        });
        break;
      case 'COUNTRY':
      case 'AUDIENCE':
      case 'DMP_AUDIENCE':
      case 'AGGREGATOR':
      case 'DEVICE_BRAND':
      case 'DEVICE_MODEL':
      case 'APP_CATEGORY':
      case 'DEAL_CATEGORY':
        gridData = data.map((item: BaseModel) => {
          return {
            id: item.id,
            name: item.name
          };
        });
        break;
      default:
        gridData = [];
        break;
    }

    return gridData;
  }


  public hasSpecialCharacters(value: string, pattern?: any) {
    const exp = pattern ? pattern : /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/;
    return exp.test(value);
  }


  public hasSpecialCharacterCustom(value: string, pattern?: any) {
    let bool1 = this.hasSpecialCharacters(value, pattern);
    const expForAlphabets = /[a-zA-Z]+/;
    let bool2 = expForAlphabets.test(value);
    return (bool1 || bool2);
  }

  public scrollToError() {
    setTimeout(() => {
      const el = document.querySelector('.help-text');
      if (el !== null) {
        el.parentElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  }

  public export(event: any) {
    const startTime = moment.unix(event.dateRange.startDateEpoch).format('MMMM D, YYYY');
    const endTime = moment.unix(event.dateRange.endDateEpoch).subtract(1, 'days').format('MMMM D, YYYY');

    const msg = `All active Strategies for the selected Campaigns will be exported with performance metrics from
    ${startTime} to ${endTime}.
    You can modify Bid Price, Bid Type, F-Cap, and Strategy Name in the exported file and
    import the file again to bulk edit modified strategies.`;
    // this.confirmationModalService.confirm('CONFIRM TO EXPORT', msg, 'Yes', 'No', 'lg')
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.alertService.warning(EntitiesConstants.EXPORTING_DATA, false, true);
    //       this.exportStrategyData(event);
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
        if (confirmed) {
          this.alertService.warning(EntitiesConstants.EXPORTING_DATA, false, true);
          this.exportStrategyData(event);
        }
      }
    );

  }

  public import(event: any) {
    const modalRef = this.modal.open(BulkUploadModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      data: {
        title: 'ENTER STRATEGIES BELOW',
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

  public exportStrategyData(event) {
    const bulkstrategiesRequest: BulkstrategiesRequest = {
      campaignIds: event.ids,
      endTimestamp: event.dateRange.endDateEpoch,
      startTimestamp: event.dateRange.startDateEpoch
    };
    // this.http.post('http://192.168.152.226:10045/v2/api/strategies/export', bulkstrategiesRequest, {
    // this.http.post('http://localhost:10045/v2/api/strategies/export', bulkstrategiesRequest, {
    //   headers: { token: this.getAuthToken() }
    // })
    this.bulkStrategyApiService.exportStrategiesDataUsingPOST(bulkstrategiesRequest)
      .subscribe((response: any) => {
        if (response && response.respObject) {
          this.alertService.clear(true);
          const fileUrl = response.respObject.fileDownloadUrl;
          if (fileUrl !== null && fileUrl !== undefined) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.click();
          } else {
            this.alertService.error('Error while exporting data. Please try again later.', false, true);
          }
        }
      }, error => {
        this.alertService.clear(true);
      });
  }

  getStrategyTime(datetime: number, isStartTime: boolean, isDetailsPage?: boolean) {
    if (isStartTime && (datetime === null || datetime === -1)) {
      const currDateEpoch = this.commonService.getEpochFromDate(new Date());
      const campaignStart = ((this.strDetails.campaign) as any).startTime;
      const laterTime = Math.max(currDateEpoch, campaignStart);
      return moment(this.commonService.getDateFromEpoch(laterTime)).format('DD MMM YYYY h:mm A');
    }
    //for end-time or well defined start-time
    return (datetime === -1) ? 'Never Ending' : moment(this.commonService.getDateFromEpoch(datetime)).format('DD MMM YYYY h:mm A');
  }

  getDailyFCap() {
    const isCampaignFcap = this.strDetails.campaignFcap;
    if (isCampaignFcap) {
      return `Use Campaign Fcap setting - Show ad no more than ${this.strDetails.campaign['fcap']} times per user in one day`;
    } else {
      // return `Show ad no more than ${this.strDetails.fcapFrequency} times per user in one day`;
      return `Show ad no more than ${this.strDetails.fcapFrequency} times per user in ${this.strDetails.fcapInterval} hours`;

    }
  }

  // getHourlyFcap() {
  //   if(this.strDetails.isHourlyFcap)
  //     return `Show ad no more than ${this.strDetails.hourlyUserFcap} times per user in ${this.strDetails.hourlyFcapDuration} hours`;
  //   return `NA`;
  // }

  getPixelDetail() {
    if (this.strDetails.pixels === null) {
      return null;
    } else {
      return { id: this.strDetails.pixels[0].id, name: this.strDetails.pixels[0].name };
    }
  }

  getLifeTimeMediaBudget() {
    const currency = (this.strDetails && this.strDetails.campaign) ? (this.strDetails.campaign as any).currencyCode : null;
    return (this.strDetails.budgetValue === -1) ? 'Unlimited' : `Limit to ${this.strDetails.budgetValue} ${currency}`;
  }

  getDailyMediaBudget() {
    const currency = this.strDetails.campaign ? (this.strDetails.campaign as any).currencyCode : null;
    return (this.strDetails.pacingBudgetValue) ? `${this.strDetails.pacingBudgetValue} ${currency} / Day` : 'NA';
  }

  getBidTypeAndGoal() {
    const bidType = (this.strDetails && this.strDetails.pricingType) ? this.strDetails.pricingType.id : null;
    const bidPrice = (this.strDetails && this.strDetails.pricingValue) ? this.strDetails.pricingValue : null;
    const currency = (this.strDetails && this.strDetails.currencyCode) ? this.strDetails.currencyCode : null;
    if (bidType !== null && bidPrice !== null) {
      const index = bidTypeOpts.findIndex(item => item.value === bidType);
      return (index !== -1) ? `${bidTypeOpts[index].title} ${bidPrice} ${currency}` : null;
    } else {
      return null;
    }
  }

  getBidType() {
    const bidType = (this.strDetails.pricingType) ? this.strDetails.pricingType.id : null;
    if (bidType !== null) {
      const index = bidTypeOpts.findIndex(item => item.value === bidType);
      return (index !== -1) ? bidTypeOpts[index].title : null;
    } else {
      return null;
    }
  }

  getBidPrice() {
    const currency = (this.strDetails.campaign as any).currencyCode;
    return `${this.strDetails.pricingValue} ${currency}`;
  }

  getBudgetPacing(forDetailsPage: boolean) {
    if (forDetailsPage) {
      const pacingType = (!this.strDetails.pacingType) ? null : this.strDetails.pacingType.name;
      const pacingBudgetValue = (!this.strDetails.pacingBudgetValue) ? null : this.strDetails.pacingBudgetValue;
      const currency = this.strDetails.currencyCode;
      return (pacingType && pacingBudgetValue) ? `${pacingType} ${pacingBudgetValue} ${currency}` : `${pacingType}`;
    } else {
      return (!this.strDetails.pacingType) ? null :
        (this.strDetails.pacingType.id === 6 || this.strDetails.pacingType.id === 1) ? 'ASAP' : 'Evenly';
    }
  }

  getBidRange() {
    const min = this.strDetails.bidCapMin;
    const max = this.strDetails.bidCapMax;
    if (min !== null && min !== undefined && max !== null && max !== undefined) {
      if (min === 0 && max === -1) {
        return 'NA';
      } else {
        return `${min} to ${max}`;
      }
    } else {
      return 'NA';
    }
  }

  getBidRangeMin() {
    return (this.strDetails.bidCapMin && this.strDetails.bidCapMin > 0) ? this.strDetails.bidCapMin : 'NA';
  }

  getBidRangeMax() {
    return (this.strDetails.bidCapMax && this.strDetails.bidCapMax !== -1) ? this.strDetails.bidCapMax : 'NA';
  }

  getBasicPart(forDetailsPage: boolean) {
    const basicPart = [];
    if (forDetailsPage) {
      basicPart.push(...[
        { type: 'text', id: 'channel', title: 'Channel', value: 'Display' },
        { type: 'text', id: 'startDate', title: 'Start Date', value: this.getStrategyTime(this.strDetails.startTime, true, forDetailsPage) },
        { type: 'text', id: 'endDate', title: 'End Date', value: this.getStrategyTime(this.strDetails.endTime, false, forDetailsPage) },
        { type: 'text', id: 'dailyFCap', title: 'Frequency Cap', value: this.getDailyFCap() },
        // { type: 'text', id: 'hourlyFCap', title: 'Hourly Frequency Cap', value: this.getHourlyFcap() },
        { type: 'link', id: 'trackingPixel', title: 'Tracking Pixel', value: this.getPixelDetail() }
      ]);
    } else {
      basicPart.push(...[
        { type: 'text', id: 'strategyID', title: 'Strategy ID', value: this.getStrID() },
        { type: 'text', id: 'dailyFCap', title: 'Frequency Cap', value: this.getDailyFCap() },
        // { type: 'text', id: 'hourlyFCap', title: 'Hourly Frequency Cap', value: this.getHourlyFcap() },
        { type: 'text', id: 'startTime', title: 'Start Time', value: this.getStrategyTime(this.strDetails.startTime, true, forDetailsPage) },
        { type: 'text', id: 'endTime', title: 'End Time', value: this.getStrategyTime(this.strDetails.endTime, false, forDetailsPage) }
      ]);
    }

    return basicPart;
  }


  //REVX-724 : skad ui changes
  getInventoryPart() {
    // const inventoryPart = [
    let inventoryPart = [

      {
        showInSkad: true,
        type: 'text', id: 'appStoreCertification', title: 'App Store Certification',
        value: this.strDetails.targetOnlyPublishedApp ? 'Only Certified Apps' : 'All Apps',
      },
      {
        showInSkad: true,
        type: 'text', id: 'appRatings', title: 'App Ratings',
        value: (this.strDetails.targetAppRatings === null || this.strDetails.targetAppRatings === undefined) ?
          'NA' : this.strDetails.targetAppRatings === 0 ? 'Any' : 'More than ' + this.strDetails.targetAppRatings,
      },
      {
        showInSkad: true,
        type: 'target-or-block', id: 'inventorySources', title: 'Inventory Sources', value: {
          target: (this.strDetails.rtbAggregators && this.strDetails.rtbAggregators.aggregators) ?
            this.strDetails.rtbAggregators.aggregators.targetList : null,
          block: (this.strDetails.rtbAggregators && this.strDetails.rtbAggregators.aggregators) ?
            this.strDetails.rtbAggregators.aggregators.blockedList : null,
          isAll: (this.strDetails.rtbAggregators) ? this.strDetails.rtbAggregators.selectAllAggregators : true,
          allText: 'Any',
        }
      },

      // REVX-127 : adding an object here for auction type (for summary of edit and details page , based on the new feild in str-DTO)
      {
        showInSkad: true,
        type: 'text', id: '', title: 'Auction Type',
        value: (this.strDetails.auctionTypeTargeting === StrategyDTO.AuctionTypeTargetingEnum.FIRST) ?
          'First Price' : (this.strDetails.auctionTypeTargeting === StrategyDTO.AuctionTypeTargetingEnum.SECOND) ?
            'Second Price' : 'First Price , Second Price',
      },

      {
        showInSkad: false,
        type: 'target-or-block', id: 'androidAppCategories', title: 'Android App Categories', value: {
          target: (this.strDetails.targetAndroidCategories && this.strDetails.targetAndroidCategories.appCategories) ?
            this.strDetails.targetAndroidCategories.appCategories.targetList : null,
          block: (this.strDetails.targetAndroidCategories && this.strDetails.targetAndroidCategories.appCategories) ?
            this.strDetails.targetAndroidCategories.appCategories.blockedList : null,
          isAll: (this.strDetails.targetAndroidCategories) ? this.strDetails.targetAndroidCategories.selectAll : true,
          allText: 'Any',
        }
      },
      {
        showInSkad: true,
        type: 'target-or-block', id: 'iOSAppCategories', title: 'iOS App Categories', value: {
          target: (this.strDetails.targetIosCategories && this.strDetails.targetIosCategories.appCategories) ?
            this.strDetails.targetIosCategories.appCategories.targetList : null,
          block: (this.strDetails.targetIosCategories && this.strDetails.targetIosCategories.appCategories) ?
            this.strDetails.targetIosCategories.appCategories.blockedList : null,
          isAll: (this.strDetails.targetIosCategories) ? this.strDetails.targetIosCategories.selectAll : true,
          allText: 'Any',

        }
      },

      {
        showInSkad: true,
        type: 'target-or-block', id: 'apps', title: 'Apps', value: {
          target: (this.strDetails.rtbSites && this.strDetails.rtbSites.rtbSites) ?
            this.strDetails.rtbSites.rtbSites.targetList : null,
          block: (this.strDetails.rtbSites && this.strDetails.rtbSites.rtbSites) ?
            this.strDetails.rtbSites.rtbSites.blockedList : null,
          isAll: this.checkIsAllSites(this.strDetails.rtbSites),
          allText: 'Any',
        }
      }

    ];

    let details = (this.strDetails.campaign as any);

    //REVX-724 : skad ui changes
    if (details && details.skadTarget) {
      inventoryPart = inventoryPart.filter(x => x.showInSkad === true);
    }

    return inventoryPart;
  }

  checkIsAllSites(sites: RTBSites) {
    if (sites) {
      const blockList = sites.rtbSites.blockedList;
      if (sites.selectAllSites && blockList !== null && blockList !== undefined && blockList.length > 0) {
        return false;
      } else {
        return sites.selectAllSites;
      }
    }
  }

  isCustomSegmentTargeting() {
    if (this.strDetails) {
      if ((this.strDetails.targetAppSegments && this.strDetails.targetAppSegments.customSegmentTargeting) ||
        (this.strDetails.targetWebSegments && this.strDetails.targetWebSegments.customSegmentTargeting) ||
        (this.strDetails.targetDmpSegments && this.strDetails.targetDmpSegments.customSegmentTargeting)) {
        return true;
      }
    }

    return false;
  }

  //revx-371 refactored in bulk edit strategy
  getAudienceSegments(isTarget: boolean, app: AudienceStrDTO, web: AudienceStrDTO, dmp: AudienceStrDTO) {
    const audienceSegments = [];

    if (isTarget) {
      if (app && app.targetedSegments) {
        audienceSegments.push(...app.targetedSegments.map(item => {
          return { ...item, type: AudienceConstants.TYPE.APP };
        }));
      }

      if (web && web.targetedSegments) {
        audienceSegments.push(...web.targetedSegments.map(item => {
          return { ...item, type: AudienceConstants.TYPE.WEB };
        }));
      }

      if (dmp && dmp.targetedSegments) {
        audienceSegments.push(...dmp.targetedSegments.map(item => {
          return { ...item, type: AudienceConstants.TYPE.DMP };
        }));
      }
    } else {
      if (app && app.blockedSegments) {
        audienceSegments.push(...app.blockedSegments.map(item => {
          return { ...item, type: AudienceConstants.TYPE.APP };
        }));
      }

      if (web && web.blockedSegments) {
        audienceSegments.push(...web.blockedSegments.map(item => {
          return { ...item, type: AudienceConstants.TYPE.WEB };
        }));
      }

      if (dmp && dmp.blockedSegments) {
        audienceSegments.push(...dmp.blockedSegments.map(item => {
          return { ...item, type: AudienceConstants.TYPE.DMP };
        }));
      }
    }

    return audienceSegments;
  }

  //revx-371 refactored in bulk edit strategy
  getDealCategories(dealDto: DealCategoryDTO) {
    return (dealDto && dealDto.dealCategory
      && dealDto.dealCategory.targetList) ?
      dealDto.dealCategory.targetList : [];
  }

  getTargetingPart() {
    const isCustomGeoTargeting = (this.strDetails.targetGeographies === null || this.strDetails.targetGeographies === undefined)
      ? false : this.strDetails.targetGeographies.customGeoTargeting;

    const isCustomSegment = this.isCustomSegmentTargeting();

    const isDesktopPlacementOnly = (this.strDetails.placements === null || this.strDetails.placements === undefined) ? true :
      this.strDetails.placements.map(item => item.name).join(', ').toLowerCase() === 'desktop' ? true : false;

    const isAllCountry = (this.strDetails.targetGeographies &&
      this.strDetails.targetGeographies.country && (this.strDetails.targetGeographies.country.targetList.length > 0 ||
        this.strDetails.targetGeographies.country.blockedList.length > 0)) ? false : true;

    const isAllState = (this.strDetails.targetGeographies &&
      this.strDetails.targetGeographies.state && (this.strDetails.targetGeographies.state.targetList.length > 0 ||
        this.strDetails.targetGeographies.state.blockedList.length > 0)) ? false : true;

    const isAllCity = (this.strDetails.targetGeographies &&
      this.strDetails.targetGeographies.city && (this.strDetails.targetGeographies.city.targetList.length > 0 ||
        this.strDetails.targetGeographies.city.blockedList.length > 0)) ? false : true;

    const isAllDealCategory = (this.strDetails.targetDealCategory && !this.strDetails.targetDealCategory.selectAll
      && this.strDetails.targetDealCategory.dealCategory && this.strDetails.targetDealCategory.dealCategory.targetList
      && this.strDetails.targetDealCategory.dealCategory.targetList.length > 0) ? false : true;

    //REVX-724 : audience can not be added for SKAD Strategies
    let targetingPart: any[] = [
      {
        showInSkad: true,
        type: 'target-and-block', id: 'country', title: 'Country', value: {
          target: isCustomGeoTargeting ? (this.strDetails.targetGeographies.country) ?
            this.strDetails.targetGeographies.country.targetList : [] : [],
          block: isCustomGeoTargeting ? (this.strDetails.targetGeographies.country) ?
            this.strDetails.targetGeographies.country.blockedList : [] : [],
          // isAll: !isCustomGeoTargeting || !this.strDetails.targetGeographies.country,
          isAll: isAllCountry,
          allText: 'Any',
          targetHeader: 'Any of the below countries',
          blockHeader: 'Any of the below countries'
        }
      },
      {
        showInSkad: true,
        type: 'target-and-block', id: 'state', title: 'State', value: {
          target: isCustomGeoTargeting ? (this.strDetails.targetGeographies.state) ?
            this.strDetails.targetGeographies.state.targetList : [] : [],
          block: isCustomGeoTargeting ? (this.strDetails.targetGeographies.state) ?
            this.strDetails.targetGeographies.state.blockedList : [] : [],
          isAll: isAllState,
          allText: 'Any',
          targetHeader: 'Any of the below states',
          blockHeader: 'Any of the below states'
        }
      },
      {
        showInSkad: true,
        type: 'target-and-block', id: 'city', title: 'City', value: {
          target: isCustomGeoTargeting ? (this.strDetails.targetGeographies.city) ?
            this.strDetails.targetGeographies.city.targetList : [] : [],
          block: isCustomGeoTargeting ? (this.strDetails.targetGeographies.city) ?
            this.strDetails.targetGeographies.city.blockedList : [] : [],
          isAll: isAllCity,
          allText: 'Any',
          targetHeader: 'Any of the below cities',
          blockHeader: 'Any of the below cities'
        }
      },
      {
        showInSkad: false,
        type: 'target-and-block', id: 'audience', title: 'Audience', value: {
          target: isCustomSegment ? this.getAudienceSegments(true, this.strDetails.targetAppSegments, this.strDetails.targetWebSegments, this.strDetails.targetDmpSegments) : [],
          block: isCustomSegment ? this.getAudienceSegments(false, this.strDetails.targetAppSegments, this.strDetails.targetWebSegments, this.strDetails.targetDmpSegments) : [],
          isAll: !isCustomSegment,
          allText: 'Any',
          targetHeader: (this.strDetails.targetAppSegments) ?
            (this.strDetails.targetAppSegments.targetedSegmentsOperator === 'AND') ?
              'All of the below audience(s)' : 'Any of the below audience(s)' : '',
          blockHeader: 'Any of the below audience(s)'
        }
      },
      {
        showInSkad: true,
        type: 'target-and-block', id: 'dealCategory', title: 'Advance Targeting', value: {
          target: !isAllDealCategory ? this.getDealCategories(this.strDetails.targetDealCategory) : [],
          block: [],
          isAll: isAllDealCategory,
          allText: 'Any',
          targetHeader: 'Any of the below deal categories',
          blockHeader: ''
        }
      },
      {
        showInSkad: true,
        type: 'daypart', id: 'daypart', title: 'Daypart', value: this.getDayParts(this.strDetails.targetDays)
      },
      { showInSkad: true, type: 'text', id: 'creativePlacement', title: 'Creative Placement', value: this.getCreativePlacement() }
    ];

    if (!isDesktopPlacementOnly) {
      targetingPart.push({
        showInSkad: true,
        type: 'text',
        id: 'connectionType',
        title: 'Connection Type',
        value: this.getConnectionTypes()
      });

      targetingPart.push({ showInSkad: true, type: 'text', id: 'mobileOS', title: 'Mobile Operating System', value: this.getMobileOS(this.strDetails.targetMobileDevices) });
      targetingPart.push({ showInSkad: true, type: 'text', id: 'deviceType', title: 'Device Type', value: this.getDeviceType() });
      // targetingPart.push({ type: 'text', id: 'brandsNModels', title: 'Mobile Brands & Models', value: '' });
    }

    //REVX-724 : skad ui changes : audience targetting not allowed for SKAD strategy
    let details = (this.strDetails.campaign as any);
    if (details && details.skadTarget) {
      targetingPart = targetingPart.filter(x => x.showInSkad === true);
    }

    return targetingPart;
  }

  getDeviceType() {
    if (this.strDetails.targetMobileDevices !== null && this.strDetails.targetMobileDevices !== undefined &&
      this.strDetails.targetMobileDevices.targetDeviceTypes !== null &&
      this.strDetails.targetMobileDevices.targetDeviceTypes !== undefined &&
      this.strDetails.targetMobileDevices.targetDeviceTypes.mobileDeviceTypes !== null &&
      this.strDetails.targetMobileDevices.targetDeviceTypes.mobileDeviceTypes !== undefined) {
      return this.strDetails.targetMobileDevices.targetDeviceTypes.mobileDeviceTypes.targetList.map(item => item.name).join(',');
    } else {
      return 'Any';
    }
  }

  //revx-371 refactored in bulk edit strategy
  getMobileOS(input: TargetMobileDevices) {
    if (input !== null && input !== undefined &&
      input.targetOperatingSystems !== null &&
      input.targetOperatingSystems !== undefined &&
      input.targetOperatingSystems.operatingSystems !== null &&
      input.targetOperatingSystems.operatingSystems !== undefined) {
      return input.targetOperatingSystems.operatingSystems.includeList.map(item => {
        const os = item.name;
        let version = 'Any';
        if (item.properties && item.properties.OSVERSION
          && item.properties.OSVERSION.name.trim() !== '-1.0') { // if name ='-1.0' it means 'Any'
          version = item.properties.OSVERSION.name;
        }
        return os + ' (' + version + ')';
      }).join(', ');
    } else {
      return 'Any';
    }
  }

  getConnectionTypes() {
    if (this.strDetails.connectionTypes !== null && this.strDetails.connectionTypes !== undefined) {
      return this.strDetails.connectionTypes.map(item => {
        return this.getConnectionTypeAlias(item);
      }).filter(item => item !== null).join(', ');
    } else {
      return 'Any';
    }
  }

  getConnectionTypeAlias(connType: any) {
    switch (connType) {
      case StrategyDTO.ConnectionTypesEnum.WIFI: return 'Wifi';
      case StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK2G: return '2G';
      case StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK3G: return '3G';
      case StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK4G: return '4G';
      case StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK5G: return '5G';
      default: return null;
    }
  }

  getCreativePlacement() {
    if (this.strDetails.placements != null && this.strDetails.placements !== undefined) {
      return this.strDetails.placements.map(item => item.name).join(', ');
    } else {
      return '';
    }
  }

  //revx-371 refactored in bulk edit strategy
  getDayParts(input: DayPart) {
    const daypart = (input) ? input.daypart : null;
    if (daypart !== null) {
      // check for all days and all hours
      if (daypart.length === 7) {
        const isAllHours = daypart.filter(part => part.hours.length === 24).length === 7 ? true : false;
        if (isAllHours) {
          return { isAll: true, parts: [] };
        }
      }

      const formattedParts = [];
      daypart.forEach(part => {
        formattedParts.push({
          name: DAYS[part.day],
          hours: this.getFormattedHours(part.hours)
        });
      });

      return { isAll: false, parts: formattedParts };
    } else {
      return { isAll: true, parts: [] };
    }

  }

  getFormattedHours(hours: number[]) {
    const result = [];
    if (hours.length === 24) {
      return { isAllDay: true };
    }

    const formattedHours = {
      morning: null,
      officeHours: null,
      evening: null,
      night: null
    };

    const morningPart = this.getHours('morning');
    formattedHours.morning = this.getDayPartStr(morningPart, hours);

    const officePart = this.getHours('officeHrs');
    formattedHours.officeHours = this.getDayPartStr(officePart, hours);

    const eveningPart = this.getHours('evening');
    formattedHours.evening = this.getDayPartStr(eveningPart, hours);

    const nightPart = this.getHours('night');
    formattedHours.night = this.getDayPartStr(nightPart, hours);

    return { isAllDay: false, ...formattedHours };

  }

  getDayPartStr(part: number[], allHours: number[]) {
    const subHours = [];
    const filter = part.filter(hr => allHours.indexOf(hr) === -1);
    if (filter.length === 0) {
      return { hours: [[part[0], part[part.length - 1]]] };
    } else {
      const selHours = allHours.filter(hr => part.indexOf(hr) !== -1);
      let iIndex = 0;
      let jIndex = 0;
      while (iIndex < selHours.length) {
        jIndex = iIndex + 1;
        if (jIndex >= selHours.length) {
          subHours.push([selHours[iIndex], selHours[jIndex - 1]]);
          break;
        }
        while (jIndex < selHours.length) {
          const diff = this.getDifference(selHours[iIndex], selHours[jIndex]);
          if (diff === (jIndex - iIndex)) {
            jIndex += 1;
            if (jIndex >= selHours.length) {
              subHours.push([selHours[iIndex], selHours[jIndex - 1]]);
              iIndex = jIndex;
              break;
            }
          } else {
            subHours.push([selHours[iIndex], selHours[jIndex - 1]]);
            iIndex = jIndex;
            break;
          }
        }
      }

      return { hours: subHours };
    }
  }

  getDifference(val1: number, val2: number) {
    if ((val1 === 23 && val2 === 0) || (val1 === 0 && val2 === 23)) {
      return 1;
    } else if ((val1 === 23 && val2 === 23) || (val1 === 0 && val2 === 0)) {
      return 0;
    } else {
      return Math.abs(val1 - val2);
    }
  }

  getHours(part: string) {
    let hours = [];
    switch (part) {
      case 'morning':
        hours = [6, 7, 8, 9];
        break;
      case 'officeHrs':
        hours = [10, 11, 12, 13, 14, 15, 16, 17];
        break;
      case 'evening':
        hours = [18, 19, 20, 21];
        break;
      case 'night':
        hours = [22, 23, 0, 1, 2, 3, 4, 5];
        break;
    }
    return hours;
  }

  getBudgetPart(forDetailsPage: boolean) {
    const budgetPart = [];
    if (forDetailsPage) {
      budgetPart.push(...[
        { type: 'text', id: 'pricingType', title: 'Pricing Type / Goal', value: this.getBidTypeAndGoal() },
        { type: 'text', id: 'mediaBudget', title: 'Lifetime Media Budget', value: this.getLifeTimeMediaBudget() },
        { type: 'text', id: 'pacing', title: 'Pacing', value: this.getBudgetPacing(forDetailsPage) },
        { type: 'text', id: 'bidValue', title: 'Bid Value', value: this.getBidValue() },
        { type: 'text', id: 'bidMin', title: 'Min Bid', value: this.getBidRangeMin() },
        { type: 'text', id: 'bidMax', title: 'Max Bid', value: this.getBidRangeMax() },
      ]);
    } else {
      budgetPart.push(...[
        { type: 'text', id: 'lifetimeMediaBudget', title: 'Lifetime Media Budget', value: this.getLifeTimeMediaBudget() },
        { type: 'text', id: 'dailyMediaBudget', title: 'Daily Media Budget', value: this.getDailyMediaBudget() },
        { type: 'text', id: 'pacing', title: 'Budget Pacing', value: this.getBudgetPacing(forDetailsPage) },
        { type: 'text', id: 'bidType', title: 'Bid Type', value: this.getBidType() },
        { type: 'text', id: 'bidPrice', title: 'Bid Price', value: this.getBidPrice() },
        { type: 'text', id: 'bidRange', title: 'Bid Range', value: this.getBidRange() }
      ]);
    }

    return budgetPart;
  }

  getBidValue() {
    return (this.strDetails && this.strDetails.bidPercentage) ?
      this.strDetails.bidPercentage + '% of predicted value' : 'NA';
  }

  getCreativePart() {
    const creativePart = [
      { type: 'creative', id: 'creatives', title: 'Creatives', value: this.modCreativeDetails(this.strDetails.creatives) }
    ];

    return creativePart;
  }

  modCreativeDetails(creatives: CreativeDTO[]) {
    if (creatives !== null && creatives !== undefined
      && Array.isArray(creatives) && creatives.length > 0) {
      creatives.forEach((item: any) => {
        item.type = (item.type === null || item.type === undefined) ? item.creativeType : item.type;
        item.urlPath = (item.urlPath === null || item.urlPath === undefined) ? item.imageUrl : item.urlPath;
        item.size = (item.size === null || item.size === undefined) ? {
          width: item.width,
          height: item.height,
        } : item.size;
      });
    }

    return creatives;
  }

  public getAudienceType(advDmpAccessStatus?: boolean) {
    const metrics = [
      {
        value: AudienceConstants.TYPE.APP,
        label: AudienceConstants.LABEL.APP
      },
      {
        value: AudienceConstants.TYPE.WEB,
        label: AudienceConstants.LABEL.WEB
      },
      {
        value: AudienceConstants.TYPE.DMP,
        label: AudienceConstants.LABEL.DMP
      }
    ];

    if (typeof advDmpAccessStatus === 'boolean' && !advDmpAccessStatus) {
      metrics.splice(2, 1);
    }

    return metrics;
  }

  initAudienceSelectionObject(): AudienceTBObject {
    return {
      app: {
        blockedList: [],
        targetList: []
      } as TargetingObject,
      web: {
        blockedList: [],
        targetList: []
      } as TargetingObject,
      dmp: {
        blockedList: [],
        targetList: []
      } as TargetingObject,
    };
  }

  public resetMaxStepperVisited() {
    this.maxStepperVisited = 0;
  }

  public setMaxStepperVisited(stepNum: number) {
    this.maxStepperVisited = Math.max(this.maxStepperVisited, stepNum);
    this.maxStepperVisitedSubject.next(this.maxStepperVisited);
  }







}

