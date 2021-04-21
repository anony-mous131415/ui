import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { AuthApiService } from '@revxui/auth-client-ts';
import { AuthService } from 'angularx-social-login';
// import { NGXLogger } from 'ngx-logger';
import { ErrorHandler } from '../error-handler.service';
import { AlertService } from '../alert.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertMessageConstants } from '@app/shared/_constants/alert-message.constants';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
    template: ''
})
export class DummyComponent { }
const dummyRoutes = [
    { path: 'login', component: DummyComponent },
    { path: 'random/path', component: DummyComponent },
];



describe('ListService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        declarations: [
            DummyComponent
        ],
        imports: [
            RouterTestingModule,
            HttpClientTestingModule,
            RouterTestingModule.withRoutes(dummyRoutes),
        ],

        providers: [
            { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
            { provide: AuthApiService, useClass: STUB.AuthApiService_stub },
            { provide: AuthService, useClass: STUB.AuthService_stub },
            // { provide: NGXLogger, useClass: STUB.NGXLogger_stub },
            // { provide: AlertService, useClass: STUB.AlertService_stub },
        ],
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



    it("Service Should be Created", () => {
        const service = TestBed.get(ErrorHandler);
        expect(service).toBeTruthy();
    });


    //new-test-cases
    it("should test apiError on session logout", fakeAsync(() => {
        const service = TestBed.get(ErrorHandler);

        let response_session_logout = {
            error: {
                error: {
                    code: 10011
                }
            }
        };

        let myRouter = TestBed.get(Router);
        const navigateSpy = spyOn(myRouter, 'navigate');

        const alertServ = TestBed.get(AlertService);
        let spy1 = spyOn(alertServ, 'error');
        service.apiError(response_session_logout);

        //test 1 : going to home page or not
        expect(spy1).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['login']);
    }));


    it("should test apiError on non-session logout", fakeAsync(() => {
        const service = TestBed.get(ErrorHandler);

        let response_session_logout = {
            error: {
                error: {
                    code: 4556,
                    message: 'api-err-msg'
                }
            }
        };

        const alertServ = TestBed.get(AlertService);
        let spy1 = spyOn(alertServ, 'error');
        service.apiError(response_session_logout);

        //test 1 : going to home page or not
        expect(spy1).toHaveBeenCalledWith('api-err-msg', true);
    }));




    //http error (non-seesion)
    it("should test apiError on non-session logout", () => {
        const service = TestBed.get(ErrorHandler);

        let response_session_logout = {
            error: {
                respId: 123,
                message: 'api-exception'
            }
        };

        let err_in_method = {
            message: AlertMessageConstants.SERVER_ERROR_MSG,
            responseId: 123

        }

        const alertServ = TestBed.get(AlertService);
        // const loggerServ = TestBed.get(NGXLogger);

        let spy1 = spyOn(alertServ, 'error');
        // let spy2 = spyOn(loggerServ, 'error');

        service.apiError(response_session_logout);

        //test 1 : going to home page or not
        expect(spy1).toHaveBeenCalledWith(err_in_method.message + ' - 123', true);
        // expect(spy2).toHaveBeenCalledWith(JSON.stringify(err_in_method));
    });





    //http error (non-seesion)
    it("should test apiError on non-session logout", () => {
        const service = TestBed.get(ErrorHandler);

        localStorage.setItem(AppConstants.CACHED_USERNAME, 'uname');
        localStorage.setItem(AppConstants.CACHED_TOKEN, 'stoken');
        localStorage.setItem(AppConstants.CACHED_MASTER_TOKEN, 'mtoken');

        let response_session_logout = {
            error: {
                // respId: 123,
                message: 'api-exception',
            }
        };

        let err_in_method = {
            userNmae: 'uname',
            token: 'stoken',
            masterToken: 'mtoken',
            message: AlertMessageConstants.SERVER_ERROR_MSG,
        };

        const alertServ = TestBed.get(AlertService);
        // const loggerServ = TestBed.get(NGXLogger);

        let spy1 = spyOn(alertServ, 'error');
        // let spy2 = spyOn(loggerServ, 'error');

        service.apiError(response_session_logout);

        //test 1 : going to home page or not
        expect(spy1).toHaveBeenCalledWith(err_in_method.message + '', true);
        // expect(spy2).toHaveBeenCalled();

    });



});
