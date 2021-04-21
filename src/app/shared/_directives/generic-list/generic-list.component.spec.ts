import { CommonModule } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '@app/app.module';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EpochDateFormatPipe } from '@app/shared/_pipes/epoch-date-format.pipe';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { DisableDemoDirective } from '../disable-demo/disable-demo.directive';
import { GenericListComponent } from './generic-list.component';



@Component({
    template: ''
})
export class DummyComponent { }
const dummyRoutes = [
    { path: 'advertiser/create', component: DummyComponent },
    { path: 'campaign/create', component: DummyComponent },
    { path: 'strategy/create', component: DummyComponent },
    { path: 'audience/create', component: DummyComponent },
]




describe('GenericListComponent', () => {
    let component: GenericListComponent;
    let fixture: ComponentFixture<GenericListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GenericListComponent,
                DisableDemoDirective,
                EpochDateFormatPipe,
                DummyComponent
            ],
            schemas: [NO_ERRORS_SCHEMA],

            imports: [
                CommonModule,
                // RouterModule.forRoot([]),
                RouterTestingModule.withRoutes(dummyRoutes),
                AppModule,
                BrowserDynamicTestingModule,
                FormsModule,
                MatDialogModule,
                MatTableModule,
                MatPaginatorModule,
                MatSortModule,
                ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
                MatToolbarModule,
                MatSelectModule,
                MatProgressBarModule,
                BrowserAnimationsModule,
                MatButtonModule,
                MatToolbarModule,
                MatCheckboxModule,
                MatMenuModule,
                MatFormFieldModule,
                MatInputModule
            ],
            providers: [
                { provide: FormGroup },
                DashboardControllerService,
                HttpClient,
                HttpHandler
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GenericListComponent);
        component = fixture.componentInstance;
        component.entity = AppConstants.ENTITY.PIXEL;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should test showHideActivateDeactivateButton', () => {
        component.listParams.selectedRowStatus = [true, true];
        component.showHideActivateDeactivateButton();
        expect(component.listParams.disableDeactivateBtn).toEqual(false);
        expect(component.listParams.disableActivateBtn).toEqual(true);

        component.listParams.selectedRowStatus = [false];
        component.showHideActivateDeactivateButton();
        expect(component.listParams.disableDeactivateBtn).toEqual(true);
        expect(component.listParams.disableActivateBtn).toEqual(false);
    });


    it('should test seggregateRequiredIdsFromAllIds', () => {
        component.listParams.selectedRowStatus = [
            false, true
        ];

        let result = component.seggregateRequiredIdsFromAllIds(false);
        expect(result.length).toEqual(1);

        result = component.seggregateRequiredIdsFromAllIds(true);
        expect(result.length).toEqual(1);
    });


    it('should test inConsistentStatus', () => {
        component.listParams.selectedRowStatus = [false, true];
        let result = component.inConsistentStatus();
        expect(result).toEqual(true);
    });


    it('should test selectRow', () => {
        const row = {
            id: 123,
            name: 'n1',
            active: true
        };

        component.selectRow(row.id, row, true, row.active);
        expect(component.listParams.selectedRowIds).toEqual([123]);
        expect(component.listParams.selectedRowDetails).toEqual([row]);
        expect(component.listParams.selectedRowStatus).toEqual([true]);

        component.listParams.selectedRowIds = []
        component.listParams.selectedRowDetails = []
        component.listParams.selectedRowStatus = []

        component.selectRow(row.id, row, false, row.active);
        expect(component.listParams.selectedRowIds).toEqual([]);
        expect(component.listParams.selectedRowDetails).toEqual([]);
        expect(component.listParams.selectedRowStatus).toEqual([]);

        component.entity = AppConstants.ENTITY.ADVERTISER;
        component.reload();
        component.downloadCSV();
        component.resetSelection();
        component.showMessageAfterAction({});
    });



});
