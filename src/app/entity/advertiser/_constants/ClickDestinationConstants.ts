export class ClickDestinationConstants {

    public static LABEL_NAME = 'Name';
    public static TOOLTIP_NAME = 'Name of the click destination.'

    public static VALIDATION_NAME_MISSING = 'Enter a valid click destination name.';
    public static VALIDATION_CLICK_URLS_MISSING = 'Atleast 1 of the following feilds is required : "Web Click Url"  , "Android Click Url" , "iOS Click Url"';
    public static VALIDATION_RADIO_MISSING = 'This feild is required.';


    public static WEB_CLICK_URL = 'Web Click Url';
    public static WEB_S2S_TRACKING_URL = 'Web Server Tracking Url';
    public static WEB_IMP_TRACKING_URL = 'Web Impression Tracking Url';
    public static AND_CLICK_URL = 'Android Click Url';
    public static AND_S2S_TRACKING_URL = 'Android Server Tracking Url';
    public static AND_IMP_TRACKING_URL = 'Android Impression Tracking Url';
    public static IOS_CLICK_URL = 'iOS Click Url';
    public static IOS_S2S_TRACKING_URL = 'iOS Server Tracking Url';
    public static IOS_IMP_TRACKING_URL = 'iOS Impression Tracking Url';
    public static IS_DCO = 'Click Destination is dynamic';
    public static CAMPAIGN_TYPE = 'Campaign type';

    public static ADD_MULTIPLE_IMP_TRACKER = 'Use a new line to mention the details of 3rd party impression tracker(s) .';

    public static SAVE_SUCCESS_MSG = 'Click Destination saved successfully';
    public static UPDATE_SUCCESS_MSG = 'Got error while saving Click Destination';
    public static SAVE_ERROR_MSG = 'Click Destination updated successfully';
    public static UPDATE_ERROR_MSG = 'Got error while updating Click Destination';

    public static MACRO = 'Choose and append Macros';
    public static TYPE = {
        WEB: 'web',
        ANDROID: 'android',
        IOS: 'ios'
    }


    //REVX-401 constants
    public static VALIDATION_INFO = {
        //non-madatory validations / info msgs
        UNEQUAL_NUMBER_OF_PARAMS: 'INFO : Total number of query parameters are not equal.',
        MISSING_QUERY_PARAM: 'INFO : A query parameter is missing or not as expected.',
        RHS_INVALID: 'INFO : A query parameter which is to be filled is not filled OR An expected query parameter value is missing.',
        RT_PARAM_MISSING_OR_PROVIDED: 'INFO : Retargeting query parameter is applicable when campaign is of retargeting type.',
    }


    //REVX-401 constants
    public static VALIDATION_MANDATORY = {
        //mandatory validations
        ADVERTISER_PACKAGE: 'Error : Advertiser related package or parameter is missing or is not as expected.',
        ALL_CLICK_URL_MISSING: 'Error : Please provide atleast 1 of the following : Android Click Url , iOS Click Url.',
        ALL_S2S_URL_MISSING: 'Error : Please provide atleast 1 of the following : Android Server Tracking Url , iOS Server Tracking Url.',
        HAS_WHITE_SPACES: 'Error : Please provide a valid input. Whitespaces are not allowed.',

        //revx-657
        INPUT_SAME_AS_API_STRING: 'Error : Trying to save the url without making proper changes where ever required.',

        //REVX-724
        SKAD_NO_URLS: 'Error : Atleast 1 of the iOS related url is required.',


    }

    public static SAVE_BTN_TOOLTIP = 'Please select Click destination is Dynamic and Generate radio buttons to continue.'

    public static SAVE_BTN_TOOLTIP_SKAD = 'Please select Click destination is Dynamic to continue.'


    public static GENERATE_URL_ID = {
        CLICK: 'click',
        S2S: 's2s'
    }


    //REVX-724
    public static LABEL_SKAD = 'SKAD Network Target';
    public static PROMPT_ERROR = 'WARNING: Changes that you made might have some errors.';
    public static PROMPT_CONFIRMATION = 'WARNING: Are you sure you want to save the changes?';




}
