import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesConstants } from '@app/shared/_constants/EntitiesConstants';
import { LicenseeSwitcherComponent } from '@app/shared/_directives/licensee-switcher/licensee-switcher.component';
import { BulkUploadModalComponent } from '@app/shared/_directives/_modals/bulk-upload-modal/bulk-upload-modal.component';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { FaviconService } from '@app/shared/_services/favicon.service';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { ThemeService } from '@app/startup/_services/theme.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WhitelabelingEntity } from '@revxui/api-client-ts';
import { UserInfo } from '@revxui/auth-client-ts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  breadcrumbs: string;

  chartUIObj: any;
  listUIObj: any;
  bcUIObj: any;

  isUserLoggedIn = false;
  themeSubscription: Subscription;
  themeEntities = {} as WhitelabelingEntity;
  loginLogo: string;

  constructor(
    private authUIService: AuthenticationService,
    private strService: StrategyService,
    private readonly modalService: NgbModal,
    private themeService: ThemeService,
    private faviconService: FaviconService,
    private titleService: Title,
    private modal: MatDialog,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.openSwitcherModal();
    this.authUIService.licenseeSelectionWatcher().subscribe((item: UserInfo) => {
      this.modalService.dismissAll();
      this.isUserLoggedIn = true;
    });
    this.handleTheme();
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }

  // export(event) {
  //   this.strService.export(event);
  // }

  // import(event: any) {
  //   this.strService.import(event);
  // }

  private openSwitcherModal(): void {
    if (!localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN)) {
      this.authUIService.logout();
    }

    if (!localStorage.getItem(AppConstants.CACHED_TOKEN)) {
      this.modalService.open(LicenseeSwitcherComponent, { backdrop: 'static', keyboard: false });
    } else {
      this.isUserLoggedIn = true;
    }
  }

  private handleTheme() {
    // check with the localstorage
    const cachedThemeEntities = JSON.parse(localStorage.getItem(AppConstants.CACHED_THEME_SETTINGS));
    if (cachedThemeEntities) {
      this.themeEntities = cachedThemeEntities;
      this.loginLogo = this.themeEntities.logoLg;

      if (this.themeEntities.favIcon) {
        this.faviconService.activate(this.themeEntities.favIcon);
      }
      if (this.themeEntities.pageTitle) {
        this.titleService.setTitle(this.themeEntities.pageTitle);
      }
    }

    this.themeSubscription = this.themeService.watchTheme().subscribe(
      response => {
        if (response) {
          this.themeEntities = response;
          this.loginLogo = response.logoLg;
          this.faviconService.activate(response.favIcon);
          this.titleService.setTitle(response.pageTitle);
        }
      }
    );
  }

  // TBD: need to find a better way to do this
  public export(event: any) {
    const startTime = moment(event.dateRange.startDateEpoch * 1000).format('MMMM D, YYYY');
    const endTime = moment(event.dateRange.endDateEpoch * 1000).subtract(1,'days').format('MMMM D, YYYY');

    const msg = `All active Strategies for the selected Campaigns will be exported with performance metrics from
    ${startTime} to ${endTime}.
    You can modify Bid Price, Bid Type, F-Cap, and Strategy Name in the exported file and
    import the file again to bulk edit modified strategies.`;

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.alertService.warning(EntitiesConstants.EXPORTING_DATA, false, true);
          this.strService.exportStrategyData(event);
        }
      }
    );

  }

  // TBD: need to find a better way to do this
  public import(event: any) {
    const modalRef = this.modal.open(BulkUploadModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      data: {
        title: 'Enter Strategies Below',
        isValidateRequired: true,
      },
    });
    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          // console.log(result);
        }
      }
    );
  }

}
