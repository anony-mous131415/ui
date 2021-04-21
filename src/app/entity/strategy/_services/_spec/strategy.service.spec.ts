import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import * as STUB from '@app/shared/StubClasses';
import { AudienceControllerService, BulkStrategyControllerService, CampaignControllerService, DashboardControllerService, StrategyControllerService, TargetingObject, CreativeDTO, StrategyDTO, BaseModel, RTBSites } from '@revxui/api-client-ts';
import * as moment from 'moment';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';


describe('StrategyEditService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
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
      { provide: CampaignControllerService, useClass: STUB.CampaignControllerService_stub },
      { provide: StrategyControllerService, useClass: STUB.StrategyControllerService_stub },
      { provide: BulkStrategyControllerService, useClass: STUB.BulkStrategyControllerService_stub },
      { provide: AudienceControllerService, useClass: STUB.AudienceControllerService_stub },
    ],
  }));

  it('should be created', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    expect(service).toBeTruthy();
  });

  //new-test-cases
  it('should test initAudienceSelectionObject', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const expected = {
      app: {
        blockedList: [],
        targetList: []
      } as TargetingObject,
      web: {
        blockedList: [],
        targetList: []
      } as TargetingObject,
      dmp: {
        blockedList: [],
        targetList: []
      } as TargetingObject,
    };


    const result = service.initAudienceSelectionObject();
    expect(result).toEqual(expected);
  });


  it('should test getAudienceType', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const result_1 = service.getAudienceType();
    const result_2 = service.getAudienceType(false);
    expect(result_1.length).toEqual(3);
    expect(result_2.length).toEqual(2);
  });


  it('should test modCreativeDetails', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const dtoNotNull: CreativeDTO = {
      type: 'image',
      urlPath: 'urlPath',
      size: {
        height: 10,
        width: 10
      }
    }
    const dtoNull: CreativeDTO = {
      type: null,
      urlPath: null,
      size: null
    }

    const result_1 = service.modCreativeDetails([dtoNotNull]);
    const result_2 = service.modCreativeDetails([dtoNull]);
    const result_3 = service.modCreativeDetails(null);

    expect(result_1).toEqual([dtoNotNull]);
    expect(result_2).toEqual([dtoNull]);
    expect(result_3).toEqual(null);
  });


  it('should test getHours', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const result_1 = service.getHours('morning');
    const result_2 = service.getHours('officeHrs');
    const result_3 = service.getHours('evening');
    const result_4 = service.getHours('night');

    expect(result_1).toEqual([6, 7, 8, 9]);
    expect(result_2).toEqual([10, 11, 12, 13, 14, 15, 16, 17]);
    expect(result_3).toEqual([18, 19, 20, 21]);
    expect(result_4).toEqual([22, 23, 0, 1, 2, 3, 4, 5]);
  });


  it('should test getDifference', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const result_1 = service.getDifference(0, 23);
    const result_2 = service.getDifference(23, 23);
    const result_5 = service.getDifference(0, 0);
    const result_3 = service.getDifference(12, 14);
    const result_4 = service.getDifference(14, 19);

    expect(result_1).toEqual(1);
    expect(result_2).toEqual(0);
    expect(result_3).toEqual(2);
    expect(result_4).toEqual(5);
    expect(result_5).toEqual(0);
  });


  it('should test getFormattedHours', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const morning = [6, 7, 8, 9];
    const officeHrs = [10, 11, 12, 13, 14, 15, 16, 17];
    const night = [22, 23, 0, 1, 2, 3, 4, 5];

    const part_1 = [6, 7, 8, 9]
    const part_2 = [6, 7, 10, 11]
    const part_3 = [10, 11, 12];


    const result_1 = service.getDayPartStr(morning, part_1);
    const result_2 = service.getDayPartStr(morning, part_2);
    const result_3 = service.getDayPartStr(morning, part_3);
    const result_4 = service.getDayPartStr(officeHrs, part_1);
    const result_5 = service.getDayPartStr(officeHrs, part_2);
    const result_6 = service.getDayPartStr(officeHrs, part_3);
    const result_7 = service.getDayPartStr(night, [22, 1, 2, 6]);

    expect(result_1).toEqual({ hours: [[6, 9]] });
    expect(result_2).toEqual({ hours: [[6, 7]] });
    expect(result_3).toEqual({ hours: [] });
    expect(result_4).toEqual({ hours: [] });
    expect(result_5).toEqual({ hours: [[10, 11]] });
    expect(result_6).toEqual({ hours: [[10, 12]] });
    expect(result_7).toEqual({ hours: [[22, 22], [1, 2]] });
  });


  it('should test getFormattedHours', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const allDay = []

    for (let i = 0; i < 24; i++) {
      allDay.push(i);
    }
    const result_1 = service.getFormattedHours([6, 7, 8, 9]);
    const result_2 = service.getFormattedHours([8, 9, 10, 11]);
    const result_3 = service.getFormattedHours(allDay);

    const JSON_1 = { "isAllDay": false, "morning": { "hours": [[6, 9]] }, "officeHours": { "hours": [] }, "evening": { "hours": [] }, "night": { "hours": [] } };
    const JSON_2 = { "isAllDay": false, "morning": { "hours": [[8, 9]] }, "officeHours": { "hours": [[10, 11]] }, "evening": { "hours": [] }, "night": { "hours": [] } };

    expect(result_1).toEqual(JSON_1);
    expect(result_2).toEqual(JSON_2);
    expect(result_3).toEqual({ isAllDay: true });
  });


  it('should test getter and setter of MasterRequest DTO', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    service.setStrBasicDetails({ id: 123, name: '456' });
    const result = service.getStrBasicDetails();
    expect(result).toEqual({ id: 123, name: '456' });
  });


  it('should test getConnectionTypeAlias', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const input_1 = StrategyDTO.ConnectionTypesEnum.WIFI;
    const input_2 = StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK2G;
    const input_3 = StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK3G;
    const input_4 = StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK4G;
    const input_5 = StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK5G;
    const input_6 = 'random string';
    expect(service.getConnectionTypeAlias(input_1)).toEqual('Wifi');
    expect(service.getConnectionTypeAlias(input_2)).toEqual('2G');
    expect(service.getConnectionTypeAlias(input_3)).toEqual('3G');
    expect(service.getConnectionTypeAlias(input_4)).toEqual('4G');
    expect(service.getConnectionTypeAlias(input_5)).toEqual('5G');
    expect(service.getConnectionTypeAlias(input_6)).toEqual(null);
  });



  it('should test getConnectionTypes', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const input_1 = STUB.strategyDto;
    const input_2: StrategyDTO = {
      connectionTypes: null
    };
    service.setStrDetails(input_1);
    const result_1 = service.getConnectionTypes();
    expect(result_1).toEqual('Wifi, 4G');
    service.setStrDetails(input_2);
    const result_2 = service.getConnectionTypes();
    expect(result_2).toEqual('Any');
  });


  it('should test getCreativePlacement', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const input_1 = STUB.strategyDto;
    const input_2: StrategyDTO = {
      placements: null
    };
    service.setStrDetails(input_1);
    const result_1 = service.getCreativePlacement();
    expect(result_1).toEqual('Mobile Applications');
    service.setStrDetails(input_2);
    const result_2 = service.getCreativePlacement();
    expect(result_2).toEqual('');
  });


  it('should test getBudgetPart', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    service.setStrDetails(STUB.strategyDto);
    const result_1 = service.getBudgetPart(true);
    expect(result_1.length).toBe(6);
    const nullDto: any = {
      pricingType: null,
      pricingValue: null,
      currencyCode: null,
      campaign: {
        currencyCode: 'USD'
      }
    }
    service.setStrDetails(nullDto);
    const result_2 = service.getBudgetPart(false);
    expect(result_2.length).toBe(6);
  });


  it('should test getBidValue', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    service.setStrDetails(STUB.strategyDto);
    const result_1 = service.getBidValue();
    expect(result_1).toEqual('100% of predicted value');

    const nullDto: StrategyDTO = {
      bidPercentage: null
    }
    service.setStrDetails(nullDto);
    const result_2 = service.getBidValue();
    expect(result_2).toEqual('NA');
  });


  it('should test getCreativePart', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const nullDto: StrategyDTO = {
      creatives: null
    };
    service.setStrDetails(nullDto);
    const result = service.getCreativePart();

    const expectedVal = [
      { type: 'creative', id: 'creatives', title: 'Creatives', value: null }
    ];

    expect(result).toEqual(expectedVal);
  });


  it('should test getMobileOS', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const nullDto: StrategyDTO = {
      targetMobileDevices: null
    };
    service.setStrDetails(nullDto);
    const result_1 = service.getMobileOS(null);
    expect(result_1).toEqual('Any');

    service.setStrDetails(STUB.strategyDto);
    const result_2 = service.getMobileOS(null);
    expect(result_2).toEqual('Android (Any), ios (8.0)');
  });



  it('should test getDeviceType', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const nullDto: StrategyDTO = {
      targetMobileDevices: null
    };
    service.setStrDetails(nullDto);
    const result_1 = service.getDeviceType();
    expect(result_1).toEqual('Any');

    service.setStrDetails(STUB.strategyDto);
    const result_2 = service.getDeviceType();
    expect(result_2).toEqual('Smartphone');
  });


  it('should test getDealCategories', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const nullDto: StrategyDTO = {
      targetDealCategory: null
    };
    service.setStrDetails(nullDto);
    const result_1 = service.getDealCategories(null);
    expect(result_1).toEqual([]);

    service.setStrDetails(STUB.strategyDto);
    const result_2 = service.getDealCategories(null);
    expect(result_2).toEqual([{ id: 12, name: 'deal-1' }]);
  });


  it('should test getBidRangeMax', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const nullDto: StrategyDTO = {
      bidCapMax: null
    };

    const minus1: StrategyDTO = {
      bidCapMax: -1
    };

    service.setStrDetails(STUB.strategyDto);
    const result_1 = service.getBidRangeMax();
    expect(result_1).toEqual(20);

    service.setStrDetails(nullDto);
    let result_2 = service.getBidRangeMax();
    expect(result_2).toEqual('NA');

    service.setStrDetails(minus1);
    result_2 = service.getBidRangeMax();
    expect(result_2).toEqual('NA');

  });


  it('should test getBidRangeMin', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const nullDto: StrategyDTO = {
      bidCapMin: null
    };

    const zeroDto: StrategyDTO = {
      bidCapMin: 0
    };

    service.setStrDetails(STUB.strategyDto);
    const result_1 = service.getBidRangeMin();
    expect(result_1).toEqual(10);

    service.setStrDetails(nullDto);
    let result_2 = service.getBidRangeMin();
    expect(result_2).toEqual('NA');

    service.setStrDetails(zeroDto);
    result_2 = service.getBidRangeMin();
    expect(result_2).toEqual('NA');
  });


  it('should test getBidRange', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const nullDto: StrategyDTO = {
      bidCapMax: null,
      bidCapMin: null
    };

    service.setStrDetails(nullDto);
    let result_2 = service.getBidRange();
    expect(result_2).toEqual('NA');

    nullDto.bidCapMin = 0;
    nullDto.bidCapMax = -1;

    service.setStrDetails(nullDto);
    result_2 = service.getBidRange();
    expect(result_2).toEqual('NA');

    service.setStrDetails(STUB.strategyDto);
    const result_1 = service.getBidRange();
    expect(result_1).toEqual('10 to 20');
  });



  it('should test getBudgetPacing', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: StrategyDTO = {
      pacingType: {
        id: 1
      },
      currencyCode: 'USD'
    };

    service.setStrDetails(strDto);
    let result = service.getBudgetPacing(false);
    expect(result).toEqual('ASAP');

    strDto.pacingType.id = 5
    service.setStrDetails(strDto);
    result = service.getBudgetPacing(false);
    expect(result).toEqual('Evenly');

    strDto.pacingType = null
    service.setStrDetails(strDto);
    result = service.getBudgetPacing(false);
    expect(result).toEqual(null);

    //true
    strDto.pacingType = null;
    strDto.pacingBudgetValue = null;
    service.setStrDetails(strDto);
    result = service.getBudgetPacing(true);
    expect(result).toEqual('null');

    strDto.pacingType = { id: 1, name: 'ASAP' };
    strDto.pacingBudgetValue = 20;
    service.setStrDetails(strDto);
    result = service.getBudgetPacing(true);
    expect(result).toEqual('ASAP 20 USD');
  });


  it('should test getBidType', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: StrategyDTO = {
      pricingType: {
        id: 3,
        name: 'CPA'
      }
    };

    service.setStrDetails(strDto);
    let result = service.getBidType();
    expect(result).toEqual('CPA');

    strDto.pricingType.id = 45;//doesnt exist
    service.setStrDetails(strDto);
    result = service.getBidType();
    expect(result).toEqual(null);

    strDto.pricingType = null;
    service.setStrDetails(strDto);
    result = service.getBidType();
    expect(result).toEqual(null);
  });


  it('should test getBidTypeAndGoal', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: StrategyDTO = {
      pricingType: { id: 3, name: "CPA" },
      pricingValue: 10,
      currencyCode: 'USD'
    };

    service.setStrDetails(strDto);
    let result = service.getBidTypeAndGoal();
    expect(result).toEqual('CPA 10 USD');

    strDto.pricingType.id = 45;//doesnt exist
    service.setStrDetails(strDto);
    result = service.getBidTypeAndGoal();
    expect(result).toEqual(null);

    strDto.pricingType = null;
    strDto.pricingValue = null;
    strDto.currencyCode = null;
    service.setStrDetails(strDto);
    result = service.getBidTypeAndGoal();
    expect(result).toEqual(null);
  });


  it('should test getDailyMediaBudget', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: any = {
      pacingBudgetValue: 13,
      campaign: {
        currencyCode: 'USD'
      }
    };

    service.setStrDetails(strDto);
    let result = service.getDailyMediaBudget();
    expect(result).toEqual('13 USD / Day');

    strDto.pacingBudgetValue = null
    service.setStrDetails(strDto);
    result = service.getDailyMediaBudget();
    expect(result).toEqual('NA');
  });

  it('should test getLifeTimeMediaBudget', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: any = {
      budgetValue: 13,
      campaign: {
        currencyCode: 'USD'
      }
    };

    service.setStrDetails(strDto);
    let result = service.getLifeTimeMediaBudget();
    expect(result).toEqual('Limit to 13 USD');

    strDto.budgetValue = -1;
    strDto.campaign = null;
    service.setStrDetails(strDto);
    result = service.getLifeTimeMediaBudget();
    expect(result).toEqual('Unlimited');
  });


  it('should test getDailyMediaBudget', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: any = {
      pacingBudgetValue: 13,
      campaign: {
        currencyCode: 'USD'
      }
    };

    service.setStrDetails(strDto);
    let result = service.getDailyMediaBudget();
    expect(result).toEqual('13 USD / Day');

    strDto.pacingBudgetValue = null
    service.setStrDetails(strDto);
    result = service.getDailyMediaBudget();
    expect(result).toEqual('NA');
  });

  it('should test getPixelDetail', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: StrategyDTO = {
      pixels: [{
        id: 12,
        name: 'pixel-1'
      }]
    };

    service.setStrDetails(strDto);
    let result = service.getPixelDetail();
    expect(result).toEqual({ id: 12, name: 'pixel-1' });

    strDto.pixels = null;
    service.setStrDetails(strDto);
    result = service.getPixelDetail();
    expect(result).toEqual(null);
  });


  it('should test getDailyFCap', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let strDto: any = {
      campaignFcap: true,
      campaign: {
        fcap: 12
      },
      fcapFrequency: 22
    };

    service.setStrDetails(strDto);
    let result = service.getDailyFCap();
    expect(result).toEqual('Use Campaign Fcap setting - Show ad no more than 12 times per user in one day');

    strDto.campaignFcap = false;
    service.setStrDetails(strDto);
    result = service.getDailyFCap();
    expect(result).toEqual('Show ad no more than 22 times per user in one day');
  });



  it('should test getStrategyTime', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const feb_1_2020_epoch = 1580601600;
    const feb_1_2020_Date = moment(new Date(1580601600 * 1000)).format('DD MMM YYYY h:mm A');

    let strDto: any = {
      campaign: {
        startTime: feb_1_2020_epoch
      }
    }

    //checks end time is never-ending
    let result = service.getStrategyTime(-1, false);
    let expectedVal = 'Never Ending';
    expect(result).toEqual(expectedVal);


    //checks valid end time
    result = service.getStrategyTime(feb_1_2020_epoch, false);
    expectedVal = feb_1_2020_Date
    expect(result).toEqual(expectedVal);


    //checks start-time = -1
    service.setStrDetails(strDto);
    result = service.getStrategyTime(-1, true);
    let currDate = moment(new Date()).format('DD MMM YYYY h:mm A');
    expect(result).toEqual(currDate);

    //checks valid start-time
    service.setStrDetails(strDto);
    result = service.getStrategyTime(feb_1_2020_epoch, true);
    currDate = moment(new Date()).format('DD MMM YYYY h:mm A');
    expect(result).toEqual(feb_1_2020_Date);
  });


  it('should test hasSpecialCharacters', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let result = service.hasSpecialCharacters('1234');
    expect(result).toEqual(false);

    result = service.hasSpecialCharacters('', /[a-zA-Z]+/);
    expect(result).toEqual(false);

    result = service.hasSpecialCharacters('123#$');
    expect(result).toEqual(true);
  });


  it('should test hasSpecialCharacterCustom', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let result = service.hasSpecialCharacterCustom('1234');
    expect(result).toEqual(false);

    result = service.hasSpecialCharacterCustom('');
    expect(result).toEqual(false);

    result = service.hasSpecialCharacterCustom('123abcd');
    expect(result).toEqual(true);
  });


  it('should test updateStrategyStatus', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    const calledService = TestBed.get(StrategyControllerService);
    let spy = spyOn(calledService, 'activateStrategyUsingPOST');
    service.updateStrategyStatus(true, 1234);
    expect(spy).toHaveBeenCalledTimes(1);

    spy = spyOn(calledService, 'deactivateStrategyUsingPOST');
    service.updateStrategyStatus(false, 1234);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test getBasicPart', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    service.setStrDetails(STUB.strategyDto);
    let result = service.getBasicPart(true);
    expect(result.length).toEqual(5);

    service.setStrDetails(STUB.strategyDto);
    result = service.getBasicPart(false);
    expect(result.length).toEqual(4);

  });



  it('should test getAudienceSegments', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    //getting from service
    service.setStrDetails(STUB.strategyDto);
    let result_target = service.getAudienceSegments(true, null, null, null);
    let result_block = service.getAudienceSegments(false, null, null, null);


    //manually calculating
    let expectedTargetted = [];
    let expectedBlocked = [];

    //target-app
    if (STUB.strategyDto.targetAppSegments && STUB.strategyDto.targetAppSegments.targetedSegments.length > 0) {
      STUB.strategyDto.targetAppSegments.targetedSegments.forEach(item => {
        expectedTargetted.push({ ...item, type: AudienceConstants.TYPE.APP });
      })
    }

    //target-web
    if (STUB.strategyDto.targetWebSegments && STUB.strategyDto.targetWebSegments.targetedSegments.length > 0) {
      STUB.strategyDto.targetWebSegments.targetedSegments.forEach(item => {
        expectedTargetted.push({ ...item, type: AudienceConstants.TYPE.WEB });
      })
    }

    //target-dmp
    if (STUB.strategyDto.targetDmpSegments && STUB.strategyDto.targetDmpSegments.targetedSegments.length > 0) {
      STUB.strategyDto.targetDmpSegments.targetedSegments.forEach(item => {
        expectedTargetted.push({ ...item, type: AudienceConstants.TYPE.DMP });
      })
    }

    //block-app
    if (STUB.strategyDto.targetAppSegments && STUB.strategyDto.targetAppSegments.blockedSegments.length > 0) {
      STUB.strategyDto.targetAppSegments.blockedSegments.forEach(item => {
        expectedBlocked.push({ ...item, type: AudienceConstants.TYPE.APP });
      })
    }

    //block-web
    if (STUB.strategyDto.targetWebSegments && STUB.strategyDto.targetWebSegments.blockedSegments.length > 0) {
      STUB.strategyDto.targetWebSegments.blockedSegments.forEach(item => {
        expectedBlocked.push({ ...item, type: AudienceConstants.TYPE.WEB });
      })
    }

    //block-dmp
    if (STUB.strategyDto.targetDmpSegments && STUB.strategyDto.targetDmpSegments.blockedSegments.length > 0) {
      STUB.strategyDto.targetDmpSegments.blockedSegments.forEach(item => {
        expectedBlocked.push({ ...item, type: AudienceConstants.TYPE.DMP });
      })
    }

    expect(result_target).toEqual(expectedTargetted);
    expect(result_block).toEqual(expectedBlocked);

    //if-empty
    service.setStrDetails({});
    result_target = service.getAudienceSegments(true, null, null, null);
    result_block = service.getAudienceSegments(false, null, null, null);
    expect(result_target).toEqual([]);
    expect(result_block).toEqual([]);
  });


  it('should test filterAndTransformData', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let data: any[] = [
      { id: 1, name: 'name-1' },
      { id: 2, name: 'name-2' },
    ]

    expect(service.filterAndTransformData('COUNTRY', data)).toEqual(data);
    expect(service.filterAndTransformData('AUDIENCE', data)).toEqual(data);
    expect(service.filterAndTransformData('DMP_AUDIENCE', data)).toEqual(data);
    expect(service.filterAndTransformData('AGGREGATOR', data)).toEqual(data);
    expect(service.filterAndTransformData('DEVICE_BRAND', data)).toEqual(data);
    expect(service.filterAndTransformData('DEVICE_MODEL', data)).toEqual(data);
    expect(service.filterAndTransformData('APP_CATEGORY', data)).toEqual(data);
    expect(service.filterAndTransformData('DEAL_CATEGORY', data)).toEqual(data);

    expect(service.filterAndTransformData('RANDOM', data)).toEqual([]);


    data = [
      { id: 1, countryName: 'c1', stateName: 's1', name: 'n1' },
      { id: 2, countryName: 'c2', stateName: 's2', name: 'n2' },
    ];

    const stateExpected = [
      { id: 1, name: 'c1 - n1' },
      { id: 2, name: 'c2 - n2' }
    ];

    const cityExpected = [
      { id: 1, name: 'c1 - s1 - n1' },
      { id: 2, name: 'c2 - s2 - n2' }
    ]

    expect(service.filterAndTransformData('STATE', data)).toEqual(stateExpected);
    expect(service.filterAndTransformData('CITY', data)).toEqual(cityExpected);
  });



  it('should test isCustomSegmentTargeting', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    const customDto: StrategyDTO = {
      targetAppSegments: {
        customSegmentTargeting: null
      }
    };

    service.setStrDetails(customDto);
    let result = service.isCustomSegmentTargeting();
    expect(result).toEqual(false);

    service.setStrDetails(STUB.strategyDto);
    result = service.isCustomSegmentTargeting();
    expect(result).toEqual(true);
  });


  it('should test checkIsAllSites', () => {
    const service: StrategyService = TestBed.get(StrategyService);

    let sites: RTBSites = {
      selectAllSites: true,
      rtbSites: {
        blockedList: [{ id: 1, name: 'block-1' }]
      }
    };


    //with 1 blocked
    let result = service.checkIsAllSites(sites);
    let expectation = false;
    expect(result).toEqual(expectation);

    //with none blocked
    sites.rtbSites.blockedList = null;
    result = service.checkIsAllSites(sites);
    expectation = sites.selectAllSites;
    expect(result).toEqual(expectation);

    //with null
    result = service.checkIsAllSites(null);
    expectation = undefined;
    expect(result).toEqual(expectation);
  });

  it('should test getters and setters', () => {
    const service: StrategyService = TestBed.get(StrategyService);
    let result;
    let expectation;

    service.setIsSaved(false);
    result = service.getIsSaved();
    expect(result).toEqual(false);


    let objectCustom = {
      id: 12,
      name: 'qwerty'
    };

    //advertiser
    service.setAdvertiserDetails(objectCustom);
    result = service.getAdvertiserDetails();
    expect(result).toEqual(objectCustom);

    //campaign
    service.setCampaignDetails(objectCustom);
    result = service.getCampaignDetails();
    expect(result).toEqual(objectCustom);


    //setStrID
    service.setStrID(objectCustom.id);
    result = service.getStrID();
    expect(result).toEqual(objectCustom.id);

    //setStrID=null
    service.setStrID(null);
    result = service.getStrID();
    expect(result).toEqual('NA');

    //setname
    service.setStrName(objectCustom.name);
    result = service.getStrName();
    expect(result).toEqual(objectCustom.name);

    expect(service.getReqID()).toBeDefined();


  });



});
