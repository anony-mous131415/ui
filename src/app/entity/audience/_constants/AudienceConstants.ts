export enum COMPRESSION {
  NONE = 1,
  ZIP,
  GZIP,
  // BZIP:4
}

export enum ENCODING {
  NONE = 1,
  MD5,
  SHA256,
}

export enum PROTOCOL {
  FTP = 1,
  SFTP,
  SSH,
  HTTP,
  HTTPS,
  FTPS,
}

export enum MOBILE_METHOD_RADIO {
  RULE = 1,
  DEVICE,
}


export class AudienceConstants {

  // SUBHEADERS
  public static BASIC_SETTINGS = 'Basic Settings';
  public static UPLOAD_SETTINGS = 'Upload Settings';

  // LABELS
  public static ADVERTISER_LABEL = 'Advertiser';
  public static SOURCE_LABEL = 'Audience Source';
  public static NAME_LABEL = 'Audience Name';
  public static DESC_LABEL = 'Description(Optional)';
  public static METHOD_LABEL = 'Method';

  public static DEVICE_ID_LABEL = 'Upload Device Id(s)';
  public static AUD_RULES_LABEL = 'Audience Rule(s)';
  public static USER_EXPIRY_LABEL = 'User Expiry';

  // LABELS FOR DETAILS PAGE
  public static NAME_DETAILS_LABEL = 'Name';
  public static DESC_DETAILS_LABEL = 'Description';
  public static RULES_DETAILS_TEXT = 'Segment user if any of the following rule(s) are matched';
  public static MODE_DETAILS_LABEL = 'Mode of Uploads';
  public static NEXT_SYNC_DETAILS_LABEL = 'Next Sync Schedule on';
  public static LAST_UPDATE_DETAILS_LABEL = 'Last successful update';


  // TOOLTIPS
  public static SOURCE_TOOLTIP = 'Source from which users will be collected in this audience.';
  public static METHOD_TOOLTIP = 'Method to collect mobile app users - either place a mobile tag on advertiser’s app or upload a list of device ids.';

  public static DEVICE_ID_TOOLTIP = 'You can either upload a file directly or provide connection details to link with a remote file.';
  public static AUD_RULES_TOOLTIPS = ' Rules can be specified for the created audience, which will be applied for the users that fall under any specified rule’s scope.';
  public static USER_EXPIRY_TOOLTIP = 'Number of days for which user will stay active in this Audience.';

  // BUTTON
  public static BTN_ADVERTISER = 'Select Advertiser';
  public static BTN_SOURCE = 'Select Source';
  public static BTN_RULES = 'Add Rules';

  /// VALIDATIONS
  public static VALIDATION_NAME_REQUIRED = 'Enter a valid audience name.';

  public static VALIDATION_REQUIRED = 'This field is required.';
  public static VALIDATION_DIGITS = 'Please enter digits only.';
  public static VALIDATION_GREATER_ZERO = 'Please enter a value greater than or equal to 1.';
  public static VALIDATION_DMP_MISSING = 'Please select an Affle DMP audience segment. ';
  public static VALIDATION_URL = 'URL value cannot be empty.';

  public static VALIDATION_REMOTE_FILE = {
    URL_HAS_PROTOCOL: '  Do not prefix the url with protocol name (\'ftp\' , \'sftp\' , \'http\' , \'https\') .',
    COMPRESSION: 'Invalid compression selected .',
    SPECIAL_CHARS: 'Please enter a valid number (greater than 0). Do not use special characters (., &, $, @,) '
  };

  // GENERIC UPLOADER DETAILS-MESSAGE
  public static DETAILS_MSG = 'Allowed types are csv , txt , zip , gz.';

  // OBJECTIVE CONSTANTS -> USER_DATA_TYPE
  public static OBJECTIVE = {
    WEBSITE: 2,
    MOBILE: 1,
    DMP: 3,
    // APPSFLYER : 4;
  };
  public static USER_DATA_TYPE = {
    WEBSITE: 1,
    MOBILE: 2,
    DMP: 2
  };

  // DETAILS PAGE CONSTANTS
  public static SOURCE_TEXT = {
    WEBSITE: 'Website',
    MOBILE: 'Mobile',
    DMP: 'Affle DMP'
  };

  // DTO CONSTANTS
  public static SEGMENT_TYPE = {
    WEBSITE: null,
    MOBILE: null,
    DMP: 3,
    CLICKER: 1
  };

  public static DATA_SRC_TYPE = {
    WEBSITE: 1,
    MOBILE_RULE: 1,
    MOBILE_LOCAL: 3,
    MOBILE_REMOTE: 2,
    DMP: 2
  };

  public static DURATION_UNIT = {
    MINUTE: 'MINUTE',
    HOUR: 'HOUR',
    DAY: 'DAY',
    WEEK: 'WEEK',
    MONTH: 'MONTH'
  };

  // public static FREQUENCY_UNIT = {
  //     MINUTE: 0,
  //     HOUR: 1,
  //     DAY: 2,
  //     WEEK: 3,
  //     MONTH: 4
  // };

  // REVX-362
  public static FREQUENCY_UNIT = {
    MINUTE: 1,
    HOUR: 2,
    DAY: 3,
    WEEK: 4,
    MONTH: 5
  };


  public static DEFAULT_DUARTION_VALUE = 30; // 30 DAYS

  public static DMP_DATA_SCHEDULE = {
    PROTOCOL: PROTOCOL.HTTP,
    URL: 'www.google.com', // DUMMY
    ENCODING: ENCODING.NONE,
    COMPR: COMPRESSION.NONE,
    FREQ_VAL: 14,
    FREQ_UNIT: AudienceConstants.FREQUENCY_UNIT.DAY,
  };

  // DMP AUDIENCE TYPE ON MODAL
  public static DMP_TYPE = {
    ONE: 'Predefined Shopper Segment',
    TWO: 'Custom Shopper Segment'
  };

  public static CLICKER_RULE_VAL = 'can-never-be-true';


  // these constants are for targeting audiences(RPIP-38)
  public static TYPE = {
    APP: 'app',
    WEB: 'web',
    DMP: 'dmp'
  };

  public static LABEL = {
    APP: 'App Audience',
    WEB: 'Website Audience',
    DMP: 'DMP Audience'
  };

  public static TYPE_API_KEY = 'user_data_type';
  public static TYPE_API_VAL = {
    APP: 'mobile_app',
    WEB: 'web_browsing',
    DMP: 'dmp'
  };


}



