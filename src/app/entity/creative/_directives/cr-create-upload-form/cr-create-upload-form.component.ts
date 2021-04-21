import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService, EventFromUploader } from '@app/entity/creative/_services/creative.service';
import { CreativeFiles, DcoAttributesDTO, Macro } from '@revxui/api-client-ts';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
const FILE_TYPE_ZIPPED_HTML = 'zippedHTML';

@Component({
  selector: 'app-cr-create-upload-form',
  templateUrl: './cr-create-upload-form.component.html',
  styleUrls: ['./cr-create-upload-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrCreateUploadFormComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  @Input() allowedExtensions: string; // comma separated extensions
  @Input() allowedFileSizeInKB: string;
  @Input() allowedMultiple: string;
  @Input() isDCO: boolean;
  @Input() advertiserId: string;
  @Input() destinationStep: number
  @Input() isTemplateFlow: boolean = false;
  // @Output() syncUploadedFiles: EventEmitter<Array<CreativeFiles>> = new EventEmitter();
  @Output() syncUploadedFiles: EventEmitter<EventFromUploader> = new EventEmitter();

  @Output() syncDCOMacro: EventEmitter<Macro> = new EventEmitter();
  templateSizes: Array<string>=[];
  allowedFileSize: number;
  allowedMultipleFiles = true;
  isUploading = false;
  uploadedFileList: CreativeFiles[] = [];
  invalidFileList: any[] = [];
  crConst = CreativeConstants;
  formValidated = true;

  dcoMacros = [];
  DCOVariables: Macro = {};
  dv = {
    macroSelected: 0,
    macrosOptions: [{ id: 1, title: 'default_image' }, { id: 2, title: 'additional_images' }],
    errorMsg: ''
  };
  dvEnable = false;
  dcoAttributes = {} as DcoAttributesDTO;

  constructor(
    private crService: CreativeService,
    private advService: AdvertiserService,
    private modal: MatDialog,
  ) { }

  ngOnInit() {
    // console.log('adv id ', this.advertiserId);
    if (this.allowedFileSizeInKB) {
      this.allowedFileSize = Number(this.allowedFileSizeInKB) * 1024;
    }

    if (this.allowedMultiple === 'false' || this.allowedMultiple === 'FALSE') {
      this.allowedMultipleFiles = false;
    } else {
      this.allowedMultipleFiles = true;
    }

    if (this.isDCO) {
      this.getDCOMacros(this.advertiserId);
    }
    this.crService.getTemplatesMetadata(false).subscribe(resp=>{
      this.templateSizes = resp.respObject.templateSizes;
    });
  }

  // ngOnChange(changes: SimpleChanges) {
  //   console.log('changes ', changes);
  //   if (changes.allowedExtensions && changes.allowedExtensions.currentValue) {
  //     this.initialize();
  //   }
  // }

  initialize() {
    this.uploadedFileList = [];
    this.invalidFileList = [];
    this.formValidated = true;
  }

  /**
   * Method to upload files from UI
   */
  public uploadFile(files: FileList) {
    if (!files.length) {
      return;
    }
    this.isUploading = true;
    // reseting invalid file list
    this.invalidFileList = [];
    const newFileList = this.validateFiles(files);


    if (newFileList.length === 0) {
      this.isUploading = false;
      return;
    }

    let formData = new FormData();
    // tslint:disable-next-line: forin
    for (const i in newFileList) {
      formData.append('file', newFileList[i]);
    }
    this.crService.uploadFiles(formData).subscribe(resp => {
      this.pushFilesToUploadedList(resp.data);
      this.isUploading = false;
    }, error => {
      // Total size exceeded : so upload one by  one
      this.uploadFileOneByOne(newFileList);
      // this.isUploading = false;
    });

  }

  private pushFilesToUploadedList(data) {
    for (const i in data) {
      // check compatibility of files REVX-244
      const respHasError = (data[i].errorMsg !== null && data[i].errorMsg !== undefined) ? true : false;
      const isNotDCO = (this.isDCO && !data[i].dco && data[i].type !== FILE_TYPE_ZIPPED_HTML) ? true : false;
      if (respHasError || isNotDCO) {

        const errMsgDisp: string = (respHasError) ? data[i].errorMsg : this.crConst.DCO_FILE_DIMENSION_ERROR_MSG;
        const invalidFileDetails = {
          name: data[i].name,
          errorMsg: errMsgDisp
        };

        this.invalidFileList.push(invalidFileDetails);
        continue;
      }

      //check for template sizes
      let size = data[i].width+'x'+data[i].height;
      if(this.isTemplateFlow && !this.templateSizes.includes(size)) {
        const invalidFileDetails = {
          name: data[i].name,
          errorMsg: this.crConst.SIZE_DOES_NOT_MATCH_ERROR_MSG
        };
        this.invalidFileList.push(invalidFileDetails);
        continue;
      }

      // check if it is already uploaded
      let isFileUploaded = false;
      for (const f in this.uploadedFileList) {
        if (data[i].name === this.uploadedFileList[f].name &&
          data[i].contentType === this.uploadedFileList[f].contentType) {
          isFileUploaded = true;
          break;
        }
      }

      if (!isFileUploaded) {
        this.uploadedFileList.push({
          ...data[i],
          noOfSlots: null,
          macroList: null
        });
      }
    }
  }

  onContinueClick() {

    if (this.isFormValid()) {

      // handle the dco
      if (this.DCOVariables && this.DCOVariables.id) {
        this.syncDCOMacro.emit(this.DCOVariables);
        return;
      }
      this.formValidated = true;
      if (this.uploadedFileList.length === 0) {
        this.formValidated = false;
        return;
      }
      this.syncUploadedFiles.emit({ uploadedList: this.uploadedFileList, destinationStep: this.destinationStep });
    }
  }

  onGoBackClick() {
    this.syncUploadedFiles.emit(null);
  }

  // onSkipUploadClick() {
  //   this.syncUploadedFiles.emit({ uploadedList: this.uploadedFileList, destinationStep: 2 });
  // }

  public removeUploadedFiles(index: number) {
    this.uploadedFileList.splice(index, 1);
  }

  /**
   * Validate file while uploading all files..
   * Validation with the number of files
   * Validation with the size of the files
   */
  public validateFiles(files: FileList) {

    const removeValFromIndex: number[] = [];
    // check the size and type of the files
    for (let i = 0; i < files.length; i++) {

      const fileName: string = files[i].name;
      if (!fileName) {
        break;
      }
      let ext = fileName.substr(fileName.lastIndexOf('.') + 1);
      ext = ext.toLocaleLowerCase();

      let invalidFileDetails = {};
      if (this.allowedExtensions.indexOf(ext) === -1) {
        invalidFileDetails = {
          name: files[i].name,
          errorMsg: CreativeConstants.VALIDATION_MSG_FILE_TYPE
        };
        removeValFromIndex.push(Number(i));
        this.invalidFileList.push(invalidFileDetails);
      } else if (files[i].size > this.allowedFileSize) {
        invalidFileDetails = {
          name: files[i].name,
          errorMsg: CreativeConstants.VALIDATION_MSG_FILE_SIZE_5
        };
        removeValFromIndex.push(Number(i));
        this.invalidFileList.push(invalidFileDetails);
      }
    }

    const newFileList = Array.from(files);
    for (let i = removeValFromIndex.length - 1; i >= 0; i--) {
      newFileList.splice(removeValFromIndex[i], 1);
    }

    // upload only one --TODO: Need to handle it in the UI (remove the multiple from the input)
    if (!this.allowedMultipleFiles && newFileList.length > 0) {
      for (let i = newFileList.length; i >= 1; i--) {
        newFileList.splice(i, 1);
      }
    }

    return newFileList;
  }

  // Make this as pipe
  public bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 Byte';
    }
    const i = Number(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

  deleteAttachment(i: number) {
  }


  uploadFileOneByOne(fileList) {
    // tslint:disable-next-line: forin
    for (const i in fileList) {
      this.isUploading = true;
      const formData = new FormData();
      console.log(fileList[i]);
      formData.append('file', fileList[i]);
      this.crService.uploadFiles(formData).subscribe(resp => {
        // console.log('repsonse ', resp);
        this.pushFilesToUploadedList(resp.data);
        this.isUploading = false;
      }, error => {
        this.isUploading = false;
      });

    }
  }

  getDCOMacros(advId: string) {
    const advertiserId = Number(advId);

    this.advService.getCatalogMacros(advertiserId).subscribe(resp => {
      // console.log('marcos ', resp);
      this.dcoMacros = resp.data;
      this.dvEnable = true;
      this.assignDCOVariables();
    });
  }

  assignDCOVariables() {
    // tslint:disable-next-line: forin
    for (const i in this.dcoMacros) {
      const element = this.dcoMacros[i];
      // console.log('element ', element, element.macroText);
      if ((element.macroText === '__DEFAULT_IMAGE__' && this.dv.macroSelected === 1) || (element.macroText === '__ADDITIONAL_IMAGES__' && this.dv.macroSelected === 2)) {
        this.DCOVariables = element;
        this.dv.errorMsg = '';
        break;
      } else {
        this.DCOVariables = {};
      }
    }

    if (!this.DCOVariables.id) {
      if (this.dv.macroSelected === 1) {
        this.dv.errorMsg = CreativeConstants.DYNAMIC_VARIABLE_DEFAULT_IMG_ERROR;
      } else if (this.dv.macroSelected === 2) {
        this.dv.errorMsg = CreativeConstants.DYNAMIC_VARIABLE_ADD_IMG_ERROR;
      }
    }

  }

  macroSelectionHandler() {
    // console.log('selected macor', this.dv.macroSelected);
    if (this.dcoMacros && this.dcoMacros.length > 0) {
      this.assignDCOVariables();
    } else {
      this.getDCOMacros(this.advertiserId);
    }
  }

  handleMacroSelect(file: any, selectedMacro: string) {
    if (file.macroList === null || file.macroList === undefined
      || file.macroList === '') {
      file.macroList = selectedMacro;
    } else {
      file.macroList += ',' + selectedMacro;
    }
  }

  removeDCOVariables() {
    this.DCOVariables = {} as Macro;
    this.dv.macroSelected = 0;
    this.dv.errorMsg = null;
  }

  get isDocUploaded() {
    return (this.uploadedFileList === null || this.uploadedFileList === undefined || this.uploadedFileList.length === 0)
      ? false : true;
  }

  get isMacroSelected() {
    return (this.dv.macroSelected === 0) ? false : true;
  }

  isFormValid() {
    const result = this.checkUploadedFilesForZIP();
    if (this.isDCO && result.hasZippedFiles) {
      const zippedHTMLFiles = result.zippedFiles;

      if (zippedHTMLFiles.length > 0) {
        for (let index = 0; index < zippedHTMLFiles.length; index++) {
          const file: any = zippedHTMLFiles[index];
          if (!file.macroList || !file.noOfSlots) {
            this.formValidated = false;
            break;
          } else {
            this.formValidated = true;
          }
        }
      } else {
        this.formValidated = true;
      }
    } else {
      this.formValidated = true;
    }

    return this.formValidated;

  }

  private checkUploadedFilesForZIP() {
    if (this.uploadedFileList === null || this.uploadedFileList === undefined || this.uploadedFileList.length === 0) {
      return { hasZippedFiles: false, zippedFiles: [] };
    }

    const zippedHTMLFiles: CreativeFiles[] = this.uploadedFileList.filter((file: CreativeFiles) => {
      return file.type === CreativeFiles.TypeEnum.ZippedHTML;
    });

    return (zippedHTMLFiles !== null && zippedHTMLFiles.length > 0) ?
      { hasZippedFiles: true, zippedFiles: zippedHTMLFiles }
      : { hasZippedFiles: false, zippedFiles: [] };

  }

  openSupportedDimensionsModal() {
    const modalRef = this.modal.open(ConfirmationModalComponent, {
      width : '350px',
      data: {
        title: 'Supported Dimensions',
        message: '<div class="row support-dimension">'+this.templateSizes.map(item=>`<div class="col-4 support-column"><div class="support-col">${item.split("x")[0]} x ${item.split("x")[1]}</div></div>`).join('')+'</div>',
        btnOkText: 'OK',
        showOnlyOk: true
      },
    });
  }
}
