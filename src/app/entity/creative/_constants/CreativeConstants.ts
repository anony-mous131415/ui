export class CreativeConstants {
    public static ALLOWED_EXTENSIONS = 'zip, jpg, jpeg, png, gif, flv, mp4, 3gp, mov, webm, dash, hls';
    public static ALLOWED_DCO_EXTENSIONS = 'zip, jpg, jpeg, png , gif';
    public static ALLOWED_FILE_EXT_STR = '.zip .jpg .jpeg .png .gif .flv .mp4 .3gp .mov .webm .dash .hls';
    public static ALLOWED_DCO_FILE_EXT_STR = '.zip .jpg .jpeg .png .gif';
    public static ALLOWED_FILE_EXTENSIONS = ['.zip', '.jpg', '.jpeg', '.png', '.gif', '.flv', '.mp4', '.3gp', '.mov', '.webm', '.dash', '.hls'];

    public static ALLOWED_FILE_TYPES = ['application/zip', 'image/jpg', 'image/jpeg', 'image/png', 'video/gif', 'video/flv', 'video/mp4', 'video/3gpp', 'video/quicktime', 'video/webm', 'video/dash', 'video/hls'];
    public static ALLOWED_FILE_TYPES_GROUP = ['image', 'video', 'html'];
    public static ALLOWED_TYPES = {
        IMAGE: 'image',
        VIDEO: 'video',
        HTML: 'zippedHTML',
        NATIVE_IMAGE: 'nativeAd',
        NATIVE_VIDEO: 'nativeVideo',
        AD_TAG: 'html'
    };
    public static ALLOWED_VIDEO_FILE_TYPES = ['video/flv', 'video/mp4', 'video/3gpp', 'video/quicktime', 'video/webm', 'video/dash', 'video/hls'];
    public static ALLOWED_IMAGE_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'video/gif'];
    public static ALLOWED_HTML_FILE_TYPES = ['application/zip'];
    public static ALLOWED_IMAGE_FILE_EXTENSIONS = '.jpg .jpeg .png .gif';
    // public static ALLOWED_VIDEO_FILE_EXTENSIONS = '.mp4 .mkv';
    // public static ALLOWED_HTML_FILE_TYPES = '.zip';

    public static UPLOAD_DCO_SECTION = 'upload_dco_section';
    public static UPLOAD_SECTION = 'upload_ui_section';
    public static UPLOAD_VAST_SECTION = 'upload_vast_section';
    public static UPLOAD_TP_SECTION = 'upload_tp_section';

    public static PREVIEW_SECTION = 'preview_section';
    public static PREVIEW_DCO_SECTION = 'preview_dco_section';
    // public static UPLOAD_DCO_NATIVE_SECTION = 'upload_dco_native_section';
    // public static UPLOAD_DCO_NON_NATIVE_SECTION = 'upload_dco_non_native_section';

    public static VALIDATION_MSG_FILE_TYPE = 'Type of the file is incompatible';
    public static VALIDATION_MSG_FILE_SIZE_5 = 'File size should be less than 5 MB';
    public static VALIDATION_MSG_FILE_SIZE_10 = 'File size should be less than 10 MB';
    public static VALIDATION_ADDRESS = 'Address is required'
    // public static VALIDATION_NATIVE_TITLE=''
    // public static VALIDATION_NATIVE_BODY=''
    // public static VALIDATION_NATIVE_CALLTOACTION='';


    public static NAME_LABEL = 'Creative Name';
    public static VALIDATION_NAME = 'Enter creative name';

    public static LABEL_ADVERTISER = 'Advertiser';
    public static VALIDATION_ADVERTISER = 'Advertiser is missing';

    public static CLK_DESTINATION_LABEL = 'Click Destination';
    public static VALIDATION_CLK_DESTINATION = 'Click destination is missing';
    public static CLK_DESTINATION_TOOLTIP = 'Select where you want the user to arrive after clicking the creative';

    public static IS_DCO_LABEL = 'Dynamic Creatives';
    public static IS_DCO_TOOLTIP = "Creatives shown in impressions to a user based on their behaviour on the advertiser's platform.";

    public static ASSET_TYPE_LABEL = 'Asset Type';
    public static ASSET_TYPE_TOOLTIP = 'Upload a media file or use a third party ad tag/HTML script';


    public static LABEL_ENTER_AD_TAG = 'Enter AD Tag';

    public static LABEL_VAST_TP_URL = 'Third Party Vast URL';
    public static LABEL_VIDEO_FORMAT = 'Video Format';
    public static LABEL_VIDEO_SIZE = 'Video Size';
    public static LABEL_VIDEO_DURATION = 'Video Duration';
    public static LABEL_HAS_END_CARD = 'Has End Card';
    public static LABEL_VIDEO_COUNT = 'Uploaded Videos';
    public static LABEL_VIDEO_END_CARD_COUNT = 'Uploaded Comapanion Ads';

    public static VALIDATION_VAST_TP_URL = 'Enter a third party valid vast url.';
    public static VALIDATION_TP_URL = 'Enter a valid third party ad tag.';
    public static VALIDATION_VIDEO_SIZE = 'Enter dimension of the video. Values should be integer.';
    public static VALIDATION_VIDEO_DURATION = 'Enter duration of the video. Values should be integer.';

    public static LABEL_TYPE = 'Creative Type';
    public static LABEL_SIZE = 'Creative Size';
    public static LABEL_CLK_VERIFIED = 'Click Verified';

    public static LABEL_NATIVE = 'Native';
    public static TOOLTIP_DCO_NATIVE = 'Select the creative is native dynamic or non native dynamic';
    public static LABEL_NON_NATIVE = 'Non Native';

    public static LABEL_HTML_CONTENT = 'HTML Content';
    public static VALIDATION_HTML_CONTENT = 'HTML Content is missing.';
    public static LABEL_DIMENSION = 'Dimension';
    public static LABEL_DCO_HTML_FORM = 'HTML Form';
    public static LABEL_DCO_HTML_FORM_MESSAGE = 'Upload a .zip for creatives HTML';
    public static LABEL_DCO_HTML_FORM_TOOLTIP = 'Upload a HTML file that you want displayed as an advertisement.';
    public static LABEL_DCO_SETTINGS_HEADER = 'Dynamic Creative Settings';
    public static LABEL_DCO_NUM_SLOTS = 'Number Of Slots';
    public static VALIDATION_DCO_NUM_SLOTS = 'Please enter the slots of creatives';
    public static LABEL_DCO_NUM_SLOTS_TOOLTIP = 'Number Of slots in dynamic creative';
    public static LABEL_DCO_MACRO_LIST = 'Macros List';
    public static VALIDATION_DCO_MACRO_LIST = 'Macros List is missing.';
    public static LABEL_DCO_MACRO_LIST_TOOLTIP = 'List of macros to be substituted in the dynamic html creative';
    public static ERROR_MSG_DCO_ATTR = 'DCO attributes is missing.';

    public static NATIVE_TITLE = 'Title';
    public static NATIVE_TITLE_TOOLTIP = 'Upto 25 Characters';
    public static VALIDATION_NATIVE_TITLE = 'Title is missing or the characters are more than 25.';

    public static NATIVE_BODY = 'Body';
    public static NATIVE_BODY_TOOLTIP = 'Upto 90 Characters';
    public static VALIDATION_NATIVE_BODY = 'Body is missing or the characters are more than 90.';

    public static NATIVE_CALLTOACTION = 'Call to action missing or has more than 150 characters. ';
    public static NATIVE_CALLTOACTION_TOOLTIP = 'Please select call to action';
    public static VALIDATION_NATIVE_CALLTOACTION = 'Please select call to action';

    public static NATIVE_LOGO = 'Logo';
    public static NATIVE_UPLOAD_ICON = 'Upload Logo';
    public static NATIVE_UPLOAD_ICON_TOOLTIP = 'Must be 300x300 (.png, .jpg, .jpeg)';
    public static VALIDATION_ICON_DIMENSION = 'Dimension of logo must be 300x300';
    public static VALIDATION_ICON = 'Please upload a icon/logo (300x300)';


    public static LABEL_PREVIEW_NAME = 'Name';
    public static LABEL_PREVIEW_ADVERTISER = 'Advertiser';
    public static LABEL_PREVIEW_TYPE = 'Type';
    public static LABEL_CLICK_DESTINATION = 'Click Destination';
    public static LABEL_CREATIVE_TYPE = 'Creative Type';

    public static ERROR_MSG_NO_CREATIVES = 'Select atleast one creative to create';
    public static ERROR_MSG_NATIVE_ASSET_MISSING = 'Native asset attributes are not filled';
    public static ERROR_MSG_NATIVE_VERIFY = 'Native creatives are not verified';
    public static ERROR_MSG_NON_NATIVE_VERIFY = 'Non native creatives are not verified';
    public static ERROR_MSG_DYNAMIC_HTML_VERIFY = 'Dynamic HTML creatives are not verified';
    public static ERROR_MSG_HTML_DIMENSION_MISSING = 'Dimension of native image, creative is missing';
    public static ERROR_MSG_NATIVE_IMG_DIMENSION_MISSING = 'Dimension of non native, image creative is missing';
    public static ERROR_MSG_NON_NATIVE_IMG_DIMENSION_MISSING = 'Dimension of HTML, creative is missing';
    public static SUCCESS_MSG_CREATED = 'Creatives created successfully';
    public static ERROR_MSG_CLICK_VERIFIED = 'Click Tracker verification failed.';

    public static TITLE_VERIFY_CLICK = 'Verify Click Tracking';
    public static LABEL_VERIFICATION_PROCESS = 'Verification Process';
    public static LABEL_VERIFICATION_STEP_1 = 'Click on the Creatives and view the landing page.';
    public static LABEL_VERIFICATION_STEP_2 = 'Did the landing page open?';
    public static MSG_VERIFICATION_FAILED = 'Click Tracker verification failed. Please make sure you clicked on the creative.';
    public static MSG_VERIFICATION_SUCCESS = 'Click Tracker verification done.';

    public static ASSOCIATE_SUCCESS_MSG = 'Creative(s) succesfully associated to strategies';
    public static ASSOCIATE_ERROR_MSG = 'Error!! Creative(s) are not associated to any of the strategies. Try again.';
    public static ASSOCIATE_DUPLICATE_MSG = 'Error!! Already associated the selected creative(s) with the selected strategy/strategies.'

    public static CR_PERF_TITLE = 'General Performance';
    public static CR_PERF_NO_DATA = 'No data available. This creative has not served any ad or the data is not yet processed.';
    public static CR_IMPS = 'Impressions';
    public static CR_CLKS = 'Clicks';
    public static CR_CONV = 'Conversions';

    public static BLOCKUI_SAVE_CREATIVES = 'Saving creatives';
    public static BLOCKUI_GEN_CREATIVES = 'Generating creatives';
    public static BLOCKUI_UPDATE_CREATIVES = 'Updating creative';
    public static BLOCKUI_UPLOADING_FILES = 'Uploading files';

    public static SUCCESS_MSG_UPDATE = 'Creative updated successfully';
    public static FAILED_MSG_UPDATE = 'There is an error while updating this creative';

    public static DV_LABEL = 'Select Macro';
    public static DV_TOOLTIP = 'Choose variable';
    public static DYNAMIC_VARIABLE_DEFAULT_IMG_ERROR = "Selected Macro __DEFAULT_IMAGE__ doesn't have any value in selected advertiser's catalog, Please select different Macro or upload image";
    public static DYNAMIC_VARIABLE_ADD_IMG_ERROR = "Selected Macro __ADDITIONAL_IMAGES__ doesn't have any value in selected advertiser's catalog, Please select different Macro or upload image";
    public static DV_DEFAULT_IMAGE = '__DEFAULT_IMAGE__';
    public static DV_ADDITIONAL_IMAGES = '__ADDITIONAL_IMAGES__';

    public static ALERT_DCO_CHECKBOX = '(No feed available for the selected Advertiser)';
    public static TEMPLATE_SELECTION_LABEL = 'Template Selection';



    //REVX-525
    public static STEP = {
        BASIC_DETAILS: 0,
        UPLOAD_FILES: 1,
        TEMPLATE_SELECT: 2,
        TEMPLATE_CUSTOMIZE: 3,
        PREVIEW: 4,
    };

    public static ASSETS_UI_OPTIONS = [{ id: 1, title: 'Image, Video, Zip(HTML)' }, { id: 2, title: 'Third Party Ad Tag' }, { id: 3, title: 'Template' }]
    public static TEMPLATE_UI_OPTIONS = [{ id: 1, title: 'Manual' }];

    public static ASSETS_UI_ENUM = {
        IMAGE_VIDEO_ZIP: CreativeConstants.ASSETS_UI_OPTIONS[0].id,
        THIRD_PARTY_AD_TAG: CreativeConstants.ASSETS_UI_OPTIONS[1].id,
        TEMPLATE: CreativeConstants.ASSETS_UI_OPTIONS[2].id
    }

    public static TEMPLATE_UI_ENUM = {
        MANUAL: CreativeConstants.TEMPLATE_UI_OPTIONS[0].id
    };
    public static REMOVE_COMMENTS_IN_JSON_REGEX = /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g;
    public static SIZE_DOES_NOT_MATCH_ERROR_MSG = `The image dimension is not compatible with any of the template present in the system`;
    public static DCO_FILE_DIMENSION_ERROR_MSG = 'The file(s) did not satisfy DCO-file dimension criteria';

}
