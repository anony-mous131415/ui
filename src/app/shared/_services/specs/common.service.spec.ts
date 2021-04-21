import { TestBed } from '@angular/core/testing';
import { CommonService } from '../common.service';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DashboardControllerService } from '@revxui/api-client-ts';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';


describe('CommonService', () => {

  let service: CommonService;

  beforeEach(() => TestBed.configureTestingModule({

    imports: [
      RouterModule.forRoot([]),
      RouterTestingModule,
      HttpClientTestingModule,
    ],

    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
    ],

  }));

  it('should be created', () => {
    const service: CommonService = TestBed.get(CommonService);
    expect(service).toBeTruthy();
  });


  //new-test-cases
  it('should Test convertIdsToCommaSeperatedString with array input', () => {
    service = TestBed.get(CommonService);
    const arrOfIds = [1, 2, 34];
    let result = service.convertIdsToCommaSeperatedString(arrOfIds);
    expect(result).toEqual('1,2,34');
  });


  it('should Test convertIdsToCommaSeperatedString with non-array input', () => {
    service = TestBed.get(CommonService);
    const arrOfIds = 1;
    let result = service.convertIdsToCommaSeperatedString(arrOfIds);
    expect(result).toEqual('');
  });


  it('should Test encodeAdvId with advId = 6804 and 5919', () => {
    service = TestBed.get(CommonService);
    const advId_1 = 6804;
    const advId_2 = 5919;
    let result_1 = service.encodeAdvId(advId_1);
    let result_2 = service.encodeAdvId(advId_2);
    expect(result_1).toEqual('giae');
    expect(result_2).toEqual('fjbj');
  });




  it('should Test decodeAdvId , output should be advId = 6804 and 5919', () => {
    service = TestBed.get(CommonService);
    const input_1 = 'giae';
    const input_2 = 'fjbj';
    let adv_1 = service.decodeAdvId(input_1);
    let adv_2 = service.decodeAdvId(input_2);
    expect(adv_1).toEqual(6804);
    expect(adv_2).toEqual(5919);
  });



  it('should Test getSubdomain will empty string and null and string with no dot', () => {
    service = TestBed.get(CommonService);
    const result_1 = service.getSubdomain(null);
    const result_2 = service.getSubdomain('');
    const result_3 = service.getSubdomain('stringwithnodots');
    expect(result_1).toEqual('');
    expect(result_2).toEqual('');
    expect(result_3).toEqual('');
  });



  it('should Test getSubdomain with string having dot', () => {
    service = TestBed.get(CommonService);
    const result_1 = service.getSubdomain('www.domain.com');
    const result_2 = service.getSubdomain('revx.banglore');
    expect(result_1).toEqual('');
    expect(result_2).toEqual('revx');
  });



  it('should Test nrFormatTooltip with all possible types', () => {
    service = TestBed.get(CommonService);
    const result_1 = service.nrFormatTooltip(null, AppConstants.NUMBER_TYPE_CURRENCY, 'USD');
    const result_2 = service.nrFormatTooltip(20, AppConstants.NUMBER_TYPE_PERCENTAGE);
    const result_3 = service.nrFormatTooltip(45, AppConstants.NUMBER_TYPE_NOTHING);
    expect(result_1).toEqual(AppConstants.CURRENCY_MAP.USD + ' 0');
    expect(result_2).toEqual('20 %');
    expect(result_3).toEqual('45');
  });


  it('should Test getUID', () => {
    service = TestBed.get(CommonService);
    const result = service.getUID()
    expect(result).toBeGreaterThan(Math.pow(10, 1));
  });



  it('should Test nrFormat and nrFormatWithCurrency', () => {
    service = TestBed.get(CommonService);

    const trillion_1 = 1 * Math.pow(10, 12);
    const billion_2 = 2 * Math.pow(10, 9);
    const million_3 = 3 * Math.pow(10, 6);
    const thousand_4 = 4 * Math.pow(10, 3);
    const hundreds_5 = 5 * Math.pow(10, 2);
    const tens_6 = 6 * Math.pow(10, 1);
    const units_7 = 7 * Math.pow(10, 0);
    const zero_8 = 0;

    const result_1 = service.nrFormat(trillion_1, undefined);
    const result_2 = service.nrFormat(billion_2, AppConstants.NUMBER_TYPE_CURRENCY, 'USD');
    const result_3 = service.nrFormat(million_3, AppConstants.NUMBER_TYPE_NOTHING);
    const result_4 = service.nrFormat(thousand_4, AppConstants.NUMBER_TYPE_PERCENTAGE);
    const result_5 = service.nrFormat(hundreds_5, undefined);
    const result_6 = service.nrFormat(tens_6, AppConstants.NUMBER_TYPE_CURRENCY, 'USD');
    const result_7 = service.nrFormat(units_7, AppConstants.NUMBER_TYPE_NOTHING);
    const result_8 = service.nrFormatWithCurrency(zero_8, AppConstants.NUMBER_TYPE_PERCENTAGE, null);

    expect(result_1).toEqual('1.00T');
    expect(result_2).toEqual(AppConstants.CURRENCY_MAP.USD + ' 2.00B');
    expect(result_3).toEqual('3.00M');
    expect(result_4).toEqual('4.00K%');
    expect(result_5).toEqual('500');
    expect(result_6).toEqual(AppConstants.CURRENCY_MAP.USD + ' 60.00');
    expect(result_7).toEqual('7');
    expect(result_8).toEqual('0.00%');
    expect(service.nrFormat(undefined)).toEqual(undefined);
  });


  it('should Test nrFormatWithComma', () => {
    service = TestBed.get(CommonService);

    const thousand_2 = 2 * Math.pow(10, 3);
    const hundred_3 = 3 * Math.pow(10, 2);

    const result_1 = service.nrFormatWithComma(thousand_2, undefined);
    const result_2 = service.nrFormatWithComma(thousand_2, AppConstants.NUMBER_TYPE_CURRENCY);
    const result_3 = service.nrFormatWithComma(hundred_3, AppConstants.NUMBER_TYPE_PERCENTAGE);
    const result_4 = service.nrFormatWithComma(hundred_3);
    const result_5 = service.nrFormatWithComma(undefined);


    expect(result_1).toEqual('2,000');
    expect(result_2).toEqual('null 2,000');
    expect(result_3).toEqual('300.00%');
    expect(result_4).toEqual('300');
    expect(result_5).toEqual(undefined);


  });



  it('should Test validateEmail', () => {
    service = TestBed.get(CommonService);

    const result_1 = service.validateEmail(null);
    const result_2 = service.validateEmail('demo.user@gmail.com');
    const result_3 = service.validateEmail('random-string-input');
    const result_4 = service.validateEmail();

    expect(result_1).toEqual(false);
    expect(result_2).toEqual(true);
    expect(result_3).toEqual(false);
    expect(result_4).toEqual(false);
  });



  it('should Test validateEmail', () => {
    service = TestBed.get(CommonService);

    //UTC epochs
    const jan_1_2020 = 1577836800;
    const nov_1_2019 = 1572566400;

    const result_1 = service.epochToUTCDateFormatter(jan_1_2020);
    const result_2 = service.epochToUTCDateFormatter(nov_1_2019);

    const result_3 = service.epochToDateFormatter(jan_1_2020);
    const result_4 = service.epochToDateFormatter(nov_1_2019);

    const result_5 = service.epochToDateTimeFormatter(jan_1_2020);
    const result_6 = service.epochToDateTimeFormatter(nov_1_2019);

    expect(result_1).toEqual('Wed, Jan 1, 2020 12:00 AM');
    expect(result_2).toEqual('Fri, Nov 1, 2019 12:00 AM');
    expect(result_3).toEqual('1 Jan 2020');
    expect(result_4).toEqual('1 Nov 2019');
    expect(result_5).toEqual('1 Jan 2020 , 5:30 AM');
    expect(result_6).toEqual('1 Nov 2019 , 5:30 AM');

    expect(service.epochToDateFormatter(CampaignConstants.NEVER_ENDING_EPOCH)).toEqual('Never Ending');
  });



  it('should Test getReqID', () => {
    service = TestBed.get(CommonService);
    expect(service.getReqID()).toBeDefined();
  });



  it('should Test getDateFromEpoch and getEpochFromDate', () => {
    service = TestBed.get(CommonService);

    let now = new Date();
    let nowEpoch = now.setMilliseconds(0);
    nowEpoch = now.getTime() / 1000;


    let result = service.getEpochFromDate(now);
    expect(result).toEqual(nowEpoch);

    let result2 = service.getDateFromEpoch(nowEpoch);
    expect(result2).toEqual(now);

  });












});
