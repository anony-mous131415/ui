export class PixelConstants {
    public static PIXEL_STATUS = 'Status';
    public static PIXEL_TYPE = 'Type of Conversion Tracker';
    public static PIXEL_ADVERTISER = 'Associate Advertiser';
    public static PIXEL_MAX_TIME_C2C = 'Max Time From Click to Conversion';
    public static PIXEL_MAX_TIME_V2C = 'Max Time From View to Conversion';
    public static PIXEL_COUNT_PER_USER = 'Conversions Counted per user';

    public static PERF_IMP = 'IMPRESSIONS';
    public static PERF_CLICKS = 'CLICKS';
    public static PERF_CONV = 'CONVERSIONS';

    //labels for conv-tacker
    public static PXL_TYPE_LABEL = 'Conversion Tracker Type';
    public static PXL_NAME_LABEL = 'Conversion Tracker Name';
    public static PXL_CLICK_LABEL = ' Max Time (From Click to Conversion)';
    public static PXL_VIEW_LABEL = 'Max Time (From View to Conversion)';
    public static PXL_CNV_ALWD_LABEL = 'Conversions Allowed Per User';

    public static LABEL_IMPRESSIONS = 'IMPRESSIONS';
    public static LABEL_CONVERSIONS = 'CONVERSIONS';
    public static LABEL_CLICKS = 'CLICKS';
    public static PXL_PERF_CLICKS = 'TIMES FIRED (LAST 6 MONTHS)';

    //tooltips for conv-tracker
    public static PXL_TYPE_TOOLTIP = 'Click - tracks only post click conversion.' +
        '\n View - tracks only post view conversion. ' +
        '\n Hybrid -  Tracks both post click and post view conversions';
    public static PXL_NAME_TOOLTIP = 'Recommend to follow: <Date><Advertiser Name><Pixel Type> Eg. Aug 12 KomaliCircle Conversion';
    public static PXL_CLICK_TOOLTIP = 'Conversions after this period will not be counted in post click conversions.'
    public static PXL_VIEW_TOOLTIP = 'Conversions after this period will not be counted, in post view conversions.';
    public static PXL_CNV_ALWD_TOOLTIP = 'Number of conversions allowed per user in a given time period.'

    //validation msgs for pixel
    public static VALIDATION_PXL_NAME = 'Enter a valid pixel name.'

    public static VALIDATION_EMPTY = 'Enter a valid count(greater than or equals 1). Do not use special characters (.,&, $, @,) .'
    public static VALIDATION_INVALID = 'Only values greater than or equals 1 are allowed .'
    public static VALIDATION_REQUIRED = 'This feild is required .'



    public static MODAL = {
        CLOSE: 1,
        SAVE: 2
    }


}
