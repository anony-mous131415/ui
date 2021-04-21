import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGridComponent, ImageData } from './image-grid.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatTableModule, MatPaginatorModule, MatSortModule, MatToolbarModule, MatSelectModule, MatProgressBarModule, MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppSettingsControllerService, AppSettingsDTO, AppSettingsPropertyDTO } from '@revxui/api-client-ts';
import { HttpClient, HttpHandler } from '@angular/common/http';
import * as STUB from '@app/shared/StubClasses';


let props0: AppSettingsPropertyDTO = {
  id: 0,
  propertyKey: 'DIMENSIONS',
  propertyValue: '0'
}

let props1: AppSettingsPropertyDTO = {
  id: 1,
  propertyKey: 'DIMENSIONS',
  propertyValue: '1'
}


let imageDataArr1: ImageData[] = [
  { id: 0, name: 'n0', url: 'url0', isSelected: false, props: [props0], key: null },
];

let imageDataArr2: ImageData[] = [
  { id: 0, name: 'n0', url: 'url0', isSelected: false, props: [props0], key: null },
  { id: 1, name: 'n1', url: 'url1', isSelected: true, props: [props1], key: null },
];



describe('ImageGridComponent', () => {
  let component: ImageGridComponent;
  let fixture: ComponentFixture<ImageGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImageGridComponent],
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
        { provide: AppSettingsControllerService, useClass: STUB.AppSettingsControllerService_stub },
        HttpClient, HttpHandler,
      ]


    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  //REVX-724
  it('should test getTypeTitle', () => {
    let type = 1;
    expect(component.getTypeTitle(type)).toEqual('logo(s)');
    type = 2;
    expect(component.getTypeTitle(type)).toEqual('fallback image(s)');
    type = 3;
    expect(component.getTypeTitle(type)).toEqual('overlay image(s)');
    type = 4;
    expect(component.getTypeTitle(type)).toBeUndefined();
  });


  it('should test extractNameFromUrl', () => {
    let url = '';
    expect(component.extractNameFromUrl(url)).toEqual('');

    url = 'a/b';
    expect(component.extractNameFromUrl(url)).toEqual('b');
  });


  it('should test searchCreatives', () => {
    let searchText = '';
    component.imgList = [];
    component.searchCreatives(searchText);
    expect(component.isDataAvailable).toEqual(false);

    searchText = 'abc';
    component.imgList = [
      {
        id: 1,
        name: 'abc',
        url: '',
        isSelected: true,
        props: [],
        key: null
      }
    ]
    component.searchCreatives(searchText);
    expect(component.isDataAvailable).toEqual(true);

    component.selectedImages = [];
    component.deleteSelectedImages();


    let spy = spyOn(component, 'openUploadModal');
    component.openLogoUploadModel();
    expect(spy).toHaveBeenCalledTimes(1);
    component.openFallbackImageUploadModel();
    expect(spy).toHaveBeenCalledTimes(2);
    component.openOverlayImageUploadModel();
    expect(spy).toHaveBeenCalledTimes(3);
    component.onDeleteSelectedImages();

  });

  it('should test buildCreativeSizeFilterMap', () => {
    let expected = new Map<string, ImageData[]>();

    let imageDataArr0: ImageData[] = [];

    component.buildCreativeSizeFilterMap(imageDataArr0);
    expect(component.creativeSizeMap).toEqual(expected);


    expected.set('0', imageDataArr1)
    component.buildCreativeSizeFilterMap(imageDataArr1);
    expect(component.creativeSizeMap).toEqual(expected);


  });



  it('should test groupImages', () => {
    let imageDataArr0: ImageData[] = [];
    component.groupImages(imageDataArr0);
    expect(component.c1Images).toEqual([]);

    imageDataArr0 = [
      { id: 0, name: 'n0', url: 'url0', isSelected: false, props: [props0], key: null },
      { id: 1, name: 'n1', url: 'url1', isSelected: true, props: [props1], key: null },
      { id: 2, name: 'n0', url: 'url0', isSelected: false, props: [props0], key: null },
      { id: 3, name: 'n1', url: 'url1', isSelected: true, props: [props1], key: null },
    ];

    component.groupImages(imageDataArr0);
    expect(component.c1Images).toEqual([imageDataArr0[0]]);
    expect(component.c2Images).toEqual([imageDataArr0[1]]);
    expect(component.c3Images).toEqual([imageDataArr0[2]]);
    expect(component.c4Images).toEqual([imageDataArr0[3]]);
  });


  it('should test getImageList', () => {
    component.c1Images = [];
    expect(component.getImageList(1)).toEqual([]);
    component.c2Images = [];
    expect(component.getImageList(2)).toEqual([]);
    component.c3Images = [];
    expect(component.getImageList(3)).toEqual([]);
    component.c4Images = [];
    expect(component.getImageList(4)).toEqual([]);

    let spy = spyOn(component, 'getImageList');
    component.getImageList(5);
    expect(spy).toHaveBeenCalledWith(5);
  });


  it('should test openUploadModel', () => {
    let spy1 = spyOn(component, 'openLogoUploadModel');
    component.type = 1;
    component.openUploadModel();
    expect(spy1).toHaveBeenCalled();

    let spy2 = spyOn(component, 'openFallbackImageUploadModel');
    component.type = 2;
    component.openUploadModel();
    expect(spy2).toHaveBeenCalled();

    let spy3 = spyOn(component, 'openOverlayImageUploadModel');
    component.type = 3;
    component.openUploadModel();
    expect(spy3).toHaveBeenCalled();

    component.type = 4;
    component.openUploadModel();
    expect(spy3).toHaveBeenCalledTimes(1);
  });


  it('should test getAppSettingProps', () => {

    let prop = {
      DIMENSIONS: 'a',
    }

    let expected: AppSettingsPropertyDTO[] = [
      { propertyKey: 'DIMENSIONS', propertyValue: 'a' }
    ]

    let result = component.getAppSettingProps(prop);
    expect(result).toEqual(expected);

  });



  it('should test toggleSelected', () => {

    let imageData: ImageData = {
      id: 0,
      name: 'n0',
      url: 'url0',
      isSelected: false,
      props: [],
      key: null
    }
    component.selectedImages = [];
    component.toggleSelected(imageData);
    expect(component.selectedImages).toEqual([imageData]);

    imageData.isSelected = true;
    component.selectedImages = [imageData];
    component.toggleSelected(imageData);
    expect(component.selectedImages).toEqual([]);

    imageData.isSelected = true;
    component.selectedImages = [{ id: 1, name: 'n0', url: 'url0', isSelected: false, props: [], key: null }];
    component.toggleSelected(imageData);
    expect(component.selectedImages).toEqual([{ id: 1, name: 'n0', url: 'url0', isSelected: false, props: [], key: null }]);
  });



  it('should test onCreativeSizeChange', () => {
    let event = {
      value: [{ name: 'a' }]
    }
    let spy = spyOn(component, 'groupImages');

    component.imgList = [];
    component.onCreativeSizeChange(null);
    expect(spy).toHaveBeenCalledWith([]);

    component.creativeSizeMap = new Map<string, ImageData[]>();
    component.creativeSizeMap.set('a', [])

    component.onCreativeSizeChange(event);
    expect(spy).toHaveBeenCalled();
  });



  it('should test extractCreativeSizes', () => {


    let result = component.extractCreativeSizes([]);
    expect(result).toEqual(null);

    result = component.extractCreativeSizes(imageDataArr1);
    expect(result).toEqual([{ id: 0, name: '0' }]);

  });








});

