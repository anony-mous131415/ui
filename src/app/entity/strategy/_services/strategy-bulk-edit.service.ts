import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
// import { this.SCONST } from '../_constants/this.SCONST';
import { StrategyConstants } from '../_constants/StrategyConstants';
import { StrategyDTO, StringEditField, BigDecimalEditField, AuctionTypeEditField, RTBAggregatorsEditField, RTBSitesEditField, TargetGeoEditField, DayPartEditField, AudienceStrEditField, TargetOperatingSystemEditField, DealCategoryEditField, BaseModelEditField, BaseModelListEditField, TargetMobileDevices, BaseModel } from '@revxui/api-client-ts';
import { BulkEditStrategiesDTO } from '@revxui/api-client-ts/model/bulkEditStrategiesDTO';
import { StrategyService, PARTS_STR, bidTypeOpts } from './strategy.service';
import { CommonService } from '@app/shared/_services/common.service';
import * as moment from 'moment';
import * as jsonSettings from './bulk-edit-settings.json';


export class Helper {
  static ALLOWED: boolean;
}

const CLR_NO_CHANGE = 'gray';

@Injectable({
  providedIn: 'root'
})


export class StrategyBulkEditService {

  strDetails = new ReplaySubject<any>(1);
  SCONST = StrategyConstants;
  private strategyList: any[] = [];


  //default selections
  bulkEditOptionSelected = {
    //basic section
    name: this.SCONST.APPEND,
    schedule: this.SCONST.NO_CHANGE,

    //inventory section
    inventory: this.SCONST.APPEND,
    auction: this.SCONST.REPLACE,//final
    apps: this.SCONST.APPEND,

    //targeting section
    geo: this.SCONST.APPEND,
    audience: this.SCONST.APPEND,
    days: this.SCONST.REPLACE,//final
    os: this.SCONST.REPLACE,//final
    deal: this.SCONST.APPEND,

    //budget and bidding section
    budget: this.SCONST.REPLACE,//final

    //creatives section
    creative: this.SCONST.APPEND,
  }


  constructor(
    private strService: StrategyService,
    private commonService: CommonService
  ) { }


  getBulkEditSettings(idx: string) {
    switch (idx) {
      case this.SCONST.STEP_TITLE_BASIC:
        return jsonSettings["basic"];


      case this.SCONST.STEP_TITLE_INVENTORY:
        return jsonSettings["inventory"];


      case this.SCONST.STEP_TITLE_TARGETING:
        return jsonSettings["targeting"];


      case this.SCONST.STEP_TITLE_BUDGET:
        return jsonSettings["budget"];


      case this.SCONST.STEP_TITLE_CREATIVES:
        return jsonSettings["creatives"];
    }
  }


  setBulkEditOptionSelected(feild: string, selection: any) {
    if (this.bulkEditOptionSelected && this.bulkEditOptionSelected[feild] != null && this.bulkEditOptionSelected[feild] != undefined) {
      this.bulkEditOptionSelected[feild] = selection;
      // console.log(this.bulkEditOptionSelected);
    }
  }


  setStrategiesForBulkEdit(list) {
    this.strategyList = list;
    // console.log('final list for bulk edit ==>');
    // console.log(this.strategyList);

  }

  getStrategiesForBulkEdit(): any[] {
    return this.strategyList;
  }



