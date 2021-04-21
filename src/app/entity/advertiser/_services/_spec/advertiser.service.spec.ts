import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { AdvertiserControllerService, CatalogControllerService, ClickDestinationControllerService, DashboardControllerService, PixelControllerService } from '@revxui/api-client-ts';
import { SocialLoginModule } from 'angularx-social-login';
import { AdvertiserService } from '../advertiser.service';


describe('AdvertiserService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      SocialLoginModule,
      RouterModule.forRoot([]),
      RouterTestingModule,
      HttpClientTestingModule,
    ],

    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
      { provide: AdvertiserControllerService, useClass: STUB.AdvertiserControllerService_stub },
      { provide: PixelControllerService, useClass: STUB.PixelControllerService_stub },
      { provide: CatalogControllerService, useClass: STUB.CatalogControllerService_stub },
      { provide: ClickDestinationControllerService, useClass: STUB.ClickDestinationControllerService_stub },
    ],
  }));

  it('should be created', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    expect(service).toBeTruthy();
  });

  //new-test-cases
  it('should test create()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'createAdvertiserUsingPOST');
    service.create(STUB.advDto);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test getById()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'getByIdUsingGET');
    service.getById(6804);
    expect(spy).toHaveBeenCalledTimes(1);
  });



  it('should test activateAdvs()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'activateAdvertiserUsingPOST');
    service.activateAdvs('6804,7919');
    expect(spy).toHaveBeenCalledTimes(1);
  });



  it('should test deactivateAdvs()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'deactivateAdvertiserUsingPOST');
    service.deactivateAdvs('6804,7919');
    expect(spy).toHaveBeenCalledTimes(1);
  });



  it('should test getAdvSettings()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'getAdvertiserSettingsUsingGET');
    service.getAdvSettings(6804);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test updateAdvSettings()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'updateSettingsUsingPOST');
    service.updateAdvSettings(6804, {});
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test updateAdv()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'updateAdvertiserUsingPOST');
    service.updateAdv(6804, STUB.advDto);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test getSmartTagUsingGET()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(AdvertiserControllerService);
    const spy = spyOn(calledService, 'getSmartTagUsingGET');
    service.getSmartTagUsingGET(6804);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test getCatalogById()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(CatalogControllerService);

    const spy = spyOn(calledService, 'getByIdUsingGET2');
    service.getCatalogById(6804);
    expect(spy).toHaveBeenCalledTimes(1);
  });



  it('should test getCatalogMacros()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(CatalogControllerService);
    const spy = spyOn(calledService, 'getMacrosUsingPOST');
    service.getCatalogMacros(6804);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getPixelById()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'getByIdUsingGET4');
    service.getPixelById(6804);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test getTrackerCode()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'getTrackingCodeUsingGET');
    service.getTrackerCode(6804);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test createPixel()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'createUsingPOST');
    service.createPixel(STUB.pixelDto);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test updatePixel()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'updateUsingPOST');
    service.updatePixel(STUB.pixelDto.id, STUB.pixelDto);
    expect(spy).toHaveBeenCalledTimes(1);
  });




  it('should test activatePixels()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'activateUsingPOST');
    service.activatePixels('1234,5678');
    expect(spy).toHaveBeenCalledTimes(1);
  });



  it('should test deactivatePixels()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(PixelControllerService);
    const spy = spyOn(calledService, 'deactivateUsingPOST');
    service.deactivatePixels('1234,5678');
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test createClickDestination()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(ClickDestinationControllerService);
    const spy = spyOn(calledService, 'createClickDestinationUsingPOST');
    service.createClickDestination(STUB.clickDestDto);
    expect(spy).toHaveBeenCalledTimes(1);
  });



  it('should test updateClickDestination()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(ClickDestinationControllerService);
    const spy = spyOn(calledService, 'updateClickDestinationUsingPOST');
    service.updateClickDestination(STUB.clickDestDto, STUB.clickDestDto.id);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getClickDestinationList()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(ClickDestinationControllerService);
    const spy = spyOn(calledService, 'getAllClickDestinationUsingPOST');
    service.getClickDestinationList(STUB.advDto.id, 1, 10);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getClickDestination()', () => {
    const service: AdvertiserService = TestBed.get(AdvertiserService);
    const calledService = TestBed.get(ClickDestinationControllerService);
    const spy = spyOn(calledService, 'getClickDestinationByIdUsingGET');
    service.getClickDestination(STUB.advDto.id);
    expect(spy).toHaveBeenCalledTimes(1);
  });







});
