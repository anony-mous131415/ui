import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AdvertiserControllerService,
  AdvertiserPojo,
  AdvertiserSettings,
  ApiResponseObjectAdvertiserPojo,
  ApiResponseObjectAdvertiserSettings,
  ApiResponseObjectCatalogFeed,
  ApiResponseObjectClickDestination,
  ApiResponseObjectMapintResponseMessage,
  ApiResponseObjectMaplongResponseMessage,
  ApiResponseObjectPixel,
  ApiResponseObjectTag,
  CatalogControllerService,
  ClickDestination,
  ClickDestinationControllerService,
  Pixel,
  PixelControllerService,
  SearchRequest,
} from '@revxui/api-client-ts';

// import { ApiResponseObjectClickDestinationAutomationUrls } from '@revxui/api-client-ts/model/apiResponseObjectClickDestinationAutomationUrls';
import { Observable, Subject } from 'rxjs';
import { ApiResponseObjectClickDestinationAutomationUrls } from '@revxui/api-client-ts/model/apiResponseObjectClickDestinationAutomationUrls';

export const UPLOAD_CONST = {
  LOGO: 1,
  FALLBACK: 2,
  OVERLAY: 3
};

@Injectable({
  providedIn: 'root'
})
export class AdvertiserService {

  constructor(
    private advControllerService: AdvertiserControllerService,
    private catalogApiService: CatalogControllerService,
    private pixelApiService: PixelControllerService,
    private clickDestinationApiService: ClickDestinationControllerService,
    private http: HttpClient
  ) { }

  private detailsPageSubject = new Subject<boolean>();
  activeLink = 'details';

  public refreshDetails(ref) {
    this.detailsPageSubject.next(ref);
  }

  public refreshDetailsWatcher() {
    return this.detailsPageSubject.asObservable();
  }

  create(advPojo: AdvertiserPojo): Observable<ApiResponseObjectAdvertiserPojo> {
    // return this.http.post('http://localhost:10045/v2/api/advertisers', advPojo, {
    //   headers: { token: 'eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNp0js1Kw0AQx18lzDmUDaml6UkxEQKxSq-uyLqZ0LHpJuxuolLyJh58Pp_C2VTEi5dh-M3_Y07ghmfYgHL7VzKLEc1B-UvVNC0udHeEGJzuenQs2d1VxdNVfltumZLysElWYinSRCRJDPjW_4BlNoMXT2ySQ76-WPHMxXreBc-iyL8-P0KKC8EnCYNDW9aSEzKRxRLU4PedJU_oGD7IP-USHuOzwagj8lX-97wEFjpsUXusK9JoHAYD9-nBWjT6_bqrzxHldjfLlfY0BtSo1iEDCl-lKW-_dTct9QdlfVSamlR0P_qo8iybJpi-AQAA__8.VHn15O4KS311mkoZFJiNDdR1BvF4ytsG3IIjD7iyAM4' }
    // });
    return this.advControllerService.createAdvertiserUsingPOST(advPojo);
  }

  getById(advId: number): Observable<ApiResponseObjectAdvertiserPojo> {
    // return this.http.get('http://localhost:10045/v2/api/advertisers/' + advId, {
    //   headers: { token: 'eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNp0js1Kw0AQx18lzDmUDaml6UkxEQKxSq-uyLqZ0LHpJuxuolLyJh58Pp_C2VTEi5dh-M3_Y07ghmfYgHL7VzKLEc1B-UvVNC0udHeEGJzuenQs2d1VxdNVfltumZLysElWYinSRCRJDPjW_4BlNoMXT2ySQ76-WPHMxXreBc-iyL8-P0KKC8EnCYNDW9aSEzKRxRLU4PedJU_oGD7IP-USHuOzwagj8lX-97wEFjpsUXusK9JoHAYD9-nBWjT6_bqrzxHldjfLlfY0BtSo1iEDCl-lKW-_dTct9QdlfVSamlR0P_qo8iybJpi-AQAA__8.VHn15O4KS311mkoZFJiNDdR1BvF4ytsG3IIjD7iyAM4' }
    // });
    return this.advControllerService.getByIdUsingGET(advId);
  }

  activateAdvs(advIds): Observable<ApiResponseObjectMapintResponseMessage> {
    return this.advControllerService.activateAdvertiserUsingPOST(advIds);
  }

  deactivateAdvs(advIds): Observable<ApiResponseObjectMapintResponseMessage> {
    return this.advControllerService.deactivateAdvertiserUsingPOST(advIds);
  }

