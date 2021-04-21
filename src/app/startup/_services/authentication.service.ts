import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { ApiResponseObjectboolean } from '@revxui/api-client-ts';
import {
  ApiResponseObjectSetLicensee,
  ApiResponseObjectTokenResponse,
  ApiResponseObjectUserInfo,
  AuthApiService,
  PasswordChangeRequest,
  UserInfo,
  UserLoginRequest
} from '@revxui/auth-client-ts';
import { AuthService, SocialUser } from 'angularx-social-login';
import { Observable, Subject } from 'rxjs';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private loginSubject = new Subject<any>();
  licenseeSelectionSubject = new Subject<UserInfo>();

  user: SocialUser;

  constructor(
    private authService: AuthService,
    private authApiService: AuthApiService,
    private router: Router,
    private commonService: CommonService,
    private menucrumbsService: MenucrumbsService
  ) { }


  userLoginWatcher(): Observable<any> {
    return this.loginSubject.asObservable();
  }

  licenseeSelectionWatcher(): Observable<any> {
    return this.licenseeSelectionSubject.asObservable();
  }

  /**
   * It will be called, when Login button will be clicked and
   * the api request is successful
   * @param apiResponse - api response
   */
  doAfterInitialLogin(apiResponse: ApiResponseObjectTokenResponse) {
    // hiding login box
    this.loginSubject.next({
      hideLoginBox: true
    });
    // Saving the master token to the local storage
    localStorage.setItem(AppConstants.CACHED_MASTER_TOKEN,
      apiResponse.respObject.masterToken);
  }


  /**
   * logout user and clear local-storage
   */
  logout() {
    // Logging out of social account
    if (localStorage.getItem(AppConstants.CACHED_LOGGEDIN_USER_TYPE)
      === AppConstants.USER_TYPE_SOCIAL) {
      this.authService.signOut();
    }
    // clearing all local storage data
    // clearing the watcher
    this.loginSubject.next();
    const themeSettings = localStorage.getItem(AppConstants.CACHED_THEME_SETTINGS);
    localStorage.clear();
    localStorage.setItem(AppConstants.CACHED_THEME_SETTINGS, themeSettings);

    // this.menucrumbsService.invalidateMenucrumbsData();

    this.menucrumbsService.invalidateMenucrumbsForLogout();

    this.router.navigate([AppConstants.URL_LOGIN]);
  }


  /**
   * 
   * @param response 
   * cahing tokens in local-storage
   */
  cacheAuthElements(response: ApiResponseObjectTokenResponse) {
    localStorage.setItem(AppConstants.CACHED_USERNAME, response.respObject.username);
    localStorage.setItem(AppConstants.CACHED_TOKEN, response.respObject.token);
    localStorage.setItem(AppConstants.CACHED_MASTER_TOKEN, response.respObject.masterToken);

  }

  /**
   * 
   * @param userInfo 
   * @param showLicenseeSwitchOption 
   * caching in LOCAL-storage the user properties
   */
  cacheUserInformation(userInfo: UserInfo, showLicenseeSwitchOption: boolean) {
    localStorage.setItem(AppConstants.CACHED_USER_ROLE, userInfo.authorities[0]);
    localStorage.setItem(AppConstants.CACHED_LICENSEE_NAME, userInfo.selectedLicensee.name);
    localStorage.setItem(AppConstants.CACHED_CURRENCY, AppConstants.CURRENCY_MAP[userInfo.selectedLicensee.currencyCode]);
    localStorage.setItem(AppConstants.CACHED_LICENSEE_SWITCH_OPTION, showLicenseeSwitchOption + '');

    // checking advertiser level access
    // if (userInfo.advertisers && userInfo.advertisers.length <= 1) {
    if (userInfo.advertisers) {
      localStorage.setItem(AppConstants.USER_HAS_ADVERTISER_ACCESS, AppConstants.POSITIVE);

      const dmpMenuModificationRequired = (userInfo.advertisers.length === 1) ? true : false;

      if (dmpMenuModificationRequired) {
        const advertiserId = (userInfo.advertisers.length === 1) ? userInfo.advertisers[0].id : null;
        const encodedValue = this.commonService.encodeAdvId(advertiserId);
        localStorage.setItem(AppConstants.ADVERTISER_ID_ENCODED, encodedValue);
      }

    } else {
      localStorage.setItem(AppConstants.USER_HAS_ADVERTISER_ACCESS, AppConstants.NEGATIVE);
    }

  }


  /**
   * 
   * @param token 
   * api call to get the user info
   */
  getUserInfo(token: string): Observable<ApiResponseObjectUserInfo> {
    return this.authApiService.userInfoUsingGET(token, null, null);
  }

  switchLicensee(licenseeId: number, masterToken: string): Observable<ApiResponseObjectTokenResponse> {
    return this.authApiService.switchLicenseeUsingGET(licenseeId, masterToken);
  }

  socialLogin(clientName: string, userAuthToken: string): Observable<ApiResponseObjectTokenResponse> {
    return this.authApiService.loginSocialUsingGET(clientName, userAuthToken, null, null);
  }

  internalLogin(loginReq: UserLoginRequest): Observable<ApiResponseObjectTokenResponse> {
    return this.authApiService.loginUsingPOST(loginReq, null, null);
  }

  getUserPrivilege(masterToken: string): Observable<ApiResponseObjectSetLicensee> {
    return this.authApiService.userPrivilegeUsingGET(masterToken, null, null);
  }

  changePassword(req: PasswordChangeRequest): Observable<ApiResponseObjectboolean> {
    return this.authApiService.changePasswordUsingPOST(req, localStorage.getItem(AppConstants.CACHED_TOKEN));
  }

}
