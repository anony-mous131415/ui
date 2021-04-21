import { TestBed } from '@angular/core/testing';
import * as STUB from '@app/shared/StubClasses';
import { AudienceService } from '../audience.service';
import { DashboardControllerService, AudienceControllerService, RuleDTO, AuditControllerService } from '@revxui/api-client-ts';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AudienceConstants } from '../../_constants/AudienceConstants';

const set_of_rules = [
    {
        displayName: "URL",
        fbxName: "url",
        filterType: "TEXT",
        id: 1,
        name: "url",
        ruleOperators: [
            { id: 3, name: "CONTAINS", displayName: "contains", fbxName: "i_contains" },
            { id: 1, name: "STRING_EQUALS", displayName: "is equal to", fbxName: "eq" }
        ],
        ruleValues: [],
        valueType: "STRING",
    },


    {
        displayName: "Channel",
        fbxName: "channel",
        filterType: "OPTIONS",
        id: 2,
        name: "channel",
        ruleOperators: [
            {
                displayName: "is equal to",
                fbxName: "eq",
                id: 1,
                name: "STRING_EQUALS",
            }
        ],
        ruleValues: [
            { value: "m", displayValue: "Mobile web" },
            { value: "d", displayValue: "Desktop" },
            { value: "a", displayValue: "Mobile app" }
        ],
        valueType: "STRING"
    }
];



const rule_dto_with_4_2x2_rules: RuleDTO = {
    negate: false,
    operator: "OR",
    ruleExpressionList: [
        {
            negate: false,
            operator: "AND",
            ruleExpressionList: [
                {
                    negate: false,
                    ruleElement: { filterId: 1, operatorId: 2, value: "v1" },
                    simpleExpr: true,
                },
                {
                    negate: false,
                    ruleElement: { filterId: 3, operatorId: 4, value: "v2" },
                    simpleExpr: true,
                }
            ],
            simpleExpr: false
        },

        {
            negate: false,
            operator: "AND",
            ruleExpressionList: [
                {
                    negate: false,
                    ruleElement: { filterId: 11, operatorId: 12, value: "v3" },
                    simpleExpr: true,
                },
                {
                    negate: false,
                    ruleElement: { filterId: 13, operatorId: 14, value: "v4" },
                    simpleExpr: true,
                }
            ],
            simpleExpr: false

        }],
    simpleExpr: false
};


