import { TestBed } from '@angular/core/testing';

import { StrategyBulkEditService } from './strategy-bulk-edit.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StrategyControllerService, BulkStrategyControllerService, AudienceControllerService, DashboardControllerService, StrategyDTO, BulkEditStrategiesDTO } from '@revxui/api-client-ts';
import * as STUB from '@app/shared/StubClasses';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material';
import { CommonService } from '@app/shared/_services/common.service';
import { StrategyConstants } from '../_constants/StrategyConstants';


describe('StrategyBulkEditService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterModule.forRoot([]),
      RouterTestingModule,
      HttpClientTestingModule,
      MatDialogModule,
    ],

    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
      { provide: StrategyControllerService, useClass: STUB.StrategyControllerService_stub },
      { provide: BulkStrategyControllerService, useClass: STUB.BulkStrategyControllerService_stub },
      { provide: AudienceControllerService, useClass: STUB.AudienceControllerService_stub },
      { provide: CommonService, useClass: STUB.CommonService_stub },

    ],
  }));



  it('should be created', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);
    expect(service).toBeTruthy();
  });





  it('should test setStrategiesForBulkEdit', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);
    const list = [{ id: 1, name: 'n' }];
    service.setStrategiesForBulkEdit(list);
    expect(service.getStrategiesForBulkEdit()).toEqual(list);
  });


  it('should test getChipColor', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);
    expect(service.getChipColor(null)).toEqual("gray");
  });




  it('should test getChipText', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);
    expect(service.getChipText("APPEND")).toEqual("Append");
    expect(service.getChipText("REPLACE")).toEqual("Replace");
    expect(service.getChipText("NO_CHANGE")).toEqual("No change");
    expect(service.getChipText("random")).toEqual("No change");
  });



  it('should test getStrategyTime', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);
    const spy = spyOn(TestBed.get(CommonService), 'getDateFromEpoch').and.returnValue(123);
    expect(service.getStrategyTime(-1, true)).toEqual("--");
    expect(service.getStrategyTime(0, true)).toBeDefined();

    expect(service.getStrategyTime(-1, false)).toEqual("Never Ending");
    expect(service.getStrategyTime(0, false)).toBeDefined();
  });




  it('should test getBulkEditSettings', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);

    let settings = {
      "name": {
        "allowedBulkEditOpts": [
          {
            "id": "APPEND",
            "name": "Append"
          },
          {
            "id": "NO_CHANGE",
            "name": "No Change"
          }
        ],
        "selectedBulkEditOpt": "APPEND"
      },
      "schedule": {
        "allowedBulkEditOpts": [
          {
            "id": "REPLACE",
            "name": "Replace"
          },
          {
            "id": "NO_CHANGE",
            "name": "No Change"
          }
        ],
        "selectedBulkEditOpt": "NO_CHANGE"
      }
    };

    expect(service.getBulkEditSettings(StrategyConstants.STEP_TITLE_BASIC)).toEqual(settings);
    expect(service.getBulkEditSettings(StrategyConstants.STEP_TITLE_INVENTORY)).toBeDefined();
    expect(service.getBulkEditSettings(StrategyConstants.STEP_TITLE_TARGETING)).toBeDefined();
    expect(service.getBulkEditSettings(StrategyConstants.STEP_TITLE_BUDGET)).toBeDefined();
    expect(service.getBulkEditSettings(StrategyConstants.STEP_TITLE_CREATIVES)).toBeDefined();
    expect(service.getBulkEditSettings('123')).toBeUndefined();
  });




  it('should test convertStrategyDtoToBulkEditRequestDto', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);


    let strDto: StrategyDTO = {
      targetAppSegments: null,
      rtbSites: null,
      auctionTypeTargeting: "ALL",
      bidCapMax: 12,
      bidCapMin: 11,
      budgetValue: 1,
      creatives: null,
      targetDays: null,
      targetDealCategory: null,
      targetDmpSegments: null,
      endTime: 123456,
      targetGeographies: null,
      rtbAggregators: null,
      targetMobileDevices: {
        targetOperatingSystems: {
          operatingSystems: null,
          selectAllOperatingSystems: true
        }
      },

      name: 'name',
      pacingBudgetValue: 2,
      pricingType: { id: 1, name: 'pt' },
      pricingValue: 90,
      targetWebSegments: null

    }





    const list = [{ id: 1, name: 'n' }];
    service.setStrategiesForBulkEdit(list);


    service.bulkEditOptionSelected = {
      name: StrategyConstants.APPEND,
      schedule: StrategyConstants.APPEND,
      inventory: StrategyConstants.APPEND,
      auction: StrategyConstants.APPEND,
      apps: StrategyConstants.APPEND,
      geo: StrategyConstants.APPEND,
      audience: StrategyConstants.APPEND,
      days: StrategyConstants.APPEND,
      os: StrategyConstants.APPEND,
      deal: StrategyConstants.APPEND,
      budget: StrategyConstants.APPEND,
      creative: StrategyConstants.APPEND
    }



    let expected: BulkEditStrategiesDTO = {
      appAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      appsTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },

      auctionTargeting: {
        action: StrategyConstants.APPEND,
        value: "ALL"

      },
      bidCapMax: {
        action: StrategyConstants.APPEND,
        value: 12

      },
      bidCapMin: {
        action: StrategyConstants.APPEND,
        value: 11

      },
      budgetValue: {
        action: StrategyConstants.APPEND,
        value: 1

      },
      creatives: {
        action: StrategyConstants.APPEND,
        value: null

      },
      daysTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      dealAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      dmpAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      endTime: {
        action: StrategyConstants.APPEND,
        value: 123456

      },
      geoTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      inventoryTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      mobileOSTargeting: {
        action: StrategyConstants.APPEND,
        value: {
          operatingSystems: null,
          selectAllOperatingSystems: true
        }

      },
      name: {
        action: StrategyConstants.APPEND,
        value: 'name'

      },

      pacingBudgetValue: {
        action: StrategyConstants.APPEND,
        value: 2

      },
      pricingType: {
        action: StrategyConstants.APPEND,
        value: { id: 1, name: 'pt' },

      },
      pricingValue: {
        action: StrategyConstants.APPEND,
        value: 90
      },
      webAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },

      strategies: [{ id: 1, name: 'n' }]
    }
    expect(service.convertStrategyDtoToBulkEditRequestDto(strDto)).toEqual(expected);
  });





  it('should test getStrategyTime', () => {
    const service: StrategyBulkEditService = TestBed.get(StrategyBulkEditService);

    let req: BulkEditStrategiesDTO = {
      appAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      appsTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },

      auctionTargeting: {
        action: StrategyConstants.APPEND,
        value: "ALL"

      },
      bidCapMax: {
        action: StrategyConstants.APPEND,
        value: 12

      },
      bidCapMin: {
        action: StrategyConstants.APPEND,
        value: 11

      },
      budgetValue: {
        action: StrategyConstants.APPEND,
        value: 1

      },
      creatives: {
        action: StrategyConstants.APPEND,
        value: null

      },
      daysTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      dealAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      dmpAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      endTime: {
        action: StrategyConstants.APPEND,
        value: 123456

      },
      geoTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      inventoryTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },
      mobileOSTargeting: {
        action: StrategyConstants.APPEND,
        value: {
          operatingSystems: null,
          selectAllOperatingSystems: true
        }

      },
      name: {
        action: StrategyConstants.APPEND,
        value: 'name'

      },

      pacingBudgetValue: {
        action: StrategyConstants.APPEND,
        value: 2

      },
      pricingType: {
        action: StrategyConstants.APPEND,
        value: { id: 1, name: 'pt' },

      },
      pricingValue: {
        action: StrategyConstants.APPEND,
        value: 90
      },
      webAudienceTargeting: {
        action: StrategyConstants.APPEND,
        value: null

      },

      strategies: [{ id: 1, name: 'n' }]
    };

    let strategies = [{ id: 1, name: 'n' }]
    expect(service.convertBulkEditReqToUi(req, strategies).length).toEqual(5);

  });












});
