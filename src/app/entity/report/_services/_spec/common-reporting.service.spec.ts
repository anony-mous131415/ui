import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DashboardControllerService, DurationModel, FilterModel, ReportingRequest } from '@revxui/api-client-ts';
import * as moment from 'moment';
import { AdvancedConstants } from '../../_constants/AdvancedConstants';
import { CommonReportingService, DisaplayUi, GridData, ModalObject } from '../common-reporting.service';


const reportElementPassed = {
  advertiser: {
    id: 1,
    name: 'adv-name'
  },

  campaign: {
    id: 2,
    name: 'cmp-name'
  },

  strategy: {
    id: 3,
    name: 'str-name'
  },

  aggregator: {
    id: 4,
    name: 'agg-name'
  },

  creative: {
    id: 7,
    name: 'cr-name'
  },

  creative_size: '100x200',
  creative_offer_type: 'offer',
  advertiser_pricing: 'CPI',
  media_type: 'm-type',
  bid_strategy: 'b-str',
  optimization_type: 'ot-type',
  position: 'above',
  source_type: 'src',
  os: {
    id: 12,
    name: 'ios'
  },
  device_brand: 'apl',
  device_model: 'ipn11',

  ts_utc_hour: 1577836800, //1 jan
  ts_utc_day: 1580601600, // 2 feb
  ts_utc_week: 1583193600, // 3 mar

  starttime: '2020-08-24 00:00:00.0',//24 Aug 2020 00:00
  endtime: '2020-08-24 00:00:00.0',//24 Aug 2020 00:00

  app_store_certified: 'true',
  app_rating: '4.5',
  app_categories: 'sports',
  country: {
    id: 5,
    name: 'country-123'
  },

  state: {
    id: 5,
    name: 'state-123'
  },

  city: {
    id: 6,
    name: 'city-123'
  },

  conversion_type: 'click',
  user_ip: 'ip-address',
  user_id: 'id',
  transaction_id: '789',
  transaction_currency: 'USD',
  transaction_amount: 78,
  transaction_info: '',
  time_since_click_minutes: 123,
  time_since_impression_minutes: 456
}

const jan_2_2020_utc_epoch = 1577923200;
const jan_5_2020_utc_epoch = 1578182400;
const jan_6_2020_utc_epoch = 1578268800;

const jan_2_2020_utc_date = new Date(moment.utc(jan_2_2020_utc_epoch * 1000).format('llll'));
const jan_5_2020_utc_date = new Date(moment.utc(jan_5_2020_utc_epoch * 1000).format('llll'));

@Component({
  template: ''
})
export class DummyComponent { }


const dummyRoutes = [
  { path: 'report/conversion', component: DummyComponent },
  { path: 'report/advanced', component: DummyComponent },
  { path: 'report/advanced/result', component: DummyComponent },
  { path: 'report/conversion/result', component: DummyComponent },
  { path: 'random/path', component: DummyComponent },
]


