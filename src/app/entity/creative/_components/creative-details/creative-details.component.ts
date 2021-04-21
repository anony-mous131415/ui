import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { DateRange } from '@app/shared/_models/date.range.model';
import { AlertService } from '@app/shared/_services/alert.service';
import { DateRangePickerService } from '@app/shared/_services/date-range-picker.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { environment } from '@env/environment';
import { CreativeDTO, DashboardRequest, Duration, NativeAssetPojo } from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';
import { CrPreviewModalComponent } from '../../_directives/_modals/cr-preview-modal/cr-preview-modal.component';


@Component({
  selector: 'app-creative-details',
  templateUrl: './creative-details.component.html',
  styleUrls: ['./creative-details.component.scss']
})
export class CreativeDetailsComponent implements OnInit, OnDestroy {

  dateRangeSubscription: Subscription;

  breadcrumbs: string;
  crConst = CreativeConstants;
  showProgressBar = false;

  // the below is for dynamic preview
  dynamicPreviewLink: string;
  appConst = AppConstants;
  nativeAsset = {} as NativeAssetPojo;

  originHost = environment.hosts.origin;

  crPerf = {
    impressions: null,
    conversions: null,
    clicks: null
  };

  isPerfDataLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private crService: CreativeService,
    private modal: MatDialog,
    private alertService: AlertService,
    private drpService: DateRangePickerService,
    private menuService: MenucrumbsService
  ) { }

  creativeId: number;
  // creative:CreativeDTO;
  creative = {} as CreativeDTO;

  // to save the selected date range
  private dateRange: DateRange = null;

  ngOnInit() {
    this.setDateRange();
    this.subscribeDateRange();
    this.route.paramMap.subscribe(params => {
      const cid = params.get('cid');
      // console.log(params.get('id'))
      if (cid && !isNaN(Number(cid))) {
        this.creativeId = Number(cid);
        this.getCreativeDetails();
        this.getPerfData();
      } else {
        // show error
        this.router.navigate(['']);
      }

    });
  }

  ngOnDestroy() {
    this.dateRangeSubscription.unsubscribe();
  }

  // subscription to handle date range changes
  subscribeDateRange() {
    this.dateRangeSubscription = this.drpService.dateRangeWatcher()
      .subscribe((dateRange: DateRange) => {
        this.setDateRange(dateRange);
        this.getPerfData();
      });
  }

  getCreativeDetails() {
    this.dynamicPreviewLink = null;// this variable was persisting older value , so manually reset it
    this.showProgressBar = true;
    this.crService.getCreative(this.creativeId).subscribe(resp => {
      if (resp && resp.respObject) {
        // console.log('cr resp ', resp);
        this.creative = resp.respObject;

        if (this.creative.dcoAd && !this.creative.nativeAd && (this.creative.type === CreativeConstants.ALLOWED_TYPES.HTML)) {
          // pointing to demo / non-demo dynamic preview url below
          const role = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
          const demo_dp_link = 'https://cdn.atomex.net/atomex-ui/static/demo-files/demoGif.gif';
          const non_demo_dp_link = 'http://arg.atomex.net/?&rt=9994062958&ag=2&pid=1&sid=1&li=1&aio=0&al=0&ct=&pet=0&pu=1&bp=0&ass=0&cr=' + this.creative.id + '&a=' + this.creative.advertiser.id;
          this.dynamicPreviewLink = (role === AppConstants.USER_ROLE.DEMO) ? demo_dp_link : non_demo_dp_link;
        }

        if (this.creative.nativeAd === true) {
          this.nativeAsset = this.creative.nativeAsset;
          // console.log('native-aseet ', this.nativeAsset);
        }
        this.handleBreadcrumbs(this.creative);
      } else {
        // show error
      }
      this.showProgressBar = false;
    }, catchError => {
      this.showProgressBar = false;
    });
  }

  getPerfData() {
    this.isPerfDataLoading = true;
    const dashboardReq: DashboardRequest = {
      duration: { startTimeStamp: this.dateRange.startDateEpoch, endTimeStamp: this.dateRange.endDateEpoch } as Duration,
      filters: [],
      groupBy: ''
    };
    this.crService.getPerfData(this.creativeId, dashboardReq)
      .subscribe((resp: any) => {
        this.isPerfDataLoading = false;
        // console.log('resp ', resp);
        if (resp && resp.respObject) {
          this.crPerf.clicks = resp.respObject.clicks;
          this.crPerf.impressions = resp.respObject.impressions;
          this.crPerf.conversions = resp.respObject.conversions;
          // this.creative = resp.respObject;
          // this.handleBreadcrumbs(this.creative);
        } else {
          // show error
          this.isPerfDataLoading = false;
        }
      });
  }

  handleBreadcrumbs(cr?: CreativeDTO) {
    const breadcrumbsObj = { creative: { id: cr.id, name: cr.name } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  showPreviewModal(creativeDTO: CreativeDTO) {
    this.modal.open(CrPreviewModalComponent, {
      width: '70%',
      data: { creative: creativeDTO, nativeAsset: this.nativeAsset }
    });
  }


  // for acctivate and deactivate
  updateStatus(activate: number) {
    let msg = 'The creative will be deactivated';
    if (activate === 1) {
      msg = 'The creative will be activated';
    }
    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', msg)
    //   .then((confirmed) => {
    //     if (confirmed && activate === 1) {// PERFORM ACTIVATION
    //       this.crService.activateCreatives(this.creative.id.toString()).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, 'Successfully activated creative.', 'Error while activating creative.!!');
    //       });

    //     } else if (confirmed && activate === 0) {// PERFORM DE-activation
    //       this.crService.deactivateCreatives(this.creative.id.toString()).subscribe((apiResp) => {
    //         this.menuService.invalidateMenucrumbsData();
    //         this.showMessageAfterAction(apiResp, 'Successfully de-activated creative.', 'Error while de-activating creative!!');
    //       });

    //     }
    //   });

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed && activate === 1) {// PERFORM ACTIVATION
          this.crService.activateCreatives(this.creative.id.toString()).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully activated creative.', 'Error while activating creative.!!');
          });

        } else if (confirmed && activate === 0) {// PERFORM DE-activation
          this.crService.deactivateCreatives(this.creative.id.toString()).subscribe((apiResp) => {
            this.menuService.invalidateMenucrumbsData();
            this.showMessageAfterAction(apiResp, 'Successfully de-activated creative.', 'Error while de-activating creative!!');
          });

        }
      }
    );


  }

  showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
      this.getCreativeDetails();
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);
  }

  /**
   * This method will get the cached date range value in local storage
   */
  private setDateRange(dateRange?: DateRange) {
    this.dateRange = dateRange;
    if (!this.dateRange) {
      this.dateRange = this.drpService.getCachedDateRange();
    }
  }

  showTemplateType(creative) {
    if(creative.type === CreativeConstants.ALLOWED_TYPES.HTML && creative.templateBased) {
      return ' ' + (creative.dcoAd ? '(Template-DCO)' : '(Template)');
    }
    return '';
  }

}
