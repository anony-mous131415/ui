import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { environment } from '@env/environment';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import {
  CreativeControllerService,
  CreativeDTO,
  CreativeMockUpsDTO,
  StrategyControllerService,
  BaseModel,
  StrategyCreativeAssociationRequestDTO,
  CreativeThirdPartyAdTag,
  DashboardRequest,
  CreativeFiles,
  CreativeTemplatesControllerService,
  CreativeTemplateVariablesControllerService,
  ApiResponseObjectTemplateThemeDTO,
  ApiResponseObjectListTemplateVariablesDTO,
  CreativeHtmlMockupDTO,
  CreativeTemplateThemesControllerService
} from '@revxui/api-client-ts';
import { ApiResponseObjectApiListResponseCreativeTemplateDTO } from '@revxui/api-client-ts/model/apiResponseObjectApiListResponseCreativeTemplateDTO';


export interface EventFromUploader {
  uploadedList: Array<CreativeFiles>,
  destinationStep: number
}

export interface EventFromPreview {
  uploadedList: Array<CreativeDTO>,
  prevStepId: number
}

@Injectable({
  providedIn: 'root'
})
export class CreativeService {
  SERVER_URL;

  public selectedCD = new ReplaySubject<any>();

  private creativeUIPreviewObj = new Subject<{
    nativeImageList: [],
    nativeVideoList: [],
    nonNativeImageList: [],
    nonNativeVideoList: [],
    nonNativeHTMLList: [],
  }>();

  public setSelectedCD(cd: any) {
    this.selectedCD.next(cd);
  }

  constructor(
    private httpClient: HttpClient,
    private creativeService: CreativeControllerService,
    private strService: StrategyControllerService,
    private creativeTemplateService: CreativeTemplatesControllerService,
    private creativeTemplateVariableControllerService: CreativeTemplateVariablesControllerService,
    private creativeTemplateThemesControllerService: CreativeTemplateThemesControllerService
  ) { }

  creativePreviewObjWatcher(): Observable<any> {
    return this.creativeUIPreviewObj.asObservable();
  }

  creativeUploadResponseWatcher(): Observable<any> {
    return this.creativeUIPreviewObj.asObservable();
  }

  updateCreativePreviewObj(creativeUIPreviewObj: any) {
    this.creativeUIPreviewObj = creativeUIPreviewObj;
  }

  // Api Call
  uploadFiles(formData: FormData): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        enctype: 'multipart/form-data'
      }),
      reportProgress: true
    };

    //   httpOptions.headers =
    // httpOptions.headers.set('Authorization', 'my-new-auth-token');

    this.SERVER_URL = environment.API_BASE_PATH + AppConstants.API_PATH.CREATIVE_FILE_UPLOAD;
    // const formData = new FormData();
    // formData.append('file', file);
    return this.httpClient.post<any>(this.SERVER_URL, formData, httpOptions);
  }

  generateRawCreatives(mockupDTO: CreativeMockUpsDTO) {
    return this.creativeService.createMockupsUsingPOST(mockupDTO);
  }

  saveCreatives(creativeDTOs: Array<CreativeDTO>) {
    return this.creativeService.createCreativeUsingPOST(creativeDTOs);
  }

  updateCreative(creative: CreativeDTO) {
    return this.creativeService.updateCreativeUsingPOST(creative, creative.id);
  }

  getCreative(creativeId: number) {
    return this.creativeService.getCreativeByIdUsingGET(creativeId);
  }

  getAllCreatives(pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: DashboardRequest, sort?: string): Observable<any> {
    return this.creativeService.searchCreativesUsingPOST(search, pageNumber, pageSize, refresh, reqId, sort);
  }

  activateCreatives(ids: string) {
    return this.creativeService.activateCreativeUsingPOST(ids);
  }

  deactivateCreatives(ids: string) {
    return this.creativeService.deactivateCreativeUsingPOST(ids);
  }

  uploadThirdPartyAdTag(adTag: CreativeThirdPartyAdTag) {
    return this.creativeService.getAdTagCreativeUsingPOST(adTag);
  }

  associateStrategies(strategyList?: Array<BaseModel>, creativesList?: Array<BaseModel>) {
    const request: StrategyCreativeAssociationRequestDTO = {};
    request.creativesList = creativesList;
    request.strategyList = strategyList;
    request.replaceExistingCreatives = false;
    return this.strService.associateCreativesWithStrategiesUsingPOST(request);
  }

  getPerfData(creativeId: number, search: DashboardRequest): Observable<any> {
    return this.creativeService.getPerformanceForCreativeByIdUsingPOST(creativeId, search);
  }

  getCreativeTemplates(advId: number, dynamic?: boolean, pageNumber?: number, pageSize?: number, reqId?: string, slots?: number){
    return this.creativeTemplateService.getCreativeTemplatesUsingGET(advId, dynamic, pageNumber, pageSize, undefined, slots);
  }

  getCreativeTemplateVariables(): Observable<ApiResponseObjectListTemplateVariablesDTO> { 
    return this.creativeTemplateVariableControllerService.getTemplateVariablesUsingGET();
  }

  saveProductImages(mockupDTO: CreativeMockUpsDTO) {
    return this.creativeTemplateService.saveProductImagesUsingPOST(mockupDTO);
  }

  createHtmlMockupsUsingPOST(mockupDto: CreativeHtmlMockupDTO) {
    return this.creativeService.createHtmlMockupsUsingPOST(mockupDto);
  }

  getTemplateThemesUsingGET(advId) {
    return this.creativeTemplateThemesControllerService.getTemplateThemesUsingGET(advId);
  }

  updateTemplateTheme(id,themeDto) {
    return this.creativeTemplateThemesControllerService.updateTemplateThemeUsingPOST(id,themeDto);
  }

  saveTemplateTheme(themeDto) {
    return this.creativeTemplateThemesControllerService.createTemplateThemeUsingPOST(themeDto);
  }

  getTemplatesMetadata(dynamic?:boolean, active?: boolean) {
    return this.creativeTemplateService.getTemplatesMetadataUsingGET(active,dynamic);
  }
}
