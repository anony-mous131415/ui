import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService, EventFromPreview } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { CreativeDTO, DcoAttributesDTO, NativeAssetPojo } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CrAssociationModalComponent } from '../_modals/cr-association-modal/cr-association-modal.component';
import { CrCreateRespModalComponent } from '../_modals/cr-create-resp-modal/cr-create-resp-modal.component';
import { CrVerifyModalComponent } from '../_modals/cr-verify-modal/cr-verify-modal.component';

// import { AlertService } from '@app/shared/_services/alert.service.js';

@Component({
  selector: 'app-cr-create-preview-form',
  templateUrl: './cr-create-preview-form.component.html',
  styleUrls: ['./cr-create-preview-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrCreatePreviewFormComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  @ViewChild('mySelect', null) mySelect;

  @Input() isDCO: string;
  @Input() rawCreativesJSONStr: string;
  @Input() advertiserId: string;
  @Input() prevStepId: number;


  @Output() syncCreativeDTOs: EventEmitter<EventFromPreview> = new EventEmitter();
  isDynamic: boolean;
  crConst = CreativeConstants;
  appConst = AppConstants;
  toggle: any = {
    nativeChecked: true,
    nonNativeChecked: true,
    nativeImgChecked: true,
    nativeVideoChecked: true,
    nonNativeImgChecked: true,
    nonNativeVideoChecked: true,
    nonNativeHtmlChecked: true
  };

  errorMsg: any = {
    nativeSectionError: '',
    nonNativeSectionError: '',
    verifyError: '',
    globalError: ''
  };

  verification: any = {
    nonNative: false, 
    dynamicHtml: false
  };

  // creativeMockups: any = (data as any).default;
  // creativeDto = {} as CreativeDTO;
  creativeMockups: Array<CreativeDTO> = [];
  formValidated = true;

  native = {} as NativeAssetPojo;
  nativeStr = '';

  dcoAttributes = {} as DcoAttributesDTO;

  creativeUIPreview: any = {
    nativeImageList: [],
    nativeVideoList: [],
    nonNativeImageList: [],
    nonNativeVideoList: [],
    nonNativeHTMLList: []
  };

  nonNativeImageList: string;
  nonNativeVideoList: string;
  nonNativeHTMLList: string;
  nativeImageList: string;
  nativeVideoList: string;

  errorMessage: string;
  // dcoCreativeUIPreview = {
  //   nativeImageList: [],
  //   nonNativeHTMLList: []
  // };

  dcoMacros = [];

  constructor(
    // private crService: CreativeService
    private modal: MatDialog,
    private crService: CreativeService,
    private advService: AdvertiserService,
    // private alertService: AlertService
  ) { }

  ngOnInit() {
    this.initializePreviewData();

    if (this.isDCO.toLowerCase() === 'true') {
      this.getDCOMacros(this.advertiserId);
    }
  }

  initializePreviewData() {
    if (this.rawCreativesJSONStr) {
      this.creativeMockups = JSON.parse(this.rawCreativesJSONStr);
      // console.log('this.creativeMockups ', this.creativeMockups);
    } else {
      // show error
      return;
    }


    if (this.isDCO) {
      // console.log('isDCO ', this.isDCO);
      this.isDynamic = (this.isDCO === 'true' || this.isDCO === 'TRUE');
    }
    // console.log('isDCO ', this.isDCO);
    // console.log('creativeUIPreview ', this.creativeUIPreview);
    this.convertCreativeMockupListToUIPreviewObj();
  }

  syncUpdatedCreative(creative: CreativeDTO) {
    this.creativeMockups.forEach(cr => {
      // console.log('id', cr.id, creative.id, creative);
      if (cr.id === creative.id) {
        cr.size = creative.size;
      }
    });
    // console.log('this. creativemockups ', this.creativeMockups);
  }

  syncRemovalOfCreative(creativeId: number) {
    const crId = Number(creativeId);
    this.creativeMockups = this.creativeMockups.filter((obj) => {
      // console.log('crId ', crId);
      return obj.id !== crId;
    });

    this.convertCreativeMockupListToUIPreviewObj();
  }

  // TODO: Need to change it
  syncToggle(obj: any) {
    // console.log(' obj', obj);
    if (obj.nativeAd) {
      if (obj.cardType === CreativeConstants.ALLOWED_TYPES.IMAGE && obj.selected) {
        this.toggle.nativeImgChecked = true;
      } else if (obj.cardType === CreativeConstants.ALLOWED_TYPES.IMAGE && obj.selected === false) {
        this.toggle.nativeImgChecked = false;
      }

      if (obj.cardType === CreativeConstants.ALLOWED_TYPES.VIDEO && obj.selected) {
        this.toggle.nativeVideoChecked = true;
      } else if (obj.cardType === CreativeConstants.ALLOWED_TYPES.VIDEO && !obj.selected) {
        this.toggle.nativeVideoChecked = false;
      }
    } else {
      if (obj.cardType === CreativeConstants.ALLOWED_TYPES.IMAGE && obj.selected) {
        this.toggle.nonNativeImgChecked = true;
      } else if (obj.cardType === CreativeConstants.ALLOWED_TYPES.IMAGE && !obj.selected) {
        this.toggle.nonNativeImgChecked = false;
      }

      if (obj.cardType === CreativeConstants.ALLOWED_TYPES.VIDEO && obj.selected) {
        this.toggle.nonNativeVideoChecked = true;
      } else if (obj.cardType === CreativeConstants.ALLOWED_TYPES.VIDEO && !obj.selected) {
        this.toggle.nonNativeVideoChecked = false;
      }

      if (obj.cardType === CreativeConstants.ALLOWED_TYPES.HTML && obj.selected) {
        this.toggle.nonNativeHtmlChecked = true;
      } else if (obj.cardType === CreativeConstants.ALLOWED_TYPES.HTML && !obj.selected) {
        this.toggle.nonNativeHtmlChecked = false;
      }
    }

    // console.log('toggle ', this.toggle);
  }
  // watch and destroy creative preview object

  convertCreativeMockupListToUIPreviewObj() {
    const mockupList = this.creativeMockups;

    this.creativeUIPreview = {
      nativeImageList: [],
      nativeVideoList: [],
      nonNativeImageList: [],
      nonNativeVideoList: [],
      nonNativeHTMLList: []
    };

    for (const i in mockupList) {
      // if (mockupList[i].dco === false) {
      if (mockupList[i].nativeAd === false) {
        if (mockupList[i].type === CreativeConstants.ALLOWED_TYPES.IMAGE) {
          this.creativeUIPreview.nonNativeImageList.push(mockupList[i]);
          this.nonNativeImageList = JSON.stringify(this.creativeUIPreview.nonNativeImageList);
        } else if (mockupList[i].type === CreativeConstants.ALLOWED_TYPES.VIDEO) {
          this.creativeUIPreview.nonNativeVideoList.push(mockupList[i]);
          this.nonNativeVideoList = JSON.stringify(this.creativeUIPreview.nonNativeVideoList);
        } else if (mockupList[i].type === CreativeConstants.ALLOWED_TYPES.HTML) {
          this.creativeUIPreview.nonNativeHTMLList.push(mockupList[i]);
          this.nonNativeHTMLList = JSON.stringify(this.creativeUIPreview.nonNativeHTMLList);
        } 
      } else {
        if (!mockupList[i].videoAttributes) {
          this.creativeUIPreview.nativeImageList.push(mockupList[i]);
          this.nativeImageList = JSON.stringify(this.creativeUIPreview.nativeImageList);
        } else if (mockupList[i].videoAttributes) {
          this.creativeUIPreview.nativeVideoList.push(mockupList[i]);
          this.nativeVideoList = JSON.stringify(this.creativeUIPreview.nativeVideoList);
        }
      }
      // }
      //  else {
      //   if (mockupList[i].native === false) {
      //     if (mockupList[i].type === 'html') {
      //       this.dcoCreativeUIPreview.nonNativeHTMLList.push(mockupList[i]);
      //     }
      //   } else {
      //     if (mockupList[i].type === 'html') {
      //       this.dcoCreativeUIPreview.nativeImageList.push(mockupList[i]);
      //     }
      //   }
      // }
    }

    if (this.creativeUIPreview.nonNativeImageList.length === 0 &&
      this.creativeUIPreview.nonNativeVideoList.length === 0 &&
      this.creativeUIPreview.nonNativeHTMLList.length === 0 &&
      this.creativeUIPreview.nativeImageList.length === 0 &&
      this.creativeUIPreview.nativeVideoList.length === 0
    ) {
      this.onGoBackClick();
    }

    // this.crService.updateCreativePreviewObj(this.creativeUIPreview);


    // console.log('creativeUIPreview', this.creativeUIPreview);
    // console.log('dcoCreativeUIPreview ', this.dcoCreativeUIPreview);
  }

  onGoBackClick() {
    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', 'The changes you have made may not be saved. Are you sure you want to continue?')
    //   .then(isConfirmed => {
    //     if (isConfirmed) {
    //       this.syncCreativeDTOs.emit(null);
    //     }
    //   })
    //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

    const msg = 'The changes you have made may not be saved. Are you sure you want to continue?';
    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      isConfirmed => {
        if (isConfirmed) {
          //revx-525
          this.syncCreativeDTOs.emit({ uploadedList: null, prevStepId: this.prevStepId });
        } else {
          console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)')
        }
      }
    );

  }

  // On create Click
  onContinueClick() {
    this.blockUI.start(CreativeConstants.BLOCKUI_SAVE_CREATIVES);
    const creativeDTOList = this.validateAndGetRawCreatives();

    if (this.formValidated === false) {
      this.blockUI.stop();
      return;
    }

    this.embedNativeAndDCOAttributes(creativeDTOList);

    this.crService.saveCreatives(creativeDTOList).subscribe(resp => {
      // this.alertService.success(CreativeConstants.SUCCESS_MSG_CREATED);
      // console.log('response', resp);
      this.openCreativeRespModal(resp.data);
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
    });

    // this.syncCreativeDTOs.emit(creativeDTOList);
  }

  openCreativeAssociateModal() {

    this.modal.open(CrAssociationModalComponent, {
      width: '80%',
      data: { advertiserId: this.advertiserId, crList: [] },
      disableClose: true
    });
    // const modalRef = this.modal.open(StrCrAssociationModalComponent, {
    //   width: '70%',
    //   data: {advertiserId: '6804', crList: []}
    // });

    // const crAssociateModalSubscription = modalRef.componentInstance.crAssociateObj.subscribe(crAssociate => {
    //   console.log('crAssociate ', crAssociate);
    //   // this.native = nativeAsset;
    //   // this.nativeStr = JSON.stringify(nativeAsset);
    //   // console.log('native ', this.native);
    //   crAssociateModalSubscription.unsubscribe();
    // });
  }

  openCreativeRespModal(crList: Array<CreativeDTO>) {
    this.modal.open(CrCreateRespModalComponent, {
      width: '60%',
      data: { advertiserId: this.advertiserId, creativeList: crList },
      disableClose: true
    });

    // const nativeAssetModalSubscription = modalRef.componentInstance.nativeAssetObj.subscribe(nativeAsset => {
    //   this.native = nativeAsset;
    //   this.nativeStr = JSON.stringify(nativeAsset);
    //   // console.log('native ', this.native);
    //   nativeAssetModalSubscription.unsubscribe();
    // });
  }


  validateAndGetRawCreatives() {
    this.formValidated = true;

    let checkNativeAsset = false;
    let checkDCOAttributes = false;
    let checkCreativeVerification = false;
    let checkTemplateCreativeVerification = false;
    this.errorMsg = {
      nativeSectionError: '',
      nonNativeSectionError: '',
      verifyError: '',
      globalError: ''
    };

    const creativeDTOList: Array<CreativeDTO> = [];

    const nc = this.toggle.nativeChecked;
    const nnc = this.toggle.nonNativeChecked;

    const nvc = this.toggle.nativeVideoChecked;
    const nvl = this.creativeUIPreview.nativeVideoList.length;

    const nic = this.toggle.nativeImgChecked;
    const nil = this.creativeUIPreview.nativeImageList.length;

    const nnvc = this.toggle.nonNativeVideoChecked;
    const nnvl = this.creativeUIPreview.nonNativeVideoList.length;

    const nnic = this.toggle.nonNativeImgChecked;
    const nnil = this.creativeUIPreview.nonNativeImageList.length;

    const nnhc = this.toggle.nonNativeHtmlChecked;
    const nnhl = this.creativeUIPreview.nonNativeHTMLList.length;

    // If native is checked
    if (nc === true) {
      if (nvc === true && nvl > 0) {
        this.mergeArray(creativeDTOList, this.creativeUIPreview.nativeVideoList);
        checkNativeAsset = true;
      }

      if (nic === true && nil > 0) {
        this.mergeArray(creativeDTOList, this.creativeUIPreview.nativeImageList);
        checkNativeAsset = true;
      }
    }

    // If non native is checked
    if (nnc === true) {
      if (nnvc === true && nnvl > 0) {
        this.mergeArray(creativeDTOList, this.creativeUIPreview.nonNativeVideoList);
      }

      if (nnic === true && nnil > 0) {
        this.mergeArray(creativeDTOList, this.creativeUIPreview.nonNativeImageList);
        // checkCreativeVerification = true;
      }

      if (nnhc === true && nnhl > 0) {
        this.mergeArray(creativeDTOList, this.creativeUIPreview.nonNativeHTMLList);
        checkCreativeVerification = this.isDynamic;
        if (this.isDynamic) {
          // checkDCOAttributes = true;
        }
      }

    }

    // checking all creatives are unchecked
    if (creativeDTOList.length === 0) {
      this.errorMsg.globalError = CreativeConstants.ERROR_MSG_NO_CREATIVES;
      this.formValidated = false;
    }

    // Checking for Native Assets
    if (checkNativeAsset === true) {
      if (!this.isNativeAssetFilled()) {
        this.errorMsg.nativeSectionError = CreativeConstants.ERROR_MSG_NATIVE_ASSET_MISSING;
        this.errorMsg.globalError = CreativeConstants.ERROR_MSG_NATIVE_ASSET_MISSING;
        this.formValidated = false;
      }
    }

    // Checking for Creative Verification
    if (checkCreativeVerification) {
      if (this.verification.nonNative === false) {
        this.errorMsg.nonNativeSectionError = CreativeConstants.ERROR_MSG_NON_NATIVE_VERIFY;
        this.errorMsg.globalError = CreativeConstants.ERROR_MSG_NON_NATIVE_VERIFY;
        this.formValidated = false;
      }
    }

    if(checkTemplateCreativeVerification) {
      if(this.verification.dynamicHtml === false) {
        this.errorMsg.nonNativeSectionError = CreativeConstants.ERROR_MSG_DYNAMIC_HTML_VERIFY;
        this.errorMsg.globalError = CreativeConstants.ERROR_MSG_DYNAMIC_HTML_VERIFY;
        this.formValidated = false;
      }
    }

    // Checking for the DCO attributes
    // if (checkDCOAttributes === true) {
    //   if (!this.dcoAttributes.macroList || !this.dcoAttributes.noOfSlots) {
    //     this.errorMsg.nonNativeSectionError = CreativeConstants.ERROR_MSG_DCO_ATTR;
    //     this.errorMsg.globalError = CreativeConstants.ERROR_MSG_DCO_ATTR;
    //     this.formValidated = false;
    //   }
    // }

    // checking the dimesions of NON native HTML is being updated or not
    this.creativeUIPreview.nonNativeHTMLList.forEach(creative => {
      if (!creative.size.height || !creative.size.width) {
        this.formValidated = false;
        this.errorMsg.globalError = CreativeConstants.ERROR_MSG_HTML_DIMENSION_MISSING;
      }
    });

    // // checking the dimesions of native image is being updated or not
    // this.creativeUIPreview.nativeImageList.forEach(creative => {
    //   if (!creative.size.height || !creative.size.width) {
    //     this.formValidated = false;
    //     this.errorMsg.globalError = CreativeConstants.ERROR_MSG_NATIVE_IMG_DIMENSION_MISSING;
    //   }
    // });

    // checking the dimesions of NON native image is being updated or not
    this.creativeUIPreview.nonNativeImageList.forEach(creative => {
      if (!creative.size.height || !creative.size.width) {
        this.formValidated = false;
        this.errorMsg.globalError = CreativeConstants.ERROR_MSG_NON_NATIVE_IMG_DIMENSION_MISSING;
      }
    });

    // checking the dimesions of NON native HTML is being updated or not
    // this.creativeUIPreview.nonNativeHTMLList.forEach(creative => {
    //   if (!creative.size.height || !creative.size.width) {
    //     this.formValidated = false;
    //     this.errorMsg.globalError = CreativeConstants.ERROR_MSG_HTML_DIMENSION_MISSING;
    //   }
    // });

    // If native and non native both are unchecked
    if (nc === false && nnc === false) {
      this.errorMsg.globalError = CreativeConstants.ERROR_MSG_NO_CREATIVES;
      this.formValidated = false;
    }

    return creativeDTOList;
  }

  embedNativeAndDCOAttributes(rawCreativeList: Array<CreativeDTO>) {
    rawCreativeList.forEach(cr => {
      // console.log('cr ', cr);

      if (cr.type === CreativeConstants.ALLOWED_TYPES.NATIVE_IMAGE || cr.type === CreativeConstants.ALLOWED_TYPES.NATIVE_VIDEO) {
        cr.nativeAsset = this.native;
      }

      // if (cr.type === CreativeConstants.ALLOWED_TYPES.HTML && this.isDynamic === true) {
      //   cr.dcoAttributes = this.dcoAttributes;
      // }
    });

    // console.log('creatives ', rawCreativeList);
  }

  mergeArray(parentArray: Array<CreativeDTO>, childArray: Array<CreativeDTO>) {
    childArray.forEach(element => {
      if ((element.type === CreativeConstants.ALLOWED_TYPES.VIDEO || element.type === CreativeConstants.ALLOWED_TYPES.NATIVE_VIDEO)) {
        parentArray.push(element);
      } else if (!element.errorMsg) {
        parentArray.push(element);
      }
    });
  }

  syncNativeAsset(event) {
    // console.log("asfasdfs", event);
    this.native = event;
    this.nativeStr = JSON.stringify(event);
  }

  isNativeAssetFilled() {
    if (!this.native.title || !this.native.body || !this.native.callToAction || !this.native.iconurl) {
      return false;
    }
    return true;
  }

  get showNativeAssetForm() {
    if (this.native.title || this.native.body || this.native.callToAction || this.native.iconurl) {
      return true;
    }
    return false;
  }

  openVerifyModal() {
    const creative = this.creativeUIPreview.nonNativeHTMLList[0];

    const modalRef = this.modal.open(CrVerifyModalComponent, {
      width: '70%',
      data: creative,
      disableClose: true
    });

    modalRef.afterClosed().subscribe(resp => {
      // console.log('resp -- ', resp === true, resp === 'true');
      if (resp === true) {
        if(this.nonNativeHTMLList)
          this.verification.nonNative = true;
        else
          this.verification.dynamicHtml = true;
        // console.log('this.clickVerified', this.clickVerified);
      }
    });
  }

  handleMacroSelect(selectedMacro: string) {
    if (this.dcoAttributes.macroList === null || this.dcoAttributes.macroList === undefined
      || this.dcoAttributes.macroList === '') {
      this.dcoAttributes.macroList = selectedMacro;
    } else {
      this.dcoAttributes.macroList += '' + selectedMacro;
    }
  }

  getDCOMacros(advId: string) {
    const advertiserId = Number(advId);
    this.advService.getCatalogMacros(advertiserId).subscribe(resp => {
      // console.log('marcos ', resp);
      this.dcoMacros = resp.data;
    });
  }

  shouldShowClickVerifyForTemplates() {
    if(this.creativeUIPreview.nonNativeHTMLList.length > 0) {
      return this.creativeUIPreview.nonNativeHTMLList[0].dcoAd;
    }
    return false;
  }

}
