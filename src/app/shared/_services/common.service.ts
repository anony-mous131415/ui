import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { environment } from '@env/environment';
import { DashboardControllerService, SearchRequest } from '@revxui/api-client-ts';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { AppConstants } from '../_constants/AppConstants';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private router: Router,
    private dashboardService: DashboardControllerService,
    private httpClient: HttpClient
  ) { }


  /**
   *
   * @param number - number
   * @param type - type
   * @param currencyCode - currencyCode
   * @param isSliceX formatting for slicex or non-slicex table
   * formats tha data to be shown in ui
   *
   */
  public nrFormat(number: number, type?: string, currencyCode?: string, isSliceX?: boolean) {

    const currency = !(currencyCode) ? localStorage.getItem(AppConstants.CACHED_CURRENCY) : AppConstants.CURRENCY_MAP[currencyCode];
    // let currency = localStorage.getItem(AppConstants.CACHED_CURRENCY);

    number = (!number) ? 0 : number;
    let numStr: string;
    if (number !== undefined && !isNaN(number)) {
      const abs = Math.abs(number);
      if (abs >= Math.pow(10, 12)) {
        // trillion
        numStr = (number / Math.pow(10, 12)).toFixed(2) + 'T';
      } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
        // billion
        numStr = (number / Math.pow(10, 9)).toFixed(2) + 'B';
      } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
        // million
        numStr = (number / Math.pow(10, 6)).toFixed(2) + 'M';
      } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
        // thousand
        numStr = (number / Math.pow(10, 3)).toFixed(2) + 'K';
      } else {
        if (type === AppConstants.NUMBER_TYPE_CURRENCY
          || type === AppConstants.NUMBER_TYPE_PERCENTAGE) {
          numStr = number.toFixed(2);
        } else {
          numStr = number.toFixed(0);
        }
      }
    }
    // console.log( number);
    if (type != undefined) {
      switch (type) {
        case AppConstants.NUMBER_TYPE_CURRENCY:
          numStr = (isSliceX === true) ? `${currency} ${numStr}` : currency + ' ' + numStr;
          break;
        case AppConstants.NUMBER_TYPE_PERCENTAGE:
          numStr += '%';
          break;
      }
    }

    return numStr;
  }

  public nrFormatWithCurrency(value: number, type: string, currency: string) {
    return this.nrFormat(value, type, currency, true);
  }

  /**
   *
   * @param number - number
   * @param type - type
   * @param isReport - isReport
   * @param inputCurr - inputCurr
   * for larger number , put comma after 3 digit from right
   */
  public nrFormatWithComma(number: number, type?: string, isReport?: boolean, inputCurr?: string): string {
    let currency = localStorage.getItem(AppConstants.CACHED_CURRENCY);

    if (typeof isReport === 'boolean' && isReport && typeof inputCurr === 'string' && inputCurr.length > 0) {
      currency = inputCurr;
    }

    number = (!number) ? 0 : number;
    let numStr: string;

    if (number !== undefined && !isNaN(number)) {
      numStr = number.toFixed(2);
      if (type === AppConstants.NUMBER_TYPE_CURRENCY
        || type === AppConstants.NUMBER_TYPE_NOTHING || !type) {
        numStr = number.toFixed(0);
      }
      numStr = numStr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    if (type !== undefined) {
      switch (type) {
        case AppConstants.NUMBER_TYPE_CURRENCY:
          numStr = currency + ' ' + numStr;
          break;
        case AppConstants.NUMBER_TYPE_PERCENTAGE:
          numStr += '%';
          break;
      }
    }

    return numStr;
  }


  public getRouteURL() {
    return this.router.url;
  }

  /**
   * get entity(advertiser/campaign/strategy....etc) from URL
   */
  public getEntityFromURL() {
    const urlParts = this.router.url.split('/')[1];
    return urlParts.split('?')[0];
  }

  /**
   * get the type of report form URL (advanced/conversion/slicex)
   */
  public getReportTypeFromURL() {
    const urlParts = this.router.url.split('/')[2];
    return urlParts.split('?')[0];
  }

  /**
   *
   * @param epoch get UTC date form epoch
   */
  public epochToUTCDateFormatter(epoch: number): string {
    return moment.utc(epoch * 1000).format('llll');
  }

  /**
   *
   * @param epoch convertis epoch to date
   */
  public epochToDateFormatter(epoch: number): string {

    if (epoch >= CampaignConstants.NEVER_ENDING_EPOCH) {
      return 'Never Ending';
    }

    const date = new Date(epoch * 1000);
    const month: number = date.getMonth();
    const year: number = date.getFullYear();
    const day: number = date.getDate();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return day + ' ' + monthNames[month] + ' ' + year;
  }

  /**
   *
   * @param epoch converts epoch to date and time
   */
  epochToDateTimeFormatter(epoch: number): string {
    const dateToBeDisplayed = this.epochToDateFormatter(epoch);
    const dateObj = new Date(epoch * 1000);
    const x = new Date(dateObj);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    return dateToBeDisplayed + ' , ' + x.toLocaleString('en', options);
  }

  epochToTimeFormatter(epoch: number): string {
    const date = moment.utc(epoch * 1000);
    return date.format('h:mm a');
  }

  /**
   *
   * @param email checks if email is valid
   */
  validateEmail(email?): boolean {// returns true if email is valid
    if (!email) {
      return false;
    }
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,10})$/;
    return reg.test(email);
  }

  getDictionary(entity: any, pageNumber: number, pageSize: number,
    refresh?: boolean, reqId?: string, request?: SearchRequest, sort?: 'ASC' | 'DESC'):
    Observable<any> {
    return this.dashboardService.getDictionaryUsingPOST(entity, pageNumber, pageSize, refresh, reqId, request, sort);
  }

  // for advertiser timezome and region
  getDetailDictionary(entity: any, pageNumber: number, pageSize: number,
    refresh?: boolean, reqId?: string, request?: SearchRequest, sort?: 'ASC' | 'DESC'):
    Observable<any> {
    return this.dashboardService.getDetailDictionaryUsingPOST(entity, pageNumber, pageSize, refresh, reqId, request, sort);
  }



  /**
   *
   * @param formData - formData
   * @param apiPath - apiPath
   * api call to upload a valid file to server
   */
  uploadFiles(formData: FormData, apiPath: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        // enctype: 'multipart/form-data'
      }),
      reportProgress: true
    };

    // const formData = new FormData();
    // formData.append('file', file);
    return this.httpClient.post<any>(environment.API_BASE_PATH + apiPath, formData, httpOptions);
  }

  /**
   * returns random numeric value , used as ID
   */
  getUID(): number {
    let timestamp = new Date().getUTCMilliseconds();
    timestamp = timestamp + Math.random();
    return timestamp;
  }


  /**
   *
   * @param value- value
   * @param type- type
   * @param currency- currency
   * in tooltips , exact value is shown , returned by this method
   */
  public nrFormatTooltip(value: number, type: string, currency?: any): string {
    currency = !(currency) ? localStorage.getItem(AppConstants.CACHED_CURRENCY) : AppConstants.CURRENCY_MAP[currency];
    let returnVal = '';
    if (type !== AppConstants.NUMBER_TYPE_PERCENTAGE) {
      // null check
      returnVal = (value) ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
    } else {
      returnVal = value ? value.toFixed(2).toString() : '0';
    }

    switch (type) {
      case AppConstants.NUMBER_TYPE_CURRENCY:
        returnVal = currency + ' ' + returnVal;
        break;

      case AppConstants.NUMBER_TYPE_PERCENTAGE:
        returnVal += ' %';
        break;

      case AppConstants.NUMBER_TYPE_NOTHING:
        break;
    }
    return returnVal;
  }

  /**
   *
   * @param domain
   * get the substring before the first . symbol in domain input
   */
  getSubdomain(domain: string) {
    if (!domain || domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      return '';
    } else {
      return domain.split('.')[0];
    }
  }


  /**
   *
   * @param advertiserId
   * encode the advertser id , for storing in local-storage
   */
  encodeAdvId(advertiserId: number): string {
    const encodedAscii: number[] = [];

    while (advertiserId > 0) {
      const lastDigit = advertiserId % 10;
      encodedAscii.push(lastDigit + 97);
      advertiserId = Math.floor(advertiserId / 10);
    }

    encodedAscii.reverse();

    let str = '';
    encodedAscii.forEach(x => {
      const strAppend = String.fromCharCode(x);
      str += strAppend;
    });

    return str;
  }


  /**
   *
   * @param advIdEncoded
   * convert the encoded id to the right advertiser id
   */
  decodeAdvId(advIdEncoded: string): number {
    let id = 0;
    for (let i = 0; i < advIdEncoded.length; i++) {
      const digit = advIdEncoded.charCodeAt(i) - 97;
      id = id * 10 + digit;
    }
    return id;
  }

  /**
   * @param compareWith - compareWith
   * either returns "you" or the actual user-name
   *
   * this is for audit trail only
   */
  getUserName(compareWith: string): string {
    if (!compareWith || compareWith == '-1') {
      return 'Anonymous';
    }
    return (localStorage.getItem(AppConstants.CACHED_USERNAME) === compareWith) ? 'You' : compareWith;
  }

  /**
   *
   * @param arr array of id
   * converts input array to string of comma seperated ids
   */
  convertIdsToCommaSeperatedString(arr: any) {
    let stringOfIds = '';

    if (arr instanceof Array) {
      stringOfIds = arr.join();
      return stringOfIds;
    } else {
      // received parameter was not an array
      return '';
    }
  }



  public getDateFromEpoch(timeInSeconds: number) {
    const epoch = timeInSeconds * 1000;
    return new Date(epoch);
  }

  public getEpochFromDate(date: Date) {
    if (!date) {
      return null;
    }
    date.setMilliseconds(0);
    return date.getTime() / 1000;
  }


  getReqID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

}


