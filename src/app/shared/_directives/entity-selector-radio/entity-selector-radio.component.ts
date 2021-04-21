import { AfterViewInit, Component, ElementRef, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { PixelConstants } from '@app/entity/advertiser/_constants/PixelConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitySelectorRadioService } from '@app/shared/_services/entity-selector-radio.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  BaseModel,
  DashboardControllerService,
  DashboardFilters,
  DashboardRequest,
  Duration,
  PixelControllerService,
  SearchRequest
} from '@revxui/api-client-ts';
import { forkJoin, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// import { PixelFormModalComponent } from '@app/entity/advertiser/_directives/_modals/pixel-form-modal/pixel-form-modal.component';
import { PixelFormModalComponent } from '@app/shared/_components/pixel/pixel-form-modal/pixel-form-modal.component';

export interface ListApiParams {
  refresh: boolean;
  // 'filter': string;
  searchRequest: SearchRequest;
  sort: string;
  pageNo: number;
  pageSize: number;
  entity: string;
}

@Component({
  selector: 'app-entity-selector-radio',
  templateUrl: './entity-selector-radio.component.html',
  styleUrls: ['./entity-selector-radio.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class EntitySelectorRadioComponent implements OnInit, AfterViewInit {
  entityType: string;//advertiser, campaign , pixel
  advId;//for campaign and pixel
  selectedStatus: any;
  advBaseModelForPxlFrom: BaseModel;


  private listApiParams = {} as ListApiParams;

  dashboardFilters = {} as DashboardFilters;
  arrDashboardFilters: DashboardFilters[] = [];
  // searchRequest = {} as SearchRequest;
  dashboardRequest = {} as DashboardRequest;

  //for mat-table(5 feilds)
  displayedColumns: any;
  showProgressBar = false;//ui only
  listSource: any = new MatTableDataSource();
  listMetrics: any;
  public listLen: number;
  @ViewChild('tableContent', { static: false }) public tableContent: ElementRef<any>;
  @ViewChild('input', { static: false }) input: ElementRef;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  //for search api storing and fetching and data-unavailable
  searchTxt: string = '';
  dataUnavailableMsg;//this message depends on the entity
  showDataUnavailableMsg: boolean = false;

  selectedElement: any; //seleccted radio from ui
  showWarning: boolean; //ui warning
  objective: any;  //passing selected to caller


  constructor(
    private pixelApiService: PixelControllerService,
    private dashboardService: DashboardControllerService,
    private radioService: EntitySelectorRadioService,
    @Optional() private readonly activeModal: NgbActiveModal,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    // console.log(this.advBaseModelForPxlFrom);
    this.getAndSetRequiredEntities();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.getAndSetRequiredEntities('SORT API CALLED'))
      )
      .subscribe();
  }

  done() {
    if (!this.selectedElement) {
      this.showWarning = true;
    } else {
      this.objective = this.selectedElement;
      // console.log(this.objective);
      this.activeModal.close(this.objective);
      this.dismissModal();
    }
  }


  dismissModal() {
    this.activeModal.close();
  }

  private updateListApiParams(refresh?: boolean) {
    this.listApiParams.entity = this.entityType;
    if (this.paginator && this.paginator.pageIndex) {
      this.listApiParams.pageNo = this.paginator.pageIndex + 1;
    } else {
      this.listApiParams.pageNo = 1;
    }
    if (this.paginator && this.paginator.pageSize) {
      this.listApiParams.pageSize = this.paginator.pageSize;
    } else {
      this.listApiParams.pageSize = 10;
    }
    if (this.sort && this.sort.active) {
      if (this.sort.direction === 'asc') {
        this.listApiParams.sort = this.sort.active + '+';
      } else {
        this.listApiParams.sort = this.sort.active + '-';
      }
    }

    if (refresh) {
      this.listApiParams.refresh = true;
    }
  }


  getAndSetRequiredEntities(key?: string, refresh?: boolean) {
    let entityRequest
    this.listApiParams.searchRequest = {} as SearchRequest;
    this.showProgressBar = true;
    this.updateListApiParams(refresh);

    switch (this.entityType) {
      case AppConstants.ENTITY.ADVERTISER:
        this.dataUnavailableMsg = 'No Advertiser found.'
        if (!this.dashboardFilters.value) {
          // entityRequest = this.dashboardService.getDictionaryUsingPOST('ADVERTISER', this.listApiParams.pageNo,
          //   this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);
        } else {
          this.dashboardFilters.column = 'name';
          this.arrDashboardFilters.push(this.dashboardFilters);
          this.listApiParams.searchRequest.filters = this.arrDashboardFilters;
          // entityRequest = this.dashboardService.getDictionaryUsingPOST('ADVERTISER', this.listApiParams.pageNo,
          //   this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);
        }
        entityRequest = this.dashboardService.getDictionaryUsingPOST('ADVERTISER', this.listApiParams.pageNo,
          this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);
        break;

      case AppConstants.ENTITY.CAMPAIGN:
        this.dataUnavailableMsg = 'No Campaign found.';

        let duration = {} as Duration;
        duration = { startTimeStamp: 1420105637, endTimeStamp: Date.now() / 1000 };

        const dashboardFiltersForAdv = {} as DashboardFilters;
        dashboardFiltersForAdv.column = 'advertiserId';
        dashboardFiltersForAdv.value = this.advId;

        this.dashboardRequest.duration = duration;
        this.arrDashboardFilters.push(dashboardFiltersForAdv);
        this.dashboardRequest.filters = this.arrDashboardFilters;

        if (!this.dashboardFilters.value) {
          this.listApiParams.searchRequest = { filters: this.dashboardRequest.filters };
          // entityRequest = this.dashboardService.getDetailDictionaryUsingPOST('CAMPAIGN', this.listApiParams.pageNo,
          //   this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);
        } else {
          this.dashboardFilters.column = 'name';
          this.arrDashboardFilters.push(this.dashboardFilters);
          this.dashboardRequest.filters = this.arrDashboardFilters;
          this.listApiParams.searchRequest = { filters: this.dashboardRequest.filters };
          // entityRequest = this.dashboardService.getDetailDictionaryUsingPOST('CAMPAIGN', this.listApiParams.pageNo,
          //   this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);
        }
        entityRequest = this.dashboardService.getDetailDictionaryUsingPOST('CAMPAIGN', this.listApiParams.pageNo,
          this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);
        break;

      case AppConstants.ENTITY.PIXEL:
        this.dataUnavailableMsg = 'No Pixel found.'
        if (!this.dashboardFilters.value) {
          // entityRequest = this.pixelApiService.searchPixelsUsingPOST(this.advId, this.listApiParams.pageNo, this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);
        } else {
          this.dashboardFilters.column = 'name';
          this.arrDashboardFilters.push(this.dashboardFilters);
          this.listApiParams.searchRequest.filters = this.arrDashboardFilters;
        }
        entityRequest = this.pixelApiService.searchPixelsUsingPOST(this.advId, this.listApiParams.pageNo, this.listApiParams.pageSize, this.listApiParams.refresh, null, this.listApiParams.searchRequest, this.listApiParams.sort);

        break;
    }

    // console.log(this.dashboardFilters)
    // console.log('listApi Params==> ', this.listApiParams);

    forkJoin([entityRequest]).subscribe((results: any) => {
      this.setListSource(results);
      this.showProgressBar = false;
    });
  }

  setListSource(dataToBeDisplayed) {
    this.showDataUnavailableMsg = false;
    this.listMetrics = this.radioService.getMetricsForList(this.entityType);
    this.displayedColumns = this.listMetrics.map(lc => lc.id);
    this.resetSearchObjects();
    // console.log(dataToBeDisplayed);

    const apiDataLen = (dataToBeDisplayed[0] && dataToBeDisplayed[0].respObject && dataToBeDisplayed[0].respObject.totalNoOfRecords) ? dataToBeDisplayed[0].respObject.totalNoOfRecords : 0;
    const apiData = (dataToBeDisplayed[0] && dataToBeDisplayed[0].respObject && dataToBeDisplayed[0].respObject.data) ? dataToBeDisplayed[0].respObject.data : null;

    this.listLen = apiDataLen;
    this.listSource = new MatTableDataSource(apiData);
    this.showDataUnavailableMsg = (!apiDataLen) ? true : false;
  }


  applySearchFilter(str: string) {
    // this.dashboardFilters.value = str;
    this.getAndSetRequiredEntities();
  }

  resetSearchObjects(refresh?: boolean) {
    this.showDataUnavailableMsg = false;
    this.arrDashboardFilters = [];
    this.listApiParams.searchRequest = {};
    if (refresh) {
      this.dashboardFilters = {};
      this.listApiParams.refresh = true;
      this.getAndSetRequiredEntities();
    }
  }

  openPxlForm() {
    let dialogRef = this.dialog.open(PixelFormModalComponent, {
      width: '90%',
      height: '90%',
      data: this.advBaseModelForPxlFrom,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log('Dialog result:', result);
      switch (result) {
        case PixelConstants.MODAL.SAVE:
          this.getAndSetRequiredEntities(null, true);//auto refresh list after save
          break;
      }
    });


  }
}
