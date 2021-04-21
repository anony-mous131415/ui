export class CampaignConstants {

    public static NEVER_ENDING_EPOCH = 7258118399;
    public static START_IMMEDIATE_EPOCH = -1;



    //constants for select-objective-modal
    public static WEBSITE = 'WEBSITE';
    public static MOBILE_APP_INSTALLS = 'MOBILE_APP_INSTALLS';
    public static MOBILE_APP_ENGAGEMENT = 'MOBILE_APP_ENGAGEMENT';
    public static BRAND_AWARENESS = 'BRAND_AWARENESS';


    //constants for form-subheaders
    public static BASIC_DETAILS = 'Basic Details';
    public static SCHEDULE = 'Schedule';
    public static PRICING_AND_BUDGET = 'Pricing & Budget';
    public static ADVANCED_SETTINGS = 'Advanced Settings';


    //constants for labels
    public static ADVERTISER_LABEL = 'Advertiser';
    public static CAMPAIGN_NAME_LABEL = 'Campaign Name';
    public static RETARGETING_LABEL = 'Retargeting Campaign';
    public static OBJECTIVE_LABEL = 'Campaign Objective';
    public static CONV_TRACK_PIXEL_LABEL = 'Conversion Tracking Pixel';

    public static START_LABEL = 'Start Date';
    public static END_LABEL = 'End Date';

    public static CAMPAIGN_PRICING_LABEL = 'Campaign Pricing';
    public static LIFETIME_MEDIA_BUDGET_LABEL = 'Lifetime Media Budget';
    public static LIFETIME_DELIVERY_CAP_LABEL = 'Lifetime Delivery Cap';
    public static DAILY_MEDIA_BUDGET_LABEL = 'Daily Media Budget';
    public static DAILY_DELIVERY_CAP_LABEL = 'Daily Delivery Cap';

    public static DEFAULT_DAILY_FREQ_CAP_LABEL = 'Default Daily Freq Cap';
    public static LIFETIME_FREQ_CAP_LABEL = 'Lifetime Frequency Cap';
    public static ATTRIBUTION_RATIO_LABEL = 'Attribution Ratio';

  public static CPA_TARGET_LABEL = 'CPA Target';

    //TOOLTIPS
    public static ADVERTISER_TOOLTIP = 'Select an existing advertiser or directly create an advertiser from this page.';
    public static CAMPAIGN_NAME_TOOLTIP = 'It is recommended to use a unique name with naming convention; example <Date>_<Advertiser Name Size>_<Concept Name> (11June1_mobile).';
    // public static RETARGETING_TOOLTIP = 'Is retargeting';
    // public static OBJECTIVE_TOOLTIP = 'Campaign Objective';
    public static CONV_TRACK_PIXEL_TOOLTIP = 'Select the conversion pixel, if the campaign needs to track conversions. This field is mandatory for "CPA" selection of "Campaign Pricing" or "Campaign Goal"';

    public static START_TOOLTIP = 'The start date determines when the campaign will allow its mapped strategies to start displaying advertisements';
    public static END_TOOLTIP = 'This end date will determine when the campaign will stop its mapped strategies from displaying advertisements';

    public static CAMPAIGN_PRICING_TOOLTIP = 'Enter the revenue terms for the campaign, as specified in the campaign RO.' +
        '\n CPM = cost per 1000 impressions' +
        '\n CPC = cost per click' +
        '\n CPA = cost per action (registration, transactions, etc.)' +
        '\n CPI = cost per install' +
        '\n Margin = % commission over cost of media';
    public static LIFETIME_MEDIA_BUDGET_TOOLTIP = 'This is the maximum media spend during the lifetime of a campaign. The campaign and its associated strategies will stop advertisement once lifetime media budget is consumed';
    public static LIFETIME_DELIVERY_CAP_TOOLTIP = 'Maximum lifetime deliveries targeted for this campaign';
    public static DAILY_MEDIA_BUDGET_TOOLTIP = 'Maximum daily media spend of the campaign. The campaign and its associated strategies will stop advertisement once daily budget is consumed for that day';
    public static DAILY_DELIVERY_CAP_TOOLTIP = 'Maximum daily deliveries targeted for this campaign';

    public static DEFAULT_DAILY_FREQ_CAP_TOOLTIP = 'Maximum number of ad impressions that can be shown to a user within a particular day';
    public static LIFETIME_FREQ_CAP_TOOLTIP = 'Maximum number of ad impressions that can be shown to a user within 10 days';
    public static ATTRIBUTION_RATIO_TOOLTIP = 'Enter the percentage of post-view conversions that needs to be attributed towards revenue or return on ad spend (RoAS).' +
        'Enter "0"(zero) if only post-click conversions must be attributed.This value will be ignored if the associated pixel is set to track only post-click conversions';
    public static CPA_TARGET_TOOLTIP = 'Target value to optimize the CPA model';
    //constants for CheckBoxes
    public static START_CHECKBOX = 'Start Immediately';
    public static END_CHECKBOX = ' Never Ending';

    //constants for modal-button
    public static BTN_ADVERTISER = 'Select';
    public static BTN_TRACKING_PIXEL = 'Pixel';


    //constants for details page
    public static COLUMN_STATUS = 'Status';
    public static COLUMN_DATE_CREATED = 'Date Created';
    public static COLUMN_START_TIME = 'Start Time';
    public static COLUMN_LIFETIME_BUDGET = 'Lifetime Media Budget';
    public static COLUMN_LIFETIME_DCAP = 'Lifetime Delivery Cap';
    public static COLUMN_DEFAULT_DAILY_FCAP = 'Default Daily Frequency Cap';
    public static COLUMN_PRICING = 'Pricing';
    public static COLUMN_LIFETIME_FCAP = 'Lifetime Frequency Cap';

    public static COLUMN_ID = 'Campaign ID';
    public static COLUMN_ATTR_RATIO = 'Attribution Ratio';
    public static COLUMN_END_TIME = 'End Time';
    public static COLUMN_DAILY_BUDGET = 'Daily Media Budget';
    public static COLUMN_DAILY_DCAP = 'Daily Delivery Cap';
    public static COLUMN_MAX_FCAP = 'Max Frequency Cap';
  public static CPA_TARGET = 'CPA Target';
    public static COLUMN_TRACKING_PIXEL = 'Tracking Pixel';

    //VALIDATION MESSAGES
    //BASIC DETAILS
    public static VALIDATION_ADVERTISER = 'All campaigns must be associated with advertisers. Select an advertiser.';
    public static VALIDATION_CAMPAIGN_NAME = 'Enter a valid campaign name.';
    public static VALIDATION_OBJECTIVE = 'Select the Campaign Objective from the popup box.';
    public static VALIDATION_PIXEL = 'Select a Pixel.';

    //SCHEDULE
    public static VALIDATION_SCHEDULE = 'End Date must be greater than start date.';
    public static VALIDATION_START_DATE = 'Select a valid start date. Alternately, select ‘Start Immediately’.';
    public static VALIDATION_END_DATE = 'Select a valid end date. Alternately, select ‘Never Ending’.';

    //PRICING
    public static VALIDATION_PRICING_NOT_SELECTED = 'Select the pricing type';
    public static VALIDATION_PRICING_RATE_FOR_MARGIN = 'Please enter a rate between 0 and 99.';
    public static VALIDATION_PRICING_RATE_FOR_NON_MARGIN = 'Please enter a value greater than 0';
    public static VALIDATION_PRICING_VALUE = 'Pricing value cannot be more than daily campaign budget.';
    public static VALIDATION_PRICING_INPUT_BLANK = ' Enter a valid price value. Do not use special characters (., &, $, @,)';

    public static VALIDATION_LIFETIME_MEDIA_BUDGET_BLANK = 'Enter a valid budget. Do not use special characters (., &, $, @,). Alternately, select ‘Unlimited’.';
    public static VALIDATION_LIFETIME_FREQ_CAP = 'Enter a valid lifetime frequency cap. Do not use special characters (., &, $, @,).';

    public static VALIDATION_DAILY_BDGET_LESS = 'Daily budget should be less than lifetime budget.';
    public static VALIDATION_DAILY_DCAP_LESS = 'Daily delivery cap should be less than lifetime delivery cap.';
    public static VALIDATION_DAILY_USER_FCAP_REQ = 'Enter a valid number(this feild is required).';

    public static VALIDATION_LIFETIME_MEDIA_BUDGET = '  Enter a valid  lifetime frequency cap. Do not use special characters (., &, $, @,). Alternately, select ‘Unlimited’..';
    public static VALIDATION_LIFETIME_FCAP_GREATER = '  Lifetime Fcap must be greater than or equal to default daily fcap.';
    public static VALIDATION_ATTR_RATIO = 'Please enter a value between 0 and 100.';
    public static VALIDATION_CPA_TARGET = 'Please enter a value greater than 0.';

    public static END_DATE_EXPIRED = 'Campaign end date should be greater than current time : ';
    public static START_DATE_EXPIRED = 'Campaign start date should be greater than current time : ';


    //COMMON VALIDATIONS
    public static VALIDATION_REQUIRED = 'This feild is required.';
    public static VALIDATION_SPECIAL_CHAR = 'Please enter a valid number.';
    public static VALIDATION_NEGATIVE = 'Please enter a value greater than or equal to 0.';
    public static VALIDATION_REQUIRED_NUMBER_GREATER_THAN_ZERO = 'Please enter a value greater than or equal to 1.';




    //PRICING STRINNGS
    public static PRICING = {
        MARGIN: 'Margin',
        CPC: 'CPC',
        CPI: 'CPI',
        CPM: 'CPM',
        CPA: 'CPA',
        REV_SHARE: 'REV_SHARE',
    };

    public static PRICING_ID = {
        MARGIN: 5,
        CPC: 2,
        CPI: 6,
        CPM: 1,
        CPA: 3,
        // REV_SHARE: ,
    };

    //REVX-724
    public static SKAD_LABEL = 'SKAD Network Target';





}
