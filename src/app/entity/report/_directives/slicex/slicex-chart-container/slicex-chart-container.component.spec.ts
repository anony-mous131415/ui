// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { SlicexChartContainerComponent } from './slicex-chart-container.component';

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
// import { EpochDateFormatPipe } from '@app/shared/_pipes/epoch-date-format.pipe';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { SlicexChartContainerComponent } from './slicex-chart-container.component';



describe('SliceChartContainerComponent', () => {
    let component: SlicexChartContainerComponent;
    let fixture: ComponentFixture<SlicexChartContainerComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SlicexChartContainerComponent,
                // DisableDemoDirective,
                // EpochDateFormatPipe,
                // DummyComponent
            ],
            schemas: [NO_ERRORS_SCHEMA],

            imports: [
                CommonModule,
                // RouterModule.forRoot([]),
                // RouterTestingModule.withRoutes(dummysRoutes),
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
        fixture = TestBed.createComponent(SlicexChartContainerComponent);
        component = fixture.componentInstance;
        fixture.componentInstance.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('should test onChartMetricSelectionChanged', () => {

        let obj1 = {
            ContainerID: 'cid',
            Metric: 'm1',
            MetricDisplayName: 'd1',
            MetricUnit: 'mu',
            MetricUnitValue: 'mv',
            Total: 1,
            ChartType: 'ctype',
            ChartSeries: [],
            Frequency: 'freq'
        }

        let obj2 = {
            ContainerID: 'cid',
            Metric: 'm2',
            MetricDisplayName: 'd1',
            MetricUnit: 'mu',
            MetricUnitValue: 'mv',
            Total: 1,
            ChartType: 'ctype',
            ChartSeries: [],
            Frequency: 'freq'
        }

        component.chartData = [obj1, obj2];

        let input = {
            isUserInput: true,
            source: {
                selected: false,
                value: 'm1'
            }
        }


        //test-1
        component.onChartMetricSelectionChanged(input);
        expect(component.chartData).toBeTruthy([obj2]);

        //test-2
        component.chartData = [obj1, obj2];
        input.source.selected = true
        component.onChartMetricSelectionChanged(input);
        expect(component.chartData).toBeTruthy([obj1, obj2]);

        //test-3
        input.isUserInput = false;
        component.onChartMetricSelectionChanged(input);
        expect(component.chartData).toBeTruthy([obj1, obj2]);
    });



});
