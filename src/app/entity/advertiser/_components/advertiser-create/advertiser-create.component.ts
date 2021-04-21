import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { ComponentCanDeactivate } from '@app/shared/_guard/pending-changes.guard';
import { CommonService } from '@app/shared/_services/common.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdvertiserPojo, AppSettingsDTO, AppSettingsPropertyDTO } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { LogoFallbackUploadModalComponent } from '@app/shared/_components/pixel/logo-fallback-upload-modal/logo-fallback-upload-modal.component';

export interface AppInfoValidationMessages {
  androidPackageValidationMsg: string;
  androidDeclaredUrlValidationMsg: string;
  iosPackageValidationMsg: string;
  iosDeclaredUrlValidationMsg: string;
}

@Component({
  selector: 'app-advertiser-create',
  templateUrl: './advertiser-create.component.html',
  styleUrls: ['./advertiser-create.component.scss']
})
export class AdvertiserCreateComponent implements OnInit, AfterViewInit, ComponentCanDeactivate {
  @BlockUI() blockUI: NgBlockUI;

  errScrollId: string;
  breadcrumbs: string;
  advConst; formValidated = true; isAppInfo = true;
  advPojo: AdvertiserPojo; advId; appInfoVMsg = {} as AppInfoValidationMessages;

  emailValidationMsg: string;
  domainValidationMsg: string;

  saveClicked: boolean; // to disable propmt on saving advertiser
  appConst;
  defaultLogoLink: any = null;

  @HostListener('window:beforeunload', [])
  canDeactivate(): Observable<boolean> | boolean {
    // shows alert if saveClicked = false
    if (this.saveClicked) {
      return true;
    }
    return false;
  }

  constructor(
    private readonly modalService: NgbModal,
    private advService: AdvertiserService,
    private router: Router,
    private route: ActivatedRoute,
    private entitiesService: EntitiesService,
    private commonService: CommonService,
    private menuService: MenucrumbsService,
    private modal: MatDialog
  ) { }

