import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import * as STUB from '@app/shared/StubClasses';
import { DashboardControllerService, ReportingControllerService } from '@revxui/api-client-ts';
import { ConversionComponent } from './conversion.component';
import { GridData } from '@app/entity/report/_services/common-reporting.service';
import { AlertService } from '@app/shared/_services/alert.service';
import { ConvUiService } from '@app/entity/report/_services/conv-ui.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    template: ''
})
export class DummyComponent { }
const dummyRoutes = [
    { path: 'report/conversion', component: DummyComponent },
    { path: 'report/advanced', component: DummyComponent },
    { path: 'report/advanced/result', component: DummyComponent },
    { path: 'report/conversion/result', component: DummyComponent },
    { path: 'random/path', component: DummyComponent },
]



describe('ConversionComponent', () => {
    let component: ConversionComponent;
    let fixture: ComponentFixture<ConversionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
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
                HttpClientTestingModule,
                RouterTestingModule.withRoutes(dummyRoutes),
            ],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [ConversionComponent, DummyComponent],
            providers: [
                { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
                { provide: ReportingControllerService, useClass: STUB.ReportingControllerService_stub },
                { provide: AlertService, useClass: STUB.AlertService_stub },
                // { provide: ConvUiService, useClass: STUB.ConvUiService_stub },


            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConversionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });


    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('should test resetSelection', fakeAsync(() => {
        const spy = spyOn(TestBed.get(AlertService), 'clear').and.callThrough();
        component.resetSelection();
        tick(1501);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            let expected = { map: new Map<number, boolean>(), set: new Set<GridData>() };

            expect(component.advertiser).toEqual(expected);
            expect(component.campaign).toEqual(expected);
            expect(component.strategy).toEqual(expected);

            expect(spy).toHaveBeenCalled();
        })

    }));



    it('should test updateBucket', () => {
        let inputArg = {
            isSelected: false
        };
        component.updateBucket(null, inputArg as any);
        expect(inputArg.isSelected).toEqual(true);
    });


    it('should test getSelectAllStatus', () => {

        component.metricUIList = [
            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },

            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },

            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },

        ] as any;


        let result = component.getSelectAllStatus();
        expect(result).toEqual(true);

        component.metricUIList = [
            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },

            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },

            { isDisplayed: true, isSelected: true },
            { isDisplayed: true, isSelected: true },

        ] as any;

        result = component.getSelectAllStatus();
        expect(result).toEqual(false);
    });



    it('should test changeConvType', () => {
        let inputArg = {
            select: false
        };
        component.changeConvType(inputArg as any);
        expect(inputArg.select).toEqual(true);
    });


    it('should test onSelectAll', () => {

        component.metricUIList = [
            { isDisplayed: true, isSelected: true },
            { isDisplayed: false, isSelected: true },
            { isDisplayed: false, isSelected: true },

        ] as any;


        let event = {
            checked: false
        }

        component.onSelectAll(event as any);

        expect(component.metricUIList[0].isSelected).toEqual(false);
        expect(component.metricUIList[1].isSelected).toEqual(true);
        expect(component.metricUIList[2].isSelected).toEqual(true);
    });



    it('should test runReport', fakeAsync(() => {

        let dummyResp = {
            respObject: {
                result: [1, 2, 3]
            }
        };

        const spy = spyOn(TestBed.get(ConvUiService), 'show').and.returnValue(of(dummyResp).pipe(delay(1)));
        let myRouter = TestBed.get(Router);
        component.runReport();

        const spy1 = spyOn(TestBed.get(ConvUiService), 'setResult').and.callThrough();

        // Trigger ngOnInit()
        fixture.detectChanges();

        tick(1);
        expect(spy1).toHaveBeenCalled();
    }));


});
