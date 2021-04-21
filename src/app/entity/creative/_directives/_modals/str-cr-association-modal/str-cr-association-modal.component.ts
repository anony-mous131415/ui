import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { CreativeDetails, CreativeDTO, CreativeFiles, CreativeMockUpsDTO } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CrPreviewModalComponent } from '../cr-preview-modal/cr-preview-modal.component';

@Component({
  selector: 'app-str-cr-association-modal',
  templateUrl: './str-cr-association-modal.component.html',
  styleUrls: ['./str-cr-association-modal.component.scss']
})
export class StrCrAssociationModalComponent implements OnInit {
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

  // UI vairables
  crObj = {
    uploderTitle: 'Upload',
    allowedExtensions: '',
    allowedMultiple: '',
    allowedFileSizeInKB: 5000 // 5 MB
  };
  showUploader = false;

  constructor(
    private commonService: CommonService,
    private crService: CreativeService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: MatDialog,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
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
        if (this.creative.nativeAsset) {
          this.nativeAssetString = JSON.stringify(this.creative.nativeAsset);
        }
        this.handleBreadcrumbs(this.creative);
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

  }

  removeIcon() {

  }

  syncFileUploadResp(event) {

  }

  validateBasicDetails() {
    if (!this.creative.name) {
      this.formValidated = false;
      this.errorMsg = CreativeConstants.VALIDATION_NAME;
    }
  }

  validateDcoAttributes() {

  }

  validateNativeAttributes() {

  }

  validateVideoCreative() {

  }

  validateImageCreative() {

    //validate size of image

  }

  syncNativeAsset(event) {
    this.creative.nativeAsset = event;
    // console.log("asfasdfs", event);
  }

  validateThirdPartyAdTagForm() {
    if (!this.creative.content) {
      this.formValidated = false;
      this.errorMsg = CreativeConstants.VALIDATION_TP_URL;
    }
  }

  updateCreative() {
    this.formValidated = true;
    this.errorMsg = '';


    this.validateBasicDetails();

    if (this.creative.type === CreativeConstants.ALLOWED_TYPES.AD_TAG) {
      this.validateThirdPartyAdTagForm();
    }

    if (this.formValidated !== true) {
      return;
    }

    this.blockUI.start(CreativeConstants.BLOCKUI_UPDATE_CREATIVES);

    this.crService.updateCreative(this.creative).subscribe(resp => {
      if (resp.respObject) {
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

  syncUploadedFiles(uploadedList: Array<CreativeFiles>) {
    const crBasicDetails = {} as CreativeDetails;
    crBasicDetails.isDCO = this.creative.dcoAd;
    crBasicDetails.name = this.creative.name;
    crBasicDetails.advertiserId = this.creative.advertiser.id;
    crBasicDetails.clickDestination = this.creative.clickDestination;

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


}
