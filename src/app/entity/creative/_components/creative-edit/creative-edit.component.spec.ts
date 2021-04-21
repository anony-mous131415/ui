
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppModule } from '@app/app.module';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { CreativeEditComponent } from './creative-edit.component';
import { CreativeConstants } from '../../_constants/CreativeConstants';



describe('CreativeEditComponent', () => {
    let component: CreativeEditComponent;
    let fixture: ComponentFixture<CreativeEditComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CreativeEditComponent,

            ],
            schemas: [NO_ERRORS_SCHEMA],

            imports: [
                CommonModule,
                // RouterModule.forRoot([]),
                // RouterTestingModule.withRoutes(dummyRoutes),
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
        fixture = TestBed.createComponent(CreativeEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    //revx-646
    it('should test validateNativeAttributes', () => {

        component.creative = {
            nativeAsset: {
                title: '',
                body: '',
                callToAction: '',
                iconurl: ''
            }
        }

        //test-1
        component.validateNativeAttributes();
        expect(component.errorMsg).toEqual(CreativeConstants.VALIDATION_NATIVE_TITLE);
        expect(component.formValidated).toEqual(false);

        //test-2
        component.creative.nativeAsset.title = 'title';
        component.validateNativeAttributes();
        expect(component.errorMsg.length).toBeGreaterThan(1);
        expect(component.formValidated).toEqual(false);


        //test-3
        component.creative.nativeAsset.title = 'title';
        component.creative.nativeAsset.body = 'body';
        component.validateNativeAttributes();
        expect(component.errorMsg).toEqual(CreativeConstants.NATIVE_CALLTOACTION);
        expect(component.formValidated).toEqual(false);

        //test-4
        component.creative.nativeAsset.title = 'title';
        component.creative.nativeAsset.body = 'body';
        component.creative.nativeAsset.callToAction = 'cta';
        component.validateNativeAttributes();
        expect(component.errorMsg).toEqual(CreativeConstants.VALIDATION_ICON);
        expect(component.formValidated).toEqual(false);


        //test-5
        component.creative.nativeAsset.title = 'title';
        component.creative.nativeAsset.body = 'body';
        component.creative.nativeAsset.callToAction = 'cta';
        component.creative.nativeAsset.iconurl = 'icon';
        component.validateNativeAttributes();
        expect(component.errorMsg).toEqual('');


    });
});
