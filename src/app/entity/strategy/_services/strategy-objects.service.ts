import { Injectable } from '@angular/core';
import { StrategyDTO } from '@revxui/api-client-ts';

@Injectable({
  providedIn: 'root'
})
export class StrategyObjectsService {

  //BASIC DETAILS
  strBasicDetails: any = {
    advertiser: null,
    campaign: null,
    channel: null,
    strategyName: null,
    startTime: null,
    endTime: null,
    dailyFCap: null,
    dailyFCapValue: null,
    // hourlyFcapDuration: null,
    // hourlyUserFcap: null,
    // isHourlyFcap: null
    fcapInterval: null,

  };

  errorBasic: any = {
    advertiser: { hasError: false, msg: '' },
    campaign: { hasError: false, msg: '' },
    name: { hasError: false, msg: '' },
    startTime: { hasError: false, msg: '' },
    endTime: { hasError: false, msg: '' },
    fCap: { hasError: false, msg: '' },
    // hCap: {hasError: false, msg: ''}
  };

  //INVENTORY OBJECTS
  auctionTypes: any[] = [
    { id: 'firstPrice', name: 'First Price', checked: true, value: StrategyDTO.AuctionTypeTargetingEnum.FIRST },
    { id: 'secondPrice', name: 'Second Price', checked: true, value: StrategyDTO.AuctionTypeTargetingEnum.SECOND }
  ];

  appRatingList: any[] = [
    { id: 'any', name: 'Any' },
    { id: 'oneplus', name: '1+' },
    { id: 'twoplus', name: '2+' },
    { id: 'threeplus', name: '3+' },
    { id: 'fourplus', name: '4+' },
  ];

  trgtOptInventorySources: any[] = [
    { id: 'all', name: 'Target All', checked: true, value: 0 },
    { id: 'target-specific', name: 'Target Specific', checked: false, value: 1 },
    { id: 'block-specific', name: 'Block Specific', checked: false, value: -1 },
  ];

  trgtOptAndroidAppCategory: any[] = [
    { id: 'all', name: 'Target All', checked: true, value: 0 },
    { id: 'target-specific', name: 'Target Specific', checked: false, value: 1 },
    { id: 'block-specific', name: 'Block Specific', checked: false, value: -1 },
  ];

  trgtOptIosAppCategory: any[] = [
    { id: 'all', name: 'Target All', checked: true, value: 0 },
    { id: 'target-specific', name: 'Target Specific', checked: false, value: 1 },
    { id: 'block-specific', name: 'Block Specific', checked: false, value: -1 },
  ];

  baseTargetOptionsForApp: any[] = [
    { id: 'target', name: 'Target', checked: true, value: 1 },
    { id: 'do-not-target', name: 'Do Not Target', checked: false, value: -1 },
  ];

  errorInventory: any = {
    inventory: { hasError: false, msg: '' },
    android: { hasError: false, msg: '' },
    ios: { hasError: false, msg: '' },
    app: { hasError: false, msg: '' },
    site: { hasError: false, msg: '' },
    targetApp: { hasError: false, msg: '' },
    targetAppRating: { hasError: false, msg: '' },
    auctionType: { hasError: false, msg: '' } //REVX-127
  };


