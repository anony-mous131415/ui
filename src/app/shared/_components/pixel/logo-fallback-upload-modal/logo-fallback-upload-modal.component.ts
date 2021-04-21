import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';
import { CreativeService } from '@app/entity/creative/_services/creative.service';

const DIMENSIONS = 'DIMENSIONS';

@Component({
  selector: 'app-logo-fallback-upload-modal',
  templateUrl: './logo-fallback-upload-modal.component.html',
  styleUrls: ['./logo-fallback-upload-modal.component.scss']
})
export class LogoFallbackUploadModalComponent implements OnInit {

  requestInProgress = false;
  isUploading = false;

  errMessages: string[] = null;

  advConst = null;
  uploadedFiles: any[] = [];
  c1Images: any[] = [];
  c2Images: any[] = [];
  c3Images: any[] = [];
  c4Images: any[] = [];

  constructor(
    private modalRef: MatDialogRef<LogoFallbackUploadModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private crService: CreativeService
  ) {
    this.advConst = AdvConstants;
  }

  get config() {
    return this.configData;
  }

  ngOnInit() {

  }

  /**
   * Method to handle closing of modal without saving the data
   */
  onCancelClick() {
    this.modalRef.close(null);
  }

  /**
   * Method to handle save and close of the modal.
   */
  onSaveClick() {
    this.modalRef.close({ config: this.configData, data: this.uploadedFiles });
  }

  getImageList(index: number) {
    switch (index) {
      case 1: return this.c1Images;
      case 2: return this.c2Images;
      case 3: return this.c3Images;
      case 4: return this.c4Images;
    }
  }

  getConfigDimensions() {
    const dimCheckRequired = (this.configData.dimensions && this.configData.dimensions.length > 0) ? true : false;
    if (dimCheckRequired) {
      return this.configData.dimensions.map(item => item.w + 'X' + item.h).join(', ');
    } else {
      return 'Any';
    }
  }

  getConfigMaxFileSize() {
    return this.configData.maxFileSize + 'KB';
  }

  /**
   * Method to handle file selection
   * @param files - upload files
   */
  uploadFile(files: FileList) {
    if (!this.configData.allowMultipleUploads) {
      this.uploadedFiles = [];
    }
    this.isUploading = true;
    this.errMessages = [];

    const validFiles: File[] = this.validateFiles(files);

    if (validFiles && validFiles.length > 0) {
      const formData = new FormData();
      validFiles.forEach((file: File) => {
        formData.append('file', file);
      });

      this.crService.uploadFiles(formData).subscribe(resp => {
        if (resp && resp.data && resp.data.length > 0) {
          const filesWithValidDimensions: any[] = this.validFileDimensions(resp.data);
          this.uploadedFiles.push(...filesWithValidDimensions.map((item, index) => {
            return { id: index, name: item.name, url: item.location, prop: this.getProperties(item) };
          }));
          this.groupImages(this.uploadedFiles);
          this.isUploading = false;
        }
      }, error => {
        // Total size exceeded : so upload one by  one
        // this.imgUploadService.uploadFilesOneByOne(validFiles);
        // this.isUploading = false;
      });
    }
  }

  onDeleteUploadedImage(image: any) {
    const index = this.uploadedFiles.findIndex(item => item.id === image.id);
    if (index !== -1) {
      this.uploadedFiles.splice(index, 1);
      this.groupImages(this.uploadedFiles);
    }
  }

  private validateFiles(files: FileList) {
    const validFiles: File[] = [];

    Object.keys(files).forEach(key => {
      const file: File = files[key];
      const isFileSizeValid = this.checkFileSize(file);
      if (!isFileSizeValid) {
        this.errMessages.push(file.name + ': ' + this.advConst.INVALID_FILE_SIZE.replace('<SIZE>', this.configData.maxFileSize + 'KB'));
      }

      const isFileTypeValid = this.checkFileType(file);
      if (!isFileTypeValid) {
        this.errMessages.push(file.name + ': ' + this.advConst.INVALID_FILE_TYPE);
      }

      if (!isFileSizeValid || !isFileTypeValid) {
        // do nothing
      } else {
        // file satisfies all validations
        validFiles.push(file);
      }

      /*
      this.checkFileDimension(file).then(isValid => {
        const isFileDimValid = isValid;
        if (!isFileDimValid) {
          this.errMessages.push(file.name + ': ' + this.advConst.INVALID_FILE_DIMENSION);
        }

        if (!isFileSizeValid || !isFileTypeValid || !isFileDimValid) {
          // do nothing
        } else {
          // file satisfies all validations
          validFiles.push(file);
        }
      });
      */

    });

    return validFiles;
  }

  private validFileDimensions(files: any[]) {
    if (files && files.length > 0) {
      const dimCheckRequired = (this.configData.dimensions && this.configData.dimensions.length > 0) ? true : false;

      if (!dimCheckRequired) {
        return files;
      } else {
        const validFiles: any[] = [];
        const reqDimensions = this.configData.dimensions.map(item => item.w + 'x' + item.h);
        files.forEach(file => {
          const currDim = file.width + 'x' + file.height;
          const isValid = (reqDimensions.indexOf(currDim) !== -1) ? true : false;
          if (isValid) {
            validFiles.push(file);
          } else {
            this.errMessages.push(file.name + ': ' + this.advConst.INVALID_FILE_DIMENSION);
          }
        });
        return validFiles;
      }
    }
  }

  private checkFileSize(file: File) {
    const fileSize = file.size / 1000;
    return fileSize <= this.configData.maxFileSize;
  }

  private checkFileType(file: File) {
    const fileType = file.type;
    const parts = fileType.split('/');
    if (parts && parts.length > 0) {
      const type = '.' + parts[parts.length - 1];
      return this.configData.extensions.indexOf(type) !== -1 ? true : false;
    }

    return false;
  }

  private checkFileDimension(file: File) {
    const promise = new Promise((res, rej) => {
      const image = new Image();
      image.src = window.URL.createObjectURL(file);
      image.onload = () => {
        const dim = image.width + 'x' + image.height;
        const isValid = this.configData.dimensions.map(item => item.w + 'x' + item.h).indexOf(dim) !== -1 ? true : false;
        res(isValid);
      };
    });
    return promise;

  }

  private getProperties(data: any) {
    return {
      DIMENSIONS: data.width + 'X' + data.height
    };
  }

  private groupImages(images: any[]) {
    this.c1Images = [];
    this.c2Images = [];
    this.c3Images = [];
    this.c4Images = [];

    images.forEach((img, idx) => {

      const index = (idx % 4) + 1;

      switch (index) {
        case 1: this.c1Images.push(img); break;
        case 2: this.c2Images.push(img); break;
        case 3: this.c3Images.push(img); break;
        case 4: this.c4Images.push(img); break;
      }
    });
  }

}
