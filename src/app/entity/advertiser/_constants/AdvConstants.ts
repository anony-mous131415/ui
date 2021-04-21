export class AdvConstants {
  public static NAME_LABEL = 'Advertiser Name';
  public static NAME_TOOLTIP = 'Please enter advertiser name';

  public static DOMAIN_LABEL = 'Advertiser Domain';
  public static DOMAIN_TOOLTIP = 'Please enter advertiser domain name. For example- revx.com is a domain name';

  public static CATEGORY_LABEL = 'Advertiser Category';
  public static CURRENCY_LABEL = 'Currency';
  public static LANGUAGE_LABEL = 'Default Creative Language';
  public static ADV_TYPE_LABEL = 'Type of Advertiser';
  public static DIRECT_ADV_LABEL = 'Direct Advertiser';

  public static APP_INFORMATION = 'App Information';
  public static APP_INFORMATION_TOOLTIP = 'Enter either Android Info or iOS Info or both';
  public static ANDROID_PKG_LABEL = 'Android Package Name';
  public static IOS_PKG_LABEL = 'iOS App Id';

  public static CONTACT_INFO_LABEL = 'Contact Information';
  public static EMAIL_LABEL = 'Email Contact';
  public static ADDRESS_LABLE = 'Contact Address';
  public static REGION_LABLE = 'Advertiser Region';
  public static STATUS_LABEL = 'Status';

  public static WEB_DECLARED_URL_LABEL = 'Web Declared Url';
  public static ANDROID_DECLARED_URL_LABEL = 'Android Declared Url';
  public static IOS_DECLARED_URL_LABEL = 'iOS Declared Url';


  public static WEB_DECLARED_URL_TOOLTIP = 'Your website address with http';
  public static ANDROID_DECLARED_URL_TOOLTIP = 'URL will be used to collect data for retargeting';
  public static IOS_DECLARED_URL_TOOLTIP = 'URL will be used to collect data for retargeting';

  public static CATEGORY_TOOLTIP = 'Select the business category this advertiser belongs to';
  public static CURRENCY_TOOLTIP = 'The currency this advertiser is associated with and will view reports in';
  public static LANGUAGE_TOOLTIP = 'This selection is for reporting purposes. Note that the creatives uploaded can be in any language despite the selection made';
  public static STATUS_TOOLTIP =
    'If the advertiser is set as inactive, all corresponding campaigns and strategies will be considered inactive.';

  public static IS_APP_TOOLTIP = 'Note: Leaving this unchecked will mean the advertisers app will not be avialable and for mobile camapigns this information will have to be taken at later stages';
  public static APP_INFO_SUBHEADER_TOOLTIP = 'Enter the advertiser&rsquo;s app details.';
  public static ANDROID_PKG_TOOLTIP = 'Please enter Android app package name. For example- com.myapp.android';
  public static IOS_PKG_TOOLTIP = 'Please enter iOS app id. For example- 123456789';

  public static EMAIL_TOOLTIP = 'Example: name@domainname.com';
  public static CONTACT_TOOLTIP = 'Enter the advertiser&rsquo;s contact details.';
  public static ADDRESS_TOOLTIP = 'Please provide this to avoid accounting issues later.';
  public static REGION_TOOLTIP = 'Note: If you accidently select the wrong region you can edit it.';
  public static TIMEZONE_TOOLTIP = 'Note: Please ensure you select the right timezone as failing to do so may trigger your activities in the wrong timezone.';

  // Validation custom messages for manadatory fields
  public static VALIDATION_NAME = 'Enter the name of the advertiser.';
  public static VALIDATION_DOMAIN_MISSING = 'Enter the domain of the advertiser.';
  public static VALIDATION_DOMAIN_DOT = 'Please enter a valid domain name such as revx.io.';

  public static VALIDATION_CATEGORY = 'Select the category of the advertiser.';
  public static VALIDATION_ADDRESS = 'Enter the contact address as entered in the original bill.';
  public static VALIDATION_REGION = 'Select the region that the advertiser belongs to.';
  public static VALIDATION_LANGUAGE = 'This selection is for reporting purposes. Note that creatives uploaded can be in any language irrespective of this selection.';
  public static VALIDATION_CURRENCY = 'Advertiser level report shall be generated using this currency.';
  public static VALIDATION_EMAIL_MISSING = 'Enter the email ID in the following format: name@domainname.com';
  public static VALIDATION_EMAIL_INVALID = 'Please enter a valid email address.';

  public static VALIDATION_FEED_KEY = 'Please select mobile measurement partner of the advertiser.';
  public static VALIDATION_DATE_FROMAT = 'Please select mobile measurement partner of the advertiser.';
  public static VALIDATION_SKU_ALLOWED_CHAR = 'Please select mobile measurement partner of the advertiser.';
  public static VALIDATION_MMP = 'Please select mobile measurement partner of the advertiser.';
  public static VALIDATION_TXN_CUR = 'Please select mobile measurement partner of the advertiser.';

  // Validation APP INFO
  public static VALIDATION_APP_INFO = 'Please enter app details.';

  public static VALIDATION_ANDROID_PKG_NAME_MISSING_DOT = 'Please enter a valid package name';
  public static VALIDATION_ANDROID_PKG_ALL_FEILDS_MISSING = 'Either fill this feild or iOS App ID or both.';
  public static VALIDATION_ANDROID_PKG_DECLARED_URL_FILLED = 'This feild is required because you have filled the android declared url.';
  public static VALIDATION_ANDROID_DECLARED_URL_REQ_NOW = 'This feild is now required as you have filled the Android Package Name.';

  public static VALIDATION_IOS_PKG_ALL_FEILDS_MISSING = 'Either fill this feild or Android Package Name or both.';
  public static VALIDATION_IOS_PKG_DECLARED_URL_FILLED = 'This feild is required because you have filled the iOS declared url.';
  public static VALIDATION_IOS_DECLARED_URL_REQ_NOW = 'This feild is now required as you have filled the iOS App Id.';


  public static VALIDATION_TIMEZONE = 'Select the timezone that the advertiser belongs to.';


  public static TIMEZONE_LABEL = 'Advertiser Timezone';
  public static MMP_LABEL = 'MMP';
  public static MMP_TOOLTIP = 'Mobile Measurement Partners';

  public static FEED_KEY_LABEL = 'Advertiser Feed Key';
  public static DATE_FORMAT_LABEL = 'Advertiser Date Format';
  public static SKU_ALLOWED_CHAR_LABEL = 'SKU allowed char';
  public static LIFT_TEST_LABEL = 'Lift Test Status';
  public static EVENT_FILTER_LABEL = 'Event Filter Allowed';
  public static TRN_CURRENCY_LABEL = 'Transaction Currency';

  public static FEED_KEY_TOOLTIP = 'Feed key informs about the catalogue feed from the advertiser which is reuired to run a dynamic campaign, as it shows catalogue items information in advertiserment depending on the user history on the advertiser website or app';
  public static DATE_FORMAT_TOOLTIP = 'Advertiser Date Format';
  public static SKU_ALLOWED_CHAR_TOOLTIP = 'Stock Keeping Unit: Number of characters allowed in it, given by the advertiser';
  public static LIFT_TEST_TOOLTIP = 'Lift status informs whether the lift test is running or not. Lift test results may be affected if any changes are made while lift test is active.';
  public static EVENT_FILTER_TOOLTIP = 'Event Filter Allowed';
  public static TRN_CURRENCY_TOOLTIP = 'Transaction Currency';

  public static COLUMN_STATUS = 'Status';
  public static COLUMN_DOMAIN = 'Advertiser Domain';
  public static COLUMN_ANDROID_PKG_NAME = 'Android Package Name';
  public static COLUMN_MMP_NAME = 'MMP Name';
  public static COLUMN_ADDRESS = 'Address';
  public static COLUMN_CURRENCY = 'Currency';
  public static COLUMN_ID = 'Advertiser ID';
  public static COLUMN_CATEGORY = 'Advertiser Category';
  public static COLUMN_IOS_APP_ID = 'IOS App Id';
  public static COLUMN_CREATED_DATE = 'Date Created';
  public static COLUMN_REGION = 'Advertiser Region';


  public static COLUMN_CATALOG_STATUS = 'Status';
  public static COLUMN_CATALOG_NAME = 'Feed Name';
  public static COLUMN_CATALOG_SOURCE = 'Feed Source';
  public static COLUMN_CATALOG_UPDATED_FREQUENCY = 'Update Frequency';
  public static COLUMN_CATALOG_LAST_UPDATED = 'Last Updated';
  public static COLUMN_CATALOG_UPDATE_STATUS = 'Update Status';
  public static COLUMN_ITEMS_IMPORTED = 'Items Imported (Total Items)';
  public static COLUMN_SUCCCESS_RATE = 'Success Rate';
  public static COLUMN_VARIABLES_MAPPED = 'Variables Mapped';


  public static FEED_TOOLTIP_NAME = 'Information about the items currently present in the inventory of the advertiser.';
  public static FEED_TOOLTIP_SOURCE = 'Source is either an FTP link or a file (XML , CSV , TSV or ZIPUpdate) given by the advertiser , from where the catalogues are updated.';
  public static FEED_TOOLTIP_UPDATED_FREQ = 'The time period after which the catalogue is updated from source.';
  public static FEED_TOOLTIP_LAST_UPDATED = 'Last date on which the catalogue was updated.';
  public static FEED_TOOLTIP_UPDATED_STATUS = 'Processing or completed depending on whether the updation of the catalogue is ongoing or done.';
  public static FEED_TOOLTIP_ITEMS_IMPORTED = 'Number of items imported in the catalogue from the source.';
  public static FEED_TOOLTIP_SUCCESS_RATE = 'Percentage of items updated successfully from the source into the catalogue.';


  public static NO_CLICK_DEST_MSG = 'No Click Destinations for the selected Advertiser.';

  public static UPLOAD_LOGO_LABEL = 'Upload logo';
  public static UPLOAD_LOGO_VALIDATION = 'Please upload a logo for the advertiser';

  public static UPLOAD_LOGO_MODAL_TITLE = 'Upload Advertiser Logo';
  public static UPLOAD_FALLBACK_MODAL_TITLE = 'Upload Fallback Images';
  public static UPLOAD_OVERLAY_MODAL_TITLE = 'Upload Overlay Images';

  public static INVALID_FILE_SIZE = 'File size exceeds the <SIZE> limit. Please upload a smaller file.';
  public static INVALID_FILE_TYPE = 'File type uploaded is not supported. Please upload one of the supported formats.';
  public static INVALID_FILE_DIMENSION = 'Dimensions of the file uploaded is invalid. Please upload one of the supported dimensions.';

  //REVX-724
  public static SKAD_LABEL = 'SKAD Network Target';

}
