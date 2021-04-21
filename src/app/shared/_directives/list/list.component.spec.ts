import { CommonModule } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '@app/app.module';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EpochDateFormatPipe } from '@app/shared/_pipes/epoch-date-format.pipe';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { DisableDemoDirective } from '../disable-demo/disable-demo.directive';
import { ListComponent } from './list.component';



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



describe('ListComponent', () => {
    let component: ListComponent;
    let fixture: ComponentFixture<ListComponent>;
    
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ListComponent,
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
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('should test showHideActivateDeactivateButton', () => {
        component.selectedRowStatus = [true, true];
        component.showHideActivateDeactivateButton();
        expect(component.disableDeactivateBtn).toEqual(false);
        expect(component.disableActivateBtn).toEqual(true);

        component.selectedRowStatus = [false];
        component.showHideActivateDeactivateButton();
        expect(component.disableDeactivateBtn).toEqual(true);
        expect(component.disableActivateBtn).toEqual(false);
    });


    it('should test seggregateRequiredIdsFromAllIds', () => {
        component.selectedRowDetails = [
            { id: 12, active: false },
            { id: 13, active: true },
        ];

        let result = component.seggregateRequiredIdsFromAllIds(false);
        expect(result).toEqual([12]);

        result = component.seggregateRequiredIdsFromAllIds(true);
        expect(result).toEqual([13]);
    });


    it('should test inConsistentStatus', () => {
        component.selectedRowStatus = [false, true];
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
        expect(component.selectedRowIds).toEqual([123]);
        expect(component.selectedRowDetails).toEqual([row]);
        expect(component.selectedRowStatus).toEqual([true]);

        component.selectedRowIds = []
        component.selectedRowDetails = []
        component.selectedRowStatus = []

        component.selectRow(row.id, row, false, row.active);
        expect(component.selectedRowIds).toEqual([]);
        expect(component.selectedRowDetails).toEqual([]);
        expect(component.selectedRowStatus).toEqual([]);

        component.entity = AppConstants.ENTITY.ADVERTISER;
        component.reload();
        component.downloadCSV();
        component.resetSelection();
        component.showMessageAfterAction({});
    });


    it('should test selectRow', fakeAsync(() => {

        const advCreate = '/advertiser/create';
        const cmpCreate = '/campaign/create';
        const strCreate = '/strategy/create';

        let myRouter = TestBed.get(Router);
        let spy = spyOn(myRouter, 'navigate')

        component.entity = 'advertiser';
        component.createEntity();
        expect(spy).toHaveBeenCalledWith([advCreate]);

        component.entity = 'campaign';
        component.entityId = null;
        component.createEntity();
        expect(spy).toHaveBeenCalledWith([cmpCreate]);
        component.entityId = '123';
        component.createEntity();
        expect(spy).toHaveBeenCalledWith(['/advertiser/123/campaign/create']);

        component.entity = 'strategy';
        component.entityId = null;
        component.createEntity();
        expect(spy).toHaveBeenCalledWith([strCreate]);
        component.entityId = '123';
        component.createEntity();
        expect(spy).toHaveBeenCalledWith(['/strategy/123/create']);

        component.entity = 'audience';
        component.entityId = null;
        component.createEntity();
        expect(spy).toHaveBeenCalledWith(['/audience/create']);
        component.entityId = '123';
        component.createEntity();
        expect(spy).toHaveBeenCalledWith(['/campaign/123/strategy/create']);
    }));


});