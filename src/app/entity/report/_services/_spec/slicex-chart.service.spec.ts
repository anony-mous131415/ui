import { TestBed } from '@angular/core/testing';

import { SlicexChartService } from '../slicex-chart.service';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { DashboardControllerService, SlicexData } from '@revxui/api-client-ts';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dataElement: SlicexData = {
    advRevenue: 0,
    bidsPlaced: 0,
    clickConversions: 1873,
    clickInstalls: 0,
    clicks: 220648,
    conversions: 1873,
    cost: 65393.06,
    ctc: 0.85,
    ctr: 2.67,
    currencyId: "INR",
    cvr: 0.02,
    day: 1597968000,
    ecpa: 34.91,
    ecpc: 0.3,
    ecpi: 0,
    ecpm: 7.91,
    eligibleBids: 0,
    eligibleUniqUsers: 0,
    erpa: 45.34,
    erpc: 0.38,
    erpi: 0,
    erpm: 10.28,
    hour: 0,
    id: null,
    impInstalls: 0,
    impPerConversion: 4411.49,
    impressionUniqUsers: 0,
    impressions: 8262721,
    installs: 0,
    invalidClicks: 0,
    iti: 0,
    margin: 19534.42,
    marginPercentage: 23.001295719,
    modifiedBy: null,
    modifiedTime: null,
    name: null,
    revenue: 84927.48,
    roi: 0,
    userReach: 0,
    viewConversions: 0
};

const initDataElement: SlicexData = {
    advRevenue: 0,
    bidsPlaced: 0,
    clickConversions: 0,
    clickInstalls: 0,
    clicks: 0,
    conversions: 0,
    cost: 0,
    ctc: 0,
    ctr: 0,
    currencyId: '$',
    cvr: 0,
    day: 10,
    ecpa: 0,
    ecpc: 0,
    ecpi: 0,
    ecpm: 0,
    eligibleBids: 0,
    eligibleUniqUsers: 0,
    erpa: 0,
    erpc: 0,
    erpi: 0,
    erpm: 0,
    hour: 10,
    id: 0,
    impInstalls: 0,
    impressionUniqUsers: 0,
    impressions: 0,
    installs: 0,
    invalidClicks: 0,
    iti: 0,
    margin: 0,
    modifiedBy: 0,
    modifiedTime: 0,
    name: '',
    revenue: 0,
    roi: 0,
    userReach: 0,
    viewConversions: 0
}


