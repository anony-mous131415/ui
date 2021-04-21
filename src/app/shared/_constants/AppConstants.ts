export class AppConstants {

  public static API_PATH = {
    CREATIVE_FILE_UPLOAD: '/v2/api/upload/creative',
    // AUDIENCE_FILE_UPLOAD: '/v2/api/upload/audience',
    AUDIENCE_FILE_UPLOAD: '/v2/api/audience/upload',
    // AUDIENCE_FILE_UPLOAD: '/audience/upload',


  };

  public static API_HEADER = {
    AUTH_TOKEN: 'token',
    // CONTENT_TYPE: 'Content_Type',
    CONTENT_TYPE_MULTIPART_FORM: 'multipart/form-data',
    CONTENT_TYPE_JSON: 'application/json',
    // ACCEPT: 'Accept',
    ACCEPT_JSON: 'application/json',
  };

  public static CACHED_LICENSEE_LIST = 'rvll';
  public static CACHED_TOKEN = 'rvtkn';
  public static CACHED_MASTER_TOKEN = 'rvmtkn';
  public static CACHED_USERNAME = 'rvuname';
  public static CACHED_LICENSEE_NAME = 'lname';
  public static CACHED_ADVERTISER_NAME = 'adname';
  public static CACHED_LOGGEDIN_USER_TYPE = 'lutype';
  public static CACHED_THEME_SETTINGS = 'thsetngs';
  public static CACHED_CURRENCY = 'curr';
  public static CACHED_DATE_RANGE = 'dtrnge';
  public static CACHED_MENUCRUMBS = 'mncrmbs';
  public static CACHED_USER_ROLE = 'usrrole';
  public static CACHED_LICENSEE_SWITCH_OPTION = 'lcswop';
  public static CACHED_SECRET_KEY_CHANGE_OPTION = 'pcop';

  public static USER_HAS_ADVERTISER_ACCESS = 'rdavuno';
  public static ADVERTISER_ID_ENCODED = 'ryptid';



  public static USER_ROLE = {
    READ_ONLY: 'ROLE_RO', // hide create-button on menu-crumbs
    DEMO: 'ROLE_DEMO', // show create button on menu-crumbs , And DISABLE 'save' buttons
    READ_WRITE: 'ROLE_RW',
  };

  public static HIDE_LOGIN_BOX = 'hlgnbx';

  public static USER_TYPE_SOCIAL = 'social';
  public static USER_TYPE_NORMAL = 'normal';

  public static URL_LOGIN = 'login';
  public static URL_HOME = 'home';
  public static URL_ADVERTISERS = 'advertiser';
  public static URL_STRATEGIES = 'strategy';
  public static URL_CAMPAIGNS = 'campaign';
  public static URL_CREATIVES = 'creative';
  public static URL_AUDIENCE = 'audience';
  public static URL_REPORT = 'report';
  public static URL_NONE = '';

  public static API_VERSION = 'v2';
  public static APIS_USES_MASTER_TOKEN: string[] = ['auth/user-privileges', 'auth/switch-licensee'];
  public static APIS_USES_NO_TOKEN: string[] = ['theme/licensee/', 'logging'];

  public static NUMBER_TYPE_CURRENCY = 'CURRENCY';
  public static NUMBER_TYPE_PERCENTAGE = 'PERCENTAGE';
  public static NUMBER_TYPE_NOTHING = '';


  // Request Cache start
  public static REQUEST_URLS_FOR_CACHING = ['/api/chart', '/api/list', '/api/menucrumbs'];
  public static REQUEST_CACHE_DURATION = 0; // 180000; // 3 MINUTES
  // Request cache end

  // API ENTITY CONSTANTS
  public static ENTITY = {
    ADVERTISER: 'ADVERTISER',
    STRATEGY: 'STRATEGY',
    CAMPAIGN: 'CAMPAIGN',
    CREATIVE: 'CREATIVE',
    AGGREGATOR: 'AGGREGATOR',
    AUDIENCE: 'AUDIENCE',
    DMP_AUDIENCE: 'DMP_AUDIENCE',
    PIXEL: 'PIXEL',
    CATALOG: 'CATALOG',
    CATALOG_DETAILS: 'CATALOG_DETAILS',
    LICENSEE: 'LICENSEE',
    HOMEPAGE: 'HOMEPAGE',
    HOME: 'HOME',
    REPORT: 'REPORT',
    CLICK_DESTINATION: 'CLICK_DESTINATION',
  };
  // UI ROUTE TO API ENTITY MAPER
  public static ROUTE_ENTITY_MAP = {
    advertisers: AppConstants.ENTITY.ADVERTISER,
    strategies: AppConstants.ENTITY.STRATEGY,
    campaigns: AppConstants.ENTITY.CAMPAIGN,
    creatives: AppConstants.ENTITY.CREATIVE,
    home: AppConstants.ENTITY.HOMEPAGE
  };

  public static CURRENCY_MAP = {
    USD: '$',
    INR: '₹',
    AUD: '$',
    GBP: '£',
    EUR: '€',
    JPY: '¥',
    CAD: '$',
    SGD: '$',
    NZD: '$',
    IDR: 'Rp',
    THB: '฿',
    HKD: '$',
    MYR: 'RM',
    PHP: '₱',
    BHD: '.د.ب',
    ILS: '₪',
    TRY: '₺',
    OMR: '﷼',
    QAR: '﷼',
    SAR: '﷼',
    AED: 'د.إ',
    VND: '₫',
    RUB: '₽',
    CNY: '¥',
    KRW: '₩',
    BRL: 'R$' // adding brazilian currency
  };

  public static REPORT_TYPE = {
    ADVANCED: 'advanced',
    CONVERSION: 'conversion',
    SLICEX: 'slicex'
  };


  public static HIDE = 'hide';
  public static DISABLE = 'disable';

  public static POSITIVE = 'true';
  public static NEGATIVE = 'false';

  public static REPORTS = {
    ADVANCED: 'advanced',
    CONVERSION: 'conversion',
    VIDEO: 'video',
    BOTH: 'both',
    SLICEX: 'slicex',
    REPORT_BUILDER: 'report_builder'
  };

  public static WARNING_MSG = 'WARNING: Changes that you made may not be saved.';
}