describe('AudienceService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            { provide: DashboardControllerService, useClass: STUB.DashboardControllerService_stub },
            { provide: AudienceControllerService, useClass: STUB.AudienceControllerService_stub },
            { provide: AuditControllerService, useClass: STUB.AuditControllerService_stub },

        ],
    }));


    it('should be created', () => {
        const service: AudienceService = TestBed.get(AudienceService);
        expect(service).toBeTruthy();
    });

    //new
    it('should test getSimpleRule', () => {
        const service: AudienceService = TestBed.get(AudienceService);

        const simpleRule = {
            filter: 2,
            operator: 3,
            val: 'url-name'
        }

        let result = service.getSimpleRule(simpleRule);
        let expectation = {
            negate: false,
            ruleElement: { filterId: 2, operatorId: 3, value: "url-name" },
            simpleExpr: true
        }
        expect(result).toEqual(expectation);
    });


    it('should test getRuleDtoForOneRule', () => {
        const service: AudienceService = TestBed.get(AudienceService);
        const rcvRule = [
            { filter: 1, operator: 2, val: 'v1' },
            { filter: 3, operator: 4, val: 'v2' },
        ]

        let result = service.getRuleDtoForOneRule(rcvRule);

        let expectation: RuleDTO = {
            negate: false,
            operator: "AND",
            ruleExpressionList: [
                {
                    negate: false,
                    ruleElement: { filterId: 1, operatorId: 2, value: "v1" },
                    simpleExpr: true
                },

                {
                    negate: false,
                    ruleElement: { filterId: 3, operatorId: 4, value: "v2" },
                    simpleExpr: true
                },

            ],
            simpleExpr: false

        };

        expect(result).toEqual(expectation);
    });



    it('should test getFinalRuleExp', () => {
        const service: AudienceService = TestBed.get(AudienceService);
        const allAssignerRules = [
            [
                { filter: 1, operator: 2, val: 'v1' },
                { filter: 3, operator: 4, val: 'v2' },
            ],

            [
                { filter: 11, operator: 12, val: 'v3' },
                { filter: 13, operator: 14, val: 'v4' },
            ]
        ];

        let result = service.getFinalRuleExp(allAssignerRules);
        expect(result).toEqual(rule_dto_with_4_2x2_rules);
    });


    it('should test getDispRules', () => {
        const service: AudienceService = TestBed.get(AudienceService);

        let inputRules = [
            [
                { filter: 1, operator: 3, val: "url-name" },
                { filter: 2, operator: 1, val: "m" },
            ]
        ];

        let expectation = [
            [
                {
                    filterDisp: "URL",
                    filterId: 1,
                    operatorDisp: "contains",
                    operatorId: 3,
                    shortDisp: "url",
                    value: "url-name",
                    valueDisp: "url-name"
                },
                {
                    filterDisp: "Channel",
                    filterId: 2,
                    operatorDisp: "is equal to",
                    operatorId: 1,
                    shortDisp: 'channel',
                    value: "m",
                    valueDisp: "Mobile web(m)"
                }
            ]
        ];



        let result = service.getDispRules(inputRules, set_of_rules);
        expect(result).toEqual(expectation);
    });



    it('should test getApiValue', () => {
        const service: AudienceService = TestBed.get(AudienceService);

        let expectation1 = { tableName: AppConstants.ENTITY.AUDIENCE, apiValue: AudienceConstants.TYPE_API_VAL.APP }
        let expectation2 = { tableName: AppConstants.ENTITY.AUDIENCE, apiValue: AudienceConstants.TYPE_API_VAL.WEB }
        let expectation3 = { tableName: AppConstants.ENTITY.DMP_AUDIENCE, apiValue: AudienceConstants.TYPE_API_VAL.DMP }

        expect(service.getApiValue(AudienceConstants.TYPE.APP)).toEqual(expectation1);
        expect(service.getApiValue(AudienceConstants.TYPE.WEB)).toEqual(expectation2);
        expect(service.getApiValue(AudienceConstants.TYPE.DMP)).toEqual(expectation3);
    });


    it('should test api calls', () => {
        const service: AudienceService = TestBed.get(AudienceService);

        const calledService: AudienceControllerService = TestBed.get(AudienceControllerService);

        let spy = spyOn(calledService, 'getAccessUsingGET')
        service.getAccess(68);
        expect(spy).toHaveBeenCalledTimes(1);


        let spy2 = spyOn(calledService, 'getByIdUsingGET1')
        service.getAudienceById(68);
        expect(spy2).toHaveBeenCalledTimes(1);

        let spy3 = spyOn(calledService, 'createAudienceUsingPOST')
        service.createAudience({});
        expect(spy3).toHaveBeenCalledTimes(1);

        let spy4 = spyOn(calledService, 'updateAudienceUsingPOST')
        service.updateAudience({}, 68);
        expect(spy4).toHaveBeenCalledTimes(1);

        let spy5 = spyOn(calledService, 'activateAudienceUsingPOST')
        service.activateAudience(68);
        expect(spy5).toHaveBeenCalledTimes(1);

        let spy6 = spyOn(calledService, 'deactivateAudienceUsingPOST')
        service.deactivateAudience(68);
        expect(spy6).toHaveBeenCalledTimes(1);

        let spy7 = spyOn(calledService, 'checkConnectionUsingPOST')
        service.checkRemoteFile({});
        expect(spy7).toHaveBeenCalledTimes(1);

        let spy8 = spyOn(calledService, 'syncRemoteAudienceUsingGET')
        service.syncOnDetailsPage(12);
        expect(spy8).toHaveBeenCalledTimes(1);

        let spy9 = spyOn(calledService, 'getAllDmpAudienceUsingGET')
        service.getAllDmpAudience(12);
        expect(spy8).toHaveBeenCalledTimes(1);
    });

    it('should test ruleDtoToReqRules', () => {
        const service: AudienceService = TestBed.get(AudienceService);


        let expectation =
            [
                [
                    {
                        filter: 1, operator: 2, val: 'v1'
                    },
                    {
                        filter: 3, operator: 4, val: 'v2'
                    }
                ],

                [
                    {
                        filter: 11, operator: 12, val: 'v3'
                    },
                    {
                        filter: 13, operator: 14, val: 'v4'
                    }
                ]
            ];



        let result = service.ruleDtoToReqRules(rule_dto_with_4_2x2_rules);
        expect(result).toEqual(expectation);
    });


});