  convertStrategyDtoToBulkEditRequestDto(strDto: StrategyDTO): BulkEditStrategiesDTO {

    let returnVal: BulkEditStrategiesDTO = {};

    //app-audience
    returnVal.appAudienceTargeting = {
      action: this.bulkEditOptionSelected.audience,
      value: strDto.targetAppSegments
    };

    //apps
    returnVal.appsTargeting = {
      action: this.bulkEditOptionSelected.apps,
      value: strDto.rtbSites
    };

    //auction
    returnVal.auctionTargeting = {
      action: this.bulkEditOptionSelected.auction,
      value: strDto.auctionTypeTargeting
    };


    // bid cap max
    returnVal.bidCapMax = {
      action: this.bulkEditOptionSelected.budget,
      value: strDto.bidCapMax
    };


    //bid cap min
    returnVal.bidCapMin = {
      action: this.bulkEditOptionSelected.budget,
      value: strDto.bidCapMin
    };

    //budget value
    returnVal.budgetValue = {
      action: this.bulkEditOptionSelected.budget,
      value: strDto.budgetValue
    };



    //creatives
    returnVal.creatives = {
      action: this.bulkEditOptionSelected.creative,
      value: strDto.creatives
    };

    //days
    returnVal.daysTargeting = {
      action: this.bulkEditOptionSelected.days,
      value: strDto.targetDays
    };

    //deal
    returnVal.dealAudienceTargeting = {
      action: this.bulkEditOptionSelected.deal,
      value: strDto.targetDealCategory
    };

    //dmp audience
    returnVal.dmpAudienceTargeting = {
      action: this.bulkEditOptionSelected.audience,
      value: strDto.targetDmpSegments
    };

    //end time
    returnVal.endTime = {
      action: this.bulkEditOptionSelected.schedule,
      value: strDto.endTime
    };


    //geo
    returnVal.geoTargeting = {
      action: this.bulkEditOptionSelected.geo,
      value: strDto.targetGeographies
    };

    //inventory
    returnVal.inventoryTargeting = {
      action: this.bulkEditOptionSelected.inventory,
      value: strDto.rtbAggregators
    };

    //os
    returnVal.mobileOSTargeting = {
      action: this.bulkEditOptionSelected.os,
      value: strDto.targetMobileDevices.targetOperatingSystems
    };

    // name
    // returnVal.name = {
    //   action: this.bulkEditOptionSelected.name,
    //   value: strDto.name
    // };
    returnVal.name = null


    //pacing budget val
    returnVal.pacingBudgetValue = {
      action: this.bulkEditOptionSelected.budget,
      value: strDto.pacingBudgetValue
    };

    //pricing type id
    returnVal.pricingType = {
      action: this.bulkEditOptionSelected.budget,
      value: strDto.pricingType
    };

    //pricing val
    returnVal.pricingValue = {
      action: this.bulkEditOptionSelected.budget,
      value: strDto.pricingValue
    };



    //start time val
    // returnVal.startTime = {
    //   action: this.bulkEditOptionSelected.schedule,
    //   value: strDto.startTime
    // };



    //web audience
    returnVal.webAudienceTargeting = {
      action: this.bulkEditOptionSelected.audience,
      value: strDto.targetWebSegments
    };


    let str: BaseModel[] = [];
    this.strategyList.forEach(x => {
      str.push({ id: x.id, name: x.name });
    });
    returnVal.strategies = str;

    // console.log('converted bulk edit request ==>');
    // console.log(returnVal);
    return returnVal;
  }



  getChipText(operation): string {
    if (operation === StrategyConstants.APPEND) {
      return 'Append';
    } else if (operation === StrategyConstants.REPLACE) {
      return 'Replace';
    } else if (operation === StrategyConstants.NO_CHANGE) {
      return 'No change';
    }
    return '--';
  }







  convertBulkEditReqToUi(req: BulkEditStrategiesDTO, strategys: any[], hideCreativeSection?: boolean): any {
    let arr = [
      { id: PARTS_STR.BASIC, header: 'Details', splitVertically: true, showEdit: false, value: this.getBasicPart(strategys, req.name, req.endTime) },
      { id: PARTS_STR.INVENTORY, header: 'Inventory', splitVertically: false, showEdit: false, value: this.getInventoryPart(req.inventoryTargeting, req.auctionTargeting, req.appsTargeting) },
      { id: PARTS_STR.TARGETING, header: 'Targeting', splitVertically: false, showEdit: false, value: this.getTargetingPart(req.geoTargeting, req.daysTargeting, req.appAudienceTargeting, req.webAudienceTargeting, req.dmpAudienceTargeting, req.mobileOSTargeting, req.dealAudienceTargeting) },
      { id: PARTS_STR.BUDGET, header: 'Budget & Bidding', splitVertically: true, showEdit: false, value: this.getBudgetPart(req.budgetValue, req.pacingBudgetValue, req.pricingType, req.pricingValue, req.bidCapMin, req.bidCapMax) },
      { id: PARTS_STR.CREATIVE, header: 'Creative', splitVertically: false, showEdit: false, value: this.getCreativePart(req.creatives) },
    ];

    if (hideCreativeSection) {
      arr.splice(4, 1);
    }
    return arr;
  }



  getBasicPart(strategy: any[], name: StringEditField, endTime: BigDecimalEditField) {
    const ids = (strategy && strategy.length > 0) ? strategy.map(x => `${x.name} (${x.id})`).join("   ,   ") : '--';
    const nameTitle = 'Name';
    // const startTitle = 'Start Date';
    const endTitle = 'End Date';

    const nameValue = (!name || !name.value || name.action === StrategyConstants.NO_CHANGE) ? '--' : name.value;
    // const startValue = (!startTime || !startTime.value || startTime.action === StrategyConstants.NO_CHANGE) ? '--' : this.getStrategyTime(Number(startTime.value), true);
    const endValue = (!endTime || !endTime.value || endTime.action === StrategyConstants.NO_CHANGE) ? '--' : this.getStrategyTime(Number(endTime.value), false);



    const action = (endTime && endTime.action) ? endTime.action : null;

    const basicPart = [
      { type: 'text', id: 'ids', title: 'Strategy Ids', value: ids },
      // { type: 'text', id: 'name', title: nameTitle, value: nameValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(name.action) },
      // { type: 'text', id: 'startDate', title: startTitle, value: startValue, chipColor:CLR_NO_CHANGE, chipText: this.getChipText(startTime.action) },
      { type: 'text', id: 'endDate', title: endTitle, value: endValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(action) },
    ];
    return basicPart;
  }

