import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { environment } from '@env/environment';
import { ApiResponseObjectWhitelabelingEntity, WhitelabelingEntity } from '@revxui/api-client-ts';
import { ThemeService } from '../theme.service';


describe('ThemeService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: APP_BASE_HREF, useValue: '/' },
      HttpClient,
      HttpHandler
    ]
  }));

  // it('should be created', () => {
  //   const service: ThemeService = TestBed.get(ThemeService);
  //   expect(service).toBeTruthy();
  // });

  // it('should set current theme', () => {
  //   const service: ThemeService = TestBed.get(ThemeService);
  //   const response = {} as ApiResponseObjectWhitelabelingEntity;
  //   const wlEntities = {} as WhitelabelingEntity;

  //   wlEntities.id = 1;
  //   wlEntities.logoSm = environment.theme.LOGO_SM_URL;
  //   wlEntities.logoLg = environment.theme.LOGO_LG_URL;
  //   response.respObject = wlEntities;
  //   service.setCurrentTheme(response);

  //   let licenseeName = localStorage.getItem(AppConstants.CACHED_THEME_SETTINGS);

  //   expect(licenseeName).toBeTruthy();
  // });
});
