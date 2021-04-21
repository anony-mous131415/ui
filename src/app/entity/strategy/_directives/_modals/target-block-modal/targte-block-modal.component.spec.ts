import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatDialogModule, MatDialogRef, MatFormFieldModule, MatInputModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule, MAT_DIALOG_DATA } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '@app/app.module';
import * as STUB from '@app/shared/StubClasses';
import { TargetBlockModalComponent } from './target-block-modal.component';



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


describe('Tbm2Component', () => {
  let component: TargetBlockModalComponent;
  let fixture: ComponentFixture<TargetBlockModalComponent>;
  let test_helper: Test_Helper;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TargetBlockModalComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],

      imports: [
        CommonModule,
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
        MatInputModule,
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
        { provide: FormGroup },
        { provide: MAT_DIALOG_DATA, useValue: confData },
        { provide: MatDialogRef, useValue: { close: (dialogResult: any) => { } } },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetBlockModalComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngOnInit();
    test_helper = new Test_Helper();

  });


  afterEach(() => {
    fixture.destroy();
  });


  //revx-636 test cases

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should test getIdsArray()', () => {
    const arr = [
      { id: 1, name: '1' },
      { id: 2, name: '2' }
    ];

    let return_arr = component.getIdsArray(arr);
    expect(return_arr.length).toEqual(2);
    expect(return_arr).toEqual([1, 2]);
  });


  it('should test isRowBlocked , isRowTargetted', () => {

    component.selBlockList = [
      { id: 1, name: 'n1' },
      { id: 2, name: 'n2' }
    ]
    expect(component.isRowBlocked({ id: 1 })).toEqual(true);
    expect(component.isRowBlocked({ id: 34 })).toEqual(false);

    expect(component.isRowTargetted({ id: 1 })).toEqual(true);
    expect(component.isRowTargetted({ id: 34 })).toEqual(false);

    expect(component.isRowBlocked({})).toEqual(false);
    expect(component.isRowTargetted({})).toEqual(false);
  });



  it('should test addToTargetBucket()', () => {
    component.selTargetList = test_helper.get_objects_array(2)
    component.selBlockList = test_helper.get_objects_array(1);

    let new_obj = { ...component.selBlockList[0] };
    component.addToTargetBucket(new_obj);
    expect(component.selTargetList.length).toEqual(2);
    expect(component.selBlockList.length).toEqual(0);
  });


  it('should test addToTargetBucket()', () => {
    component.selBlockList = test_helper.get_objects_array(2)
    component.selTargetList = test_helper.get_objects_array(1);
    let new_obj = { ...component.selTargetList[0] };
    component.addToBlockBucket(new_obj);
    expect(component.selBlockList.length).toEqual(2);
    expect(component.selTargetList.length).toEqual(0);
  });



  it('should test  : addToBucket()', () => {
    // on valid object insertion
    component.selTargetList = [];
    let dummy_obj = test_helper.get_dummy_obj();
    component.addToBucket(component.selTargetList, dummy_obj);
    expect(component.selTargetList.length).toEqual(1);

  });


  it('should test : deleteFromBucket()', () => {
    let dummy_obj = test_helper.get_dummy_obj();

    //if bucket is empty already
    component.selTargetList = [];
    component.deleteFromBucket(component.selTargetList, dummy_obj);
    expect(component.selTargetList.length).toEqual(0);

    // if bucket is doesnot has the object
    component.selTargetList = test_helper.get_objects_array(2);
    component.deleteFromBucket(component.selTargetList, dummy_obj);
    expect(component.selTargetList.length).toEqual(2);

    component.deleteFromBucket(component.selTargetList, {});

  });


  it('should test  : isRowSelected()', () => {
    let spy_targeted = spyOn(component, 'isRowTargetted');
    let spy_blocked = spyOn(component, 'isRowBlocked');

    component.config.type = -1;
    component.isRowSelected({})
    expect(spy_blocked).toHaveBeenCalled();

    component.config.type = 1;
    component.isRowSelected({})
    expect(spy_targeted).toHaveBeenCalled();
  });


  it('should test  : masterCbToggle()', () => {
    let spy_1 = spyOn(component, 'addToTargetBucket');
    let spy_2 = spyOn(component, 'addToBlockBucket');

    component.allDataTillNow = [
      { id: 1, name: 'n1', active: true },
      { id: 2, name: 'n2', active: true }
    ]

    let event = {
      checked: true,
      source: null
    }

    //test-1
    component.config.type = -1;
    component.masterCbToggle(event);
    expect(component.masterCbStatus).toEqual(event.checked);
    expect(spy_2).toHaveBeenCalled();

    //test-2
    component.config.type = 1;
    component.masterCbToggle(event);
    expect(component.masterCbStatus).toEqual(event.checked);
    expect(spy_1).toHaveBeenCalled();


    //test-3
    spy_1 = spyOn(component, 'deleteFromBucket');
    event.checked = false;
    component.config.type = -1;
    component.masterCbToggle(event);
    expect(component.masterCbStatus).toEqual(event.checked);
    expect(spy_1).toHaveBeenCalled();

    //test-4
    event.checked = false;
    component.config.type = 1;
    component.masterCbToggle(event);
    expect(component.masterCbStatus).toEqual(event.checked);
    expect(spy_1).toHaveBeenCalled();
  });


  it('should test  : cbRowToggle()', () => {
    let spy_1 = spyOn(component, 'addToBucket');
    let spy_2 = spyOn(component, 'deleteFromBucket');
    // let spy_3 = spyOn(component, 'updateMasterCbStatus');
    let spy_3 = spyOn(component, 'deleteFromBucket');



    component.allDataTillNow = [
      { id: 1, name: 'n1', active: true },
      { id: 2, name: 'n2', active: true }
    ]

    let event = {
      checked: true,
      source: null
    }

    //test-1
    event.checked = true;
    component.config.type = 1;
    component.cbRowToggle(event, { id: 12, name: 'any' });
    expect(spy_1).toHaveBeenCalled();
    expect(spy_3).toHaveBeenCalled();


    //test-2
    event.checked = false;
    component.config.type = 1;
    component.cbRowToggle(event, { id: 12, name: 'any' });
    expect(spy_2).toHaveBeenCalled();
    expect(spy_3).toHaveBeenCalled();



    //test-3
    event.checked = true;
    component.config.type = -1;
    component.cbRowToggle(event, { id: 12, name: 'any' });
    expect(spy_1).toHaveBeenCalled();
    expect(spy_3).toHaveBeenCalled();


    //test-4
    event.checked = false;
    component.config.type = -1;
    component.cbRowToggle(event, { id: 12, name: 'any' });
    expect(spy_2).toHaveBeenCalled();
    expect(spy_3).toHaveBeenCalled();
  });



  it('should test addToTargetBucket()', () => {
    let obj1 = { id: 1, name: 'n1', active: true };
    let obj2 = { id: 2, name: 'n2', active: true };

    component.allDataTillNow = [obj1, obj2];

    let list = [obj1, obj2];
    // component.updateMasterCbStatus(list);
    expect(component.masterCbStatus).toEqual(true);

    list = [obj2];
    // component.updateMasterCbStatus(list);
    expect(component.masterCbStatus).toEqual(false);

  });




  it('should test removeItemSelectionFromSidePanel()', () => {
    let spy_1 = spyOn(component, 'deleteFromBucket');
    let obj1 = { id: 1, name: 'n1', active: true };

    component.removeItemSelectionFromSidePanel(obj1, 1);
    expect(spy_1).toHaveBeenCalled();

    component.removeItemSelectionFromSidePanel(obj1, -1);
    expect(spy_1).toHaveBeenCalled();

    component.removeItemSelectionFromSidePanel(obj1, 0);
  });


  it('should test clearAllSelection()', () => {
    component.clearAllSelection();
    expect(component.selTargetList.length).toEqual(0);
    expect(component.selBlockList.length).toEqual(0);
    expect(component.config.targetList.length).toEqual(0);
    expect(component.config.blockList.length).toEqual(0);
    expect(component.masterCbStatus).toEqual(false);
  });



  it('should test onSaveClick()', () => {
    let spy = spyOn(component, 'showError');

    //test-1
    component.config.type = 1;
    component.onSaveClick();

    //test-2
    component.masterCbStatus = true;
    component.config.type = -1;
    component.onSaveClick();
    expect(spy).toHaveBeenCalled();

    //test-3
    component.masterCbStatus = false;
    component.config.type = -1;
    component.onSaveClick();

    //test-3
    component.masterCbStatus = false;
    component.config.type = 0;
    component.onSaveClick();
  });




  it('should test setupTable()', () => {

    let spy1 = spyOn(component, 'addToAllDataSet');
    let spy2 = spyOn(component, 'addToTargetBucket');
    let spy3 = spyOn(component, 'addToBlockBucket');

    let apiResp = {
      data: [{ id: 1, name: 'n1' }, { id: 2, name: 'n2' }]
    }

    //test-1
    component.masterCbStatus = true;
    component.config.type = 1;
    component.setupTable(apiResp);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    //test-2
    component.masterCbStatus = true;
    component.config.type = -1;
    component.setupTable(apiResp);
    expect(spy3).toHaveBeenCalled();

    //test-3
    component.masterCbStatus = false;
    component.config.type = -1;
    component.setupTable(apiResp);



  });


});




class Test_Helper {

  ele_1: any = {
    id: 1,
    name: 'test_obj_1',
    active: true,
    type: 'app'
  };

  ele_2: any = {
    id: 2,
    name: 'test_obj_2',
    active: true,
    type: 'app'
  };

  ele_3: any = {
    id: 3,
    name: 'test_obj_3',
    active: true,
    type: 'app'
  };


  get_objects_array(_size: number): any[] {
    let arr: any[] = []
    arr.push(this.ele_1);
    if (_size === 2) {
      arr.push(this.ele_2);
    }
    return arr;
  }


  get_dummy_obj(): any {
    return this.ele_3;
  }

}

