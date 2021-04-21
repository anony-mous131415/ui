import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { FaviconService } from '@app/shared/_services/favicon.service';
import { ChangePasswordComponent } from '@app/startup/_components/change-password/change-password.component';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { DynamicScriptLoaderService } from '@app/startup/_services/dynamic-script-loader.service';
import { ThemeService } from '@app/startup/_services/theme.service';
import { environment } from '@env/environment';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { WhitelabelingEntity } from '@revxui/api-client-ts';
import { LicenseeSwitcherComponent } from '../licensee-switcher/licensee-switcher.component';


@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  isLoggedIn: boolean;
  settings: any;
  headerLogo: string;
  userName: string;
  public showSwitchLicenseeBtn = true;
  themeEntities = {} as WhitelabelingEntity;
  public modalOption: NgbModalOptions = {};
  showChangePasswordBtn = true;

  constructor(
    private authUIService: AuthenticationService,
    private readonly modalService: NgbModal,
    private themeService: ThemeService,
    private faviconService: FaviconService,
    private titleService: Title,
    private modal: MatDialog,
    private dynamicScriptLoader: DynamicScriptLoaderService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.isLoggedIn = false;
    this.headerLogo = environment.theme.LOGO_SM_URL;
    this.userName = localStorage.getItem(AppConstants.CACHED_USERNAME);
    this.showSwitchLicenseeBtn = localStorage.getItem(AppConstants.CACHED_LICENSEE_SWITCH_OPTION) === 'true' ? true : false;
    this.showChangePasswordBtn = localStorage.getItem(AppConstants.CACHED_SECRET_KEY_CHANGE_OPTION) === 'true' ? true : false;
    if (localStorage.getItem(AppConstants.CACHED_TOKEN)) {
      this.isLoggedIn = true;
    }
    this.handleTheme();
    this.watchUserLogin();

    this.handleHelpScout();
  }

  handleHelpScout() {
    if (this.isLoggedIn === true) {
      if (this.getSubdomain()) {
        this.loadScripts();
      }
    } else {
      const hcElement = document.getElementById('beacon-container');
      if (hcElement != null) {
        hcElement.remove();
      }
      this.removeScripts();
    }
  }

  watchUserLogin() {
    this.authUIService.userLoginWatcher().subscribe(loggedInObj => {
      // console.log("login obj ", loggedInObj);
      if (loggedInObj) {
        if (localStorage.getItem(AppConstants.CACHED_TOKEN)) {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      } else {
        this.isLoggedIn = false;
        this.handleHelpScout();
      }
    });
  }

  private loadScripts() {
    // You can load multiple scripts by just providing the key as argument into load method of the service
    this.dynamicScriptLoader.loadScript('helpscout').then(data => {
      // Script Loaded Successfully
    }).catch(error => console.log(error));
  }

  private removeScripts() {
    // You can remove multiple scripts by just providing the key as argument into remove method of the service
    this.dynamicScriptLoader.removeScript('helpscout').then(data => {
      // Script removed Successfully
    }).catch(error => console.log(error));
  }

  private handleTheme() {
    // check with the localstorage
    const cachedThemeEntities = localStorage.getItem(AppConstants.CACHED_THEME_SETTINGS);
    if (cachedThemeEntities) {
      this.themeEntities = JSON.parse(cachedThemeEntities);
      if (this.themeEntities.logoSm) {
        this.headerLogo = this.themeEntities.logoSm;
      }

      if (this.themeEntities.favIcon) {
        this.faviconService.activate(this.themeEntities.favIcon);
      }

      if (this.themeEntities.pageTitle) {
        this.titleService.setTitle(this.themeEntities.pageTitle);
      }

      if (this.themeEntities.subDomain && this.themeEntities.subDomain !== 'default') {

      }
    }

    this.themeService.watchTheme().subscribe(response => {
      // console.log("theme ", response);
      if (response) {
        this.themeEntities = response;
        this.headerLogo = response.logoSm;
        this.faviconService.activate(response.favIcon);
        this.titleService.setTitle(response.pageTitle);
      }
    });
  }


  public openSwitcherModal() {
    this.modalOption.backdrop = 'static';
    // this.modalOption.keyboard = false;
    this.modalService.open(LicenseeSwitcherComponent, this.modalOption);
  }

  public changePasswordModal() {
    this.modal.open(ChangePasswordComponent, {
      width: '40%',
      // data: {...this.clickDestination},
      disableClose: true,
    });

    // this.modalOption.backdrop = 'static';
    // const modal: NgbModalRef = this.modalService.open(ChangePasswordComponent, this.modalOption);
  }

  signOut() {
    // console.log('sign out called');
    this.setDomainTheme();
    this.authUIService.logout();
    this.isLoggedIn = false;
  }

  setDomainTheme() {
    let subDomain = this.getSubdomain();
    if (!subDomain) {
      subDomain = 'default';
    }
    this.themeService.populateThemeSettings(null, subDomain);
  }


  getSubdomain() {
    const domain = window.location.hostname;
    return this.commonService.getSubdomain(domain);
  }


}
