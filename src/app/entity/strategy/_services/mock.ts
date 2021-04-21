import { ApiResponseObjectApiListResponseActivityLogsStrategyBulkUpdateDTO } from '@revxui/api-client-ts/model/apiResponseObjectApiListResponseActivityLogsStrategyBulkUpdateDTO';
import { ApiListResponseActivityLogsStrategyBulkUpdateDTO, ActivityLogsStrategyBulkUpdateDTO, BulkEditStrategiesDTO, BulkEditStrategyListDTO, BaseModel, FailedStrategyDTO } from '@revxui/api-client-ts';

import * as jsonData from './detailsPage.json';
import { StrategyConstants } from '../_constants/StrategyConstants';


// const msg = "reason-of-failure-1";
const msg = "reason-of-failure-which-is-very-lengthy-and-might-not-fit-and-caused-error-and-is-very-large-and-cause-other-weird-stuff";



export const failed: FailedStrategyDTO = { id: 12345, name: 'failed-name-1', message: (msg + msg) };
export const passed: BaseModel = { id: 54321, name: 'passed-name-1' };


export const req: BulkEditStrategiesDTO = {

    //basic details
    strategies: [{ id: 1, name: 'strategy-1' }, { id: 1, name: 'strategy-1' }, { id: 1, name: 'strategy-1' }],
    name: {
        action: StrategyConstants.NO_CHANGE,
        value: 'name appended'
    },
    startTime: {
        action: StrategyConstants.REPLACE,
        value: 1596519890
    },
    endTime: {
        action: StrategyConstants.REPLACE,
        value: -1
    },

    //inventory
    inventoryTargeting: {
        action: StrategyConstants.APPEND,
        value: {
            selectAllAggregators: false,
            aggregators: {
                blockedList: [],
                targetList: [{ id: 476, name: "ADSNATIVE" }, { id: 5, name: "ADRENALINE" }]
            }

        }
    },
    auctionTargeting: {
        action: StrategyConstants.REPLACE,
        value: "SECOND"
    },
    appsTargeting: {
        action: StrategyConstants.APPEND,
        value: {
            selectAllSites: false,
            rtbSites: {
                blockedList: [],
                targetList: [{ id: 578605233, name: "us.sliide.newsandrewards" },
                { id: 518914003, name: "se.feomedia.quizkampen.nl.lite" }]
            }
        }
    },

    //targeting
    geoTargeting: {
        action: StrategyConstants.NO_CHANGE,
        value: {
            country: {
                targetList: [{ id: 111, name: 'country-1' }]
            },
            state: {
                targetList: [{ id: 222, name: 'state-1' }]

            },
            city: {
                targetList: [{ id: 333, name: 'city-1' }]

            },
            customGeoTargeting: true

        }

    },
    appAudienceTargeting: {
        action: StrategyConstants.REPLACE,
        value: {
            customSegmentTargeting: true,
            blockedSegmentsOperator: 'OR',
            targetedSegmentsOperator: 'OR',
            blockedSegments: [],
            targetedSegments: [{ id: 1245, name: 'app-audience-1' }]
        }

    },
    webAudienceTargeting: {
        action: StrategyConstants.REPLACE,
        value: {
            customSegmentTargeting: true,
            blockedSegmentsOperator: 'OR',
            targetedSegmentsOperator: 'OR',
            blockedSegments: [],
            targetedSegments: [{ id: 1245, name: 'web-audience-1' }]
        }

    },
    dmpAudienceTargeting: {
        action: StrategyConstants.REPLACE,
        value: {
            customSegmentTargeting: true,
            blockedSegmentsOperator: 'OR',
            targetedSegmentsOperator: 'OR',
            blockedSegments: [],
            targetedSegments: [{ id: 1245, name: 'dmp-audience-1' }]
        }

    },
    daysTargeting: {
        action: StrategyConstants.REPLACE,
        value: {
            daypart: [
                { day: 0, hours: [6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] },
                { day: 1, hours: [6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] },
                { day: 2, hours: [6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] },
                { day: 3, hours: [6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] },
                { day: 4, hours: [6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] },
                { day: 5, hours: [6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] },
                { day: 6, hours: [6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] },

            ]
        }

    },
    mobileOSTargeting: {
        action: StrategyConstants.REPLACE,
        value: {
            selectAllOperatingSystems: false,
            operatingSystems: {
                excludeList: [],
                includeList: [{
                    id: 4,
                    name: "Android",
                    properties: {
                        OSVERSION: {
                            id: 21, name: "Any"
                        }
                    }
                }]
            }
        }

    },
    dealAudienceTargeting: {
        action: StrategyConstants.REPLACE,
        value: {
            selectAll: false,
            dealCategory: {
                blockedList: [],
                targetList: [{ id: 12, name: "deal-1" }]
            }
        }
    },


    //budget 
    budgetValue: {
        action: StrategyConstants.REPLACE,
        value: 1200
    },

    pacingBudgetValue: {
        action: StrategyConstants.REPLACE,
        value: 1200
    },

    pricingType: {
        action: StrategyConstants.REPLACE,
        value: {
            id: 2,
            name: 'CPC'
        }
    },

    pricingValue: {
        action: StrategyConstants.REPLACE,
        value: 1200
    },

    bidCapMin: {
        action: StrategyConstants.REPLACE,
        value: 100
    },

    bidCapMax: {
        action: StrategyConstants.REPLACE,
        value: 200
    },

    //creatives
    creatives: {
        action: StrategyConstants.REPLACE,
        value: [{ id: 1, name: 'creative-1' }, { id: 2, name: 'creative-2' }, { id: 1, name: 'creative-1' }]
    }




}


export const res: BulkEditStrategyListDTO = {
    failedStrategies: [failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed, failed],
    // failedStrategies: [],

    updatedStrategies: [passed, passed, passed, passed]
    // updatedStrategies: []


}





export const log: ActivityLogsStrategyBulkUpdateDTO = {

    createdOn: 111,
    id: 222,
    licenseeId: 333,
    modifiedOn: 444,
    requestObj: req,
    responseObj: res,
    status: "IN_PROGRESS",
    userName: 'abc@affle.com'
}




export const respObj: ApiListResponseActivityLogsStrategyBulkUpdateDTO = {
    data: [log, log, log, log],
    totalNoOfRecords: 4
}



export const apiRespBulkActLog: ApiResponseObjectApiListResponseActivityLogsStrategyBulkUpdateDTO = {

    error: null,
    respId: '123',
    respObject: respObj
}





export const requestData = jsonData