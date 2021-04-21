import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService, EventFromUploader, EventFromPreview } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ComponentCanDeactivate } from '@app/shared/_guard/pending-changes.guard';
import { CommonService } from '@app/shared/_services/common.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import {
  BaseModel,
  CreativeDetails,
  CreativeDTO,
  CreativeFiles,
  CreativeHtmlFile,
  CreativeHtmlMockupDTO,
  CreativeMockUpsDTO,
  CreativeTemplateDTO,
  CreativeThirdPartyAdTag,
  Macro,
  NativeAssetPojo,
  Size,
  TemplateThemeDTO,
  TemplateVariablesDTO
} from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';





@Component({
  selector: 'app-creative-create',
  templateUrl: './creative-create.component.html',
  styleUrls: ['./creative-create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreativeCreateComponent implements OnInit, ComponentCanDeactivate {
  saveClicked: boolean; //to disable propmt on saving
  @BlockUI() blockUI: NgBlockUI;

  breadcrumbs: string;
  crConst = CreativeConstants;
  step = 0;

  // step = 2;

  selectedTemplates: Array<CreativeTemplateDTO> = [];
  appConst = AppConstants;
  templates: Array<CreativeTemplateDTO>=[];
  allTemplateVariables : Array<TemplateVariablesDTO>;
  allTemplateThemes: Array<TemplateThemeDTO>;
  uploadedImagesLocations: Array<any> = [];
  sizeFilter: Array<any> = [];
  currencyList: Array<any> = [];
  slots: number;
  crObj = {
    isDCO: false,
    showUploadSection: CreativeConstants.UPLOAD_SECTION,
    allowedExtensions: CreativeConstants.ALLOWED_EXTENSIONS,
    allowedFileSizeInKB: 10240, // 2 MB
    // allowedFileSizeInKB : 102400000
    assetTypeSelected: -1,
    templateSelected: -1,
    templateOption: false

  };

  crBasicDetails = {} as CreativeDetails;
  rawCreativesJSONStr: string;

  onCreativeCreateCancel() {
    this.router.navigate(['creative']);
    // this.location.back();
  }

  syncBasicDetails(emittedObject: any) {

    this.crBasicDetails = cloneDeep(emittedObject.basicDetails);
    this.crObj.assetTypeSelected = emittedObject.assetAndTemplateDetails.assetTypeSelected;
    this.crObj.templateSelected = emittedObject.assetAndTemplateDetails.templateSelected;

    if (this.crBasicDetails.isDCO) {
      this.crObj.showUploadSection = CreativeConstants.UPLOAD_DCO_SECTION;
      this.crObj.allowedExtensions = CreativeConstants.ALLOWED_DCO_EXTENSIONS;
    } else if(this.isTemplateFlow()){
      this.crObj.allowedExtensions = CreativeConstants.ALLOWED_IMAGE_FILE_EXTENSIONS;
    } else {
      this.crObj.allowedExtensions = CreativeConstants.ALLOWED_EXTENSIONS;
    }
    // else if (this.crObj.showUploadSection === CreativeConstants.UPLOAD_SECTION) {
    //   this.crObj.showUploadSection = CreativeConstants.UPLOAD_SECTION;
    //   this.crObj.allowedExtensions = CreativeConstants.ALLOWED_EXTENSIONS;
    // }
    this.crObj.templateOption = emittedObject.templateOption;
    this.crObj.isDCO = this.crBasicDetails.isDCO;
    if(this.isDynamicTemplateFlow()) {
      this.setStep(CreativeConstants.STEP.TEMPLATE_SELECT);
    } else {
      this.setStep(CreativeConstants.STEP.UPLOAD_FILES);
    }
  }

  getMockNativeDCOCreativeDTO(dcoVariables: Macro) {
    const creativeDTO: CreativeDTO = {};
    const advertiser: BaseModel = {};
    const nativeAsset: NativeAssetPojo = {};
    const size: Size = {};
    size.width = 0;
    size.height = 0;
    advertiser.id = this.crBasicDetails.advertiserId;
    advertiser.name = 'adv name';
    creativeDTO.name = this.crBasicDetails.name + 'Native DCO';
    creativeDTO.advertiser = advertiser;
    creativeDTO.clickDestination = this.crBasicDetails.clickDestination;
    creativeDTO.dcoAd = true;
    creativeDTO.nativeAd = true;
    creativeDTO.refactored = true;
    creativeDTO.previewUrl = dcoVariables.samples[0]
    creativeDTO.urlPath = dcoVariables.macroText;
    creativeDTO.active = true;
    creativeDTO.contentType = CreativeDTO.ContentTypeEnum.JPG;
    creativeDTO.type = CreativeDTO.TypeEnum.NativeAd;
    creativeDTO.errorMsg = '';
    creativeDTO.nativeAsset = nativeAsset;
    creativeDTO.id = this.commonService.getUID();
    creativeDTO.size = size;

    return creativeDTO;
  }

  syncDCOMacro(dcoVariables: Macro) {
    const creativeDTO = this.getMockNativeDCOCreativeDTO(dcoVariables);
    const creativeDTOList = [];
    creativeDTOList.push(creativeDTO);
    this.rawCreativesJSONStr = JSON.stringify(creativeDTOList);
    this.setStep(CreativeConstants.STEP.PREVIEW);
  }

  syncUploadedFiles(event: EventFromUploader) {
    if (event && event.uploadedList) {

      // if (uploadedList.length === 0 && this.crBasicDetails.isDCO === true) {
      //   const creativeDTO = this.getMockNativeDCOCreativeDTO();
      //   const creativeDTOList = [];
      //   creativeDTOList.push(creativeDTO);
      //   this.rawCreativesJSONStr = JSON.stringify(creativeDTOList);
      //   this.setStep();
      // } else {
      // call the mockups
      // console.log('uploaded List ', uploadedList);
      const mockupDTO: CreativeMockUpsDTO = {};
      mockupDTO.basicDetails = this.crBasicDetails;
      mockupDTO.uploadedFiles = event.uploadedList;
      this.slots = event.uploadedList.length;
      if(this.isTemplateFlow()){        
        this.saveClicked = true;
        this.setStep(event.destinationStep);
        this.crService.saveProductImages(mockupDTO).subscribe(resp=> {
          let result = resp.respObject;
          this.sizeFilter =[];
          this.uploadedImagesLocations = [];
          result.map(item=>{
            this.uploadedImagesLocations.push({location:item.filePath,height:item.height,width:item.width});
            this.sizeFilter.push(item.width+'x'+item.height);
          });
          this.uploadedImagesLocations = [...this.uploadedImagesLocations];
        });
      } else {
        this.blockUI.start(CreativeConstants.BLOCKUI_GEN_CREATIVES);
        this.crService.generateRawCreatives(mockupDTO).subscribe(resp => {
          // console.log('resp ', resp);
          this.blockUI.stop();
          if (resp && resp.data) {
            resp.data.forEach(element => {
              element.id = this.commonService.getUID();
            });
            this.setStep(event.destinationStep);
            this.saveClicked = true;
            // console.log('this. step ', this.step);
            this.rawCreativesJSONStr = JSON.stringify(resp.data);
          } else {
            // show resp.error
            this.blockUI.stop();
          }
        }, error => {
          this.saveClicked = false;
          this.blockUI.stop();
        });
      }

      // }

    } else {
      // this.crObj.showUploadSection = '';
      // this.prevStep();
      this.setStep(CreativeConstants.STEP.BASIC_DETAILS);
    }

  }

  syncTpAdTag(adTag: string) {
    if (adTag) {
      const thirdPartyAdTagObj = {} as CreativeThirdPartyAdTag;
      thirdPartyAdTagObj.adTag = adTag;
      thirdPartyAdTagObj.basicDetails = this.crBasicDetails;

      this.crService.uploadThirdPartyAdTag(thirdPartyAdTagObj).subscribe(resp => {
        if (resp && resp.respObject) {
          const creativeArray = [] as Array<CreativeDTO>;
          creativeArray.push(resp.respObject);
          this.rawCreativesJSONStr = JSON.stringify(creativeArray);
          this.setStep(CreativeConstants.STEP.PREVIEW);
          this.saveClicked = true;
        }
      }, error => {

      });
      // console.log('creatrive ', adTag);
    } else {
      // this.prevStep();
      this.setStep(CreativeConstants.STEP.BASIC_DETAILS);
    }
  }

  syncCreativeDTOs(event: EventFromPreview) {
    // this.saveClicked = true;
    // add basic details in the CreativesDTOs
    // call the save creatives

    if (event && event.uploadedList) {
      // create creatives
      // go to creative list page on success
      // else show error
    } else {
      this.rawCreativesJSONStr = '';
      // this.prevStep();
      this.setStep(event.prevStepId);
    }
    // console.log('creativeList List ', creativeList);

  }

  onAssetTypeChange(showSection: string) {
    // console.log(showSection);
    this.crObj.showUploadSection = showSection;
  }

  // onDcoSelect(isDCO: boolean) {
  //   if (isDCO) {
  //     this.crObj.showUploadSection = CreativeConstants.UPLOAD_DCO_SECTION;
  //     this.crObj.isDco = true;
  //     this.crObj.allowedExtensions = CreativeConstants.ALLOWED_DCO_EXTENSIONS;
  //   } else {
  //     this.crObj.allowedExtensions = CreativeConstants.ALLOWED_EXTENSIONS;
  //   }
  // }

  @HostListener('window:beforeunload', [])
  canDeactivate(): Observable<boolean> | boolean {
    if (this.saveClicked)
      return true
    return false;
  }

  constructor(
    private crService: CreativeService,
    private commonService: CommonService,
    private router: Router,
    private entitiesService: EntitiesService,
    private route: ActivatedRoute
  ) { }


  setStep(index: number) {
    this.step = index;
  }

  ngOnInit() {
    this.saveClicked = false;
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      // console.log(params.get('id'))
      if (id && !isNaN(Number(id))) {
        this.getDetailsById(Number(id));
      } 
    });
  }
  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }


  //REVX-525
  getPreviewStepNumber() {
    if (this.crObj.assetTypeSelected === CreativeConstants.ASSETS_UI_ENUM.TEMPLATE && this.crObj.templateSelected == CreativeConstants.TEMPLATE_UI_ENUM.MANUAL) {
      return 5;
    }
    else if(this.isDynamicTemplateFlow()) {
      return 4;
    }
    return 3;
  }


  isTemplateFlow() {
    return (this.crObj.assetTypeSelected === CreativeConstants.ASSETS_UI_ENUM.TEMPLATE && this.crObj.templateSelected === CreativeConstants.TEMPLATE_UI_ENUM.MANUAL);
    // return true;
  }

  isDynamicTemplateFlow() {
    return this.crObj.isDCO === true && this.crObj.templateOption === true;
  }

  syncTemplateSelection(event: any) {

    if (event && event.step === CreativeConstants.STEP.TEMPLATE_CUSTOMIZE) {
      this.selectedTemplates = event.selectedTemplates;
      this.setStep(event.step);
    } else if(this.isDynamicTemplateFlow()) {
      this.setStep(CreativeConstants.STEP.BASIC_DETAILS);
    } else {
      this.setStep(CreativeConstants.STEP.UPLOAD_FILES);
    }

  }


  syncTemplateCustomization(event: any) {
    if (event && event.step === CreativeConstants.STEP.PREVIEW) {
      // this.selectedTemplates = event.selectedTemplates;
      let creativeHtmlFiles: Array<CreativeHtmlFile>=[];
      this.selectedTemplates.map(item=>{
        let creativeHtmlFile: CreativeHtmlFile = {};
        creativeHtmlFile.htmlContent = item.htmlContent;
        creativeHtmlFile.height = item.height;
        creativeHtmlFile.macroList = item.macros;
        creativeHtmlFile.noOfSlots = item.slots;
        creativeHtmlFile.width = item.width;
        creativeHtmlFile.type = CreativeHtmlFile.TypeEnum.ZippedHTML;
        creativeHtmlFile.dynamicItemList = item.dynamicItemList;
        creativeHtmlFile.dco = item.isDynamic;
        creativeHtmlFiles.push(creativeHtmlFile);
      });
      let mockupDTO: CreativeHtmlMockupDTO = {};
      mockupDTO.basicDetails = this.crBasicDetails;
      mockupDTO.creativeHtmlFiles=creativeHtmlFiles;

      this.blockUI.start(CreativeConstants.BLOCKUI_GEN_CREATIVES);
      this.crService.createHtmlMockupsUsingPOST(mockupDTO).subscribe(resp => {
        this.blockUI.stop();
        if (resp && resp.data) {
          resp.data.forEach(element => {
            element.id = this.commonService.getUID();
          });
          this.saveClicked = true;
          // console.log('this. step ', this.step);
          this.rawCreativesJSONStr = JSON.stringify(resp.data);
        } else {
          // show resp.error
          this.blockUI.stop();
        }
      }, error => {
        this.saveClicked = false;
        this.blockUI.stop();
      });
      this.setStep(event.step);      
    } else {
      this.setStep(CreativeConstants.STEP.TEMPLATE_SELECT);
    }

  }
}
