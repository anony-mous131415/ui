import { Injectable } from '@angular/core';
import { CampaignControllerService, CampaignDTO } from '@revxui/api-client-ts';
import { ApiResponseObjectCampaignDTO } from '@revxui/api-client-ts/model/apiResponseObjectCampaignDTO';
import { ApiResponseObjectMapintResponseMessage } from '@revxui/api-client-ts/model/apiResponseObjectMapintResponseMessage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {


  constructor(
    private cmpControllerService: CampaignControllerService
  ) { }

  /**
   * 
   * @param cmpDTO 
   * api call for creating new campaign
   */
  create(cmpDTO: CampaignDTO): Observable<ApiResponseObjectCampaignDTO> {
    return this.cmpControllerService.createCampaignUsingPOST(cmpDTO);
  }

  /**
   * 
   * @param cmpId 
   * get details of a campaign using the id
   */
  getById(cmpId: number): Observable<ApiResponseObjectCampaignDTO> {
    return this.cmpControllerService.getCampaignByIdUsingGET(cmpId);
  }

  /**
   * 
   * @param cmpIds comma seperated string of ids
   * activate the campaign whose ids in input string
   * 
   */
  activateCmps(cmpIds): Observable<ApiResponseObjectMapintResponseMessage> {
    return this.cmpControllerService.activateCampaignUsingPOST(cmpIds);
  }



  /**
   * 
   * @param cmpIds comma seperated string of ids
   * activate the campaign whose ids in input string
   */
  deactivateCmps(cmpIds): Observable<ApiResponseObjectMapintResponseMessage> {
    return this.cmpControllerService.deactivateCampaignUsingPOST(cmpIds);
  }

  /**
   * 
   * @param cmpId campaing id which is to be updatd
   * @param campaign 
   * update 1 campaign only
   */
    updateCmp(cmpId: number, campaign: CampaignDTO): Observable<ApiResponseObjectCampaignDTO> {
    return this.cmpControllerService.updateCampaignUsingPOST(campaign, cmpId);
  }


}
