import { Overlay } from '@angular/cdk/overlay';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CdSelectModalComponent } from '@app/shared/_directives/_modals/cd-select-modal/cd-select-modal.component';
import { ComponentCanDeactivate } from '@app/shared/_guard/pending-changes.guard';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  CreativeDetails,
  CreativeDTO,
  CreativeFiles,
  CreativeMockUpsDTO,
  CreativeTemplateDTO,
  Macro,
  TemplateThemeDTO,
  TemplateVariablesDTO
} from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { CrTemplateCustomizationComponent } from '../../_directives/cr-template-customization/cr-template-customization.component';
import { CrPreviewModalComponent } from '../../_directives/_modals/cr-preview-modal/cr-preview-modal.component';


@Component({
  selector: 'app-creative-edit',
  templateUrl: './creative-edit.component.html',
  styleUrls: ['./creative-edit.component.scss']
})
export class CreativeEditComponent implements OnInit, ComponentCanDeactivate {
  saveClicked: boolean; //to disable propmt on saving

  @BlockUI() blockUI: NgBlockUI;
  breadcrumbs: string;
  appConst = AppConstants;
  crConst = CreativeConstants;
  showProgressBar = false;
  creativeId: number;
  formValidated = true;
  errorMsg = '';
  // creative = {} as CreativeDTO;
  creative = {} as CreativeDTO;
  selectedCallToAction: any;
  native: any;
  invalidIconMeassge: boolean = false;
  isUploading: boolean = false;

  nativeAssetString: string;
  dynamicItemList: any;
  // UI vairables
  crObj = {
    uploderTitle: 'Upload',
    allowedExtensions: '',
    allowedMultiple: '',
    allowedFileSizeInKB: 5000 // 5 MB
  };
  showUploader = false;
  checkSize: boolean = false;

  dcoMacros = [];
  DCOVariables: Macro = {};
  dv = {
    macroSelected: 0,
    macrosOptions: [{ id: 1, title: 'default_image' }, { id: 2, title: 'additional_images' }],
    errorMsg: ''
  };

  allTemplateVariables : Array<TemplateVariablesDTO> = [];
  allTemplateThemes: Array<TemplateThemeDTO> = [];
  basicDetails = {} as CreativeDetails;
  selectedTemplates: Array<CreativeTemplateDTO> = [];
  
  @HostListener('window:beforeunload', [])
  canDeactivate(): Observable<boolean> | boolean {
    if (this.saveClicked)
      return true
    return false;
  }
  constructor(
    private commonService: CommonService,
    private crService: CreativeService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: MatDialog,
    private alertService: AlertService,
    private overlay: Overlay,
    private advService: AdvertiserService,
    private menuService: MenucrumbsService,
    readonly modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.saveClicked = false;
    this.route.paramMap.subscribe(params => {
      const cid = params.get('cid');
      // console.log(params.get('id'))
      if (cid && !isNaN(Number(cid))) {
        this.creativeId = Number(cid);
        this.getCreativeDetails();
      } else {
        // show error
        this.router.navigate(['']);
      }

    });

  }

