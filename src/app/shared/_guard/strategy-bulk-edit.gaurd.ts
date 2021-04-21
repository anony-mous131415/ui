import { CanDeactivate, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Helper } from '@app/entity/strategy/_services/strategy-bulk-edit.service';

export interface ComponentCanDeactivate {
    canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class StrategyBulkEditGaurd implements CanActivate {


    constructor(
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (Helper.ALLOWED) {
            return true;
        } else {
            this.router.navigate(['home']);
            return false;

        }
    }
}
