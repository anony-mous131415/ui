import { TestBed } from '@angular/core/testing';
import { CampaignService } from '../campaign.service';
import * as STUB from '@app/shared/StubClasses';
import { CampaignControllerService } from '@revxui/api-client-ts';


describe('CampaignService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: CampaignControllerService, useClass: STUB.CampaignControllerService_stub },
    ],
  }));


  it('should be created', () => {
    const service: CampaignService = TestBed.get(CampaignService);
    expect(service).toBeTruthy();
  });

  //new-test-cases
  it('should test create', () => {
    const service: CampaignService = TestBed.get(CampaignService);

    const calledService = TestBed.get(CampaignControllerService);
    const spy = spyOn(calledService, 'createCampaignUsingPOST');
    service.create(STUB.campaignDto);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test update', () => {
    const service: CampaignService = TestBed.get(CampaignService);
    const calledService = TestBed.get(CampaignControllerService);
    const spy = spyOn(calledService, 'updateCampaignUsingPOST');
    service.updateCmp(STUB.campaignDto.id, STUB.campaignDto);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test getById', () => {
    const service: CampaignService = TestBed.get(CampaignService);
    const calledService = TestBed.get(CampaignControllerService);
    const spy = spyOn(calledService, 'getCampaignByIdUsingGET');
    service.getById(STUB.campaignDto.id);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  it('should test activate and deactivate campaign', () => {
    const service: CampaignService = TestBed.get(CampaignService);

    const calledService = TestBed.get(CampaignControllerService);
    let spy = spyOn(calledService, 'activateCampaignUsingPOST'); service.activateCmps(STUB.campaignDto.id.toString);
    expect(spy).toHaveBeenCalledTimes(1);

    spy = spyOn(calledService, 'deactivateCampaignUsingPOST');
    service.deactivateCmps(STUB.campaignDto.id.toString);
    expect(spy).toHaveBeenCalledTimes(1);
  });


});