  ngOnInit() {
    this.advConst = AdvConstants;
    this.appConst = AppConstants;
    this.advPojo = {} as AdvertiserPojo;
    this.saveClicked = false;
    this.breadcrumbs = JSON.stringify({ 'advertiserCreate': {id: '', name: ''}});
    this.advPojo.active = true;
    this.route.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      if (id && !isNaN(Number(id))) {
        this.advId = Number(id);
        this.getDetailsById(Number(id));
        this.getAdvertiserDetails(Number(id));
      }
      // else {
      //   this.router.navigate(['']);
      // }

    });
    this.blockUI.stop();
  }

  ngAfterViewInit() {
    this.scrollToTop();
  }

  onAdvCancel() {
    if (!this.advId) {
      this.router.navigate(['advertiser']);
    } else {
      this.router.navigate(['advertiser', 'details', this.advId]);
    }
    // this.location.back();
  }

  save() {
    // console.log('adv details', this.advPojo);
    this.validateUIModel();
    if (!this.formValidated) {
      this.scrollToError();
      return;
    }
    this.saveClicked = true;
    if (this.advId) {
      this.blockUI.start();
      this.advService.updateAdv(this.advId, this.advPojo).subscribe(resp => {
        if (resp && resp.respObject) {
          // console.log('resp ', resp);
          this.menuService.invalidateMenucrumbsData();
          this.router.navigate(['/advertiser/details/' + resp.respObject.id]);
          this.blockUI.stop();
        }
      }, (error: any) => {
        this.saveClicked = false;
        this.blockUI.stop();
      });
    } else {
      this.blockUI.start();
      this.advService.create(this.advPojo).subscribe(resp => {
        if (resp && resp.respObject) {
          // console.log('resp ', resp);
          this.menuService.invalidateMenucrumbsData();
          this.router.navigate(['/advertiser/details/' + resp.respObject.id]);
          this.blockUI.stop();
        }
      }, (error: any) => {
        this.saveClicked = false;
        this.blockUI.stop();
      });
    }

  }

  getAdvertiserDetails(id: number) {
    this.advService.getById(id).subscribe(response => {
      // console.log('response ,', response);
      this.advPojo = response.respObject;

      if(this.advPojo.defaultLogoDetails) {
        this.defaultLogoLink = {};
        this.defaultLogoLink.url = this.advPojo.defaultLogoDetails.settingsValue;
      }
      this.isAppInfo = this.isValidAppInfo();
    });
  }

  public openConfirmationModal(): void {
    this.modalService.open(ConfirmationModalComponent, { backdrop: 'static', keyboard: false });
  }


  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  validateUIModel() {
    const adv: AdvertiserPojo = this.advPojo;
    this.formValidated = true;
    // validate basic-info
    this.errScrollId = 'tile-basic';
    if ((!adv.name || !adv.domain || !adv.category || !adv.currency || !adv.language) || (adv.domain && !this.strHasDot(adv.domain))) {
      this.formValidated = false;
      // console.log('missing basic')
      return;
    }

    if (!adv.mmp) {
      this.formValidated = false;
      return;
    }

    // validate app-info
    this.errScrollId = 'tile-app';
    if (this.isAppInfo) {
      this.formValidated = this.isValidAppInfo();
      if (!this.formValidated) {
        // console.log('invalid app-info-combination');
        return;
      }
      if (adv.androidPhoneBundle && !this.strHasDot(adv.androidPhoneBundle)) {
        this.formValidated = false;
        // console.log('invalid androidPhoneBundle (app-info-1)')
        return;
      }
    }
    // validate contact-info
    this.errScrollId = 'tile-contact';
    if ((!adv.email || !adv.contactAddress || !adv.region || !adv.timeZone)
      || (adv.email && !this.commonService.validateEmail(adv.email))) {
      this.formValidated = false;
      // console.log('missing contact')
      return;
    }

    // REVX-450: Validate if advertiser logo is uploaded or not
    this.errScrollId = 'tile-basic';
    if (!(this.defaultLogoLink && this.defaultLogoLink.url)) {
      this.formValidated = false;
      // console.log('missing contact')
      return;
    }
  }


  // helper-methods
  strHasDot(str: string) {
    // if 'domain' has '.' then return true , else false
    if (str.indexOf('.') === -1) {
      return false;
    }
    return true;
  }

  isValidAppInfo() {
    // returns TRUE for valid combinations of filling app info
    const a = this.advPojo.androidPhoneBundle;
    const b = this.advPojo.androidDeclareUrl;
    const c = this.advPojo.iosPhoneBundle;
    const d = this.advPojo.iosDeclareUrl;
    if ((a && b && c && d) || (!a && !b && c && d) || (a && b && !c && !d)) {
      return true;
    }
    return false;
  }

  scrollToError() {
    // console.log('Went to==>', this.errScrollId);
    const el = document.getElementById(this.errScrollId);
    if (el)
      el.scrollIntoView({ behavior: 'smooth' });
  }

  validateEmail(email: string) {
    return this.commonService.validateEmail(email);
  }

  advEvent(event) {
    if (!event) {
      this.advPojo.androidPhoneBundle = null;
      this.advPojo.androidDeclareUrl = null;
      this.advPojo.iosPhoneBundle = null;
      this.advPojo.iosDeclareUrl = null;
    }
  }

  disableTimeZone() {
    // if (this.advPojo.id) {
    //   return 'true';
    // }
    // else
    if (!this.advPojo.region) {
      return 'true';
    }
    return 'false';
  }

  countryEvent(event: any) {
    // console.log(event);
    this.getFilterValue();
  }

  getFilterValue() {
    if (this.advPojo && this.advPojo.region) {
      return this.advPojo.region.id;
    }
  }

  private scrollToTop() {
    const pageContainer = document.querySelector('.adv-form-container');
    if (pageContainer !== null && pageContainer !== undefined) {
      setTimeout(() => { pageContainer.scrollIntoView({ behavior: 'smooth' }); }, 500);
    }
  }

  /**
   * REVX-450
   * This methods sets the necessary configuration details for logo upload and shows LogoFallbackUploadModalComponent as a modal
   * On closing the modal, returns the uploaded logo as an url(cdn). This url should be saved as "defaultLogoLink" in AdvertiserPojo
   */
  openLogoUploadModel() {
    const config = {
      title: this.advConst.UPLOAD_LOGO_MODAL_TITLE,
      allowMultipleUploads: false,
      extensions: ['.jpg', '.jpeg', '.png'],
      dimensions: [{ w: 300, h: 300 }],
      maxFileSize: 2048,
    };
    const modalRef = this.modal.open(LogoFallbackUploadModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      disableClose: true,
      data: config
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          const uploadedFiles = result.data;
          if (uploadedFiles) {
            this.defaultLogoLink = uploadedFiles[uploadedFiles.length - 1];
            if(!this.advPojo.defaultLogoDetails) {
              const appSetting: AppSettingsDTO = {
                advertiserId: this.advId,
                active: true,
                settingsKey: 'DEFAULT_LOGO',
                settingsType: AppSettingsDTO.SettingsTypeEnum.STRING,
                settingsValue: this.defaultLogoLink.url, // .replace('https', 'http'),
                appSettingsProperties: this.getAppSettingProps(this.defaultLogoLink.prop)
              } as AppSettingsDTO;
              this.advPojo.defaultLogoDetails = appSetting;
            } else {
              this.advPojo.defaultLogoDetails.settingsValue = this.defaultLogoLink.url;
            }
          }
        }
      }
    );

  }

  getAppSettingProps(properties: any) {
    const settingProps: AppSettingsPropertyDTO[] = [];
    Object.keys(properties).forEach(key => {
      const prop = {
        propertyKey: key,
        propertyValue: properties[key]
      } as AppSettingsPropertyDTO;
      settingProps.push(prop);
    });

    return settingProps;
  }

}
