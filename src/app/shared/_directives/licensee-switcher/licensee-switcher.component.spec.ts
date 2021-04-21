import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseeSwitcherComponent } from './licensee-switcher.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material';
import { AuthServiceConfig, SocialLoginModule } from 'angularx-social-login';
import { GoogleAuthConfig } from '@app/shared/_configs/google-authentication.config';
import { AuthApiService } from '@revxui/auth-client-ts';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CSSThemeController_Service } from '@revxui/api-client-ts';
import { APP_BASE_HREF } from '@angular/common';

describe('LicenseeSwitcherComponent', () => {
  let component: LicenseeSwitcherComponent;
  let fixture: ComponentFixture<LicenseeSwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTableModule, SocialLoginModule, RouterModule.forRoot([])],
      declarations: [LicenseeSwitcherComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: AuthServiceConfig,
          useFactory: GoogleAuthConfig
        },
        { provide: APP_BASE_HREF, useValue: '/' },
        AuthApiService,
        HttpClient,
        HttpHandler,
        CSSThemeController_Service
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseeSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
