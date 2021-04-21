import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import {
  AudienceStrDTO,
  BaseModel,
  Day,
  DayPart,
  DealCategoryDTO,
  ExtendedBaseModel,
  ExtendedTargetingObject,
  StrategyDTO,
  TargetDeviceTypes,
  TargetGeoDTO,
  TargetingObject,
  TargetMobileDeviceBrands,
  TargetMobileDeviceModels,
  TargetMobileDevices,
  TargetOperatingSystem
} from '@revxui/api-client-ts';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { StrategyObjectsService } from '../../_services/strategy-objects.service';
import { AudienceTBObject, GridData, MODE, StrategyService, SkadSettings } from '../../_services/strategy.service';
import { OsVersionModalComponent } from '../_modals/os-version-modal/os-version-modal.component';
import { TargetBlockAudienceModalComponent } from '../_modals/target-block-audience-modal/target-block-audience-modal.component';
import { TargetBlockModalComponent } from '../_modals/target-block-modal/target-block-modal.component';
import { TargetingModalComponent } from '../_modals/targeting-modal/targeting-modal.component';
import { StrategyBulkEditService } from '../../_services/strategy-bulk-edit.service';


const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const GEO_LOCATION_COUNTRY = 'geo-location-country';
const GEO_LOCATION_STATE = 'geo-location-state';
const GEO_LOCATION_CITY = 'geo-location-city';
const AUDIENCE = 'audience';
const APP_AUDIENCE = 'app_audience';
const WEB_AUDIENCE = 'web_audience';
const DMP_AUDIENCE = 'dmp_audience';
const MOBILE_BRANDS = 'mobile-brands';
const MOBILE_MODELS = 'mobile-models';
const DEAL_CATEGORY = 'deal_category';

interface SelectionData {
  targetList: GridData[];
  blockList: GridData[];
}

@Component({
  selector: 'app-strategy-edit-targeting',
  templateUrl: './strategy-edit-targeting.component.html',
  styleUrls: ['./strategy-edit-targeting.component.scss']
})
export class StrategyEditTargetingComponent implements OnInit, OnDestroy {

  strDetailsSub: Subscription;

  @Input() mode: number;

  @Input() isBulkEdit: boolean;
  @Input() openFromCampaignDetails: boolean;

