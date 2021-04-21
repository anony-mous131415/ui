import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatCheckboxModule, MatDialogRef, MatMenuModule, MatTooltipModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule, MAT_DIALOG_DATA, MatRadioModule, MatFormFieldControl, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkStrategyControllerService, DashboardControllerService, StrategyControllerService, AudienceControllerService, AdvertiserControllerService, CatalogControllerService, PixelControllerService, ClickDestinationControllerService, ClickDestination } from '@revxui/api-client-ts';
import { of, Observable } from 'rxjs';
import * as STUB from '@app/shared/StubClasses';

import { FormInputComponent } from '@app/shared/_directives/form-input/form-input.component'

import { CdCreateComponent, InjectedData, ErrorIndicator } from './cd-create.component';
import { CdTextAreaComponent } from '@app/shared/_directives/cd-text-area/cd-text-area.component';
import { DisableDemoDirective } from '@app/shared/_directives/disable-demo/disable-demo.directive';
import { ClickDestinationConstants } from '@app/entity/advertiser/_constants/ClickDestinationConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';

const MODE_CREATE = 0;
const MODE_EDIT = 1;

const CLICK_RADIO_ID = ClickDestination.GeneratedUrlTypeEnum.CLICK;
const S2S_RADIO_ID = ClickDestination.GeneratedUrlTypeEnum.S2S;

const CAMP_UA = ClickDestination.CampaignTypeEnum.UA;
const CAMP_RT = ClickDestination.CampaignTypeEnum.RT;


let injectedData: InjectedData = {
    advertiserId: 6804,
    cd: STUB.clickDestDto
}

let testing_click_dest = STUB.clickDestDto;


