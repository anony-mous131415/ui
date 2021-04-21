import { Injectable } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { MetricsBaseModel } from '@app/shared/_models/metrics.base.model';
import { DashboardData } from '@revxui/api-client-ts';
// import { UIConfig } from 'assets/config/config';

export interface baseWidgetModel {
  id: string;
  title: string;
  value: number;
  type: string;
  children: MetricsBaseModel[];
  currencyCode: string;
  valTooltip: string;
}

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {
  // uiConfig = UIConfig;
  constructor(
  ) { }

  /**
   *
   * @param widgetData the api data returned
   * converts the api-response into appropriate object displayed on ui
   */
  public convertApiDataToWidgetData(widgetData: DashboardData) {

    let currencyId = '';

    if (widgetData) {
      currencyId = widgetData.currencyId;
    }
    // console.log("widget data ", widgetData);
    // if RO user removing ecpi, ecpa, ecpm, ecpc, margin, cost
    const userRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);

    const advRevenueChildren: MetricsBaseModel[] = [
      { id: 'cost', value: widgetData && widgetData.cost ? widgetData.cost : 0, title: 'Media Spend', type: AppConstants.NUMBER_TYPE_CURRENCY, currencyCode: currencyId, valTooltip: 'Cost of showing the impressions' },
      { id: 'margin', value: widgetData && widgetData.margin ? widgetData.margin : 0, title: 'Margin', type: AppConstants.NUMBER_TYPE_PERCENTAGE, currencyCode: currencyId, valTooltip: '' },
      { id: 'roi', value: widgetData && widgetData.roi ? widgetData.roi : 0, title: 'ROI', type: AppConstants.NUMBER_TYPE_NOTHING, currencyCode: currencyId, valTooltip: 'Advertiser revenue divided by advertiser spend' },
    ];

    if (userRole === AppConstants.USER_ROLE.READ_ONLY) {
      advRevenueChildren.splice(0, 2);
    }


    let impressionsChildren: MetricsBaseModel[] = [
      { id: 'erpm', value: widgetData && widgetData.erpm ? widgetData.erpm : 0, title: 'eRPM', type: AppConstants.NUMBER_TYPE_CURRENCY, currencyCode: currencyId, valTooltip: 'Effective revenue per million impressions' },
      // { id: 'ecpm', value: widgetData && widgetData.ecpm ? widgetData.ecpm : 0, title: 'eCPM', type: AppConstants.NUMBER_TYPE_CURRENCY },
    ];

    if (userRole === AppConstants.USER_ROLE.READ_ONLY) {
      impressionsChildren = [];
    }

    const clicksChildren: MetricsBaseModel[] = [
      { id: 'erpc', value: widgetData && widgetData.erpc ? widgetData.erpc : 0, title: 'eRPC', type: AppConstants.NUMBER_TYPE_CURRENCY, currencyCode: currencyId, valTooltip: 'Effective Revenue Per Conversion' },
      // { id: 'ecpc', value: widgetData && widgetData.ecpc ? widgetData.ecpc : 0, title: 'eCPC', type: AppConstants.NUMBER_TYPE_CURRENCY },
      { id: 'ctr', value: widgetData && widgetData.ctr ? widgetData.ctr : 0, title: 'CTR', type: AppConstants.NUMBER_TYPE_PERCENTAGE, currencyCode: currencyId, valTooltip: '(Clicks/Impressions)*100' },
    ];

    if (userRole === AppConstants.USER_ROLE.READ_ONLY) {
      clicksChildren.splice(0, 1);
    }

    let conversionsChildren: MetricsBaseModel[] = [
      { id: 'viewConversions', value: widgetData && widgetData.viewConversions ? widgetData.viewConversions : 0, title: 'View Based', type: AppConstants.NUMBER_TYPE_NOTHING, currencyCode: currencyId, valTooltip: 'Conversion events for which only impression is present' },
      // { id: 'ecpa', value: widgetData && widgetData.ecpa ? widgetData.ecpa : 0, title: 'eCPA', type: AppConstants.NUMBER_TYPE_CURRENCY },
      { id: 'erpa', value: widgetData && widgetData.erpa ? widgetData.erpa : 0, title: 'eRPA', type: AppConstants.NUMBER_TYPE_CURRENCY, currencyCode: currencyId, valTooltip: 'Effective revenue per acquisition - EQUATION' },
      { id: 'ctc', value: widgetData && widgetData.ctc ? widgetData.ctc : 0, title: 'CTC', type: AppConstants.NUMBER_TYPE_PERCENTAGE, currencyCode: currencyId, valTooltip: '(Click Conversions/Clicks)*100' },
    ];

    if (userRole === AppConstants.USER_ROLE.READ_ONLY) {
      conversionsChildren.splice(1, 1);
    }

    const installsChildren: MetricsBaseModel[] = [
      { id: 'impInstalls', value: widgetData && widgetData.impInstalls ? widgetData.impInstalls : 0, title: 'View Based', type: AppConstants.NUMBER_TYPE_NOTHING, currencyCode: currencyId, valTooltip: 'Install events for which only impression is found' },
      { id: 'erpi', value: widgetData && widgetData.erpi ? widgetData.erpi : 0, title: 'eRPI', type: AppConstants.NUMBER_TYPE_CURRENCY, currencyCode: currencyId, valTooltip: 'Effective Revenue Per Install' },
      // { id: 'ecpi', value: widgetData && widgetData.ecpi ? widgetData.ecpi : 0, title: 'eCPI', type: AppConstants.NUMBER_TYPE_CURRENCY },
      { id: 'iti', value: widgetData && widgetData.iti ? widgetData.iti : 0, title: 'ITI', type: AppConstants.NUMBER_TYPE_NOTHING, currencyCode: currencyId, valTooltip: 'Impressions / Installs' },
    ];

    if (userRole === AppConstants.USER_ROLE.READ_ONLY) {
      installsChildren.splice(1, 1);
    }

    const reachChildren: MetricsBaseModel[] = [
      { id: 'eligibleUniqUsers', value: widgetData && widgetData.eligibleUniqUsers ? widgetData.eligibleUniqUsers : 0, title: "Eligible UU's", type: AppConstants.NUMBER_TYPE_NOTHING, currencyCode: currencyId, valTooltip: 'Users belonging to the targeted demography' },
      { id: 'impressionUniqUsers', value: widgetData && widgetData.impressionUniqUsers ? widgetData.impressionUniqUsers : 0, title: "Impression UU's", type: AppConstants.NUMBER_TYPE_NOTHING, currencyCode: currencyId, valTooltip: 'Number of times users belonging to the targeted demography received the ad' },
    ];



    const widgets: baseWidgetModel[] = [
      {
        id: 'spend',
        value: widgetData && widgetData.revenue ? widgetData.revenue : 0,
        title: 'Advertiser Spend',
        type: AppConstants.NUMBER_TYPE_CURRENCY,
        children: advRevenueChildren,
        currencyCode: currencyId,
        valTooltip: 'Total revenue spend of advertiser'
      },
      {
        id: 'userReach', // TODO: should be changed
        value: widgetData && widgetData.userReach ? widgetData.userReach : 0,
        title: 'Reach',
        type: AppConstants.NUMBER_TYPE_PERCENTAGE,
        children: reachChildren,
        currencyCode: currencyId,
        valTooltip: 'The count of the people falling under targeted group'
      },
      {
        id: 'impressions',
        value: widgetData && widgetData.impressions ? widgetData.impressions : 0,
        title: 'Impressions',
        type: AppConstants.NUMBER_TYPE_NOTHING,
        children: impressionsChildren,
        currencyCode: currencyId,
        valTooltip: 'Count of ads served to users'
      },

      //REVX-690
      // {
      //   id: 'installs',
      //   value: widgetData && widgetData.installs ? widgetData.installs : 0,
      //   title: 'Installs',
      //   type: AppConstants.NUMBER_TYPE_NOTHING,
      //   children: installsChildren,
      //   currencyCode: currencyId,
      //   valTooltip: 'Number of times the app has been installed'
      // },
      {
        id: 'clicks',
        value: widgetData && widgetData.clicks ? widgetData.clicks : 0,
        title: 'Clicks',
        type: AppConstants.NUMBER_TYPE_NOTHING,
        children: clicksChildren,
        currencyCode: currencyId,
        valTooltip: ''
      },

      {
        id: 'installs',
        value: widgetData && widgetData.installs ? widgetData.installs : 0,
        title: 'Installs',
        type: AppConstants.NUMBER_TYPE_NOTHING,
        children: installsChildren,
        currencyCode: currencyId,
        valTooltip: 'Number of times the app has been installed'
      },

      {
        id: 'conversions',
        value: widgetData && widgetData.conversions ? widgetData.conversions : 0,
        title: 'Conversions',
        type: AppConstants.NUMBER_TYPE_NOTHING,
        children: conversionsChildren,
        currencyCode: currencyId,
        valTooltip: 'Count of user made transactions on the advertiser app successfully traced back to an impression'
      },
    ];

    // const showReachWidget = this.uiConfig.showReachWidget;
    const showReachWidget = true;
    if (!showReachWidget) {
      widgets.splice(1, 1);
    }

    return widgets;
  }
}
