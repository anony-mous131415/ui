import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatMenuTrigger, MAT_DIALOG_DATA, MatCheckboxChange } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { ClickDestinationConstants } from '@app/entity/advertiser/_constants/ClickDestinationConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CdConfirmationModalComponent } from '@app/shared/_directives/_modals/cd-confirmation-modal/cd-confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { ClickDestination } from '@revxui/api-client-ts';
import { cloneDeep } from 'lodash';
import { CdAutoPopulateUrls } from '@app/shared/_models/CdAutoPopulateUrls'
import { ApiResponseObjectClickDestinationAutomationUrls } from '@revxui/api-client-ts/model/apiResponseObjectClickDestinationAutomationUrls';
import { isBoolean } from 'util';




export interface ErrorIndicator {
  hasError: boolean,
  hasInfo: boolean,
  errOrInfoMsg: string,
}

export interface InjectedData {
  cd: ClickDestination,
  advertiserId: number
}

const MODE_CREATE = 0;
const MODE_EDIT = 1;

const CLICK_RADIO_ID = ClickDestination.GeneratedUrlTypeEnum.CLICK;
const S2S_RADIO_ID = ClickDestination.GeneratedUrlTypeEnum.S2S;
const SKAD_ID = ClickDestination.GeneratedUrlTypeEnum.SKAD;


const CAMP_UA = ClickDestination.CampaignTypeEnum.UA;
const CAMP_RT = ClickDestination.CampaignTypeEnum.RT;

