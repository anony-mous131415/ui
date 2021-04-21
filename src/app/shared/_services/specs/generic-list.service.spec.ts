import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { PixelTypePipe } from '@app/shared/_pipes/pixel-type.pipe';
import { SecondsToTimePipe } from '@app/shared/_pipes/seconds-to-time.pipe';
import { AdvertiserControllerService, AudienceControllerService, BulkStrategyControllerService, CampaignControllerService, CatalogControllerService, ClickDestinationControllerService, CreativeControllerService, DashboardControllerService, DashboardFilters, PixelControllerService, SearchRequest, StrategyControllerService } from '@revxui/api-client-ts';
import { GenericListService } from '../generic-list.service';

const passedElement = {

  select: 'true',
  active: 'true',
  action: '',
  type: 'zippledHtmml',
  size: {
    height: 320,
    width: 280
  },
  name: 'angular',
  id: 123,
  advertiserName: 'aname',
  advertiserId: 1,
  totalUU: 89,
  dailyUU: 90,
  variablePath: 'pat/to/var',
  standardVariable: 'sd',
  description: 'desc',
  samples: 'samples',

  performanceData: {
    clicks: 34,
    impressions: 99,
    conversions: 45,
    ctr: 56,
    ctc: 67
  },
  objectsParsed: 100,
  objectsFound: 90,
  updateFrequency: 86400,
  lastUpdated: 1598524013,
  creationTime: 1598524013,
  successRate: 89,
  source: 'src',
  updatedStatus: 'done',
  conversions: 89,
  clickValidityWindow: 432000,
};

