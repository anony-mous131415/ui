import { Injectable } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import {
  ApiResponseObjectAudienceAccessDTO,
  ApiResponseObjectAudienceDTO,
  ApiResponseObjectBaseModel,
  ApiResponseObjectDmpAudienceDTO,
  ApiResponseObjectMapintResponseMessage,
  ApiResponseObjectMetaRulesDto,
  AudienceControllerService,
  AudienceDTO,
  PixelRemoteConfigDTO,
  RuleComponentDTO,
  RuleDTO
} from '@revxui/api-client-ts';
import { Observable, of, ReplaySubject } from 'rxjs';
import { AudienceConstants } from '../_constants/AudienceConstants';

export interface CustomRuleElement {
  filterId: number;
  filterDisp: string;
  shortDisp: string;
  operatorId: number;
  operatorDisp: string;
  value: string;
  valueDisp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudienceService {

  ruleMList: any[] = [];

  public responseCache = new Map();

  private dmpAccess = new ReplaySubject<boolean>(1);

  public dmpForAdvLevelAccess = new ReplaySubject<boolean>(1);


  public accessRefresh(ref) {
    this.dmpAccess.next(ref);
  }
  public accessWatcher() {
    return this.dmpAccess.asObservable();
  }

  constructor(
    private audController: AudienceControllerService
  ) { }

  /**
   * 
   * @param advId 
   * api call to check if advertiser has DMP access
   */
  getAccess(advId: number): Observable<ApiResponseObjectAudienceAccessDTO> {
    return this.audController.getAccessUsingGET(advId)
  }

  /**
   * 
   * @param audId 
   * api call to get audience by id
   */
  getAudienceById(audId: number): Observable<ApiResponseObjectAudienceDTO> {
    return this.audController.getByIdUsingGET1(audId);
  }

  createAudience(audienceDto: AudienceDTO): Observable<ApiResponseObjectAudienceDTO> {
    return this.audController.createAudienceUsingPOST(audienceDto);
  }

  updateAudience(audienceDto: AudienceDTO, audId: number): Observable<ApiResponseObjectAudienceDTO> {
    return this.audController.updateAudienceUsingPOST(audienceDto, audId);
  }

  activateAudience(audId: number): Observable<ApiResponseObjectMapintResponseMessage> {
    return this.audController.activateAudienceUsingPOST(audId.toString());
  }

  deactivateAudience(audId: number): Observable<ApiResponseObjectMapintResponseMessage> {
    return this.audController.deactivateAudienceUsingPOST(audId.toString());
  }

  checkRemoteFile(remoteDetails: PixelRemoteConfigDTO): Observable<ApiResponseObjectBaseModel> {
    return this.audController.checkConnectionUsingPOST(remoteDetails);
  }

  /**
   * 
   * @param audId sync audience form details page
   */
  syncOnDetailsPage(audId: number): Observable<ApiResponseObjectBaseModel> {
    return this.audController.syncRemoteAudienceUsingGET(audId);
  }


  /**
   * get the rules form api/cache 
   */
  getRules(): Observable<ApiResponseObjectMetaRulesDto> {
    const rulesFromCache = this.responseCache.get(URL);
    if (rulesFromCache) {
      // console.log('CACHE_RULES');
      return of(rulesFromCache);
    }
    const response = this.audController.getMetaRulesUsingGET();
    response.subscribe(resp => this.responseCache.set(URL, resp));
    // console.log('API_RULES');
    return response;
  }

  // getRules() {
  //   return AudienceConstants.RULES;
  // }

  /**
   * 
   * @param advId 
   * api call to get DMP audiences
   */
  getAllDmpAudience(advId: number): Observable<ApiResponseObjectDmpAudienceDTO> {
    return this.audController.getAllDmpAudienceUsingGET(advId);
  }


  /**
   * 
   * @param rDto 
   * form the rule object array using the ruleDTO
   */
  ruleDtoToReqRules(rDto: RuleDTO) {
    // console.log(rDto);
    let output: any[] = [];
    rDto.ruleExpressionList.forEach(rule => {
      let outputRule: any[] = [];
      rule.ruleExpressionList.forEach(element => {

        let outputRuleElement = Object.create({});
        outputRuleElement.filter = element.ruleElement.filterId;
        outputRuleElement.operator = element.ruleElement.operatorId;
        outputRuleElement.val = element.ruleElement.value;

        outputRule.push(outputRuleElement);

      })
      output.push(outputRule);
    });
    // console.log(output);
    return output;
  }

  /**
   * 
   * @param allAssignerRules 
   * @param rmList 
   * this method take ALL RULES returns rules to be displayed on ui
   */
  getDispRules(allAssignerRules: any[], rmList?: any): any {
    let md = rmList;
    let dispRules: any[] = [];
    allAssignerRules.forEach(rule => {
      let innerArr: any[] = [];
      rule.forEach(element => {
        let dispElement = {} as CustomRuleElement;
        dispElement.filterId = element.filter
        dispElement.filterDisp = md[dispElement.filterId - 1].displayName;
        dispElement.shortDisp = md[dispElement.filterId - 1].fbxName;

        let ruleMD = md[dispElement.filterId - 1];

        dispElement.operatorId = element.operator;

        //index = -1 needs to be checked
        const index = ruleMD.ruleOperators.findIndex(x => x.id === dispElement.operatorId)
        dispElement.operatorDisp = (index > -1) ? ruleMD.ruleOperators[index].displayName : '';
        dispElement.value = element.val;

        if (ruleMD.ruleValues.length > 0) {
          //index = -1 needs to be checked
          const idx = ruleMD.ruleValues.findIndex(x => x.value.toLowerCase() === dispElement.value.toLowerCase());
          dispElement.valueDisp = (idx > -1) ? ruleMD.ruleValues[idx].displayValue + '(' + dispElement.value + ')' : '';
        }
        else {
          dispElement.valueDisp = element.val
        }
        innerArr.push(dispElement);
      })
      dispRules.push(innerArr);
    })
    // console.log(dispRules)
    return (dispRules);
  }

  //below 3 methods convert : required rule Format -> dto.ruleExpression
  getFinalRuleExp(allAssignerRules): RuleDTO {
    let finalRuleDto = {} as RuleDTO;
    finalRuleDto.negate = false;
    finalRuleDto.operator = 'OR';
    finalRuleDto.simpleExpr = false;

    let finalExpList: any[] = [];
    allAssignerRules.forEach(element => {
      finalExpList.push(this.getRuleDtoForOneRule(element));
    });
    finalRuleDto.ruleExpressionList = finalExpList;
    return finalRuleDto;
  }


  getRuleDtoForOneRule(rcvRule) {
    let ruleDto = {} as RuleDTO;
    ruleDto.negate = false;
    ruleDto.operator = 'AND';
    ruleDto.simpleExpr = false;
    let arr: any[] = [];

    rcvRule.forEach(element => {
      // console.log(element);
      arr.push(this.getSimpleRule(element));
    });

    ruleDto.ruleExpressionList = arr;
    return ruleDto;
  }

  getSimpleRule(simpleRule) {
    let simpleDto = {} as RuleDTO;
    simpleDto.negate = false;
    simpleDto.simpleExpr = true;

    let element = {} as RuleComponentDTO;
    element.filterId = simpleRule.filter;
    element.operatorId = simpleRule.operator;
    element.value = simpleRule.val;

    simpleDto.ruleElement = element;
    return simpleDto;
  }


  /**
   * 
   * @param entity for different type of audience , get the API table name and value
   */
  getApiValue(entity): any {
    switch (entity) {
      case AudienceConstants.TYPE.APP:
        return { tableName: AppConstants.ENTITY.AUDIENCE, apiValue: AudienceConstants.TYPE_API_VAL.APP };
      case AudienceConstants.TYPE.WEB:
        return { tableName: AppConstants.ENTITY.AUDIENCE, apiValue: AudienceConstants.TYPE_API_VAL.WEB };
      case AudienceConstants.TYPE.DMP:
        return { tableName: AppConstants.ENTITY.DMP_AUDIENCE, apiValue: AudienceConstants.TYPE_API_VAL.DMP };
    }
  }

}
