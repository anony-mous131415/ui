import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { CreativeTemplateDTO, CreativeTemplateThemesControllerService, TemplateThemeDTO, TemplateVariablesDTO } from '@revxui/api-client-ts';
import { CreativeService } from '../../_services/creative.service';
import { CreativeTemplateDTO } from '@revxui/api-client-ts/model/creativeTemplateDTO';
import { TemplateThemeDTO } from '@revxui/api-client-ts/model/templateThemeDTO';
import { TemplateVariablesDTO } from '@revxui/api-client-ts/model/templateVariablesDTO';
import { CrTemplateCustomizationComponent } from './cr-template-customization.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatDialog, MatDialogModule, MatExpansionModule, MatExpansionPanel, MatExpansionPanelTitle, MatOptionModule, MatSelectModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '@app/shared/_pipes/safe-html.pipe';
import { BlockUIModule } from 'ng-block-ui';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CreativeControllerService, DashboardControllerService } from '@revxui/api-client-ts';
import { CreativeTemplatesControllerService } from '@revxui/api-client-ts';
import { CreativeTemplateThemesControllerService } from '@revxui/api-client-ts';
import { CreativeTemplateVariablesControllerService } from '@revxui/api-client-ts';
import { StrategyControllerService } from '@revxui/api-client-ts';
import { of } from 'rxjs';
import * as STUB from '@app/shared/StubClasses';
import { delay } from 'rxjs/operators';
import { SimpleChange } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreativeEditComponent } from '../../_components/creative-edit/creative-edit.component';
export class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of({action: true})
    };
  }
}
describe('CrTemplateCustomizationComponent', () => {
  let component: CrTemplateCustomizationComponent;
  let fixture: ComponentFixture<CrTemplateCustomizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SafeHtmlPipe, CrTemplateCustomizationComponent],
      imports: [ColorPickerModule, MatSelectModule, MatOptionModule, FormsModule, MatDialogModule, RouterTestingModule,
         BlockUIModule.forRoot(), HttpClientTestingModule, MatExpansionModule, BrowserAnimationsModule],
      providers: [CreativeControllerService, StrategyControllerService, CreativeTemplatesControllerService,{ provide: MatDialog, useClass: MatDialogMock },
        CreativeTemplateVariablesControllerService, CreativeTemplateThemesControllerService, CrTemplateCustomizationComponent,CreativeEditComponent,
        { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrTemplateCustomizationComponent);
    component = fixture.componentInstance;
    component.crBasicDetails= {advertiserId: 1};
    fixture.componentInstance.ngOnInit();
    component.selectedTemplates = [
      {
        hasOverlay: false,
        height: 55,
        htmlContent: 'string',
        isActive: false,
        isDynamic: false,
        macros: 'string',
        slots: 2,
        templateId: 122,
        templateName: 'string',
        templateVariables: 'string',
        width: 100,

      }
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test getTemplateVariables', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let templateVariableDto: TemplateVariablesDTO = {};
    templateVariableDto.variableKey = 'currencySymbol';
    templateVariableDto.variableType = 'SELECT'
    templateVariableDto.variableTitle = 'Currency';
    component.allTemplateVariables = [templateVariableDto];
    let result = component.getTemplateVariables(['currencySymbol']);
    expect(result).toEqual([{ title: 'Currency', key: 'currencySymbol', type: 'SELECT' }]);
    let result1 = component.getTemplateVariables(['ctaTextColor']);
    expect(result1).toEqual([]);
  });

  it('should test templateInputChange', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    component.templateVariablesValues = {};
    let templateDto: CreativeTemplateDTO = {};
    templateDto.htmlContent = `/*##JSON_START##*/{"height":"300px"}/*##JSON_END##*/`;
    component.selectedTemplates = [templateDto];
    component.templateInputChange('#ffffff', 'ctaBackground');
    expect(component.templateVariablesValues['ctaBackground']).toEqual('#ffffff');
  });

  it('should test changeValueInSelectedTemplates', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let templateDto: CreativeTemplateDTO = {};
    templateDto.htmlContent = `/*##JSON_START##*/{"height":"300px"}/*##JSON_END##*/`;
    component.selectedTemplates = [templateDto];
    component.changeValueInSelectedTemplates('height', '250px');
    const start = component.selectedTemplates[0].htmlContent.indexOf('/*##JSON_START##*/');
    const end = component.selectedTemplates[0].htmlContent.indexOf('/*##JSON_END##*/');
    const styleObj = JSON.parse(component.selectedTemplates[0].htmlContent.substring(start+18, end));
    expect(styleObj['height']).toEqual('250px');
  });

  it('should test themeChanged', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let templateTheme: TemplateThemeDTO = {};
    templateTheme.themeName = 'Test';
    templateTheme.styleJson = `{"height":"250px"}`;
    templateTheme.id = 1;
    component.allTemplateThemes = [templateTheme];
    component.templateVariablesValues = {};
    let templateDto: CreativeTemplateDTO = {};
    templateDto.htmlContent = `/*##JSON_START##*/{"height":"300px"}/*##JSON_END##*/`;
    component.selectedTemplates = [templateDto];
    component.themeChanged({id:1,value:1});
    expect(component.themeSelected).toEqual(1);
  });

  it('should test themeActionChanged', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    component.allTemplateThemes=[{id:2,themeName:'Test'}];
    component.themeSelected = 2;
    // component.themeActionChanged({id:1,value:'save'});
    expect(component.themeName).toEqual('');
    expect(component.themeAction).toEqual('save');
    // component.themeActionChanged({id:2, value:'update'});
    expect(component.themeAction).toEqual('update');
    expect(component.themeName).toEqual('Test');
  });

  it('should test updateSaveTemplateTheme', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    component.themeName = 'Test';
    component.crBasicDetails = {};
    component.crBasicDetails.advertiserId = 1;
    component.templateVariablesValues = `{"height":"250px"}`;
    const calledService: CreativeService = TestBed.get(CreativeService);
    let dummyResp1 = {
      respObject: {}
    }
    let spy = spyOn(calledService, 'saveTemplateTheme').and.returnValue(of(dummyResp1).pipe(delay(1)));
    component.themeAction='save';
    // component.updateSaveTemplateTheme();
    expect(spy).toHaveBeenCalledTimes(1);
    component.themeSelected = 'Test';
    let templateTheme: TemplateThemeDTO = {};
    templateTheme.styleJson = `{"height":"250px"}`;
    templateTheme.id=1;
    component.allTemplateThemes = [templateTheme];
    component.themeAction='update';
    // component.updateSaveTemplateTheme();
    expect(component.themeName).toEqual('Test');
  });

  it('should test update', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let spy = spyOn(component.syncTemplateCustomization,'emit');
    component.update();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test onGoBackClick', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let spy = spyOn(component.syncTemplateCustomization,'emit');
    component.onGoBackClick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test onContinueClick', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let spy = spyOn(component.syncTemplateCustomization,'emit');
    component.onContinueClick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test openLogoModel', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let spy = spyOn(component.modal,'open').and.callThrough();
    component.crBasicDetails = {};
    component.crBasicDetails.advertiserId = 1;
    // component.openLogoModel();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test ngOnChanges', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    let selectedTemplates: SimpleChange = new SimpleChange(undefined,undefined,undefined);
    let temp: CreativeTemplateDTO={};
    temp.templateVariables=`{"height":"50px"}`;
    temp.htmlContent = `/*##JSON_START##*/{"height":"50px",//"width":"100px"
          }/*##JSON_END##*/`;
    selectedTemplates['selectedTemplates']={};
    component.selectedTemplates=[temp];
    let templateVariable: TemplateVariablesDTO={};
    templateVariable.variableKey='height';
    component.allTemplateVariables = [templateVariable];
    selectedTemplates['selectedTemplates'].firstChange=true;
    selectedTemplates['selectedTemplates'].previousValue=undefined;
    component.templateVariables=[];
    component.ngOnChanges(selectedTemplates);
    expect(component.templateVariables.length).toEqual(1);
    let currencyList: SimpleChange = new SimpleChange(undefined,undefined,undefined);
    currencyList['currencyList']={};
    // component.currencyList=[{id:1, value:"INR"}];
    component.ngOnChanges(currencyList);
    // expect(component.currencyList).toEqual([{id:1,value:"INR"}]);
  });

  it('should test cancelSaveTemplateTheme', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    // component.cancelSaveTemplateTheme();
    expect(component.themeAction).toEqual(undefined);
  });

  it('should test currencyChange', () => {
    const component: CrTemplateCustomizationComponent = TestBed.get(CrTemplateCustomizationComponent);
    // component.currencyChange({id:1,value:'INR'});
    expect(component.currencyValue).toEqual('INR');
  });


});
