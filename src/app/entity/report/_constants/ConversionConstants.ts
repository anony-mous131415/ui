export class ConversionConstants {

  public static FILTER_COLUMN = { // these are used as 'column-feild' in filter object
    ADVERTISER: 'advertisers',
    CAMPAIGN: 'campaign_id',
    STRATEGY: 'strategy_id',


    CONVERSION_TYPE: 'conversion_type'

  };

  // public static UI_TYPE = { //ui usage
  //     INCLUDE: 'Include',
  //     EXCLUDE: 'Exclude'
  // };


  public static CONV_TYPE = {
    CLICK: "'CLICK'",
    VIEW: "'VIEW'",
  };

  public static PAGE_INVALID = 'Conversion type is required.';
}
