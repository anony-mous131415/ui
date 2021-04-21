import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { ChartService } from '../chart.service';
import { DateRange } from '../../_models/date.range.model';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesService } from '../entities.service';
import * as STUB from '@app/shared/StubClasses';


const aug_3_2020 = new Date();
aug_3_2020.setFullYear(2020, 7, 3);
aug_3_2020.setHours(0);
aug_3_2020.setMinutes(0);
aug_3_2020.setSeconds(0);

const aug_5_2020 = new Date();
aug_5_2020.setFullYear(2020, 7, 5);
aug_5_2020.setHours(0);
aug_5_2020.setMinutes(0);
aug_5_2020.setSeconds(0);

const chartObj = {
  "metrics": {
    id: 'revenue', showROuser: true, showInTooltip: true, value: 0,
    title: 'Advertiser Spend', type: AppConstants.NUMBER_TYPE_CURRENCY
  },
  "selector1": 'revenue',
  "selector2": '',
  "tooltipSelector": 'mData',
  "tooltipOptions": [{ 'id': 'mData', 'title': 'Metrics Data' }, { 'id': 'fData', 'title': 'Funnel Data' }]
};


describe('ChartService', () => {

  let service: ChartService;
  // let service;
  // let dashboardService, drpService, commonService, entitiesService;
  // service = new ChartService(entitiesService, commonService, dashboardService);
  // let dashboardService, entitiesService;
  // service = new ChartService(null, null, null);
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      RouterModule.forRoot([]),
      HttpClientTestingModule
    ],
    providers: [DashboardControllerService,
      { provide: EntitiesService, useClass: STUB.EntitiesService_stub },

    ]
  }));

  it("Service Should be Created", () => {
    service = TestBed.get(ChartService);
    expect(service).toBeTruthy();
  });

  it("Date Fomater", () => {
    const service: ChartService = TestBed.get(ChartService);
    let inputdate = new Date('Tue Oct 15 2019 20:00:00 GMT+0530 (India Standard Time)');
    let outputdate = '15 Oct 2019';
    let result = service.formatChartDate(inputdate);
    expect(result).toEqual(outputdate);
  });

  it("Time Fomater", () => {
    const service: ChartService = TestBed.get(ChartService);
    let inputdate = new Date('Tue Oct 15 2019 20:00:00 GMT+0530 (India Standard Time)');
    let outputdate = '8:00 pm';
    let result = service.formatChartTime(inputdate);
    expect(result).toEqual(outputdate);
  });


  it("single Graph Representation", () => {
    const service: ChartService = TestBed.get(ChartService);
    let inputchart = `{"metrics":[{"id":"revenue","showROuser":true,"value":0,"title":"Advertiser Spend","type":"CURRENCY"},{"id":"cost","showROuser":false,"value":0,"title":"Media Spend","type":"CURRENCY"},{"id":"impressions","showROuser":true,"value":0,"title":"Impressions","type":""},{"id":"clicks","showROuser":true,"value":0,"title":"Clicks","type":""},{"id":"installs","showROuser":true,"value":0,"title":"Installs","type":""},{"id":"conversions","showROuser":true,"value":0,"title":"Conversions","type":""},{"id":"viewConversions","showROuser":true,"value":0,"title":"View Conversions","type":""},{"id":"margin","showROuser":false,"value":0,"title":"Margin","type":"PERCENTAGE"},{"id":"erpm","showROuser":true,"value":0,"title":"Revenue eCPM","type":"CURRENCY"},{"id":"erpa","showROuser":true,"value":0,"title":"Revenue eCPA","type":"CURRENCY"},{"id":"erpc","showROuser":true,"value":0,"title":"Revenue eCPC","type":"CURRENCY"},{"id":"erpi","showROuser":true,"value":0,"title":"Revenue eCPI","type":"CURRENCY"},{"id":"ctr","showROuser":true,"value":0,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","showROuser":true,"value":0,"title":"ITI","type":""},{"id":"ctc","showROuser":true,"value":0,"title":"CTC","type":"PERCENTAGE"},{"id":"cvr","showROuser":true,"value":0,"title":"CVR","type":"PERCENTAGE"},{"id":"advRevenue","showROuser":true,"value":0,"title":"Advertiser Revenue","type":"CURRENCY"},{"id":"roi","showROuser":true,"value":0,"title":"ROI","type":"PERCENTAGE"},{"id":"userReach","showROuser":true,"value":0,"title":"Reach","type":"PERCENTAGE"}],"selector1":"advRevenue","selector2":"","tooltipSelector":"mData","tooltipOptions":[{"id":"mData","title":"Metrics Data"},{"id":"fData","title":"Funnel Data"}]}`;
    let expectedchart = `[{"labels":{"style":{"color":"#333333"},"align":"left","x":2,"y":-2},"title":{"text":"","style":{"color":"#333333","fontSize":"12px"}},"opposite":false}]`;
    // let result = service.prepareYAxisLabels(inputchart, null);
    // expect(JSON.stringify(result)).toEqual(expectedchart);
  });


  it("Compararison Graph", () => {
    const service: ChartService = TestBed.get(ChartService);
    let inputchart = `{"metrics":[{"id":"revenue","showROuser":true,"value":0,"title":"Advertiser Spend","type":"CURRENCY"},{"id":"cost","showROuser":false,"value":0,"title":"Media Spend","type":"CURRENCY"},{"id":"impressions","showROuser":true,"value":0,"title":"Impressions","type":""},{"id":"clicks","showROuser":true,"value":0,"title":"Clicks","type":""},{"id":"installs","showROuser":true,"value":0,"title":"Installs","type":""},{"id":"conversions","showROuser":true,"value":0,"title":"Conversions","type":""},{"id":"viewConversions","showROuser":true,"value":0,"title":"View Conversions","type":""},{"id":"margin","showROuser":false,"value":0,"title":"Margin","type":"PERCENTAGE"},{"id":"erpm","showROuser":true,"value":0,"title":"Revenue eCPM","type":"CURRENCY"},{"id":"erpa","showROuser":true,"value":0,"title":"Revenue eCPA","type":"CURRENCY"},{"id":"erpc","showROuser":true,"value":0,"title":"Revenue eCPC","type":"CURRENCY"},{"id":"erpi","showROuser":true,"value":0,"title":"Revenue eCPI","type":"CURRENCY"},{"id":"ctr","showROuser":true,"value":0,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","showROuser":true,"value":0,"title":"ITI","type":""},{"id":"ctc","showROuser":true,"value":0,"title":"CTC","type":"PERCENTAGE"},{"id":"cvr","showROuser":true,"value":0,"title":"CVR","type":"PERCENTAGE"},{"id":"advRevenue","showROuser":true,"value":0,"title":"Advertiser Revenue","type":"CURRENCY"},{"id":"roi","showROuser":true,"value":0,"title":"ROI","type":"PERCENTAGE"},{"id":"userReach","showROuser":true,"value":0,"title":"Reach","type":"PERCENTAGE"}],"selector1":"advRevenue","selector2":"ctr","tooltipSelector":"mData","tooltipOptions":[{"id":"mData","title":"Metrics Data"},{"id":"fData","title":"Funnel Data"}]}`;
    let expectedchart = `[{"labels":{"style":{"color":"#333333"},"align":"left","x":2,"y":-2},"title":{"text":"","style":{"color":"#333333","fontSize":"12px"}},"opposite":false}]`;
    // let result = service.prepareYAxisLabels(inputchart, null);
    // expect(JSON.stringify(result)).toEqual(expectedchart);
  });


  it("prepare label for X Axis for Date Difference Morehten 25", () => {
    const service: ChartService = TestBed.get(ChartService);
    let startdate = new Date("2019-08-31T18:30:00.000Z");
    let endDate = new Date("2019-09-25T18:30:00.000Z");
    let inputdata = JSON.parse(`{"startDate":"","endDate":"","startDateEpoch":1567296000,"endDateEpoch":1569542400}`);
    inputdata.startDate = startdate;
    inputdata.endDate = endDate;
    let result = service.prepareXAxisLabels(inputdata);
    let ftime = (new Date(result[2]).getTime() - new Date(result[1]).getTime()) / (1000 * 3600 * 24);
    expect(ftime).toEqual(1);
  });

  it("prepare Label for X Axis for Date Difference Morethen 2 and lessthen 12", () => {
    const service: ChartService = TestBed.get(ChartService);
    let startdate = new Date("2019-09-01T18:30:00.000Z");
    let endDate = new Date("2019-09-05T18:30:00.000Z");
    let inputdata = JSON.parse(`{"startDate":"","endDate":"","startDateEpoch":1567362600,"endDateEpoch":1567708200}`);
    inputdata.startDate = startdate;
    inputdata.endDate = endDate;
    let result = service.prepareXAxisLabels(inputdata);
    let ftime = (new Date(result[2]).getTime() - new Date(result[1]).getTime()) / (1000 * 3600 * 24);
    expect(ftime).toEqual(1);
  });


  it("prepare Label for X Axis for Date Difference Morethen 12 and lessthen 25", () => {
    const service: ChartService = TestBed.get(ChartService);
    let startdate = new Date("2019-09-01T18:30:00.000Z");
    let endDate = new Date("2019-09-15T18:30:00.000Z");
    let inputdata = JSON.parse(`{"startDate":"","endDate":"","startDateEpoch":1567322513,"endDateEpoch":1568532113}`);
    inputdata.startDate = startdate;
    inputdata.endDate = endDate;
    let result = service.prepareXAxisLabels(inputdata);
    let ftime = (new Date(result[2]).getTime() - new Date(result[1]).getTime()) / (1000 * 3600 * 24);
    expect(ftime).toEqual(1);
  });


  it("prepare Label for X Axis for corner case when lastdate exceeds datediff", () => {
    const service: ChartService = TestBed.get(ChartService);
    let startdate = new Date("2019-08-31T18:30:00.000Z");
    let endDate = new Date("2019-09-25T18:30:00.000Z");
    let inputdata = JSON.parse(`{"startDate":"","endDate":"","startDateEpoch":1567296000,"endDateEpoch":1569542400}`);
    inputdata.startDate = startdate;
    inputdata.endDate = endDate;
    let result = service.prepareXAxisLabels(inputdata);
    let ftime = (new Date(result[result.length - 1]));
    expect(ftime).toEqual(endDate);
  });


  // it("prepare Label for X Axis for lessthen 1 Days", () => {
  //   const service: ChartService = TestBed.get(ChartService);
  //   let startdate = new Date("2019-09-01T18:30:00.000Z");
  //   let endDate = new Date("2019-09-02T18:30:00.000Z");
  //   let inputdata = JSON.parse(`{"startDate":"","endDate":"","startDateEpoch":1567362600,"endDateEpoch":1567408913}`);
  //   inputdata.startDate = startdate;
  //   inputdata.endDate = endDate;
  //   let result = service.prepareXAxisLabels(inputdata);
  //   let ftime = ((result[2].replace(/\D/g, '') - result[1].replace(/\D/g, '')) / 100);
  //   // expect(ftime).toEqual(1);
  //   expect(result).toEqual(1);
  //   expect(dif).toBe(2);
  // });



  it("prepare Label for X Axis for 2 Days", () => {
    const service: ChartService = TestBed.get(ChartService);
    let startdate = new Date("Thu Sep 26 2019 00:00:00 GMT+0530 (India Standard Time)");
    let endDate = new Date("Thu Sep 28 2019 00:00:00 GMT+0530 (India Standard Time)");
    let inputdata = JSON.parse(`{"startDate":"","endDate":"","startDateEpoch":1569436200,"endDateEpoch":1569609000}`);
    inputdata.startDate = startdate;
    inputdata.endDate = endDate;
    let result = service.prepareXAxisLabels(inputdata);
    let dif = (new Date(endDate).getTime() - new Date(startdate).getTime()) / (1000 * 3600 * 24);
    expect(result).toBeTruthy();
    expect(dif).toBe(2);
  });

  it("Create Y Axis Details for single Graph", () => {
    const service: ChartService = TestBed.get(ChartService);
    let chartObject = JSON.parse(`{"metrics":[{"id":"revenue","showROuser":true,"value":0,"title":"Advertiser Spend","type":"CURRENCY"},{"id":"cost","showROuser":false,"value":0,"title":"Media Spend","type":"CURRENCY"},{"id":"impressions","showROuser":true,"value":0,"title":"Impressions","type":""},{"id":"clicks","showROuser":true,"value":0,"title":"Clicks","type":""},{"id":"installs","showROuser":true,"value":0,"title":"Installs","type":""},{"id":"conversions","showROuser":true,"value":0,"title":"Conversions","type":""},{"id":"viewConversions","showROuser":true,"value":0,"title":"View Conversions","type":""},{"id":"margin","showROuser":false,"value":0,"title":"Margin","type":"PERCENTAGE"},{"id":"erpm","showROuser":true,"value":0,"title":"Revenue eCPM","type":"CURRENCY"},{"id":"erpa","showROuser":true,"value":0,"title":"Revenue eCPA","type":"CURRENCY"},{"id":"erpc","showROuser":true,"value":0,"title":"Revenue eCPC","type":"CURRENCY"},{"id":"erpi","showROuser":true,"value":0,"title":"Revenue eCPI","type":"CURRENCY"},{"id":"ctr","showROuser":true,"value":0,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","showROuser":true,"value":0,"title":"ITI","type":""},{"id":"ctc","showROuser":true,"value":0,"title":"CTC","type":"PERCENTAGE"},{"id":"cvr","showROuser":true,"value":0,"title":"CVR","type":"PERCENTAGE"},{"id":"advRevenue","showROuser":true,"value":0,"title":"Advertiser Revenue","type":"CURRENCY"},{"id":"roi","showROuser":true,"value":0,"title":"ROI","type":"PERCENTAGE"},{"id":"userReach","showROuser":true,"value":0,"title":"Reach","type":"PERCENTAGE"}],"selector1":"advRevenue","selector2":"","tooltipSelector":"mData","tooltipOptions":[{"id":"mData","title":"Metrics Data"},{"id":"fData","title":"Funnel Data"}]}`);
    let outputobject = `{"labels":{"style":{"color":"#333333"},"align":"left","x":2,"y":-2},"title":{"text":"Advertiser Revenue","style":{"color":"#333333","fontSize":"12px"}},"opposite":false}`;
    let chartIndex = 1;
    let result = service.createYAxisDetails(chartObject, chartIndex, null);
    expect(JSON.stringify(result)).toEqual(outputobject);
  });

  it("Create Y Axis Details for Double Graph", () => {
    const service: ChartService = TestBed.get(ChartService);
    let chartobject2 = JSON.parse(`{"metrics":[{"id":"revenue","showROuser":true,"value":0,"title":"Advertiser Spend","type":"CURRENCY"},{"id":"cost","showROuser":false,"value":0,"title":"Media Spend","type":"CURRENCY"},{"id":"impressions","showROuser":true,"value":0,"title":"Impressions","type":""},{"id":"clicks","showROuser":true,"value":0,"title":"Clicks","type":""},{"id":"installs","showROuser":true,"value":0,"title":"Installs","type":""},{"id":"conversions","showROuser":true,"value":0,"title":"Conversions","type":""},{"id":"viewConversions","showROuser":true,"value":0,"title":"View Conversions","type":""},{"id":"margin","showROuser":false,"value":0,"title":"Margin","type":"PERCENTAGE"},{"id":"erpm","showROuser":true,"value":0,"title":"Revenue eCPM","type":"CURRENCY"},{"id":"erpa","showROuser":true,"value":0,"title":"Revenue eCPA","type":"CURRENCY"},{"id":"erpc","showROuser":true,"value":0,"title":"Revenue eCPC","type":"CURRENCY"},{"id":"erpi","showROuser":true,"value":0,"title":"Revenue eCPI","type":"CURRENCY"},{"id":"ctr","showROuser":true,"value":0,"title":"CTR","type":"PERCENTAGE"},{"id":"iti","showROuser":true,"value":0,"title":"ITI","type":""},{"id":"ctc","showROuser":true,"value":0,"title":"CTC","type":"PERCENTAGE"},{"id":"cvr","showROuser":true,"value":0,"title":"CVR","type":"PERCENTAGE"},{"id":"advRevenue","showROuser":true,"value":0,"title":"Advertiser Revenue","type":"CURRENCY"},{"id":"roi","showROuser":true,"value":0,"title":"ROI","type":"PERCENTAGE"},{"id":"userReach","showROuser":true,"value":0,"title":"Reach","type":"PERCENTAGE"}],"selector1":"advRevenue","selector2":"installs","tooltipSelector":"mData","tooltipOptions":[{"id":"mData","title":"Metrics Data"},{"id":"fData","title":"Funnel Data"}]}`);
    let outputobject2 = `{"labels":{"style":{"color":"#333333"},"align":"right","x":2,"y":-2},"title":{"text":"Installs","style":{"color":"#333333","fontSize":"12px"}},"opposite":true}`;
    let chartIndex = 2;
    let result = service.createYAxisDetails(chartobject2, chartIndex, null);
    expect(JSON.stringify(result)).toEqual(outputobject2);
  });



  // //new -test-cases

  it("should test getEmptySeries", () => {
    const chartService: ChartService = TestBed.get(ChartService);
    let expectedValue = {
      name: 'y-axis-text',
      type: "line",
      data: [],
      color: "var(--primary-color)",
    }

    // let result = chartService.getEmptySeries({ selector2: false }, 1, 'y-axis-text');
    // expect(result).toEqual(expectedValue);

    // result = chartService.getEmptySeries({ selector2: true }, 1, 'y-axis-text');
    // expect(result).toEqual(expectedValue);

    let expectedValue2 = {
      name: 'y-axis-text',
      type: "line",
      yAxis: 1,
      data: []
    };
    // result = chartService.getEmptySeries({ selector2: true }, 2, 'y-axis-text');
    // expect(result).toEqual(expectedValue2);
  });


  it("should test getMaxEpoch", () => {
    const chartService: ChartService = TestBed.get(ChartService);
    const apiResp = {
      data: [
        { id: 1, name: 'n1' },
        { id: 2, name: 'n2' },
        { id: 3, name: 'n3' },
      ]
    }

    let result = chartService.getMaxEpoch(apiResp);
    expect(result).toEqual(3);
  });


  it("should test getMap", () => {
    const chartService: ChartService = TestBed.get(ChartService);

    // request for data from 3-5 august
    let inputDates: DateRange = {
      endDate: aug_5_2020,
      endDateEpoch: 1596672000,
      startDate: aug_3_2020,
      startDateEpoch: 1596412800,
    };


    // test-1 : response has data for 4 and 5 august only
    let apiResp = {
      data: [
        // { id: 1596412800, x: 1, y: 1 },
        { id: 1596499200, x: 2, y: 4 },
        { id: 1596585600, x: 4, y: 5 }
      ],
      totalNoOfRecords: 3
    };

    // let resultMap: Map<number, any> = chartService.getMap(inputDates, apiResp);
    // expect(resultMap.size).toEqual(3);
    // expect(resultMap.get(apiResp.data[0].id)).toEqual("show");
    // expect(resultMap.get(apiResp.data[1].id)).toEqual("show");

    //test-2 : if user asked for todays data only
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);


    let inputDates2 = {
      endDate: today,
      endDateEpoch: 1598486400,
      startDate: today,
      startDateEpoch: 1598400000
    };

    let apiResp2 = {
      data: [
        { id: 1598400000, name: null, modifiedTime: null },
        { id: 1598403600, name: null, modifiedTime: null }
      ],
      totalNoOfRecords: 3
    }

    // let resultMap2 = chartService.getMap(inputDates2, apiResp2);
    // expect(resultMap2.size).toEqual(24);


    //test-3 : if no resp
    // resultMap2 = chartService.getMap(inputDates2, null);
    // expect(resultMap2).toEqual(null);
  });




  it("should test convertApiDataToHightChartData", () => {
    const chartService: ChartService = TestBed.get(ChartService);
    const apiResp = {
      data: [
        { id: 1, name: 'n1' },
        { id: 2, name: 'n2' },
        { id: 3, name: 'n3' },
      ]
    };


    // let result = chartService.convertApiDataToHightChartData(apiResp, inputDates, chartObj);
    // expect(result).toBeTruthy();


    // it("should test convertApiDataToHightChartData", () => {
    //   const chartService: ChartService = TestBed.get(ChartService);
    //   const apiResp = {
    //     data: [
    //       { id: 1, name: 'n1' },
    //       { id: 2, name: 'n2' },
    //       { id: 3, name: 'n3' },
    //     ]
    //   };

    //   let inputDates: DateRange = {
    //     endDate: aug_5_2020,
    //     endDateEpoch: 1596672000,
    //     startDate: aug_3_2020,
    //     startDateEpoch: 1596412800,
    //   };

    let inputDates: DateRange = {
      endDate: aug_5_2020,
      endDateEpoch: 1596672000,
      startDate: aug_3_2020,
      startDateEpoch: 1596412800,
    };

    // let result = chartService.createChartSeries(inputDates, apiResp, chartObj, 1, null);
    // expect(result).toEqual(chartService.getEmptySeries(chartObj, 1, ''));
  });

  //   //other small method-tests
  //   // expect(service.getCurrencyCodeForReponse({ widgetData: { currencyId: 123 } })).toEqual(123);
  // });


  // it("should test createChartSeries", () => {
  //   const chartService: ChartService = TestBed.get(ChartService);
  //   const apiResp = {
  //     data: [
  //       { id: 1, name: 'n1' },
  //       { id: 2, name: 'n2' },
  //       { id: 3, name: 'n3' },
  //     ]
  //   };

  //   let inputDates: DateRange = {
  //     endDate: aug_5_2020,
  //     endDateEpoch: 1596672000,
  //     startDate: aug_3_2020,
  //     startDateEpoch: 1596412800,
  //   };

  //   let result = chartService.createChartSeries(inputDates, apiResp, chartObj, 1, null);
  //   expect(result).toEqual(chartService.getEmptySeries(chartObj, 1, ''));
  // });

  // let resultMap: Map<number, any> = chartService.getMap(inputDates, apiResp);
  // let result = chartService.prepareChartDataSeries(inputDates, apiResp, chartObj2, resultMap);
  // expect(result.length).toEqual(2);

  // result = chartService.prepareYAxisLabels(chartObj2, null);
  // expect(result.length).toEqual(2);



  it("Date Fomater", () => {
    const service: ChartService = TestBed.get(ChartService);
    let apiData = {
      widgetData: {
        currencyId: 45
      }
    };

    //test-1
    let result = service.getCurrencyCodeForReponse(apiData);
    expect(result).toEqual(apiData.widgetData.currencyId);

    //test-2
    apiData.widgetData.currencyId = null;
    result = service.getCurrencyCodeForReponse(apiData);
    expect(result).toEqual(null);

    //test-2
    apiData.widgetData = null
    result = service.getCurrencyCodeForReponse(apiData);
    expect(result).toEqual(null);

    //test-2
    apiData = null
    result = service.getCurrencyCodeForReponse(apiData);
    expect(result).toEqual(null);
  });



});

