export class CdAutoPopulateUrls {
    androidClick: string;
    androidS2S: string;
    iosClick: string;
    iosS2S: string;


    constructor(ac?: string, as?: string, ic?: string, is?: string) {
        this.androidClick = (ac && ac.length) ? ac : '';
        this.androidS2S = (as && as.length) ? as : '';
        this.iosClick = (ic && ic.length) ? ic : '';
        this.iosS2S = (is && is.length) ? is : '';
    }

}