  getInventoryPart(inv: RTBAggregatorsEditField, auction: AuctionTypeEditField, apps: RTBSitesEditField) {

    const invTitle = 'Inventory Sources';
    const auctionTitle = 'Auction Type';
    const appsTitle = 'Apps';

    let invType = 'text';
    let appsType = 'text';

    let invValue: any = '--';
    let auctionValue: any = '--';
    let appsValue: any = '--';



    //set value to display
    if (!inv || !inv.value || inv.action === StrategyConstants.NO_CHANGE) {
      invValue = '--';
    } else {
      invType = 'target-or-block'
      invValue = {
        target: (inv.value && inv.value.aggregators) ?
          inv.value.aggregators.targetList : null,
        block: (inv.value && inv.value.aggregators) ?
          inv.value.aggregators.blockedList : null,
        isAll: (inv.value) ? inv.value.selectAllAggregators : true,
        allText: 'Any',
      };

    }

    if (!auction || !auction.value || auction.action === StrategyConstants.NO_CHANGE) {
      auctionValue = '--';
    } else {
      auctionValue = (auction.value === StrategyDTO.AuctionTypeTargetingEnum.FIRST) ?
        'First Price' : (auction.value === StrategyDTO.AuctionTypeTargetingEnum.SECOND) ?
          'Second Price' : 'First Price , Second Price';

    }

    if (!apps || !apps.value || apps.action === StrategyConstants.NO_CHANGE) {
      appsValue = '--';
    } else {
      appsType = 'target-or-block';
      appsValue = {
        target: (apps.value && apps.value.rtbSites) ?
          apps.value.rtbSites.targetList : null,
        block: (apps.value && apps.value.rtbSites) ?
          apps.value.rtbSites.blockedList : null,
        isAll: this.strService.checkIsAllSites(apps.value),
        allText: 'Any',
      };
    }

    const invAction = (inv && inv.action) ? inv.action : null;
    const aucAction = (auction && auction.action) ? auction.action : null;
    const appAction = (apps && apps.action) ? apps.action : null;

    const inventoryPart = [
      { type: invType, id: 'ids', title: invTitle, value: invValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(invAction) },
      { type: 'text', id: 'auction', title: auctionTitle, value: auctionValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(aucAction) },
      { type: appsType, id: 'apps', title: appsTitle, value: appsValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(appAction) },
    ];
    return inventoryPart;

  }

