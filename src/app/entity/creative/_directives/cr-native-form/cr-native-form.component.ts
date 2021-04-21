import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { CreativeFiles, NativeAssetPojo, AppSettingsControllerService, ApiResponseObjectListAppSettingsDTO, AppSettingsDTO } from '@revxui/api-client-ts';
import { AppConstants } from '../../../../shared/_constants/AppConstants';
import { MatDialog } from '@angular/material';
import { ImageGridModalComponent } from '@app/shared/_directives/_modals/image-grid-modal/image-grid-modal.component';

const MODE_CREATE = 0;
const MODE_EDIT = 1;



@Component({
  selector: 'app-cr-native-form',
  templateUrl: './cr-native-form.component.html',
  styleUrls: ['./cr-native-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrNativeFormComponent implements OnInit {

  @Output() syncNativeAsset: EventEmitter<NativeAssetPojo> = new EventEmitter();
  @Input() nativeAsset: string;
  @Input() advId: string;
  @Input() isDCO: string;


  //REVX-974 : preselect default logo
  @Input() mode: number;


  @ViewChild('macroListTrigger', { static: false }) macroListTrigger;

  /** control for the selected list */
  public listCtrl: FormControl = new FormControl();

  crConst = CreativeConstants;
  appConst = AppConstants;
  native = {} as NativeAssetPojo;

  iconDetails: CreativeFiles;
  invalidIconMeassge: string;

  selectedCallToAction: any;
  customCallToAction: string;
  showCustomTextInput = false;

  globalError: string;
  formValidated = true;
  isUploading = false;

  dcoMacros = [];
  callToActionList = [];
  isDynamic = false;

  constructor(
    // private modalRef: MatDialogRef<CrNativeFormComponent>,
    // @Inject(MAT_DIALOG_DATA) private data: any
    private advService: AdvertiserService,
    private commonService: CommonService,
    public modal: MatDialog,
    private appSettingService: AppSettingsControllerService,

  ) { }

  ngOnInit() {
    if (this.isDCO) {
      this.isDynamic = (this.isDCO === 'true' || this.isDCO === 'TRUE');
    }

    if (this.isDynamic) {
      this.getDCOMacros();
    }
    this.getCallToAction();

    //REVX-974 : preselect default logo
    if (this.mode === MODE_CREATE) {
      this.selectDefaultLogo();
    }

  }

  getDCOMacros() {
    const advertiserId = Number(this.advId);
    this.advService.getCatalogMacros(advertiserId).subscribe(resp => {
      // console.log('marcos ', resp);
      this.dcoMacros = resp.data;
    });
  }

  onClickInput() {
    this.macroListTrigger.openMenu();
  }

  handleMacroSelect(id, selectedMacro: string) {
    // console.log('event ', id, selectedMacro);
    if (id === 1) {
      if (!this.native.title) {
        this.native.title = selectedMacro;
      } else {
        this.native.title += '' + selectedMacro;
      }
    } else if (id === 2) {
      if (!this.native.body) {
        this.native.body = selectedMacro;
      } else {
        this.native.body += '' + selectedMacro;
      }
    }
    this.sendNativeAsset();
  }

  getCallToAction() {
    this.commonService.getDictionary('CALL_TO_ACTION', 1, 1000).subscribe(resp => {
      // console.log('call to action for macros ', resp);
      this.callToActionList = resp.respObject.data;
      if (this.nativeAsset) {
        this.native = JSON.parse(this.nativeAsset);
        this.handlePreSelectedCallToAction();
      }
    });
  }

  handlePreSelectedCallToAction() {
    const currentCTA = this.native.callToAction;
    let customCTA;

    this.callToActionList.forEach(cta => {

      //custom text
      if (cta.id === 9) {
        customCTA = cta;
      }
      if (cta.name === currentCTA) {
        this.selectedCallToAction = cta;
      }
    });

    if (!this.selectedCallToAction) {
      this.customCallToAction = currentCTA;
      this.selectedCallToAction = customCTA;

      //REVX-646
      this.showCustomTextInput = true;
    }

  }

  onDoneClick() {

    if (this.selectedCallToAction) {
      this.native.callToAction = this.selectedCallToAction.name;
    }

    this.validateForm();

    if (!this.formValidated) {
      return;
    }

    // this.nativeAssetObj.emit(this.native);
    // this.modalRef.close(null);
  }

  onSelectedCallToAction() {
    // console.log('changes', this.selectedCallToAction);
    if (this.selectedCallToAction.id === 9) {
      this.showCustomTextInput = true;
      this.native.callToAction = this.customCallToAction;
    } else {
      this.showCustomTextInput = false;
      this.native.callToAction = this.selectedCallToAction.name;
    }
    this.sendNativeAsset();
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
      this.native.iconurl = fileUploadResp.data[0].location;
      this.sendNativeAsset();
    }
    // console.log('fileupload response native form ', fileUploadResp);
  }

  sendNativeAsset() {
    if (this.selectedCallToAction && this.selectedCallToAction.id === 9) {
      this.native.callToAction = this.customCallToAction;
    }
    // console.log('this. native ', this.native);
    this.syncNativeAsset.emit(this.native);
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

    if (!this.native.iconurl) {
      this.formValidated = false;
      this.invalidIconMeassge = CreativeConstants.VALIDATION_ICON;
    }
    // console.log('testlfsdf ', this.crConst.VALIDATION_ICON, this.invalidIconMeassge);

  }

  removeIcon() {
    this.native.iconurl = '';
    this.sendNativeAsset(); //REVX-974 : on deleting logo , we need to inform parent
  }


  selectDefaultLogo() {
    let key: any = ['DEFAULT_LOGO'];
    this.appSettingService.getAppSettingsUsingGET(+this.advId, null, key)
      .subscribe((resp: ApiResponseObjectListAppSettingsDTO) => {
        if (resp && resp.respObject && resp.respObject.length > 0) {
          const list: AppSettingsDTO[] = resp.respObject;
          this.native.iconurl = list[0].settingsValue;
          this.invalidIconMeassge = null;
        } else {
          this.native.iconurl = '';
        }
      }, error => {
        this.native.iconurl = '';
      });
  }




  //REVX-974
  openLogoModal(type?: string) {
    let modalKey, modalType, modalTitle;

    modalKey = 'LOGO_LINK';
    modalType = 1;
    modalTitle = 'Logo';

    const modalRef = this.modal.open(ImageGridModalComponent, {
      width: '99%',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        key: modalKey,
        advId: this.advId,
        type: modalType,
        title: modalTitle,
        showTitle: false,
        imgList: null,
        canSelectMultiple: false,
        canSelectDefaultLogo: true
      }
    });
    modalRef.afterClosed().subscribe(result => {
      if (result != null && result != undefined) {
        // console.log(result);
        this.invalidIconMeassge = '';
        this.native.iconurl = result; //result will be a URL
        this.sendNativeAsset(); //un-comment it
      }
    });
  }




}