  getAdvSettings(advId): Observable<ApiResponseObjectAdvertiserSettings> {
    return this.advControllerService.getAdvertiserSettingsUsingGET(advId);
  }

  updateAdvSettings(advId: number, advSettings: AdvertiserSettings): Observable<ApiResponseObjectAdvertiserSettings> {
    return this.advControllerService.updateSettingsUsingPOST(advId, advSettings);
  }

  updateAdv(advId: number, advertiser: AdvertiserPojo): Observable<ApiResponseObjectAdvertiserPojo> {

    // return this.http.post('http://localhost:10045/v2/api/advertisers/' + advId, advertiser, {
    //   headers: { token: 'eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNp0js1Kw0AQx18lzDmUDaml6UkxEQKxSq-uyLqZ0LHpJuxuolLyJh58Pp_C2VTEi5dh-M3_Y07ghmfYgHL7VzKLEc1B-UvVNC0udHeEGJzuenQs2d1VxdNVfltumZLysElWYinSRCRJDPjW_4BlNoMXT2ySQ76-WPHMxXreBc-iyL8-P0KKC8EnCYNDW9aSEzKRxRLU4PedJU_oGD7IP-USHuOzwagj8lX-97wEFjpsUXusK9JoHAYD9-nBWjT6_bqrzxHldjfLlfY0BtSo1iEDCl-lKW-_dTct9QdlfVSamlR0P_qo8iybJpi-AQAA__8.VHn15O4KS311mkoZFJiNDdR1BvF4ytsG3IIjD7iyAM4' }
    // });

    return this.advControllerService.updateAdvertiserUsingPOST(advertiser, advId);
  }

  getSmartTagUsingGET(advId: number): Observable<ApiResponseObjectTag> {
    return this.advControllerService.getSmartTagUsingGET(advId);
  }

  getCatalogById(catalogId: number): Observable<ApiResponseObjectCatalogFeed> {
    return this.catalogApiService.getByIdUsingGET2(catalogId);
  }

  getCatalogMacros(advId: number) {
    const search = {} as SearchRequest;
    search.filters = [];
    return this.catalogApiService.getMacrosUsingPOST(advId, 1, 1000, false, null, search);
  }

  getPixelById(id: number): Observable<ApiResponseObjectPixel> {
    return this.pixelApiService.getByIdUsingGET4(id);
  }

  getTrackerCode(id: number): Observable<ApiResponseObjectTag> {
    return this.pixelApiService.getTrackingCodeUsingGET(id);
  }

  createPixel(pixel: Pixel): Observable<ApiResponseObjectPixel> {
    return this.pixelApiService.createUsingPOST(pixel);
  }

  updatePixel(id: number, pixel: Pixel): Observable<ApiResponseObjectPixel> {
    return this.pixelApiService.updateUsingPOST(id, pixel);
  }

  activatePixels(ids: string): Observable<ApiResponseObjectMaplongResponseMessage> {
    return this.pixelApiService.activateUsingPOST(ids);
  }

  deactivatePixels(ids: string): Observable<ApiResponseObjectMaplongResponseMessage> {
    return this.pixelApiService.deactivateUsingPOST(ids);
  }

  createClickDestination(clickDestination: ClickDestination): Observable<ApiResponseObjectPixel> {
    return this.clickDestinationApiService.createClickDestinationUsingPOST(clickDestination);
  }

  updateClickDestination(clickDestination: ClickDestination, id: number): Observable<ApiResponseObjectClickDestination> {
    return this.clickDestinationApiService.updateClickDestinationUsingPOST(clickDestination, id);
  }

  getClickDestinationList(advertiserId: number, pageNumber?: number, pageSize?: number,
    refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string): Observable<any> {
    return this.clickDestinationApiService.getAllClickDestinationUsingPOST(advertiserId, pageNumber,
      pageSize, refresh, reqId, search, sort);
  }

  getClickDestination(id: number): Observable<ApiResponseObjectClickDestination> {
    return this.clickDestinationApiService.getClickDestinationByIdUsingGET(id);
  }


  //REVX-401
  getMmpBasedUrls(advertiserId: number): Observable<ApiResponseObjectClickDestinationAutomationUrls> {
    return this.clickDestinationApiService.getMmpParametersUsingGET(advertiserId);
  }

  setActiveLink(entity: string) {
    this.activeLink = entity;
  }

  getActiveLink() {
    return this.activeLink;
  }

}
