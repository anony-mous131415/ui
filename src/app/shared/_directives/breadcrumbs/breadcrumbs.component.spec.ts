// import { HttpHandler } from '@angular/common/http';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatListModule } from '@angular/material';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { RouterModule } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { GoogleAuthConfig } from '@app/shared/_configs/google-authentication.config';
// import { AuthApiService } from '@revxui/auth-client-ts';
// import { AuthService, AuthServiceConfig } from 'angularx-social-login';
// import { HttpClient } from 'selenium-webdriver/http';
// import { BreadcrumbsComponent } from './breadcrumbs.component';
// describe('BreadcrumbsComponent', () => {
//   let component: BreadcrumbsComponent;
//   let fixture: ComponentFixture<BreadcrumbsComponent>;

//   beforeEach(async()=>{
//     TestBed.configureTestingModule({
//         declarations:[BreadcrumbsComponent],
//         imports:[MatListModule,BrowserAnimationsModule,RouterModule.forRoot([]), RouterTestingModule],
//         schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
//         providers:[AuthService,      {
//           provide: AuthServiceConfig,
//           useFactory: GoogleAuthConfig
//         },AuthApiService,HttpClient,HttpHandler]
//     }).compileComponents();
//   });
//   beforeEach(() => {
//     // fixture = TestBed.createComponent(BreadcrumbsComponent);
//     component = fixture.componentInstance;
//     // fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
