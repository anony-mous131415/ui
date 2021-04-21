import { NoopAnimationPlayer } from '@angular/animations';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatOptionModule, MatPaginator, MatPaginatorIntl, MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { SafeHtmlPipe } from '@app/shared/_pipes/safe-html.pipe';
import { CreativeControllerService, CreativeTemplateDTO, CreativeTemplatesControllerService, CreativeTemplateThemesControllerService, CreativeTemplateVariablesControllerService, DashboardControllerService, StrategyControllerService } from '@revxui/api-client-ts';
import { BlockUIModule } from 'ng-block-ui';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CrDropDownComponent } from '../cr-drop-down/cr-drop-down.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CrTemplateSelectionComponent } from './cr-template-selection.component';
import { of, Subject } from 'rxjs';
import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { delay } from 'rxjs/operators';
import { CreativeService } from '../../_services/creative.service';

describe('CrTemplateSelectionComponent', () => {
  let component: CrTemplateSelectionComponent;
  let fixture: ComponentFixture<CrTemplateSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrTemplateSelectionComponent,CrDropDownComponent, SafeHtmlPipe ],
      imports: [MatSelectModule, MatOptionModule, FormsModule,ReactiveFormsModule, NgxMatSelectSearchModule, 
        NoopAnimationsModule,MatTableModule, MatSortModule,
        RouterTestingModule ,MatDialogModule, MatPaginatorModule ,BrowserAnimationsModule, BlockUIModule.forRoot()],
      providers: [ HttpClient, HttpHandler, CreativeControllerService, StrategyControllerService, CreativeTemplatesControllerService, 
        CreativeTemplateVariablesControllerService, CreativeTemplateThemesControllerService, DashboardControllerService, CrTemplateSelectionComponent,
        MatPaginator ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrTemplateSelectionComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngOnInit();
    component.slots = 4;
    component.templates = [];
    component.selectedTemplates = [];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test valChange', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    const template: CreativeTemplateDTO = {};
    template.height = 120;
    template.width = 600;
    template.slots = 4;
    template.size = '120x600';
    template.hasOverlay = true;
    component.templates = [template];
    component.filteredTemplates = [template];
    component.valchange([{ id: 2 , name: '120x600', height: 120, width: 600}],'size');
    expect(component.filteredTemplates.length).toEqual(1);
    component.valchange([{ id: 2 , name: '950x90', height: 950, width: 90}],'size');
    expect(component.filteredTemplates.length).toEqual(0);
    component.sizeSelectValue=[];
    component.filteredTemplates = [template];
    component.valchange([{id: 4, name:4}],'slots');
    expect(component.filteredTemplates.length).toEqual(1);
    component.valchange([{id: 1, name:2}],'slots');
    expect(component.filteredTemplates.length).toEqual(0);
    component.slotsSelectValue=[];
    component.filteredTemplates = [template];
    component.valchange([{ id: 1 , name: 'No offer', value: true}],'preview');
    expect(component.filteredTemplates.length).toEqual(1);
    component.valchange([{ id: 1 , name: 'With offer', value: false}],'preview');
    expect(component.filteredTemplates.length).toEqual(0);
  });

  it('should test toggleSelection', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    const template: CreativeTemplateDTO = {};
    template.height = 120;
    template.width = 600;
    template.slots = 4;
    template.hasOverlay = true;
    component.templates = [template];
    component.selectedTemplates = [];
    let result = component.toggleSelection(template);
    expect(component.selectedTemplates.length).toEqual(1);
    result = component.toggleSelection(template);
    expect(component.selectedTemplates.length).toEqual(0);
  });

  it('should test onGoBackClick', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    let spy = spyOn(component.syncTemplateSelection,'emit');
    component.onGoBackClick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test onContinueClick', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    let spy = spyOn(component.syncTemplateSelection,'emit');
    component.onContinueClick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should test showSelectedTemplatesClickHandler', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    component.showAllTemplates = false;
    component.showSelectedTemplatesClickHandler();
    expect(component.showAllTemplates).toEqual(false);
    component.showAllTemplates = true;
    component.showSelectedTemplatesClickHandler();
    expect(component.showAllTemplates).toEqual(false);
  });

  it('should test allTemplatesClickHandler', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    component.allTemplatesClickHandler();
    component.showAllTemplates = false;
    component.allTemplatesClickHandler();
    expect(component.showAllTemplates).toEqual(true);
  });

  it('should test clearSelections', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    const template: CreativeTemplateDTO = {};
    template.height = 120;
    template.width = 600;
    template.slots = 4;
    template.hasOverlay = true;
    component.selectedTemplates=[template];
    component.clearSelections();
    expect(component.selectedTemplates.length).toEqual(0);
  });

  it('should test setSizeFilter', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    component.sizeFilter = ['100x100','100x100',{id:0,name:'All'},'200x200'];
    const template: CreativeTemplateDTO = {};
    template.height = 100;
    template.width = 100;
    template.size='100x100';
    template.slots = 4;
    template.hasOverlay = true;
    component.templates=[template];
    component.setSizeFilter();
    expect(component.sizeFilter.length).toEqual(2);
    component.sizeFilter = [{id:1,name:'100x100',height:100,width:100}];
    component.setSizeFilter();
    expect(component.sizeFilter.length).toEqual(2);
  });

  it('should test setSlotsFilter', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    component.slots = 2;
    component.setSlotsFilter();
    expect(component.slotsFilter).toEqual([{id:1,name:1},{id:2,name:2}]);
  });

  it('should test saveProductImages', () => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    component.uploadedImagesLocations=[{width:100,height:100,size:'100x100'}];
    const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef); 
    component.paginator=new MatPaginator({changes:new Subject(),itemsPerPageLabel:'1',nextPageLabel:'Next',previousPageLabel:'Previous',
      firstPageLabel:'First',lastPageLabel:'Last',getRangeLabel:undefined},changeDetectorRef);
    component.paginator.pageSize = 10;
    component.paginator.pageIndex = 0;
    const calledService: CreativeTemplatesControllerService = TestBed.get(CreativeTemplatesControllerService);
    let dummyResp = {
      respObject: {
        totalNoOfRecords: 1,
        data: [
          {
            "templateId": 4,
            "templateName": "test_template",
            "height": 320,
            "width": 480,
            "size": "480x320",
            "htmlContent": "<!DOCTYPE html>\n<html>\n<head>\n    <title>static Template</title>\n    <style>\n        body {\n            margin: 0;\n            border: 0;\n        }\n        .aoverlay {\n            position: absolute;\n            background-repeat: no-repeat;\n        }\n        .templatelogo {\n            height: 50px;\n            position: absolute;\n            width: 100%\n        }\n        .templatelogo img {\n            position: absolute;\n            left: 5%;\n            margin: auto;\n            top: 0;\n            bottom: 0;\n            max-height: 30px;\n        }\n        a {\n            text-decoration: none;\n        }\n        .cta {\n            width: auto;\n            padding: 5px 20px;\n            text-align: center;\n            position: absolute;\n            right: 5%;\n            bottom: 5%;\n            margin: auto;\n            border-radius: 20px;\n        }\n        .desriptions p{\n            position: absolute;\n        }\n        .overlayclass {\n            position: absolute;\n            top: 0;\n            z-index: 99;\n            visibility: hidden;\n        }\n        .overlayacctive {\n            visibility: visible;\n            z-index: 99999999 !important;\n            position: absolute;\n            top: 0;\n        }\n        .title{\n            font-size: 34px;\n            top: auto;\n            position: absolute;\n            text-align: left;\n            padding: 5px 10px;\n            bottom: 3%;\n            width: 63%;\n        }\n        .aoverlay{\n            background-position: top center;\n            background-size: cover;\n        }\n        @keyframes zoomAni {\n          100%{\n            background-position:0px -300px;\n          }\n        }\n.aoverlay.active {\n  animation: animation 5s;\n  animation-iteration-count: 1;\n}\n@keyframes animation {\n   100%{\n    background-position:0px -150px;\n  }\n}\n.cta.active{\n  -webkit-animation: bounce .5s 6 alternate;\n  -moz-animation: bounce .5s 6 alternate;\n  animation: bounce .5s 6 alternate;\n  /*animation-iteration-count: 3;*/\n}\n@-webkit-keyframes bounce {\n  to { -webkit-transform: scale(1.2); }\n}\n@-moz-keyframes bounce {\n  to { -moz-transform: scale(1.2); }\n}\n@keyframes bounce {\n  to { transform: scale(1.2); }\n}\n    </style>\n</head>\n<body>\n    <div class=\"mainlayout\">\n        <a href=\"\" target=\"_blank\" class=\"aoverlay active\">\n            <div id=\"templatelogo\" class=\"templatelogo\">\n                <img class=\"logoImg\" src='' />\n            </div>\n            <div class=\"desriptions\">\n                <div class=\"title\"></div>\n            </div>\n            <div class=\"cta active\"></div>\n            <div class=\"overlayclass\"></div>\n        </a>\n    </div>\n</body>\n<script>\n    //Tracking URL\n    window.tracking_url = /*####TRACKER_MACRO_START####*/\"templateLinkValidate?name=center_focused_3label&url=\"/*####TRACKER_MACRO_END####*/;\n    //Static variables\n    window.static = \n    /*##JSON_START##*/{\n        \"ctaText\": \"Shop Now\",\n        \"ctaBgColor\": \"#F13AB1\",\n        \"ctaTextColor\": \"#fff\",\n        \"ctaFontSize\": 20,\n        \"logoBgColor\": \"#fff\",\n        \"titleTextColor\": \"#ffffff\",\n        \"priceTextColor\": \"#FD913C\",\n        \"logoLink\": \"https://pngimg.com/uploads/facebook_logos/facebook_logos_PNG19754.png\",\n        \"defaultLink\": \"https://cdn.atomex.net/static/creatives/Max/320x480.jpg\",\n        \"titleFontSize\": \"17\",\n        \"priceFontSize\": \"22\",\n        \"fontFamily\": \"Arial, Helvetica, sans-serif\",\n        \"androidStoreLink\": \"https://play.google.com/store/apps/details?id=com.applications.max&hl=en\",\n        \"iosStoreLink\": \"https://itunes.apple.com/in/app/max-fashion/id1180884624?mt=8\",\n        \"webLink\": \"https://www.maxfashion.in/\",\n        \"hasOverlay\": false,\n        \"overlayDuration\": 2000,\n        \"num_overlay\": 11,\n        \"overlayLink\": \"https://cdn.atomex.net/static/creatives/Max/overlay/320x480.jpg\",\n        \"templateImages\": [\"https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW58ZW58MHx8MHw%3D&ixlib=rb-1.2.1&w=1000&q=80\"],\n        \"templateBorder\": \"#000\",\n        \"titleText\": \"UPTO 70% OFF\",\n    } /*##JSON_END##*/;\n    window.basicVer={\n        width:480,\n        height:320\n    }\n    window.home_url = static.webLink;\n    window.isiOS = navigator.userAgent.match('iPad') || navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPod');\n    window.isAndroid = navigator.userAgent.match('Android');\n    if (isAndroid) {\n        var storelink = static.androidStoreLink;\n        var mmplink = \"|CLICK_URL|\";\n    } else\n        if (isiOS) {\n            var storelink = static.iosStoreLink;\n            var mmplink = \"|CLICK_URL|\";\n        } else {\n            var storelink = home_url;\n            var mmplink = \"\";\n        }\n    window.mmplink = mmplink;\n    if (mmplink === \"\") {\n        mmplink = home_url;\n    }\n    var defaultlink = tracking_url + encodeURIComponent(storelink);\n    window.addEventListener('load', function () {\n        $(\".mainlayout\").style.height = basicVer.height - 2 + \"px\";\n        $(\".aoverlay\").style.height = basicVer.height - 2 + \"px\";\n        $(\".mainlayout\").style.width = basicVer.width - 2 + \"px\";\n        $(\".aoverlay\").style.width = basicVer.width - 2 + \"px\";\n        $(\".mainlayout\").style.fontFamily = static.fontFamily;\n        $(\".aoverlay\").style.backgroundImage = `url('${static.templateImages[0]}')`;\n        $(\".mainlayout\").style.border = `1px solid ${static.templateBorder}`;\n        $(\".aoverlay\").href = mmplinkGen(\"\", \"\");\n        $(\".logoImg\").src = static.logoLink;\n        $(\".cta\").innerHTML = static.ctaText;\n        $(\".title\").innerHTML = static.titleText;\n        // $(\".middleText\").innerHTML = static.middleText;\n        // $(\".bottomText\").innerHTML = static.bottomText;\n        styleAdder(\".cta\",\"color\",static.ctaTextColor);\n        styleAdder(\".cta\",\"backgroundColor\",static.ctaBgColor);\n        styleAdder(\".cta\",\"fontSize\",`${static.ctaFontSize}px`);\n        styleAdder(\".title\",\"color\",static.titleTextColor);\n        // styleAdder(\".middleText\",\"color\",static.middleTextColor);\n        // styleAdder(\".bottomText\",\"color\",static.bottomTextColor);\n        styleAdder(\".title\",\"fontSize\",static.titleFontSize);\n        // styleAdder(\".middleText\",\"fontSize\",static.middleFontsize);\n        // styleAdder(\".bottomText\",\"fontSize\",static.bottomFontsize);\n        let i=0;\n        let animate=setInterval(()=>{\n            $(\".aoverlay\").classList.remove(\"active\");\n            $(\".cta\").classList.remove(\"active\");\n            // $(\".aoverlay\").classList.add(\"active\");\n            setTimeout(()=>{\n                 $(\".aoverlay\").classList.add(\"active\");\n                 $(\".cta\").classList.add(\"active\");\n            },1000);\n        },5000);\n        setTimeout(()=>{\n            clearInterval(animate);\n        },30000);\n    });\n    function styleAdder(className,styleAttr,styleValue){\n        $(className).style[styleAttr]=styleValue;\n    }\n    function mmplinkGen(pageLink, pageID) {\n        let tmpmmp = mmplink;\n        if (tmpmmp.includes(\"__ID__\") || tmpmmp.includes(\"__ENCODED_PAGE_LINK__\") || tmpmmp.includes(\"__PAGE_LINK__\")) {\n            if (tmpmmp.indexOf(\"__PAGE_LINK__\") === 0) {\n                tmpmmp = tmpmmp.replace(/__PAGE_LINK__/g, pageLink);\n            } else {\n                tmpmmp = tmpmmp.replace(/__ENCODED_PAGE_LINK__/g, encodeURIComponent(pageLink)).replace(/__PAGE_LINK__/g, encodeURIComponent(pageLink)).replace(/__ID__/g, (pageID));\n            }\n        }\n        return tracking_url + encodeURIComponent(tmpmmp);\n    }\n    function imgExists(url, callback) {\n        var img = new Image();\n        img.onerror = function () {\n            callback(false);\n        }\n        img.onload = function () {\n            callback(true);\n        }\n        img.src = url;\n    }\n    function overlayCheck(exists) {\n        if (exists) {\n            odiv = document.getElementsByClassName(\"overlayclass\")[0];\n            odiv.style.width = basicVer.width - 2 + \"px\";\n            odiv.style.height = basicVer.height - 2 + \"px\";\n            var sid = setInterval(function () {\n                odiv.style.backgroundImage = \"url(\" + static.overlayLink + \")\";\n                odiv.classList.toggle(\"overlayacctive\");\n                if (static.num_overlay == 0) {\n                    clearTimeout(sid);\n                }\n                static.num_overlay = static.num_overlay - 1;\n            }, static.overlayDuration);\n        }\n    }\n    window.addEventListener('load', function () {\n        if (static.hasOverlay) {\n            imgExists(static.overlayLink, overlayCheck);\n        }\n    });\n    function $(selector) {\n        return document.querySelector(selector);\n    }\n</script>\n</html>",
            "templateVariables": "{\n        \"ctaText\": \"Shop Now\",\n        \"ctaBgColor\": \"#F13AB1\",\n        \"ctaTextColor\": \"#fff\",\n        \"ctaFontSize\": 20,\n        \"logoBgColor\": \"#fff\",\n        \"titleTextColor\": \"#ffffff\",\n        \"priceTextColor\": \"#FD913C\",\n        \"logoLink\": \"https://pngimg.com/uploads/facebook_logos/facebook_logos_PNG19754.png\",\n        \"defaultLink\": \"https://cdn.atomex.net/static/creatives/Max/320x480.jpg\",\n        \"titleFontSize\": \"17\",\n        \"priceFontSize\": \"22\",\n        \"fontFamily\": \"Arial, Helvetica, sans-serif\",\n        \"androidStoreLink\": \"https://play.google.com/store/apps/details?id=com.applications.max&hl=en\",\n        \"iosStoreLink\": \"https://itunes.apple.com/in/app/max-fashion/id1180884624?mt=8\",\n        \"webLink\": \"https://www.maxfashion.in/\",\n        \"hasOverlay\": false,\n        \"overlayDuration\": 2000,\n        \"num_overlay\": 11,\n        \"overlayLink\": \"https://cdn.atomex.net/static/creatives/Max/overlay/320x480.jpg\",\n        \"templateImages\": [\"https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW58ZW58MHx8MHw%3D&ixlib=rb-1.2.1&w=1000&q=80\"],\n        \"templateBorder\": \"#000\",\n        \"titleText\": \"UPTO 70% OFF\",\n    }",
            "macros": null,
            "slots": 1,
            "isDynamic": false,
            "hasOverlay": false,
            "isActive": true
          }
        ]
      },
      type:null
    }
    let spy = spyOn(calledService,'getCreativeTemplatesUsingGET').and.returnValue(of(dummyResp).pipe(delay(1)));
    component.saveProductImages();
    expect(component.slotsFilter.length).toEqual(1);
  });

  it('should test ngOnChanges', fakeAsync(() => {
    const component: CrTemplateSelectionComponent = TestBed.get(CrTemplateSelectionComponent);
    let crBasicDetails: SimpleChange = new SimpleChange(undefined,undefined,undefined);
    crBasicDetails['crBasicDetails'] = {};
    component.isDcoFlow = true;
    const calledService: CreativeService = TestBed.get(CreativeService);
    let dummyResp = {
      respObject: {
        slots: [1,2,3],
        templateSizes: ['100x100','200x200']
      },
      type: null
    }
    let spy = spyOn(calledService,'getTemplatesMetadata').and.returnValue(of(dummyResp));
    component.ngOnChanges(crBasicDetails);
    expect(spy).toHaveBeenCalledTimes(1);
  }));
});