  getTargetingPart(geo: TargetGeoEditField, days: DayPartEditField, appAudience: AudienceStrEditField, webAudince: AudienceStrEditField, dmpAudience: AudienceStrEditField, os: TargetOperatingSystemEditField, deal: DealCategoryEditField) {

    const countryTitle = 'Country';
    const stateTitle = 'State';
    const cityTitle = 'City';
    const daysTitle = 'Daypart';
    const audienceTitle = 'Audience';
    const osTitle = 'Mobile OS';
    const dealTitle = 'Deal Based Targeting';


    // const isCustomGeoTargeting = (this.strDetails.targetGeographies === null || this.strDetails.targetGeographies === undefined)
    //   ? false : this.strDetails.targetGeographies.customGeoTargeting;
    let countryValue: any = '--';
    let countryType = 'text';

    let stateValue: any = '--';
    let stateType = 'text';

    let cityValue: any = '--';
    let cityType = 'text';


    let daysValue: any = '--';
    let daysType = 'text';

    let audienceValue: any = '--';
    let audienceType = 'text';

    let osValue: any = '--';

    let dealValue: any = '--';
    let dealType = 'text';


    if (geo && geo.action != StrategyConstants.NO_CHANGE) {
      countryType = 'target-and-block';
      stateType = 'target-and-block';
      cityType = 'target-and-block';

      const isCustomGeoTargeting = (geo.value) ? geo.value.customGeoTargeting : false;
      const isAllCountry = (geo.value && geo.value.country && (geo.value.country.targetList.length > 0 || geo.value.country.blockedList.length > 0)) ? false : true;
      const isAllState = (geo.value && geo.value.state && (geo.value.state.targetList.length > 0 || geo.value.state.blockedList.length > 0)) ? false : true;
      const isAllCity = (geo.value && geo.value.city && (geo.value.city.targetList.length > 0 || geo.value.city.blockedList.length > 0)) ? false : true;


      countryValue = {
        target: isCustomGeoTargeting ? (geo && geo.value && geo.value.country) ?
          geo.value.country.targetList : [] : [],
        block: isCustomGeoTargeting ? (geo && geo.value && geo.value.country) ?
          geo.value.country.blockedList : [] : [],
        isAll: isAllCountry,
        allText: 'Any',
        targetHeader: 'Any of the below countries',
        blockHeader: 'Any of the below countries'
      }


      stateValue = {
        target: isCustomGeoTargeting ? (geo && geo.value && geo.value.state) ?
          geo.value.state.targetList : [] : [],
        block: isCustomGeoTargeting ? (geo && geo.value && geo.value.state) ?
          geo.value.state.blockedList : [] : [],
        isAll: isAllState,
        allText: 'Any',
        targetHeader: 'Any of the below states',
        blockHeader: 'Any of the below states'
      }

      cityValue = {
        target: isCustomGeoTargeting ? (geo && geo.value && geo.value.city) ?
          geo.value.city.targetList : [] : [],
        block: isCustomGeoTargeting ? (geo && geo.value && geo.value.city) ?
          geo.value.city.blockedList : [] : [],
        isAll: isAllCity,
        allText: 'Any',
        targetHeader: 'Any of the below cities',
        blockHeader: 'Any of the below cities'
      }
    }

    if (appAudience && appAudience.value && appAudience.action != StrategyConstants.NO_CHANGE) {

      audienceType = 'target-and-block';
      const isCustomSegment = ((appAudience.value && appAudience.value.customSegmentTargeting) || (webAudince.value && webAudince.value.customSegmentTargeting) || (dmpAudience.value && dmpAudience.value.targetedSegments));
      audienceValue = {
        target: isCustomSegment ? this.strService.getAudienceSegments(true, appAudience.value, webAudince.value, dmpAudience.value) : [],
        block: isCustomSegment ? this.strService.getAudienceSegments(false, appAudience.value, webAudince.value, dmpAudience.value) : [],
        isAll: !isCustomSegment,
        allText: 'Any',
        targetHeader: (appAudience.value.targetedSegments) ?
          (appAudience.value.targetedSegmentsOperator === 'AND') ?
            'All of the below audience(s)' : 'Any of the below audience(s)' : '',
        blockHeader: 'Any of the below audience(s)'
      }


    }

    if (deal && deal.value && deal.action != StrategyConstants.NO_CHANGE) {
      dealType = 'target-and-block';
      const isAllDealCategory = (deal.value && !deal.value.selectAll
        && deal.value.dealCategory && deal.value.dealCategory.targetList
        && deal.value.dealCategory.targetList.length > 0) ? false : true;

      dealValue = {
        target: !isAllDealCategory ? this.strService.getDealCategories(deal.value) : [],
        block: [],
        isAll: isAllDealCategory,
        allText: 'Any',
        targetHeader: 'Any of the below deal categories',
        blockHeader: ''
      }
    }


    if (os && os.value && os.action != StrategyConstants.NO_CHANGE) {
      let arg: TargetMobileDevices = {
        targetOperatingSystems: os.value
      }
      osValue = this.strService.getMobileOS(arg);
    }

    if (days && days.value && days.action != StrategyConstants.NO_CHANGE) {
      daysType = 'daypart';
      daysValue = this.strService.getDayParts(days.value);
    }



    const geoAction = (geo && geo.action) ? geo.action : null;
    const audienceAction = (appAudience && appAudience.action) ? appAudience.action : (webAudince && webAudince.action) ? webAudince.action : (dmpAudience && dmpAudience.action) ? dmpAudience.action : null;
    const daysAction = (days && days.action) ? days.action : null;
    const osAction = (os && os.action) ? os.action : null;
    const dealAction = (deal && deal.action) ? deal.action : null;


    const targetingPart = [
      { type: countryType, id: 'country', title: countryTitle, value: countryValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(geoAction) },
      { type: stateType, id: 'state', title: stateTitle, value: stateValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(geoAction) },
      { type: cityType, id: 'city', title: cityTitle, value: cityValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(geoAction) },
      { type: audienceType, id: 'audience', title: audienceTitle, value: audienceValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(audienceAction) },
      { type: daysType, id: 'daypart', title: daysTitle, value: daysValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(daysAction) },
      { type: 'text', id: 'mobileOS', title: osTitle, value: osValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(osAction) },
      { type: dealType, id: 'deal', title: dealTitle, value: dealValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(dealAction) },
    ];
    return targetingPart;
  }