  //TARGETING OBJECTS
  dayparts = [
    {
      day: 0,
      hours: [
        { hr: 6, checked: true },
        { hr: 7, checked: true },
        { hr: 8, checked: true },
        { hr: 9, checked: true },
        { hr: 10, checked: true },
        { hr: 11, checked: true },
        { hr: 12, checked: true },
        { hr: 13, checked: true },
        { hr: 14, checked: true },
        { hr: 15, checked: true },
        { hr: 16, checked: true },
        { hr: 17, checked: true },
        { hr: 18, checked: true },
        { hr: 19, checked: true },
        { hr: 20, checked: true },
        { hr: 21, checked: true },
        { hr: 22, checked: true },
        { hr: 23, checked: true },
        { hr: 0, checked: true },
        { hr: 1, checked: true },
        { hr: 2, checked: true },
        { hr: 3, checked: true },
        { hr: 4, checked: true },
        { hr: 5, checked: true }
      ]
    },
    {
      day: 1,
      hours: [
        { hr: 6, checked: true },
        { hr: 7, checked: true },
        { hr: 8, checked: true },
        { hr: 9, checked: true },
        { hr: 10, checked: true },
        { hr: 11, checked: true },
        { hr: 12, checked: true },
        { hr: 13, checked: true },
        { hr: 14, checked: true },
        { hr: 15, checked: true },
        { hr: 16, checked: true },
        { hr: 17, checked: true },
        { hr: 18, checked: true },
        { hr: 19, checked: true },
        { hr: 20, checked: true },
        { hr: 21, checked: true },
        { hr: 22, checked: true },
        { hr: 23, checked: true },
        { hr: 0, checked: true },
        { hr: 1, checked: true },
        { hr: 2, checked: true },
        { hr: 3, checked: true },
        { hr: 4, checked: true },
        { hr: 5, checked: true }
      ]
    },
    {
      day: 2,
      hours: [
        { hr: 6, checked: true },
        { hr: 7, checked: true },
        { hr: 8, checked: true },
        { hr: 9, checked: true },
        { hr: 10, checked: true },
        { hr: 11, checked: true },
        { hr: 12, checked: true },
        { hr: 13, checked: true },
        { hr: 14, checked: true },
        { hr: 15, checked: true },
        { hr: 16, checked: true },
        { hr: 17, checked: true },
        { hr: 18, checked: true },
        { hr: 19, checked: true },
        { hr: 20, checked: true },
        { hr: 21, checked: true },
        { hr: 22, checked: true },
        { hr: 23, checked: true },
        { hr: 0, checked: true },
        { hr: 1, checked: true },
        { hr: 2, checked: true },
        { hr: 3, checked: true },
        { hr: 4, checked: true },
        { hr: 5, checked: true }
      ]
    },
    {
      day: 3,
      hours: [
        { hr: 6, checked: true },
        { hr: 7, checked: true },
        { hr: 8, checked: true },
        { hr: 9, checked: true },
        { hr: 10, checked: true },
        { hr: 11, checked: true },
        { hr: 12, checked: true },
        { hr: 13, checked: true },
        { hr: 14, checked: true },
        { hr: 15, checked: true },
        { hr: 16, checked: true },
        { hr: 17, checked: true },
        { hr: 18, checked: true },
        { hr: 19, checked: true },
        { hr: 20, checked: true },
        { hr: 21, checked: true },
        { hr: 22, checked: true },
        { hr: 23, checked: true },
        { hr: 0, checked: true },
        { hr: 1, checked: true },
        { hr: 2, checked: true },
        { hr: 3, checked: true },
        { hr: 4, checked: true },
        { hr: 5, checked: true }
      ]
    },
    {
      day: 4,
      hours: [
        { hr: 6, checked: true },
        { hr: 7, checked: true },
        { hr: 8, checked: true },
        { hr: 9, checked: true },
        { hr: 10, checked: true },
        { hr: 11, checked: true },
        { hr: 12, checked: true },
        { hr: 13, checked: true },
        { hr: 14, checked: true },
        { hr: 15, checked: true },
        { hr: 16, checked: true },
        { hr: 17, checked: true },
        { hr: 18, checked: true },
        { hr: 19, checked: true },
        { hr: 20, checked: true },
        { hr: 21, checked: true },
        { hr: 22, checked: true },
        { hr: 23, checked: true },
        { hr: 0, checked: true },
        { hr: 1, checked: true },
        { hr: 2, checked: true },
        { hr: 3, checked: true },
        { hr: 4, checked: true },
        { hr: 5, checked: true }
      ]
    },
    {
      day: 5,
      hours: [
        { hr: 6, checked: true },
        { hr: 7, checked: true },
        { hr: 8, checked: true },
        { hr: 9, checked: true },
        { hr: 10, checked: true },
        { hr: 11, checked: true },
        { hr: 12, checked: true },
        { hr: 13, checked: true },
        { hr: 14, checked: true },
        { hr: 15, checked: true },
        { hr: 16, checked: true },
        { hr: 17, checked: true },
        { hr: 18, checked: true },
        { hr: 19, checked: true },
        { hr: 20, checked: true },
        { hr: 21, checked: true },
        { hr: 22, checked: true },
        { hr: 23, checked: true },
        { hr: 0, checked: true },
        { hr: 1, checked: true },
        { hr: 2, checked: true },
        { hr: 3, checked: true },
        { hr: 4, checked: true },
        { hr: 5, checked: true }
      ]
    },
    {
      day: 6,
      hours: [
        { hr: 6, checked: true },
        { hr: 7, checked: true },
        { hr: 8, checked: true },
        { hr: 9, checked: true },
        { hr: 10, checked: true },
        { hr: 11, checked: true },
        { hr: 12, checked: true },
        { hr: 13, checked: true },
        { hr: 14, checked: true },
        { hr: 15, checked: true },
        { hr: 16, checked: true },
        { hr: 17, checked: true },
        { hr: 18, checked: true },
        { hr: 19, checked: true },
        { hr: 20, checked: true },
        { hr: 21, checked: true },
        { hr: 22, checked: true },
        { hr: 23, checked: true },
        { hr: 0, checked: true },
        { hr: 1, checked: true },
        { hr: 2, checked: true },
        { hr: 3, checked: true },
        { hr: 4, checked: true },
        { hr: 5, checked: true }
      ]
    }
  ];

