import { TestBed } from '@angular/core/testing';

import { MenucrumbsService } from '../menucrumbs.service';
import { DashboardControllerService } from '@revxui/api-client-ts';
import { MenucrumbsComponent } from '../../_directives/menucrumbs/menucrumbs.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatListModule, MatTooltipModule } from '@angular/material';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { inputs } from '@syncfusion/ej2-angular-calendars/src/daterangepicker/daterangepicker.component';
import * as STUB from '@app/shared/StubClasses';



describe('MenucrumbsService', () => {
    //   let DashboardControllerService;
    //   let service: MenucrumbsService;
    //   let privatMethod=new MenucrumbsService(DashboardControllerService);
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },

        ],
        imports: [RouterTestingModule]
        //imports:[RouterTestingModule,MatTooltipModule]
    }));

    it('should be created', () => {
        const service = TestBed.get(MenucrumbsService);
        expect(service).toBeTruthy();
    });


    it("should test Create Menu Crumbs", () => {
        const service = TestBed.get(MenucrumbsService);

        //with DMP
        let result = service.createMenucrumbsObject(true);
        let expected = { title: "Home", href: "/home", entity: "HOME", menu: null };
        expect(result).toBeTruthy();
        expect(result.length).toEqual(6);
        expect(result[0]).toEqual(expected);
        expect(result[4].menu.leftSide.view.length).toEqual(3);
        expect(result[4].menu.rightSide.length).toEqual(3);

        //without DMP
        result = service.createMenucrumbsObject(false);
        expect(result).toBeTruthy();
        expect(result[4].menu.leftSide.view.length).toEqual(2);
        expect(result[4].menu.rightSide.length).toEqual(2);
    });

    it("should test correct api getting called", () => {
        const service = TestBed.get(MenucrumbsService);
        const calledService = TestBed.get(DashboardControllerService);

        //with get
        let spy1 = spyOn(calledService, 'getMenuCrumbsUsingGET');
        service.get();
        expect(spy1).toHaveBeenCalled();

        //with getByName
        let spy2 = spyOn(calledService, 'searchByNameUsingPOST');
        service.getByName('DMP_AUD', 'txt', []);
        expect(spy2).toHaveBeenCalled();

    });



});
