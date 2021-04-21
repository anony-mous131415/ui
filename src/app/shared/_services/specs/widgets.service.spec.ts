import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { WidgetsService } from '../widgets.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';

const sampleWidgetApiResp = {
    advRevenue: 16435249,
    bidsPlaced: 1262392459,
    clickConversions: 13198,
    clickInstalls: 0,
    clicks: 1467483,
    conversions: 13198,
    cost: 443680.81,
    ctc: 0.9,
    ctr: 2.4,
    currencyId: "INR",
    cvr: 0.02,
    ecpa: 33.62,
    ecpc: 0.3,
    ecpi: 0,
    ecpm: 7.25,
    eligibleBids: 4292137523,
    eligibleUniqUsers: 70286048,
    erpa: 43.7,
    erpc: 0.39,
    erpi: 0,
    erpm: 9.42,
    id: 1598486400,
    impInstalls: 0,
    impressionUniqUsers: 8708107,
    impressions: 61217976,
    installs: 0,
    invalidClicks: 37,
    iti: 0,
    margin: 23.07,
    modifiedBy: null,
    modifiedTime: null,
    name: null,
    revenue: 576750.61,
    roi: 28.5,
    userReach: 12.3895243,
    viewConversions: 0
};


describe('WidgetsService', () => {

    beforeEach(() => TestBed.configureTestingModule({

        imports: [
            RouterModule.forRoot([]), RouterTestingModule,
            HttpClientTestingModule
        ],

        providers: [
            { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
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


    it('Widget should be created', () => {
        const service: WidgetsService = TestBed.get(WidgetsService);
        expect(service).toBeTruthy();
    });


    it("widget data format for Admin User", () => {
        const service: WidgetsService = TestBed.get(WidgetsService);
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, "ROLE_ADMIN");

        let result = service.convertApiDataToWidgetData(sampleWidgetApiResp);
        expect(result.length).toEqual(6);

        expect(result[0].children.length).toEqual(3);
        expect(result[1].children.length).toEqual(2);
        expect(result[2].children.length).toEqual(1);

        expect(result[3].children.length).toEqual(2);
        expect(result[4].children.length).toEqual(3);
        expect(result[5].children.length).toEqual(3);

        //checkiing content of result[3].chilren
        let expected_child_2 = [
            { id: 'erpm', value: 9.42, title: 'eRPM', type: 'CURRENCY', currencyCode: 'INR' }
        ];
        // expect(result[2].children).toEqual(expected_child_2);



        //checking when api resp is null
        result = service.convertApiDataToWidgetData(null);
        expect(result.length).toEqual(6);
        expect(result[0].children.length).toEqual(3);
        expect(result[1].children.length).toEqual(2);
        expect(result[2].children.length).toEqual(1);

        expect(result[3].children.length).toEqual(2);
        expect(result[4].children.length).toEqual(3);
        expect(result[5].children.length).toEqual(3);

        expected_child_2[0].value = 0;
        expected_child_2[0].currencyCode = '';
        // expect(result[2].children).toEqual(expected_child_2);
    });



    it("widget data format for RO User", () => {
        const service: WidgetsService = TestBed.get(WidgetsService);
        localStorage.clear();
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, "ROLE_RO");

        let result = service.convertApiDataToWidgetData(sampleWidgetApiResp);
        expect(result.length).toEqual(6);

        expect(result[0].children.length).toEqual(1);
        expect(result[1].children.length).toEqual(2);
        expect(result[2].children.length).toEqual(0);

        expect(result[3].children.length).toEqual(1);
        expect(result[4].children.length).toEqual(2);
        expect(result[5].children.length).toEqual(2);


        //checkiing content of result[3].chilren
        let expected_child_3 = [
            { id: 'ctr', value: 2.4, title: 'CTR', type: 'PERCENTAGE', currencyCode: 'INR' }
        ];
        // expect(result[3].children).toEqual(expected_child_3);
    });



});
