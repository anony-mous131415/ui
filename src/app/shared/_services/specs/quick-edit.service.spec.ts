import { TestBed } from '@angular/core/testing';
import { QuickEditService } from '../quick-edit.service';
import { DashboardControllerService, StrategyControllerService } from '@revxui/api-client-ts';
import * as STUB from '@app/shared/StubClasses';


describe('QuickEditService', () => {
    beforeEach(() => TestBed.configureTestingModule({

        providers: [
            { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
            { provide: StrategyControllerService, useClass: STUB.StrategyControllerService_stub },
        ],
    }));

    it('should be created', () => {
        const service: QuickEditService = TestBed.get(QuickEditService);
        expect(service).toBeTruthy();
    });


    it('should test api calls', () => {
        const service: QuickEditService = TestBed.get(QuickEditService);
        const calledService: StrategyControllerService = TestBed.get(StrategyControllerService);

        let spy1 = spyOn(calledService, 'getStrategyQuickEditDetailsUsingGET');
        service.getQuickEditDetails(STUB.strategyDto.id);
        expect(spy1).toHaveBeenCalledTimes(1);

        let spy2 = spyOn(calledService, 'saveStrategyQuickEditDetailsUsingPOST');
        service.updateQuickEditDetails(STUB.strategyDto.id, {});
        expect(spy2).toHaveBeenCalledTimes(1);
    });

});
