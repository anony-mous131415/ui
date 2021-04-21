import { Injectable } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ApiResponseObjectWhitelabelingEntity, CSSThemeController_Service } from '@revxui/api-client-ts';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private subject = new Subject<any>();

  constructor(
    private whiteLabelService: CSSThemeController_Service,
  ) { }

  // Called from navbar
  watchTheme(): Observable<any> {
    return this.subject.asObservable();
  }

  populateThemeSettings(licenseeId: number, subDomain: string) {
    const promise = new Promise((resolve, reject) => {
      if (licenseeId) {
        return this.whiteLabelService.themeByLicenseeIdUsingGET(licenseeId, null, null).subscribe(
          response => {
            this.setCurrentTheme(response);
            resolve(true);
          }, () => {
            reject();
          }
        );
      } else {
        return this.whiteLabelService.themeBySubDomainUsingGET(subDomain, null, null).subscribe(
          response => {
            this.setCurrentTheme(response);
            resolve(true);
          }, () => {
            reject();
          }
        );
      }
    });
    return promise;
  }


  setCurrentTheme(response: ApiResponseObjectWhitelabelingEntity) {
    localStorage.setItem(AppConstants.CACHED_THEME_SETTINGS, JSON.stringify(response.respObject));
    this.subject.next(response.respObject);
  }

  getThemeBySubdomain(subDomain: string): Observable<ApiResponseObjectWhitelabelingEntity> {
    return this.whiteLabelService.themeBySubDomainUsingGET(subDomain, null, null);
  }

  getThemeByLicenseeId(licenseeId: number): Observable<ApiResponseObjectWhitelabelingEntity> {
    return this.whiteLabelService.themeByLicenseeIdUsingGET(licenseeId, null, null);
  }

}
