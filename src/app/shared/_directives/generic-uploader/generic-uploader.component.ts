import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { HttpClient } from '@angular/common/http';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
  selector: 'app-generic-uploader',
  templateUrl: './generic-uploader.component.html',
  styleUrls: ['./generic-uploader.component.scss']
})
export class GenericUploaderComponent implements OnInit {

  @Input() title: string;
  @Input() multipleUpload: string; // boolean field if multiple upload is allowed
  @Input() allowedExtensions: string; // comma separated extensions
  @Input() detailMessage: string;
  @Input() width: string; // global width class
  @Input() height: string; // global height class
  @Input() maxFileSizeInKB: string;
  @Input() apiPath: string;
  // @Input() fontSize: string;


  @Output() syncFileUploadResp: EventEmitter<any> = new EventEmitter();

  maxFileSize: number = 50 * 1024;
  allowedFileExtensions: any[];
  invalidFileList: any[];

  isUploading = false;
  validated = false;
  validationMsg = '';

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    if (this.allowedExtensions) {
      this.allowedExtensions = this.allowedExtensions.toLocaleLowerCase();
      this.allowedFileExtensions = this.allowedExtensions.split(',').map(resp => {
        return resp.trim();
      });
      // console.log('allowedFileExtensions ', this.allowedFileExtensions);
    }

    if (this.maxFileSizeInKB) {
      this.maxFileSize = Number(this.maxFileSizeInKB);
    }

    // if (!this.maxFileSize) {
    //   this.maxFileSize = 2048; // 2 MB by default
    // }

    if (!this.allowedFileExtensions) {
      this.allowedFileExtensions = ['png', 'jpeg', 'jpg']; // image files by default
    }

  }


  /**
   * Method to upload files from UI
   */
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

    this.commonService.uploadFiles(formData, this.apiPath)
      .subscribe(resp => {
        // console.log('repsonse ', resp);
        // return to the caller component
        this.syncFileUploadResp.emit(resp);
        this.isUploading = false;
      }, error => {
        this.isUploading = false;
      });

  }

  /**
   * Validate file while uploading all files..
   * Validation with the number of files
   * Validation with the size of the files
   */
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
          errorMsg: files[i].name + ', ' + 'Size of file should be less than ' + this.maxFileSize + ' KB'
        };
        this.invalidFileList.push(invalidFileDetails);
      }
    }
  }


}