  getCreativeDetails() {
    this.showProgressBar = true;
    this.crService.getCreative(this.creativeId).subscribe(resp => {
      if (resp && resp.respObject) {
        // console.log('resp ', resp);
        this.creative = resp.respObject;
        this.crService.setSelectedCD(this.creative.clickDestination);//for radio of selected CD
        if (this.creative.nativeAsset) {
          this.nativeAssetString = JSON.stringify(this.creative.nativeAsset);
        }
        if (this.creative.size && this.creative.size.height && this.creative.size.width) {
          this.checkSize = true;
        }
        if(this.creative.type === CreativeConstants.ALLOWED_TYPES.HTML && this.creative.templateBased) {
          this.crService.getCreativeTemplateVariables().subscribe(resp => {
            let temp = resp.respObject;
            let invalidVariables = ['width','height'];
            temp = temp.filter(item => !invalidVariables.includes(item.variableKey));
            this.allTemplateVariables = temp;
          });
          this.crService.getTemplateThemesUsingGET(this.creative.advertiserId).subscribe(resp => {
            this.allTemplateThemes = resp.respObject;
          });
          let templateDto: CreativeTemplateDTO = {};
          templateDto.htmlContent = resp.respObject.content;
          templateDto.height = resp.respObject.size.height;
          templateDto.width = resp.respObject.size.width;
          this.dynamicItemList = resp.respObject.dynamicItemList;
          this.selectedTemplates = [templateDto];
        }
        this.handleBreadcrumbs(this.creative);
        this.handleSelectedMacro();
      } else {
        // show error
      }
      this.showProgressBar = false;
    }, catchError => {
      this.showProgressBar = false;
    });
  }

