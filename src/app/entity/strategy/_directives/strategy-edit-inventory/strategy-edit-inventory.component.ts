import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { RTBAggregators, RTBSites, StrategyDTO, TargetAppCategories, TargetingObject } from '@revxui/api-client-ts';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { StrategyObjectsService } from '../../_services/strategy-objects.service';
import { GridData, MODE, StrategyService, SkadSettings } from '../../_services/strategy.service';
import { AppTargetModalComponent } from '../_modals/app-target-modal/app-target-modal.component';
import { TargetBlockModalComponent } from '../_modals/target-block-modal/target-block-modal.component';
import { StrategyBulkEditService } from '../../_services/strategy-bulk-edit.service';


const INVENTORY_SOURCE = 'inventory-source';
const ANDROID_APP_CATEGORY = 'android-app-category';
const IOS_APP_CATEGORY = 'ios-app-category';
const APP = 'app';
// const AUCTION = 'auction'; //REVX-127


@Component({
  selector: 'app-strategy-edit-inventory',
  templateUrl: './strategy-edit-inventory.component.html',
  styleUrls: ['./strategy-edit-inventory.component.scss']
})
export class StrategyEditInventoryComponent implements OnInit, AfterViewInit, OnDestroy {
  strDetailsSub: Subscription;

  @Input() mode: number;
  @Input() isBulkEdit: boolean;



