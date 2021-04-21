import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DisableDemoDirective } from '@app/shared/_directives/disable-demo/disable-demo.directive';
import { AlertService } from '@app/shared/_services/alert.service';
import { DashboardControllerService, ReportingControllerService } from '@revxui/api-client-ts';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ConvUiService } from '../../_services/conv-ui.service';
import { CommonResultComponent } from './common-result.component';



describe('CommonResultComponent', () => {
  let component: CommonResultComponent;
  let fixture: ComponentFixture<CommonResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CommonResultComponent,
        DisableDemoDirective
      ],
      schemas: [NO_ERRORS_SCHEMA],

      imports: [
        FormsModule,
        MatDialogModule,
        RouterTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        MatToolbarModule,
        MatSelectModule,
        MatProgressBarModule,
        BrowserAnimationsModule,
        MatTooltipModule,
        HttpClientTestingModule
      ],

      providers: [
        { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
        { provide: ReportingControllerService, useClass: STUB.ReportingControllerService_stub },
        { provide: AlertService, useClass: STUB.AlertService_stub },
      ]


    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should test getPageSize', () => {
    component.reportType = AppConstants.REPORTS.ADVANCED;
    let result = component.getPageSize();
    expect(result.length).toEqual(5);

    component.reportType = AppConstants.REPORTS.CONVERSION;
    result = component.getPageSize();
    expect(result.length).toEqual(7);
  });

  it('should test isAdvHidden', () => {
    component.columnsToDisplay = ['advertiser', 'col-1'];
    let result = component.isAdvHidden();
    expect(result).toEqual(false);

    component.columnsToDisplay = ['col-1'];
    result = component.isAdvHidden();
    expect(result).toEqual(true);
  });


  it('should test hideColumn', () => {
    component.columnsToDisplay = ['advertiser', 'campaign', 'strategy', 'col-1'];
    component.hideColumn();
    expect(component.columnsToDisplay).toEqual(['col-1']);

    component.columnsToDisplay = ['col-1'];
    component.hideColumn();
    expect(component.columnsToDisplay).toEqual(['advertiser', 'campaign', 'strategy', 'col-1']);
  });


  it('should test makePaginationRequest', fakeAsync(() => {
    let dummyResp = {
      respObject: {
        result: [1, 2, 3]
      }
    };
    const spy = spyOn(TestBed.get(ConvUiService), 'show').and.returnValue(of(dummyResp).pipe(delay(1)));
    component.reportType = AppConstants.REPORTS.CONVERSION;
    component.makePaginationRequest();
    const spy1 = spyOn(TestBed.get(ConvUiService), 'setResult').and.callThrough();
    // Trigger ngOnInit()
    fixture.detectChanges();
    tick(1);
    expect(spy1).toHaveBeenCalled();
  }));


  it('should test sortChange', fakeAsync(() => {
    let event = {
      active: 'id',
      direction: 'asc'
    }

    let dummyResp = {
      respObject: {
        result: [1, 2, 3]
      }
    };
    const spy = spyOn(TestBed.get(ConvUiService), 'show').and.returnValue(of(dummyResp).pipe(delay(1)));
    component.reportType = AppConstants.REPORTS.CONVERSION;
    component.sortChange(event);
    const spy1 = spyOn(TestBed.get(ConvUiService), 'setResult').and.callThrough();
    // Trigger ngOnInit()
    fixture.detectChanges();
    tick(1);
    expect(spy1).toHaveBeenCalled();
  }));


  it('should test getColumns', () => {

    component.columnPropertiesList = [1, 2, 3];
    let result = component.getColumns();
    expect(result).toEqual([1, 2, 3]);

    component.reportType = AppConstants.REPORTS.CONVERSION;
    component.columnPropertiesList = null;
    result = component.getColumns();
    expect(result.length).toEqual(3);

    const expectation = [
      'id',
      'columnsToDisplay',
      'reportType',
      'title',
      'colWidthSmall',
      'cell'
    ];
    expect(Object.keys(result[0])).toEqual(expectation);
  });



  it('should test checkDateColumnsToBeDisplayed', () => {

    component.columnsToDisplay = ['advertiser', 'campaign'];
    component.checkDateColumnsToBeDisplayed();
    expect(component.columnsToDisplay).toEqual(['advertiser', 'campaign']);


    component.columnsToDisplay = ['advertiser', 'campaign', 'ts_utc_hour'];
    component.checkDateColumnsToBeDisplayed();
    expect(component.columnsToDisplay).toEqual(['starttime', 'endtime', 'advertiser', 'campaign']);


  });









});
