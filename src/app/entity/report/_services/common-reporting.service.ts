import { Injectable } from '@angular/core';
import { SearchRequest, ReportingRequest, FilterModel } from '@revxui/api-client-ts/model/models';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { Router } from '@angular/router';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import * as moment from 'moment';
import { CommonService } from '@app/shared/_services/common.service';


export interface ListApiParams {
  refresh?: boolean;
  sort?: string;
  pageNo?: number;
  pageSize?: number;
  request?: SearchRequest;
}

export interface DisaplayUi {
  isArray: boolean;
  type: string;
  arrayOfObjects: GridData[];
}

export interface ConversionUiMetrics {
  value: string,
  label: string,
  isSelected: boolean,
  isDisplayed: boolean
}


export interface ModalObject {
  map: Map<number, boolean>;
  set: Set<GridData>;
}

export interface GridData {
  id: number;
  name: string;
  isNotSelected: boolean;
}

export interface CheckBoxesObj {
  label: string;
  value: any;
  select: boolean;
}




@Injectable({
  providedIn: 'root'
})
export class CommonReportingService {

  /**
   * this represents all the columns in the results page of advanced, conversion and video reporting
   */
  allColumnProperties: any = {
    impressions: {
      id: 'impressions',
      columnsToDisplay: ['impressions'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.impressions,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    clicks: {
      id: 'clicks',
      columnsToDisplay: ['clicks'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Clicks',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.clicks,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    invalid_clicks: {
      id: 'invalid_clicks',
      columnsToDisplay: ['invalid_clicks'],
      reportType: [AppConstants.REPORTS.ADVANCED], 

      title: 'Invalid Clicks',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.invalid_clicks,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    total_install: {
      id: 'total_install',
      columnsToDisplay: ['total_install'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Total Installs',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.total_install,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    imp_installs: {
      id: 'imp_installs',
      columnsToDisplay: ['imp_installs'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'View Installs',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_installs,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    click_installs: {
      id: 'click_installs',
      columnsToDisplay: ['click_installs'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Click Installs',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.click_installs,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    conversions: {
      id: 'conversions',
      columnsToDisplay: ['conversions'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Conversions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.conversions,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    conversions_view: {
      id: 'conversions_view',
      columnsToDisplay: ['conversions_view'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'View Conversions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.conversions_view,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    conversions_click: {
      id: 'conversions_click',
      columnsToDisplay: ['conversions_click'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Click Conversions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.conversions_click,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    revenue: {
      id: 'revenue',
      columnsToDisplay: ['revenue'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'ADV SPEND',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.revenue,
        AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.currency.code])}`
    },
    spend: {
      id: 'spend',
      columnsToDisplay: ['spend'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'MEDIA SPEND',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.spend,
        AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.currency.code])}`
    },
    margin: {
      id: 'margin',
      columnsToDisplay: ['margin'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'MARGIN',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.margin,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    ctr: {
      id: 'ctr',
      columnsToDisplay: ['ctr'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CTR',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.ctr,
        AppConstants.NUMBER_TYPE_PERCENTAGE)}`
    },
    ctc: {
      id: 'ctc',
      columnsToDisplay: ['ctc'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CTC',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.ctc,
        AppConstants.NUMBER_TYPE_PERCENTAGE)}`
    },
    cpi: {
      id: 'cpi',
      columnsToDisplay: ['cpi'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CPI',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.cpi,
        AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.currency.code])}`
    },
    iti: {
      id: 'iti',
      columnsToDisplay: ['iti'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'ITI',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.iti,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    conv_rate: {
      id: 'conv_rate',
      columnsToDisplay: ['conv_rate'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CR',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.conv_rate,
        AppConstants.NUMBER_TYPE_PERCENTAGE)}`
    },
    cvr: {
      id: 'cvr',
      columnsToDisplay: ['cvr'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CVR',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.cvr,
        AppConstants.NUMBER_TYPE_PERCENTAGE)}`
    },
    click_txn_amount: {
      id: 'click_txn_amount',
      columnsToDisplay: ['click_txn_amount'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CLICK TXN AMOUNT',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.click_txn_amount,
        AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.currency.code])}`
    },
    view_txn_amount: {
      id: 'view_txn_amount',
      columnsToDisplay: ['view_txn_amount'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'VIEW TXN AMOUNT',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.view_txn_amount,
        AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.currency.code])}`
    },
    roi: {
      id: 'roi',
      columnsToDisplay: ['roi'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'ROI',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.roi,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    //REVX-568 : hiding bid price from ui
    // bid_price: {
    //   id: 'bid_price',
    //   columnsToDisplay: ['bid_price'],
    //   reportType: [AppConstants.REPORTS.ADVANCED], 
    //   title: 'BID PRICE',
    //   colWidthSmall: true,
    //   cell: (element: any) => `${this.cs.nrFormatWithComma(element.bid_price,
    //     AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.bid_price_currency.code])}`
    // },

    imp_per_conv: {
      id: 'imp_per_conv',
      columnsToDisplay: ['imp_per_conv'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'IMP PER CONV',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_per_conv,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    publisher_ecpm: {
      id: 'publisher_ecpm',
      columnsToDisplay: ['publisher_ecpm'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'PUBLISHER ECPM',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.publisher_ecpm,
        AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.currency.code])}`
    },
    publisher_ecpc: {
      id: 'publisher_ecpc',
      columnsToDisplay: ['publisher_ecpc'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'ECPC',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.publisher_ecpc,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    publisher_ecpa: {
      id: 'publisher_ecpa',
      columnsToDisplay: ['publisher_ecpa'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'ECPA',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.publisher_ecpa,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    txn_amount: {
      id: 'txn_amount',
      columnsToDisplay: ['txn_amount'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'ADV REVENUE',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.txn_amount,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },
    advertiser_ecpm: {
      id: 'advertiser_ecpm',
      columnsToDisplay: ['advertiser_ecpm'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'AdVERTISER ECPM',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.advertiser_ecpm,
        AppConstants.NUMBER_TYPE_CURRENCY, true, AppConstants.CURRENCY_MAP[element.currency.code])}`
    },
    advertiser: {
      id: 'advertiser',
      columnsToDisplay: ['advertiser'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.CONVERSION, AppConstants.REPORTS.VIDEO],
      title: 'ADVERTISER',
      colWidthSmall: false,
      cell: (element: any) => `${element.advertiser.name}`
    },
    aggregator: {
      id: 'aggregator',
      columnsToDisplay: ['aggregator'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'AGGREGATOR',
      colWidthSmall: false,
      cell: (element: any) => `${element.aggregator.name}`
    },
    campaign: {
      id: 'campaign',
      columnsToDisplay: ['campaign'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.CONVERSION, AppConstants.REPORTS.VIDEO],
      title: 'CAMPAIGN',
      colWidthSmall: false,
      cell: (element: any) => `${element.campaign.name}`
    },
    strategy: {
      id: 'strategy',
      columnsToDisplay: ['strategy'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.CONVERSION, AppConstants.REPORTS.VIDEO],
      title: 'STRATEGY',
      colWidthSmall: false,
      cell: (element: any) => `${element.strategy.name}`
    },
    site: {
      id: 'site',
      columnsToDisplay: ['site', 'app_store_certified', 'app_rating', 'app_categories'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'SITE',
      colWidthSmall: false,
      cell: (element: any) => `${element.site.name}`
    },
    app_store_certified: {
      id: 'app_store_certified',
      columnsToDisplay: ['app_store_certified'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'APP STORE CERTIFIED',
      colWidthSmall: true,
      cell: (element: any) => `${element.app_store_certified}`
    },
    app_rating: {
      id: 'app_rating',
      columnsToDisplay: ['app_rating'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'APP RATING',
      colWidthSmall: true,
      cell: (element: any) => `${element.app_rating}`
    },

    app_categories: {
      id: 'app_categories',
      columnsToDisplay: ['app_categories'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'APP CATEGORIES',
      colWidthSmall: true,
      cell: (element: any) => `${element.app_categories}`
    },

    country: {
      id: 'country',
      columnsToDisplay: ['country'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'COUNTRY',
      colWidthSmall: false,
      cell: (element: any) => `${element.country.name}`
    },
    state: {
      id: 'state',
      columnsToDisplay: ['state'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'STATE',
      colWidthSmall: false,
      cell: (element: any) => `${element.state.name}`
    },
    city: {
      id: 'city',
      columnsToDisplay: ['city'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CITY',
      colWidthSmall: false,
      cell: (element: any) => `${element.city.name}`
    },
    creative: {
      id: 'creative',
      columnsToDisplay: ['creative'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'CREATIVE',
      colWidthSmall: false,
      cell: (element: any) => `${element.creative.name}`
    },
    creative_size: {
      id: 'creative_size',
      columnsToDisplay: ['creative_size'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'CREATIVE SIZE',
      colWidthSmall: true,
      cell: (element: any) => `${element.creative_size}`
    },
    creative_offer_type: {
      id: 'creative_offer_type',
      columnsToDisplay: ['creative_offer_type'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'OFFER TYPE',
      colWidthSmall: true,
      cell: (element: any) => `${element.creative_offer_type}`
    },
    advertiser_pricing: {
      id: 'advertiser_pricing',
      columnsToDisplay: ['advertiser_pricing'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'ADVERTISER PRICING',
      colWidthSmall: true,
      cell: (element: any) => `${element.advertiser_pricing}`
    },
    media_type: {
      id: 'media_type',
      columnsToDisplay: ['media_type'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'MEDIA TYPE',
      colWidthSmall: true,
      cell: (element: any) => `${element.media_type}`
    },
    bid_strategy: {
      id: 'bid_strategy',
      columnsToDisplay: ['bid_strategy'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'BID STRATEGY',
      colWidthSmall: true,
      cell: (element: any) => `${element.bid_strategy}`
    },
    optimization_type: {
      id: 'optimization_type',
      columnsToDisplay: ['optimization_type'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'OPTIMIZATION TYPE',
      colWidthSmall: true,
      cell: (element: any) => `${element.optimization_type}`
    },
    position: {
      id: 'position',
      columnsToDisplay: ['position'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'FOLD POSITION',
      colWidthSmall: true,
      cell: (element: any) => `${element.position}`
    },
    source_type: {
      id: 'source_type',
      columnsToDisplay: ['source_type'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'CHANNELS',
      colWidthSmall: true,
      cell: (element: any) => `${element.source_type}`
    },
    os: {
      id: 'os',
      columnsToDisplay: ['os'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'OPERATING SYSTEM',
      colWidthSmall: true,
      cell: (element: any) => `${element.os.name}`
    },
    device_brand: {
      id: 'device_brand',
      columnsToDisplay: ['device_brand'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'BRAND',
      colWidthSmall: false,
      cell: (element: any) => `${element.device_brand}`
    },
    device_model: {
      id: 'device_model',
      columnsToDisplay: ['device_model'],
      reportType: [AppConstants.REPORTS.ADVANCED], 
      title: 'MODEL',
      colWidthSmall: false,
      cell: (element: any) => `${element.device_model}`
    },
    ts_utc_hour: {
      id: 'ts_utc_hour',
      columnsToDisplay: ['ts_utc_hour'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Hour',
      colWidthSmall: false,
      cell: (element: any) => `${moment.utc(element.ts_utc_hour * 1000).format('DD MMM YYYY HH:mm')}`
    },
    ts_utc_day: {
      id: 'ts_utc_day',
      columnsToDisplay: ['ts_utc_day'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Date',
      colWidthSmall: false,
      cell: (element: any) => `${moment.utc(element.ts_utc_day * 1000).format('DD MMM YYYY')}`
    },
    ts_utc_week: {
      id: 'ts_utc_week',
      columnsToDisplay: ['ts_utc_week'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Week of',
      colWidthSmall: false,
      cell: (element: any) => `${moment.utc(element.ts_utc_week * 1000).format('DD MMM YYYY')}`
    },
    timestamp: {
      id: 'timestamp',
      columnsToDisplay: ['timestamp'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Month',
      colWidthSmall: false,
      cell: (element: any) => `${moment.utc(element.timestamp * 1000).format('MMM YYYY')}`
    },
    starttime: {
      id: 'starttime',
      columnsToDisplay: ['starttime'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'Start Time',
      colWidthSmall: false,
      cell: (element: any) => `${moment.utc(element.starttime).format('DD MMM YYYY HH:mm')}`
    },
    endtime: {
      id: 'endtime',
      columnsToDisplay: ['endtime'],
      reportType: [AppConstants.REPORTS.ADVANCED, AppConstants.REPORTS.VIDEO], 
      title: 'End Time',
      colWidthSmall: false,
      cell: (element: any) => `${moment.utc(element.endtime).format('DD MMM YYYY HH:mm')}`
    },

    //CONVERSION METRICS BEGINS
    conversion_type: {
      id: 'conversion_type',
      columnsToDisplay: ['conversion_type'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'type',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.conversion_type}`
    },

    conversion_time: {
      id: 'conversion_time',
      columnsToDisplay: ['conversion_time'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'timestamp',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${moment.utc(element.conversion_time * 1000).format('DD MMM YYYY , h:mm a')}`
    },

    user_ip: {
      id: 'user_ip',
      columnsToDisplay: ['user_ip'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'ip',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.user_ip}`
    },

    user_id: {
      id: 'user_id',
      columnsToDisplay: ['user_id'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'user id',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.user_id}`
    },

    transaction_id: {
      id: 'transaction_id',
      columnsToDisplay: ['transaction_id'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'transaction id',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.transaction_id}`
    },

    transaction_currency: {
      id: 'transaction_currency',
      columnsToDisplay: ['transaction_currency'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'transaction currency',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.transaction_currency}`
    },

    transaction_amount: {
      id: 'transaction_amount',
      columnsToDisplay: ['transaction_amount'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'transaction amount',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.transaction_amount, AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    transaction_info: {
      id: 'transaction_info',
      columnsToDisplay: ['transaction_info'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'additional info',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.transaction_info}`
    },

    time_since_click_minutes: {
      id: 'time_since_click_minutes',
      columnsToDisplay: ['time_since_click_minutes'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'time since click',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.time_since_click_minutes} minutes`
    },

    time_since_impression_minutes: {
      id: 'time_since_impression_minutes',
      columnsToDisplay: ['time_since_impression_minutes'],
      reportType: [AppConstants.REPORTS.CONVERSION],
      title: 'time since impression',
      colWidthSmall: true,
      isSelected: true,
      cell: (element: any) => `${element.time_since_impression_minutes} minutes`
    }, 

    imp_video_start: {
      id: 'imp_video_start',
      columnsToDisplay: ['imp_video_start'],
      reportType: [AppConstants.REPORTS.VIDEO], 
      title: 'Video Start Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_video_start,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    imp_video_pause: {
      id: 'imp_video_pause',
      columnsToDisplay: ['imp_video_pause'],
      reportType: [AppConstants.REPORTS.VIDEO], 
      title: 'Video Pause Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_video_pause,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    imp_video_skip: {
      id: 'imp_video_skip',
      columnsToDisplay: ['imp_video_skip'],
      reportType: [AppConstants.REPORTS.VIDEO], 
      title: 'Video Skip Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_video_skip,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    imp_video_first_quartile: {
      id: 'imp_video_first_quartile',
      columnsToDisplay: ['imp_video_first_quartile'],
      reportType: [AppConstants.REPORTS.VIDEO], 
      title: 'Video 1st Quartile Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_video_first_quartile,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    imp_video_second_quartile: {
      id: 'imp_video_second_quartile',
      columnsToDisplay: ['imp_video_second_quartile'],
      reportType: [AppConstants.REPORTS.VIDEO], 
      title: 'Video 2nd Quartile Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_video_second_quartile,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    imp_video_third_quartile: {
      id: 'imp_video_third_quartile',
      columnsToDisplay: ['imp_video_third_quartile'],
      reportType: [AppConstants.REPORTS.VIDEO], 
      title: 'Video 3rd Quartile Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_video_third_quartile,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    imp_video_complete: {
      id: 'imp_video_complete',
      columnsToDisplay: ['imp_video_complete'],
      reportType: [AppConstants.REPORTS.VIDEO], 
      title: 'Video Complete Impressions',
      colWidthSmall: true,
      cell: (element: any) => `${this.cs.nrFormatWithComma(element.imp_video_complete,
        AppConstants.NUMBER_TYPE_NOTHING)}`
    },

    native_video: {
      id: 'native_video',
      columnsToDisplay: ['native_video'],
      reportType: [AppConstants.REPORTS.VIDEO],
      title: 'Native Video',
      colWidthSmall: true,
      cell: (element: any) => `${element.native_video}`
    }


  };


  constructor(
    private router: Router,
    private cs: CommonService
  ) { }


  /**
   *
   * @param inpDate
   * converts inpDate to the UTC-epoch of 12am of inpDate
   *
   */
  //changed for reporting
  getEpoch(inpDate: Date) {
    const date: number = Date.UTC(inpDate.getFullYear(), inpDate.getMonth(), inpDate.getDate());
    const epoch = date / 1000;
    return epoch;
  }


  /**
   *
   * @param inputObj
   * when the user make some selection in popup modals and the views the selection , this method returns the data
   * in proper form to view the selected data
   */
  getUiData(inputObj: ModalObject): DisaplayUi {
    let obj: DisaplayUi = { isArray: false, type: AdvancedConstants.UI_TYPE.INCLUDE, arrayOfObjects: [] };
    const arrFromSet = Array.from(inputObj.set);
    const selectedArr: GridData[] = arrFromSet.filter(x => !x.isNotSelected);
    const rejectedArr: GridData[] = arrFromSet.filter(x => x.isNotSelected);

    if (selectedArr.length === inputObj.set.size) {
      obj.isArray = false;
    } else if (rejectedArr.length === inputObj.set.size) {
      obj.isArray = false;
      obj.type = AdvancedConstants.UI_TYPE.EXCLUDE;
    } else if (selectedArr.length <= rejectedArr.length) {
      obj.isArray = true;
      obj.type = AdvancedConstants.UI_TYPE.INCLUDE;
      obj.arrayOfObjects = selectedArr;
    } else if (selectedArr.length > rejectedArr.length) {
      obj.isArray = true;
      obj.type = AdvancedConstants.UI_TYPE.EXCLUDE;
      obj.arrayOfObjects = rejectedArr;
    }
    return obj;
  }


  /**
   *
   * @param inputObj
   * the checked ui indicator is returned from this method for
   * selection in popup modal
   */
  //changed for reporting
  getUiIndicatorForModals(inputObj: ModalObject): boolean {
    let result: boolean = true;
    const arrFromSet = Array.from(inputObj.set);
    const selectedArr: GridData[] = arrFromSet.filter(x => !x.isNotSelected);
    // const rejectedArr: GridData[] = arrFromSet.filter(x => x.isNotSelected);

    if (selectedArr.length === inputObj.set.size) {
      result = false;
    }
    return result;
  }


  /**
   * derives the report type(advanced/conversion) from url
   */
  //changed for reporting
  getReportType() {
    const urlParts = this.router.url.split("/");

    const isResultUi = (urlParts.includes('report') && urlParts.includes('result')) ? true : false;

    const isAdvancedResult = (isResultUi && urlParts.includes('advanced')) ? true : false;
    const isConvResult = (isResultUi && urlParts.includes('conversion')) ? true : false;
    const isVideoResult = urlParts.includes('video') ? true : false;

    if (isAdvancedResult) {
      return AppConstants.REPORTS.ADVANCED; 
    } else if (isConvResult) {
      return AppConstants.REPORTS.CONVERSION;
    } else if(isVideoResult) {
      return AppConstants.REPORTS.VIDEO;
    }else {
      return '';
    }
  }


  /**
   * @param type advanced/conversion
   * for allProperties object , get the advanced or conversion columns only
   */
  getRequiredMetrics(type: string) {
    let returnObject = {}
    for (let [key, value] of Object.entries(this.allColumnProperties)) {
      const propertyObject = this.allColumnProperties[key];
      if (propertyObject.reportType.includes(type)) {
        returnObject[key] = propertyObject;
      }
    }
    return returnObject;
  }




  /**
   *
   * @param filterColumn the column in context
   * @param selectedArr the selected things for that column
   * @param rejectedArr the non-selected things for that column
   * @param set
   * @param masterReq the request in which changes will be done
   * in the api request , the filters[] is modified
   */
  modifyFilterArray(filterColumn: string, selectedArr: any[], rejectedArr: any[], set: Set<GridData>, masterReq: ReportingRequest) {
    let localFilter = {} as FilterModel;
    if (selectedArr.length === set.size || rejectedArr.length === set.size) {

      // remove from filter[]
      this.removeFromMasterFilterArray(filterColumn, masterReq);
    } else if (selectedArr.length <= rejectedArr.length) {
      localFilter = this.formFilterElementWithArray(filterColumn, selectedArr, 'id', 'in');
      this.appendToMasterFilterArray(localFilter, masterReq);
    } else if (selectedArr.length > rejectedArr.length) {
      localFilter = this.formFilterElementWithArray(filterColumn, rejectedArr, 'id', 'not_in');
      this.appendToMasterFilterArray(localFilter, masterReq);
    }

  }


  /**
   *
   * @param column the filter column
   * @param array the values used to filter data
   * @param param the property to be derived (like id/name) from array
   * @param operator in / not-in /equals etc
   *
   * forms 1 element of filter [] only
   */
  formFilterElementWithArray(column, array: any, param?: string, operator?: FilterModel.OperatorEnum): FilterModel {
    const filter = {} as FilterModel;
    const reqParam = (param) ? param : 'id';
    const bool: boolean = (Array.isArray(array) && typeof array[0] === 'object');

    filter.column = column;
    filter.operator = (operator) ? operator : 'in';
    filter.value = (bool) ? this.extractFromObjectArray(array, reqParam) : array;
    return filter;
  }


  /**
   *
   * @param column remove this filter column
   * @param masterReq from this api-request object
   */
  removeFromMasterFilterArray(column: string, masterReq: ReportingRequest) {
    if (masterReq.filters.length) {
      const tempArr = masterReq.filters.filter(element => element.column !== column);
      masterReq.filters = tempArr;
    }
  }

  /**
   *
   * @param inputFilter add this filter
   * @param masterReq to this api-req object
   * @param duplicateAllowed
   */
  appendToMasterFilterArray(inputFilter: FilterModel, masterReq: ReportingRequest, duplicateAllowed?: boolean) {
    let tempArr = [];
    if (!masterReq.filters.length && duplicateAllowed) {
      masterReq.filters.push(inputFilter);
    } else {
      tempArr = masterReq.filters.filter(element => element.column !== inputFilter.column);
      masterReq.filters = tempArr;
      masterReq.filters.push(inputFilter);
    }
  }


  /**
   *
   * @param inputArr given array of objects , each having some properties like id,name
   * @param param the parameter to be derived from the above like (id out of id,name)
   */
  extractFromObjectArray(inputArr: any[], param: string): any[] {
    const result = [];
    switch (param) {
      case 'id':
        inputArr.forEach(obj => {
          result.push(obj.id);
        });
        break;

      case 'name':
        inputArr.forEach(obj => {
          result.push(obj.name);
        });
        break;

      case 'value':
        inputArr.forEach(obj => {
          result.push(obj.value);
        });
        break;
    }

    return result;
  }


  /**
   *
   * @param startDate
   * checks if start-date is today or yesterday
   */
  isYesterdayOrToday(startDate: number) {
    const currDate = new Date();
    const year: number = currDate.getUTCFullYear();
    const month: number = currDate.getUTCMonth();
    const date: number = currDate.getUTCDate();
    const today: Date = new Date(year, month, date);
    const yesterday: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return (startDate === this.getEpoch(today) || startDate === this.getEpoch(yesterday)) ? true : false;
  }



  /**
   *
   * @param date
   * @param masterReq
   * sets the duration epochs in api-request objec
   */
  setDuration(date: Date[], masterReq: ReportingRequest) {
    masterReq.duration = {};
    const isYestOrToday: boolean = this.isYesterdayOrToday(this.getEpoch(date[0]));
    masterReq.duration.start_timestamp = this.getEpoch(date[0]);
    masterReq.duration.end_timestamp = this.getEpoch(date[1]) + 86400;

    if (isYestOrToday) {
      masterReq.duration.end_timestamp = null;
    }
  }


  /**
   *
   * @param masterReq
   * from the api-request object , get the date[]
   */
  getDateRange(masterReq: ReportingRequest): Date[] {
    const dateArr: Date[] = [];

    if (masterReq.duration.end_timestamp === null) {
      masterReq.duration.end_timestamp = masterReq.duration.start_timestamp;
    }

    const enddate = (masterReq.duration.start_timestamp === masterReq.duration.end_timestamp) ?
      masterReq.duration.start_timestamp : masterReq.duration.end_timestamp - 86400;

    dateArr[0] = new Date(moment.utc(masterReq.duration.start_timestamp * 1000).format('llll')); // start Date
    dateArr[1] = new Date(moment.utc(enddate * 1000).format('llll')); // end Date

    return dateArr;
  }





}
