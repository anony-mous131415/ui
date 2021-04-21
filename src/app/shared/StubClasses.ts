import { GenericListApiRequest } from '@app/shared/_models/generic-list-api-request.model';
import { AdvertiserPojo, AudienceDTO, CampaignDTO, ClickDestination, CreativeDTO, CreativeMockUpsDTO, CreativeThirdPartyAdTag, DashboardFilters, DashboardRequest, DcoAttributesDTO, NativeAssetPojo, Pixel, PixelRemoteConfigDTO, PlatformAudienceDTO, ReportingRequest, SearchRequest, StrategyCreativeAssociationRequestDTO, StrategyQuickEditDTO } from '@revxui/api-client-ts';
import { PasswordChangeRequest } from '@revxui/auth-client-ts';
import { Observable, of } from 'rxjs';

export const elementPassed = {
    currency: {
        id: 123,
        code: 'USD'
    },
    id: 1,
    action: '',
    active: 'true',
    name: 'ename',
    impressions: 2,
    clicks: 3,
    installs: 4,
    conversions: 5,
    ecpm: 6,
    ecpc: 7,
    ecpi: 8,
    ecpa: 9,
    erpm: 11,
    erpc: 12,
    epri: 13,
    erpa: 14,
    ctr: 15,
    iti: 16,
    ctc: 17,
    roi: 18,
    revenue: 19,
    cost: 20,
    margin: 21,
    eligibleUniqUsers: 22,
    impressionUniqUsers: 23,
    userReach: 24,
    currencyId: 'USD',
    campaign: 'cname',
    strategy: 'sname',
    eligibleBids: 25,
    bidsPlaced: 26,
    invalid_clicks: 27,
    total_install: 28,
    imp_installs: 29,
    click_installs: 30,
    conversions_view: 10000,//10k
    conversions_click: 5400,//5.4k
    spend: 4000,
    cpi: 2500,
    conv_rate: 150,
    cvr: 70,
    click_txn_amount: 45,
    view_txn_amount: 1000,
    bid_price: 4500,
    bid_price_currency: {
        code: 'USD'
    },
    imp_per_conv: 31,
    publisher_ecpm: 6700,
    publisher_ecpc: 8900,
    publisher_ecpa: 67,
    txn_amount: 9800,
    advertiser_ecpm: 78
};


export const advDto: AdvertiserPojo = {
    active: true,
    androidDeclareUrl: 'www.url.com',
    androidPhoneBundle: 'string',
    androidTabletBundle: 'string',
    category: { id: 123, name: 'name' },
    contactAddress: 'address',
    contactNumber: '123456789',
    createdBy: 1810,
    creationTime: 15000023309,
    currency: { id: 1, name: 'USD' },
    currencyCode: 'USD',
    domain: 'www.domain.com',
    email: 'www.email.com',
    id: 123,
    iosDeclareUrl: 'ios url',
    iosPhoneBundle: 'ios phone',
    iosTabletBundle: 'ios tab',
    language: { id: 12, name: 'lang' },
    licensee: { id: 1, name: 'komli' },
    licenseeId: 1,
    modifiedBy: 1810,
    modifiedTime: 1567869090,
    name: 'adv nme',
    nonEditableFields: [],
    region: { id: 1, name: 'india' },
    skuAllowedChars: '',
    timeZone: { id: 12, name: 'asia/kolkata' },
    timeZoneId: 12,
    webDeclareUrl: 'www.weburl.com',
}

export const campaignDto: CampaignDTO = {
    active: false,
    advertiserId: 6804,
    attributionRatio: 1,
    budget: null,
    budgetSpent: 0,
    createdBy: 1910,
    creationTime: 1596519890,
    currency: { id: 73, name: "Indian Rupee" },
    currencyCode: null,
    dailyBudget: -1,
    dailyDeliveryCap: null,
    dailyUserFcap: 8,
    daysDuration: null,
    daysElapsed: null,
    endTime: 7258118399,
    fcap: null,
    flowRate: 0.09,
    id: 15363,
    ivsDistribution: 1,
    licensee: { id: 33, name: "Flipkart India Pvt Ltd" },
    licenseeId: 33,
    lifetimeBudget: -1,
    lifetimeDeliveryCap: null,
    lifetimeUserFcap: null,
    modifiedBy: 1910,
    modifiedTime: 1596520083,
    name: "okok",
    objective: "BRAND_AWARENESS",
    pixel: null,
    platformMargin: null,
    pricingId: 5,
    region: { id: 100, name: "India" },
    retargeting: false,
    startTime: 1596519890,
    userFcapDuration: 1440
}

