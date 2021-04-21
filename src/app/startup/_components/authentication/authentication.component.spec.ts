// import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { ReactiveFormsModule } from '@angular/forms';
// import { AuthServiceConfig, AuthService, SocialLoginModule } from 'angularx-social-login';
// import { GoogleAuthConfig } from '@app/shared/_configs/google-authentication.config';
// import { AuthApiService } from '@revxui/auth-client-ts';
// import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';
// import { RouterModule } from '@angular/router';
// import { NGXLogger } from 'ngx-logger';
// import { APP_BASE_HREF } from '@angular/common';
// import { CSSThemeController_Service } from '@revxui/api-client-ts';
// import { AuthenticationComponent } from './authentication.component';
// import {LoggerTestingModule} from 'ngx-logger/testing';

// describe('AuthenticationComponent', () => {
//   let component: AuthenticationComponent;

//   let fixture: ComponentFixture<AuthenticationComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [ReactiveFormsModule, SocialLoginModule, RouterModule.forRoot([]),],
//       declarations: [AuthenticationComponent],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [
//         {
//           provide: AuthServiceConfig,
//           useFactory: GoogleAuthConfig
//         },
//         { provide: NGXLogger, useClass: class { } },
//         { provide: APP_BASE_HREF, useValue: '/' },
//         AuthApiService,
//         HttpClient,
//         HttpHandler,
//         CSSThemeController_Service,
//         LoggerTestingModule
//       ]
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(AuthenticationComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
