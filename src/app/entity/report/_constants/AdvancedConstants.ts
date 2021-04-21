export class AdvancedConstants {

    public static INTERVAL = {
        NONE: 0,
        HOURLY: 1,
        DAILY: 2,
        WEEKLY: 3,
        MONTHLY: 4,
    };

    public static ENTITY = { //used for switch-cases in ui only
        CREATIVE_SIZE: 'CREATIVE_SIZE',
        PRICING: 'PRICING',
        POSITIONS: 'POSITOINS',
        COUNTRY: 'COUNTRY',
        STATE: 'STATE',
        CITY: 'CITY',
        BASIC: 'BASIC',
        METRICS: 'METRICS',
        CREATIVE_MEDIA: 'MEDIA',
        FILTERS: 'FILTERS',
        GROUP_BY: 'GROUP_BY',
        CURRENCY: 'CURRENCY',
        CHANNELS: 'CHANNELS',
        GEOGRAPHY: 'GEOGRAPHY'
    };

    public static FILTER_COLUMN = { //these are used as 'column-feild' in filter object
        ADVERTISER: 'advertiser',
        CAMPAIGN: 'campaign',
        STRATEGY: 'strategy',
        CREATIVE: 'creative',
        AGGREGATOR: 'aggregator',
        CREATIVE_SIZE: 'creative_size',
        CR_WIDTH: 'creative_width',
        CR_HEIGHT: 'creative_height',
        COUNTRY: 'country',
        STATE: 'state',
        CITY: 'city',
        CREATIVE_MEDIA: 'media_type',
        CHANNEL: 'source_type',
        PRICING: 'advertiser_pricing',
        POSITION: 'position'

    };

    public static UI_TYPE = { //ui usage
        INCLUDE: 'Include',
        EXCLUDE: 'Exclude'
    };


    public static MEDIA_TYPE = {
        BANNER: 1,
        POP: 2,
    };

    public static POSITIONS = {
        NOT_AVAILABLE: 1,
        ABOVE_FOLD: 2,
        BELOW_FOLD: 3,
        PARTIAL_ABOVE_FOLD: 4,
    };

    public static TABLE = {
        LEFT_MOST: 1,
        CENTER: 2,
        RIGHT_MOST: 3,
    };


    public static CHANNELS = {
        DESKTOP: 1,
        MOBILE_APP: 2,
        MOBILE_WEB: 3,
    };

    public static MESSAGE = {
        GROUPBY_LIMIT: 'More than 7 \'Group By\' options selected.',
        NO_METRIC_SELECTED: 'Select atleast one \'Metric\' to run the report.'
    };



    public static DEFINATION = {

        IMPRESSION: 'The Ad shown to the user is called as Impression.',
        CLICK: 'If user click on the Impression then that event is called as click.',
        INVALID_CLICK: 'In Tracker we mark click as invalid due to number of reason like, if for a given click we don\'t have any impression then tracker mark those clicks as invlaid clicks.',
        INSTALL: 'If user installs an app that event is called as Install.',
        VIEW_INSTALL: 'If for the given install we don\'t find click but only the impression.',
        CLICK_INSTALL: 'If for the given install we find the click.',
        CONVERSION: 'If the user make a transaction on the advertiser app and we trace that back to any impression then event is called as conversion.',

        VIEW_CONV: 'Conversion event for which we don\'t have the click but only impression.',
        CLICK_CONV: 'Converison event for which we have the click.',
        ADV_SPEND: 'The money spent by the Advertiser.',
        MEDIA_SPEND: 'The cost the Advertiser needs to pay, or it is the cost of showing the impressions.',
        MARGIN: 'Advertiser Spend - Media Spend',
        CTR: '(Clicks/Impressions)*100 ',
        CTC: '(Click Conversions/Clicks)*100',

        CPI: 'Media Spend / Installs',
        ITI: 'Impressions / Installs',
        CR: 'total conversion / total installs',
        CVR: '(total conversions * 1000*100)/total impressions',
        CLICK_ADV_REV: 'Sum of transaction amount from the click conversions.',
        VIEW_ADV_REV: 'Sum of transaction amount from the view conversions.',
        ROI: 'Advertiser Revenue / Advertiser Spend',

        BID_PRICE: 'Price of the Bid.',
        IMP_PER_CONV: 'Impressions / Conversions',
        PUB_ECPM: 'Cost of 1000 Impressions = (Media Spend / Impressions) * 1000',
        ECPC: 'Media Spend / Clicks',
        ECPA: 'Media Spend / Total Conversions ',
        ADV_REV: 'Revenue Earned by Advertiser. (Lot of advertiser share there revenue data with the conversion event)',
        ADV_ECPM: 'Advertiser Spend for 1000 Impressions = (Advertiser Spend / Impressions) * 1000 ',
    }

    public static BAN_TOOLTIP = 'Select the row to view children entities .';

}