export const pixelDto: Pixel = {
    active: true,
    advertiserId: 6804,
    advertiserPojo: advDto,
    clickValidityWindow: 86400,
    clicks: null,
    conversions: null,
    createdBy: null,
    creationTime: 1446612693,
    fcapDuration: -1,
    id: 10829,
    impressions: null,
    modifiedBy: 426,
    modifiedTime: 1505195658,
    name: "MobileApp_Conv pixel do  not use",
    type: { id: 2, name: "HYBRID_CONV" },
    userFcap: -1,
    viewValidityWindow: 86400
}

export const clickDestDto: ClickDestination = {
    active: true,
    advertiserId: 6804,
    androidClickUrl: "some-dcn-link",
    androidImpressionTracker: "some-ad.doubleclick-link",
    androidS2sClickTrackingUrl: "some-ad.doubleclick-link",
    campaignType: "RT",
    clickUrl: "",
    createdBy: 1866,
    creationTime: 1590727723,
    dco: false,
    id: 26659,
    iosCLickUrl: "",
    iosImpressionTracker: "",
    iosS2sClickTrackingUrl: "",
    licenseeId: 33,
    modifiedBy: 1866,
    modifiedTime: 1590727723,
    name: "Flipkart DCO 11May'20",
    refactored: true,
    serverTrackingUrl: "",
    webClickUrl: "",
    webImpressionTracker: "",
    webS2sClickTrackingUrl: "",
}

export const dcoAttrDto: DcoAttributesDTO = {
    creativeId: null,
    dcoAttribute: "html",
    fallbackCreativeId: null,
    id: 7929,
    macroList: null,
    noOfSlots: 1,
}

export const nativeAssetDto: NativeAssetPojo = {
    advertiserId: 6804,
    body: "__ENCODED_PAGE_LINK__",
    callToAction: "Use App",
    data: "xyztoken",
    height: 0,
    iconurl: "cdn.png",
    id: 29553,
    licenseeId: 33,
    previewBody: "handbook-educational-institutions-bangalore_revx",
    previewTitle: "handbook-educational-institutions-bangalore_revx",
    title: "__ENCODED_PAGE_LINK__",
    width: 0,
}

export const creativeDto: CreativeDTO = {
    active: true,
    advertiser: { id: 6804, name: "Flipkart_App" },
    advertiserId: 6804,
    clickDestination: clickDestDto,
    content: null,
    contentType: null,
    createdBy: 1591608621,
    creationTime: 1591608621,
    dcoAd: true,
    dcoAttributes: dcoAttrDto,
    errorMsg: null,
    id: 126747,
    modifiedBy: null,
    modifiedTime: null,
    name: "creative-name",
    nativeAd: true,
    nativeAsset: nativeAssetDto,
    originalFileName: null,
    performanceData: null,
    previewUrl: "creative-purl",
    refactored: true,
    size: { height: 0, width: 0 },
    thirdPartyAdTag: null,
    type: "nativeAd",
    urlPath: "relative-path",
    vastCreative: null,
    videoAttributes: null,
    videoUploadType: null,

}