describe('GenericListService', () => {

  let service: GenericListService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
    ],
    schemas: [NO_ERRORS_SCHEMA],

    providers: [
      { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
      { provide: AdvertiserControllerService, useClass: STUB.AdvertiserControllerService_stub },
      { provide: PixelControllerService, useClass: STUB.PixelControllerService_stub },
      { provide: CatalogControllerService, useClass: STUB.CatalogControllerService_stub },
      { provide: ClickDestinationControllerService, useClass: STUB.ClickDestinationControllerService_stub },
      { provide: CampaignControllerService, useClass: STUB.CampaignControllerService_stub },
      { provide: StrategyControllerService, useClass: STUB.StrategyControllerService_stub },
      { provide: BulkStrategyControllerService, useClass: STUB.BulkStrategyControllerService_stub },
      { provide: AudienceControllerService, useClass: STUB.AudienceControllerService_stub },
      { provide: PixelTypePipe, useClass: STUB.PixelTypePipe_stub },
      { provide: SecondsToTimePipe, useClass: STUB.SecondsToTimePipe_stub },
      { provide: CreativeControllerService, useClass: STUB.CreativeControllerService_stub },
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
    service = TestBed.get(GenericListService);
    expect(service).toBeTruthy();
  });


  //new-test-case
  it('should test getMetricsForList() when called with entity = PIXEL', () => {
    service = TestBed.get(GenericListService);
    const spy = spyOn(service, 'getPixelMetrics');
    const result = service.getMetricsForList(AppConstants.ENTITY.PIXEL);
    // expect(result.length).toEqual(9);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getMetricsForList() when called with entity = CATALOG', () => {
    service = TestBed.get(GenericListService);
    const spy = spyOn(service, 'getCatalogMetrics');
    const result = service.getMetricsForList(AppConstants.ENTITY.CATALOG);
    // expect(result.length).toEqual(9);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getMetricsForList() when called with entity = CREATIVE', () => {
    service = TestBed.get(GenericListService);
    const spy = spyOn(service, 'getCreativeMetrics');
    const result = service.getMetricsForList(AppConstants.ENTITY.CREATIVE);
    // expect(result.length).toEqual(9);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getMetricsForList() when called with entity = AUDIENCE', () => {
    service = TestBed.get(GenericListService);
    const spy = spyOn(service, 'getAudienceMetrics');
    service.getMetricsForList(AppConstants.ENTITY.AUDIENCE);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test getMetricsForList() when called with entity = CATALOG_DETAILS', () => {
    service = TestBed.get(GenericListService);
    const spy_1 = spyOn(service, 'getCatalogDetailsMetrics');
    const spy_2 = spyOn(service, 'getCatalogDetailsMetricsHeader');

    service.getMetricsForList(AppConstants.ENTITY.CATALOG_DETAILS);
    expect(spy_1).toHaveBeenCalledTimes(1);
    expect(spy_2).toHaveBeenCalledTimes(1);

  });



  it('should Test deactivateEntity for PIXEL', () => {
    service = TestBed.get(GenericListService);
    const idArr = [1, 2, 3];
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'deactivateUsingPOST');
    service.deactivateEntity(AppConstants.ENTITY.PIXEL, idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should Test deactivateEntity for AUDIENCE', () => {
    service = TestBed.get(GenericListService);
    const idArr = [1, 2, 3];
    const calledService = TestBed.get(AudienceControllerService);
    const spy = spyOn(calledService, 'deactivateAudienceUsingPOST');
    service.deactivateEntity(AppConstants.ENTITY.AUDIENCE, idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should Test deactivateEntity for CREATIVES', () => {
    service = TestBed.get(GenericListService);
    const idArr = [1, 2, 3];
    const calledService = TestBed.get(CreativeService);
    const spy = spyOn(calledService, 'deactivateCreatives');
    service.deactivateEntity(AppConstants.ENTITY.CREATIVE, idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test activateEntity for PIXEL', () => {
    service = TestBed.get(GenericListService);
    const idArr = [1, 2, 3];
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'activateUsingPOST');
    service.activateEntity(AppConstants.ENTITY.PIXEL, idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should Test activateEntity for AUDIENCE', () => {
    service = TestBed.get(GenericListService);
    const idArr = [1, 2, 3];
    const calledService = TestBed.get(AudienceControllerService);
    const spy = spyOn(calledService, 'activateAudienceUsingPOST');
    service.activateEntity(AppConstants.ENTITY.AUDIENCE, idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should Test activateEntity for CREATIVES', () => {
    service = TestBed.get(GenericListService);
    const idArr = [1, 2, 3];
    const calledService = TestBed.get(CreativeService);
    const spy = spyOn(calledService, 'activateCreatives');
    service.activateEntity(AppConstants.ENTITY.CREATIVE, idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test getListData for PIXEL', () => {
    service = TestBed.get(GenericListService);
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'searchPixelsUsingPOST');
    service.getListData(AppConstants.ENTITY.PIXEL, STUB.genericListApiReq);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should Test getListData for CATALOG', () => {
    service = TestBed.get(GenericListService);
    const calledService = TestBed.get(CatalogControllerService);
    const spy = spyOn(calledService, 'getCatalogFeedsUsingPOST');
    service.getListData(AppConstants.ENTITY.CATALOG, STUB.genericListApiReq);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test getListData for AUDIENCE', () => {
    service = TestBed.get(GenericListService);
    const calledService = TestBed.get(AudienceControllerService);
    const spy = spyOn(calledService, 'getAllAudienceUsingPOST');
    service.getListData(AppConstants.ENTITY.AUDIENCE, STUB.genericListApiReq);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test getListData for CATALOG_DETAILS', () => {
    service = TestBed.get(GenericListService);
    const calledService = TestBed.get(CatalogControllerService);
    const spy = spyOn(calledService, 'getVariableMappingsUsingPOST');
    service.getListData(AppConstants.ENTITY.CATALOG_DETAILS, STUB.genericListApiReq);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test getListData for CREATIVE', () => {
    service = TestBed.get(GenericListService);
    const calledService = TestBed.get(CreativeService);
    const spy = spyOn(calledService, 'getAllCreatives');
    service.getListData(AppConstants.ENTITY.CREATIVE, STUB.genericListApiReq);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test extractFiltersFromSearchRequest', () => {
    service = TestBed.get(GenericListService);
    let nameFilter = { column: 'name', value: 'random_input' } as DashboardFilters;
    let durationFilter = {
      column: 'duration', value: JSON.stringify({
        endTimeStamp: 1597881600,
        startTimeStamp: 1597276800
      })
    } as DashboardFilters;
    let dashboardFilters = [];
    dashboardFilters.push(nameFilter);
    dashboardFilters.push(durationFilter);
    const searchReq = {} as SearchRequest;
    searchReq.filters = dashboardFilters;
    const normalFilter = service.extractFiltersFromSearchRequest(searchReq as SearchRequest, false);
    expect(normalFilter[0].column).toEqual('name');
    expect(normalFilter[0].value).toEqual('random_input');
  });


  it('should Test extractFiltersFromSearchRequest', () => {
    service = TestBed.get(GenericListService);
    let nameFilter = { column: 'name', value: 'random_input' } as DashboardFilters;
    let durationFilter = {
      column: 'duration', value: JSON.stringify({
        endTimeStamp: 1597881600,
        startTimeStamp: 1597276800
      })
    } as DashboardFilters;
    let dashboardFilters = [];
    dashboardFilters.push(nameFilter);
    dashboardFilters.push(durationFilter);
    const searchReq = {} as SearchRequest;
    searchReq.filters = dashboardFilters;
    const normalFilter = service.extractFiltersFromSearchRequest(searchReq as SearchRequest, true);
    expect(normalFilter).toEqual(JSON.stringify({ endTimeStamp: 1597881600, startTimeStamp: 1597276800 }));
  });


  it('should Test getAudienceMetrics', () => {
    service = TestBed.get(GenericListService);
    const result = service.getAudienceMetrics();
    expect(result.length).toEqual(8);
  });


  it('should Test anonymous methods in getAudienceMetrics', () => {
    service = TestBed.get(GenericListService);
    const resultMetrics = service.getAudienceMetrics();

    //action
    let result = resultMetrics[0].cell(passedElement);
    let expectation = passedElement.select;
    expect(result).toEqual(expectation);

    //active
    result = resultMetrics[1].cell(passedElement);
    expectation = passedElement.active;
    expect(result).toEqual(expectation);

    //name
    result = resultMetrics[2].cell(passedElement);
    expectation = passedElement.name;
    expect(result).toEqual(expectation);

    //id
    result = resultMetrics[3].cell(passedElement);
    expectation = passedElement.id.toString();
    expect(result).toEqual(expectation);

    //av name
    result = resultMetrics[4].cell(passedElement);
    expectation = passedElement.advertiserName;
    expect(result).toEqual(expectation);

    //av id
    result = resultMetrics[5].cell(passedElement);
    expectation = passedElement.advertiserId.toString();
    expect(result).toEqual(expectation);

    //total uu
    result = resultMetrics[6].cell(passedElement);
    expectation = passedElement.totalUU.toString();
    expect(result).toEqual(expectation);

    //daily uu
    result = resultMetrics[7].cell(passedElement);
    expectation = passedElement.dailyUU.toString();
    expect(result).toEqual(expectation);


    //total uu 2
    result = resultMetrics[6].cell({});
    expect(result).toEqual('0');

    //daily uu 2
    result = resultMetrics[7].cell({});
    expect(result).toEqual('0');
  });



  it('should Test anonymous methods in getCatalogDetailsMetrics', () => {
    service = TestBed.get(GenericListService);
    const resultMetrics = service.getCatalogDetailsMetrics();

    //leftpad
    let result = resultMetrics[0].cell(passedElement);
    expect(result).toEqual('');

    //active
    result = resultMetrics[1].cell(passedElement);
    let expectation = passedElement.name;
    expect(result).toEqual(expectation);

    //name
    result = resultMetrics[2].cell(passedElement);
    expectation = passedElement.variablePath;
    expect(result).toEqual(expectation);

    //id
    result = resultMetrics[3].cell(passedElement);
    expectation = passedElement.standardVariable;
    expect(result).toEqual(expectation);

    //av name
    result = resultMetrics[4].cell(passedElement);
    expectation = passedElement.description;
    expect(result).toEqual(expectation);

    //av id
    result = resultMetrics[5].cell(passedElement);
    expectation = passedElement.samples;
    expect(result).toEqual(expectation);
  });


  it('should Test anonymous methods in getCatalogMetrics', () => {
    service = TestBed.get(GenericListService);
    const resultMetrics = service.getCatalogMetrics();

    //leftpad
    let result = resultMetrics[0].cell(passedElement);
    expect(result).toEqual('');

    //active
    result = resultMetrics[1].cell(passedElement);
    let expectation = passedElement.active;
    expect(result).toEqual(expectation);

    //name
    result = resultMetrics[2].cell(passedElement);
    expectation = passedElement.name;
    expect(result).toEqual(expectation);

    //sourve
    result = resultMetrics[3].cell(passedElement);
    expectation = passedElement.source;
    expect(result).toEqual(expectation);

    //freq
    result = resultMetrics[4].cell(passedElement);
    expectation = '1 day';
    expect(result).toEqual(expectation);

    //last up
    result = resultMetrics[5].cell(passedElement);
    expectation = '27 Aug 2020';
    expect(result).toEqual(expectation);

    //last up
    result = resultMetrics[6].cell(passedElement);
    expectation = passedElement.updatedStatus;
    expect(result).toEqual(expectation);

    //item ipmorted
    result = resultMetrics[7].cell(passedElement);
    expectation = passedElement.objectsParsed.toString() + ' / ' + passedElement.objectsFound.toString();
    expect(result).toEqual(expectation);

    //success
    result = resultMetrics[8].cell(passedElement);
    expectation = passedElement.successRate.toString() + '%';
    expect(result).toEqual(expectation);

    //item ipmorted 2
    result = resultMetrics[7].cell({});
    expect(result).toEqual('0 / 0');

    //success 2
    result = resultMetrics[8].cell({});
    expect(result).toEqual('0.00%');
  });


  it('should Test anonymous methods in getPixelMetrics', () => {
    service = TestBed.get(GenericListService);

    localStorage.setItem(AppConstants.CACHED_USER_ROLE, 'ROLE_RW')
    const resultMetrics = service.getPixelMetrics();

    //action
    let result = resultMetrics[0].cell(passedElement);
    let expectation = passedElement.select;
    expect(result).toEqual(expectation);

    //drop
    result = resultMetrics[1].cell(passedElement);
    expectation = passedElement.action;
    expect(result).toEqual(expectation);

    //active
    result = resultMetrics[2].cell(passedElement);
    expectation = passedElement.active;
    expect(result).toEqual(expectation);

    //name
    result = resultMetrics[3].cell(passedElement);
    expectation = passedElement.name;
    expect(result).toEqual(expectation);

    //id
    result = resultMetrics[4].cell(passedElement);
    expectation = passedElement.id.toString();
    expect(result).toEqual(expectation);

    //conversions
    result = resultMetrics[5].cell(passedElement);
    expectation = passedElement.conversions.toString();
    expect(result).toEqual(expectation);

    //conversions with 0
    result = resultMetrics[5].cell({});
    expectation = '0'
    expect(result).toEqual(expectation);

    //clickValidityWindow
    result = resultMetrics[6].cell(passedElement);
    expectation = '1 day';
    expect(result).toEqual(expectation);

    //item ipmorted
    let passed = {
      type: {
        name: 'pixel type'
      },
      clickValidityWindow: 0,
      userFcap: null
    };


    //clickValidityWindow with 0
    result = resultMetrics[6].cell(passed);
    expectation = '0 Day';
    expect(result).toEqual(expectation);

    //fcap
    result = resultMetrics[7].cell(passed);
    expectation = 'No Limit';
    expect(result).toEqual(expectation);

    //type
    result = resultMetrics[8].cell(passed);
    expectation = passed.type.name;
    expect(result).toEqual(expectation);
  });



  it('should Test anonymous methods in getCreativeMetrics', () => {
    service = TestBed.get(GenericListService);

    localStorage.setItem(AppConstants.CACHED_USER_ROLE, 'ROLE_RW')
    const resultMetrics = service.getCreativeMetrics();

    //action
    let result = resultMetrics[0].cell(passedElement);
    let expectation = passedElement.select;
    expect(result).toEqual(expectation);

    //drop
    result = resultMetrics[1].cell(passedElement);
    expectation = passedElement.action;
    expect(result).toEqual(expectation);

    //active
    result = resultMetrics[2].cell(passedElement);
    expectation = passedElement.active;
    expect(result).toEqual(expectation);

    //name
    result = resultMetrics[3].cell(passedElement);
    expectation = passedElement.name;
    expect(result).toEqual(expectation);

    //id
    result = resultMetrics[4].cell(passedElement);
    expectation = passedElement.id.toString();
    expect(result).toEqual(expectation);

    //icon
    result = resultMetrics[5].cell(passedElement);
    expectation = passedElement.type;
    expect(result).toEqual(expectation);

    //size
    result = resultMetrics[7].cell(passedElement);
    expectation = passedElement.size.width + 'x' + passedElement.size.height;
    expect(result).toEqual(expectation);

    //creation time
    result = resultMetrics[8].cell(passedElement);
    expectation = '27 Aug 2020';
    expect(result).toEqual(expectation);


    //performance : impressions
    result = resultMetrics[9].cell(passedElement);
    expectation = passedElement.performanceData.impressions.toString();
    expect(result).toEqual(expectation);

    //performance : clicks
    result = resultMetrics[10].cell(passedElement);
    expectation = passedElement.performanceData.clicks.toString();
    expect(result).toEqual(expectation);

    //performance : conversions
    result = resultMetrics[11].cell(passedElement);
    expectation = passedElement.performanceData.conversions.toString();
    expect(result).toEqual(expectation);

    //performance : ctr
    result = resultMetrics[12].cell(passedElement);
    expectation = passedElement.performanceData.ctr + '%';
    expect(result).toEqual(expectation);

    //performance : ctc
    result = resultMetrics[13].cell(passedElement);
    expectation = passedElement.performanceData.ctc + '%';
    expect(result).toEqual(expectation);


    //performance with no data should be zero
    //performance : impressions
    result = resultMetrics[9].cell({});
    expect(result).toEqual('0');

    //performance : clicks
    result = resultMetrics[10].cell({});
    expect(result).toEqual('0');


    //performance : conversions
    result = resultMetrics[11].cell({});
    expect(result).toEqual('0');


    //performance : ctr
    result = resultMetrics[12].cell({});
    expect(result).toEqual('0%');

    //performance : ctc
    result = resultMetrics[13].cell({});
    expect(result).toEqual('0%');
  });



  it('should Test getCatalogDetailsMetricsHeader', () => {
    service = TestBed.get(GenericListService);
    let result = service.getCatalogDetailsMetricsHeader();
    expect(result.length).toEqual(4);
  });



});