describe('CommonReportingService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [
      DummyComponent
    ],

    imports: [
      HttpClientTestingModule,
      RouterTestingModule.withRoutes(dummyRoutes),
    ],

    providers: [
      { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
    ],
  }));


  it('should be created', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);
    expect(service).toBeTruthy();
  });


  //new-test-cases
  it('should be getDateRange', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    let masterReq: ReportingRequest = {
      duration: {
        start_timestamp: jan_2_2020_utc_epoch,
        end_timestamp: null
      }
    }

    //end-timestamp = null
    let result = service.getDateRange(masterReq);
    let expectedVal = [jan_2_2020_utc_date, jan_2_2020_utc_date];
    expect(result).toEqual(expectedVal);

    //end-timestamp = valid and different from start-timestamp
    masterReq.duration.end_timestamp = jan_6_2020_utc_epoch
    result = service.getDateRange(masterReq);
    expectedVal = [jan_2_2020_utc_date, jan_5_2020_utc_date];
    expect(result).toEqual(expectedVal);

    //end-timestamp = valid and same as start-timestamp
    masterReq.duration.start_timestamp = jan_5_2020_utc_epoch
    masterReq.duration.end_timestamp = jan_5_2020_utc_epoch
    result = service.getDateRange(masterReq);
    expectedVal = [jan_5_2020_utc_date, jan_5_2020_utc_date];
    expect(result).toEqual(expectedVal);
  });



  it('should be getEpoch', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    //current epoch
    let dateInput = new Date();
    let utcEpoch_of_dateInput = Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()) / 1000;
    let result = service.getEpoch(dateInput);
    expect(result).toEqual(utcEpoch_of_dateInput);
  });



  it('should be isYesterdayOrToday', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    //today
    let now = new Date();
    let utc_epoch_at_12am_of_now = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000;
    let result = service.isYesterdayOrToday(utc_epoch_at_12am_of_now);
    expect(result).toEqual(true);

    //some random epoch
    result = service.isYesterdayOrToday(jan_2_2020_utc_epoch);
    expect(result).toEqual(false);
  });



  it('should be setDuration', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);
    let masterReq: ReportingRequest = {
      duration: {
        start_timestamp: jan_2_2020_utc_epoch,
        end_timestamp: null
      }
    }

    //when end-epoch is set as null
    let now = new Date();
    let utc_epoch_at_12am_of_now = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000;
    service.setDuration([now, now], masterReq);
    let expectation: DurationModel = {
      start_timestamp: utc_epoch_at_12am_of_now,
      end_timestamp: null
    }
    expect(masterReq.duration).toEqual(expectation);


    //when end-epoch is not set as null
    const input_dates = [jan_2_2020_utc_date, jan_5_2020_utc_date]
    service.setDuration(input_dates, masterReq);
    expectation = {
      start_timestamp: jan_2_2020_utc_epoch,
      end_timestamp: 1578268800
    }
    expect(masterReq.duration).toEqual(expectation);
  });


  it('should be extractFromObjectArray', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);
    const inputArr: any[] = [
      { id: 1, name: 'n1', value: 'v1' },
      { id: 2, name: 'n2', value: 'v2' },
      { id: 3, name: 'n3', value: 'v3' }
    ];
    const ids = [1, 2, 3];
    const names = ['n1', 'n2', 'n3'];
    const values = ['v1', 'v2', 'v3'];

    //extract-ids
    let result = service.extractFromObjectArray(inputArr, 'id');
    expect(result).toEqual(ids);

    //extract-names
    result = service.extractFromObjectArray(inputArr, 'name');
    expect(result).toEqual(names);

    //extract-values
    result = service.extractFromObjectArray(inputArr, 'value');
    expect(result).toEqual(values);
  });


  it('should be extractFromObjectArray', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);
    let masterReq: ReportingRequest = {
      filters: [
        { column: 'c1', value: 'v1' },
        { column: 'c2', value: 'v2' },
        { column: 'c3', value: 'v3' },
      ]
    }

    let expectation = [
      { column: 'c2', value: 'v2' },
      { column: 'c3', value: 'v3' },
    ]

    //when filters are there
    service.removeFromMasterFilterArray('c1', masterReq);
    expect(masterReq.filters).toEqual(expectation);

    //when no filters
    masterReq.filters = []
    service.removeFromMasterFilterArray('c2', masterReq);
    expect(masterReq.filters).toEqual([]);
  });



  it('should be appendToMasterFilterArray', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    let masterReq: ReportingRequest = {
      filters: [
        { column: 'c1', value: 'v1' },
        { column: 'c2', value: 'v2' },
        // { column: 'c3', value: 'v3' },
      ]
    }

    let inputFilter: FilterModel = {
      column: 'c3',
      value: 'v3'
    };

    let expectation_1: FilterModel[] = [
      { column: 'c1', value: 'v1' },
      { column: 'c2', value: 'v2' },
      { column: 'c3', value: 'v3' }
    ]

    let expectation_2: FilterModel[] = [
      { column: 'c3', value: 'v3' }
    ]


    //when filters are there
    service.appendToMasterFilterArray(inputFilter, masterReq);
    expect(masterReq.filters).toEqual(expectation_1);

    //when no filters
    masterReq.filters = []
    service.appendToMasterFilterArray(inputFilter, masterReq);
    expect(masterReq.filters).toEqual(expectation_2);

    //when no filters and duplicates allowed
    masterReq.filters = []
    service.appendToMasterFilterArray(inputFilter, masterReq, true);
    expect(masterReq.filters).toEqual(expectation_2);
  });



  it('should be formFilterElementWithArray', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);
    let expectation: FilterModel = {
      column: 'c1',
      operator: 'in',
      value: 'v1'
    };

    //test-1
    let result = service.formFilterElementWithArray('c1', 'v1');
    expect(result).toEqual(expectation);

    //test-2
    expectation.operator = 'eq'
    result = service.formFilterElementWithArray('c1', 'v1', null, 'eq');
    expect(result).toEqual(expectation);

    //test-3
    let inputArr = [
      { id: 1, name: 'n1' },
      { id: 2, name: 'n2' }
    ];
    expectation.operator = 'eq'
    expectation.value = [1, 2]
    result = service.formFilterElementWithArray('c1', inputArr, null, 'eq');
    expect(result).toEqual(expectation);

    //test-4
    expectation.operator = 'eq'
    expectation.value = ['n1', 'n2']
    result = service.formFilterElementWithArray('c1', inputArr, 'name', 'eq');
    expect(result).toEqual(expectation);
  });


  it('should be modifyFilterArray', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    const filterCol = 'c1';

    let selectedArr = [1, 2, 3];
    let rejectedArr = [];

    let gridDataArr: GridData[] = [
      { id: 1, name: 'n1', isNotSelected: false },
      { id: 2, name: 'n2', isNotSelected: false },
      { id: 3, name: 'n3', isNotSelected: false },
    ]

    let mySet: Set<GridData> = new Set(gridDataArr);

    let masterReq: ReportingRequest = {
      filters: []
    }


    //test-1
    service.modifyFilterArray(filterCol, selectedArr, rejectedArr, mySet, masterReq);
    expect(masterReq.filters).toEqual([]);

    //test-2
    selectedArr = [1, 2];
    rejectedArr = [3];
    service.modifyFilterArray(filterCol, selectedArr, rejectedArr, mySet, masterReq);
    let expectedFilters: FilterModel[] = [
      { column: 'c1', operator: 'not_in', value: [3] }
    ];
    expect(masterReq.filters).toEqual(expectedFilters);


    //test-3
    selectedArr = [1];
    rejectedArr = [2, 3];
    service.modifyFilterArray(filterCol, selectedArr, rejectedArr, mySet, masterReq);
    expectedFilters = [
      { column: 'c1', operator: 'in', value: [1] }
    ];
    expect(masterReq.filters).toEqual(expectedFilters);

    //test-3
    selectedArr = [1];
    rejectedArr = [2];
    masterReq.filters = []
    service.modifyFilterArray(filterCol, selectedArr, rejectedArr, mySet, masterReq);
    expect(masterReq.filters).toEqual([]);
  });



  it('should be getRequiredMetrics', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    service.allColumnProperties = {
      metric1: {
        id: 1,
        name: 'n1',
        reportType: AppConstants.REPORTS.ADVANCED
      },
      metric2: {
        id: 2,
        name: 'n2',
        reportType: AppConstants.REPORTS.CONVERSION
      },
      metric3: {
        id: 3,
        name: 'n3',
        reportType: AppConstants.REPORTS.BOTH
      }
    }


    //test-1
    let result = service.getRequiredMetrics(AppConstants.REPORTS.ADVANCED);
    let expectation = {
      metric1: {
        id: 1,
        name: 'n1',
        reportType: AppConstants.REPORTS.ADVANCED
      },
      metric3: {
        id: 3,
        name: 'n3',
        reportType: AppConstants.REPORTS.BOTH
      }
    }
    expect(result).toEqual(expectation);


    //test-2
    result = service.getRequiredMetrics(AppConstants.REPORTS.CONVERSION);
    let expectation2 = {
      metric2: {
        id: 2,
        name: 'n2',
        reportType: AppConstants.REPORTS.CONVERSION
      },
      metric3: {
        id: 3,
        name: 'n3',
        reportType: AppConstants.REPORTS.BOTH
      }
    }
    expect(result).toEqual(expectation2);
  });


  it('should test getReportType ', fakeAsync(() => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);
    const advancedResult = 'report/advanced/result';
    const convResult = 'report/conversion/result';

    //test-1
    let myRouter = TestBed.get(Router);
    myRouter.navigate([advancedResult]);
    tick();//wait for some time

    // let location = TestBed.get(Location);
    // expect(location.path()).toEqual('');

    let result = service.getReportType();
    expect(result).toEqual(AppConstants.REPORTS.ADVANCED);

    //test-2
    myRouter.navigate([convResult]);
    tick();
    result = service.getReportType();
    expect(result).toEqual(AppConstants.REPORTS.CONVERSION);

    //test-2
    myRouter.navigate(['random/path']);
    tick();
    result = service.getReportType();
    expect(result).toEqual('');
  }));


  it('should test getUiIndicatorForModals ', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    let arr: GridData[] = [
      { id: 1, name: 'n1', isNotSelected: true },
      { id: 2, name: 'n2', isNotSelected: false },
      { id: 3, name: 'n3', isNotSelected: false }
    ];

    let input: ModalObject = {
      set: new Set(arr),
      map: new Map()
    }

    //test-1
    let result = service.getUiIndicatorForModals(input);
    expect(result).toEqual(true);


    //test-2
    arr[0].isNotSelected = false;
    result = service.getUiIndicatorForModals(input);
    expect(result).toEqual(false);
  });



  it('should test getUiData ', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);

    let arr: GridData[] = [
      { id: 1, name: 'n1', isNotSelected: false },
      { id: 2, name: 'n2', isNotSelected: false },
      { id: 3, name: 'n3', isNotSelected: false }
    ];

    let input: ModalObject = {
      set: new Set(arr),
      map: new Map()
    }

    let expectedVal: DisaplayUi = {
      isArray: false,
      type: AdvancedConstants.UI_TYPE.INCLUDE,
      arrayOfObjects: []
    }

    //test-1
    let result = service.getUiData(input);
    expect(result).toEqual(expectedVal);


    //test-2
    arr[0].isNotSelected = true;
    arr[1].isNotSelected = true;
    arr[2].isNotSelected = true;
    input.set = new Set(arr);
    expectedVal.type = AdvancedConstants.UI_TYPE.EXCLUDE;
    result = service.getUiData(input);
    expect(result).toEqual(expectedVal);


    //test-3
    arr[0].isNotSelected = false;
    arr[1].isNotSelected = true;
    arr[2].isNotSelected = true;
    input.set = new Set(arr);
    expectedVal.type = AdvancedConstants.UI_TYPE.INCLUDE;
    expectedVal.isArray = true;
    expectedVal.arrayOfObjects = [{ id: 1, name: 'n1', isNotSelected: false }]
    result = service.getUiData(input);
    expect(result).toEqual(expectedVal);


    //test-4
    arr[0].isNotSelected = true;
    arr[1].isNotSelected = false;
    arr[2].isNotSelected = false;
    input.set = new Set(arr);
    expectedVal.type = AdvancedConstants.UI_TYPE.EXCLUDE;
    expectedVal.isArray = true;
    expectedVal.arrayOfObjects = [{ id: 1, name: 'n1', isNotSelected: true }]
    result = service.getUiData(input);
    expect(result).toEqual(expectedVal);
  });


  it('should test anonymous methods of  allColumnProperties object', () => {
    const service: CommonReportingService = TestBed.get(CommonReportingService);
    const allMetric = service.allColumnProperties;

    //impression
    let result = allMetric['impressions'].cell(STUB.elementPassed);
    let expectedVal = STUB.elementPassed.impressions.toString()
    expect(result).toEqual(expectedVal);

    //clicks
    result = allMetric['clicks'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.clicks.toString()
    expect(result).toEqual(expectedVal);

    //invalid_clicks
    result = allMetric['invalid_clicks'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.invalid_clicks.toString()
    expect(result).toEqual(expectedVal);

    //total_install
    result = allMetric['total_install'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.total_install.toString()
    expect(result).toEqual(expectedVal);


    //imp_installs
    result = allMetric['imp_installs'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.imp_installs.toString()
    expect(result).toEqual(expectedVal);

    //click_installs
    result = allMetric['click_installs'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.click_installs.toString()
    expect(result).toEqual(expectedVal);

    //conversions
    result = allMetric['conversions'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.conversions.toString()
    expect(result).toEqual(expectedVal);


    //conversions_view
    result = allMetric['conversions_view'].cell(STUB.elementPassed);
    expectedVal = '10,000'
    expect(result).toEqual(expectedVal);

    //conversions_click
    result = allMetric['conversions_click'].cell(STUB.elementPassed);
    expectedVal = '5,400'
    expect(result).toEqual(expectedVal);

    //revenue
    result = allMetric['revenue'].cell(STUB.elementPassed);
    expectedVal = '$ ' + STUB.elementPassed.revenue;
    expect(result).toEqual(expectedVal);

    //spend
    result = allMetric['spend'].cell(STUB.elementPassed);
    expectedVal = '$ ' + '4,000';
    expect(result).toEqual(expectedVal);

    //margin
    result = allMetric['margin'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.margin.toString();
    expect(result).toEqual(expectedVal);

    //ctr
    result = allMetric['ctr'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.ctr.toFixed(2).toString() + '%';
    expect(result).toEqual(expectedVal);


    //ctc
    result = allMetric['ctc'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.ctc.toFixed(2).toString() + '%';
    expect(result).toEqual(expectedVal);


    //cpi
    result = allMetric['cpi'].cell(STUB.elementPassed);
    expectedVal = '$ ' + '2,500';
    expect(result).toEqual(expectedVal);

    //iti
    result = allMetric['iti'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.iti.toString();
    expect(result).toEqual(expectedVal);

    //conv_rate
    result = allMetric['conv_rate'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.conv_rate.toFixed(2).toString() + '%';
    expect(result).toEqual(expectedVal);

    //cvr
    result = allMetric['cvr'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.cvr.toFixed(2).toString() + '%';
    expect(result).toEqual(expectedVal);

    //click_txn_amount
    result = allMetric['click_txn_amount'].cell(STUB.elementPassed);
    expectedVal = '$ ' + STUB.elementPassed.click_txn_amount.toString();
    expect(result).toEqual(expectedVal);

    //view_txn_amount
    result = allMetric['view_txn_amount'].cell(STUB.elementPassed);
    expectedVal = '$ ' + '1,000';
    expect(result).toEqual(expectedVal);

    //roi
    result = allMetric['roi'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.roi.toString();
    expect(result).toEqual(expectedVal);

    //bid_price
    result = allMetric['bid_price'].cell(STUB.elementPassed);
    expectedVal = '$ ' + '4,500';
    expect(result).toEqual(expectedVal);

    //imp_per_conv
    result = allMetric['imp_per_conv'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.imp_per_conv.toString();
    expect(result).toEqual(expectedVal);

    //publisher_ecpm
    result = allMetric['publisher_ecpm'].cell(STUB.elementPassed);
    expectedVal = '$ 6,700'
    expect(result).toEqual(expectedVal);

    //publisher_ecpc
    result = allMetric['publisher_ecpc'].cell(STUB.elementPassed);
    expectedVal = '8,900'
    expect(result).toEqual(expectedVal);

    //publisher_ecpa
    result = allMetric['publisher_ecpa'].cell(STUB.elementPassed);
    expectedVal = STUB.elementPassed.publisher_ecpa.toString();
    expect(result).toEqual(expectedVal);

    //txn_amount
    result = allMetric['txn_amount'].cell(STUB.elementPassed);
    expectedVal = '9,800'
    expect(result).toEqual(expectedVal);

    //advertiser_ecpm
    result = allMetric['advertiser_ecpm'].cell(STUB.elementPassed);
    expectedVal = '$ 78'
    expect(result).toEqual(expectedVal);

    //txn_amount
    result = allMetric['advertiser_ecpm'].cell(STUB.elementPassed);
    expectedVal = '$ 78'
    expect(result).toEqual(expectedVal);

    //advertiser
    result = allMetric['advertiser'].cell(reportElementPassed);
    expectedVal = reportElementPassed.advertiser.name;
    expect(result).toEqual(expectedVal);

    //aggregator
    result = allMetric['aggregator'].cell(reportElementPassed);
    expectedVal = reportElementPassed.aggregator.name;
    expect(result).toEqual(expectedVal);

    //campaign
    result = allMetric['campaign'].cell(reportElementPassed);
    expectedVal = reportElementPassed.campaign.name;
    expect(result).toEqual(expectedVal);

    //strategy
    result = allMetric['strategy'].cell(reportElementPassed);
    expectedVal = reportElementPassed.strategy.name;
    expect(result).toEqual(expectedVal);

    //app_store_certified
    result = allMetric['app_store_certified'].cell(reportElementPassed);
    expectedVal = reportElementPassed.app_store_certified;
    expect(result).toEqual(expectedVal);


    //app_rating
    result = allMetric['app_rating'].cell(reportElementPassed);
    expectedVal = reportElementPassed.app_rating;
    expect(result).toEqual(expectedVal);

    //app_rating
    result = allMetric['app_categories'].cell(reportElementPassed);
    expectedVal = reportElementPassed.app_categories;
    expect(result).toEqual(expectedVal);

    //app_categories
    result = allMetric['app_categories'].cell(reportElementPassed);
    expectedVal = reportElementPassed.app_categories;
    expect(result).toEqual(expectedVal);

    //country
    result = allMetric['country'].cell(reportElementPassed);
    expectedVal = reportElementPassed.country.name;
    expect(result).toEqual(expectedVal);

    //state
    result = allMetric['state'].cell(reportElementPassed);
    expectedVal = reportElementPassed.state.name;
    expect(result).toEqual(expectedVal);

    //city
    result = allMetric['city'].cell(reportElementPassed);
    expectedVal = reportElementPassed.city.name;
    expect(result).toEqual(expectedVal);

    //creative
    result = allMetric['creative'].cell(reportElementPassed);
    expectedVal = reportElementPassed.creative.name;
    expect(result).toEqual(expectedVal);

    //creative_size
    result = allMetric['creative_size'].cell(reportElementPassed);
    expectedVal = reportElementPassed.creative_size;
    expect(result).toEqual(expectedVal);

    //creative_offer_type
    result = allMetric['creative_offer_type'].cell(reportElementPassed);
    expectedVal = reportElementPassed.creative_offer_type;
    expect(result).toEqual(expectedVal);

    //advertiser_pricing
    result = allMetric['advertiser_pricing'].cell(reportElementPassed);
    expectedVal = reportElementPassed.advertiser_pricing;
    expect(result).toEqual(expectedVal);

    //media_type
    result = allMetric['media_type'].cell(reportElementPassed);
    expectedVal = reportElementPassed.media_type;
    expect(result).toEqual(expectedVal);

    //bid_strategy
    result = allMetric['bid_strategy'].cell(reportElementPassed);
    expectedVal = reportElementPassed.bid_strategy;
    expect(result).toEqual(expectedVal);

    //optimization_type
    result = allMetric['optimization_type'].cell(reportElementPassed);
    expectedVal = reportElementPassed.optimization_type;
    expect(result).toEqual(expectedVal);

    //position
    result = allMetric['position'].cell(reportElementPassed);
    expectedVal = reportElementPassed.position;
    expect(result).toEqual(expectedVal);

    //source_type
    result = allMetric['source_type'].cell(reportElementPassed);
    expectedVal = reportElementPassed.source_type;
    expect(result).toEqual(expectedVal);

    //source_type
    result = allMetric['os'].cell(reportElementPassed);
    expectedVal = reportElementPassed.os.name;
    expect(result).toEqual(expectedVal);

    //os
    result = allMetric['os'].cell(reportElementPassed);
    expectedVal = reportElementPassed.os.name;
    expect(result).toEqual(expectedVal);

    //device_brand
    result = allMetric['device_brand'].cell(reportElementPassed);
    expectedVal = reportElementPassed.device_brand;
    expect(result).toEqual(expectedVal);

    //device_model
    result = allMetric['device_model'].cell(reportElementPassed);
    expectedVal = reportElementPassed.device_model;
    expect(result).toEqual(expectedVal);

    //starttime
    result = allMetric['starttime'].cell(reportElementPassed);
    expectedVal = '24 Aug 2020 00:00';
    expect(result).toEqual(expectedVal);

    //endtime
    result = allMetric['endtime'].cell(reportElementPassed);
    expectedVal = '24 Aug 2020 00:00';
    expect(result).toEqual(expectedVal);

    //ts_utc_hour
    result = allMetric['ts_utc_hour'].cell(reportElementPassed);
    expectedVal = '01 Jan 2020 00:00';
    expect(result).toEqual(expectedVal);

    //ts_utc_day
    result = allMetric['ts_utc_day'].cell(reportElementPassed);
    expectedVal = '02 Feb 2020';
    expect(result).toEqual(expectedVal);

    //ts_utc_week
    result = allMetric['ts_utc_week'].cell(reportElementPassed);
    expectedVal = '03 Mar 2020';
    expect(result).toEqual(expectedVal);



    //conversion_type
    result = allMetric['conversion_type'].cell(reportElementPassed);
    expectedVal = reportElementPassed.conversion_type;
    expect(result).toEqual(expectedVal);

    //user_ip
    result = allMetric['user_ip'].cell(reportElementPassed);
    expectedVal = reportElementPassed.user_ip;
    expect(result).toEqual(expectedVal);

    //user_id
    result = allMetric['user_id'].cell(reportElementPassed);
    expectedVal = reportElementPassed.user_id;
    expect(result).toEqual(expectedVal);

    //transaction_id
    result = allMetric['transaction_id'].cell(reportElementPassed);
    expectedVal = reportElementPassed.transaction_id;
    expect(result).toEqual(expectedVal);

    //transaction_currency
    result = allMetric['transaction_currency'].cell(reportElementPassed);
    expectedVal = reportElementPassed.transaction_currency;
    expect(result).toEqual(expectedVal);

    //transaction_amount
    result = allMetric['transaction_amount'].cell(reportElementPassed);
    expectedVal = reportElementPassed.transaction_amount.toString();
    expect(result).toEqual(expectedVal);

    //transaction_amount
    result = allMetric['transaction_amount'].cell(reportElementPassed);
    expectedVal = reportElementPassed.transaction_amount.toString();
    expect(result).toEqual(expectedVal);

    //transaction_info
    result = allMetric['transaction_info'].cell(reportElementPassed);
    expectedVal = reportElementPassed.transaction_info.toString();
    expect(result).toEqual(expectedVal);

    //time_since_click_minutes
    result = allMetric['time_since_click_minutes'].cell(reportElementPassed);
    expectedVal = reportElementPassed.time_since_click_minutes.toString() + ' minutes';
    expect(result).toEqual(expectedVal);


    //time_since_impression_minutes
    result = allMetric['time_since_impression_minutes'].cell(reportElementPassed);
    expectedVal = reportElementPassed.time_since_impression_minutes.toString() + ' minutes';
    expect(result).toEqual(expectedVal);
  });



});