describe('SlicexChartService', () => {

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            RouterTestingModule,
            HttpClientTestingModule
        ],
        providers: [
            { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
        ],
    }));

    it('should be created', () => {
        const service: SlicexChartService = TestBed.get(SlicexChartService);
        expect(service).toBeTruthy();
    });


    it('should test  computeChange', () => {
        const service: SlicexChartService = TestBed.get(SlicexChartService);
        expect(service.computeChange(0, 1)).toEqual(null);
        expect(service.computeChange(1, 2)).toEqual(100);
    });


    it('should test  calculateTotal', () => {
        const service: SlicexChartService = TestBed.get(SlicexChartService);

        //revenue
        let result = service.calculateTotal([dataElement], 'revenue');
        let expectation = dataElement.revenue;
        expect(result).toEqual(expectation);

        //cost
        result = service.calculateTotal([dataElement], 'cost');
        expectation = dataElement.cost;
        expect(result).toEqual(expectation);

        //impressions
        result = service.calculateTotal([dataElement], 'impressions');
        expectation = dataElement.impressions;
        expect(result).toEqual(expectation);

        //clicks
        result = service.calculateTotal([dataElement], 'clicks');
        expectation = dataElement.clicks;
        expect(result).toEqual(expectation);

        //impInstalls
        result = service.calculateTotal([dataElement], 'impInstalls');
        expectation = dataElement.impInstalls;
        expect(result).toEqual(expectation);

        //clickInstalls
        result = service.calculateTotal([dataElement], 'clickInstalls');
        expectation = dataElement.clickInstalls;
        expect(result).toEqual(expectation);

        //clickConversions
        result = service.calculateTotal([dataElement], 'clickConversions');
        expectation = dataElement.clickConversions;
        expect(result).toEqual(expectation);


        //when data is null
        result = service.calculateTotal(null, '');
        expectation = 0;
        expect(result).toEqual(expectation);


        //margin
        result = service.calculateTotal([dataElement], 'margin');
        expectation = dataElement.margin;
        expect(result).toEqual(expectation);


        //installs
        result = service.calculateTotal([dataElement], 'installs');
        expectation = dataElement.installs;
        expect(result).toEqual(expectation);


        //conversions
        result = service.calculateTotal([dataElement], 'conversions');
        expectation = dataElement.conversions;
        expect(result).toEqual(expectation);

        //ecpm
        result = service.calculateTotal([dataElement], 'ecpm');
        expectation = 7.914228254832761;
        expect(result).toEqual(expectation);

        //ecpa
        result = service.calculateTotal([dataElement], 'ecpa');
        expectation = 34.91353977576081;
        expect(result).toEqual(expectation);

        //ecpc
        result = service.calculateTotal([dataElement], 'ecpc');
        expectation = 0.29636824263079653;
        expect(result).toEqual(expectation);

        //ecpi
        result = service.calculateTotal([dataElement], 'ecpi');
        expectation = 0;
        expect(result).toEqual(expectation);

        //erpm
        result = service.calculateTotal([dataElement], 'erpm');
        expectation = 10.278391343481161;
        expect(result).toEqual(expectation);

        //erpa
        result = service.calculateTotal([dataElement], 'erpa');
        expectation = 45.34302189001602;
        expect(result).toEqual(expectation);

        //erpc
        result = service.calculateTotal([dataElement], 'erpc');
        expectation = 0.38490029368043216;
        expect(result).toEqual(expectation);

        //erpi
        result = service.calculateTotal([dataElement], 'erpi');
        expectation = 0;
        expect(result).toEqual(expectation);

        //ctr
        result = service.calculateTotal([dataElement], 'ctr');
        expectation = 2.670403611594776;
        expect(result).toEqual(expectation);

        //iti
        result = service.calculateTotal([dataElement], 'iti');
        expectation = 0;
        expect(result).toEqual(expectation);

        //ctc
        result = service.calculateTotal([dataElement], 'ctc');
        expectation = 0.8488633479569269;
        expect(result).toEqual(expectation);

        //cvr
        result = service.calculateTotal([dataElement], 'cvr');
        expectation = 0.022668077501346105;
        expect(result).toEqual(expectation);

        //marginPercentage
        result = service.calculateTotal([dataElement], 'marginPercentage');
        expectation = 23.001294751710518;
        expect(result).toEqual(expectation);

        //impPerConversion
        result = service.calculateTotal([dataElement], 'impPerConversion');
        expectation = 4411.490122797651;
        expect(result).toEqual(expectation);

        //default
        result = service.calculateTotal([dataElement], 'default');
        expectation = 0;
        expect(result).toEqual(expectation);

        //with zero data
        result = service.calculateTotal([initDataElement], 'ecpm');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'ecpa');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'ecpc');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'ecpi');
        expect(result).toEqual(0);

        result = service.calculateTotal([initDataElement], 'erpm');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'erpa');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'erpc');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'erpi');
        expect(result).toEqual(0);


        result = service.calculateTotal([initDataElement], 'ctr');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'iti');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'ctc');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'cvr');
        expect(result).toEqual(0);

        result = service.calculateTotal([initDataElement], 'marginPercentage');
        expect(result).toEqual(0);
        result = service.calculateTotal([initDataElement], 'impPerConversion');
        expect(result).toEqual(0);


    });

    it('should test  sortSlicexData', () => {
        const service: SlicexChartService = TestBed.get(SlicexChartService);
        let result = service.sortSlicexData([dataElement, initDataElement], null);
        expect(result[0]).toEqual(initDataElement);
        expect(result[1]).toEqual(dataElement);

    });


    it('should test  getters and setter and obervables', () => {
        const service: SlicexChartService = TestBed.get(SlicexChartService);

        //handleMissingValuesHourly
        let result = service.handleMissingValuesHourly([dataElement], null, null);
        let expectation = [dataElement];
        expect(result).toEqual(expectation);

        //initSlicexDataRow
        expect(service.initSlicexDataRow('$', 10, 10)).toEqual(initDataElement);
    });

    

});
