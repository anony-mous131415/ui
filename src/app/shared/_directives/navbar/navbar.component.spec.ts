// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { NavbarComponent } from './navbar.component';
// import { RouterModule } from '@angular/router';
// import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { AuthApiService } from '@revxui/auth-client-ts';
// import { HttpClient, HttpHandler } from '@angular/common/http';
// import { NGXLogger } from 'ngx-logger';
// import { CSSThemeController_Service } from '@revxui/api-client-ts';
// import { APP_BASE_HREF } from '@angular/common';
// import { GoogleAuthConfig } from '@app/shared/_configs/google-authentication.config';

// describe('NavbarComponent', () => {
//   let component: NavbarComponent;
//   let fixture: ComponentFixture<NavbarComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [NavbarComponent],
//       imports: [SocialLoginModule, RouterModule.forRoot([]),],
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
//         CSSThemeController_Service
//       ]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(NavbarComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
