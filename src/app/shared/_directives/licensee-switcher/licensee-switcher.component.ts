import { Component, Optional, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AlertMessageConstants } from '@app/shared/_constants/alert-message.constants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { BlockUIConstants } from '@app/shared/_constants/BlockUIConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { ThemeService } from '@app/startup/_services/theme.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponseObjectTokenResponse, Licensee } from '@revxui/auth-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

const ERR_DEMO_USER_MULTIPLE_LICENSEE = 'Demo user with multiple licensee access is not allowed. Please contact the admin.';

@Component({
  selector: 'app-licensee-switcher',
  templateUrl: './licensee-switcher.component.html',
  styleUrls: ['./licensee-switcher.component.scss']
})
export class LicenseeSwitcherComponent {
  @BlockUI() blockUI: NgBlockUI;

  isLeftVisible = true;
  displayedColumns = ['name'];
  licenseeList: Licensee[] = [];
  licenseeListLen = 0;
  licenseeSource: MatTableDataSource<Licensee>;
  masterToken: string;
  showDismissModalIcon = false;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    @Optional() private readonly activeModal: NgbActiveModal,
    private authUIService: AuthenticationService,
    private themeService: ThemeService,
    private alertService: AlertService,
    private router: Router
  ) {
    // Calling user's privilege to get the licensees permissible
    this.getAllLicenseeAssignedForUser();

    const token = localStorage.getItem(AppConstants.CACHED_TOKEN);
    if (token) {
      this.showDismissModalIcon = true;
    }
  }

  /**
   * Fetch all licensees for the user and responsible to
   * populate the licensees in the UI for switching
   */
  getAllLicenseeAssignedForUser() {
    this.masterToken = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
    if (this.masterToken) {

      this.blockUI.start(BlockUIConstants.USR_PRIVILEGE);

      this.authUIService.getUserPrivilege(this.masterToken)
        .subscribe(apiResponse => {
          if (apiResponse && apiResponse.respObject) {
            this.licenseeList = apiResponse.respObject;

            // Populating all licesees to UI using Material Table
            this.licenseeSource = new MatTableDataSource(this.licenseeList);
            this.licenseeListLen = this.licenseeList.length;
            setTimeout(() => this.licenseeSource.paginator = this.paginator);
            setTimeout(() => this.licenseeSource.sort = this.sort);
          } else {
            this.apiRequestFailed(apiResponse.error.message);
          }
          this.blockUI.stop();
        }, () => {
          // If the route is /login we have to logout...
          this.signOut();
          this.blockUI.stop();
        });
    }
  }

  // Search licensee by text
  applyLicenseeFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Removing whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    if (this.licenseeSource) {
      this.licenseeSource.filter = filterValue;
    }
  }

  /**
   * Called through UI for switching between Licensees
   * @param licenseeId - licenseeId
   */
  switchLicenseeClick(licenseeId: number) {

    this.blockUI.start(BlockUIConstants.LOADING);
    // call theme before switch...
    this.themeService.populateThemeSettings(licenseeId, null).then(
      (val) => {
        if (val === true) {
          const masterToken = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
          // console.log("mster token", masterToken);
          this.blockUI.start(BlockUIConstants.LOADING);
          this.authUIService.switchLicensee(licenseeId, masterToken).subscribe(response => {
            if (response && response.respObject) {
              this.authUIService.cacheAuthElements(response);
              this.getUserInformation(response);
            } else {
              this.apiRequestFailed(AlertMessageConstants.SERVER_ERROR_MSG);
            }
            this.blockUI.stop();
          }, () => {
            this.blockUI.stop();
          });
        }
        this.blockUI.stop();
      }, () => {
        this.apiRequestFailed(AlertMessageConstants.SERVER_ERROR_MSG);
        this.blockUI.stop();
      }
    );
  }

  /**
   * Called after switching the licensee
   * @param response - response
   */
  getUserInformation(response: ApiResponseObjectTokenResponse) {
    this.authUIService.getUserInfo(response.respObject.token).subscribe(resp => {
      if (resp) {
        // TO save user details in local storage
        this.authUIService.cacheUserInformation(resp.respObject, true);
        // TO save token in local storage
        // if demo user has multiple licensee then log him out
        const role = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
        if (role === AppConstants.USER_ROLE.DEMO) {
          this.apiRequestFailed(ERR_DEMO_USER_MULTIPLE_LICENSEE);
        } else {
          //repeated api calls were reduced 
          window.location.href = AppConstants.URL_HOME;
          // this.router.navigate(['/home']);
          this.activeModal.dismiss();
          this.authUIService.licenseeSelectionSubject.next(resp.respObject);
        }
      } else {
        // hide the modal and show the error
        this.apiRequestFailed(AlertMessageConstants.SERVER_ERROR_MSG);
      }
    },
      () => {
        // If the route url is not login | hide the modal and show the error
        this.signOut();
      });
  }

  apiRequestFailed(msg: string) {
    this.alertService.error(msg, true);
    this.signOut();
  }

  signOut() {
    this.authUIService.logout();
    this.activeModal.close();
  }

  dismissModal() {
    this.activeModal.close();
  }

}
