import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // import Router and NavigationEnd
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { Helper } from '@app/entity/strategy/_services/strategy-bulk-edit.service';

// declare ga as a function to set and sent the events
declare let ga: Function;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Revx UI';

  constructor(public router: Router) {

    Helper.ALLOWED = false;

    // subscribe to router events and send page views to Google Analytics
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // ga('set', 'page', event.url);
        // ga('send', 'pageview');
      }
    });

    /**
     * Listener for different inactive tabs
     * 1. If user do the licensee switch, the inactive tabs redirect to the home
     * 2. If user do the logout, the inactive tabs also would logout
     */
    window.addEventListener('storage', (event) => {
      if (this.router.url !== '/login' &&
        !localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN) && !localStorage.getItem(AppConstants.CACHED_TOKEN)) {
        window.location.href = AppConstants.URL_LOGIN;
      }
      if (event.key === AppConstants.CACHED_LICENSEE_NAME && event.newValue !== event.oldValue) {
        window.location.href = AppConstants.URL_HOME;
      }
    }, false);
  }

}