//strDTO
// export const strategyDto: StrategyDTO = {
export const strategyDto: any = {
    active: true,
    adGroupCount: null,
    advertiser: { id: 64, name: 'advertiser-name' },
    advertiserId: 6804,
    apps: null,
    appsStrategies: null,
    auctionTypeTargeting: 'FIRST',
    bidCapMax: 20,
    bidCapMin: 10,
    bidPercentage: 100,
    budget: null,
    budgetBy: 3,
    budgetValue: -1,
    campaign: { id: 1055, name: "Campaign-name", currencyCode: 'USD' },
    campaignFcap: false,
    campaignId: 13055,
    channels: null,
    connectionTypes: ["WIFI", "CELLULAR_NETWORK_4G"],
    createdBy: 426,
    creationTime: null,
    creatives: [{ id: 12, name: "cr-1" }, { id: 23, name: 'cr-2' }],
    currency: null,
    currencyCode: "INR",
    daysDuration: null,
    daysElapsed: null,
    deliveryPriority: { id: 2, name: "NORMAL" },
    editable: true,
    endTime: -1,
    fcap: null,
    fcapEnabled: true,
    fcapFrequency: 50,
    fcapInterval: 144,
    id: 39584,
    isEditable: true,
    isNative: false,
    licensee: { id: 313, name: "licensee-name" },
    licenseeId: 33,
    modifiedBy: 1868,
    modifiedTime: 1597994667,
    name: "strategy-name",
    native: false,
    oldGeoTargeting: null,
    pacingBudgetValue: null,
    pacingType: {
        id: 1,
        name: "ASAP",
    },
    pixels: [
        {
            id: 110,
            name: "Tracker-name"
        }
    ],
    placements: [{ id: 3, name: "Mobile Applications" }],
    pricingType: { id: 3, name: "CPA" },
    pricingValue: 40,
    roiTargetType: null,
    roiTargetValue: null,
    rtbAggregators: {
        aggregators: {
            blockedList: [
                { id: 521, name: "block-1" },
                { id: 522, name: "block-2" }
            ],
            targetList: [
                { id: 1, name: "target-1" },
                { id: 542, name: "target-2" }
            ]
        },
        selectAllAggregators: true
    },
    rtbSites: { selectAllSites: true, rtbSites: { targetList: [], blockedList: [] } },
    sections: null,
    startTime: 1535883467,
    strategyType: "standard",
    targetAndroidCategories: { osId: null, selectAll: true, appCategories: { targetList: [], blockedList: [] } },
    targetAppRatings: null,
    targetAppSegments: {
        blockedSegments: [{ id: 2035, name: "block-app-aud-1" }, { id: 2036, name: "block-app-aud-2" }],
        blockedSegmentsOperator: "OR",
        customSegmentTargeting: true,
        targetedSegments: [{ id: 2033, name: "target-app-aud-1" }, { id: 2034, name: "target-app-aud-2" }],
        targetedSegmentsOperator: "OR"
    },

    targetBrowsers: { selectAllBrowsers: true, browsers: { targetList: [], blockedList: [] } },
    targetDays: {},
    targetDealCategory: {

        dealCategory: {
            blockedList: [],
            targetList: [{ id: 12, name: 'deal-1' }]
        },
        selectAll: true

    },

    targetDmpSegments: {
        blockedSegments: [{ id: 2038, name: "block-dmp-aud-1" }],
        blockedSegmentsOperator: "OR",
        customSegmentTargeting: false,
        targetedSegments: [{ id: 20390, name: "target-dmp-aud-2" }],
        targetedSegmentsOperator: "OR",
    },
    targetGeographies: {
        city: { targetList: [], blockedList: [] },
        country: { targetList: [], blockedList: [] },
        customGeoTargeting: false,
        state: { targetList: [], blockedList: [] },
    },
    targetIosCategories: { osId: null, selectAll: true, appCategories: { targetList: [], blockedList: [] } },

    targetMobileDevices: {
        targetDeviceTypes: {
            mobileDeviceTypes: {
                blockedList: [],
                targetList: [{ id: 3, name: "Smartphone" }]
            },
            selectAllMobileDeviceTypes: false
        },
        targetMobileDeviceBrands: null,
        targetMobileModels: null,
        targetOperatingSystems: {
            operatingSystems: {
                excludeList: [],
                includeList: [
                    { id: 4, name: "Android", properties: { OSVERSION: { id: 21, name: "-1.0" } } },
                    { id: 4, name: "ios", properties: { OSVERSION: { id: 21, name: "8.0" } } }
                ]
            },
            selectAllOperatingSystems: false
        }
    },



    targetOnlyPublishedApp: false,
    targetWebSegments: {
        blockedSegments: [{ id: 1038, name: "block-web-aud-1" }],
        blockedSegmentsOperator: "OR",
        customSegmentTargeting: false,
        targetedSegments: [{ id: 4038, name: "block-web-aud-1" }],
        targetedSegmentsOperator: "OR",
    },
    timezone: null

}


export const genericListApiReq: GenericListApiRequest = {
    advertiserId: 6804,
    entityId: null,
    name: null,
    pageNumber: 1,
    pageSize: 10,
    refresh: false,
    sort: 'id+',
    search: {
        filters: []
    }
}


