import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { AdvertiserControllerService, AudienceControllerService, BulkStrategyControllerService, CampaignControllerService, CatalogControllerService, ClickDestinationControllerService, DashboardControllerService, PixelControllerService, StrategyControllerService } from '@revxui/api-client-ts';
import { SocialLoginModule } from 'angularx-social-login';
import { ListService } from '../list.service';
import { AlertService } from '../alert.service';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CampaignService } from '@app/entity/campaign/_services/campaign.service';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { ListApiParams } from '@app/shared/_directives/list/list.component';


describe('ListService', () => {
  let service: ListService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      SocialLoginModule,
      RouterModule.forRoot([]),
      RouterTestingModule,
      HttpClientTestingModule,
      MatDialogModule,
    ],

    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: MatDialogRef, useValue: { close: (dialogResult: any) => { } } },

      { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
      { provide: AdvertiserControllerService, useClass: STUB.AdvertiserControllerService_stub },
      { provide: PixelControllerService, useClass: STUB.PixelControllerService_stub },
      { provide: CatalogControllerService, useClass: STUB.CatalogControllerService_stub },
      { provide: ClickDestinationControllerService, useClass: STUB.ClickDestinationControllerService_stub },
      { provide: CampaignControllerService, useClass: STUB.CampaignControllerService_stub },
      { provide: StrategyControllerService, useClass: STUB.StrategyControllerService_stub },
      { provide: BulkStrategyControllerService, useClass: STUB.BulkStrategyControllerService_stub },
      { provide: AudienceControllerService, useClass: STUB.AudienceControllerService_stub },
    ],

  }));


  it("Service Should be Created", () => {
    service = TestBed.get(ListService);
    expect(service).toBeTruthy();
  });


  it('should test getMetricsForList when selectedMetricsIds = [] ', () => {
    service = TestBed.get(ListService);
    let selectedMetricsIds = [];
    let result = service.getMetricsForList(selectedMetricsIds);
    expect(result.length).toEqual(4);
  });


  it('should test getMetricsForList output to have 18 elements', () => {
    service = TestBed.get(ListService);
    let selectedMetricsIds: any = ["impressions", "clicks", "installs", "conversions", "erpm", "erpc", "erpi", "erpa", "ctr", "ctc", "roi", "revenue", "cost", "margin"];
    let result = service.getMetricsForList(selectedMetricsIds);
    expect(result.length).toEqual(18);
  });


  it('Matrics option selected Length', () => {
    service = TestBed.get(ListService);
    let result = service.getMetricsOptions();
    expect(result.length).toEqual(24);
  });


  it('Matrics option selected Data', () => {
    service = TestBed.get(ListService);
    let matricsSelectedOtion = `[{"id":"impressions","hover":"Impressions","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"IMP'S","type":""},{"id":"clicks","hover":"Clicks","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CLICKS","type":""},{"id":"installs","hover":"Installs","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"INSTALLS","type":""},{"id":"conversions","hover":"Conversions","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CONV'S","type":""},{"id":"ecpm","hover":"Effective cost per mille impression","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPM","type":"CURRENCY"},{"id":"ecpc","hover":"Effective cost per click","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPC","type":"CURRENCY"},{"id":"ecpi","hover":"Effective cost per install","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPI","type":"CURRENCY"},{"id":"ecpa","hover":"Effective cost per aquisition","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPA","type":"CURRENCY"},{"id":"erpm","hover":"Effective revenue per mille impression","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPM","type":"CURRENCY"},{"id":"erpc","hover":"Effective revenue per click","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPC","type":"CURRENCY"},{"id":"erpi","hover":"Effective revenue per install","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPI","type":"CURRENCY"},{"id":"erpa","hover":"Effective revenue per acquisition","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPA","type":"CURRENCY"},{"id":"ctr","hover":"Click upon impressions X 100","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","hover":"Impression to Install","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"ITI","type":""},{"id":"ctc","hover":"Conversions upon clicks/clicks X 100","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CTC","type":"PERCENTAGE"},{"id":"roi","hover":"Return on Investment","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"ROI","type":""},{"id":"revenue","hover":"The licensee revenue that is actually paid towards running the campaign","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"ADV SPEND","type":"CURRENCY"},{"id":"cost","hover":"Media spend","showROuser":false,"showSelectOption":true,"preSelected":true,"title":"MEDIA SPEND","type":"CURRENCY"},{"id":"margin","hover":"Margin","showROuser":false,"showSelectOption":true,"preSelected":true,"title":"MARGIN","type":"PERCENTAGE"},{"id":"eligibleUniqUsers","hover":"Eligible unique users","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"Eligible UU's","type":""},{"id":"impressionUniqUsers","hover":"Impression unique users","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"IMP UU's","type":""},{"id":"userReach","hover":"Reach","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"REACH","type":"PERCENTAGE"},{"id":"eligibleBids","hover":"Eligible bids","value":0,"showROuser":true,"showSelectOption":true,"title":"Eligible Bids","type":""},{"id":"bidsPlaced","hover":"Bids placed","value":0,"showROuser":true,"showSelectOption":true,"title":"Bid Placed","type":""}]`;
    let result = service.getMetricsOptions();
    expect(JSON.stringify(result)).toEqual(matricsSelectedOtion);
  });

  it('Pre selected Metrics Length', () => {
    service = TestBed.get(ListService);
    let result = service.getPreSelectedMetrics();
    expect(result.length).toEqual(14);
  });


  it('Pre selected Matrics option', () => {
    service = TestBed.get(ListService);
    let selectedMetricsIds: any = ["impressions", "clicks", "installs", "conversions", "erpm", "erpc", "erpi", "erpa", "ctr", "ctc", "roi", "revenue", "cost", "margin"];
    let result = service.getPreSelectedMetrics();
    expect(JSON.stringify(result)).toEqual(JSON.stringify(selectedMetricsIds));
  });

  //new-test-cases
  it('should Test showMessageAfterAction with success msg', () => {
    service = TestBed.get(ListService);
    const apiResp = {
      respObject: 'result is success'
    };
    const alertService = TestBed.get(AlertService);
    const spy = spyOn(alertService, 'success');
    service.showMessageAfterAction(apiResp, 'success msg', null);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test showMessageAfterAction with error msg', () => {
    service = TestBed.get(ListService);
    const apiResp = {};
    const alertService = TestBed.get(AlertService);
    const spy1 = spyOn(alertService, 'error');
    service.showMessageAfterAction(apiResp, null, 'error');
    expect(spy1).toHaveBeenCalledTimes(1);
  });


  it('should Test deactivateEntity for ADVERTISER', () => {
    service = TestBed.get(ListService);
    const idArr = [1, 2, 3];
    const advService = TestBed.get(AdvertiserService);
    const spy = spyOn(advService, 'deactivateAdvs');
    service.deactivateEntity(AppConstants.ENTITY.ADVERTISER.toLowerCase(), idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test deactivateEntity for CAMPAIGN', () => {
    service = TestBed.get(ListService);
    const idArr = [1, 2, 3];
    const cmpService = TestBed.get(CampaignService);
    const spy = spyOn(cmpService, 'deactivateCmps');
    service.deactivateEntity(AppConstants.ENTITY.CAMPAIGN.toLowerCase(), idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test deactivateEntity for STRATEGY', () => {
    service = TestBed.get(ListService);
    const idArr = [1, 2, 3];
    const strService = TestBed.get(StrategyService);
    const spy = spyOn(strService, 'updateStrategyStatus');
    service.deactivateEntity(AppConstants.ENTITY.STRATEGY.toLowerCase(), idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should Test activateEntity for ADVERTISER', () => {
    service = TestBed.get(ListService);
    const idArr = [1, 2, 3];
    const advService = TestBed.get(AdvertiserService);
    const spy = spyOn(advService, 'activateAdvs');
    service.activateEntity(AppConstants.ENTITY.ADVERTISER.toLowerCase(), idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test activateEntity for CAMPAIGN', () => {
    service = TestBed.get(ListService);
    const idArr = [1, 2, 3];
    const cmpService = TestBed.get(CampaignService);
    const spy = spyOn(cmpService, 'activateCmps');
    service.activateEntity(AppConstants.ENTITY.CAMPAIGN.toLowerCase(), idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should Test activateEntity for STRATEGY', () => {
    service = TestBed.get(ListService);
    const idArr = [1, 2, 3];
    const strService = TestBed.get(StrategyService);
    const spy = spyOn(strService, 'updateStrategyStatus');
    service.activateEntity(AppConstants.ENTITY.STRATEGY.toLowerCase(), idArr);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getMetricsForList when selectedMetricsIds = [] and entity = Strategy ', () => {
    service = TestBed.get(ListService);
    let selectedMetricsIds = [];
    let result = service.getMetricsForList(selectedMetricsIds, AppConstants.ENTITY.STRATEGY.toLowerCase());
    expect(result.length).toEqual(5);
  });

  it('should test getMetricsForList when selectedMetricsIds.length > 0 and entity = Strategy ', () => {
    service = TestBed.get(ListService);
    let selectedMetricsIds = ["impressions", "clicks"];
    let result = service.getMetricsForList(selectedMetricsIds, AppConstants.ENTITY.STRATEGY.toLowerCase());
    expect(result.length).toEqual(5 + 2);
  });



  it('should Test getListDataCSV() is making the api call or not', () => {
    service = TestBed.get(ListService);
    const dashService = TestBed.get(DashboardControllerService);

    const req = {};
    const _entity = AppConstants.ENTITY.ADVERTISER;
    const listParams: ListApiParams = {
      refresh: true,
      filter: null,
      sort: 'id-',
      pageNo: 1,
      pageSize: 10,
      entity: _entity,
      showUU:true
    }

    const spyCsv = spyOn(dashService, 'getDashboardDataListCsvUsingPOST');
    const spyList = spyOn(dashService, 'getDashboardDataListUsingPOST');

    service.getListDataCSV(req, _entity);
    service.getListData(req, listParams);

    expect(spyCsv).toHaveBeenCalledTimes(1);
    expect(spyList).toHaveBeenCalledTimes(1);

  });






});


