import { APP_BASE_HREF } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatCheckboxModule, MatDialogRef, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule, MAT_DIALOG_DATA } from '@angular/material';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { BlockUIModule } from 'ng-block-ui';
import * as STUB from '@app/shared/StubClasses';
import { VideoReportComponent } from './video-report.component';
import { GoogleAuthConfig } from '@app/shared/_configs/google-authentication.config';
import { AuthService, AuthServiceConfig } from 'angularx-social-login';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthApiService } from '@revxui/auth-client-ts';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { AppModule } from '@app/app.module';
import { SharedModule } from '@app/shared/shared.module';
import { ReportBuilderComponent } from '@app/entity/report/_directives/shared/report-builder/report-builder.component';
import { AdconDatePickerComponent } from '@app/entity/report/_directives/shared/adcon-date-picker/adcon-date-picker.component';
import { ReportBuilderDatePickerComponent } from '@app/entity/report/_directives/shared/report-builder-date-picker/report-builder-date-picker.component';
import { ReportBuilderService } from '../../_services/report-builder.service';
import { of } from 'rxjs';
describe('VideoReportComponent', () => {
  let component: VideoReportComponent;
  let fixture: ComponentFixture<VideoReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VideoReportComponent, ReportBuilderComponent, ReportBuilderDatePickerComponent, AdconDatePickerComponent],
      imports: [BlockUIModule.forRoot(), RouterTestingModule,HttpClientTestingModule,
        AppModule,
        SharedModule,
        BrowserDynamicTestingModule,
        FormsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        MatSelectModule,
        MatProgressBarModule,
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule],
      providers: [AuthApiService, { provide: MAT_DIALOG_DATA, useValue: {} },
        AuthService, { provide: AuthServiceConfig, useFactory: GoogleAuthConfig }, 
        { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },{ provide: MatDialogRef, useValue: { close: (dialogResult: any) => { } } },
        { provide: APP_BASE_HREF, useValue: '/' }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoReportComponent);
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
    const spy = spyOn(TestBed.get(ReportBuilderService),'getConfig').and.returnValue(of({respObject: "{}"}));
    const spy1 = spyOn(component,'subscribeToEvents');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy1).toHaveBeenCalledTimes(1);
  });

  it('should test handleOptions', () => {
    const spy = spyOn(TestBed.get(ReportBuilderService),'setOptions');
    component.handleOptions({id: 'metric_list'});
    expect(spy).toHaveBeenCalledTimes(1);
    component.handleOptions({id: 'group_by_list'});
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should test handleActionChange', () => {
    spyOn(component,'buildRequestObject');
    const spy = spyOn(component,'checkIfRequestValid');
    component.handleActionChange('test');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test onClickRunReport', () => {
    spyOn(TestBed.get(ReportBuilderService),'show').and.returnValue(of({ respObject: {}}));
    const spy = spyOn(component.modalService,'open');
    spyOn(component,'buildRequestObject');
    spyOn(component,'checkIfRequestValid');
    component.onClickRunReport();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test buildRequestObject', () => {
    component.configJson = [{}, { children : { options: [ { items: [ {id: 'adv_cmp_str_selection', type: 'ENTITY_SELECTOR', entities: ['ADVERTISER','CAMPAIGN','STRATEGY']}]}, 
      { items: [ { id: 'geo_selection', type: 'ENTITY_SELECTOR', entities: ['AGGREGATOR']}]}]}}];
    let input = new Map<string, any> ();
    input["date_range"] ={
      "start_timestamp": 1616716800,
      "end_timestamp": null,
      "interval": "none"
    };
    input["interval"] = ["1"];
    input["adv_cmp_str_selection"] ={
      "l1_object": { map: new Map<number, boolean>(), set: new Set<any>() },
      "l2_object": { map: new Map<number, boolean>(), set: new Set<any>() },
      "l3_object": { map: new Map<number, boolean>(), set: new Set<any>() }
    };
    input["fold_position"] = [
        1,
        2,
        3,
        4
      ];
    input["geo_selection"] = {
        "l1_object": { map: new Map<number, boolean>(), set: new Set<any>() },
        "l2_object": { map: new Map<number, boolean>(), set: new Set<any>() },
        "l3_object": { map: new Map<number, boolean>(), set: new Set<any>() }
      };
    input["metric_list"] = [
        "impressions"
      ];
    input["group_by_list"] = [
        "advertiser"
      ];
    const result = component.buildRequestObject(input);
    expect(result).toEqual({
      "columns": [
        "impressions"
      ],
      "interval": "none",
      "duration": {
        "start_timestamp": 1616716800,
        "end_timestamp": null
      },
      "page_number": 1,
      "page_size": 50,
      "sort_by": [],
      "group_by": [
        "advertiser"
      ],
      "filters": []
    });
  });

  it('should test checkIfRequestValid', () => {
    let spy = spyOn(TestBed.get(ReportBuilderService),'getRequestObject').and.returnValue(of({}));
    component.configJson = [ {}, {}, {}, {}];
    component.checkIfRequestValid();
    expect(component.configJson[2].errorMsg).toEqual(`Select atleast one \'Metric\' to run the report.`);
    spy.and.returnValue(of({columns: null}));
    component.checkIfRequestValid();
    expect(component.configJson[2].errorMsg).toEqual(`Select atleast one \'Metric\' to run the report.`);
    spy.and.returnValue(of({columns: [], group_by: ['a','b','c','d','e','f','g','h','j']}));
    component.checkIfRequestValid();
    expect(component.configJson[2].errorMsg).toEqual(`Select atleast one \'Metric\' to run the report.`);
    expect(component.configJson[3].errorMsg).toEqual(`More than 7 \'Group By\' options selected.`);
    spy.and.returnValue(of({columns: 'string', group_by: ['a','b','c','d','e']}));
    component.checkIfRequestValid();
    expect(component.configJson[2].errorMsg).toEqual(`Select atleast one \'Metric\' to run the report.`);
    expect(component.configJson[3].errorMsg).toEqual('');
    spy.and.returnValue(of({columns: ['advertiser']}));
    component.checkIfRequestValid();
    expect(component.configJson[2].errorMsg).toEqual('');
  });


});
