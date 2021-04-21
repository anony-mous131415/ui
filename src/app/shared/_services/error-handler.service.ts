import { Injectable } from '@angular/core';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { AlertMessageConstants } from '../_constants/alert-message.constants';
import { AppConstants } from '../_constants/AppConstants';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandler {

  constructor(
    public alertService: AlertService,
    public authUIService: AuthenticationService
  ) { }


  /**
   * @param response - response
   * depending on the error in response , the appropriate message os showun in ui
   */
  apiError(response: any) {
    const userName = localStorage.getItem(AppConstants.CACHED_USERNAME);
    const token = localStorage.getItem(AppConstants.CACHED_TOKEN);
    const masterToken = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
    const errorObj = {} as errorObject;

    errorObj.api = response.url;

    if (userName) {
      errorObj.userName = userName;
    }

    if (token) {
      errorObj.token = token;
    }

    if (masterToken) {
      errorObj.masterToken = masterToken;
    }

    // if error response is sent by the api
    if (response && response.error && response.error.error) {
      if (response.error.error.code === 10011 || response.error.error.code === 10012) {
        this.authUIService.logout();
        this.alertService.error('Your current session has expired! Please login again.');
      } else {
        this.alertService.error(response.error.error.message, true);
      }
      errorObj.message = response.error.error.message;
    } else { // for http response error
      let respId = '';
      if (response && response.error && response.error.respId) {
        respId += ' - ' + response.error.respId;
      }
      this.alertService.error(AlertMessageConstants.SERVER_ERROR_MSG + respId, true);
      errorObj.message = AlertMessageConstants.SERVER_ERROR_MSG;
    }
    errorObj.responseId = response.error.respId;

  }
}

export interface errorObject {
  userName: string;
  token: string;
  masterToken: string;
  message: string;
  responseId: string;
  api: string;
}
