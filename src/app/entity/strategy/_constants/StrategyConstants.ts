export const StrategyConstants = {
  PAGE_TITLE_CREATE: 'Create Strategy',
  PAGE_TITLE_EDIT: 'Edit Strategy',

  BTN_ADVERTISER: 'Select',
  BTN_ADVERTISER_EDIT: 'Edit',
  BTN_CAMPAIGN: 'Select',
  BTN_CAMPAIGN_EDIT: 'Edit',

  STEP_TITLE_BASIC: 'Enter Basic Details',
  STEP_TITLE_INVENTORY: 'Select Inventory',
  STEP_TITLE_TARGETING: 'Select Targeting Options',
  STEP_TITLE_BUDGET: 'Specify Budget & Bidding',
  STEP_TITLE_CREATIVES: 'Associate Creatives',
  STEP_TITLE_REVIEW: 'Review Strategy Settings',

  BASIC_SUBHEADER_SCHEDULE: 'Schedule',
  BASIC_SUBHEADER_OTHER: 'Other Settings',

  BASIC_ADVERTISER_LABEL: 'Advertiser',
  BASIC_CAMPAIGN_LABEL: 'Campaign',
  BASIC_CAMPAIGN_TIP: 'All campaigns must be mapped to a particular advertiser and strategies must be mapped to a particular campaign',
  BASIC_CHANNEL_LABEL: 'Channel',
  BASIC_CHANNEL_TIP: '',
  BASIC_STR_NAME_LABEL: 'Strategy Name',
  BASIC_STR_NAME_TIP: 'Ensure that the strategy name is unique.',
  BASIC_STR_NAME_VALIDATION: 'Enter a valid strategy name',
  BASIC_SCHEDULE_START_DATE_LABEL: 'Start Date',
  BASIC_SCHEDULE_START_DATE_TIP: `The start date determines when the strategy will start serving impressions.
   The strategy start date must be after the campaign start date.`,
  BASIC_SCHEDULE_START_DATE_CHECKBOX_LABEL: 'Start Immediately',
  BASIC_SCHEDULE_END_DATE_LABEL: 'End Date',
  BASIC_SCHEDULE_END_DATE_TIP: `The end date determines when the strategy will stop serving impressions.`,
  BASIC_SCHEDULE_END_DATE_CHECKBOX_LABEL: 'Never Ending',
  // BASIC_DAILY_FREQ_CAP_LABEL: 'Daily Frequency Cap',
  BASIC_DAILY_FREQ_CAP_LABEL: 'Frequency Cap',

  BASIC_HOURLY_FREQ_CAP_LABEL: 'Hourly Frequency Cap',
  BASIC_DAILY_FREQ_CAP_TIP: 'Maximum number of ad impressions that can be shown to a user within a given day. Valid values for number of hours are from 1 to 168',

  INVENTORY_SUBHEADER_BRAND_SAFETY: 'Brand Safety',
  INVENTORY_SUBHEADER_INVENTORY_SOURCES: 'Inventory Sources',
  INVENTORY_SUBHEADER_INVENTORY_SOURCES_HINT: `List of exchanges which can be targeted or blocked for advertisement for the strategy.`,
  INVENTORY_SUBHEADER_ANDROID_APP_CATEGORIES: 'Android App Categories',
  INVENTORY_SUBHEADER_IOS_APP_CATEGORIES: 'iOS App Categories',
  INVENTORY_SUBHEADER_APPS: 'Apps',

  INVENTORY_BRAND_SAFETY_LINE1_LABEL: 'Target only apps published on Google and Apple app stores',
  INVENTORY_BRAND_SAFETY_LINE2_LABEL_LEFT: 'Target apps with average user rating of',
  INVENTORY_BRAND_SAFETY_LINE2_LABEL_RIGHT: 'on the app store.',

  INVENTORY_APPS_TITLE_HINT: `Choose to include or exclude certain sites from the RTB list of sites where advertisements are displayed.
  Ensure that you validate the sites before saving them.`,
  INVENTORY_APPS_VALIDATION_HINT: 'Only the valid sites will be saved on clicking save',

  TARGETING_SUBHEADER_GEO_LOC_COUNTRY: 'Country',
  TARGETING_SUBHEADER_GEO_LOC_STATE: 'State',
  TARGETING_SUBHEADER_GEO_LOC_CITY: 'City',
  TARGETING_SUBHEADER_AUDIENCE: 'Audience',
  TARGETING_SUBHEADER_DAY_PART: 'Day part',
  TARGETING_SUBHEADER_DAY_PART_HINT: 'Time of day and day of the week when the strategy would serve advertisement.',
  TARGETING_SUBHEADER_CREATIVE_PLACEMENT: 'Creative Placement',
  TARGETING_SUBHEADER_CONNECTION_TYPE: 'Connection Type',
  TARGETING_SUBHEADER_OS: 'Mobile Operating System',
  TARGETING_SUBHEADER_DEVICE_TYPE: 'Device Type',
  TARGETING_SUBHEADER_MOBILE_BRANDS: 'Mobile Brands',
  TARGETING_SUBHEADER_MOBILE_MODELS: 'Mobile Models',

  TARGETING_SUBHEADER_DEAL_BASED: 'Deal based audience targeting',
  TARGETING_SUBHEADER_ADVANCED_TARG_ALL: 'All Segments',
  TARGETING_ADVANCED: 'Advanced Targeting',



  BUDGET_SUBHEADER_BUDGET: 'Budget',
  BUDGET_SUBHEADER_BIDDING: 'Bidding',

  BUDGET_MEDIA_BUDGET_LABEL: 'Lifetime Media Budget',
  BUDGET_MEDIA_BUDGET_TIP: 'Maximum media spend during the lifetime of the strategy.',
  BUDGET_DAILY_MEDIA_BUDGET_LABEL: 'Daily Media Budget',
  BUDGET_DAILY_MEDIA_BUDGET_TIP: 'Maximum daily media spend of the strategy.',
  BUDGET_PACING_LABEL: 'Budget Pacing',
  BUDGET_PACING_TIP: `Specify how the strategy budget should be spent with time. You may choose to spend it evenly or ASAP.`,
  BUDGET_BID_TYPE_LABEL: 'Bid Type',
  BUDGET_BID_TYPE_TIP: `Select CPM to pay for thousand impressions (or views of the advertisement)
  Select CPC to pay based on the number of clicks
  Select CPA to pay based on the number of acquisitions
  Select CPI to pay based on the number of installs`,
  BUDGET_BID_PRICE_LABEL: 'Bid Price',
  BUDGET_BID_RANGE_LABEL: 'Bid Range',
  BUDGET_BID_RANGE_TIP: 'Select the CPM range to limit the overall bid value for your strategy',

  DUP_MODAL_TITLE: 'Duplicate this strategy',
  DUP_MODAL_TITLE_HINT: 'Create a copy of this strategy',
  DUP_MODAL_TARGETING_DIVIDER_TITLE: 'These settings of original strategy will be carried forward in the duplicate strategy. Deselect the one which you do not want to be copied.',
  DUP_MODAL_DELIVERY_TARGET_TITLE: 'Delivery Targeting',
  DUP_MODAL_DELIVERY_TARGET_HINT: '',
  DUP_MODAL_INVENTORY_TITLE: 'Inventory',
  DUP_MODAL_INVENTORY_HINT: '',
  DUP_MODAL_INVENTORY_CHECKBOX_TITLE: 'Inventory Sources and Sites',
  DUP_MODAL_CREATIVES_TITLE: 'Creatives',
  DUP_MODAL_CREATIVES_HINT: '',
  DUP_MODAL_CREATIVES_CHECKBOX_TITLE: 'All Creatives assigned to the original strategy',

  INVENTORY_SOURCES_TARGET_ALL_TEXT: 'All Inventory Sources',
  ANDROID_APP_CATEGORY_TARGET_ALL_TEXT: 'All Android App Categories',
  IOS_APP_CATEGORY_TARGET_ALL_TEXT: 'All IOS App Categories',
  APP_TARGET_ALL_TEXT: 'All Apps',
  COUNTRY_TARGET_ALL_TEXT: 'All Countries',
  STATE_TARGET_ALL_TEXT: 'All States',
  CITY_TARGET_ALL_TEXT: 'All Cities',
  AUDIENCE_TARGET_ALL_TEXT: 'All Audiences',
  MOBILE_BRANDS_TARGET_ALL_TEXT: 'All Mobile brands',
  MOBILE_MODELS_TARGET_ALL_TEXT: 'All Mobile models',

  DEAL_CATEGORY_TARGET_ALL_TEXT: 'All Deal categories',

  // REVX-127
  TARGETING_SUBHEADER_AUCTION_TYPE: 'Auction Type',

  // REVX-352
  CPA_TARGET_TITLE: 'Campaign CPA Value',
  CPA_TARGET_MESSAGE: `The filled CPA bid price would be taken as CPA target at campaign level,
   since it is not filled in the campaign details.`,
  CPA_TARGET_NO_TEXT: 'Enter Campaign CPA Target',
  CPA_TARGET_ERROR_MESSAGE: 'Please enter a value greater than 0.',


  //REVX-724 : skad-ui changes
  SKAD_CAMPAIGN_LIMIT_REACHED: 'The selected campaign does not have the privledge to create a SKAD strategy.',

  //REVX-371 : strategy bulk edit constants begin
  APPEND: 'APPEND',
  REPLACE: 'REPLACE',
  NO_CHANGE: 'NO_CHANGE',


  APPEND_MSG: {
    NAME: 'The entered name will be appended at the end of existing name of each strategy.',

    INVENTORY_SRC: 'Inventory sources added will be targeted/blocked in addition to pre-existing lists in indivisual strategies.',
    APPS: 'Inventory sources added will be targeted/blocked in addition to pre-existing lists in indivisual strategies.',
    GEO: 'Geos selected will be targeted/blocked in addition to pre-existing geos in target/block of indivisual strategies.',
    AUDIENCE: 'Audience selected for targeting/blocking will be targeted and blocked from all the selected strategies. Any/All options will be the same as existing in indivisual strategies , the selected audience will get added to the target/block list.',
    DEAL: 'Deals selected will be added to the already selected list of indivisual strategies.',
    CREATIVE: 'Creatives selected will be added to pre-existing creatives in the indivisual strategy.',

  },


  REPLACE_MSG: {
    GENERIC: 'This will replace all the previous selections with the current ones in the indivisual strategy.',
    BUDGET: 'Budget input here will replace the pre-existing limit in the selected strategies.',
    SCHEDULE: 'New end date will apply to all the selected strategies.'
  },


  BULK_EDIT_KEYS: {
    NAME: 'name',
    SCHEDULE: 'schedule',
    INVENTORY: 'inventory',
    AUCTION: 'auction',
    APPS: 'apps',
    GEO: 'geo',
    AUDIENCE: 'audience',
    DAYS: 'days',
    OS: 'os',
    DEAL: 'deal',
    BUDGET: 'budget',
    CREATIVE: 'creative'
  }



};
