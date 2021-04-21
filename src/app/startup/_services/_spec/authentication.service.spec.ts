import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { ApiResponseObjectTokenResponse, AuthApiService, UserInfo } from '@revxui/auth-client-ts';
import { AuthService, AuthServiceConfig } from 'angularx-social-login';


@Component({
    template: ''
})
export class DummyComponent { }
const dummyRoutes = [
    { path: 'login', component: DummyComponent },
]


describe('AuthenticationService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        declarations: [
            DummyComponent
        ],

        imports: [
            // SocialLoginModule,
            RouterTestingModule.withRoutes(dummyRoutes),
            HttpClientTestingModule
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            // { provide: AuthServiceConfig, useFactory: GoogleAuthConfig },
            // { provide: AuthServiceConfig, useFactory: STUB.GoogleAuthConfig_stub },
            { provide: AuthServiceConfig, useClass: STUB.GoogleAuthConfig_stub },
            // { provide: NGXLogger, useClass: class { } },
            { provide: APP_BASE_HREF, useValue: '/' },
            { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
            { provide: AuthApiService, useClass: STUB.AuthApiService_stub },
            { provide: AuthService, useClass: STUB.AuthService_stub },
            // AuthApiService,
            // HttpHandler
        ]
    }));

    //mocking localstorage 
    beforeEach(() => {
        let store = {};
        const mockLocalStorage = {
            getItem: (key: string): string => {
                return key in store ? store[key] : null;
            },
            setItem: (key: string, value: string) => {
                store[key] = `${value}`;
            },
            removeItem: (key: string) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            }
        };


        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

    });

    it('should be created', () => {
        const service: AuthenticationService = TestBed.get(AuthenticationService);
        expect(service).toBeTruthy();
    });

    //TODO : Asynchronous Test case : giving error some times
    // it('should get auth response', inject(
    //   [AuthenticationService],
    //   (
    //     // httpMock: HttpTestingController,
    //     authenticationService: AuthenticationService
    //   ) => {
    //     // ...our test logic here
    //     const promisedData = require('./authentication.promisedata.json');
    //     const loginObj = {} as UserLoginRequest;
    //     loginObj.username = "SAdmin";
    //     loginObj.secretKey = "secretKey";

    //     authenticationService.internalLogin(loginObj).subscribe(
    //       response => {
    //         expect(response).toEqual(promisedData);
    //       }
    //     );
    //   }
    // ));

    // it('should logout', () => {
    // const service: AuthenticationService = TestBed.get(AuthenticationService);
    // service.logout();
    // let cachedToken = localStorage.getItem(AppConstants.CACHED_TOKEN);
    // expect(cachedToken).toBeFalsy();
    // // Check the URL : should be point to /login
    // });

    // it('should cache Account Identites', () => {
    //   const service: AuthenticationService = TestBed.get(AuthenticationService);
    //   const uInfo = {} as UserInfo;
    //   const licensee = {} as Licensee;

    //   licensee.name = "REVX";
    //   uInfo.selectedLicensee = licensee;
    //   service.cacheAccountIdentites(uInfo);

    //   let licenseeName = localStorage.getItem(AppConstants.CACHED_LICENSEE_NAME);
    //   expect(licenseeName).toEqual("REVX");
    //    });

    // it('should cache auth elements', () => {
    //     const service: AuthenticationService = TestBed.get(AuthenticationService);
    //     const response = {} as ApiResponseObjectTokenResponse;
    //     const tokenResp = {} as TokenResponse;

    //     // tokenResp.extObject = null;
    //     tokenResp.masterToken = "jsdfusf437lkksjsfas44rknsdlfduasfmalskkjfdjasfbkjsafnkj";
    //     tokenResp.token = "jsdfusf437lkksjsfas44rknsdlfduasfmalskkjfdjasfbkjsafnkjjsdfusf437lkksjsfas44rknsdlfduasfmalskkjfdjasfbkjsafnkj";
    //     tokenResp.username = "ashish@revx.io";

    //     response.respObject = tokenResp;
    //     service.cacheAuthElements(response);

    //     let cachedMasterToken = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
    //     expect(cachedMasterToken).toEqual(tokenResp.masterToken);

    //     let cachedUserName = localStorage.getItem(AppConstants.CACHED_USERNAME);
    //     expect(cachedUserName).toEqual(tokenResp.username);
    // });

    // it('should do after initial login', () => {
    //     const service: AuthenticationService = TestBed.get(AuthenticationService);
    //     const response = {} as ApiResponseObjectTokenResponse;
    //     const tokenResp = {} as TokenResponse;

    //     tokenResp.masterToken = "jsdfusf437lkksjsfas44rknsdlfduasfmalskkjfdjasfbkjsafnkj";
    //     response.respObject = tokenResp;

    //     service.doAfterInitialLogin(response);

    //     let cachedMasterToken = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
    //     expect(cachedMasterToken).toEqual(tokenResp.masterToken);
    // });

    // it('should cache user Info', () => {
    // const service: AuthenticationService = TestBed.get(AuthenticationService);
    // const userInfo = {} as UserInfo;
    // const tokenResp = {} as TokenResponse;

    // tokenResp.masterToken = "jsdfusf437lkksjsfas44rknsdlfduasfmalskkjfdjasfbkjsafnkj";
    // response.respObject = tokenResp;

    // service.doAfterInitialLogin(response);

    // let cachedMasterToken = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
    // expect(cachedMasterToken).toEqual(tokenResp.masterToken);
    // });

    // it('should do after licensee switch', () => {
    //   const service: AuthenticationService = TestBed.get(AuthenticationService);
    //   const response = {} as ApiResponseObjectTokenResponse;
    //   const tokenResp = {} as TokenResponse;

    //   tokenResp.masterToken = "jsdfusf437lkksjsfas44rknsdlfduasfmalskkjfdjasfbkjsafnkj";
    //   tokenResp.username = "ashish@revx.io";
    //   tokenResp.token = "sdhfhusfjsfuhSFDAS4AFOKJIJFASDFJ94Hljsjdflasduifhjkdf4r5";

    //   response.respObject = tokenResp;

    //   service.doAfterLicenseeSwitch(response, true);

    //   let cachedMasterToken = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
    //   let cachedToken = localStorage.getItem(AppConstants.CACHED_TOKEN);
    //   let cachedUserName = localStorage.getItem(AppConstants.CACHED_USERNAME);

    //   expect(cachedToken).toEqual(tokenResp.token);
    //   expect(cachedMasterToken).toEqual(tokenResp.masterToken);
    //   expect(cachedUserName).toEqual(tokenResp.username);

    // });


    it('should test correct ApiCalled or not', () => {
        const service: AuthenticationService = TestBed.get(AuthenticationService);
        const calledService: AuthApiService = TestBed.get(AuthApiService);

        let spy1 = spyOn(calledService, 'userInfoUsingGET');
        service.getUserInfo('random-token');
        expect(spy1).toHaveBeenCalledTimes(1);
        expect(spy1).toHaveBeenCalledWith('random-token', null, null);

        let spy2 = spyOn(calledService, 'switchLicenseeUsingGET');
        service.switchLicensee(1, 'master-token');
        expect(spy2).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledWith(1, 'master-token');

        let spy3 = spyOn(calledService, 'loginSocialUsingGET');
        service.socialLogin('google', 'auth-token');
        expect(spy3).toHaveBeenCalledTimes(1);
        expect(spy3).toHaveBeenCalledWith('google', 'auth-token', null, null);

        let spy4 = spyOn(calledService, 'loginUsingPOST');
        service.internalLogin({ licenseeId: 1, secretKey: '123', username: 'email' } as any);
        expect(spy4).toHaveBeenCalledTimes(1);
        expect(spy4).toHaveBeenCalledWith({ licenseeId: 1, secretKey: '123', username: 'email' }, null, null);

        let spy5 = spyOn(calledService, 'userPrivilegeUsingGET');
        service.getUserPrivilege('m-token');
        expect(spy5).toHaveBeenCalledTimes(1);
        expect(spy5).toHaveBeenCalledWith('m-token', null, null);

        let spy6 = spyOn(calledService, 'changePasswordUsingPOST');
        service.changePassword({ username: 'name', oldSecretKey: 'old', newSecretKey: 'new' } as any);
        localStorage.setItem(AppConstants.CACHED_TOKEN, 'tkn');
        expect(spy6).toHaveBeenCalledTimes(1);

    });


    it('should test cacheAuthElements', () => {
        const service: AuthenticationService = TestBed.get(AuthenticationService);
        const resp = {
            error: null,
            respId: '123',
            respObject: {
                masterToken: 'mtoken',
                token: 'stoken',
                username: 'uname'
            }
        };

        service.cacheAuthElements(resp);
        expect(localStorage.getItem(AppConstants.CACHED_USERNAME)).toEqual('uname');
        expect(localStorage.getItem(AppConstants.CACHED_TOKEN)).toEqual('stoken');
        expect(localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN)).toEqual('mtoken');
    });


    it('should test cacheUserInformation', () => {
        const service: AuthenticationService = TestBed.get(AuthenticationService);
        const uInfo: UserInfo = {
            selectedLicensee: {
                active: true,
                id: 1,
                name: 'lname',
                currencyCode: 'USD'
            },
            authorities: ['RO'],
        };


        service.cacheUserInformation(uInfo, true);
        expect(localStorage.getItem(AppConstants.CACHED_USER_ROLE)).toEqual('RO');
        expect(localStorage.getItem(AppConstants.CACHED_LICENSEE_NAME)).toEqual('lname');
        expect(localStorage.getItem(AppConstants.CACHED_CURRENCY)).toEqual(AppConstants.CURRENCY_MAP.USD);
        expect(localStorage.getItem(AppConstants.CACHED_LICENSEE_SWITCH_OPTION)).toEqual('true');

        uInfo.advertisers = [
            {
                active: true,
                id: 6804,
                name: 'adv-name'
            }
        ];

        service.cacheUserInformation(uInfo, true);
        expect(localStorage.getItem(AppConstants.USER_HAS_ADVERTISER_ACCESS)).toEqual('true');
        expect(localStorage.getItem(AppConstants.ADVERTISER_ID_ENCODED)).toEqual('giae');

        uInfo.advertisers.push({ active: true, id: 1234, name: 'n2' });
        localStorage.clear();//TEST OF MOCK LOCAL STORAGE : uncomment this line causes test to FAIL
        service.cacheUserInformation(uInfo, true);
        expect(localStorage.getItem(AppConstants.ADVERTISER_ID_ENCODED)).toEqual(null);
    });


    it('should test logout', fakeAsync(() => {
        const service: AuthenticationService = TestBed.get(AuthenticationService);
        const uInfo: UserInfo = {
            selectedLicensee: {
                active: true,
                id: 1,
                name: 'lname',
                currencyCode: 'USD'
            },
            authorities: ['RO'],
        };

        //google-login
        localStorage.setItem(AppConstants.CACHED_LOGGEDIN_USER_TYPE, 'social');
        const calledService = TestBed.get(AuthService)
        let spy1 = spyOn(calledService, 'signOut');
        service.logout();
        expect(spy1).toHaveBeenCalled();

        //normal login
        let myRouter = TestBed.get(Router);
        myRouter.navigate(['login']);
        tick();
        localStorage.clear();
        service.logout();
    }));




    it('should test doAfterInitialLogin', () => {
        const service: AuthenticationService = TestBed.get(AuthenticationService);

        const resp: ApiResponseObjectTokenResponse = {
            error: null,
            respId: 'sqwerty',
            respObject: {
                masterToken: 'mtoken'
            }
        };

        service.doAfterInitialLogin(resp);
        expect(localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN)).toEqual('mtoken');
    });


});
