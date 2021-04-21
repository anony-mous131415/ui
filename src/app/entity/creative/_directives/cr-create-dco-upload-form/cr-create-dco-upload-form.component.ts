import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { CreativeDetails } from '@revxui/api-client-ts';

@Component({
  selector: 'app-cr-create-dco-upload-form',
  templateUrl: './cr-create-dco-upload-form.component.html',
  styleUrls: ['./cr-create-dco-upload-form.component.scss']
})
export class CrCreateDcoUploadFormComponent implements OnInit {

  @Input() apiPath: string;
  @Input() multipleUpload: string; // boolean field if multiple upload is allowed
  @Output() syncFileUploadResp: EventEmitter<any> = new EventEmitter();
  @Input() maxFileSizeInKB: string;


  crConst = CreativeConstants;
  crBasicDetails = {} as CreativeDetails;


  maxFileSize: number;
  allowedFileExtensions: any[];
  invalidFileList: any[];

  isUploading = false;
  validated = false;
  validationMsg = '';


  constructor(
    private commonService: CommonService

  ) { }

  ngOnInit() {
  }

  public uploadFile(files?: FileList) {
    // console.log(files);
    this.isUploading = true;
    // reseting invalid file list
    this.invalidFileList = [];

    this.validateFiles(files);

    // console.log('this.invalidFileList ', this.invalidFileList);

    if (this.invalidFileList.length > 0) {
      this.isUploading = false;
      return;
    }

    const formData = new FormData();
    // tslint:disable-next-line: forin
    for (const i in files) {
      formData.append('file', files[i]);
    }
    this.commonService.uploadFiles(formData, this.apiPath).subscribe(resp => {
      // console.log('repsonse ', resp);
      // return to the caller component
      this.syncFileUploadResp.emit(resp);
      this.isUploading = false;
    }, error => {
      this.isUploading = false;
    });
  }


  public validateFiles(files: FileList) {
    let invalidFileDetails = {};

    if (!this.multipleUpload && files.length > 1) {
      invalidFileDetails = {
        errorMsg: 'You can not upload multiple files'
      };
      this.invalidFileList.push(invalidFileDetails);
      return;
    }
    // checking the size and type of the files
    // tslint:disable-next-line: forin
    for (const i in files) {
      const fileName: string = files[i].name;
      if (!fileName) {
        break;
      }
      let ext = fileName.substr(fileName.lastIndexOf('.') + 1);
      ext = ext.toLocaleLowerCase();
      if (this.allowedFileExtensions.indexOf(ext) === -1) {
        invalidFileDetails = {
          name: files[i].name,
          errorMsg: files[i].name + ', ' + 'This type of file is not allowed'
        };
        this.invalidFileList.push(invalidFileDetails);
      } else if (files[i].size > this.maxFileSize * 1024) {
        invalidFileDetails = {
          name: files[i].name,
          errorMsg: files[i].name + ', ' + 'Size of file should be less than ' + this.maxFileSizeInKB + 'KB'
        };
        this.invalidFileList.push(invalidFileDetails);
      }
    }
  }


}