  deviceTypeOptions: any[] = [
    { id: 'smartphone', name: 'Smartphone', checked: true, value: 3 },
    { id: 'tablet', name: 'Tablet', checked: true, value: 4 }
  ];

  //REVX-724 : skad-ui changes
  mobileOSOptions: any[] = [
    { id: 'android', name: 'Android', desc: 'Any', checked: true, value: 4, showSkad: false },
    { id: 'ios', name: 'iOS', desc: 'Any', checked: true, value: 3, showSkad: true }
  ];

  connectionTypeOptions: any[] = [
    { id: 'wifi', name: 'Wifi', checked: true, value: StrategyDTO.ConnectionTypesEnum.WIFI },
    { id: '2g', name: '2G', checked: true, value: StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK2G },
    { id: '3g', name: '3G', checked: true, value: StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK3G },
    { id: '4g', name: '4G', checked: true, value: StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK4G },
    { id: '5g', name: '5G', checked: true, value: StrategyDTO.ConnectionTypesEnum.CELLULARNETWORK5G }
  ];

  creativePlacementOptions: any[] = [
    { id: 'desktop', name: 'Desktop', checked: true, value: 1 },
    { id: 'mobile-web', name: 'Mobile Web', checked: true, value: 2 },
    { id: 'mobile-apps', name: 'Mobile Applications', checked: true, value: 3 }
  ];

  errorTargeting: any = {
    country: { hasError: false, msg: '' },
    state: { hasError: false, msg: '' },
    city: { hasError: false, msg: '' },
    audience: { hasError: false, msg: '' },
    daypart: { hasError: false, msg: '' },
    creativePlacement: { hasError: false, msg: '' },
    connectionType: { hasError: false, msg: '' },
    os: { hasError: false, msg: '' },
    deviceType: { hasError: false, msg: '' },
    brands: { hasError: false, msg: '' },
    models: { hasError: false, msg: '' },
    deal: { hasError: false, msg: '' }
  };

  //BUDGET OBJECTS
  errorBuget: any = {
    lifetimeBudget: { hasError: false, msg: '' },
    dailyMediaBudget: { hasError: false, msg: '' },
    bidPrice: { hasError: false, msg: '' },
    bidRangeMin: { hasError: false, msg: '' },
    bidRangeMax: { hasError: false, msg: '' },
    bidType: { hasError: false, msg: '' }
  };

  strBudgetDetails: any = {
    lifetimeMediaBudget: null,
    lifetimeMediaBudgetValue: null,
    dailyMediaBudgetValue: null,
    pacing: null,
    bidType: null,
    bidPrice: null,
    bidRangeMin: null,
    bidRangeMax: null
  };


  constructor() { }



  //REVX-724 : skad-ui changes
  getMobileOsOptions(filterOutSkad: boolean): any[] {
    if (filterOutSkad) {
      let arr: any[] = this.mobileOSOptions.filter(x => x.showSkad === true);
      return arr;
    } else {
      return this.mobileOSOptions;
    }
  }