@Component({
  selector: 'app-cd-create',
  templateUrl: './cd-create.component.html',
  styleUrls: ['./cd-create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CdCreateComponent implements OnInit {
  @ViewChild(MatMenuTrigger, { static: false }) macroListTrigger: MatMenuTrigger;
  cdConst = ClickDestinationConstants;
  appConst = AppConstants;
  mode: number = MODE_CREATE;


  isDcoOptions = [
    { id: false, label: "No" },
    { id: true, label: "Yes" }
  ];

  generateOptions = [
    { id: CLICK_RADIO_ID, label: "Click URL (No S2S)" },
    { id: S2S_RADIO_ID, label: "S2S URL(Along with Click URL)" }
  ];

  uaRtOptions = [
    { id: CAMP_UA, value: 'User Acquisition' },
    { id: CAMP_RT, value: 'Re-Targeting' }
  ];


  error: any = {
    WEB_CLICK: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    WEB_S2S: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    WEB_IMP: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    ANDRD_CLICK: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    ANDRD_S2S: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    ANDRD_IMP: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    IOS_CLICK: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    IOS_S2S: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    IOS_IMP: { hasError: false, hasInfo: false, errOrInfoMsg: null },
  }

  selMacroHeader: string;
  errScrollId: string;
  camType;
  dcoMacros: any[] = [];
  workInProgress: boolean = false;
  isMacroListAllowed: boolean;

  // these 3 are the prefilled values
  // whenever user changes radio , reset the current holder to one of these
  click_radio: CdAutoPopulateUrls;
  s2s_radio_dynamic: CdAutoPopulateUrls;
  s2s_radio_static: CdAutoPopulateUrls;
  currentUrls: CdAutoPopulateUrls = new CdAutoPopulateUrls();


  // error: ErrorIndicator[] = [];
  mandatoryValidated = true;
  optionalValidated = true;
  advPkgValidated: boolean = true;

  //REVX-724
  basicUrlTemplate: CdAutoPopulateUrls = {
    androidClick: '',
    androidS2S: '',
    iosClick: '',
    iosS2S: ''
  }

  constructor(
    private modalRef: MatDialogRef<CdCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public injectedData: InjectedData,
    private advService: AdvertiserService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private modal: MatDialog,
  ) { }


  ngOnInit() {
    // console.log(this.injectedData)
    if (!this.injectedData.cd) {
      this.injectedData.cd = {} as ClickDestination;
    }
    // console.log('cd=>', this.injectedData.cd);
    if (this.injectedData.cd) {
      this.mode = (this.injectedData.cd.id) ? MODE_EDIT : MODE_CREATE;
    }

    this.autoPopulateUrls();
    this.getDCOMacros();
    this.checkMacroListAllowed();
    // this.initerror();
  }

  getDCOMacros() {
    this.advService.getCatalogMacros(this.injectedData.cd.advertiserId).subscribe(resp => {
      this.dcoMacros = (resp && resp.data) ? resp.data : [];
      // this.prefillPageLinkMacro(this.dcoMacros);
    }, (error: any) => {
    });
  }


  cancel() {
    let dialogRef = this.modal.open(CdConfirmationModalComponent, {
      width: '40%',
      // maxHeight: '45vh',
      height: '200px',
      disableClose: false,
      data: {
        type: 0,
        modalMsg: 'WARNING: Changes that you made will not be saved.',
        saveBtnMsg: 'CONFIRM'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dismissModal();
      }
    });
  }

  convertIntoCDObject() {
    this.injectedData.cd.androidClickUrl = this.currentUrls.androidClick;
    this.injectedData.cd.androidS2sClickTrackingUrl = this.currentUrls.androidS2S;
    this.injectedData.cd.iosCLickUrl = this.currentUrls.iosClick;
    this.injectedData.cd.iosS2sClickTrackingUrl = this.currentUrls.iosS2S;
  }


  callSaveApi() {
    this.workInProgress = true;
    if (this.injectedData.cd.id) {
      this.advService.updateClickDestination(this.injectedData.cd, this.injectedData.cd.id).subscribe(resp => {
        this.showMessageAfterAction(resp, 'Click Destination updated successfully.', 'Error while updating Click Destination.')
      }, (error: any) => {
        // show error message
        // this.disableSaveBtn = false;
        this.workInProgress = false;
        this.alertService.error('Got error while updating Click Destination');
      });
    } else {
      this.advService.createClickDestination(this.injectedData.cd).subscribe(resp => {
        this.showMessageAfterAction(resp, 'Click Destination saved successfully.', 'Error while saving Click Destination.')
      }, (error: any) => {
        // show error message
        // this.disableSaveBtn = false;
        this.workInProgress = false;
        this.alertService.error('Got error while saving Click Destination');
      });
    }

  }

  get campaignType() {
    return JSON.stringify(this.uaRtOptions);
  }


  validUrlCombination() {
    //not required
    // returns true if atleast 1 click url is filled
    // if (!this.injectedData.cd.webClickUrl && !this.injectedData.cd.androidClickUrl && !this.injectedData.cd.iosCLickUrl) {
    //   return false;
    // }
    return true;
  }

  dismissModal(saved?: boolean) {
    if (saved) {
      this.modalRef.close(saved);
    }
    else {
      this.modalRef.close(null);
    }
  }

  scrollToError(errId?: string) {
    let el = (errId && errId.length > 0) ? document.getElementById(errId) : document.getElementById(this.errScrollId);
    if (el)
      el.scrollIntoView({ behavior: 'smooth' });
  }

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    this.dismissModal(true);
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);
  }


  closeMenu() {
    this.macroListTrigger.closeMenu();
  }


  //REVX-401
  resetError() {
    this.error = {
      WEB_CLICK: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      WEB_S2S: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      WEB_IMP: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      ANDRD_CLICK: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      ANDRD_S2S: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      ANDRD_IMP: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      IOS_CLICK: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      IOS_S2S: { hasError: false, hasInfo: false, errOrInfoMsg: null },
      IOS_IMP: { hasError: false, hasInfo: false, errOrInfoMsg: null },
    }
  }


  autoPopulateUrls() {
    // disable inputs
    //set currentUrls
    this.workInProgress = true;
    this.click_radio = new CdAutoPopulateUrls();
    this.s2s_radio_dynamic = new CdAutoPopulateUrls();
    this.s2s_radio_static = new CdAutoPopulateUrls();

    this.advService.getMmpBasedUrls(this.injectedData.advertiserId).subscribe((response: ApiResponseObjectClickDestinationAutomationUrls) => {

      let resp = response.respObject

      //initialize the case : click + static/dynamic-DCO
      this.click_radio.androidClick = (resp && resp.androidClickUrl) ? resp.androidClickUrl: '';
      this.click_radio.androidS2S = '';//not required to be prefilled
      this.click_radio.iosClick = (resp && resp.iosClickUrl) ? resp.iosClickUrl: '';
      this.click_radio.iosS2S = '';//not required to be prefilled

      //initialize the case : s2s + dynamic-DCO
      this.s2s_radio_dynamic.androidS2S = (resp && resp.androidS2sUrl) ? resp.androidS2sUrl: '';
      this.s2s_radio_dynamic.iosS2S = (resp && resp.iosS2sUrl) ? resp.iosS2sUrl: '';

      //REVX-515 : dynamic s2s fallback
      this.s2s_radio_dynamic.androidClick = (resp && resp.fallBackUrlDynamic) ? resp.fallBackUrlDynamic: ''; //macros will be allwd
      this.s2s_radio_dynamic.iosClick = ''; //macros will be allwd

      //initialize the case : s2s + static-DCO
      this.s2s_radio_static.androidS2S = (resp && resp.androidS2sUrl) ? resp.androidS2sUrl: '';
      this.s2s_radio_static.iosS2S = (resp && resp.iosS2sUrl) ? resp.iosS2sUrl: '';
      this.s2s_radio_static.androidClick = (resp && resp.fallBackUrlStatic) ? resp.fallBackUrlStatic: '';
      this.s2s_radio_static.iosClick = '';

      // holder of current text boxes
      this.currentUrls.androidClick = this.nullChecker(this.injectedData.cd.androidClickUrl) ? this.injectedData.cd.androidClickUrl : '';
      this.currentUrls.androidS2S = this.nullChecker(this.injectedData.cd.androidS2sClickTrackingUrl) ? this.injectedData.cd.androidS2sClickTrackingUrl : '';
      this.currentUrls.iosClick = this.nullChecker(this.injectedData.cd.iosCLickUrl) ? this.injectedData.cd.iosCLickUrl : '';
      this.currentUrls.iosS2S = this.nullChecker(this.injectedData.cd.iosS2sClickTrackingUrl) ? this.injectedData.cd.iosS2sClickTrackingUrl : '';

      this.workInProgress = false;

    }, (error: any) => {
      this.workInProgress = false;
    });

  }


  nullChecker(value: string): boolean {
    return (this.mode === MODE_EDIT && this.injectedData.cd && value) ? true : false
  }

  onDynamicStatusChange(event: any, clickedOn: boolean) {
    //REVX-724 : if skad n/w checkbox is unchecked
    if (this.injectedData.cd.skadTarget === false) {
      event.preventDefault();
      let newVal = clickedOn;
      let oldVal = !newVal;
      if (newVal === this.injectedData.cd.dco) {
        return;
      }

      this.workInProgress = true;
      const confirmation = (this.isInitialChoice(1)) ? true : confirm(AppConstants.WARNING_MSG);

      if (confirmation) {
        this.injectedData.cd.dco = newVal;
        this.resetCurrentUrls(true, false, oldVal, newVal);
        // this.initerror();
      } else {
        this.injectedData.cd.dco = oldVal;
      }
      this.checkMacroListAllowed();
      this.workInProgress = false;
    }
  }


  onGenerateRadioChange(event: any, clickedOn: any) {
    event.preventDefault();
    let newVal = clickedOn;
    let oldVal = (newVal === CLICK_RADIO_ID) ? S2S_RADIO_ID : CLICK_RADIO_ID;
    if (newVal === this.injectedData.cd.generatedUrlType) {
      return;
    }
    this.workInProgress = true;
    const confirmation = (this.isInitialChoice(2)) ? true : confirm(AppConstants.WARNING_MSG);
    if (confirmation) {
      this.injectedData.cd.generatedUrlType = newVal;
      this.resetCurrentUrls(false, true, oldVal, newVal);
      // this.initerror();
    } else {
      this.injectedData.cd.generatedUrlType = oldVal;
    }
    this.checkMacroListAllowed();
    this.workInProgress = false;

  }


  isInitialChoice(type: number) {
    if (type === 1) {
      return (this.injectedData.cd && (this.injectedData.cd.dco === true || this.injectedData.cd.dco === false)) ? false : true;
    } else if (type === 2) {
      return (this.injectedData.cd.generatedUrlType !== CLICK_RADIO_ID && this.injectedData.cd.generatedUrlType !== S2S_RADIO_ID) ? true : false;
    }
  }

  resetCurrentUrls(isDynamicStatusRadioChange: boolean, isGeneratedRadioChange: boolean, oldVal: any, newVal: any) {
    this.injectedData.cd.webClickUrl = '';
    this.injectedData.cd.webS2sClickTrackingUrl = '';

    // impression URL reset may not be required
    this.injectedData.cd.webImpressionTracker = '';
    this.injectedData.cd.androidImpressionTracker = '';
    this.injectedData.cd.iosImpressionTracker = '';

    // when switch b/w dynamic and static 
    if (isDynamicStatusRadioChange) {
      //radio = click : no change required
      //radio = s2s : we need to reset
      if (this.injectedData.cd.generatedUrlType === S2S_RADIO_ID) {
        this.setS2SUrls(newVal);
      }
    }

    //when switch b/w click and s2s URLS
    else if (isGeneratedRadioChange) {
      if (newVal === S2S_RADIO_ID) {
        this.setS2SUrls(this.injectedData.cd.dco);
      } else if (newVal === CLICK_RADIO_ID) {
        this.setClickUrls();
      }
    }
  }



  setS2SUrls(isDynamic: boolean) {
    if (isDynamic === true) {
      this.currentUrls = cloneDeep(this.s2s_radio_dynamic);
    } else {
      this.currentUrls = cloneDeep(this.s2s_radio_static);
    }
  }


  setClickUrls() {
    this.currentUrls = cloneDeep(this.click_radio);
  }





  checkMacroListAllowed() {
    if (this.injectedData.cd.generatedUrlType === S2S_RADIO_ID && this.injectedData.cd.dco === true) {
      this.isMacroListAllowed = true;
      this.prefillPageLinkMacro();
    } else {
      this.isMacroListAllowed = false;
    }
  }


  prefillPageLinkMacro() {
    if (this.dcoMacros.length > 0 && this.mode === MODE_CREATE) {
      const pageLinkIndex = this.dcoMacros.findIndex(item => item.name === 'page_link' && item.macroText === '__PAGE_LINK__');
      const macroText = (pageLinkIndex > -1) ? this.dcoMacros[pageLinkIndex].macroText : null;
      this.injectedData.cd.webClickUrl = macroText;

      //REVX-515 : dynamic s2s fallback
      // this.currentUrls.androidClick += macroText;
      this.currentUrls.iosClick = macroText;

    }
  }

  // handleMacroSelect(type: string, selectedMacro: string) {
  //   switch (type) {
  //     case ClickDestinationConstants.TYPE.WEB:
  //       this.injectedData.cd.webClickUrl = (this.injectedData.cd.webClickUrl && this.injectedData.cd.webClickUrl.length > 0) ? this.injectedData.cd.webClickUrl.concat(selectedMacro) : selectedMacro;
  //       break;

  //     case ClickDestinationConstants.TYPE.ANDROID:
  //       this.currentUrls.androidClick = this.currentUrls.androidClick.concat(selectedMacro);
  //       break;

  //     case ClickDestinationConstants.TYPE.IOS:
  //       this.currentUrls.iosClick = this.currentUrls.iosClick.concat(selectedMacro);
  //       break;
  //   }
  // }


  isRetargetingLHS(urlPart: string): boolean {
    if (!urlPart) {
      return false;
    }
    if (urlPart.includes('is_retargeting') || urlPart.includes('retargeting')) {
      return true;
    }
    return false;
  }


  //revx-657
  isPartToBefilled(urlPart: string): boolean {
    if (!urlPart) {
      return false;
    }

    urlPart = urlPart.toLowerCase();
    let possibility1 = urlPart.includes('<fill');
    let possibility2 = urlPart.includes('fill_advertiser_related_link');
    let possibility3 = urlPart.includes('fill_campaign_id_provided_by_client')
    let possibility4 = urlPart.includes('fill_deeplink_here')
    let possibility5 = urlPart.includes('fill_encoded_deeplink_here');
    let possibility6 = urlPart.includes('fill') && urlPart.includes('here');

    if (possibility1 || possibility2 || possibility3 || possibility4 || possibility5 || possibility6) {
      return true;
    }
    return false;
  }



  //revx-657
  //returns true if atleast 1 change found
  //returns false if exactly same
  userHasFilledUrl(input: string, apiString: string): boolean {
    if (input.length && apiString.length) {
      // const hasDifference: boolean = (apiString.localeCompare(input) != 0) ? true : false;

      //revx-515
      let hasDifference: boolean = (input.includes(apiString)) ? false : true;
      return hasDifference;
    }
    return true;
  }



  /**
   * revx:657
   * @param structureUrl 
   * @param inputUrl 
   * if input has error return true
   * 
   */
  validateAdvertiserPackage(structureUrl: string, inputUrl: string): boolean {
    //revx-657 : cheked in beginnig only
    let isStructToBeFilled: boolean = this.isPartToBefilled(structureUrl);
    // type-3 : no error if advertiser link is already filled in structure url
    // example :  https://abc.xyz.com/v1/cpi/click
    if (!isStructToBeFilled) {
      return false;
    }
    let hasError = !this.userHasFilledUrl(inputUrl, structureUrl);
    return hasError;
  }


  validateSingleAutoFilledUrl(inputUrlToBeValidated: string, structuralUrl: string): ErrorIndicator {

    //checking white space
    if (inputUrlToBeValidated.indexOf(' ') > -1) {
      return { hasError: true, hasInfo: false, errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES };
    }

    let urlHasInfo = false;
    let urlErrorInfoMsg: string = null;

    // let isNumberOfQueryParamEqual = true;

    // if the urls received from api are null or empty strings
    if (!structuralUrl || !structuralUrl.length) {
      return { hasError: false, hasInfo: false, errOrInfoMsg: null };
    }

    let structureParts: string[] = structuralUrl.split('&');
    let structInitialUrl = structureParts[0].split("?");
    structureParts.splice(0, 1, structInitialUrl[0], structInitialUrl[1]);

    let inputParts: string[] = inputUrlToBeValidated.split('&');
    let inputInitialUrl = inputParts[0].split("?");
    let tmp = (inputInitialUrl.length === 2) ? inputInitialUrl[1] : '';
    inputParts.splice(0, 1, inputInitialUrl[0], tmp);


    for (let j = 0; j < structureParts.length; j++) {

      // for the first section of url , sometimes it should be filled by user , and sometimes not
      // this is related to advertiser package name and MUST BE filled
      if (j === 0) {
        let errorInAdveritserPackage: boolean = this.validateAdvertiserPackage(structureParts[0], inputParts[0]);
        if (errorInAdveritserPackage) {
          return { hasError: true, hasInfo: false, errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.ADVERTISER_PACKAGE };
        } else {
          continue;
        }
      }

      let breakStructurePart = structureParts[j].split('=');
      let structureLHS = breakStructurePart[0];
      let structureRHS = breakStructurePart[1];
      let isStructureRHSToBeFilled = this.isPartToBefilled(structureRHS);

      let isLHSFoundCheck: boolean = false;
      let isRHSProperCheck: boolean = false;
      let isStructureRT: boolean = this.isRetargetingLHS(structureLHS);

      if (isStructureRT) {
        let isCampaignRT = (this.injectedData.cd && this.injectedData.cd.campaignType === CAMP_RT) ? true : false;
        const idx = inputParts.findIndex(x => x.startsWith(structureLHS));
        let breakInputPart = (idx > -1) ? inputParts[idx].split('=') : [];

        //if campaign is RT : structureLHS and structureRHS must be there 
        if (isCampaignRT && idx !== -1 && breakInputPart.length === 2 && structureLHS === breakInputPart[0] && structureRHS === breakInputPart[1]) {
        }
        //if campaign is UA : structureLHS and structureRHS must not be there 
        else if (!isCampaignRT && idx === -1) {
        }
        else {
          urlHasInfo = true;
          urlErrorInfoMsg = ClickDestinationConstants.VALIDATION_INFO.RT_PARAM_MISSING_OR_PROVIDED;
          // console.log(errorMsg);

          //revx-657 : cannot break here , bcz error may still be there
          // break;

        }
      }

      else {
        for (let i = 0; i < inputParts.length; i++) {
          let breakInputPart = inputParts[i].split('=');
          let inputLHS = breakInputPart[0];
          let inputRHS = (breakInputPart.length === 2) ? breakInputPart[1] : '';

          isLHSFoundCheck = (structureLHS.localeCompare(inputLHS) === 0) ? true : false;
          if (isLHSFoundCheck) {

            //if RHS is to be filled  , the user must fill it (ie atleast 1 change is required)
            if (isStructureRHSToBeFilled) {
              // isRHSProperCheck = (this.isPartToBefilled(inputRHS)) ? false : true;

              //revx-657
              const userHasFilled: boolean = this.userHasFilledUrl(inputRHS, structureRHS);
              if (!userHasFilled) {
                return { hasError: true, hasInfo: false, errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.INPUT_SAME_AS_API_STRING };
              }

              //if user has filled it , it means is proper
              isRHSProperCheck = true;
            }

            // if RHS is not to be filled , then it must be same as  structure-URL-RHS
            else {
              isRHSProperCheck = (structureRHS !== inputRHS) ? false : true;
            }
            break;
          }
        }

        if (!isLHSFoundCheck) {
          urlHasInfo = true;
          urlErrorInfoMsg = ClickDestinationConstants.VALIDATION_INFO.MISSING_QUERY_PARAM;
          // console.log(errorMsg);

          //revx-657 : cannot break here , bcz error may still be there
          // break;
        }

        else if (!isRHSProperCheck) {
          urlHasInfo = true;
          urlErrorInfoMsg = ClickDestinationConstants.VALIDATION_INFO.RHS_INVALID;
          // console.log(errorMsg);

          //revx-657 : cannot break here , bcz error may still be there
          // break;
        }
      }

    }

    // return appropriate object on completion of method
    return { hasError: false, hasInfo: urlHasInfo, errOrInfoMsg: urlErrorInfoMsg };
  }

  checkAdvPkgOrWhiteSpacesError(androidUrl: string, iosUrl: string, errAndroid: ErrorIndicator, errIos: ErrorIndicator, isFallBack: boolean, fbUrl?: string, errFBUrl?: ErrorIndicator) {
    let andrdPkgError: boolean = (androidUrl && androidUrl.length && errAndroid.hasError && errAndroid.errOrInfoMsg.includes(ClickDestinationConstants.VALIDATION_MANDATORY.ADVERTISER_PACKAGE)) ? true : false;
    let iosPkgError: boolean = (iosUrl && iosUrl.length && errIos.hasError && errIos.errOrInfoMsg.includes(ClickDestinationConstants.VALIDATION_MANDATORY.ADVERTISER_PACKAGE)) ? true : false;

    let andrdSpaceError: boolean = (androidUrl && androidUrl.length && errAndroid.hasError && errAndroid.errOrInfoMsg.includes(ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES)) ? true : false;
    let iosSpaceError: boolean = (iosUrl && iosUrl.length && errIos.hasError && errIos.errOrInfoMsg.includes(ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES)) ? true : false;

    let andrdRHSError: boolean = (androidUrl && androidUrl.length && errAndroid.hasError && errAndroid.errOrInfoMsg.includes(ClickDestinationConstants.VALIDATION_MANDATORY.INPUT_SAME_AS_API_STRING)) ? true : false;
    let iosRHSError: boolean = (iosUrl && iosUrl.length && errIos.hasError && errIos.errOrInfoMsg.includes(ClickDestinationConstants.VALIDATION_MANDATORY.INPUT_SAME_AS_API_STRING)) ? true : false;


    this.advPkgValidated = (andrdPkgError || iosPkgError) ? false : true;
    this.mandatoryValidated = (this.mandatoryValidated && ((andrdSpaceError || iosSpaceError || andrdRHSError || iosRHSError) ? false : true));

    if (isFallBack) {
      let fbSpaceError: boolean = (fbUrl && fbUrl.length && errFBUrl.hasError && errFBUrl.errOrInfoMsg.includes(ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES)) ? true : false;
      this.mandatoryValidated = (this.mandatoryValidated && ((fbSpaceError) ? false : true));
    }


    //clearing un-necessary error msgs
    if (!androidUrl) {
      errAndroid.hasError = false;
      errAndroid.errOrInfoMsg = null;

    }
    if (!iosUrl) {
      errIos.hasError = false;
      errIos.errOrInfoMsg = null;

    }

  }



  validateAutoFilledUrls() {
    this.optionalValidated = true;
    // this.initerror();
    if (this.injectedData.cd.generatedUrlType === CLICK_RADIO_ID) {
      // validate android-click-url and ios-click-url
      this.error['ANDRD_CLICK'] = this.validateSingleAutoFilledUrl(this.currentUrls.androidClick, this.click_radio.androidClick);
      this.error['IOS_CLICK'] = this.validateSingleAutoFilledUrl(this.currentUrls.iosClick, this.click_radio.iosClick);
      this.checkAdvPkgOrWhiteSpacesError(this.currentUrls.androidClick, this.currentUrls.iosClick, this.error['ANDRD_CLICK'], this.error['IOS_CLICK'], false);
    }

    else if (this.injectedData.cd.generatedUrlType === S2S_RADIO_ID) {
      // validate android-s2s-url and ios-s2s-url 
      if (this.injectedData.cd.dco === true) {

        //REVX-515 : dynamic s2s fallback
        this.error['ANDRD_CLICK'] = this.validateSingleAutoFilledUrl(this.currentUrls.androidClick, this.s2s_radio_dynamic.androidClick);
        this.error['ANDRD_S2S'] = this.validateSingleAutoFilledUrl(this.currentUrls.androidS2S, this.s2s_radio_dynamic.androidS2S);
        this.error['IOS_S2S'] = this.validateSingleAutoFilledUrl(this.currentUrls.iosS2S, this.s2s_radio_dynamic.iosS2S);
      } else {
        // validate fall-back-url in android-click-url(static DCO)
        this.error['ANDRD_CLICK'] = this.validateSingleAutoFilledUrl(this.currentUrls.androidClick, this.s2s_radio_static.androidClick);
        this.error['ANDRD_S2S'] = this.validateSingleAutoFilledUrl(this.currentUrls.androidS2S, this.s2s_radio_static.androidS2S);
        this.error['IOS_S2S'] = this.validateSingleAutoFilledUrl(this.currentUrls.iosS2S, this.s2s_radio_static.iosS2S);

      }
      this.checkAdvPkgOrWhiteSpacesError(this.currentUrls.androidS2S, this.currentUrls.iosS2S, this.error['ANDRD_S2S'], this.error['IOS_S2S'], true, this.currentUrls.androidClick, this.error['ANDRD_CLICK']);
    }

    // let infoFound = (this.error.filter(x => x.hasInfo).length > 0);
    const infoFound = Object.keys(this.error).filter(key => this.error[key].hasInfo);

    this.optionalValidated = (infoFound.length > 0) ? false : true;
  }


  //REVX-724
  validateMandatory() {
    const cdConst: ClickDestination = (this.injectedData && this.injectedData.cd) ? this.injectedData.cd : {} as ClickDestination;
    //name 
    if (!cdConst.name) {
      this.errScrollId = 'page-content';
      this.mandatoryValidated = false;
      return;
    }

    //check if both radio buttons are selected
    //REVX-724
    if ((cdConst.dco !== true && cdConst.dco !== false) || (cdConst.generatedUrlType != CLICK_RADIO_ID && cdConst.generatedUrlType !== S2S_RADIO_ID && cdConst.generatedUrlType !== SKAD_ID)) {
      this.errScrollId = 'page-content';
      this.mandatoryValidated = false;
      return;
    }

    //check if campaign type UA/RT is selected
    if (cdConst.campaignType !== CAMP_UA && cdConst.campaignType !== CAMP_RT) {
      this.errScrollId = 'tag_placement';
      this.mandatoryValidated = false;
      return;
    }

    // if Click-Url is selected , then atleast 1 of the pre-populated url must be filled 
    if (this.injectedData.cd.generatedUrlType === CLICK_RADIO_ID) {
      if (this.currentUrls.androidClick.length === 0 && this.currentUrls.iosClick.length === 0) {
        this.errScrollId = 'page-content';
        this.mandatoryValidated = false;
        // this.initerror();
        this.error['ANDRD_CLICK'].hasError = true;
        this.error['IOS_CLICK'].hasError = true;
        this.error['ANDRD_CLICK'].errOrInfoMsg = ClickDestinationConstants.VALIDATION_MANDATORY.ALL_CLICK_URL_MISSING;
        this.error['IOS_CLICK'].errOrInfoMsg = ClickDestinationConstants.VALIDATION_MANDATORY.ALL_CLICK_URL_MISSING;
      }
    }

    // if S2S-url is selected , then atleast 1 of the pre-populated url must be filled 
    else if (this.injectedData.cd.generatedUrlType === S2S_RADIO_ID) {
      if (this.currentUrls.androidS2S.length === 0 && this.currentUrls.iosS2S.length === 0) {
        this.errScrollId = 'tag_placement';
        this.mandatoryValidated = false;
        // this.initerror();
        this.error['ANDRD_S2S'].hasError = true;
        this.error['IOS_S2S'].hasError = true;
        this.error['ANDRD_S2S'].errOrInfoMsg = ClickDestinationConstants.VALIDATION_MANDATORY.ALL_S2S_URL_MISSING;
        this.error['IOS_S2S'].errOrInfoMsg = ClickDestinationConstants.VALIDATION_MANDATORY.ALL_S2S_URL_MISSING;
      }
    }





  }


  //REVX-724
  onSaveClick() {

    //initialize before each round of validation
    this.mandatoryValidated = true;
    this.advPkgValidated = true;

    this.validateMandatory();
    if (!this.mandatoryValidated) {
      this.scrollToError();
      return;
    }
    this.convertIntoCDObject();

    // console.log('mandatoryValidated : ', this.mandatoryValidated);
    // console.log('advPkgValidated : ', this.advPkgValidated);
    // console.log('optionalValidated : ', this.optionalValidated);

    let scrollTo = ''
    if (this.injectedData && this.injectedData.cd && this.injectedData.cd.skadTarget) {
      scrollTo = 'page-content';
      this.validateUrlsForSKADFlow();
    } else {
      scrollTo = 'androidClickUrl';
      this.validateAutoFilledUrls();
    }

    if (!this.mandatoryValidated || !this.advPkgValidated) {
      this.scrollToError(scrollTo);
      return;
    }

    // return;

    let messageMap: Map<string, Array<string>> = this.getInfoMsgMap();
    let modalType = (messageMap && messageMap.size > 0) ? 1 : 0;
    let dispMessage = (modalType === 1) ? ClickDestinationConstants.PROMPT_ERROR : ClickDestinationConstants.PROMPT_CONFIRMATION;

    let dialogRef = this.modal.open(CdConfirmationModalComponent, {
      width: '40%',
      // maxHeight: '45vh',
      height: (modalType === 1) ? '50%' : '25%',
      disableClose: false,
      data: {
        type: modalType,
        modalMsg: dispMessage,
        saveBtnMsg: 'CONTINUE TO SAVE',
        msgMap: messageMap
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // console.log('save anyways');
        this.callSaveApi();
      }
    });

  }

  getInfoMsgMap(): Map<string, Array<string>> {

    let returnMap: Map<string, Array<string>> = new Map<string, Array<string>>();

    if (this.injectedData.cd.generatedUrlType === CLICK_RADIO_ID) {
      let key1: Array<string> = this.getInfoKey(this.click_radio.androidClick);
      let key2: Array<string> = this.getInfoKey(this.click_radio.iosClick);
      (key1 && key1.length > 0) ? returnMap.set('Android Click Url', key1) : null;
      (key2 && key2.length > 0) ? returnMap.set('Ios Click Url', key2) : null
    }

    else if (this.injectedData.cd.generatedUrlType === S2S_RADIO_ID) {

      //REVX-515 : dynamic s2s fallback
      if (this.injectedData.cd.dco === true) {
        let key1: Array<string> = this.getInfoKey(this.s2s_radio_dynamic.androidClick);
        (key1 && key1.length > 0) ? returnMap.set('Android Click Url', key1) : null;
      }

      else {
        let key1: Array<string> = this.getInfoKey(this.s2s_radio_static.androidClick);
        (key1 && key1.length > 0) ? returnMap.set('Android Click Url', key1) : null;
      }

      let key2: Array<string> = this.getInfoKey(this.s2s_radio_static.androidS2S);
      let key3: Array<string> = this.getInfoKey(this.s2s_radio_static.iosS2S);
      (key2 && key2.length > 0) ? returnMap.set('Android S2S Url', key2) : null;
      (key3 && key3.length > 0) ? returnMap.set('Ios S2S Url', key3) : null;
    }

    return returnMap;
  }

  getInfoKey(structuralUrl: string): Array<string> {

    if (!structuralUrl || !structuralUrl.length) {
      return [];
    }

    let returnArr: string[] = [];

    let parts: string[] = structuralUrl.split('&');
    let structInitialUrl = parts[0].split("?");
    parts.splice(0, 1, structInitialUrl[0], structInitialUrl[1]);

    parts.forEach((part, i) => {

      let isToBeFilled = false;
      if (i === 0) {
        isToBeFilled = this.isPartToBefilled(part);
        if (isToBeFilled) {
          let idx = (part.includes('<fill')) ? part.indexOf('<fill') : part.includes('fill') ? part.indexOf('fill') : 0;
          let subStr = part.substring(idx);
          returnArr.push(subStr);
        }
      }
      else {
        let breakStructurePart = part.split('=');
        let RHS = (breakStructurePart.length > 1) ? breakStructurePart[1] : '';
        isToBeFilled = this.isPartToBefilled(RHS);
        if (isToBeFilled) {
          returnArr.push(RHS);
        }
      }
    });
    return returnArr;
  }


  //REVX-724
  //create flow
  //add new check box , is skad here 
  //if selected : hide web and android urls also hide generate radio(s2s , click)
  //select UA and disable changes if skad is true

  //edit flow
  //cannot change checkbox state

  //REVX-724
  onSkadCbChange(event: MatCheckboxChange) {
    // console.log(event);
    if (event && event.checked) {
      this.injectedData.cd.campaignType = "UA";
      this.injectedData.cd.generatedUrlType = "SKAD";
    } else {
      this.injectedData.cd.campaignType = null;
      this.injectedData.cd.generatedUrlType = null;
    }
    this.resetAllUrls();
    this.currentUrls = cloneDeep(this.basicUrlTemplate);
  }

  //REVX-724
  resetAllUrls() {
    //all web urls
    this.injectedData.cd.webClickUrl = '';
    this.injectedData.cd.webS2sClickTrackingUrl = '';
    this.injectedData.cd.webImpressionTracker = '';

    //all android urls
    this.injectedData.cd.androidClickUrl = '';
    this.injectedData.cd.androidS2sClickTrackingUrl = '';
    this.injectedData.cd.androidImpressionTracker = '';

    //all ios urls
    this.injectedData.cd.iosCLickUrl = '';
    this.injectedData.cd.iosS2sClickTrackingUrl = '';
    this.injectedData.cd.iosImpressionTracker = '';
  }

  //REVX-724
  isSkadCheckBoxDisabled(): boolean {
    return (this.mode === MODE_EDIT) ? true : false
  }

  //REVX-724
  disableFooter(): boolean {
    let isDisabled = false;
    let isSkadSelected = (this.injectedData.cd && this.injectedData.cd.skadTarget) ? true : false;
    let noOptionsSelected: boolean = this.getDisableStatusForNoSelection(isSkadSelected);
    isDisabled = (noOptionsSelected || this.workInProgress);
    return isDisabled;
  }


  getDisableStatusForNoSelection(isSkadSelected): boolean {
    let isDcoNotSelected = (!this.injectedData.cd || !isBoolean(this.injectedData.cd.dco)) ? true : false;
    let isGenerateNotSelected = (this.injectedData.cd.generatedUrlType === undefined || this.injectedData.cd.generatedUrlType === null) ? true : false;

    if (isSkadSelected) {
      return isDcoNotSelected;
    } else {
      return isDcoNotSelected || isGenerateNotSelected;
    }
  }

  getFooterMessage() {
    if (this.injectedData.cd && this.injectedData.cd.skadTarget) {
      return ClickDestinationConstants.SAVE_BTN_TOOLTIP_SKAD;
    } else {
      return ClickDestinationConstants.SAVE_BTN_TOOLTIP;
    }
  }


  validateUrlsForSKADFlow() {
    let isValid: boolean = false;

    //atleast 1 url must be filled
    if (this.injectedData.cd.iosCLickUrl.length > 0 || this.injectedData.cd.iosS2sClickTrackingUrl.length > 0 || this.injectedData.cd.iosImpressionTracker.length) {
      isValid = true;
      this.resetError();
    } else {
      isValid = false;
      this.error['IOS_CLICK'].hasError = this.error['IOS_S2S'].hasError = this.error['IOS_IMP'].hasError = true;
      this.error['IOS_CLICK'].errOrInfoMsg = this.error['IOS_S2S'].errOrInfoMsg = this.error['IOS_IMP'].errOrInfoMsg = ClickDestinationConstants.VALIDATION_MANDATORY.SKAD_NO_URLS;
    }
    this.mandatoryValidated = (this.mandatoryValidated && isValid);
  }



}