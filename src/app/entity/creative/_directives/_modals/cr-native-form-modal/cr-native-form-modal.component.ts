import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CreativeFiles } from '@revxui/api-client-ts';

@Component({
  selector: 'app-cr-native-form-modal',
  templateUrl: './cr-native-form-modal.component.html',
  styleUrls: ['./cr-native-form-modal.component.scss']
})
export class CrNativeFormModalComponent implements OnInit {

  @Output() nativeAssetObj: EventEmitter<any> = new EventEmitter();

  crConst = CreativeConstants;
  appConst = AppConstants;
  native: any = {
    title: '',
    body: '',
    callToAction: '',
    icon: ''
  };

  iconDetails: CreativeFiles;
  invalidIconMeassge: string;

  selectedCallToAction: any;

  globalError: string;
  formValidated = true;
  isUploading: boolean = false;


  constructor(
    private modalRef: MatDialogRef<CrNativeFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit() {
    this.native = this.data;
  }

  onDoneClick() {

    if (this.selectedCallToAction) {
      this.native.callToAction = this.selectedCallToAction.name;
    }

    this.validateForm();

    if (!this.formValidated) {
      return;
    }

    this.nativeAssetObj.emit(this.native);
    this.modalRef.close(null);
  }

  cancel() {
    this.modalRef.close(null);
  }

  syncFileUploadResp(fileUploadResp: any) {

    this.invalidIconMeassge = '';

    if (fileUploadResp && fileUploadResp.data) {
      this.iconDetails = fileUploadResp.data[0];
      this.invalidIconMeassge = fileUploadResp.data[0].errorMsg;

      if (!this.invalidIconMeassge) {
        if (fileUploadResp.data[0].width !== 300 || fileUploadResp.data[0].height !== 300) {
          this.invalidIconMeassge = CreativeConstants.VALIDATION_ICON_DIMENSION;
          return;
        }
      }

      this.native.icon = fileUploadResp.data[0].location;
    }
    // console.log('fileupload response native form ', fileUploadResp);
  }

  validateForm() {

    this.invalidIconMeassge = '';
    this.formValidated = true;

    if (!this.native.title) {
      this.formValidated = false;
    }

    if (!this.native.body) {
      this.formValidated = false;
    }

    if (!this.native.callToAction) {
      this.formValidated = false;
    }

    if (!this.native.icon) {
      this.formValidated = false;
      this.invalidIconMeassge = CreativeConstants.VALIDATION_ICON;
    }
    // console.log('testlfsdf ', this.crConst.VALIDATION_ICON, this.invalidIconMeassge);

  }

  removeIcon() {
    this.native.icon = '';
  }

}
