import { Injectable } from '@angular/core';

import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppConstants } from '../_constants/AppConstants';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const token = localStorage.getItem(AppConstants.CACHED_TOKEN);
    // this.logger.debug("token ", token);
    if (token) {
      return true;
    }
    // not logged in so redirect to login page with the return url
    // this.router.navigate([AppConstants.URL_LOGIN], { queryParams: { returnUrl: state.url } });
    this.router.navigate([AppConstants.URL_LOGIN]);
    return false;
  }
}
