import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as STUB from '@app/shared/StubClasses';
import { DashboardControllerService, ReportingControllerService } from '@revxui/api-client-ts';
import { ELEMENT_TYPE, ReportBuilderService } from '../report-builder.service';
describe('ReportBuilderService', () => {

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            HttpClientTestingModule,
        ],

        schemas: [NO_ERRORS_SCHEMA],
        providers: [{ provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub }, ReportingControllerService],
    }));

    it('should be created', () => {
        const service: ReportBuilderService = TestBed.get(ReportBuilderService);
        expect(service).toBeTruthy();
    });

    it('should test getConfig', () => {
        const spy = spyOn(TestBed.get(ReportingControllerService),'reportConfigUsingGET');
        const component = TestBed.get(ReportBuilderService);
        component.getConfig();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should test buildReportParams', () => {

    });

    it('should test buildOptionsMap', () => {

    });

    it('should test getInitValueForElement', () => {
        const service = TestBed.get(ReportBuilderService);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.DATE_RANGE})).toEqual({});
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.INTERVAL})).toEqual(null);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.SINGLE_SELECT})).toEqual(null);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.INPUT_NUMBER})).toEqual(null);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.INPUT_TEXT})).toEqual(null);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.RADIO})).toEqual(null);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.CHECKBOX})).toEqual([]);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.MULTI_SELECT})).toEqual([]);
        expect(service.getInitValueForElement({type: ELEMENT_TYPE.ENTITY_SELECTOR}).l1_object.set.size).toEqual(0);
        expect(service.getInitValueForElement({type: 'default'})).toEqual(null);
    });

    it('should test getOptions', () => {
        const component = TestBed.get(ReportBuilderService);
        const spy = spyOn(component.onGetOptions,'next');
        component.getOptions('test');
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should test setOptions', () => {
        const component = TestBed.get(ReportBuilderService);
        const spy = spyOn(component,'formatOptionsForKey');
        component.setOptions('test',[]);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should test getEntityOptions', () => {
        const component = TestBed.get(ReportBuilderService);
        const spy = spyOn(TestBed.get(DashboardControllerService),'getDictionaryUsingPOST');
        component.getEntityOptions({source: {entity: 'test'}});
        expect(spy).toHaveBeenCalledWith('test');
    });

    it('should test actionChanged', () => {
        const service = TestBed.get(ReportBuilderService);
        const spy = spyOn(service.onActionChanged,'next');
        service.optionsMap['testChild']=[{id:1,isSelected: false}];
        service.actionChanged({id: 'select_all', child: 'testChild'},{checked: true});
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should test getValueMap', () => {
        const component = TestBed.get(ReportBuilderService);
        component.valueMap['test'] = 'Test';
        expect(component.getValueMap()['test']).toEqual('Test');
    });

    it('should test formatOptionsForKey', () => {
        const service = TestBed.get(ReportBuilderService);
        service.optionsMap['test'] = [];
        service.valueMap['test'] = [];
        service.formatOptionsForKey('test',[{id: 1, name:'test', isSelected: true}, {id: 2, name: 'test2', isSelected: false}]);
        expect(service.valueMap['test'].length).toEqual(1);
    });

    it('should test formatEntityOptions', () => {
        const service = TestBed.get(ReportBuilderService);
        service.valueMap[1] = [];
        const result = service.formatEntityOptions({respObject: {data: [{id:1, name: 'test1'}, {id: 2, name: 'test2'}]}},{id: 1});
        expect(result.length).toEqual(2);
    });

    it('should test getDateRange', () => {
        
    });

    it('should test getInterval', () => {
        const service = TestBed.get(ReportBuilderService);
        service.valueMap['key'] = {};
        service.valueMap['key'].interval = 'hourly';
        expect(service.getInterval('key')).toEqual('hourly');
    });

    it('should test setInterval', () => {
        const service = TestBed.get(ReportBuilderService);
        service.valueMap['key'] = {};
        service.setInterval('hourly', 'key');
        expect(service.valueMap['key'].interval).toEqual('hourly');
    });

    it('should test setDuration', () => {
        const service = TestBed.get(ReportBuilderService);
        service.valueMap['date_range'] = {};
        let now = new Date();
        //when date is today or yesterday
        service.setDuration([now,now],'date_range');
        expect(service.valueMap['date_range'].end_timestamp).toEqual(null);
        //when not today or yesterday
        let notNow = new Date(now.getFullYear(),now.getMonth(),now.getDay()-5);
        service.setDuration([notNow,notNow],'date_range');
        expect(service.valueMap['date_range'].end_timestamp).toEqual(service.getEpoch(notNow)+86400);
    });

    it('should test getEpoch', () => {
        const service = TestBed.get(ReportBuilderService);
        let dateInput = new Date();
        let utcEpoch_of_dateInput = Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()) / 1000;
        let result = service.getEpoch(dateInput);
        expect(result).toEqual(utcEpoch_of_dateInput);
    });

    it('should test isYesterdayOrToday', () => {
        const service: ReportBuilderService = TestBed.get(ReportBuilderService);
        //today
        let now = new Date();
        let utc_epoch_at_12am_of_now = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000;
        let result = service.isYesterdayOrToday(utc_epoch_at_12am_of_now);
        expect(result).toEqual(true);    
        //some random epoch
        result = service.isYesterdayOrToday(1577923200);
        expect(result).toEqual(false);
    });

    it('should test setEntitySelectorResult', () => {
        const service = TestBed.get(ReportBuilderService);
        service.setEntitySelectorResult('key','result');
        expect(service.valueMap['key']).toEqual('result');
    });

    it('should test getEntitySelectorResult', () => {
        const service = TestBed.get(ReportBuilderService);
        service.valueMap['key'] = {};
        expect(service.getEntitySelectorResult('key','object').set.size).toEqual(0);
        service.valueMap['key']['object'] = 'test';
        expect(service.getEntitySelectorResult('key','object')).toEqual('test');
    });

    it('should test getModalEntities', () => {
        const service = TestBed.get(ReportBuilderService);
        service.valueMap['key'] = {};
        expect(service.getModalEntities('key','object').set.size).toEqual(0);
        service.valueMap['key']['object'] = 'test';
        expect(service.getModalEntities('key','object')).toEqual('test');
    });

    it('should test buildEntityFilterRequestObject', () => {
        const service = TestBed.get(ReportBuilderService);
        let obj = {
            "l1_object": { map: new Map<number, boolean>(), set: new Set<any>() },
            "l2_object": { map: new Map<number, boolean>(), set: new Set<any>() },
            "l3_object": { map: new Map<number, boolean>(), set: new Set<any>() }
          }
        let result = service.buildEntityFilterRequestObject(obj,["ADVERTISER","CAMPAIGN","STRATEGY"],[]);
        expect(result.length).toEqual(0);
        obj.l1_object.map[1] = true;
        obj.l2_object.map[6691] = true;
        obj.l3_object.map[15107] = true;
        obj.l1_object.set = new Set([
            {
              "id": 6691,
              "name": "Myntra RT",
              "active": true,
              "isNotSelected": false
            },
            {
              "id": 6006,
              "name": "Myntra",
              "active": false,
              "isNotSelected": false
            },
            {
              "id": 60061,
              "name": "Myntra1",
              "active": false,
              "isNotSelected": true
            }
          ]);
        obj.l2_object.set = new Set([
            {
              "id": 15365,
              "name": "test_campaign",
              "active": false,
              "isNotSelected": false
            },
            {
              "id": 15107,
              "name": "Myntra Andr Dormant 180 Days",
              "active": true,
              "isNotSelected": false
            }
            ,
            {
              "id": 151071,
              "name": "Myntra Andr Dormant 180 Days1",
              "active": true,
              "isNotSelected": true
            }
          ]);
        obj.l3_object.set = new Set([
            {
              "id": 48235,
              "name": "Valids",
              "active": true,
              "isNotSelected": false
            },
            {
              "id": 48219,
              "name": "Test",
              "active": true,
              "isNotSelected": false
            },
            {
              "id": 482191,
              "name": "Test1",
              "active": true,
              "isNotSelected": true
            }
          ]);
        result = service.buildEntityFilterRequestObject(obj,["ADVERTISER","CAMPAIGN","STRATEGY"],[]);
        expect(result.length).toEqual(3);
        obj.l1_object.set = new Set([
            {
              "id": 6691,
              "name": "Myntra RT",
              "active": true,
              "isNotSelected": true
            },
            {
              "id": 6006,
              "name": "Myntra",
              "active": false,
              "isNotSelected": false
            },
            {
              "id": 60061,
              "name": "Myntra1",
              "active": false,
              "isNotSelected": true
            }
          ]);
        obj.l2_object.set = new Set([
            {
              "id": 15365,
              "name": "test_campaign",
              "active": false,
              "isNotSelected": false
            },
            {
              "id": 15107,
              "name": "Myntra Andr Dormant 180 Days",
              "active": true,
              "isNotSelected": true
            }
            ,
            {
              "id": 151071,
              "name": "Myntra Andr Dormant 180 Days1",
              "active": true,
              "isNotSelected": true
            }
          ]);
        obj.l3_object.set = new Set([
            {
              "id": 48235,
              "name": "Valids",
              "active": true,
              "isNotSelected": true
            },
            {
              "id": 48219,
              "name": "Test",
              "active": true,
              "isNotSelected": false
            },
            {
              "id": 482191,
              "name": "Test1",
              "active": true,
              "isNotSelected": true
            }
          ]);
        result = service.buildEntityFilterRequestObject(obj,["ADVERTISER","CAMPAIGN","STRATEGY"],[]);
        expect(result.length).toEqual(3);
    });

    it('should test setResult', () => {
        const component = TestBed.get(ReportBuilderService);
        component.setResult('test');
        expect(component.result).toEqual('test');
    });

    it('should test getResult', () => {
        const component = TestBed.get(ReportBuilderService);
        component.result = 'test';
        expect(component.getResult()).toEqual('test');
    });

    it('should test clearResult', () => {
        const component = TestBed.get(ReportBuilderService);
        component.result = ['test'];
        component.clearResult();
        expect(component.result).toEqual(null);
    });

    it('should test getRequestObject', () => {
        const component = TestBed.get(ReportBuilderService);
        component.request = 'test';
        expect(component.getRequestObject()).toEqual('test');
    });

    it('should test setRequestObject', () => {
        const component = TestBed.get(ReportBuilderService);
        component.setRequestObject('test');
        expect(component.request).toEqual('test');
    });

    it('should test setPageNumber', () => {
        const component = TestBed.get(ReportBuilderService);
        component.setPageNumber(10);
        expect(component.request.page_number).toEqual(10);
    });

    it('should test setPageSize', () => {
        const component = TestBed.get(ReportBuilderService);
        component.setPageSize(10);
        expect(component.request.page_size).toEqual(10);
    });

    it('should test show', () => {
        const spy = spyOn(TestBed.get(ReportingControllerService),'customReportUsingPOST');
        const component = TestBed.get(ReportBuilderService);
        component.show();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should test export', () => {
        const spy = spyOn(TestBed.get(ReportingControllerService),'customReportCSVUsingPOST');
        const component = TestBed.get(ReportBuilderService);
        component.export();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should test setValueMap', () => {
        const service = TestBed.get(ReportBuilderService);
        let map = new Map<string, any> ();
        map['test'] = 'Test';
        service.setValueMap(map);
        expect(service.valueMap['test']).toEqual('Test');
    });

});