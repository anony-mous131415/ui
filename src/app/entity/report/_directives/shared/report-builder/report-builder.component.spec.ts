import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxChange, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '@app/app.module';
import { ReportBuilderComponent } from '@app/entity/report/_directives/shared/report-builder/report-builder.component';
import { SharedModule } from '@app/shared/shared.module';
import * as STUB from '@app/shared/StubClasses';
import { GoogleAuthConfig } from '@app/shared/_configs/google-authentication.config';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { AuthApiService } from '@revxui/auth-client-ts';
import { AuthService, AuthServiceConfig } from 'angularx-social-login';
import { BlockUIModule } from 'ng-block-ui';
import { ReportBuilderDatePickerComponent } from '@app/entity/report/_directives/shared/report-builder-date-picker/report-builder-date-picker.component';
import { AdconDatePickerComponent } from '@app/entity/report/_directives/shared/adcon-date-picker/adcon-date-picker.component';
import { OptParams, ReportBuilderService } from '@app/entity/report/_services/report-builder.service';
import { of } from 'rxjs';

describe('ReportBuilderComponent', () => {
  let component: ReportBuilderComponent;
  let fixture: ComponentFixture<ReportBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportBuilderComponent, ReportBuilderDatePickerComponent, AdconDatePickerComponent],
      imports: [BlockUIModule.forRoot(), RouterTestingModule,HttpClientTestingModule,
        AppModule,
        SharedModule,
        BrowserDynamicTestingModule,],
      providers: [AuthApiService, { provide: MAT_DIALOG_DATA, useValue: {} },
        AuthService, { provide: AuthServiceConfig, useFactory: GoogleAuthConfig }, 
        { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },{ provide: MatDialogRef, useValue: { close: (dialogResult: any) => { } } },
        { provide: APP_BASE_HREF, useValue: '/' }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test ngOnInit', () => {
    const spy = spyOn(component,'subscribeToEvents');
    const spy1 = spyOn(component,'initReport');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy1).toHaveBeenCalledTimes(1);
  });

  it('should test onCheckboxChange', () => {
    component.reportElementValueMap[1] = ['adv'];
    const spy = spyOn(TestBed.get(ReportBuilderService),'actionChanged');
    const event = new MatCheckboxChange();
    event.checked = true;
    component.onCheckboxChange(event, {id: 1}, {id: 1});
    expect(spy).toHaveBeenCalledTimes(1);
    event.checked = false;
    component.onCheckboxChange(event, { id: 1}, {id:1 });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should test onActionButtonClick', () => {
    const spy = spyOn(TestBed.get(ReportBuilderService),'actionChanged');
    component.onActionButtonClick('test');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test onActionCheckboxChange', () => {
    const spy = spyOn(TestBed.get(ReportBuilderService),'actionChanged');
    component.onActionCheckboxChange(null,'test');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test openEntitySelectorModal', () => {
    const spy = spyOn(component.dialog,'open').and.returnValue({afterClosed: () => of(true)} as MatDialogRef<typeof component>);
    spyOn(TestBed.get(ReportBuilderService),'getEntitySelectorResult');
    component.openEntitySelectorModal({id: 'advertiser'});
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test initReport', () => {

  });

  it('should test openViewModal', () => {
    const spy = spyOn(component.dialog,'open');
    component.openViewModal({id: 'test', entities: ['adv','cmp']});
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test resetSelection', () => {
    const spy = spyOn(TestBed.get(ReportBuilderService),'setEntitySelectorResult');
    component.resetSelection({id: 'test'});
    expect(spy).toHaveBeenCalledTimes(1);
  });

});