  handleBreadcrumbs(cr?: CreativeDTO) {
    const breadcrumbsObj = { creative: { id: cr.id, name: cr.name } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  showPreviewModal(creativeDTO: CreativeDTO) {
    this.modal.open(CrPreviewModalComponent, {
      width: '50%',
      data: { creative: creativeDTO, nativeAsset: {} }
    });
  }

  showClickDestinationModal() {
    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    // TODO: Need to change the advertiser Id
    const modalRef = this.modal.open(CdSelectModalComponent, {
      width: '70%',
      data: { advertiserId: this.creative.advertiser.id, clickDestination: this.creative.clickDestination },
      autoFocus: false,
      scrollStrategy
    });

    const clickDestinationModalSubscription = modalRef.componentInstance.syncSelectedCD.subscribe(clickDestination => {
      // console.log('final cd selected ', clickDestination);
      this.creative.clickDestination = clickDestination;
      this.crService.setSelectedCD(clickDestination);
      clickDestinationModalSubscription.unsubscribe();
    });

  }

  removeIcon() {

  }

  syncFileUploadResp(event) {

  }

  validateBasicDetails() {
    this.formValidated = true;
    if (!this.creative.name) {
      this.formValidated = false;
      // console.log('cr-name missing');
      this.errorMsg = CreativeConstants.VALIDATION_NAME;
    }

    if (this.checkSize) {
      if (!this.creative.size.width || !this.creative.size.height) {
        this.formValidated = false;
        // console.log('dimension missing');
        this.errorMsg = CreativeConstants.VALIDATION_NAME;
      }
    }


  }

  validateDcoAttributes() {
    if (!this.creative.dcoAttributes.noOfSlots) {
      this.formValidated = false;
      // console.log('#slots missing');
      this.errorMsg = CreativeConstants.VALIDATION_DCO_NUM_SLOTS;
      return;
    }

    if (!this.creative.dcoAttributes.macroList) {
      this.formValidated = false;
      // console.log('macro-list missing');
      this.errorMsg = CreativeConstants.VALIDATION_DCO_MACRO_LIST;
      return;
    }

  }

  validateNativeAttributes() {
    this.errorMsg = '';
    if (!this.creative.nativeAsset.title || this.creative.nativeAsset.title.length > 25) {
      this.formValidated = false;
      // console.log('native-title missing');
      this.errorMsg = CreativeConstants.VALIDATION_NATIVE_TITLE;
      return;
    }

    if (!this.creative.nativeAsset.body || this.creative.nativeAsset.body.length > 90) {
      this.formValidated = false;
      // console.log('native-body missing');
      this.errorMsg = CreativeConstants.VALIDATION_NATIVE_BODY;
      return;
    }

    //revx-646 validation on length
    if (!this.creative.nativeAsset.callToAction || this.creative.nativeAsset.callToAction.length > 150) {
      this.formValidated = false;
      // console.log('native-call-action missing');
      this.errorMsg = CreativeConstants.NATIVE_CALLTOACTION;
      return;
    }

    if (!this.creative.nativeAsset.iconurl) {
      this.formValidated = false;
      // console.log('native-icon url missing');
      this.errorMsg = CreativeConstants.VALIDATION_ICON;
      return;
    }

  }

  validateVideoCreative() {
  }

  validateImageCreative() {
    //validate size of image
  }

  syncNativeAsset(event) {
    this.creative.nativeAsset = event;
    // console.log("NATIVE==>", this.creative.nativeAsset);
  }

  validateThirdPartyAdTagForm() {
    if (!this.creative.content) {
      this.formValidated = false;
      // console.log('HTML content missing');
      this.errorMsg = CreativeConstants.VALIDATION_TP_URL;
    }
  }

  updateCreative() {
    this.formValidated = true;
    this.errorMsg = '';
    // console.log(this.creative);

    this.validateBasicDetails();

    if (this.creative.dcoAd === true && this.creative.type === CreativeConstants.ALLOWED_TYPES.HTML && this.formValidated) {
      this.validateDcoAttributes();
    }

    if (this.creative.nativeAd && this.formValidated) {
      this.validateNativeAttributes();
    }

    if ((this.creative.type === CreativeConstants.ALLOWED_TYPES.HTML || this.creative.type === CreativeConstants.ALLOWED_TYPES.AD_TAG) && this.formValidated) {
      this.validateThirdPartyAdTagForm();
    }

    // if ((this.creative.type == CreativeConstants.ALLOWED_TYPES.IMAGE || this.creative.type == CreativeConstants.ALLOWED_TYPES.NATIVE_IMAGE) && this.formValidated) {
    //   this.validateImageCreative();
    // }
    // if ((this.creative.type == CreativeConstants.ALLOWED_TYPES.VIDEO || this.creative.type == CreativeConstants.ALLOWED_TYPES.NATIVE_VIDEO) && this.formValidated) {
    //   this.validateVideoCreative();
    // }

    if (this.formValidated !== true) {
      return;
    }

    this.blockUI.start(CreativeConstants.BLOCKUI_UPDATE_CREATIVES);

    this.saveClicked = true;
    if(this.creative.dcoAd)
      this.creative.content = this.creative.content.replace("|DYNAMIC|NOENCODING|", this.creative.dynamicItemList);
    this.crService.updateCreative(this.creative).subscribe(resp => {
      if (resp.respObject) {
        this.menuService.invalidateMenucrumbsData();
        this.router.navigate([AppConstants.URL_CREATIVES + '/details/' + resp.respObject.id]);
        this.alertService.success(CreativeConstants.SUCCESS_MSG_UPDATE, true);
      } else {
        this.alertService.error(CreativeConstants.FAILED_MSG_UPDATE, true);
      }
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
    });
  }

  toggleUploader() {
    this.showUploader = !this.showUploader;
    this.updateCrObj();
  }

  updateCrObj() {
    switch (this.creative.type) {
      case CreativeConstants.ALLOWED_TYPES.IMAGE:
        this.crObj.allowedMultiple = 'false';
        this.crObj.allowedExtensions = 'jpg, jpeg, png, gif';
        this.crObj.allowedFileSizeInKB = 5000;
        this.crObj.uploderTitle = 'Upload only 1 image file';
        break;
      case CreativeConstants.ALLOWED_TYPES.NATIVE_IMAGE:
        this.crObj.allowedMultiple = 'false';
        this.crObj.allowedExtensions = 'jpg, jpeg, png, gif';
        this.crObj.allowedFileSizeInKB = 5000;
        this.crObj.uploderTitle = 'Upload only 1 image file';
        break;
      case CreativeConstants.ALLOWED_TYPES.VIDEO:
        this.crObj.allowedMultiple = 'true';
        this.crObj.allowedExtensions = 'flv, mp4, 3gp, mov, webm, dash, hls, jpg, jpeg, png';
        this.crObj.allowedFileSizeInKB = 5000;
        this.crObj.uploderTitle = 'Upload video and the end card';
        break;
      case CreativeConstants.ALLOWED_TYPES.NATIVE_VIDEO:
        this.crObj.allowedMultiple = 'true';
        this.crObj.allowedExtensions = 'flv, mp4, 3gp, mov, webm, dash, hls, jpg, jpeg, png';
        this.crObj.allowedFileSizeInKB = 5000;
        this.crObj.uploderTitle = 'Upload video and the end card having the aspect ratio 1:1, 16:9 or 9:16';
        break;
    }
  }

  syncUploadedFiles(event) {
    const uploadedList: Array<CreativeFiles> = event.uploadedList;
    const crBasicDetails = {} as CreativeDetails;
    crBasicDetails.isDCO = this.creative.dcoAd;
    crBasicDetails.name = this.creative.name;
    crBasicDetails.advertiserId = this.creative.advertiser.id;
    crBasicDetails.clickDestination = this.creative.clickDestination;
    this.basicDetails = crBasicDetails;
    if (uploadedList) {
      // call the mockups
      // console.log('uploaded List ', uploadedList);

      const mockupDTO: CreativeMockUpsDTO = {};
      mockupDTO.basicDetails = crBasicDetails;
      mockupDTO.uploadedFiles = uploadedList;

      this.crService.generateRawCreatives(mockupDTO).subscribe(resp => {
        // console.log('resp ', resp);
        if (resp && resp.data) {
          this.filterUploadedFiles(resp.data);
        } else {
          this.formValidated = false;
          // show resp.error
          this.errorMsg = 'Error happend while uploading the file. Please upload again.';
        }

      });

    } else {
      // this.crObj.showUploadSection = '';
      // this.prevStep();
      this.toggleUploader();
    }

  }

  filterUploadedFiles(resp) {
    let uploadedCreative = {} as CreativeDTO;
    let validCreative = 0;
    resp.forEach(element => {
      if (element.type === this.creative.type) {
        uploadedCreative = element;
        validCreative++;
      }
      // filter the coresponding type of creative
      // if not in the list show the error
    });

    if (validCreative !== 0) {
      if (this.creative.type === CreativeConstants.ALLOWED_TYPES.IMAGE ||
        this.creative.type === CreativeConstants.ALLOWED_TYPES.NATIVE_IMAGE) {
        this.creative.urlPath = uploadedCreative.urlPath;
        this.creative.previewUrl = uploadedCreative.previewUrl;
      }

      if (this.creative.type === CreativeConstants.ALLOWED_TYPES.VIDEO ||
        this.creative.type === CreativeConstants.ALLOWED_TYPES.NATIVE_VIDEO) {
        this.creative.urlPath = uploadedCreative.urlPath;
        this.creative.previewUrl = uploadedCreative.previewUrl;
        this.creative.videoAttributes = uploadedCreative.videoAttributes;
        this.creative.videoUploadType = uploadedCreative.videoUploadType;
        this.creative.content = '';
      }
      this.formValidated = true;
      this.errorMsg = '';
      this.toggleUploader();
    } else {
      this.formValidated = false;
      this.errorMsg = 'Invalid file(s) uploaded to update the creative. Please upload another valid file.';
    }
  }

  getDCOMacros(advertiserId: number) {
    this.advService.getCatalogMacros(advertiserId).subscribe(resp => {
      // console.log('marcos ', resp);
      this.dcoMacros = resp.data;
      this.assignDCOVariables();
    });
  }

  macroSelectionHandler() {
    // console.log('selected macor', this.dv.macroSelected);
    if (this.dcoMacros && this.dcoMacros.length > 0) {
      this.assignDCOVariables();
    } else {
      this.getDCOMacros(this.creative.advertiser.id);
    }
  }

  assignDCOVariables() {
    // tslint:disable-next-line: forin
    for (const i in this.dcoMacros) {
      const element = this.dcoMacros[i];
      // console.log('element ', element, element.macroText);
      if ((element.macroText === '__DEFAULT_IMAGE__' && this.dv.macroSelected === 1) || (element.macroText === '__ADDITIONAL_IMAGES__' && this.dv.macroSelected === 2)) {
        this.DCOVariables = element;
        this.creative.urlPath = element.macroText;
        this.creative.previewUrl = element.samples[0];
        this.dv.errorMsg = '';
        break;
      } else {
        this.DCOVariables = {};
      }
    }

    if (!this.DCOVariables.id) {
      if (this.dv.macroSelected === 1) {
        this.dv.errorMsg = CreativeConstants.DYNAMIC_VARIABLE_DEFAULT_IMG_ERROR;
      } else {
        this.dv.errorMsg = CreativeConstants.DYNAMIC_VARIABLE_ADD_IMG_ERROR;
      }
    }

  }

  handleSelectedMacro() {
    if (this.creative.urlPath === '__DEFAULT_IMAGE__') {
      this.dv.macroSelected = 1;
      this.macroSelectionHandler();
    }

    if (this.creative.urlPath === '__ADDITIONAL_IMAGES__') {
      this.dv.macroSelected = 2;
      this.macroSelectionHandler();
    }
  }

  gotoAdv() {
    //goto  : advertiser/details/:id
    this.router.navigate(['advertiser', 'details', this.creative.advertiser.id]);
  }

  syncTemplateCustomization(templateVariableValues) {
    const start = this.creative.content.indexOf('/*##JSON_START##*/');
    const end = this.creative.content.indexOf('/*##JSON_END##*/');
    let data = this.creative.content.substring(start+18,end);
    data = data.replace(this.crConst.REMOVE_COMMENTS_IN_JSON_REGEX, (m, g) => g ? "" : m);
    try{
      JSON.parse(data);
    }
    catch(e){
      data = escape(data);
      let n = data.lastIndexOf('%2C')
      data = data.slice(0,n)+data.slice(n).replace('%2C','');
    }
    data = unescape(data);
    const styleObj = JSON.parse(data);
    Object.keys(templateVariableValues).map(key=>{
      styleObj[key] = templateVariableValues[key] !== "" ? templateVariableValues[key] : styleObj[key];
    })
    const newStyle = JSON.stringify(styleObj);
    this.creative.content = this.creative.content.substring(0, start) + '/*##JSON_START##*/' + newStyle + this.creative.content.substring(end, this.creative.content.length);
  }

  openCustomizeModal() {
    let modalOptions: NgbModalOptions = {};
    modalOptions.centered = true;
    modalOptions.size = 'xl';
    modalOptions.backdrop = 'static';
    modalOptions.keyboard = false;
    const modal: NgbModalRef = this.modalService.open(CrTemplateCustomizationComponent, modalOptions);
    if(this.creative.dcoAd) {
      this.selectedTemplates[0].htmlContent = this.selectedTemplates[0].htmlContent.replace("|DYNAMIC|NOENCODING|",this.dynamicItemList);
    }
    modal.componentInstance.selectedTemplates = [...this.selectedTemplates];
    modal.componentInstance.allTemplateVariables = this.allTemplateVariables;
    modal.componentInstance.crBasicDetails = {};
    modal.componentInstance.crBasicDetails.advertiserId = this.creative.advertiserId;
    modal.componentInstance.allTemplateThemes = this.allTemplateThemes;
    modal.componentInstance.edit = true;
    modal.result.then(result => {
      if(result)
        this.syncTemplateCustomization(result);
      else
        this.selectedTemplates[0].htmlContent = this.creative.content;
    })
  }

  showTemplateType(creative) {
    if(creative.type === CreativeConstants.ALLOWED_TYPES.HTML && creative.templateBased) {
      return (creative.dcoAd ? '(Template-DCO)' : '(Template)');
    }
    return '';
  }

}
