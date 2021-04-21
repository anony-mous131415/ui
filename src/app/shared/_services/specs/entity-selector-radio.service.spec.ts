import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { PixelTypePipe } from '@app/shared/_pipes/pixel-type.pipe';
import { SecondsToTimePipe } from '@app/shared/_pipes/seconds-to-time.pipe';
import { CommonService } from '../common.service';
import { EntitySelectorRadioService } from '../entity-selector-radio.service';

const elementPassed: any = {
  id: 1,
  name: 'n1',
  active: 'true',
  type: {
    id: 1,
    name: 'type-name'
  }
};

describe('EntitySelectorRadioService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterModule.forRoot([]),
      RouterTestingModule,
      HttpClientTestingModule,
      MatDialogModule,
    ],

    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      { provide: CommonService, useClass: STUB.CommonService_stub },
      { provide: PixelTypePipe, useClass: STUB.PixelTypePipe_stub },
      { provide: SecondsToTimePipe, useClass: STUB.SecondsToTimePipe_stub },
    ],
  }));




  it('should be created', () => {
    const service: EntitySelectorRadioService = TestBed.get(EntitySelectorRadioService);
    expect(service).toBeTruthy();
  });


  //new-test-cases
  it('should be getMetricsForList', () => {
    const service: EntitySelectorRadioService = TestBed.get(EntitySelectorRadioService);
    expect(service.getMetricsForList(AppConstants.ENTITY.PIXEL).length).toEqual(6);
    expect(service.getMetricsForList(AppConstants.ENTITY.CAMPAIGN).length).toEqual(6);
    expect(service.getMetricsForList(AppConstants.ENTITY.ADVERTISER).length).toEqual(3);
  });



  it('should be anonymous methods in getPixelMetrics', () => {
    const service: EntitySelectorRadioService = TestBed.get(EntitySelectorRadioService);
    const pixelMetrics = service.getPixelMetrics();

    //selected
    let result = pixelMetrics[0].cell(elementPassed);
    expect(result).toEqual('');

    //active
    result = pixelMetrics[1].cell(elementPassed);
    expect(result).toEqual('true');

    //name
    result = pixelMetrics[2].cell(elementPassed);
    expect(result).toEqual(elementPassed.name);

    //clickValidityWindow 1
    let customElement = {
      clickValidityWindow: -1,
      userFcap: -1,
      fcapDuration: 0
    }
    result = pixelMetrics[3].cell(customElement);
    expect(result).toEqual('No Limit');

    //clickValidityWindow 2
    customElement.clickValidityWindow = 0;
    result = pixelMetrics[3].cell(customElement);
    expect(result).toEqual('0 Day');

    //clickValidityWindow 3
    customElement.clickValidityWindow = 10;
    result = pixelMetrics[3].cell(customElement);
    expect(result).toEqual('1 day');

    //userFcap 1
    result = pixelMetrics[4].cell(customElement);
    expect(result).toEqual('No Limit');

    //userFcap 2
    customElement.userFcap = 12;
    result = pixelMetrics[4].cell(customElement);
    expect(result).toEqual('12 every 0 day');

    //userFcap 3
    customElement.userFcap = 12;
    customElement.fcapDuration = 14
    result = pixelMetrics[4].cell(customElement);
    expect(result).toEqual('12 every 1 day');


    //userFcap 3
    result = pixelMetrics[5].cell(elementPassed);
    expect(result).toEqual(elementPassed.type.name);
  });



  it('should be anonymous methods in getCampaignMetrics', () => {
    const service: EntitySelectorRadioService = TestBed.get(EntitySelectorRadioService);
    const cmpMetrics = service.getCampaignMetrics();

    //selected
    let result = cmpMetrics[0].cell(elementPassed);
    expect(result).toEqual('');

    //active
    result = cmpMetrics[1].cell(elementPassed);
    expect(result).toEqual('true');

    //name
    result = cmpMetrics[2].cell(elementPassed);
    expect(result).toEqual(elementPassed.name);

    //budget 1
    let elementCustom = {
      lifetimeBudget: null,
      currencyCode: '$',
      startTime: 10,
      endTime: CampaignConstants.NEVER_ENDING_EPOCH
    }
    result = cmpMetrics[5].cell(elementCustom);
    expect(result).toEqual('Unlimited');

    //budget 2
    elementCustom.lifetimeBudget = 123
    result = cmpMetrics[5].cell(elementCustom);
    expect(result).toEqual('123$');

    //start
    result = cmpMetrics[3].cell(elementCustom);
    expect(result).toEqual('10');

    //end 1
    result = cmpMetrics[4].cell(elementCustom);
    expect(result).toEqual('Never Ending');

    //end 2
    elementCustom.endTime = 23
    result = cmpMetrics[4].cell(elementCustom);
    expect(result).toEqual('23');
  });



  it('should be anonymous methods in getAdvertiserMetrics', () => {
    const service: EntitySelectorRadioService = TestBed.get(EntitySelectorRadioService);
    const advMetrics = service.getAdvertiserMetrics();

    //selected
    let result = advMetrics[0].cell(elementPassed);
    expect(result).toEqual('');

    //active
    result = advMetrics[1].cell(elementPassed);
    expect(result).toEqual('true');

    //name
    result = advMetrics[2].cell(elementPassed);
    expect(result).toEqual(elementPassed.name);
  });


});