export const nameFilter: DashboardFilters = {
    column: 'name',
    value: 'random_input'
}


export const durationFilter: DashboardFilters = {
    column: 'duration',
    value: JSON.stringify({
        endTimeStamp: 1597881600,
        startTimeStamp: 1597276800
    })
}

export class DashboardControllerService_stub {

    getDashboardDataListCsvUsingPOST(dashboardRequest: any, entity: any): Observable<any> {
        return of({});
    }


    getDashboardDataListUsingPOST(dashboardRequest: any, entity: any): Observable<any> {
        return of({});
    }

    getMenuCrumbsUsingGET(): Observable<any> {
        return of({});
    }

    searchByNameUsingPOST(tableEntity: string, reqId?: string, request?: SearchRequest, search?: string, token?: string, observe?: 'body', reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getDictionaryUsingPOST(tableEntity: string, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, request?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


}

export class AdvertiserControllerService_stub {

    createAdvertiserUsingPOST(advertiser: AdvertiserPojo, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getByIdUsingGET(advertiser: AdvertiserPojo, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    activateAdvertiserUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    deactivateAdvertiserUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
    getAdvertiserSettingsUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
    getSmartTagUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
    updateASTUsingPOST(reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
    updateASTUsingPOST1(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
    updateAdvertiserUsingPOST(advertiser: AdvertiserPojo, id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
    updateSettingsUsingPOST(id: number, settings: any, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }



}

export class PixelControllerService_stub {
    deactivateUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    activateUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    searchPixelsUsingPOST(advertiser_id: number, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getByIdUsingGET4(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getTrackingCodeUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    createUsingPOST(pixel: Pixel, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    updateUsingPOST(id: number, pixel: Pixel, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }



}

export class CatalogControllerService_stub {

    getCatalogFeedsUsingPOST(advertiser_id: number, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getVariableMappingsUsingPOST(feeId: number, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getMacrosUsingPOST(advertiser_id: number, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getByIdUsingGET2(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
}


export class ClickDestinationControllerService_stub {

    createClickDestinationUsingPOST(cd: ClickDestination, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    updateClickDestinationUsingPOST(clickDestination: ClickDestination, id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    getAllClickDestinationUsingPOST(advertiser_id: number, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getClickDestinationByIdUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getMmpParametersUsingGET(id: number, reqId?: string, token?: string, observe?: 'response', reportProgress?: boolean): Observable<any> {
        return of({});

    }


}

export class CampaignControllerService_stub {
    activateCampaignUsingPOST(id: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    createCampaignUsingPOST(campaign: CampaignDTO, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    deactivateCampaignUsingPOST(id: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getAllCampaignUsingGET(advertiser_id: number, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: string, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getCampaignByIdUsingGET(id: number, refresh?: boolean, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    updateCampaignUsingPOST(campaign: CampaignDTO, id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
}



export class StrategyControllerService_stub {
    activateStrategyUsingPOST(id: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    deactivateStrategyUsingPOST(id: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    associateCreativesWithStrategiesUsingPOST(request: StrategyCreativeAssociationRequestDTO, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getStrategyQuickEditDetailsUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    saveStrategyQuickEditDetailsUsingPOST(id: number, strategyQuickEditDTO: StrategyQuickEditDTO, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

}

export class BulkStrategyControllerService_stub {

    bulkEditActivityLogUsingGET(pageNumber?: number, pageSize?: number, reqId?: string, sort?: string, token?: string, observe?: 'body', reportProgress?: boolean): Observable<any> {
        return of({});
    }
}


export class AudienceControllerService_stub {
    deactivateAudienceUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    activateAudienceUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getAllAudienceUsingPOST(advertiser_id: number, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    checkConnectionUsingPOST(config: PixelRemoteConfigDTO, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    createAudienceUsingPOST(audience: AudienceDTO, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getAccessUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of(false);
    }

    getAllDmpAudienceUsingGET(advertiser_id: number, limit?: number, reqId?: string, start?: number, stype?: number, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getByIdUsingGET1(id: number, refresh?: boolean, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getMetaRulesUsingGET(reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    updateAudienceUsingPOST(audience: AudienceDTO, id: number, reqId?: string, token?: string, observe?: 'response', reportProgress?: boolean): Observable<any> {
        return of({});
    }

    syncRemoteAudienceUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    syncAudienceUsingPOST(platformAudienceDTO: PlatformAudienceDTO, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});

    }

    getSyncedDmpAudienceUsingGET(advertiser_id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});

    }


}



export class AlertService_stub {
    error(str: string) { }
    clear(bool: boolean) { }
    success(msg: string, bool1: boolean, bool2: boolean) { }


}

export class PixelTypePipe_stub {
    transform(inp: string) {
        return inp;
    }

}


export class SecondsToTimePipe_stub {
    transform(num: number) {
        return '1 day';
    }
}



export class CreativeControllerService_stub {
    activateCreativeUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    createCreativeUsingPOST(creativeDTOs: Array<CreativeDTO>, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    createMockupsUsingPOST(mockupDTO: CreativeMockUpsDTO, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    deactivateCreativeUsingPOST(commaSepratedIds: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getAdTagCreativeUsingPOST(adTag: CreativeThirdPartyAdTag, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getCreativeByIdUsingGET(id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    getPerformanceForCreativeByIdUsingPOST(id: number, search: DashboardRequest, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    searchCreativesCompactUsingPOST(pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, search?: SearchRequest, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    searchCreativesUsingPOST(search: DashboardRequest, pageNumber?: number, pageSize?: number, refresh?: boolean, reqId?: string, sort?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


    updateCreativeUsingPOST(creative: CreativeDTO, id: number, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }
}


export class ReportingControllerService_stub {
    customReportCSVUsingPOST(entity: string, reportingRequest: ReportingRequest, options?: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    customReportUsingPOST(entity: string, reportingRequest: ReportingRequest, options?: string, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


}


export class CommonService_stub {

    getReqID() {
        return '';
    }

    public nrFormatWithCurrency(value: number, type: string, currency?: string) {
        return '$ ' + value;
    }

    public nrFormatTooltip(value: number, type: string, currency?: string) {
        return '';
    }

    public nrFormat(value: number, type: string, currency?: string) {
        return ''
    }

    public epochToDateTimeFormatter(num: number) {
        return num.toString();
    }

    public getDateFromEpoch(param: any) {
        return param;
    }

}

export class AuthApiService_stub {
    changePasswordUsingPOST(passwordChangeRequest: PasswordChangeRequest, token: string, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
    loginSocialUsingGET(client: string, socialToken: string, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
    loginUsingPOST(userLoginRequest: any, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
    logoutUserUsingGET(token: string, username: string, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
    logoutWithTokenUsingGET(token: string, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
    switchLicenseeUsingGET(licenseeId: number, token: string, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
    userInfoUsingGET(token: string, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
    userPrivilegeUsingGET(token: string, observe?: any, reportProgress?: boolean): Observable<any> { return of({}); }
}



export class GoogleAuthConfig_stub {
}


export class AuthService_stub {
    signOut() { }
}

export class EntitiesService_stub {

    getChartTooltipMetrics() {
        return '';
    }
}

export class NGXLogger_stub {
    error(str: string) { }
}

export class ConvUiService_stub {
    show(): Observable<any> {

        let dummyResp = {
            respObject: {
                result: [1, 2, 3]
            }
        };

        return of(dummyResp);
    }


    setResult(resp: any) { }
}


export class BreadcrumbsService_stub {
    createBCObject(resp: any) {
        return {};
    }
}


export class AuditControllerService_stub {

    getAuditDetailsUsingGET(endTime: number, entity: string, id: number, startTime: number, reqId?: string, token?: string, observe?: 'body', reportProgress?: boolean): Observable<any> {
        return of({})
    }

    getAuditLogUsingGET(endTime: number, entity: string, id: number, startTime: number, reqId?: string, token?: string, observe?: 'body', reportProgress?: boolean): Observable<any> {
        return of({})
    }

}


export class AppSettingsControllerService_stub {
    createAppSettingsUsingPOST(appSettings: Array<any>, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    getAppSettingsUsingGET(advertiserId?: number, reqId?: string, settingsKey?: any, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }

    updateAppSettingsUsingPOST(appSettings: Array<any>, reqId?: string, token?: string, observe?: any, reportProgress?: boolean): Observable<any> {
        return of({});
    }


}