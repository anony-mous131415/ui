import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertMessageConstants } from '@app/shared/_constants/alert-message.constants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { BlockUIConstants } from '@app/shared/_constants/BlockUIConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { FaviconService } from '@app/shared/_services/favicon.service';
import { ForgotPasswordComponent } from '@app/startup/_directives/forgot-password/forgot-password.component';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { ThemeService } from '@app/startup/_services/theme.service';
import { WhitelabelingEntity } from '@revxui/api-client-ts';
import { ApiResponseObjectTokenResponse, UserLoginRequest } from '@revxui/auth-client-ts';
import { AuthService, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { Md5 } from 'ts-md5';

const RETURN_URL = 'returnUrl';
const BEACON_CONTAINER_ID = 'beacon-container';
const GOOGLE = 'google';


@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AuthenticationComponent implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;

  loginForm: FormGroup;
  loginLogo: string;
  returnUrl: string;
  errorMessage: string;
  submitted = false;
  showLoginBox = true;
  loginReq = {} as UserLoginRequest;
  apiRespObj = {} as ApiResponseObjectTokenResponse;
  user: SocialUser;
  public showSwitchLicenseeBtn = true;
  themeEntities = {} as WhitelabelingEntity;
  emailFormControl: FormControl;
  passFormControl: FormControl;

  hide = false;

  userLoginSubscription: Subscription;
  themeSubscription: Subscription;

  constructor(
    private authUIService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private themeService: ThemeService,
    private commonService: CommonService,
    private faviconService: FaviconService,
    private titleService: Title,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.blockUI.stop();
    this.loginLogo = '';
    this.returnUrl = this.route.snapshot.queryParams[RETURN_URL] || AppConstants.URL_HOME;
    this.emailFormControl = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);
    this.passFormControl = new FormControl('', [
      Validators.required,
    ]);
    this.checkGoogleLogin();
    this.watchUserLogin();

    this.handleTheme();
    if (this.commonService.getEntityFromURL() === AppConstants.URL_LOGIN ||
      this.commonService.getEntityFromURL() === AppConstants.URL_NONE) {
      const token = localStorage.getItem(AppConstants.CACHED_TOKEN);
      if (token) {
        this.router.navigate([AppConstants.URL_HOME]);
        this.blockUI.start('Redirecting to home page...');
      }
    }

    // hide helpscout becon
    const hcElement = document.getElementById(BEACON_CONTAINER_ID);
    if (hcElement != null) {
      hcElement.remove();
    }
  }

  checkGoogleLogin() {
    this.authService.authState.subscribe((user) => { });
  }

  watchUserLogin() {
    this.userLoginSubscription = this.authUIService.userLoginWatcher().subscribe(loggedInObj => {
      if (loggedInObj) {
      } else {
        this.showLoginBox = true;
      }
    });
  }

  private handleTheme() {
    // check with the localstorage
    const cachedThemeEntities = JSON.parse(localStorage.getItem(AppConstants.CACHED_THEME_SETTINGS));
    if (cachedThemeEntities) {
      this.themeEntities = cachedThemeEntities;
      this.loginLogo = this.themeEntities.logoLg;

      if (this.themeEntities.favIcon) {
        this.faviconService.activate(this.themeEntities.favIcon);
      }
      if (this.themeEntities.pageTitle) {
        this.titleService.setTitle(this.themeEntities.pageTitle);
      }
    }

    this.themeSubscription = this.themeService.watchTheme().subscribe(
      response => {
        if (response) {
          this.themeEntities = response;
          this.loginLogo = response.logoLg;
          this.faviconService.activate(response.favIcon);
          this.titleService.setTitle(response.pageTitle);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.userLoginSubscription) {
      this.userLoginSubscription.unsubscribe();
    }

    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Called after switching the licensee or if the token is found in the interlogin response
   * @param response - api response
   */
  getUserInformation(response: ApiResponseObjectTokenResponse) {
    this.authUIService.getUserInfo(response.respObject.token).subscribe(resp => {
      if (resp) {
        // TO save user details in local storage
        this.authUIService.cacheUserInformation(resp.respObject, false);
        // window.location.href = AppConstants.URL_HOME;
        this.router.navigate([AppConstants.URL_HOME]);
      } else {
        this.blockUI.stop();
        // hide the modal and show the error
        // this.apiRequestFailed(AlertMessageConstants.SERVER_ERROR_MSG);
      }
    }, () => {
      // If the route url is not login | hide the modal and show the error
      this.authUIService.logout();
      this.blockUI.stop();
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
      this.authUIService.socialLogin(GOOGLE, user.authToken).subscribe(
        apiRespObj => {
          this.authUIService.doAfterInitialLogin(apiRespObj);
          if (apiRespObj.respObject.token) {
            // Saving the response data to the localstorage
            this.authUIService.cacheAuthElements(apiRespObj);
            this.getUserInformation(apiRespObj);
          } else {
            // if (!this.activeModal) {
            // this.openSwitcherModal();
            this.router.navigate([AppConstants.URL_HOME]);
            // }
          }
        }
      );
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (!this.emailFormControl.valid || !this.passFormControl.valid) {
      return;
    }
    this.submitted = true;
    this.blockUI.start(BlockUIConstants.AUTH_MSG);

    const md5 = new Md5();
    this.loginReq.username = this.emailFormControl.value;
    this.loginReq.password = md5.appendStr(this.passFormControl.value).end().toString();
    // App Normal Login method
    this.authUIService.internalLogin(this.loginReq).subscribe(
      apiResponse => {
        if (apiResponse && apiResponse.respObject) {
          localStorage.setItem(AppConstants.CACHED_SECRET_KEY_CHANGE_OPTION, true + '');
          // Token will returned if the user has access of only one licensee
          if (apiResponse.respObject.token) {
            // Saving the response data to the localstorage
            this.authUIService.cacheAuthElements(apiResponse);
            this.getUserInformation(apiResponse);
          } else {
            this.authUIService.doAfterInitialLogin(apiResponse);
            // open the Switcher Modal to Switch between the licensees
            // this.openSwitcherModal();
            this.router.navigate([AppConstants.URL_HOME]);
          }
        } else {
          this.alertService.error(AlertMessageConstants.WRONG_CREDENTIALS);
        }
        this.blockUI.stop();
      },
      () => {
        this.blockUI.stop();
      }
    );
  }

  forgotPasswordClick() {
    this.dialog.open(ForgotPasswordComponent, {
      disableClose: true
    });
  }


}

