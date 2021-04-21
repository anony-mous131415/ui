import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule, MAT_DIALOG_DATA } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AudienceElement } from '@app/entity/strategy/_services/strategy.service';
import { BulkStrategyControllerService, DashboardControllerService, StrategyControllerService, AudienceControllerService } from '@revxui/api-client-ts';
import { TargetBlockAudienceModalComponent } from './target-block-audience-modal.component';
import { of, Observable } from 'rxjs';
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

describe('TargetBlockAudienceModalComponent', () => {

    let component: TargetBlockAudienceModalComponent;
    let fixture: ComponentFixture<TargetBlockAudienceModalComponent>;
    let test_helper: Test_Helper;


    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TargetBlockAudienceModalComponent],
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
                BrowserAnimationsModule
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

        fixture = TestBed.createComponent(TargetBlockAudienceModalComponent);
        component = fixture.componentInstance;
        test_helper = new Test_Helper();

        component.audienceTBObject = {
            app: {
                targetList: [],
                blockedList: []
            },

            web: {
                targetList: [],
                blockedList: []
            },

            dmp: {
                targetList: [],
                blockedList: []
            }
        };
        fixture.detectChanges();
    });



    afterEach(() => {
        TestBed.resetTestingModule();
    });


    //verifies :  the basic method addToBucket()
    it('should test basic method : addToBucket()', () => {

        // on valid object insertion
        let dummy_obj = test_helper.get_dummy_obj();
        component.addToBucket(component.audienceTBObject.app.targetList, dummy_obj);
        expect(component.audienceTBObject.app.targetList.length).toEqual(1);

        //on null insertion
        let null_obj = null;
        component.addToBucket(component.audienceTBObject.web.targetList, null_obj);
        expect(component.audienceTBObject.web.targetList.length).toEqual(0);
    });


    //verifies :  the basic method deleteFromBucket()
    it('should test basic method : deleteFromBucket()', () => {
        let dummy_obj = test_helper.get_dummy_obj();

        //if bucket is empty already
        component.audienceTBObject.app.targetList = [];
        component.deleteFromBucket(component.audienceTBObject.app.targetList, dummy_obj);
        expect(component.audienceTBObject.app.targetList.length).toEqual(0);

        // if bucket is doesnot has the object
        component.audienceTBObject.app.targetList = test_helper.get_objects_array(2);
        component.deleteFromBucket(component.audienceTBObject.app.targetList, dummy_obj);
        expect(component.audienceTBObject.app.targetList.length).toEqual(2);
    });



    //verifies :  addition and removal of object on trageting a ROW from UI
    it('should test addToTargetBucket()', () => {
        component.audienceTBObject.app.targetList = test_helper.get_objects_array(2)
        component.audienceTBObject.app.blockedList = test_helper.get_objects_array(1);
        component.selectedAudienceType = 'app';
        let new_obj = { ...component.audienceTBObject.app.blockedList[0] };
        component.addToTargetBucket(new_obj);
        expect(component.audienceTBObject.app.targetList.length).toEqual(2);
        expect(component.audienceTBObject.app.blockedList.length).toEqual(0);
    });


    // verifies :  DUPLICATES ARE NOT ADDED TO THE BUKCETS
    it('should test addToBlockBucket()', () => {
        component.audienceTBObject.app.targetList = test_helper.get_objects_array(1);
        let new_obj: AudienceElement = {
            id: component.audienceTBObject.app.targetList[0].id,
            name: component.audienceTBObject.app.targetList[0].name,
        };
        component.selectedAudienceType = 'app';
        component.addToBlockBucket(new_obj);
        expect(component.audienceTBObject.app.blockedList.length).toEqual(1);
    });


    //verifies :  whether ids are correctly derived from an array of objects
    it('should test getIdsArray()', () => {
        const arr = [
            { id: 1, name: '1' },
            { id: 2, name: '2' }
        ];

        let return_arr = component.getIdsArray(arr);
        expect(return_arr.length).toEqual(2);
        expect(return_arr).toEqual([1, 2]);
    });


    // verifies :  whether updateBukcet when called with NULL object
    it('should test updateBukcet() with NULL inputs', () => {
        component.audienceTBObject.app.targetList = test_helper.get_objects_array(2);
        component.audienceTBObject.app.blockedList = test_helper.get_objects_array(1);
        component.selectedAudienceType = 'app';
        component.updateBucket('app', null, false);
        expect(component.audienceTBObject.app.targetList.length).toEqual(2);
        expect(component.audienceTBObject.app.blockedList.length).toEqual(1);
    });

    it('should test initModalValue', () => {
        component.initModalValue();
        expect(component.audienceTBObject.app.targetList.length).toEqual(1);
        expect(component.audienceTBObject.app.blockedList.length).toEqual(1);

        expect(component.audienceTBObject.web.targetList.length).toEqual(1);
        expect(component.audienceTBObject.web.blockedList.length).toEqual(1);

        expect(component.audienceTBObject.dmp.targetList.length).toEqual(1);
        expect(component.audienceTBObject.dmp.blockedList.length).toEqual(1);
    });

    it('should test clearSpecific', () => {
        component.clearSpecific('app');
        expect(component.audienceTBObject.app.targetList.length).toEqual(0);
        expect(component.audienceTBObject.app.blockedList.length).toEqual(0);
    });



    it('should test clearSpecific', () => {
        component.clearSpecific('app');
        expect(component.audienceTBObject.app.targetList.length).toEqual(0);
        expect(component.audienceTBObject.app.blockedList.length).toEqual(0);
    });


    it('should test isRowTargettedOrBlocked', () => {

        const row = {
            id: 1,
            name: 'n1'
        };


        //target-list
        component.audienceTBObject.app.targetList = [
            { id: 1, name: 'n1' }
        ];

      
        let result = component.isRowTargettedOrBlocked(row, 'app', true);
        expect(result).toEqual(true);

        //block-list
        component.audienceTBObject.app.targetList = [];
        component.audienceTBObject.app.blockedList = [
            { id: 1, name: 'n1' }
        ];

        result = component.isRowTargettedOrBlocked(row, 'app', false);
        expect(result).toEqual(true);
    });

});




class Test_Helper {

    ele_1: AudienceElement = {
        id: 1,
        name: 'test_obj_1',
        active: true,
        type: 'app'
    };

    ele_2: AudienceElement = {
        id: 2,
        name: 'test_obj_2',
        active: true,
        type: 'app'
    };

    ele_3: AudienceElement = {
        id: 3,
        name: 'test_obj_3',
        active: true,
        type: 'app'
    };


    get_objects_array(_size: number): AudienceElement[] {
        let arr: AudienceElement[] = []
        arr.push(this.ele_1);
        if (_size === 2) {
            arr.push(this.ele_2);
        }
        return arr;
    }


    get_dummy_obj(): AudienceElement {
        return this.ele_3;
    }

}