  getBudgetPart(lifeTime: BigDecimalEditField, dailyMedia: BigDecimalEditField, bidType: BaseModelEditField, bidPrice: BigDecimalEditField, bidRangeMin: BigDecimalEditField, bidRangeMax: BigDecimalEditField) {
    const lifeTimeTitle = 'Lifetime Media Budget';
    const dailyTitle = 'Daily Media Budget';
    const bidTypeTitle = 'Bid Type';
    const bidPriceTitle = 'Bid Price';
    const bidMinTitle = 'Min Bid';
    const bidMaxTitle = 'Max Bid';

    let lifeTimeValue: any = '--';
    let dailyValue: any = '--';
    let bidTypeValue: any = '--';
    let bidPriceValue: any = '--';
    let bidMinValue: any = '--';
    let bidMaxValue: any = '--';

    if (lifeTime && lifeTime.action != StrategyConstants.NO_CHANGE) {
      lifeTimeValue = (!lifeTime || lifeTime.value === null || lifeTime.value === undefined || lifeTime.value === -1) ? 'Unlimited' : `Limit to ${lifeTime.value} (in campaign currency)`;
      dailyValue = (!dailyMedia || !dailyMedia.value) ? '--' : `${dailyMedia.value} campaign currency / Day`;

      const index = bidTypeOpts.findIndex(item => item.value === bidType.value.id);
      bidTypeValue = (index !== -1) ? `${bidTypeOpts[index].title}` : null;

      bidPriceValue = (!bidPrice || bidPrice.value === null || bidPrice.value === undefined) ? '--' : `${bidPrice.value} in campaign currency`;
      bidMinValue = (!bidRangeMin || !bidRangeMin.value) ? '--' : bidRangeMin.value;
      bidMaxValue = (!bidRangeMax || !bidRangeMax.value) ? '--' : bidRangeMax.value;
    }


    //null error handling only
    let budgetAction = null;
    if (lifeTime && lifeTime.action) {
      budgetAction = lifeTime.action;
    } else if (dailyMedia && dailyMedia.action) {
      budgetAction = dailyMedia.action;
    } else if (bidType && bidType.action) {
      budgetAction = bidType.action;
    } else if (bidPrice && bidPrice.action) {
      budgetAction = bidPrice.action;
    } else if (bidRangeMin && bidRangeMin.action) {
      budgetAction = bidRangeMin.action;
    } else if (bidRangeMax && bidRangeMax.action) {
      budgetAction = bidRangeMax.action;
    }


    const budgetPart = [
      { type: 'text', id: 'mediaBudget', title: lifeTimeTitle, value: lifeTimeValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(budgetAction) },
      { type: 'text', id: 'dailyMediaBudget', title: dailyTitle, value: dailyValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(budgetAction) },
      { type: 'text', id: 'bidType', title: bidTypeTitle, value: bidTypeValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(budgetAction) },
      { type: 'text', id: 'bidPrice', title: bidPriceTitle, value: bidPriceValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(budgetAction) },
      { type: 'text', id: 'bidMin', title: bidMinTitle, value: bidMinValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(budgetAction) },
      { type: 'text', id: 'bidMax', title: bidMaxTitle, value: bidMaxValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(budgetAction) },
    ];
    return budgetPart;
  }


  getCreativePart(cr: BaseModelListEditField) {

    const crTitle = 'Creatives';
    let crType = 'text';
    let crValue: any = '--';

    if (cr && cr.action != StrategyConstants.NO_CHANGE) {
      crType = 'creative';
      crValue = this.strService.modCreativeDetails(cr.value);
    }

    const crAction = (cr && cr.action) ? cr.action : null;
    const creativePart = [
      { type: crType, id: 'creatives', title: crTitle, value: crValue, chipColor: CLR_NO_CHANGE, chipText: this.getChipText(crAction) }
    ];
    return creativePart;
  }



  getStrategyTime(datetime: number, isStartTime: boolean) {
    if (isStartTime) {
      return (datetime === -1) ? '--' : moment(this.commonService.getDateFromEpoch(datetime)).format('DD MMM YYYY h:mm A');
    }
    //for end-time or well defined start-time
    return (datetime === -1) ? 'Never Ending' : moment(this.commonService.getDateFromEpoch(datetime)).format('DD MMM YYYY h:mm A');
  }







}

