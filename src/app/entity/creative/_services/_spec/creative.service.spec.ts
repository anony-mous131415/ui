import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as STUB from '@app/shared/StubClasses';
import { mock } from '@app/shared/_directives/list/mock';
import { CreativeControllerService, CreativeHtmlMockupDTO, CreativeMockUpsDTO, CreativeTemplatesControllerService, CreativeTemplateThemesControllerService, CreativeTemplateVariablesControllerService, StrategyControllerService } from '@revxui/api-client-ts';
import { CreativeService } from '../creative.service';


describe('CreativeService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [

            HttpClientTestingModule,
        ],

        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            { provide: StrategyControllerService, useClass: STUB.StrategyControllerService_stub },
            CreativeControllerService,
            CreativeTemplatesControllerService, CreativeTemplateVariablesControllerService, CreativeTemplateThemesControllerService
        ],
    }));


    //new-test-cases
    it('should be created', () => {
        const service: CreativeService = TestBed.get(CreativeService);
        expect(service).toBeTruthy();
    });


    it('should test activate and deactivate API getting called', () => {
        const service: CreativeService = TestBed.get(CreativeService);

        const calledService: CreativeControllerService = TestBed.get(CreativeControllerService);

        let spy = spyOn(calledService, 'activateCreativeUsingPOST');
        service.activateCreatives('123,456')
        expect(spy).toHaveBeenCalledTimes(1);

        spy = spyOn(calledService, 'deactivateCreativeUsingPOST');
        service.deactivateCreatives('123,456')
        expect(spy).toHaveBeenCalledTimes(1);
    });


    it('should test getAll and get by id', () => {
        const service: CreativeService = TestBed.get(CreativeService);

        const calledService: CreativeControllerService = TestBed.get(CreativeControllerService);

        let spy = spyOn(calledService, 'getCreativeByIdUsingGET');
        service.getCreative(STUB.creativeDto.id)
        expect(spy).toHaveBeenCalledTimes(1);

        let spy2 = spyOn(calledService, "searchCreativesUsingPOST");
        service.getAllCreatives(1, 10, false, null, null, 'id-')
        expect(spy2).toHaveBeenCalledTimes(1);
    });

    it('should test getPerfData , uploadThirdPartyAdTag', () => {
        const service: CreativeService = TestBed.get(CreativeService);

        const calledService: CreativeControllerService = TestBed.get(CreativeControllerService);

        let spy = spyOn(calledService, 'getPerformanceForCreativeByIdUsingPOST');
        service.getPerfData(STUB.creativeDto.id, {})
        expect(spy).toHaveBeenCalledTimes(1);

        let spy2 = spyOn(calledService, "getAdTagCreativeUsingPOST");
        service.uploadThirdPartyAdTag({})
        expect(spy2).toHaveBeenCalledTimes(1);
    });



    it('should test generateRawCreatives , saveCreatives , updateCreative ,associateStrategies', () => {
        const service: CreativeService = TestBed.get(CreativeService);

        const calledService: CreativeControllerService = TestBed.get(CreativeControllerService);

        let spy = spyOn(calledService, 'createMockupsUsingPOST');
        service.generateRawCreatives({})
        expect(spy).toHaveBeenCalledTimes(1);

        let spy2 = spyOn(calledService, "createCreativeUsingPOST");
        service.saveCreatives([STUB.creativeDto])
        expect(spy2).toHaveBeenCalledTimes(1);

        let spy3 = spyOn(calledService, "updateCreativeUsingPOST");
        service.updateCreative(STUB.creativeDto)
        expect(spy3).toHaveBeenCalledTimes(1);

        const calledService2: StrategyControllerService = TestBed.get(StrategyControllerService);
        let spy4 = spyOn(calledService2, 'associateCreativesWithStrategiesUsingPOST');
        service.associateStrategies();
        expect(spy4).toHaveBeenCalledTimes(1);
        service.uploadFiles(null);
    });

    it('should test getCreativeTemplates, getCreativeTemplateVariables', () => {
        const service: CreativeService = TestBed.get(CreativeService);
        const calledService: CreativeTemplatesControllerService = TestBed.get(CreativeTemplatesControllerService);
        const calledService2: CreativeTemplateVariablesControllerService = TestBed.get(CreativeTemplateVariablesControllerService);
        let spy = spyOn(calledService,'getCreativeTemplatesUsingGET');
        // service.getCreativeTemplates(false,1,10,undefined,2);
        expect(spy).toHaveBeenCalledTimes(1);

        let spy1= spyOn(calledService2,'getTemplateVariablesUsingGET');
        service.getCreativeTemplateVariables();
        expect(spy1).toHaveBeenCalledTimes(1);
    });

    it('should test saveProductImages, createHtmlMockupsUsingPOST', () => {
        const service: CreativeService = TestBed.get(CreativeService);
        const calledService: CreativeTemplatesControllerService = TestBed.get(CreativeTemplatesControllerService);
        let spy = spyOn(calledService,'saveProductImagesUsingPOST');
        let mockupDto: CreativeMockUpsDTO = {};
        service.saveProductImages(mockupDto);
        expect(spy).toHaveBeenCalledTimes(1);
        let mockupDto1: CreativeHtmlMockupDTO = {};
        const calledService1: CreativeControllerService = TestBed.get(CreativeControllerService);
        let spy1 = spyOn(calledService1,'createHtmlMockupsUsingPOST');
        service.createHtmlMockupsUsingPOST(mockupDto1);
        expect(spy1).toHaveBeenCalledTimes(1);
    });

    it('should test getTemplateThemesUsingGET, updateTemplateTheme, saveTemplateTheme', () => {
        const service: CreativeService = TestBed.get(CreativeService);
        const calledService: CreativeTemplateThemesControllerService = TestBed.get(CreativeTemplateThemesControllerService);
        let spy = spyOn(calledService,'getTemplateThemesUsingGET');
        service.getTemplateThemesUsingGET(6543);
        expect(spy).toHaveBeenCalledTimes(1);
        let spy1 = spyOn(calledService,'updateTemplateThemeUsingPOST');
        let themeDto = {};
        service.updateTemplateTheme(1,themeDto);
        expect(spy1).toHaveBeenCalledTimes(1);
        let spy2 = spyOn(calledService, 'createTemplateThemeUsingPOST');
        service.saveTemplateTheme(themeDto);
        expect(spy2).toHaveBeenCalledTimes(1);
    });

    it('should test getTemplatesMetadata', () => {
        const service: CreativeService = TestBed.get(CreativeService);
        const calledService: CreativeTemplatesControllerService = TestBed.get(CreativeTemplatesControllerService);
        let spy = spyOn(calledService,'getTemplatesMetadataUsingGET');
        service.getTemplatesMetadata(false);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
