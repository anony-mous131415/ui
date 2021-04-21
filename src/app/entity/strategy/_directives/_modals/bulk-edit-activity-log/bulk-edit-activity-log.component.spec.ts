import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditActivityLogComponent } from './bulk-edit-activity-log.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatTableModule, MatPaginatorModule, MatSortModule, MatToolbarModule, MatSelectModule, MatProgressBarModule, MAT_DIALOG_DATA, MatDialogRef, matTooltipAnimations, MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StrategyControllerService, BulkStrategyControllerService, DashboardControllerService, AudienceControllerService } from '@revxui/api-client-ts';
import { HttpClient, HttpHandler } from '@angular/common/http';
import * as STUB from '@app/shared/StubClasses';



let confData = {
  type: 0,
  entity: 'AUDIENCE',
  title: 'Select audiences',
  targetList: [
    { id: 1, name: 'n1', type: 'app' },
    { id: 2, name: 'n2', type: 'web' },
    { id: 3, name: 'n3', type: 'dmp' }
  ],
  blockList: [
    { id: 4, name: 'n4', type: 'app' },
    { id: 5, name: 'n5', type: 'web' },
    { id: 6, name: 'n6', type: 'dmp' }
  ]
}


describe('BulkEditActivityLogComponent', () => {
  let component: BulkEditActivityLogComponent;
  let fixture: ComponentFixture<BulkEditActivityLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BulkEditActivityLogComponent],
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
        MatTooltipModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: confData },
        { provide: MatDialogRef, useValue: { close: (dialogResult: any) => { } } },
        { provide: StrategyControllerService, useClass: STUB.StrategyControllerService_stub },
        { provide: BulkStrategyControllerService, useClass: STUB.BulkStrategyControllerService_stub },
        { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
        { provide: AudienceControllerService, useClass: STUB.AudienceControllerService_stub },
        HttpClient, HttpHandler,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditActivityLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });




  it('should test getRequestParams', () => {
    expect(component.getRequestParams()).toBeTruthy({ pageNum: 1, pageSize: 50, sortString: undefined });
  });











});