  inventory = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }

  auction = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }

  apps = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }




  strategyDTO: StrategyDTO;
  SCONST = StrategyConstants;
  MODE = MODE;
  title = StrategyConstants.STEP_TITLE_INVENTORY;

  //REVX-724 : skad-ui changes
  skadSettings: SkadSettings;

  // REVX-127
  auctionTypes = cloneDeep(this.strObjService.auctionTypes);
  appRatingList = cloneDeep(this.strObjService.appRatingList);
  trgtOptInventorySources = cloneDeep(this.strObjService.trgtOptInventorySources);
  trgtOptAndroidAppCategory = cloneDeep(this.strObjService.trgtOptAndroidAppCategory);
  trgtOptIosAppCategory = cloneDeep(this.strObjService.trgtOptIosAppCategory);
  baseTargetOptionsForApp = cloneDeep(this.strObjService.baseTargetOptionsForApp);

  selectionList: Map<string, GridData[]> = new Map<string, GridData[]>();

  targetOnlyPublishedApps = false;
  selAppRating = 'Any';

  error = cloneDeep(this.strObjService.errorInventory);
  skadSettingsSub: Subscription;

  constructor(
    private strService: StrategyService,
    private strObjService: StrategyObjectsService,
    private modal: MatDialog,
    private bulkEditService: StrategyBulkEditService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {

    // if (!this.isBulkEdit) {
    //   this.subscribeToEvents();
    // } else {
    //   this.setBulkEditParams();
    // }


    if (this.isBulkEdit) {
      this.setBulkEditParams();
    }

    this.subscribeToEvents();

  }

  ngOnDestroy() {
    if (this.strDetailsSub)
      this.strDetailsSub.unsubscribe();
  }

  goToPrevStep() {
    const confirmation = confirm(AppConstants.WARNING_MSG);
    if (confirmation) {
      if (this.mode === MODE.CREATE) {
        this.resetLocalValues();
      }
      this.goToStep(0, false);
    }
  }

  resetLocalValues() {
    this.auctionTypes = cloneDeep(this.strObjService.auctionTypes);
    this.appRatingList = cloneDeep(this.strObjService.appRatingList);
    this.trgtOptInventorySources = cloneDeep(this.strObjService.trgtOptInventorySources);
    this.trgtOptAndroidAppCategory = cloneDeep(this.strObjService.trgtOptAndroidAppCategory);
    this.trgtOptIosAppCategory = cloneDeep(this.strObjService.trgtOptIosAppCategory);
    this.baseTargetOptionsForApp = cloneDeep(this.strObjService.baseTargetOptionsForApp);

  }

  goToNextStep() {
    this.goToStep(2, true);
  }

  onReviewAndSave() {
    this.goToStep(5, true);
  }

  targetOptionChanged(event) {
    if (event.identifier === INVENTORY_SOURCE) {
      this.trgtOptInventorySources.forEach(opt => {
        opt.checked = (opt.value === event.targetOption) ? true : false;
      });
    } else if (event.identifier === ANDROID_APP_CATEGORY) {
      this.trgtOptAndroidAppCategory.forEach(opt => {
        opt.checked = (opt.value === event.targetOption) ? true : false;
      });
    } else if (event.identifier === IOS_APP_CATEGORY) {
      this.trgtOptIosAppCategory.forEach(opt => {
        opt.checked = (opt.value === event.targetOption) ? true : false;
      });
    } else if (event.identifier === APP) {
      this.baseTargetOptionsForApp.forEach(opt => {
        opt.checked = (opt.value === event.targetOption) ? true : false;
      });
    }

    if (event.targetOption === 0) {
      this.selectionList[event.identifier] = [];
    }
  }

  actionInventorySources(event) {
    const modalRef = this.modal.open(TargetBlockModalComponent, {

      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: event.selection,
        entity: 'AGGREGATOR',
        title: 'Select Inventory Sources',
        blockAllErrorMsg: 'All inventory sources cannot be blocked',
        targetList: event.selection === 1 ? [...this.selectionList[INVENTORY_SOURCE]] : [],
        blockList: event.selection === -1 ? [...this.selectionList[INVENTORY_SOURCE]] : []
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          if (result.selectAll) {
            this.trgtOptInventorySources = this.selectTargetAllOption(this.trgtOptInventorySources);
          } else {
            this.selectionList[INVENTORY_SOURCE] = event.selection === 1 ? result.targetList : result.blockList;
          }
        }
        //REVX-588 this is done to have consistency when we navigate by header clicks
        this.validate()
      }
    );
  }

  actionAndroidAppCategory(event) {
    const modalRef = this.modal.open(TargetBlockModalComponent, {

      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: event.selection,
        entity: 'APP_CATEGORY',
        title: 'Search for android app categories',
        blockAllErrorMsg: 'All android app categories cannot be blocked',
        targetList: event.selection === 1 ? [...this.selectionList[ANDROID_APP_CATEGORY]] : [],
        blockList: event.selection === -1 ? [...this.selectionList[ANDROID_APP_CATEGORY]] : [],
        custom: {
          osId: 4
        }
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          if (result.selectAll) {
            this.trgtOptAndroidAppCategory = this.selectTargetAllOption(this.trgtOptAndroidAppCategory);
          } else {
            this.selectionList[ANDROID_APP_CATEGORY] = event.selection === 1 ? result.targetList : result.blockList;
          }
          //REVX-588 this is done to have consistency when we navigate by header clicks
          this.validate()
        }
      }
    );
  }

  actionIOSAppCategory(event) {
    const modalRef = this.modal.open(TargetBlockModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: event.selection,
        entity: 'APP_CATEGORY',
        title: 'Search for iOS app categories',
        blockAllErrorMsg: 'All iOS app categories cannot be blocked',
        targetList: event.selection === 1 ? [...this.selectionList[IOS_APP_CATEGORY]] : [],
        blockList: event.selection === -1 ? [...this.selectionList[IOS_APP_CATEGORY]] : [],
        custom: {
          osId: 3
        }
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          if (result.selectAll) {
            this.trgtOptIosAppCategory = this.selectTargetAllOption(this.trgtOptIosAppCategory);
          } else {
            this.selectionList[IOS_APP_CATEGORY] = event.selection === 1 ? result.targetList : result.blockList;
          }
          //REVX-588 this is done to have consistency when we navigate by header clicks
          this.validate()
        }
      }
    );
  }

  actionApps(event) {
    const modalRef = this.modal.open(AppTargetModalComponent, {
      width: '70%',
      // maxHeight: '90vh',
      height: '450px',
      disableClose: true,
      data: {
        type: event.selection,
        title: 'Enter Apps below',
        titleHint: this.SCONST.INVENTORY_APPS_TITLE_HINT,
        targetOptions: this.baseTargetOptionsForApp,
        isValidateRequired: true,
        hintValidation: this.SCONST.INVENTORY_APPS_VALIDATION_HINT,
        selectionList: [...this.selectionList[APP]]
      },
    });
    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.selectionList[APP] = result.selectionList;
          this.baseTargetOptionsForApp.forEach(opt => opt.checked = (opt.value === result.selection) ? true : false);
        }
      }
    );
  }

  onSelectionRemoved(event) {
    const id = event.item.id;
    this.selectionList[event.identifier] = this.selectionList[event.identifier].filter(item => item.id !== id);
  }

  selectTargetAllOption(options: any[]) {
    return options.map(opt => {
      const newOpt = { ...opt };
      newOpt.checked = (opt.id === 'all') ? true : false;
      return newOpt;
    });
  }

  private isFormValid() {

    //validating inventory sources
    this.validateInventorySources();

    //validating android app category sources
    const andIndex = this.trgtOptAndroidAppCategory.findIndex(item => item.checked);
    const andValue = this.trgtOptAndroidAppCategory[andIndex].value;
    if (andValue === 0) {
      this.error.android = { hasError: false, msg: '' };
    } else {
      if (this.selectionList[ANDROID_APP_CATEGORY] === null || this.selectionList[ANDROID_APP_CATEGORY] === undefined
        || !Array.isArray(this.selectionList[ANDROID_APP_CATEGORY]) || this.selectionList[ANDROID_APP_CATEGORY].length <= 0) {
        this.error.android = { hasError: true, msg: 'Atleast one android app category has to be selected.' };
      } else {
        this.error.android = { hasError: false, msg: '' };
      }
    }


    //validating ios app category sources
    const iosIndex = this.trgtOptIosAppCategory.findIndex(item => item.checked);
    const iosValue = this.trgtOptIosAppCategory[iosIndex].value;
    if (iosValue === 0) {
      this.error.ios = { hasError: false, msg: '' };
    } else {
      if (this.selectionList[IOS_APP_CATEGORY] === null || this.selectionList[IOS_APP_CATEGORY] === undefined
        || !Array.isArray(this.selectionList[IOS_APP_CATEGORY]) || this.selectionList[IOS_APP_CATEGORY].length <= 0) {
        this.error.ios = { hasError: true, msg: 'Atleast one iOS app category has to be selected.' };
      } else {
        this.error.ios = { hasError: false, msg: '' };
      }
    }


    this.validateAuction();
    return this.errorExists();

  }


  private updateStrategyObject() {

    this.strategyDTO = this.strService.getStrDetails();

    this.strategyDTO.targetOnlyPublishedApp = this.targetOnlyPublishedApps;
    this.strategyDTO.targetAppRatings = this.selAppRating === 'Any' ? 0 : +this.selAppRating.slice(0, 1);

    const invIndex = this.trgtOptInventorySources.findIndex(item => item.checked);
    const invValue = this.trgtOptInventorySources[invIndex].value;
    // this.strategyDTO.rtbAggregators = (invValue === 0) ? null : {
    //   selectAllAggregators: invValue === 0 ? true : false,
    //   aggregators: invValue === 0 ? null : invValue === 1 ?
    //     { targetList: this.selectionList[INVENTORY_SOURCE], blockedList: null } as TargetingObject
    //     : { targetList: null, blockedList: this.selectionList[INVENTORY_SOURCE] } as TargetingObject
    // } as RTBAggregators;
    this.strategyDTO.rtbAggregators = {
      selectAllAggregators: invValue === 0 ? true : false,
      aggregators: invValue === 1 ?
        { targetList: this.selectionList[INVENTORY_SOURCE], blockedList: [] } as TargetingObject
        : { targetList: [], blockedList: this.selectionList[INVENTORY_SOURCE] } as TargetingObject
    } as RTBAggregators;

    const andIndex = this.trgtOptAndroidAppCategory.findIndex(item => item.checked);
    const andValue = this.trgtOptAndroidAppCategory[andIndex].value;
    // this.strategyDTO.targetAndroidCategories = (andValue === 0) ? null : {
    //   selectAll: andValue === 0 ? true : false,
    //   appCategories: andValue === 0 ? null : andValue === 1 ?
    //     { targetList: this.selectionList[ANDROID_APP_CATEGORY], blockedList: null } as TargetingObject
    //     : { targetList: null, blockedList: this.selectionList[ANDROID_APP_CATEGORY] } as TargetingObject
    // } as TargetAppCategories;
    this.strategyDTO.targetAndroidCategories = {
      selectAll: andValue === 0 ? true : false,
      appCategories: andValue === 1 ?
        { targetList: this.selectionList[ANDROID_APP_CATEGORY], blockedList: [] } as TargetingObject
        : { targetList: [], blockedList: this.selectionList[ANDROID_APP_CATEGORY] } as TargetingObject
    } as TargetAppCategories;

    const iosIndex = this.trgtOptIosAppCategory.findIndex(item => item.checked);
    const iosValue = this.trgtOptIosAppCategory[iosIndex].value;
    // this.strategyDTO.targetIosCategories = (iosValue === 0) ? null : {
    //   selectAll: iosValue === 0 ? true : false,
    //   appCategories: iosValue === 0 ? null : iosValue === 1 ?
    //     { targetList: this.selectionList[IOS_APP_CATEGORY], blockedList: null } as TargetingObject
    //     : { targetList: null, blockedList: this.selectionList[IOS_APP_CATEGORY] } as TargetingObject
    // } as TargetAppCategories;
    this.strategyDTO.targetIosCategories = {
      selectAll: iosValue === 0 ? true : false,
      appCategories: iosValue === 1 ?
        { targetList: this.selectionList[IOS_APP_CATEGORY], blockedList: [] } as TargetingObject
        : { targetList: [], blockedList: this.selectionList[IOS_APP_CATEGORY] } as TargetingObject
    } as TargetAppCategories;

    const appIndex = this.baseTargetOptionsForApp.findIndex(item => item.checked);
    const appValue = this.baseTargetOptionsForApp[appIndex].value;
    const selectAll = (this.selectionList[APP].length === 0) ? true : (appValue === -1) ? true : false;
    // this.strategyDTO.rtbSites = (this.selectionList[APP].length === 0) ? null : {
    this.strategyDTO.rtbSites = {
      selectAllSites: selectAll,
      rtbSites: {
        blockedList: (appValue === -1) ? (this.selectionList[APP].length !== 0) ? this.selectionList[APP] : [] : [],
        targetList: (appValue === 1) ? (this.selectionList[APP].length !== 0) ? this.selectionList[APP] : [] : []
      } as TargetingObject
    } as RTBSites;


    // REVX-127 : assignment in StrDto
    const auctionSelected = this.auctionTypes.filter(item => item.checked);
    this.strategyDTO.auctionTypeTargeting = (auctionSelected.length === 2) ? 'ALL' : auctionSelected[0].value

    this.strService.setStrDetails(this.strategyDTO);

    // console.log(this.strategyDTO);

  }

  private subscribeToEvents() {
    this.strDetailsSub = this.strService.onStrategyDetailsSet.subscribe(
      param => {
        this.handleStrategyDetailsSet(param.strDetails);
        this.resetErrorObject();
      }
    );


    //REVX-724 : skad-ui changes
    this.skadSettingsSub = this.strService.skadSettings.subscribe(param => {
      // console.log("inventory==>")
      // console.log(param);
      this.skadSettings = cloneDeep(param);
    });

  }

  resetErrorObject() {
    this.error = cloneDeep(this.strObjService.errorInventory);
  }

  private handleStrategyDetailsSet(strDetails: StrategyDTO) {
    if (strDetails !== null) {
      this.strategyDTO = strDetails;
      this.initSelectionList();
      // if (this.mode === MODE.EDIT) {
      this.setInventoryDetails(strDetails);
      // }
    }
  }

  private initSelectionList() {
    this.selectionList[INVENTORY_SOURCE] = [];
    this.selectionList[ANDROID_APP_CATEGORY] = [];
    this.selectionList[IOS_APP_CATEGORY] = [];
    this.selectionList[APP] = [];
  }

  private setInventoryDetails(strDetails: StrategyDTO) {
    this.setBrandSafety((strDetails.targetOnlyPublishedApp !== null && strDetails.targetOnlyPublishedApp) ?
      true : false, strDetails.targetAppRatings);
    this.setInventorySources(strDetails.rtbAggregators);
    this.setAndroidAppCategory(strDetails.targetAndroidCategories);
    this.setIosAppCategory(strDetails.targetIosCategories);
    this.setApps(strDetails.rtbSites);

    // REVX_127
    // set Auction details from DTO to local object
    this.setAuctionType(strDetails.auctionTypeTargeting);
  }

  private setBrandSafety(onlyPublishedApps: boolean, rating: number) {
    this.targetOnlyPublishedApps = onlyPublishedApps;

    setTimeout(() => {
      this.selAppRating = (rating === null || rating === undefined) ? 'Any' : rating + '+';
    }, 300);
  }

  private setInventorySources(data: RTBAggregators) {
    const options = this.trgtOptInventorySources.map(item => {
      return { ...item };
    });
    if (data !== null && data !== undefined && !data.selectAllAggregators) {
      if (data.aggregators.targetList !== null && data.aggregators.targetList !== undefined
        && Array.isArray(data.aggregators.targetList) && data.aggregators.targetList.length > 0) {
        options.forEach(opt => opt.checked = (opt.id === 'target-specific') ? true : false);
        this.selectionList[INVENTORY_SOURCE] = data.aggregators.targetList;
      }

      if (data.aggregators.blockedList !== null && data.aggregators.blockedList !== undefined
        && Array.isArray(data.aggregators.blockedList) && data.aggregators.blockedList.length > 0) {
        options.forEach(opt => opt.checked = (opt.id === 'block-specific') ? true : false);
        this.selectionList[INVENTORY_SOURCE] = data.aggregators.blockedList;
      }
      this.trgtOptInventorySources = options.map(item => {
        return { ...item };
      });
    } else {
      options.forEach(opt => opt.checked = (opt.id === 'all') ? true : false);
    }
  }

  private setAndroidAppCategory(data: TargetAppCategories) {
    const options = this.trgtOptAndroidAppCategory.map(item => {
      return { ...item };
    });
    if (data !== null && data !== undefined && !data.selectAll) {
      if (data.appCategories.targetList !== null && data.appCategories.targetList !== undefined
        && Array.isArray(data.appCategories.targetList) && data.appCategories.targetList.length > 0) {
        options.forEach(opt => opt.checked = (opt.id === 'target-specific') ? true : false);
        this.selectionList[ANDROID_APP_CATEGORY] = data.appCategories.targetList;
      }

      if (data.appCategories.blockedList !== null && data.appCategories.blockedList !== undefined
        && Array.isArray(data.appCategories.blockedList) && data.appCategories.blockedList.length > 0) {
        options.forEach(opt => opt.checked = (opt.id === 'block-specific') ? true : false);
        this.selectionList[ANDROID_APP_CATEGORY] = data.appCategories.blockedList;
      }
    } else {
      options.forEach(opt => opt.checked = (opt.id === 'all') ? true : false);
    }
    this.trgtOptAndroidAppCategory = options.map(item => {
      return { ...item };
    });
  }

  private setIosAppCategory(data: TargetAppCategories) {
    const options = this.trgtOptIosAppCategory.map(item => {
      return { ...item };
    });
    if (data !== null && data !== undefined && !data.selectAll) {
      if (data.appCategories.targetList !== null && data.appCategories.targetList !== undefined
        && Array.isArray(data.appCategories.targetList) && data.appCategories.targetList.length > 0) {
        options.forEach(opt => opt.checked = (opt.id === 'target-specific') ? true : false);
        this.selectionList[IOS_APP_CATEGORY] = data.appCategories.targetList;
      }

      if (data.appCategories.blockedList !== null && data.appCategories.blockedList !== undefined
        && Array.isArray(data.appCategories.blockedList) && data.appCategories.blockedList.length > 0) {
        options.forEach(opt => opt.checked = (opt.id === 'block-specific') ? true : false);
        this.selectionList[IOS_APP_CATEGORY] = data.appCategories.blockedList;
      }
    } else {
      options.forEach(opt => opt.checked = (opt.id === 'all') ? true : false);

    }
    this.trgtOptIosAppCategory = options.map(item => {
      return { ...item };
    });
  }

  private setApps(sites: RTBSites) {
    const options = this.baseTargetOptionsForApp.map(item => {
      return { ...item };
    });
    if (sites !== null && sites !== undefined) {
      if (sites.rtbSites.targetList !== null && sites.rtbSites.targetList !== undefined && sites.rtbSites.targetList.length > 0) {
        this.selectionList[APP] = sites.rtbSites.targetList;
        options.forEach(opt => opt.checked = (opt.id === 'target') ? true : false);
      } else if (sites.rtbSites.blockedList !== null && sites.rtbSites.blockedList !== undefined && sites.rtbSites.blockedList.length > 0) {
        this.selectionList[APP] = sites.rtbSites.blockedList;
        options.forEach(opt => opt.checked = (opt.id === 'do-not-target') ? true : false);
      } else {
        this.selectionList[APP] = [];
      }
    } else {
      // do nothing

    }
    this.baseTargetOptionsForApp = options.map(item => {
      return { ...item };
    });
  }

  private goToStep(stepNo: number, performValidation: boolean) {
    if (!performValidation) {
      this.strService.setStepperIndex(stepNo);
    }

    const isValid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (performValidation && isValid) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
      this.strService.setMaxStepperVisited(2);
      this.strService.setStepperIndex(stepNo);
    }
  }


  /**
   * REVX-127 : will update the Selection here
   * @param event is recived from child selector
   */
  onAuctionSelectionChange(event: any) {
    const auctionSelected = this.auctionTypes.filter(item => item.checked);
    this.error.connectionType = (auctionSelected.length === 0) ? { hasError: true, msg: 'Atleast one Auction Type has to be chosen.' } :
      { hasError: false, msg: '' };
  }

  /**
   * REVX-127
   * @param auctionTypeTargeting initialize the local object from DTO
   */
  private setAuctionType(auctionTypeTargeting: string) {
    if (!auctionTypeTargeting) return;

    switch (auctionTypeTargeting) {
      case StrategyDTO.AuctionTypeTargetingEnum.ALL:
        this.auctionTypes.forEach(item => {
          item.checked = true;
        });
        break;

      case StrategyDTO.AuctionTypeTargetingEnum.FIRST:
      case StrategyDTO.AuctionTypeTargetingEnum.SECOND:
        this.auctionTypes.forEach(item => {
          item.checked = (item.value === auctionTypeTargeting) ? true : false;
        });
        break;

      default:
        break;
    }
  }
  validate() {
    const isValid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (isValid) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
    }
  }

  //REVX-724 : skad-ui changes
  hideAndroidAppCategories(): boolean {
    if (this.skadSettings && this.skadSettings.SKAD_CAMPAIGN && this.skadSettings.SKAD_CAMPAIGN.ANDROID_APP_CATAGORIES === false) {
      return true;
    } else {
      return false;
    }
  }


  setBulkEditParams() {
    let requiredParams = this.bulkEditService.getBulkEditSettings(this.SCONST.STEP_TITLE_INVENTORY);

    if (requiredParams && requiredParams["inventory"]) {
      this.inventory = requiredParams["inventory"];
    }

    if (requiredParams && requiredParams["auction"]) {
      this.auction = requiredParams["auction"];
    }

    if (requiredParams && requiredParams["apps"]) {
      this.apps = requiredParams["apps"];
    }


  }






  validateInventorySources() {
    const invIndex = this.trgtOptInventorySources.findIndex(item => item.checked);
    const invValue = this.trgtOptInventorySources[invIndex].value;
    if (invValue === 0) {
      this.error.inventory = { hasError: false, msg: '' };
    } else {
      if (this.selectionList[INVENTORY_SOURCE] === null || this.selectionList[INVENTORY_SOURCE] === undefined
        || !Array.isArray(this.selectionList[INVENTORY_SOURCE]) || this.selectionList[INVENTORY_SOURCE].length <= 0) {
        this.error.inventory = { hasError: true, msg: 'Atleast one inventory source has to be selected.' };
      } else {
        this.error.inventory = { hasError: false, msg: '' };
      }
    }

  }

  validateAuction() {
    //REVX-127 : validation for aution here : having none of the checkox selected is the only error condition
    const auctionSelected = this.auctionTypes.filter(item => item.checked);
    this.error.auctionType = (auctionSelected.length === 0) ? { hasError: true, msg: 'Atleast one Auction Type has to be chosen.' } :
      { hasError: false, msg: '' };

  }

  //revx-371 : bulk edit
  errorExists() {
    const errorList = Object.keys(this.error).filter(key => this.error[key].hasError);
    if (errorList.length > 0) {
      this.strService.scrollToError();
    }
    return (errorList.length > 0) ? false : true;
  }


  //revx-371 : bulk edit
  isFormValidForBulkEdit() {
    if (this.inventory.selectedBulkEditOpt !== this.SCONST.NO_CHANGE) {
      this.validateInventorySources();
    }

    if (this.auction.selectedBulkEditOpt !== this.SCONST.NO_CHANGE) {
      this.validateAuction();
    }
    return this.errorExists();
  }

  //revx-371 : bulk edit
  updateBulkEditSelection() {
    if (this.isBulkEdit) {
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.INVENTORY, this.inventory.selectedBulkEditOpt);
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.AUCTION, this.auction.selectedBulkEditOpt);
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.APPS, this.apps.selectedBulkEditOpt);
    }
  }



  isToBeHidden(bulkEditId) {
    if (this.isBulkEdit) {
      if (bulkEditId === 0) {
        return this.inventory.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      } else if (bulkEditId === 1) {
        return this.auction.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      } else if (bulkEditId === 2) {
        return this.apps.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      }
      return false;
    }
    return false;

  }


}
