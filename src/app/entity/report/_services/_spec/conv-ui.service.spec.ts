import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckBoxesObj, ConversionUiMetrics, GridData, ModalObject, CommonReportingService } from '@app/entity/report/_services/common-reporting.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DashboardControllerService, FilterModel, ReportingControllerService, ReportingRequest } from '@revxui/api-client-ts';
import * as STUB from '@app/shared/StubClasses';
import { ConvUiService } from '../conv-ui.service';

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


describe('ConvUiService', () => {
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
      // { provide: CommonReportingService, useClass: STUB.CommonReportingService_stub },
    ],
  }));

  it('should be created', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);
    expect(service).toBeTruthy();
  });


  //new-test-cases
  it('should test setAdvCmpStrFilter', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);

    let advGridDataArr: GridData[] = [
      { id: 1, name: 'a1', isNotSelected: true },
      { id: 2, name: 'a2', isNotSelected: false },
      { id: 3, name: 'a3', isNotSelected: false },
    ]

    const filter_expectation_when_1_adv_is_not_selected: FilterModel[] = [{
      column: "advertiser",
      operator: "not_in",
      value: [1]
    }];

    const filter_expectation_when_only_1_adv_is_selected: FilterModel[] = [{
      column: "advertiser",
      operator: "in",
      value: [3]
    }];

    const inputAdvObj: ModalObject = {
      set: new Set(advGridDataArr),
      map: new Map()
    }
    inputAdvObj.map.set(1, true);

    const dummyObj: ModalObject = {
      set: new Set(),
      map: new Map()
    }

    //test-1 : when only 1 advertser is un-selected
    service.setAdvCmpStrFilter(inputAdvObj, dummyObj, dummyObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_1_adv_is_not_selected);

    //test-2 : when only 1 advertser is selected
    advGridDataArr[1].isNotSelected = true;
    inputAdvObj.set = new Set(advGridDataArr);
    service.setAdvCmpStrFilter(inputAdvObj, dummyObj, dummyObj);
    expect(service.getRequestObject().filters).toEqual(filter_expectation_when_only_1_adv_is_selected);
  });


  it('should test getModalEntities and setModalEntities', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);

    let advGridDataArr: GridData[] = [
      { id: 1, name: 'name-of-entity', isNotSelected: true },
    ];

    const inputAdvObj: ModalObject = {
      set: new Set(),
      map: new Map()
    };
    inputAdvObj.set = new Set(advGridDataArr);
    inputAdvObj.map.set(1, true);

    //test-1 : advertser
    service.setModalEntities(AppConstants.ENTITY.ADVERTISER, inputAdvObj);
    expect(service.getModalEntities(AppConstants.ENTITY.ADVERTISER)).toEqual(inputAdvObj);

    //test-2 : campaign
    service.setModalEntities(AppConstants.ENTITY.CAMPAIGN, inputAdvObj);
    expect(service.getModalEntities(AppConstants.ENTITY.CAMPAIGN)).toEqual(inputAdvObj);

    //test-3 : strategy
    service.setModalEntities(AppConstants.ENTITY.STRATEGY, inputAdvObj);
    expect(service.getModalEntities(AppConstants.ENTITY.STRATEGY)).toEqual(inputAdvObj);
  });


  it('should test other getter-setter', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);

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


    const obj: ConversionUiMetrics = {
      value: 'val',
      label: 'label',
      isSelected: false,
      isDisplayed: true
    }
    service.setUiMetrics([obj]);
    expect(service.getUiMetrics()).toEqual([obj]);
  });


  it('should test getReportType ', fakeAsync(() => {
    const service: ConvUiService = TestBed.get(ConvUiService);

    const convForm = 'report/conversion';
    const convResult = 'report/conversion/result';
    const randomPath = 'random/path';

    //test-1 going from conv-result page to non-conversion related page
    let myRouter = TestBed.get(Router);
    myRouter.navigate([convResult]);
    tick();
    service.resetOnLeave();
    myRouter.navigate([randomPath]);
    tick();
    service.setDefaultRequest();
    let expectationNewReq = service.getRequestObject();
    expect(service.getRequestObject()).toEqual(expectationNewReq);

    //test-2 going from conv-result page to conversion-form page
    myRouter = TestBed.get(Router);
    myRouter.navigate([convResult]);
    tick();
    service.resetOnLeave();
    let requestIntact: ReportingRequest = service.getRequestObject();
    myRouter.navigate([convForm]);
    tick();
    expect(service.getRequestObject()).toEqual(requestIntact);
  }));


  it('should test setRequestColumns', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);

    const set_metric_list: ConversionUiMetrics[] = [
      { value: 'v1', label: 'l1', isDisplayed: false, isSelected: false },
      { value: 'v2', label: 'l2', isDisplayed: false, isSelected: true },
      { value: 'v3', label: 'l3', isDisplayed: true, isSelected: false },
      { value: 'v4', label: 'l4', isDisplayed: true, isSelected: true },
    ];

    service.setUiMetrics(set_metric_list);
    const expectation = ['v1', 'v2', 'v4'];
    service.setRequestColumns();
    expect(service.getRequestObject().columns).toEqual(expectation);
  });


  it('should test setConvTypeObject and getConvTypeObject', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);

    const conv_type: CheckBoxesObj[] = [
      { value: 'v1', label: 'l1', select: true },
      { value: 'v2', label: 'l2', select: true },
    ];

    const expectation: FilterModel[] = [
      { column: 'conversion_type', operator: 'eq', value: 'v1' }
    ]

    // test-1
    service.setConvTypeObject(conv_type);
    expect(service.getRequestObject().filters).toEqual([]);

    //test-2
    conv_type[1].select = false;
    service.setConvTypeObject(conv_type);
    expect(service.getRequestObject().filters).toEqual(expectation);

    //test-3
    expect(service.getConvTypeObject()).toEqual(conv_type);
  });


  it('should test export and show', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);
    const calledService = TestBed.get(ReportingControllerService);

    let spy = spyOn(calledService, 'customReportCSVUsingPOST');
    service.export('entity-name');
    expect(spy).toHaveBeenCalledTimes(1);

    spy = spyOn(calledService, 'customReportUsingPOST');
    service.show('entity-name');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test setDuration and getDateRange', () => {
    const service: ConvUiService = TestBed.get(ConvUiService);
    const date = new Date();
    let spy1 = spyOn(TestBed.get(CommonReportingService), 'setDuration');
    service.setDuration([date, date]);
    expect(spy1).toHaveBeenCalled();
  });

});
