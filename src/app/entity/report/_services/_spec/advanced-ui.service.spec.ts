import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DashboardControllerService, FilterModel, ReportingControllerService, ReportingRequest } from '@revxui/api-client-ts';
import { AdvancedConstants } from '../../_constants/AdvancedConstants';
import { AdvancedUiService } from '../advanced-ui.service';
import { CheckBoxesObj, ModalObject, GridData } from '../common-reporting.service';

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


describe('AdvancedUiService', () => {
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
      { provide: ReportingControllerService, useClass: STUB.ReportingControllerService_stub },
    ],
  }));

  it('should be created', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);
    expect(service).toBeTruthy();
  });

  //new-test-cases
  it('should test getUiIndicatorForCheckBox', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);

    let testObjectArr: CheckBoxesObj[] = [
      { label: 'l1', value: 'v1', select: false },
      { label: 'l2', value: 'v2', select: true },
      { label: 'l3', value: 'v3', select: true },
    ];

    //test-1 : position
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.POSITION, testObjectArr);
    let result = service.getUiIndicatorForCheckBox(AdvancedConstants.ENTITY.POSITIONS);
    expect(result).toEqual(true);

    //test-1 : position
    testObjectArr[0].select = true
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.PRICING, testObjectArr);
    result = service.getUiIndicatorForCheckBox(AdvancedConstants.ENTITY.PRICING);
    expect(result).toEqual(false);

    //test-1 : channel
    testObjectArr[0].select = true
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CHANNEL, testObjectArr);
    result = service.getUiIndicatorForCheckBox(AdvancedConstants.ENTITY.CHANNELS);
    expect(result).toEqual(false);
  });


  it('should test getModalEntities', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);

    let testModalObjec: ModalObject = {
      set: new Set(),
      map: new Map()
    };

    testModalObjec.map.set(1, true);
    testModalObjec.set = new Set([{ id: 1, name: 'n1', isNotSelected: false }]);

    //test-1 : advertiser
    service.setModalEntities(AppConstants.ENTITY.ADVERTISER, testModalObjec);
    let result = service.getModalEntities(AppConstants.ENTITY.ADVERTISER);
    expect(result).toEqual(testModalObjec);

    //test-2 : campaign
    service.setModalEntities(AppConstants.ENTITY.CAMPAIGN, testModalObjec);
    result = service.getModalEntities(AppConstants.ENTITY.CAMPAIGN);
    expect(result).toEqual(testModalObjec);

    //test-3 : strategy
    service.setModalEntities(AppConstants.ENTITY.STRATEGY, testModalObjec);
    result = service.getModalEntities(AppConstants.ENTITY.STRATEGY);
    expect(result).toEqual(testModalObjec);

    //test-4 : aggregator
    service.setModalEntities(AppConstants.ENTITY.AGGREGATOR, testModalObjec);
    result = service.getModalEntities(AppConstants.ENTITY.AGGREGATOR);
    expect(result).toEqual(testModalObjec);

    //test-5 : coutry
    service.setModalEntities(AdvancedConstants.ENTITY.COUNTRY, testModalObjec);
    result = service.getModalEntities(AdvancedConstants.ENTITY.COUNTRY);
    expect(result).toEqual(testModalObjec);

    //test-6 : state
    service.setModalEntities(AdvancedConstants.ENTITY.STATE, testModalObjec);
    result = service.getModalEntities(AdvancedConstants.ENTITY.STATE);
    expect(result).toEqual(testModalObjec);

    //test-7 : city
    service.setModalEntities(AdvancedConstants.ENTITY.CITY, testModalObjec);
    result = service.getModalEntities(AdvancedConstants.ENTITY.CITY);
    expect(result).toEqual(testModalObjec);

    //test-8 : creative
    service.setModalEntities(AppConstants.ENTITY.CREATIVE, testModalObjec);
    result = service.getModalEntities(AppConstants.ENTITY.CREATIVE);
    expect(result).toEqual(testModalObjec);

    //test-9 : cr_size
    service.setModalEntities(AdvancedConstants.ENTITY.CREATIVE_SIZE, testModalObjec);
    result = service.getModalEntities(AdvancedConstants.ENTITY.CREATIVE_SIZE);
    expect(result).toEqual(testModalObjec);
  });


  it('should test setAdvertiserGeographyFilter', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);

    let gridDataArr: GridData[] = [
      { id: 1, name: 'a1', isNotSelected: true },
      { id: 2, name: 'a2', isNotSelected: false },
      { id: 3, name: 'a3', isNotSelected: false },
    ]

    const filter_expectation_when_1_entity_is_not_selected: FilterModel[] = [{
      column: "advertiser",
      operator: "not_in",
      value: [1]
    }];

    const filter_expectation_when_only_1_entity_is_selected: FilterModel[] = [{
      column: "advertiser",
      operator: "in",
      value: [3]
    }];

    const inputAdvObj: ModalObject = {
      set: new Set(gridDataArr),
      map: new Map()
    }
    inputAdvObj.map.set(1, true);

    const dummyObj: ModalObject = {
      set: new Set(),
      map: new Map()
    }

    //test-1 : when only 1 advertiser is un-selected
    service.setAdvertiserGeographyFilter(true, inputAdvObj, dummyObj, dummyObj, AdvancedConstants.FILTER_COLUMN.ADVERTISER, AdvancedConstants.FILTER_COLUMN.CAMPAIGN, AdvancedConstants.FILTER_COLUMN.STRATEGY);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_1_entity_is_not_selected);

    //test-2 : when only 1 advertiser is selected
    gridDataArr[1].isNotSelected = true;
    inputAdvObj.set = new Set(gridDataArr);
    service.setAdvertiserGeographyFilter(true, inputAdvObj, dummyObj, dummyObj, AdvancedConstants.FILTER_COLUMN.ADVERTISER, AdvancedConstants.FILTER_COLUMN.CAMPAIGN, AdvancedConstants.FILTER_COLUMN.STRATEGY);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_only_1_entity_is_selected);


    service.setDefaultRequest();
    filter_expectation_when_1_entity_is_not_selected[0].column = 'country'
    filter_expectation_when_only_1_entity_is_selected[0].column = 'country'


    //test-3 : when only 1 country is un-selected
    gridDataArr[1].isNotSelected = false;
    inputAdvObj.set = new Set(gridDataArr);
    service.setAdvertiserGeographyFilter(false, inputAdvObj, dummyObj, dummyObj, AdvancedConstants.FILTER_COLUMN.COUNTRY, AdvancedConstants.FILTER_COLUMN.STATE, AdvancedConstants.FILTER_COLUMN.CITY);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_1_entity_is_not_selected);

    //test-4 : when only 1 country is selected
    gridDataArr[1].isNotSelected = true;
    inputAdvObj.set = new Set(gridDataArr);
    service.setAdvertiserGeographyFilter(false, inputAdvObj, dummyObj, dummyObj, AdvancedConstants.FILTER_COLUMN.COUNTRY, AdvancedConstants.FILTER_COLUMN.STATE, AdvancedConstants.FILTER_COLUMN.CITY);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_only_1_entity_is_selected);


  });


  it('should test getCheckBoxObjectArray and setCheckBoxObjectArray', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);

    const dummyCheckBoxesObj1: CheckBoxesObj[] = [
      { value: 'v1', label: 'l1', select: true },
    ];

    const dummyCheckBoxesObj2: CheckBoxesObj[] = [
      { value: 'v2', label: 'l2', select: true },
    ];

    const dummyCheckBoxesObj3: CheckBoxesObj[] = [
      { value: 'v3', label: 'l3', select: true },
    ];

    const testCheckBoxesObj: CheckBoxesObj[] = [
      { value: 'v4', label: 'l4', select: true },
      { value: 'v5', label: 'l5', select: true },
    ];

    let expectation: FilterModel[] = [
      { column: 'media_type', operator: 'in', value: ['v4'] }
    ];

    // test-1 : creative-media - all selected
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA, testCheckBoxesObj);
    expect(service.getRequestObject().filters).toEqual([]);

    //test-2 : creative-media  - 1 of 2 selected
    testCheckBoxesObj[1].select = false;
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA, testCheckBoxesObj);
    expect(service.getRequestObject().filters).toEqual(expectation);

    //test-3 : creative-media none selected
    testCheckBoxesObj[0].select = false;
    testCheckBoxesObj[1].select = false;
    expectation[0].operator = 'not_in';
    expectation[0].value = ['v4', 'v5'];
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA, testCheckBoxesObj);
    expect(service.getRequestObject().filters).toEqual(expectation);

    //test-4 : getter creativ-mdeia
    expect(service.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA)).toEqual(testCheckBoxesObj);

    //other switch cases
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.POSITION, dummyCheckBoxesObj1);
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CHANNEL, dummyCheckBoxesObj2);
    service.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.PRICING, dummyCheckBoxesObj3);

    expect(service.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.POSITION)).toEqual(dummyCheckBoxesObj1);
    expect(service.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CHANNEL)).toEqual(dummyCheckBoxesObj2);
    expect(service.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.PRICING)).toEqual(dummyCheckBoxesObj3);
  });


  it('should test setCreativeAggregatorFilter', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);

    let gridDataArr: GridData[] = [
      { id: 1, name: 'a1', isNotSelected: true },
      { id: 2, name: 'a2', isNotSelected: false },
      { id: 3, name: 'a3', isNotSelected: false },
    ]

    let filter_expectation_when_1_is_not_selected: FilterModel[] = [{
      column: "creative",
      operator: "not_in",
      value: [1]
    }];

    let filter_expectation_when_only_1_is_selected: FilterModel[] = [{
      column: "creative",
      operator: "in",
      value: [3]
    }];

    const inputAdvObj: ModalObject = {
      set: new Set(gridDataArr),
      map: new Map()
    }
    inputAdvObj.map.set(1, true);


    //test-1 : when only 1 creative is un-selected
    service.setCreativeAggregatorFilter(AppConstants.ENTITY.CREATIVE, AdvancedConstants.FILTER_COLUMN.CREATIVE, inputAdvObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_1_is_not_selected);

    //test-2 : when only 1 creative is selected
    gridDataArr[1].isNotSelected = true;
    inputAdvObj.set = new Set(gridDataArr);
    service.setCreativeAggregatorFilter(AppConstants.ENTITY.CREATIVE, AdvancedConstants.FILTER_COLUMN.CREATIVE, inputAdvObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_only_1_is_selected);


    service.setDefaultRequest();

    //test-3 : when only 1 aggregator is un-selected
    filter_expectation_when_1_is_not_selected[0].column = 'aggregator';
    gridDataArr[0].isNotSelected = true;
    gridDataArr[1].isNotSelected = false;
    gridDataArr[2].isNotSelected = false;
    inputAdvObj.set = new Set(gridDataArr);
    service.setCreativeAggregatorFilter(AppConstants.ENTITY.AGGREGATOR, AdvancedConstants.FILTER_COLUMN.AGGREGATOR, inputAdvObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_1_is_not_selected);

    // test-4 : when only 1 aggregator is selected
    filter_expectation_when_only_1_is_selected[0].column = 'aggregator';
    gridDataArr[0].isNotSelected = true;
    gridDataArr[1].isNotSelected = true;
    gridDataArr[2].isNotSelected = false;
    inputAdvObj.set = new Set(gridDataArr);
    service.setCreativeAggregatorFilter(AppConstants.ENTITY.AGGREGATOR, AdvancedConstants.FILTER_COLUMN.AGGREGATOR, inputAdvObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_only_1_is_selected);
  });


  it('should test setCreativeSizeFilter', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);

    let gridDataArr: GridData[] = [
      { id: 1, name: '1x1', isNotSelected: true },
      { id: 2, name: '2x2', isNotSelected: false },
      { id: 3, name: '3x3', isNotSelected: false },
    ];


    let selected_heights = [3];
    let selected_widths = [3];

    let rejected_heights = [1];
    let rejected_widths = [1]


    const filter_expectation_when_1_is_not_selected: FilterModel[] = [
      {
        column: "creative_height",
        operator: "not_in",
        value: rejected_heights
      },

      {
        column: "creative_width",
        operator: "not_in",
        value: rejected_widths
      }
    ];

    const filter_expectation_when_only_1_is_selected: FilterModel[] = [
      {
        column: "creative_height",
        operator: "in",
        value: selected_heights
      },

      {
        column: "creative_width",
        operator: "in",
        value: selected_heights
      }
    ];

    const inputAdvObj: ModalObject = {
      set: new Set(gridDataArr),
      map: new Map()
    }
    inputAdvObj.map.set(1, true);


    //test-1 : when only 1 is un-selected
    service.setCreativeSizeFilter(inputAdvObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_1_is_not_selected);

    //test-2 : when only 1 is selected
    // gridDataArr[0].isNotSelected = true;
    gridDataArr[1].isNotSelected = true;
    gridDataArr[2].isNotSelected = false;
    inputAdvObj.set = new Set(gridDataArr);
    service.setCreativeSizeFilter(inputAdvObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_only_1_is_selected);
  });


  it('should test export and show', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);
    const calledService = TestBed.get(ReportingControllerService);

    let spy = spyOn(calledService, 'customReportCSVUsingPOST');
    service.export('entity-name');
    expect(spy).toHaveBeenCalledTimes(1);

    spy = spyOn(calledService, 'customReportUsingPOST');
    service.show('entity-name');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test other getter-setter', () => {
    const service: AdvancedUiService = TestBed.get(AdvancedUiService);

    const masterReq: ReportingRequest = {
      interval: ReportingRequest.IntervalEnum.None,
      sort_by: [{ column: 'id', ascending: false }],
      page_number: 1,
      page_size: 12
    };

    service.setPageNumber(2);
    expect(service.getPageNumber()).toEqual(2);

    service.setPageSize(200);
    expect(service.getPageSize()).toEqual(200);

    expect(service.getInterval()).toEqual(ReportingRequest.IntervalEnum.None);

    service.setSortBy([{ column: 'id', ascending: false }]);
    expect(service.getSortBy()).toEqual([{ column: 'id', ascending: false }]);

    const test_obj = { id: 12, 'name': 12 };
    service.setResult([test_obj]);
    expect(service.getResult()).toEqual([test_obj]);

    service.clearResult();
    expect(service.getResult()).toEqual(null);

    //metrics getters
    expect(service.getCreativeSizeMetrics().length).toEqual(2);
    expect(service.getGroupByMetrics().length).toEqual(2);
    expect(service.getAdvertiserMetrics().length).toEqual(4);
    expect(service.getCountryMetrics().length).toEqual(3);
    expect(service.getGroupByData().length).toEqual(20);
    expect(service.getListDataGroupBy()).toEqual(service.getGroupByData());

    service.setMetrics(['a', 'b'])
    expect(service.getMetrics()).toEqual(['a', 'b']);

    service.setGroupBy(['a', 'b'])
    expect(service.getGroupBy()).toEqual(['a', 'b']);

    service.setCurrency('advertiser')
    expect(service.getCurrency()).toEqual('advertiser');

    expect(service.getMetricsForList(AppConstants.ENTITY.ADVERTISER).length).toEqual(4);
    expect(service.getMetricsForList(AppConstants.ENTITY.CREATIVE).length).toEqual(4);
    expect(service.getMetricsForList(AppConstants.ENTITY.AGGREGATOR).length).toEqual(2);
    expect(service.getMetricsForList(AdvancedConstants.ENTITY.GROUP_BY).length).toEqual(2);
    expect(service.getMetricsForList(AdvancedConstants.ENTITY.CREATIVE_SIZE).length).toEqual(2);
    expect(service.getMetricsForList(AdvancedConstants.ENTITY.COUNTRY).length).toEqual(3);
  });



});