  getStrategyDto() {
    let mockStrDto = {
      active: true,

      advertiser: {
        active: false,
        id: 6804,
        name: "Flipkart_App",

      },
      auctionTypeTargeting: "ALL",
      bidCapMax: null,//bid range max
      bidCapMin: null,//bid range min
      budgetValue: -1,
      campaign: {
        active: false,
        advertiserId: 6804,
        budget: -1,
        cpaTarget: null,
        createdBy: 1983,
        creationTime: 1603866775,
        currencyCode: "INR",
        dailyBudget: 100,
        dailyUserFcap: 8,
        daysDuration: -1,
        daysElapsed: 135.0466,
        endTime: 7258118399,
        fcap: 8,
        id: 15403,
        licenseeId: 33,
        lifetimeBudget: -1,
        lifetimeUserFcap: null,
        modifiedBy: 1983,
        modifiedTime: 1603866775,
        name: "test_28_UI",
        pixelId: 11581,
        skadTarget: false,
        startTime: 1603866775,
        userFcapDuration: 1440
      },
      campaignFcap: true,
      connectionTypes: null,
      cpaTargetValue: null,
      creatives: [],
      startTime: -1,
      endTime: -1,
      fcapEnabled: true,
      fcapFrequency: 8,
      fcapInterval: null,
      name: "",
      pacingBudgetValue: null,//daily media budget
      pacingType: { id: 1 }, //ASAP etc ..
      placements: [{ id: 1, name: "Desktop" }, { id: 2, name: "Mobile Web" }, { id: 3, name: "Mobile Applications" }],
      pricingType: { id: null }, //CPC , CPM , MArgin ...
      pricingValue: null,//bid price
      rtbAggregators: { selectAllAggregators: true, aggregators: { targetList: [], blockedList: [] } },
      rtbSites: { selectAllSites: true, rtbSites: { blockedList: [], targetList: [] } },
      targetAndroidCategories: { selectAll: true, appCategories: { targetList: [], blockedList: [] } },
      targetAppRatings: 0,
      targetAppSegments: {
        blockedSegments: [],
        blockedSegmentsOperator: "OR",
        customSegmentTargeting: true,
        targetedSegments: [],
        targetedSegmentsOperator: "AND",
      },
      targetDays: { daypart: null },
      targetDealCategory: { selectAll: false, dealCategory: { targetList: [], blockedList: [] } },
      targetDmpSegments: {
        blockedSegments: [],
        blockedSegmentsOperator: "OR",
        customSegmentTargeting: true,
        targetedSegments: [],
        targetedSegmentsOperator: "AND",
      },
      targetGeographies: {
        city: { targetList: [], blockedList: [] },
        country: { targetList: [], blockedList: [] },
        customGeoTargeting: false,
        state: { targetList: [], blockedList: [] }
      },
      targetIosCategories: { selectAll: true, appCategories: { targetList: [], blockedList: [] } },
      targetMobileDevices: {
        targetDeviceTypes: {
          mobileDeviceTypes: { blockedList: [], targetList: [{ id: 3, name: "Smartphone" }, { id: 4, name: "Tablet" }] },
          selectAllMobileDeviceTypes: false
        },
        targetMobileDeviceBrands: { selectAllMobileDeviceBrands: true, mobileDeviceBrands: { blockedList: [], targetList: [] } },
        targetMobileModels: null,
        targetOperatingSystems: {
          operatingSystems: {
            excludeList: [],
            includeList: [{ id: 4, name: "Android", properties: { OSVERSION: { id: 21, name: "Any" } } },
            { id: 3, name: "iOS", properties: { OSVERSION: { id: 23, name: "Any" } } }
            ],
            selectAllOperatingSystems: true
          }
        },
        targetOnlyPublishedApp: false,
        targetWebSegments: {
          blockedSegments: [],
          blockedSegmentsOperator: "OR",
          customSegmentTargeting: true,
          targetedSegments: [],
          targetedSegmentsOperator: "AND",
        }
      }
    }


    return mockStrDto;
  }

}