describe('CdCreateComponent', () => {
    let component: CdCreateComponent;
    let fixture: ComponentFixture<CdCreateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CdCreateComponent, DisableDemoDirective, FormInputComponent, CdTextAreaComponent],
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
                MatRadioModule,
                MatTooltipModule,
                MatMenuModule,
                MatCheckboxModule,
                MatInputModule
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: injectedData },
                { provide: MatDialogRef, useValue: { close: (dialogResult: any) => { } } },
                { provide: ClickDestinationControllerService, useClass: STUB.ClickDestinationControllerService_stub },
                { provide: PixelControllerService, useClass: STUB.PixelControllerService_stub },
                { provide: CatalogControllerService, useClass: STUB.CatalogControllerService_stub },
                { provide: AdvertiserControllerService, useClass: STUB.AdvertiserControllerService_stub },
                HttpClient, HttpHandler,
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CdCreateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });



    //REVX-764 : UTs

    it('should test isPartToBefilled', () => {
        let url = '';
        let result = component.isPartToBefilled(url);
        expect(result).toBe(false);

        url = 'not to be filled';
        result = component.isPartToBefilled(url);
        expect(result).toBe(false);

        url = 'fill_advertiser_related_link';
        result = component.isPartToBefilled(url);
        expect(result).toBe(true);
    });


    it('should test userHasFilledUrl', () => {
        let input = '';
        let apiString = '';
        let result = component.userHasFilledUrl(input, apiString);
        expect(result).toBe(true);

        input = 'abc';
        apiString = 'abc';
        result = component.userHasFilledUrl(input, apiString);
        expect(result).toBe(false);

        input = 'xyz';
        apiString = 'abc';
        result = component.userHasFilledUrl(input, apiString);
        expect(result).toBe(true);
    });


    it('should test validateAdvertiserPackage', () => {
        let structureUrl = 'fill_advertiser_related_link';
        let inputUrl = '';
        let result = component.validateAdvertiserPackage(structureUrl, inputUrl);
        expect(result).toBe(false);

        structureUrl = 'fill_advertiser_related_link';
        inputUrl = 'fill_advertiser_related_link';
        result = component.validateAdvertiserPackage(structureUrl, inputUrl);
        expect(result).toBe(true);

        structureUrl = 'not to be filled';
        inputUrl = 'abc';
        result = component.validateAdvertiserPackage(structureUrl, inputUrl);
        expect(result).toBe(false);
    });


    it('should test checkAdvPkgOrWhiteSpacesError', () => {
        let androidUrl: string = '';
        let iosUrl: string = '';
        let errAndroid: ErrorIndicator = {
            hasInfo: false,
            hasError: false,
            errOrInfoMsg: ''
        };
        let errIos: ErrorIndicator = {
            hasInfo: false,
            hasError: false,
            errOrInfoMsg: ''
        };
        let isFallBack: boolean = false;
        let fbUrl: string = '';
        let errFBUrl: ErrorIndicator = {
            hasInfo: false,
            hasError: false,
            errOrInfoMsg: ''
        };


        component.checkAdvPkgOrWhiteSpacesError(androidUrl, iosUrl, errAndroid, errIos, isFallBack, fbUrl, errFBUrl);
        expect(component.advPkgValidated).toBe(true);
        expect(component.mandatoryValidated).toBe(true);


        androidUrl = '';
        iosUrl = '';
        errAndroid = {
            hasInfo: false,
            hasError: false,
            errOrInfoMsg: ''
        };
        errIos = {
            hasInfo: false,
            hasError: false,
            errOrInfoMsg: ''
        };
        isFallBack = true;
        fbUrl = 'fburl';
        errFBUrl = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES
        };


        component.checkAdvPkgOrWhiteSpacesError(androidUrl, iosUrl, errAndroid, errIos, isFallBack, fbUrl, errFBUrl);
        expect(component.advPkgValidated).toBe(true);
        expect(component.mandatoryValidated).toBe(false);


        androidUrl = 'url';
        iosUrl = 'url';
        errAndroid = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.ADVERTISER_PACKAGE
        };
        errIos = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.ADVERTISER_PACKAGE
        };
        isFallBack = true;
        fbUrl = 'fburl';
        errFBUrl = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES
        };


        component.checkAdvPkgOrWhiteSpacesError(androidUrl, iosUrl, errAndroid, errIos, isFallBack, fbUrl, errFBUrl);
        expect(component.advPkgValidated).toBe(false);
        expect(component.mandatoryValidated).toBe(false);


        androidUrl = 'url';
        iosUrl = 'url';
        errAndroid = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES
        };
        errIos = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES
        };
        isFallBack = true;
        fbUrl = 'fburl';
        errFBUrl = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES
        };


        component.mandatoryValidated = false;
        component.checkAdvPkgOrWhiteSpacesError(androidUrl, iosUrl, errAndroid, errIos, isFallBack, fbUrl, errFBUrl);
        expect(component.advPkgValidated).toBe(true);
        expect(component.mandatoryValidated).toBe(false);


        androidUrl = 'url';
        iosUrl = 'url';
        errAndroid = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.INPUT_SAME_AS_API_STRING
        };
        errIos = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.INPUT_SAME_AS_API_STRING
        };
        isFallBack = true;
        fbUrl = 'fburl';
        errFBUrl = {
            hasInfo: false,
            hasError: true,
            errOrInfoMsg: ''
        };


        component.mandatoryValidated = true;
        component.checkAdvPkgOrWhiteSpacesError(androidUrl, iosUrl, errAndroid, errIos, isFallBack, fbUrl, errFBUrl);
        expect(component.advPkgValidated).toBe(true);
        expect(component.mandatoryValidated).toBe(false);

    });




    it('should test validateMandatory', () => {

        component.injectedData = null;
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);

        component.injectedData = {
            cd: null,
            advertiserId: 1
        };
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);


        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.dco = null
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.dco = true
        component.injectedData.cd.generatedUrlType = CLICK_RADIO_ID
        component.validateMandatory();
        expect(component.mandatoryValidated).toBeDefined();

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.dco = false
        component.injectedData.cd.generatedUrlType = null
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);


        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.campaignType = null
        component.validateMandatory();
        expect(component.mandatoryValidated).toBeDefined();

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.campaignType = "UA"
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.campaignType = "RT"
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);


        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.generatedUrlType = CLICK_RADIO_ID;
        component.currentUrls = {
            androidClick: '',
            androidS2S: '',
            iosClick: '',
            iosS2S: ''
        }
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.generatedUrlType = CLICK_RADIO_ID;
        component.currentUrls = {
            androidClick: 'c',
            androidS2S: 's',
            iosClick: 'c',
            iosS2S: 's'
        }
        component.validateMandatory();
        expect(component.mandatoryValidated).toBeDefined();

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        };
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.currentUrls = {
            androidClick: 'c',
            androidS2S: '',
            iosClick: 'c',
            iosS2S: ''
        }
        component.validateMandatory();
        expect(component.mandatoryValidated).toBe(false);

    });



    it('should test validateSingleAutoFilledUrl', () => {
        let inputUrlToBeValidated = ' ';
        let structuralUrl = '';
        let result = component.validateSingleAutoFilledUrl(inputUrlToBeValidated, structuralUrl);
        let expected: ErrorIndicator = {
            hasError: true,
            hasInfo: false,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.HAS_WHITE_SPACES
        };
        expect(result).toEqual(expected);

        inputUrlToBeValidated = '';
        structuralUrl = '';
        result = component.validateSingleAutoFilledUrl(inputUrlToBeValidated, structuralUrl);
        expected = {
            hasError: false,
            hasInfo: false,
            errOrInfoMsg: null
        };
        expect(result).toEqual(expected);


        inputUrlToBeValidated = 'fill_advertiser_related_link&pqr';
        structuralUrl = 'fill_advertiser_related_link&pqr';
        result = component.validateSingleAutoFilledUrl(inputUrlToBeValidated, structuralUrl);
        expected = {
            hasError: true,
            hasInfo: false,
            errOrInfoMsg: ClickDestinationConstants.VALIDATION_MANDATORY.ADVERTISER_PACKAGE
        };
        expect(result).toEqual(expected);


        // inputUrlToBeValidated = 'abcd&pqr=xyz';
        // structuralUrl = 'fill_advertiser_related_link&pqr=xyz';
        // result = component.validateSingleAutoFilledUrl(inputUrlToBeValidated, structuralUrl);
        // expected = {
        //     hasError: false,
        //     hasInfo: false,
        //     errOrInfoMsg: null
        // };
        // expect(result).toEqual(expected);


    });


    it('should test getInfoMsgMap', () => {
        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 123
        };
        component.injectedData.cd.generatedUrlType = CLICK_RADIO_ID;
        let result = component.getInfoMsgMap();
        let expected: Map<string, Array<string>> = new Map<string, Array<string>>();
        expect(result).toEqual(expected);
    });



    it('should test validateAutoFilledUrls', () => {
        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 123
        };
        component.injectedData.cd.generatedUrlType = CLICK_RADIO_ID;
        component.validateAutoFilledUrls();
        expect(component.optionalValidated).toEqual(true);


        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 123
        };
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.injectedData.cd.dco = true;
        component.validateAutoFilledUrls();
        expect(component.optionalValidated).toEqual(true);


        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 123
        };
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.injectedData.cd.dco = false;
        component.validateAutoFilledUrls();
        expect(component.optionalValidated).toEqual(true);

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 123
        };
        component.injectedData.cd.generatedUrlType = null;
        component.validateAutoFilledUrls();
        expect(component.optionalValidated).toEqual(true);
    });


    it('should test isRetargetingLHS', () => {
        let urlPart = '';
        let result = component.isRetargetingLHS(urlPart);
        expect(result).toEqual(false);

        urlPart = 'is_retargeting';
        result = component.isRetargetingLHS(urlPart);
        expect(result).toEqual(true);

        urlPart = 'retargeting';
        result = component.isRetargetingLHS(urlPart);
        expect(result).toEqual(true);

        urlPart = 'rtrt';
        result = component.isRetargetingLHS(urlPart);
        expect(result).toEqual(false);
    });


    it('should test prefillPageLinkMacro', () => {
        component.dcoMacros = [];
        component.prefillPageLinkMacro();
        expect(component.currentUrls.iosClick).toEqual('');

        component.mode = MODE_CREATE;
        component.dcoMacros = [
            {
                name: 'page_link',
                macroText: '__PAGE_LINK__'
            }
        ];
        component.prefillPageLinkMacro();
        expect(component.currentUrls.iosClick).toEqual('__PAGE_LINK__');

        component.mode = MODE_CREATE;
        component.dcoMacros = [
            {
                name: 'n',
                macroText: 'mt'
            }
        ];
        component.prefillPageLinkMacro();
        expect(component.currentUrls.iosClick).toEqual(null);
    });


    it('should test callSaveApi', () => {
        component.convertIntoCDObject();

        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        }

        const calledService = TestBed.get(AdvertiserControllerService);
        const spy = spyOn(calledService, 'updateASTUsingPOST');

        component.injectedData.cd.id = null;
        component.callSaveApi();
        expect(spy).toHaveBeenCalledTimes(0);

        component.dismissModal(true);
        component.dismissModal(false);

        component.scrollToError('lol');
        component.scrollToError(null);
    });

    it('should test callSaveApi and setS2SUrls', () => {
        component.onSaveClick();
        component.mandatoryValidated = true;
        component.onSaveClick();
        component.mandatoryValidated = true;
        component.advPkgValidated = true;
        component.onSaveClick();
        component.setS2SUrls(true);
        expect(component.currentUrls).toBeDefined();
        component.setS2SUrls(false);
        expect(component.currentUrls).toBeDefined();
    });


    it('should test resetCurrentUrls', () => {
        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        }
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        let spy = spyOn(component, 'setS2SUrls');
        component.resetCurrentUrls(true, false, null, null);
        expect(spy).toHaveBeenCalledWith(null);
    });


    it('should test resetCurrentUrls else part', () => {
        component.injectedData = {
            cd: STUB.clickDestDto,
            advertiserId: 1
        }

        let spy2 = spyOn(component, 'setS2SUrls');
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.resetCurrentUrls(false, true, null, S2S_RADIO_ID);
        expect(spy2).toHaveBeenCalled();

        spy2 = spyOn(component, 'setClickUrls');
        component.resetCurrentUrls(false, true, null, CLICK_RADIO_ID);
        expect(spy2).toHaveBeenCalled();

    });



    it('should test onDynamicStatusChange', () => {
        let spy = spyOn(component, 'checkMacroListAllowed');
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.onDynamicStatusChange(null, true);
        expect(spy).toHaveBeenCalled();
        expect(component.workInProgress).toEqual(false); 
        let event = {
            preventDefault: function () { }
        }

        // let spy = spyOn(component, 'checkMacroListAllowed');
        // component.injectedData.cd.skadTarget = false;
        // component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        // component.onDynamicStatusChange(event, true);
        // expect(spy).toHaveBeenCalled();
        // expect(component.workInProgress).toEqual(false);

        // component.injectedData.cd.skadTarget = true;
        // component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        // component.onDynamicStatusChange(event, true);
        // expect(spy).toHaveBeenCalledTimes(1);
    });



    it('should test onGenerateRadioChange', () => {
        let spy = spyOn(component, 'checkMacroListAllowed');
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.onGenerateRadioChange(null, true);
        expect(spy).toHaveBeenCalled();
        expect(component.workInProgress).toEqual(false); 
        let event = {
            preventDefault: function () { }
        }
        let spy2 = spyOn(component, 'checkMacroListAllowed');
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.onGenerateRadioChange(event, true);
        expect(spy2).toHaveBeenCalled();
        let spy1 = spyOn(component, 'checkMacroListAllowed');
        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        component.onGenerateRadioChange(event, true);
        expect(spy1).toHaveBeenCalled();
        expect(component.workInProgress).toEqual(false);
    });



    it('should test isInitialChoice', () => {

        component.injectedData.cd.generatedUrlType = CLICK_RADIO_ID;
        let result = component.isInitialChoice(2);
        expect(result).toEqual(false);

        component.injectedData.cd.generatedUrlType = S2S_RADIO_ID;
        result = component.isInitialChoice(2);
        expect(result).toEqual(false);

        component.injectedData.cd.generatedUrlType = null;
        result = component.isInitialChoice(2);
        expect(result).toEqual(true);

        component.injectedData.cd = null;
        result = component.isInitialChoice(1);
        expect(result).toEqual(true);

        result = component.isInitialChoice(3);
    });



    //REV-724 : skad changes UTs below
    it('should test getFooterMessage', () => {
        component.injectedData.cd.skadTarget = true;
        let result = component.getFooterMessage();
        expect(result).toEqual(ClickDestinationConstants.SAVE_BTN_TOOLTIP_SKAD);
        component.injectedData.cd.skadTarget = false;
        result = component.getFooterMessage();
        expect(result).toEqual(ClickDestinationConstants.SAVE_BTN_TOOLTIP);
    });


    it('should test disableFooter', () => {
        component.injectedData.cd.skadTarget = true;
        component.injectedData.cd.dco = null;
        let result = component.disableFooter();
        expect(result).toEqual(true);
    });

    it('should test validateUrlsForSKADFlow', () => {
        component.injectedData.cd.iosImpressionTracker = '';
        component.injectedData.cd.iosCLickUrl = '';
        component.injectedData.cd.iosS2sClickTrackingUrl = '';

        component.validateUrlsForSKADFlow();
        expect(component.mandatoryValidated).toEqual(false);

        component.injectedData.cd.iosImpressionTracker = '1';
        component.injectedData.cd.iosCLickUrl = '1';
        component.injectedData.cd.iosS2sClickTrackingUrl = '1';

        component.mandatoryValidated = true;
        component.validateUrlsForSKADFlow();
        expect(component.mandatoryValidated).toEqual(true);
    });


    it('should test resetAllUrls', () => {
        component.resetAllUrls();
        expect(component.injectedData.cd.webClickUrl).toEqual('');
    });


    it('should test onSkadCbChange', () => {

        let event = {
            checked: true
        }

        component.onSkadCbChange(event as any);
        expect(component.injectedData.cd.campaignType).toEqual("UA");

        event.checked = false;
        component.onSkadCbChange(event as any);
        expect(component.injectedData.cd.campaignType).toEqual(null);
    });



});
