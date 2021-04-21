import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  MatButtonModule, MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatTooltipModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '@app/app-routing.module';
import { environment } from '@env/environment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiModule, BASE_PATH as API_BASE_PATH } from '@revxui/api-client-ts';
import { ApiModule as AuthModule, BASE_PATH as AUTH_BASE_PATH } from '@revxui/auth-client-ts';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { AuthService, AuthServiceConfig } from 'angularx-social-login';
import { BlockUIModule } from 'ng-block-ui';
import { SharedModule } from './shared/shared.module';
import { GoogleAuthConfig } from './shared/_configs/google-authentication.config';
import { PixelTypePipe } from './shared/_pipes/pixel-type.pipe';
import { SecondsToTimePipe } from './shared/_pipes/seconds-to-time.pipe';
import { HttpinterceptorService } from './shared/_services/httpinterceptor.service';
import { RequestCache } from './shared/_services/request.cache.service';
import { AppComponent } from './startup/_components/app/app.component';
import { AuthenticationComponent } from './startup/_components/authentication/authentication.component';
import { ChangePasswordComponent } from './startup/_components/change-password/change-password.component';
import { PageNotFoundComponent } from './startup/_components/page-not-found/page-not-found.component';
import { ForgotPasswordComponent } from './startup/_directives/forgot-password/forgot-password.component';
import { ThemeDirective } from './startup/_directives/theme/theme.directive';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    ForgotPasswordComponent,
    PageNotFoundComponent,
    ChangePasswordComponent,
    ThemeDirective
  ],
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    BrowserAnimationsModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MDBBootstrapModule.forRoot(),
    AppRoutingModule,
    AuthModule,
    ApiModule,

    // not sure if these have to be here
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    NgbModule,

    MatButtonModule,
    BlockUIModule.forRoot(),

  ],
  entryComponents: [
    ForgotPasswordComponent,
    ChangePasswordComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpinterceptorService, multi: true },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: API_BASE_PATH, useValue: environment.API_BASE_PATH },
    { provide: AUTH_BASE_PATH, useValue: environment.AUTH_BASE_PATH },
    { provide: API_BASE_PATH, useValue: environment.API_BASE_PATH },
    { provide: AuthServiceConfig, useFactory: GoogleAuthConfig },
    AuthService,
    RequestCache,
    PixelTypePipe,
    SecondsToTimePipe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