  geo = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }

  audience = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }

  days = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }

  os = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }

  deal = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  }


  strategyDTO: StrategyDTO;
  SCONST = StrategyConstants;
  MODE = MODE;
  title = StrategyConstants.STEP_TITLE_TARGETING;

  creativePlacementOptions = cloneDeep(this.strObjService.creativePlacementOptions);
  connectionTypeOptions = cloneDeep(this.strObjService.connectionTypeOptions);
  mobileOSOptions = cloneDeep(this.strObjService.mobileOSOptions);
  deviceTypeOptions = cloneDeep(this.strObjService.deviceTypeOptions);
  dayparts = cloneDeep(this.strObjService.dayparts);

  stateDependents = [{ id: 'country', title: 'Country', entity: 'COUNTRY' }];
  cityDependents = [{ id: 'country', title: 'Country', entity: 'COUNTRY' }, { id: 'state', title: 'State', entity: 'STATE' }];

  audienceTargetOperator = 'AND';
  audienceBlockOperator = 'OR';

  selectionData: Map<string, SelectionData> = new Map<string, SelectionData>();
  hideBelowCreativePlacement = false;

  error = cloneDeep(this.strObjService.errorTargeting);

  selAndroidVersion: any = { id: 21, name: 'Any' };
  selIOSVersion: any = { id: 23, name: 'Any' };

  //REVX-724 : skad-ui changes
  skadSettingsSub: Subscription;
  skadSettings: SkadSettings;


  constructor(
    private strService: StrategyService,
    private strObjService: StrategyObjectsService,
    private modal: MatDialog,
    private bulkEditService: StrategyBulkEditService
  ) { }

  ngOnInit() {
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
      this.goToStep(1, false);
    }
  }

  resetLocalValues() {
    this.creativePlacementOptions = cloneDeep(this.strObjService.creativePlacementOptions);
    this.connectionTypeOptions = cloneDeep(this.strObjService.connectionTypeOptions);
    this.mobileOSOptions = cloneDeep(this.strObjService.mobileOSOptions);
    this.deviceTypeOptions = cloneDeep(this.strObjService.deviceTypeOptions);
    this.dayparts = cloneDeep(this.strObjService.dayparts);
  }

  goToNextStep() {
    this.goToStep(3, true);
  }

  onReviewAndSave() {
    this.goToStep(5, true);
  }

  onDealSelectionRemoved(event) {
    const id = event.item.id;
    this.selectionData[event.identifier].targetList = this.selectionData[event.identifier].targetList.filter(item => item.id !== id);
  }

  onSelectionRemoved(event) {
    const id = event.item.id;
    if (event.type === 1) {
      this.selectionData[event.identifier].targetList = this.selectionData[event.identifier].targetList.filter(item => item.id !== id);
    } else {
      this.selectionData[event.identifier].blockList = this.selectionData[event.identifier].blockList.filter(item => item.id !== id);
    }

    this.validate();
  }

  onTargetBlockOptionChange(event) {
    if (event.type === 1) {
      this.audienceTargetOperator = event.value;
    } else if (event.type === -1) {
      this.audienceBlockOperator = event.value;
    }
  }

  /**
   * Country browse click handler
   */
  actionCountryClick(event) {
    // const modalRef = this.modal.open(TargetBlockModalComponent, {
    const modalRef = this.modal.open(TargetingModalComponent, {

      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: 0,
        entity: 'COUNTRY',
        title: 'Select countries',
        targetList: [...this.selectionData[GEO_LOCATION_COUNTRY].targetList],
        blockList: [...this.selectionData[GEO_LOCATION_COUNTRY].blockList]
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.selectionData[GEO_LOCATION_COUNTRY].targetList = result.targetList;
          this.selectionData[GEO_LOCATION_COUNTRY].blockList = result.blockList;
        }
      }
    );
  }

  /**
   * State browse click handler
   */
  actionStateClick() {
    // const modalRef = this.modal.open(TargetBlockModalComponent, {
    const modalRef = this.modal.open(TargetingModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: 0,
        entity: 'STATE',
        title: 'Select states',
        targetList: [...this.selectionData[GEO_LOCATION_STATE].targetList],
        blockList: [...this.selectionData[GEO_LOCATION_STATE].blockList]
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.selectionData[GEO_LOCATION_STATE].targetList = result.targetList;
          this.selectionData[GEO_LOCATION_STATE].blockList = result.blockList;
        }
      }
    );
  }

  /**
   * City browse click handler
   */
  actionCityClick() {
    // const modalRef = this.modal.open(TargetBlockModalComponent, {
    const modalRef = this.modal.open(TargetingModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: 0,
        entity: 'CITY',
        title: 'Select cities',
        targetList: [...this.selectionData[GEO_LOCATION_CITY].targetList],
        blockList: [...this.selectionData[GEO_LOCATION_CITY].blockList]
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.selectionData[GEO_LOCATION_CITY].targetList = result.targetList;
          this.selectionData[GEO_LOCATION_CITY].blockList = result.blockList;
        }
      }
    );
  }

  /**
   * Audience browse click handler
   */
  actionAudienceClick() {
    const modalRef = this.modal.open(TargetBlockAudienceModalComponent, {
      width: '80%',
      maxHeight: '125vh',
      disableClose: true,
      data: {
        type: 0,
        entity: 'AUDIENCE',
        title: 'Select audiences',
        targetList: this.getAudienceSelectionData(true),
        blockList: this.getAudienceSelectionData(false)
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result && result.audienceTBObject) {
          this.selectionData[APP_AUDIENCE] = result.audienceTBObject[AudienceConstants.TYPE.APP];
          this.selectionData[WEB_AUDIENCE] = result.audienceTBObject[AudienceConstants.TYPE.WEB];
          this.selectionData[DMP_AUDIENCE] = result.audienceTBObject[AudienceConstants.TYPE.DMP];
          this.setAudienceSelectionData(result.audienceTBObject);

          // REVX-588 this is done to have consistency when we navigate by header clicks
          this.validate()
        }
      }
    );
  }

  /**
   * Mobile brand browse click handler
   */
  actionMobileBrandsClick(event) {
    const modalRef = this.modal.open(TargetBlockModalComponent, {

      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: 1,
        entity: 'DEVICE_BRAND',
        title: 'Select Mobile Brands',
        targetList: [...this.selectionData[MOBILE_BRANDS].targetList],
        blockList: []
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.selectionData[MOBILE_BRANDS].targetList = result.targetList;
        }
      }
    );
  }

  /**
   * Mobile model browse click handler
   */
  actionMobileModelsClick(event) {
    const modalRef = this.modal.open(TargetBlockModalComponent, {

      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: 1,
        entity: 'DEVICE_MODEL',
        title: 'Select Mobile Models',
        targetList: [...this.selectionData[MOBILE_MODELS].targetList],
        blockList: []
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.selectionData[MOBILE_MODELS].targetList = result.targetList;
        }
      }
    );
  }

  /**
   * Operating System select version click handler
   */
  actionMobileOS(event) {

    //REVX-724 : skad-ui changes
    const modalRef = this.modal.open(OsVersionModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        title: 'Mobile OS Version',
        subTitle: 'Mobile device with selected OS version and above will be targeted.',
        osVersionAndroid: this.selAndroidVersion,
        osVersionIOS: this.selIOSVersion,
        showAndroid: (this.skadSettings && this.skadSettings.SKAD_CAMPAIGN && this.skadSettings.SKAD_CAMPAIGN.MOBILE_OPERATING_SYSTEM && this.skadSettings.SKAD_CAMPAIGN.MOBILE_OPERATING_SYSTEM.ANDROID === false) ? false : true
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          // console.log(result);
          this.selAndroidVersion = result.androidVersion;
          this.selIOSVersion = result.iosVersion;
          this.mobileOSOptions.forEach(item => {
            if (item.id === 'android') {
              item.desc = result.androidVersion.name;
            } else if (item.id === 'ios') {
              item.desc = result.iosVersion.name;
            }
          });
        }
      }
    );
  }

  /**
   * Deal category browse click handler
   */
  actionAdvancedTargeting(event) {
    // const modalRef = this.modal.open(TargetBlockModalComponent, {
    const modalRef = this.modal.open(TargetingModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: 0,
        entity: 'DEAL_CATEGORY',
        title: 'Select Advanced Targeting',
        targetList: [...this.selectionData[DEAL_CATEGORY].targetList],
        blockList: [],
        hideBlockOption: true
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.selectionData[DEAL_CATEGORY].targetList = result.targetList;
          // this.selectionData[GEO_LOCATION_COUNTRY].blockList = result.blockList;
        }
      }
    );
  }

  getDayPart(part: string, dayHrs: any) {
    const hours = this.getHours(part);

    return dayHrs.filter(day => {
      return hours.indexOf(day.hr) !== -1;
    });
  }

  toggleDayPartSelection(hr: any) {
    hr.checked = !hr.checked;
  }

  isAllDaysSelected() {
    for (const day of DAYS) {
      const allSelected = this.isAllDaySelected(this.getDayIndex(day));
      if (!allSelected) {
        return false;
      }
    }
    return true;
  }

  toggleAllDaysSelection() {
    const isAllDaysSelected = this.isAllDaysSelected();
    DAYS.forEach(day => {
      this.toggleAllDaySelection(this.getDayIndex(day), isAllDaysSelected);
    });
  }

  isAllDaySelected(day: number) {
    const dayPart = this.dayparts.filter(item => item.day === day);
    if (dayPart !== null && dayPart !== undefined && Array.isArray(dayPart) && dayPart.length > 0) {
      const part = dayPart[dayPart.length - 1];
      const uncheckedList = [];
      uncheckedList.push(...part.hours.filter(item => !item.checked));
      return (uncheckedList.length === 0);
    } else {
      return false;
    }
  }

  toggleAllDaySelection(day: number, isSelected?: boolean) {
    const isAllDaySelected = (isSelected !== undefined) ? isSelected : this.isAllDaySelected(day);
    const dayPart = this.dayparts.filter(item => item.day === day);
    if (dayPart !== null && dayPart !== undefined && Array.isArray(dayPart) && dayPart.length > 0) {
      const part = dayPart[dayPart.length - 1];
      part.hours.forEach(item => item.checked = !isAllDaySelected);
    }
  }

  isAllHourGroupSelected(hrGroup: string) {
    const uncheckedList = [];
    const hours = this.getHours(hrGroup);

    for (const dayPart of this.dayparts) {
      uncheckedList.push(...dayPart.hours.filter(hour => hours.indexOf(hour.hr) !== -1 && !hour.checked));

      if (uncheckedList.length > 0) {
        return false;
      }
    }

    return true;
  }

  toggleHourGroupSelection(hrGroup: string) {
    const isAllHourGroupSelected = this.isAllHourGroupSelected(hrGroup);
    const hours = this.getHours(hrGroup);

    this.dayparts.forEach(daypart => {
      daypart.hours.filter(hr => hours.indexOf(hr.hr) !== -1).forEach(hr => {
        hr.checked = !isAllHourGroupSelected;
      });
    });
  }

  onCheckboxSelectionChange(event) {
    if (event === 'creative-placement') {
      const placementList = this.creativePlacementOptions.filter(item => item.checked);
      if (placementList.length === 0) {
        this.error.creativePlacement = { hasError: true, msg: 'Atleast one Creative Placement has to be chosen' };
        this.hideBelowCreativePlacement = true;
      } else if (placementList.length === 1) {
        const index = this.creativePlacementOptions.findIndex(item => item.checked);
        if (this.creativePlacementOptions[index].id === 'desktop') {
          this.hideBelowCreativePlacement = true;
        }
        this.error.creativePlacement = { hasError: false, msg: '' };
      } else {
        this.error.creativePlacement = { hasError: false, msg: '' };
        this.hideBelowCreativePlacement = false;
      }
    } else if (event === 'connection-type') {
      const connList = this.connectionTypeOptions.filter(item => item.checked);
      this.error.connectionType = (connList.length === 0) ? { hasError: true, msg: 'Atleast one Connection Type has to be chosen.' } :
        { hasError: false, msg: '' };
    } else if (event === 'operating-system') {
      const osList = this.mobileOSOptions.filter(item => item.checked);
      this.error.os = (osList.length === 0) ? { hasError: true, msg: 'Atleast one Mobile Operating System has to be chosen.' } :
        { hasError: false, msg: '' };
    } else if (event === 'device-type') {
      const deviceList = this.deviceTypeOptions.filter(item => item.checked);
      this.error.deviceType = (deviceList.length === 0) ? { hasError: true, msg: 'Atleast one Device Type has to be chosen.' } :
        { hasError: false, msg: '' };
    }
  }

  getDayFromIndex(index: number) {
    return DAYS[index];
  }

  private subscribeToEvents() {
    /**
     * Subscription to receive StrategyDTO from the api "getStrategyByIdUsingGET"
     */
    this.strDetailsSub = this.strService.onStrategyDetailsSet.subscribe(
      param => {
        this.handleStrategyDetailsSet(param.strDetails);
        this.resetErrorObject();
      }
    );

    //REVX-724 : skad-ui changes
    this.skadSettingsSub = this.strService.skadSettings.subscribe(param => {
      this.skadSettings = cloneDeep(param);
      if (this.skadSettings && this.skadSettings.SKAD_CAMPAIGN && this.skadSettings.SKAD_CAMPAIGN.MOBILE_OPERATING_SYSTEM && this.skadSettings.SKAD_CAMPAIGN.MOBILE_OPERATING_SYSTEM.ANDROID === false) {
        this.mobileOSOptions = cloneDeep(this.strObjService.getMobileOsOptions(true));
      }
    });

  }

  resetErrorObject() {
    this.error = cloneDeep(this.strObjService.errorTargeting);
  }


  private isAudienceDetailsValid(): boolean {

    //REVX-724 : audience can not be added for SKAD Strategies : thus for skad we do not need this validation
    let isAudienceHidden = this.hideAudienceSection();
    if (isAudienceHidden) {
      return true;
    }

    if ((this.selectionData[AUDIENCE].targetList !== null && this.selectionData[AUDIENCE].targetList !== undefined
      && Array.isArray(this.selectionData[AUDIENCE].targetList) && this.selectionData[AUDIENCE].targetList.length > 0)
      || (this.selectionData[AUDIENCE].blockList !== null && this.selectionData[AUDIENCE].blockList !== undefined
        && Array.isArray(this.selectionData[AUDIENCE].blockList) && this.selectionData[AUDIENCE].blockList.length > 0)) {
      return true;
    } else {
      return false;
    }
  }

  private isFormValid() {

    //audience validation
    const isAudienceValid = this.isAudienceDetailsValid();
    if (isAudienceValid) {
      this.error.audience = { hasError: false, msg: '' };
    } else {
      this.error.audience = {
        hasError: true, msg: 'All Audience not allowed. Atleast one specific '
          + 'Audience has to be selected to proceed.'
      };
    }

    this.dayPartValidation();

    const placementList = this.creativePlacementOptions.filter(item => item.checked);
    if (placementList.length === 0) {
      this.error.creativePlacement = { hasError: true, msg: 'Atleast one Creative Placement has to be chosen' };
      this.hideBelowCreativePlacement = true;
    } else {
      this.error.creativePlacement = { hasError: false, msg: '' };
      this.hideBelowCreativePlacement = false;
    }

    const connList = this.connectionTypeOptions.filter(item => item.checked);
    this.error.connectionType = (connList.length === 0) ? { hasError: true, msg: 'Atleast one Connection Type has to be chosen.' } :
      { hasError: false, msg: '' };


    this.osValidation();

    const deviceList = this.deviceTypeOptions.filter(item => item.checked);
    this.error.deviceType = (deviceList.length === 0) ? { hasError: true, msg: 'Atleast one Device Type has to be chosen.' } :
      { hasError: false, msg: '' };


    return this.errorExists();
  }

  private updateStrategyObject() {

    this.strategyDTO = this.strService.getStrDetails();

    this.strategyDTO.targetGeographies = this.updateGeographiesInStrategyDTO();

    const audienceObjects = this.updateSegmentsInStrategyDTO();
    this.strategyDTO.targetAppSegments = audienceObjects.app;
    this.strategyDTO.targetWebSegments = audienceObjects.web;
    this.strategyDTO.targetDmpSegments = audienceObjects.dmp;

    const dayPart = this.formatDayParts(this.dayparts);
    this.strategyDTO.targetDays = {
      daypart: dayPart
    } as DayPart;

    this.strategyDTO.placements = this.creativePlacementOptions.filter(item => item.checked).map(item => {
      return { id: item.value, name: item.name };
    });

    this.strategyDTO.connectionTypes = this.connectionTypeOptions.filter(item => item.checked).map(item => {
      return item.value;
    });

    this.strategyDTO.targetMobileDevices = this.updateTargetMobileDevicesInStrategyDTO();

    // console.log("[STRATEGY TARGETING] StrategyDTO = ", this.strategyDTO);

    this.strategyDTO.targetDealCategory = this.updateTargetDealCategoryInStrategyDTO();

    this.strService.setStrDetails(this.strategyDTO);
  }

  checkAllTargetMobileDevicesSelected() {
    if (this.checkAllDeviceTypeSelected() && this.checkAllMobileModelsSelected()
      && this.checkAllMobileBrandsSelected() && this.checkAllOSSelected()) {
      return true;
    } else {
      return false;
    }
  }

  checkCustomCountryTargeting(countryData: any) {
    if ((countryData.targetList !== null && countryData.targetList !== undefined
      && Array.isArray(countryData.targetList) && countryData.targetList.length > 0)
      || (countryData.blockList !== null && countryData.blockList !== undefined
        && Array.isArray(countryData.blockList) && countryData.blockList.length > 0)) {
      return true;
    } else {
      return false;
    }
  }

  checkCustomStateTargeting(stateData: any) {
    if ((stateData.targetList !== null && stateData.targetList !== undefined
      && Array.isArray(stateData.targetList) && stateData.targetList.length > 0)
      || (stateData.blockList !== null && stateData.blockList !== undefined
        && Array.isArray(stateData.blockList) && stateData.blockList.length > 0)) {
      return true;
    } else {
      return false;
    }
  }

  checkCustomCityTargeting(cityData: any) {
    if ((cityData.targetList !== null && cityData.targetList !== undefined
      && Array.isArray(cityData.targetList) && cityData.targetList.length > 0)
      || (cityData.blockList !== null && cityData.blockList !== undefined
        && Array.isArray(cityData.blockList) && cityData.blockList.length > 0)) {
      return true;
    } else {
      return false;
    }
  }

  private checkAllDeviceTypeSelected() {
    return false; // this.deviceTypeOptions.filter(item => item.checked).length === this.mobileOSOptions.length;
  }

  private checkAllMobileModelsSelected() {
    return (this.selectionData[MOBILE_MODELS].targetList.length === 0);
  }

  private checkAllMobileBrandsSelected() {
    return (this.selectionData[MOBILE_BRANDS].targetList.length === 0);
  }

  private checkAllOSSelected() {
    const allOSSelected = this.mobileOSOptions.filter(item => item.checked).length === this.mobileOSOptions.length;
    const allOSVersionSelected = this.selAndroidVersion.name === 'Any' && this.selIOSVersion.name === 'Any';
    return (allOSSelected && allOSVersionSelected);
  }

  private formatDayParts(dayparts) {
    const parts = [];
    Object.keys(dayparts).forEach(key => {
      const hrs = dayparts[key].hours.filter(hr => hr.checked).map(hr => hr.hr);
      if (hrs.length > 0) {
        parts.push({ day: +key, hours: hrs });
      }
    });
    return parts;
  }

  private checkIsCustomGeoTargetting(data) {
    if (data[GEO_LOCATION_COUNTRY].targetList.length === 0 && data[GEO_LOCATION_COUNTRY].blockList.length === 0 &&
      data[GEO_LOCATION_STATE].targetList.length === 0 && data[GEO_LOCATION_STATE].blockList.length === 0 &&
      data[GEO_LOCATION_CITY].targetList.length === 0 && data[GEO_LOCATION_CITY].blockList.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * method to handle the incoming StrategyDTO object
   * @param strDetails - StrategyDTO containing all the details of a strategy
   */
  private handleStrategyDetailsSet(strDetails: StrategyDTO) {

    this.initSelectionData();


    if (strDetails !== null) {
      this.strategyDTO = strDetails;
      this.initSelectionData();
      this.setTargetingDetails(strDetails);
    }
  }

  /**
   * Method to extract the individual elements from StrategyDTO and set it in the local object
   */
  private setTargetingDetails(strDetails: StrategyDTO) {
    this.setGeoDetails(strDetails.targetGeographies);
    this.setAudienceDetails(strDetails.targetAppSegments, strDetails.targetWebSegments, strDetails.targetDmpSegments);
    this.setDayPart(strDetails.targetDays);
    this.setCreativePlacement(strDetails.placements);
    this.setConnectionType(strDetails.connectionTypes);
    this.setMobileOperatingSystem(strDetails.targetMobileDevices);
    this.setDeviceType(strDetails.targetMobileDevices);
    this.setBrandsAndModels(strDetails.targetMobileDevices);
    this.setDealCategories(strDetails.targetDealCategory);
  }

  /**
   * Extract the geography details from StrategyDTO and set it in the local object
   * @param geoDetails - TargetGeoDTO
   */
  private setGeoDetails(geoDetails: TargetGeoDTO) {
    const customGeoTargeting = (geoDetails) ? geoDetails.customGeoTargeting : false;
    if (!customGeoTargeting) {
      this.selectionData[GEO_LOCATION_COUNTRY] = { targetList: [], blockList: [] };
      this.selectionData[GEO_LOCATION_STATE] = { targetList: [], blockList: [] };
      this.selectionData[GEO_LOCATION_CITY] = { targetList: [], blockList: [] };
    } else {
      if (geoDetails.country) {
        this.selectionData[GEO_LOCATION_COUNTRY].targetList = (geoDetails.country.targetList) ? geoDetails.country.targetList : [];
        this.selectionData[GEO_LOCATION_COUNTRY].blockList = (geoDetails.country.blockedList) ? geoDetails.country.blockedList : [];
      } else {
        this.selectionData[GEO_LOCATION_COUNTRY] = { targetList: [], blockList: [] };
      }

      if (geoDetails.state) {
        this.selectionData[GEO_LOCATION_STATE].targetList = (geoDetails.state.targetList) ? geoDetails.state.targetList : [];
        this.selectionData[GEO_LOCATION_STATE].blockList = (geoDetails.state.blockedList) ? geoDetails.state.blockedList : [];
      } else {
        this.selectionData[GEO_LOCATION_STATE] = { targetList: [], blockList: [] };
      }

      if (geoDetails.city) {
        this.selectionData[GEO_LOCATION_CITY].targetList = (geoDetails.city.targetList) ? geoDetails.city.targetList : [];
        this.selectionData[GEO_LOCATION_CITY].blockList = (geoDetails.city.blockedList) ? geoDetails.city.blockedList : [];
      } else {
        this.selectionData[GEO_LOCATION_CITY] = { targetList: [], blockList: [] };
      }
    }
  }

  /**
   * Extract the Audience details from StrategyDTO and set it in the local object
   * @param appDetails - appDetails
   * @param webDetails - webDetails
   * @param dmpDetails - dmpDetails
   */
  private setAudienceDetails(appDetails: AudienceStrDTO, webDetails: AudienceStrDTO, dmpDetails: AudienceStrDTO) {
    this.setAudienceObjects(appDetails, APP_AUDIENCE);
    this.setAudienceObjects(webDetails, WEB_AUDIENCE);
    this.setAudienceObjects(dmpDetails, DMP_AUDIENCE);

    this.selectionData[AUDIENCE].targetList = [];
    this.selectionData[AUDIENCE].blockList = [];

    this.addAudienceToList(appDetails, AudienceConstants.TYPE.APP, true);
    this.addAudienceToList(webDetails, AudienceConstants.TYPE.WEB, true);
    this.addAudienceToList(dmpDetails, AudienceConstants.TYPE.DMP, true);

    this.addAudienceToList(appDetails, AudienceConstants.TYPE.APP, false);
    this.addAudienceToList(webDetails, AudienceConstants.TYPE.WEB, false);
    this.addAudienceToList(dmpDetails, AudienceConstants.TYPE.DMP, false);
  }

  private setAudienceObjects(audienceDetails: AudienceStrDTO, type: string) {
    const customSegmentTargeting = (audienceDetails) ? audienceDetails.customSegmentTargeting : false;
    if (customSegmentTargeting) {
      this.selectionData[type].targetList = (audienceDetails.targetedSegments) ? audienceDetails.targetedSegments : [];
      this.selectionData[type].blockList = (audienceDetails.blockedSegments) ? audienceDetails.blockedSegments : [];
      this.audienceTargetOperator = (audienceDetails && audienceDetails.targetedSegmentsOperator)
        ? audienceDetails.targetedSegmentsOperator : 'AND';
      this.audienceBlockOperator = (audienceDetails && audienceDetails.blockedSegmentsOperator)
        ? audienceDetails.blockedSegmentsOperator : 'OR';
    } else {
      this.selectionData[type] = { targetList: [], blockList: [] };
    }
  }

  private addAudienceToList(audDetails: AudienceStrDTO, audType: string, isTarget: boolean) {
    if (isTarget) {
      if (audDetails && audDetails.targetedSegments) {
        this.selectionData[AUDIENCE].targetList.push(...audDetails.targetedSegments.map(item => {
          return { ...item, type: audType };
        }));
      }
    } else {
      if (audDetails && audDetails.blockedSegments) {
        this.selectionData[AUDIENCE].blockList.push(...audDetails.blockedSegments.map(item => {
          return { ...item, type: audType };
        }));
      }
    }
  }

  /**
   * Extract the day part from StrategyDTO and set it in the local object
   * @param targetDays - targetDays
   */
  private setDayPart(targetDays: DayPart) {
    const dayPart: Day[] = (targetDays) ? targetDays.daypart : null;
    if (dayPart !== null) {
      const days = dayPart.map(item => item.day);
      this.dayparts.forEach(day => {
        if (days.indexOf(day.day) !== -1) {
          const index = dayPart.findIndex(item => item.day === day.day);
          const hours = dayPart[index].hours;
          day.hours.forEach(hour => {
            hour.checked = (hours.indexOf(hour.hr) !== -1) ? true : false;
          });
        } else {
          day.hours.forEach(hour => {
            hour.checked = false;
          });
        }
      });
    }
  }

  /**
   * Extract the creative details from StrategyDTO and set it in the local object
   * @param placements - placements
   */
  private setCreativePlacement(placements: BaseModel[]) {
    if (placements === null || placements === undefined) {
      // do nothing
    } else {
      const selPlacements = placements.map(item => item.id);
      this.creativePlacementOptions.forEach(item => {
        item.checked = selPlacements.indexOf(item.value) === -1 ? false : true;
      });

      if (selPlacements.length === 1) {
        const index = this.creativePlacementOptions.findIndex(item => item.checked);
        if (this.creativePlacementOptions[index].id === 'desktop') {
          this.hideBelowCreativePlacement = true;
        } else {
          this.hideBelowCreativePlacement = false;
        }
      } else {
        this.hideBelowCreativePlacement = false;
      }
    }
  }

  /**
   * Extract the connection type from StrategyDTO and set it in the local object
   * @param connectionType - connectionType
   */
  private setConnectionType(connectionType: StrategyDTO.ConnectionTypesEnum[]) {
    if (connectionType === null || connectionType === undefined || connectionType.length === 0) {
      // do nothing
    } else {

      this.connectionTypeOptions.forEach(item => {
        item.checked = connectionType.indexOf(item.value) === -1 ? false : true;
      });
    }
  }

  /**
   * Extract the mobile operating system details from StrategyDTO and set it in the local object
   * @param targetMobileDevices - targetMobileDevices
   */
  private setMobileOperatingSystem(targetMobileDevices: TargetMobileDevices) {
    const mobileOSs = (targetMobileDevices) ? targetMobileDevices.targetOperatingSystems : null;
    if (mobileOSs === null || mobileOSs === undefined || mobileOSs.selectAllOperatingSystems
      || mobileOSs.operatingSystems.includeList.length === 0) {
      // do nothing
    } else {
      const includedList = mobileOSs.operatingSystems.includeList;
      const selMobileOS = includedList.map(item => item.id);
      this.mobileOSOptions.forEach(item => {
        item.checked = selMobileOS.indexOf(item.value) === -1 ? false : true;
        if (item.id === 'android' && selMobileOS.indexOf(item.value) !== -1) {
          const andIndex = includedList.findIndex(item => item.id === 4);
          if (andIndex !== -1) {
            const prop = includedList[andIndex].properties.OSVERSION;
            if (prop.id === 21) {
              this.selAndroidVersion = { id: 21, name: 'Any' };
            } else {
              this.selAndroidVersion = prop;
            }
          }
          item.desc = this.selAndroidVersion.name;
        }
        if (item.id === 'ios' && selMobileOS.indexOf(item.value) !== -1) {
          const iosIndex = includedList.findIndex(item => item.id === 3);
          if (iosIndex !== -1) {
            const prop = includedList[iosIndex].properties.OSVERSION;
            if (prop.id === 23) {
              this.selIOSVersion = { id: 23, name: 'Any' };
            } else {
              this.selIOSVersion = prop;
            }
          }
          item.desc = this.selIOSVersion.name;
        }
      });
    }
  }

  /**
   * Extract the Mobile device details from StrategyDTO and set it in the local object
   * @param targetMobileDevices
   */
  private setDeviceType(targetMobileDevices: TargetMobileDevices) {
    const deviceTypes = (targetMobileDevices) ? targetMobileDevices.targetDeviceTypes : null;
    if (deviceTypes === null || deviceTypes === undefined || deviceTypes.selectAllMobileDeviceTypes
      || deviceTypes.mobileDeviceTypes.targetList.length === 0) {
      // do nothing
    } else {
      const selDeviceTypes = deviceTypes.mobileDeviceTypes.targetList.map(item => item.id);
      this.deviceTypeOptions.forEach(item => {
        item.checked = selDeviceTypes.indexOf(item.value) === -1 ? false : true;
      });
    }
  }

  /**
   * Extract the Mobile Device and Models from StrategyDTO and set it in the local object
   * @param targetMobileDevices - targetMobileDevices
   */
  private setBrandsAndModels(targetMobileDevices: TargetMobileDevices) {
    this.selectionData[MOBILE_BRANDS] = { targetList: [], blockList: [] };
    this.selectionData[MOBILE_MODELS] = { targetList: [], blockList: [] };

    const brands = (targetMobileDevices && targetMobileDevices.targetMobileDeviceBrands) ?
      targetMobileDevices.targetMobileDeviceBrands : null;
    if (brands) {
      const allBrands = brands.selectAllMobileDeviceBrands;
      if (allBrands) {
        this.selectionData[MOBILE_BRANDS] = { targetList: [], blockList: [] };
      } else {
        this.selectionData[MOBILE_BRANDS].targetList = (brands.mobileDeviceBrands && brands.mobileDeviceBrands.targetList) ?
          brands.mobileDeviceBrands.targetList : [];
        this.selectionData[MOBILE_BRANDS].blockList = (brands.mobileDeviceBrands && brands.mobileDeviceBrands.blockedList) ?
          brands.mobileDeviceBrands.blockedList : [];
      }
    }

    const models = (targetMobileDevices && targetMobileDevices.targetMobileModels) ?
      targetMobileDevices.targetMobileModels : null;
    if (models) {
      const allModels = models.selectAllMobileDeviceModels;
      if (allModels) {
        this.selectionData[MOBILE_MODELS] = { targetList: [], blockList: [] };
      } else {
        this.selectionData[MOBILE_MODELS].targetList = (models.mobileDeviceModels && models.mobileDeviceModels.includeList) ?
          models.mobileDeviceModels.includeList : [];
        this.selectionData[MOBILE_MODELS].blockList = (models.mobileDeviceModels && models.mobileDeviceModels.excludeList) ?
          models.mobileDeviceModels.excludeList : [];
      }
    }
  }

  /**
   * Extract the deal category from StrategyDTO and set it in the local object
   * @param targetDealCategory - targetDealCategory
   */
  private setDealCategories(targetDealCategory: DealCategoryDTO) {
    const isAllDeals = (targetDealCategory) ? targetDealCategory.selectAll : true;
    if (isAllDeals) {
      this.selectionData[DEAL_CATEGORY] = { targetList: [], blockList: [] };
    } else {
      this.selectionData[DEAL_CATEGORY] = {
        targetList: (targetDealCategory.dealCategory)
          ? targetDealCategory.dealCategory.targetList : [],
        blockList: []
      }
    }
  }

  private getDayIndex(day: string) {
    let index = -1;
    switch (day.toLowerCase()) {
      case 'sunday': index = 0; break;
      case 'monday': index = 1; break;
      case 'tuesday': index = 2; break;
      case 'wednesday': index = 3; break;
      case 'thursday': index = 4; break;
      case 'friday': index = 5; break;
      case 'saturday': index = 6; break;
    }
    return index;
  }

  private getHours(part: string) {
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

  /**
   * Initialize the local object to save the individually elements
   */
  private initSelectionData() {
    this.selectionData[GEO_LOCATION_COUNTRY] = { targetList: [], blockList: [] };
    this.selectionData[GEO_LOCATION_STATE] = { targetList: [], blockList: [] };
    this.selectionData[GEO_LOCATION_CITY] = { targetList: [], blockList: [] };
    this.selectionData[MOBILE_BRANDS] = { targetList: [], blockList: [] };
    this.selectionData[MOBILE_MODELS] = { targetList: [], blockList: [] };
    this.selectionData[AUDIENCE] = { targetList: [], blockList: [] };
    this.selectionData[APP_AUDIENCE] = { targetList: [], blockList: [] };
    this.selectionData[WEB_AUDIENCE] = { targetList: [], blockList: [] };
    this.selectionData[DMP_AUDIENCE] = { targetList: [], blockList: [] };
    this.selectionData[DEAL_CATEGORY] = { targetList: [], blockList: [] };
  }

  private goToStep(stepNo: number, performValidation: boolean) {
    if (!performValidation) {
      this.strService.setStepperIndex(stepNo);
    }

    const isValid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (performValidation && isValid) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
      this.strService.setMaxStepperVisited(3);
      this.strService.setStepperIndex(stepNo);
    }
  }

  private getAudienceSelectionData(isTarget: boolean) {
    return isTarget ? this.selectionData[AUDIENCE].targetList : this.selectionData[AUDIENCE].blockList;
  }

  private setAudienceSelectionData(audData: AudienceTBObject) {
    this.selectionData[AUDIENCE].targetList = [];
    this.selectionData[AUDIENCE].blockList = [];


    if (audData && audData[AudienceConstants.TYPE.APP]) {
      this.pushInSelectionAudience(AudienceConstants.TYPE.APP, audData);
    }

    if (audData && audData[AudienceConstants.TYPE.WEB]) {
      this.pushInSelectionAudience(AudienceConstants.TYPE.WEB, audData);
    }

    if (audData && audData[AudienceConstants.TYPE.DMP]) {
      this.pushInSelectionAudience(AudienceConstants.TYPE.DMP, audData);
    }

  }


  pushInSelectionAudience(typeIndex: any, audData: AudienceTBObject) {
    if (audData[typeIndex].blockedList) {
      this.selectionData[AUDIENCE].blockList.push(...audData[typeIndex].blockedList.map(item => {
        return { ...item, type: typeIndex };
      }));
    }

    if (audData[typeIndex].targetList) {
      this.selectionData[AUDIENCE].targetList.push(...audData[typeIndex].targetList.map(item => {
        return { ...item, type: typeIndex };
      }));
    }
  }


  private updateSegmentsInStrategyDTO() {

    const appSegments: AudienceStrDTO = this.getDefaultAudienceStrDTOObject();
    const webSegments: AudienceStrDTO = this.getDefaultAudienceStrDTOObject();
    const dmpSegments: AudienceStrDTO = this.getDefaultAudienceStrDTOObject();

    this.selectionData[AUDIENCE].targetList.forEach((item: any) => {
      const type = item.type;
      switch (type) {
        case AudienceConstants.TYPE.APP:
          appSegments.targetedSegments.push(item);
          break;
        case AudienceConstants.TYPE.WEB:
          webSegments.targetedSegments.push(item);
          break;
        case AudienceConstants.TYPE.DMP:
          dmpSegments.targetedSegments.push(item);
          break;
      }
    });

    this.selectionData[AUDIENCE].blockList.forEach((item: any) => {
      const type = item.type;
      switch (type) {
        case AudienceConstants.TYPE.APP:
          appSegments.blockedSegments.push(item);
          break;
        case AudienceConstants.TYPE.WEB:
          webSegments.blockedSegments.push(item);
          break;
        case AudienceConstants.TYPE.DMP:
          dmpSegments.blockedSegments.push(item);
          break;
      }
    });

    this.setCustomSegmentTargeting(appSegments);
    this.setCustomSegmentTargeting(webSegments);
    this.setCustomSegmentTargeting(dmpSegments);

    return {
      app: appSegments,
      web: webSegments,
      dmp: dmpSegments
    };
  }

  private updateTargetMobileDevicesInStrategyDTO() {
    const isAllDeviceTypeSelected = this.checkAllDeviceTypeSelected();
    const isAllMobileBrandsSelected = this.checkAllMobileBrandsSelected();
    const isAllMobileModelsSelected = this.checkAllMobileModelsSelected();
    const isAllOSSelected = this.checkAllOSSelected();

    const targetMobileDevices = {
      targetDeviceTypes: {
        selectAllMobileDeviceTypes: isAllDeviceTypeSelected,
        mobileDeviceTypes: {
          blockedList: [],
          targetList: this.deviceTypeOptions.filter(item => item.checked).map(item => ({ id: item.value, name: item.name }))
        } as TargetingObject
      } as TargetDeviceTypes,

      targetMobileDeviceBrands: {
        selectAllMobileDeviceBrands: isAllMobileBrandsSelected,
        mobileDeviceBrands: {
          blockedList: [],
          targetList: this.selectionData[MOBILE_BRANDS].targetList
        } as TargetingObject
      } as TargetMobileDeviceBrands,

      targetMobileModels: {
        selectAllMobileDeviceModels: isAllMobileModelsSelected,
        mobileDeviceModels: {
          excludeList: [],
          includeList: this.selectionData[MOBILE_MODELS].targetList
        } as ExtendedTargetingObject
      } as TargetMobileDeviceModels,

      // targetMobileModels: null as TargetMobileDeviceModels,

      targetOperatingSystems: {
        selectAllOperatingSystems: isAllOSSelected,
        operatingSystems: {
          excludeList: [],
          includeList: this.mobileOSOptions.filter(item => item.checked).map(item => {
            return {
              id: item.value,
              name: item.name,
              properties: {
                OSVERSION: {
                  id: (item.id === 'android') ? this.selAndroidVersion.id : (item.id === 'ios') ? this.selIOSVersion.id : null,
                  name: (item.id === 'android') ? this.selAndroidVersion.name : (item.id === 'ios') ? this.selIOSVersion.name : null,
                } as BaseModel
              }
            } as ExtendedBaseModel;
          })
        } as ExtendedTargetingObject
      } as TargetOperatingSystem,
    } as TargetMobileDevices;

    return targetMobileDevices;
  }

  private updateGeographiesInStrategyDTO() {
    const isCustomGeoTargetting: boolean = this.checkIsCustomGeoTargetting(this.selectionData);
    const targetGeographies = {
      customGeoTargeting: isCustomGeoTargetting,
      country: {
        targetList: this.selectionData[GEO_LOCATION_COUNTRY].targetList.length > 0 ?
          this.selectionData[GEO_LOCATION_COUNTRY].targetList : [],
        blockedList: this.selectionData[GEO_LOCATION_COUNTRY].blockList.length > 0 ?
          this.selectionData[GEO_LOCATION_COUNTRY].blockList : []
      } as TargetingObject,
      state: {
        targetList: this.selectionData[GEO_LOCATION_STATE].targetList.length > 0 ?
          this.selectionData[GEO_LOCATION_STATE].targetList : [],
        blockedList: this.selectionData[GEO_LOCATION_STATE].blockList.length > 0 ?
          this.selectionData[GEO_LOCATION_STATE].blockList : []
      } as TargetingObject,
      city: {
        targetList: this.selectionData[GEO_LOCATION_CITY].targetList.length > 0 ?
          this.selectionData[GEO_LOCATION_CITY].targetList : [],
        blockedList: this.selectionData[GEO_LOCATION_CITY].blockList.length > 0 ?
          this.selectionData[GEO_LOCATION_CITY].blockList : []
      } as TargetingObject
    } as TargetGeoDTO;

    return targetGeographies;
  }

  private updateTargetDealCategoryInStrategyDTO() {
    const dealCategoryObj = {
      selectAll: true,
      dealCategory: {
        targetList: [],
        blockedList: []
      } as TargetingObject
    } as DealCategoryDTO;

    if (this.selectionData[DEAL_CATEGORY] && this.selectionData[DEAL_CATEGORY].targetList) {
      dealCategoryObj.selectAll = false;
      dealCategoryObj.dealCategory.targetList = this.selectionData[DEAL_CATEGORY].targetList;
    }

    return dealCategoryObj;

  }

  private getDefaultAudienceStrDTOObject() {
    return {
      customSegmentTargeting: false,
      targetedSegmentsOperator: this.audienceTargetOperator,
      targetedSegments: [],
      blockedSegmentsOperator: this.audienceBlockOperator,
      blockedSegments: []
    };
  }

  private setCustomSegmentTargeting(audience: AudienceStrDTO) {
    if (audience) {
      if ((audience.targetedSegments && audience.targetedSegments.length > 0) ||
        (audience.blockedSegments && audience.blockedSegments.length > 0)) {
        audience.customSegmentTargeting = true;
      }
      return audience;
    }
  }


  validate(): boolean {
    const isValid: boolean = (this.isBulkEdit) ? this.isFormValidForBulkEdit() : this.isFormValid();
    if (isValid) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
    }
    return isValid;
  }

  //REVX-724 : audience can not be added for SKAD Strategies
  hideAudienceSection(): boolean {

    // if (this.isBulkEdit && !this.openFromCampaignDetails) {
    //   return true;
    // }
    if (this.skadSettings && this.skadSettings.SKAD_CAMPAIGN) {
      let app = (this.skadSettings.SKAD_CAMPAIGN.AUDIENCE_TARGETING && this.skadSettings.SKAD_CAMPAIGN.AUDIENCE_TARGETING.APP_AUDIENCE) ? true : false;
      let web = (this.skadSettings.SKAD_CAMPAIGN.AUDIENCE_TARGETING && this.skadSettings.SKAD_CAMPAIGN.AUDIENCE_TARGETING.WEB_AUDIENCE) ? true : false;
      let dmp = (this.skadSettings.SKAD_CAMPAIGN.AUDIENCE_TARGETING && this.skadSettings.SKAD_CAMPAIGN.AUDIENCE_TARGETING.DMP_AUDIENCE) ? true : false;
      return (!app && !web && !dmp) ? true : false;
    } else {
      return false;
    }
  }


  //revx-371 : bulk edit
  setBulkEditParams() {
    let requiredParams = this.bulkEditService.getBulkEditSettings(this.SCONST.STEP_TITLE_TARGETING);

    if (requiredParams && requiredParams["geo"]) {
      this.geo = requiredParams["geo"];
    }
    if (requiredParams && requiredParams["audience"]) {
      this.audience = requiredParams["audience"];
    }
    if (requiredParams && requiredParams["days"]) {
      this.days = requiredParams["days"];
    }
    if (requiredParams && requiredParams["os"]) {
      this.os = requiredParams["os"];
    }
    if (requiredParams && requiredParams["deal"]) {
      this.deal = requiredParams["deal"];
    }


  }




  //revx-371 : bulk edit
  getHideBelowCreativePlacement() {
    if (this.isBulkEdit) {
      return false;
    } else {
      return this.hideBelowCreativePlacement;
    }
  }



  updateBulkEditSelection() {
    if (this.isBulkEdit) {
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.GEO, this.geo.selectedBulkEditOpt);
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.AUDIENCE, this.audience.selectedBulkEditOpt);
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.DEAL, this.deal.selectedBulkEditOpt);
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.DAYS, this.days.selectedBulkEditOpt);
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.OS, this.os.selectedBulkEditOpt);
    }
  }

  isFormValidForBulkEdit() {

    //audience validation : cannot select all audience with replace option
    this.error.audience = { hasError: false, msg: '' };
    if (this.audience.selectedBulkEditOpt === this.SCONST.REPLACE) {
      const isAudienceValid = this.isAudienceDetailsValid();
      if (!isAudienceValid) {
        this.error.audience = {
          hasError: true, msg: `All Audience not allowed with Replace option. Atleast one specific Audience has to be selected to proceed.`
        };
      }
    }


    if (this.days.selectedBulkEditOpt !== this.SCONST.NO_CHANGE) {
      this.dayPartValidation();
    }

    if (this.os.selectedBulkEditOpt !== this.SCONST.NO_CHANGE) {
      this.osValidation();
    }

    return this.errorExists();
  }


  dayPartValidation() {
    const dayPart = this.formatDayParts(this.dayparts);
    if (dayPart === null || dayPart === undefined || !Array.isArray(dayPart) || dayPart.length <= 0) {
      this.error.daypart = { hasError: true, msg: 'Day part has not been selected. Please select to proceed.' };
    } else {
      this.error.daypart = { hasError: false, msg: '' };
    }
  }

  osValidation() {
    const osList = this.mobileOSOptions.filter(item => item.checked);
    this.error.os = (osList.length === 0) ? { hasError: true, msg: 'Atleast one Mobile Operating System has to be chosen.' } :
      { hasError: false, msg: '' };
  }


  errorExists() {
    const errorList = Object.keys(this.error).filter(key => this.error[key].hasError);
    if (errorList.length > 0) {
      this.strService.scrollToError();
    }
    return (errorList.length > 0) ? false : true;
  }



  isToBeHidden(bulkEditId) {
    if (this.isBulkEdit) {
      if (bulkEditId === 0) {
        return this.geo.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      } else if (bulkEditId === 1) {
        return this.audience.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      } else if (bulkEditId === 2) {
        return this.days.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      } else if (bulkEditId === 3) {
        return this.os.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      } else if (bulkEditId === 4) {
        return this.deal.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
      }
      return false;
    }
    return false;

  }

}
