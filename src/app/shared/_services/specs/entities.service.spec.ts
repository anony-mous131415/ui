import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { EntitiesService } from '../entities.service';
import { CommonService } from '../common.service';
import * as STUB from '@app/shared/StubClasses';
import { BreadcrumbsService } from '../breadcrumbs.service';




describe('EntitiesService', () => {
    let privatemethod;
    let commonService;
    let dashboardService;
    let breadCrumbService;
    let advService;
    privatemethod = new EntitiesService(commonService, dashboardService, breadCrumbService,advService);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [RouterTestingModule, RouterModule.forRoot([])],
        providers: [
            HttpClient,
            HttpHandler,
            DashboardControllerService,
            { provide: BreadcrumbsService, useClass: STUB.BreadcrumbsService_stub }
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
        const service: EntitiesService = TestBed.get(EntitiesService);
        expect(service).toBeTruthy();
    });
    it('Funnel Matrix', () => {
        let outputlist = `[{"id":"eligibleBids","value":0,"title":"Eligible Bids","child":{"id":"eligibleUniqUsers","value":0,"title":"Unique Users"}},{"id":"bidsPlaced","value":0,"title":"Bid Placed","child":null},{"id":"impressions","value":0,"title":"Impressions","child":{"id":"impressionUniqUsers","value":0,"title":"Unique Users"}},{"id":"clicks","value":0,"title":"Clicks","child":{"id":"invalidClicks","value":0,"title":"Invalid Clicks"}},{"id":"installs","value":0,"title":"Installs","child":{"id":"iti","value":0,"title":"ITI"}},{"id":"conversions","value":0,"title":"Conversions","child":null}]`;
        let result = privatemethod.getFunnelMetrics();
        expect(JSON.stringify(result)).toEqual(outputlist);
    });

    it('Get Chart Matrix', () => {
        let basicval = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, "usrrole");
        let outputlist = `[{"id":"revenue","showROuser":true,"showInTooltip":true,"value":0,"title":"Advertiser Spend","type":"CURRENCY"},{"id":"cost","showROuser":false,"showInTooltip":false,"value":0,"title":"Media Spend","type":"CURRENCY"},{"id":"margin","showROuser":false,"showInTooltip":true,"value":0,"title":"Margin","type":"PERCENTAGE"},{"id":"impressions","showROuser":true,"showInTooltip":true,"value":0,"title":"Impressions","type":""},{"id":"clicks","showROuser":true,"showInTooltip":true,"value":0,"title":"Clicks","type":""},{"id":"installs","showROuser":true,"showInTooltip":true,"value":0,"title":"Installs","type":""},{"id":"conversions","showROuser":true,"showInTooltip":true,"value":0,"title":"Conversions","type":""},{"id":"clickConversions","showROuser":true,"showInTooltip":false,"value":0,"title":"Click Conversions","type":""},{"id":"viewConversions","showROuser":true,"showInTooltip":false,"value":0,"title":"View Conversions","type":""},{"id":"ecpm","showROuser":false,"showInTooltip":false,"value":0,"title":"eCPM","type":"CURRENCY"},{"id":"ecpa","showROuser":false,"showInTooltip":false,"value":0,"title":"eCPA","type":"CURRENCY"},{"id":"ecpc","showROuser":false,"showInTooltip":false,"value":0,"title":"eCPC","type":"CURRENCY"},{"id":"ecpi","showROuser":false,"showInTooltip":false,"value":0,"title":"eCPI","type":"CURRENCY"},{"id":"erpm","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPM","type":"CURRENCY"},{"id":"erpa","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPA","type":"CURRENCY"},{"id":"erpc","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPC","type":"CURRENCY"},{"id":"erpi","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPI","type":"CURRENCY"},{"id":"ctr","showROuser":true,"showInTooltip":true,"value":0,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","showROuser":true,"showInTooltip":true,"value":0,"title":"ITI","type":""},{"id":"ctc","showROuser":true,"showInTooltip":true,"value":0,"title":"CTC","type":"PERCENTAGE"},{"id":"cvr","showROuser":true,"showInTooltip":true,"value":0,"title":"CVR","type":"PERCENTAGE"},{"id":"advRevenue","showROuser":true,"showInTooltip":false,"value":0,"title":"Advertiser Revenue","type":"CURRENCY"},{"id":"roi","showROuser":true,"showInTooltip":true,"value":0,"title":"ROI","type":""},{"id":"userReach","showROuser":true,"showInTooltip":true,"value":0,"title":"Reach","type":"PERCENTAGE"},{"id":"eligibleUniqUsers","showROuser":true,"showInTooltip":false,"value":0,"title":"Eligible UU's","type":""},{"id":"impressionUniqUsers","showROuser":true,"value":0,"showInTooltip":false,"title":"Impression UU's","type":""},{"id":"eligibleBids","value":0,"showROuser":true,"showInTooltip":false,"title":"Eligible Bids","type":""},{"id":"bidsPlaced","value":0,"showROuser":true,"showInTooltip":false,"title":"Bid Placed","type":""},{"id":"invalidClicks","value":0,"showROuser":true,"showInTooltip":false,"title":"Invalid Clicks","type":""}]`;
        let result: any[] = privatemethod.getChartMetrics();
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, basicval);
        // expect(JSON.stringify(result)).toEqual(outputlist);

        expect(result.length).toEqual(29);

    });


    it('Get non-strategy List Matrix', () => {
        let listmatrix = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, "usrrole");
        let outputlist = `[{"id":"action","hover":"Action","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"ACTION","type":""},{"id":"active","hover":"Active","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"STATUS","type":""},  {"id":"name","hover":"Name","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"NAME","type":""},{"id":"id","hover":"ID","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"ID","type":""},{"id":"impressions","hover":"Impressions","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"IMP'S","type":""},{"id":"clicks","hover":"Clicks","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CLICKS","type":""},{"id":"installs","hover":"Installs","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"INSTALLS","type":""},{"id":"conversions","hover":"Conversions","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CONV'S","type":""},{"id":"ecpm","hover":"Effective cost per mille impression","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPM","type":"CURRENCY"},{"id":"ecpc","hover":"Effective cost per click","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPC","type":"CURRENCY"},{"id":"ecpi","hover":"Effective cost per install","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPI","type":"CURRENCY"},{"id":"ecpa","hover":"Effective cost per aquisition","showROuser":false,"showSelectOption":true,"preSelected":false,"title":"eCPA","type":"CURRENCY"},{"id":"erpm","hover":"Effective revenue per mille impression","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPM","type":"CURRENCY"},{"id":"erpc","hover":"Effective revenue per click","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPC","type":"CURRENCY"},{"id":"erpi","hover":"Effective revenue per install","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPI","type":"CURRENCY"},{"id":"erpa","hover":"Effective revenue per acquisition","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPA","type":"CURRENCY"},{"id":"ctr","hover":"Click upon impressions X 100","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","hover":"Impression to Install","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"ITI","type":""},{"id":"ctc","hover":"Conversions upon clicks/clicks X 100","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CTC","type":"PERCENTAGE"},{"id":"roi","hover":"Return on Investment","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"ROI","type":""},{"id":"revenue","hover":"The licensee revenue that is actually paid towards running the campaign","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"ADV SPEND","type":"CURRENCY"},{"id":"cost","hover":"Media spend","showROuser":false,"showSelectOption":true,"preSelected":true,"title":"MEDIA SPEND","type":"CURRENCY"},{"id":"margin","hover":"Margin","showROuser":false,"showSelectOption":true,"preSelected":true,"title":"MARGIN","type":"PERCENTAGE"},{"id":"eligibleUniqUsers","hover":"Eligible unique users","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"Eligible UU's","type":""},{"id":"impressionUniqUsers","hover":"Impression unique users","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"IMP UU's","type":""},{"id":"userReach","hover":"Reach","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"REACH","type":"PERCENTAGE"},{"id":"campaign","hover":"Campaign","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"CAMPAIGN","type":""},{"id":"strategy","hover":"Stratergy","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"STRATEGY","type":""},{"id":"eligibleBids","hover":"Eligible bids","value":0,"showROuser":true,"showSelectOption":true,"title":"Eligible Bids","type":""},{"id":"bidsPlaced","hover":"Bids placed","value":0,"showROuser":true,"showSelectOption":true,"title":"Bid Placed","type":""}]`;
        let result = privatemethod.getListMetrics('campaign');
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, listmatrix);
        // expect(JSON.stringify(result)).toEqual(outputlist);
        expect(result.length).toEqual(30);

    });

    it('Romove Matrix from chart matrix', () => {
        let removchart = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, AppConstants.USER_ROLE.READ_ONLY);
        let result = privatemethod.getChartMetrics();
        // let expectedresult = `[{"id":"revenue","showROuser":true,"showInTooltip":true,"value":0,"title":"Advertiser Spend","type":"CURRENCY"},{"id":"impressions","showROuser":true,"showInTooltip":true,"value":0,"title":"Impressions","type":""},{"id":"clicks","showROuser":true,"showInTooltip":true,"value":0,"title":"Clicks","type":""},{"id":"installs","showROuser":true,"showInTooltip":true,"value":0,"title":"Installs","type":""},{"id":"conversions","showROuser":true,"showInTooltip":true,"value":0,"title":"Conversions","type":""},{"id":"clickConversions","showROuser":true,"showInTooltip":false,"value":0,"title":"Click Conversions","type":""},{"id":"viewConversions","showROuser":true,"showInTooltip":false,"value":0,"title":"View Conversions","type":""},{"id":"erpm","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPM","type":"CURRENCY"},{"id":"erpa","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPA","type":"CURRENCY"},{"id":"erpc","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPC","type":"CURRENCY"},{"id":"erpi","showROuser":true,"showInTooltip":true,"value":0,"title":"eRPI","type":"CURRENCY"},{"id":"ctr","showROuser":true,"showInTooltip":true,"value":0,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","showROuser":true,"showInTooltip":true,"value":0,"title":"ITI","type":""},{"id":"ctc","showROuser":true,"showInTooltip":true,"value":0,"title":"CTC","type":"PERCENTAGE"},{"id":"cvr","showROuser":true,"showInTooltip":true,"value":0,"title":"CVR","type":"PERCENTAGE"},{"id":"advRevenue","showROuser":true,"showInTooltip":false,"value":0,"title":"Advertiser Revenue","type":"CURRENCY"},{"id":"roi","showROuser":true,"showInTooltip":true,"value":0,"title":"ROI","type":""},{"id":"userReach","showROuser":true,"showInTooltip":true,"value":0,"title":"Reach","type":"PERCENTAGE"},{"id":"eligibleUniqUsers","showROuser":true,"showInTooltip":false,"value":0,"title":"Eligible UU's","type":""},{"id":"impressionUniqUsers","showROuser":true,"value":0,"showInTooltip":false,"title":"Impression UU's","type":""},{"id":"eligibleBids","value":0,"showROuser":true,"showInTooltip":false,"title":"Eligible Bids","type":""},{"id":"bidsPlaced","value":0,"showROuser":true,"showInTooltip":false,"title":"Bid Placed","type":""},{"id":"invalidClicks","value":0,"showROuser":true,"showInTooltip":false,"title":"Invalid Clicks","type":""}]`;
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, removchart);
        expect(result.length).toEqual(23);
    });

    it('Romove Matrix from List matrix', () => {
        // let removlist=localStorage.getItem(AppConstants.CACHED_USER_ROLE);
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, AppConstants.USER_ROLE.READ_ONLY);
        let result = privatemethod.getListMetrics();
        // let expectedresult=`[{"id":"active","hover":"Active","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"STATUS","type":""},{"id":"name","hover":"Name","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"NAME","type":""},{"id":"id","hover":"ID","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"ID","type":""},{"id":"impressions","hover":"Impressions","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"IMP'S","type":""},{"id":"clicks","hover":"Clicks","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CLICKS","type":""},{"id":"installs","hover":"Installs","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"INSTALLS","type":""},{"id":"conversions","hover":"Conversions","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CONV'S","type":""},{"id":"erpm","hover":"Effective revenue per mille impression","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPM","type":"CURRENCY"},{"id":"erpc","hover":"Effective revenue per click","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPC","type":"CURRENCY"},{"id":"erpi","hover":"Effective revenue per install","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPI","type":"CURRENCY"},{"id":"erpa","hover":"Effective revenue per acquisition","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"eRPA","type":"CURRENCY"},{"id":"ctr","hover":"Click upon impressions X 100","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","hover":"Impression to Install","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"ITI","type":""},{"id":"ctc","hover":"Conversions upon clicks/clicks X 100","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"CTC","type":"PERCENTAGE"},{"id":"roi","hover":"Return on Investment","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"ROI","type":""},{"id":"revenue","hover":"The licensee revenue that is actually paid towards running the campaign","showROuser":true,"showSelectOption":true,"preSelected":true,"title":"ADV SPEND","type":"CURRENCY"},{"id":"eligibleUniqUsers","hover":"Eligible unique users","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"Eligible UU's","type":""},{"id":"impressionUniqUsers","hover":"Impression unique users","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"IMP UU's","type":""},{"id":"userReach","hover":"Reach","showROuser":true,"showSelectOption":true,"preSelected":false,"title":"REACH","type":"PERCENTAGE"},{"id":"campaign","hover":"Campaign","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"CAMPAIGN","type":""},{"id":"strategy","hover":"Stratergy","showROuser":true,"showSelectOption":false,"preSelected":false,"title":"STRATEGY","type":""},{"id":"eligibleBids","hover":"Eligible bids","value":0,"showROuser":true,"showSelectOption":true,"title":"Eligible Bids","type":""},{"id":"bidsPlaced","hover":"Bids placed","value":0,"showROuser":true,"showSelectOption":true,"title":"Bid Placed","type":""}]`;
        // localStorage.setItem(AppConstants.CACHED_USER_ROLE,removlist)
        expect(result.length).toEqual(24);
    });


    //new-tests
    it('should test anonymous functions inside getNonStrategyMetrics', () => {
        const service: EntitiesService = TestBed.get(EntitiesService);
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, 'ROLE_RW');
        const mertrics = service.getNonStrategyMetrics();
        const commonService: CommonService = TestBed.get(CommonService);

        //action
        let result = mertrics[0].cell(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.action);


        //active
        result = mertrics[1].cell(STUB.elementPassed);
        expect(result).toEqual('true');

        //active
        result = mertrics[2].cell(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.name);

        //id
        result = mertrics[3].cellTooltip(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.id.toString());
        result = mertrics[3].cell(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.id.toString());

        //impression
        let spy1 = spyOn(commonService, 'nrFormatTooltip');
        let spy2 = spyOn(commonService, 'nrFormat');
        mertrics[4].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.impressions, '');
        mertrics[4].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.impressions, '');

        //clicks
        mertrics[5].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.clicks, '');
        mertrics[5].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.clicks, '');


        //installs
        mertrics[6].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.installs, '');
        mertrics[6].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.installs, '');

        //conversions
        mertrics[7].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.conversions, '');
        mertrics[7].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.conversions, '');

        //ecpm
        mertrics[8].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ecpm, 'CURRENCY', 'USD');
        mertrics[8].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ecpm, 'CURRENCY', 'USD');

        //ecpc
        mertrics[9].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ecpc, 'CURRENCY', 'USD');
        mertrics[9].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ecpc, 'CURRENCY', 'USD');

        //ecpi
        mertrics[10].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ecpi, 'CURRENCY', 'USD');
        mertrics[10].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ecpi, 'CURRENCY', 'USD');

        //ecpa
        mertrics[11].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ecpa, 'CURRENCY', 'USD');
        mertrics[11].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ecpa, 'CURRENCY', 'USD');

        //ecpm
        mertrics[12].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ecpm, 'CURRENCY', 'USD');
        mertrics[12].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ecpm, 'CURRENCY', 'USD');

        //ecpc
        mertrics[13].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ecpc, 'CURRENCY', 'USD');
        mertrics[13].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ecpc, 'CURRENCY', 'USD');

        //ecpi
        mertrics[14].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ecpi, 'CURRENCY', 'USD');
        mertrics[14].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ecpi, 'CURRENCY', 'USD');

        //erpa
        mertrics[15].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.erpa, 'CURRENCY', 'USD');
        mertrics[15].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.erpa, 'CURRENCY', 'USD');

        //ctr
        mertrics[16].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ctr, 'PERCENTAGE');
        mertrics[16].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ctr, 'PERCENTAGE');

        //iti
        mertrics[17].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.iti, '');
        mertrics[17].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.iti, '');

        //ctc
        mertrics[18].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.ctc, 'PERCENTAGE');
        mertrics[18].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.ctc, 'PERCENTAGE');

        //roi
        mertrics[19].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.roi, '');
        mertrics[19].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.roi, '');

        //revenue
        mertrics[20].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.revenue, 'CURRENCY', 'USD');
        mertrics[20].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.revenue, 'CURRENCY', 'USD');

        //cost
        mertrics[21].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.cost, 'CURRENCY', 'USD');
        mertrics[21].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.cost, 'CURRENCY', 'USD');

        //margin
        mertrics[22].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.margin, 'PERCENTAGE');
        mertrics[22].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.margin, 'PERCENTAGE');

        //eligibleUniqUsers
        mertrics[23].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.eligibleUniqUsers, '');
        mertrics[23].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.eligibleUniqUsers, '');

        //impressionUniqUsers
        mertrics[24].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.impressionUniqUsers, '');
        mertrics[24].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.impressionUniqUsers, '');


        //userReach
        mertrics[25].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.userReach, 'PERCENTAGE');
        mertrics[25].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.userReach, 'PERCENTAGE');

        //campaign
        result = mertrics[26].cellTooltip(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.campaign);
        result = mertrics[26].cell(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.campaign);

        //strategy
        result = mertrics[27].cellTooltip(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.strategy);
        result = mertrics[27].cell(STUB.elementPassed);
        expect(result).toEqual(STUB.elementPassed.strategy);

        //eligibleBids
        mertrics[28].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.eligibleBids, '');
        mertrics[28].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.eligibleBids, '');

        //bidsPlaced
        mertrics[29].cellTooltip(STUB.elementPassed);
        expect(spy1).toHaveBeenCalledWith(STUB.elementPassed.bidsPlaced, '');
        mertrics[29].cell(STUB.elementPassed);
        expect(spy2).toHaveBeenCalledWith(STUB.elementPassed.bidsPlaced, '');
    });



    it('should test createBCObject', () => {
        const service: EntitiesService = TestBed.get(EntitiesService);
        const spy = spyOn(TestBed.get(BreadcrumbsService), 'createBCObject');

        let apiResp1 = {
            id: 1,
            name: 'adv1',
            parent: {
                id: 2,
                name: 'licensee1'
            }
        };
        service.createBCObject(apiResp1);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(apiResp1);
    });



    it('should test getStrategyMetrics', () => {
        const service: EntitiesService = TestBed.get(EntitiesService);

        //expected 24 metrics for RO user
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, 'ROLE_RO');
        let result = service.getStrategyMetrics();
        expect(result.length).toEqual(24);

        //expected 31 metrics for non-RO user
        localStorage.clear()
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, 'ROLE_RW');
        result = service.getStrategyMetrics();
        expect(result.length).toEqual(31);
    });


    it('should test getStrategyMetrics', () => {
        const service: EntitiesService = TestBed.get(EntitiesService);
        //expected 16 tooltip metrics for non-RO user
        localStorage.setItem(AppConstants.CACHED_USER_ROLE, 'ROLE_RW');
        let result = service.getChartTooltipMetrics();

        // expect(result.length).toEqual(16);
        // expect(result[result.length - 1].id).toEqual('userReach');

        //revx-647
        expect(result.length).toEqual(29);
        expect(result[0].id).toEqual('revenue');
    });



});
