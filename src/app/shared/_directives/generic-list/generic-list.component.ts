import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { CrAssociationModalComponent } from '@app/entity/creative/_directives/_modals/cr-association-modal/cr-association-modal.component';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesConstants } from '@app/shared/_constants/EntitiesConstants';
import { DateRange } from '@app/shared/_models/date.range.model';
import { GenericListApiRequest } from '@app/shared/_models/generic-list-api-request.model';
import { AlertService } from '@app/shared/_services/alert.service';
import { DateRangePickerService } from '@app/shared/_services/date-range-picker.service';
import { DURATION, GenericListService } from '@app/shared/_services/generic-list.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { BaseModel, DashboardFilters, Duration, SearchRequest } from '@revxui/api-client-ts';
import { merge, Subject, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { ConfirmationModalComponent } from '../_modals/confirmation-modal/confirmation-modal.component';

export interface UIListParams {

  selectedAllRow: boolean;
  selectedRowIds: number[];
  selectedRowDetails: any[];
  selectedRowStatus: boolean[];

  disableActivateBtn: boolean;
  disableDeactivateBtn: boolean;
  showProgressBar: boolean;
  hideSearchEntitiesResults;
  selectedStatus: string;
  searchTxt: string;
  searchedText: string;
  showDataUnavailableMsg: boolean;

  listSource: MatTableDataSource<any>;
  listLen: number;

  listMetrics: any[];
  displayedColumns: any;
  columns: any[];

  apiData: any;
  searchedList: any[];
  refresh: boolean;

  dataUnavailableMsg: string;
}

@Component({
  selector: 'app-generic-list',
  templateUrl: './generic-list.component.html',
  styleUrls: ['./generic-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GenericListComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() entity: string;
  @Input() column: string;
  @Input() entityId: string;
  @Input() advId: string;
  @Input() listTitle: string;
  @Input() dataUnavailableMsg: string;
  @Input() exportBtnLink: string;
  @Input() editPageLink: string;
  @Input() detailsPageLink: string;
  @Input() showAutoCompleteSearch: boolean;
  @Input() showActivateDeActivateBtn: boolean;
  @Input() createPageLink: string;
  @Input() removeDefaultFilter: string;
  @Input() dropdownMenu: string;


  searchSubscription: Subscription;
  dateRangeSubscription: Subscription;
  dmpSubscription: Subscription;

  private searchSubject: Subject<string> = new Subject<string>();

  appConst = AppConstants;
  audConst = AudienceConstants;
  audienceType: any[];
  selectedAudienceType: any = null;

  listParams = {} as UIListParams;
  genericListApiReq = {} as GenericListApiRequest;
  listSearchForm: FormGroup;

  public entityLower: string;
  @ViewChild('tableContent', { static: false }) public tableContent: ElementRef<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('input', { static: false }) input: ElementRef;

  // allRowSelected: boolean = false;
  menu: any[] = [];
  showDmpInDropDown: boolean;

  // to save the selected date range
  private dateRange: DateRange = null;
  listDataSub: Subscription;

  closed = false;

  constructor(
    private formBuilder: FormBuilder,
    private genericListService: GenericListService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private menucrumbService: MenucrumbsService,
    private modal: MatDialog,
    private strService: StrategyService,
    private drpService: DateRangePickerService,
    private audienceService: AudienceService,
    // private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.entityLower = this.entity.toLowerCase();
    this.searchSubscription = this.searchSubject.pipe(debounceTime(500)).subscribe((searchInput: string) => {
      this.callAutoSuggestApi(searchInput);
    });

    this.dmpSubscription = this.audienceService.dmpForAdvLevelAccess.subscribe(resp => {
      this.showDmpInDropDown = resp;
      this.audienceType = this.strService.getAudienceType(this.showDmpInDropDown);
      this.route.queryParamMap.subscribe(queryParams => {
        this.handleAudienceFromUrl(queryParams.get('type'));
      })
    });

    // For filtering with text
    this.listSearchForm = this.formBuilder.group({
      searchInput: ['', ''],
    });

    this.setDateRange();
    this.initializeList();
    this.initializeListMenu();
    this.subscribeDateRange();
  }

  // subscription to handle date range changes
  subscribeDateRange() {
    this.dateRangeSubscription = this.drpService.dateRangeWatcher()
      .subscribe((dateRange: DateRange) => {
        // console.log('[GENERIC LIST]', dateRange);
        this.setDateRange(dateRange);
        this.fetchAPIData();
      });
  }


  initializeListMenu() {
    if (this.dropdownMenu) {
      this.menu = JSON.parse(this.dropdownMenu);
    }
  }

  handleAudienceFromUrl(audienceType: string) {
    if (this.entity === AppConstants.ENTITY.AUDIENCE) {
      // console.log('fetching type ...', audienceType.toUpperCase());

      switch (audienceType) {
        case AudienceConstants.TYPE.APP:
          this.selectedAudienceType = this.audienceType[0].value;
          break;
        case AudienceConstants.TYPE.WEB:
          this.selectedAudienceType = this.audienceType[1].value;
          break;
        case AudienceConstants.TYPE.DMP:
          if (this.audienceType.length === 3) {
            this.selectedAudienceType = this.audienceType[2].value;
          } else {
            this.router.navigate(['404']);
          }
          break;
      }
    }
    this.setDateRange(this.dateRange);
    this.fetchAPIData();

  }

  onAudTypeChange(event: any) {
    this.router.navigate([AppConstants.URL_AUDIENCE], {
      queryParams: {
        'type': event.value
      }
    });
    this.listParams.searchTxt = null;
    this.listParams.searchedText = null;
    this.listParams.selectedStatus = 'true';
    this.fetchAPIData();
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

  private initializeList() {
    this.setupListInitParams();
    // console.log('entity', this.entity);
    this.listParams.listMetrics = this.genericListService.getMetricsForList(this.entity);
    this.listParams.displayedColumns = this.listParams.listMetrics.map(lc => lc.id);
    this.listParams.columns = this.route.snapshot.data.columns;

    // console.log('list Metrics ', this.listParams.listMetrics);
    this.genericListApiReq.refresh = false;
    this.fetchAPIData();
  }

  private setupListInitParams() {
    this.listParams.selectedAllRow = false;
    this.listParams.selectedRowIds = [];
    this.listParams.selectedRowDetails = [];
    this.listParams.selectedRowStatus = [];

    this.listParams.disableActivateBtn = true;
    this.listParams.disableDeactivateBtn = true;

    this.listParams.listMetrics = [];
    this.listParams.columns = [];
    this.listParams.listLen = 0;
    this.listParams.showDataUnavailableMsg = false;
    this.listParams.searchedList = [];

    this.listParams.selectedStatus = 'true';
  }


  private updateListApiRequest() {
    let dashboardFilter = {} as DashboardFilters;
    let dashboardFilters = [];

    if (this.removeDefaultFilter === 'true' && !this.listParams.searchTxt) {
      dashboardFilters = [];
    }

    // for active-status
    switch (this.entity) {
      case AppConstants.ENTITY.CREATIVE:

        if (this.listParams.selectedStatus === 'true' || this.listParams.selectedStatus === 'false') {
          dashboardFilter.column = 'active';
          dashboardFilter.value = this.listParams.selectedStatus;
          dashboardFilters.push(dashboardFilter);
        }
        break;

      // catalog details table was empty due to active filter , so don't send 'active' filter
      case AppConstants.ENTITY.CATALOG_DETAILS:
        break;

      default:
        if (this.listParams.selectedStatus === 'true' || this.listParams.selectedStatus === 'false') {
          dashboardFilter.column = 'active';
          dashboardFilter.value = JSON.parse(this.listParams.selectedStatus);
          dashboardFilters.push(dashboardFilter);
        }
        break;
    }

    if (this.column && this.entityId) {
      dashboardFilter = {} as DashboardFilters;
      dashboardFilter.column = this.column;
      dashboardFilter.value = this.entityId;
      dashboardFilters.push(dashboardFilter);
    }

    // for search text
    if (this.listParams.searchTxt) {
      dashboardFilter = {} as DashboardFilters;
      const id = Number(this.listParams.searchTxt);
      if (Number.isInteger(id)) {
        dashboardFilter.column = 'id';
      } else {
        dashboardFilter.column = 'name';
      }
      dashboardFilter.value = this.listParams.searchTxt;
      dashboardFilters.push(dashboardFilter);
    }

    // advertiser specific CREATIVE and CONV. TRACKER
    if ((this.entity === AppConstants.ENTITY.CREATIVE || this.entity === AppConstants.ENTITY.PIXEL) && this.advId) {
      const dbFilter = {} as DashboardFilters;
      dbFilter.column = 'advertiserId';
      dbFilter.value = this.advId;
      dashboardFilters.push(dbFilter);
      // console.log(searchReq);
    }

    // adding duration filter to the list of filters
    if (this.entity === AppConstants.ENTITY.CREATIVE) {
      dashboardFilters = this.addDateRangeFilter(dashboardFilters, this.dateRange);
    }

    const searchReq = {} as SearchRequest;
    searchReq.filters = dashboardFilters; // apply all filters before this statement

    this.genericListApiReq.search = searchReq;

    if (this.paginator && this.paginator.pageIndex) {
      this.genericListApiReq.pageNumber = this.paginator.pageIndex + 1;
    } else {
      this.genericListApiReq.pageNumber = 1;
    }
    if (this.paginator && this.paginator.pageSize) {
      this.genericListApiReq.pageSize = this.paginator.pageSize;
    } else {
      this.genericListApiReq.pageSize = 10;
    }

    this.genericListApiReq.advertiserId = Number(this.advId);
    // this.genericListApiReq.refresh = false;
    if (this.sort && this.sort.active) {
      if (this.sort.direction === 'asc') {
        this.genericListApiReq.sort = this.sort.active + '+';
      } else {
        this.genericListApiReq.sort = this.sort.active + '-';
      }
    } else {
      this.genericListApiReq.sort = 'id-';
    }

    // console.log('generic list api req', this.genericListApiReq);
    if (this.entityId) {
      this.genericListApiReq.entityId = Number(this.entityId);
    }

    if (this.entity === AppConstants.ENTITY.AUDIENCE && this.selectedAudienceType) {
      const audienceApiReq = {} as DashboardFilters;
      audienceApiReq.column = AudienceConstants.TYPE_API_KEY;
      audienceApiReq.value = this.audienceService.getApiValue(this.selectedAudienceType).apiValue;
      this.genericListApiReq.search.filters.push(audienceApiReq);
    }

  }


  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.fetchAPIData('SORT API CALLED'))
      )
      .subscribe();
  }

  private fetchAPIData(key?: string) {
    // Need to check the entity from input and url are same
    this.updateListApiRequest();
    if (key === 'confirm') {
      this.listParams.refresh = true;
    }
    this.listParams.showProgressBar = true;
    this.listDataSub = this.genericListService.getListData(this.entity, this.genericListApiReq)
      .subscribe(response => {
        // console.log(response);
        this.listParams.showProgressBar = false;

        if (!response || !response.respObject || !response.respObject.totalNoOfRecords || response.respObject.totalNoOfRecords === 0) {
          // if (!response || !response.data) {
          this.listParams.showDataUnavailableMsg = true;
          this.listParams.listSource = new MatTableDataSource(null);
          this.listParams.listLen = 0;
          this.alertService.clear(true);
          return;
        } else {
          this.listParams.showDataUnavailableMsg = false;
        }

        if (this.listParams.searchTxt) {
          this.listParams.searchedText = this.listParams.searchTxt;
        }

        const numOfRecords = (response && response.respObject
          && response.respObject.totalNoOfRecords) ? response.respObject.totalNoOfRecords : 0;
        // const numOfRecords = (response && response.totalNoOfRecords) ? response.totalNoOfRecords : 0;
        this.listParams.listLen = Number(numOfRecords);
        this.listParams.apiData = (response && response.respObject && response.respObject.data) ? response.respObject.data : null;
        // this.listParams.apiData = (response && response.data) ? response.data : null;
        this.drawList();
        this.alertService.clear(true);

      }, catchError => {
        this.listParams.showProgressBar = false;
        this.alertService.clear(true);
      });
    this.resetSelection();
  }

  private drawList() {
    // convert data as list data
    this.listParams.listSource = new MatTableDataSource(this.listParams.apiData);
    this.listParams.showDataUnavailableMsg = this.listParams.listLen === 0;
  }

  applySearchFilter(clearSearch = false) {
    this.listParams.selectedStatus = '';
    this.alertService.warning(EntitiesConstants.FETCHING_DATA, false, true);
    if (clearSearch) {
      this.listParams.searchTxt = '';
    }
    this.listParams.searchedText = '';
    this.listParams.searchedList = [];
    this.fetchAPIData('SEARCH FILTER API CALL');
  }

  applyStatusFilter(activeStatus?: boolean) {
    this.resetSelection();
    this.alertService.warning(EntitiesConstants.FETCHING_DATA, false, true);
    if (activeStatus === true) {
      this.listParams.selectedStatus = 'true';
    } else if (activeStatus === false) {
      this.listParams.selectedStatus = 'false';
    } else {
      this.listParams.selectedStatus = '';
    }
    this.fetchAPIData('LIST FILTER API CALL');
  }

  reload() {
    this.alertService.warning(EntitiesConstants.REFRESHING_DATA, false, true);
    this.genericListApiReq.sort = '';
    this.genericListApiReq.pageNumber = 1;
    this.genericListApiReq.pageSize = 10;
    this.genericListApiReq.refresh = true;

    this.listParams.searchTxt = '';
    this.listParams.searchedText = '';
    this.listParams.showDataUnavailableMsg = false;

    this.listParams.selectedStatus = 'true';
    this.sort.active = '';
    this.sort.direction = '';
    this.sort.sortChange.emit();
  }

  searchEntitiesOnKeyup(searchInput: string) {
    this.searchSubject.next(searchInput);
  }

  callAutoSuggestApi(txt: string) {
    let tableEntity = this.entity.toUpperCase();
    let dashboardFiltersArray: DashboardFilters[] = [];
    if (txt.length > 1) {

      // for non-audience list
      if (this.entity !== AppConstants.ENTITY.AUDIENCE) {
        if (this.column) {
          const dashboardFilters = {} as DashboardFilters;
          dashboardFilters.column = this.column;
          dashboardFilters.value = this.entityId;
          dashboardFiltersArray.push(dashboardFilters);
        }
        if (this.advId) {
          const dashboardFilters = {} as DashboardFilters;
          dashboardFilters.column = 'advertiserId';
          dashboardFilters.value = this.advId;
          dashboardFiltersArray.push(dashboardFilters);
        }
      }

      // for audience list
      else {
        const dashboardFilters = {} as DashboardFilters;
        dashboardFilters.column = AudienceConstants.TYPE_API_KEY
        if (this.selectedAudienceType === AudienceConstants.TYPE.APP) {
          dashboardFilters.value = AudienceConstants.TYPE_API_VAL.APP;
          tableEntity = 'APP_AUDIENCE'
        } else if (this.selectedAudienceType === AudienceConstants.TYPE.WEB) {
          dashboardFilters.value = AudienceConstants.TYPE_API_VAL.WEB;
          tableEntity = 'WEB_AUDIENCE'
        } else if (this.selectedAudienceType === AudienceConstants.TYPE.DMP) {
          dashboardFilters.value = AudienceConstants.TYPE_API_VAL.DMP;
          tableEntity = 'DMP_AUDIENCE'
        }
        dashboardFiltersArray.push(dashboardFilters);
      }

      this.menucrumbService.getByName(tableEntity, txt, dashboardFiltersArray).subscribe(response => {
        if (response.respObject.menuList.length === 0) {
          this.listParams.searchedList = [];
        } else {
          this.listParams.searchedList = [];
          const list = response.respObject.menuList;
          for (const i in list) {
            if (Number(i) < 5) {
              this.listParams.searchedList.push(list[i]);
            }
          }
        }
      });
    } else {
      this.listParams.searchedList = [];
    }
  }

  hideSearchEntitiesResults() {
    // console.log('working clickout');
    this.listParams.searchedList = [];
  }

  selectRow(rowId: number, row: any, isChecked: boolean, status: boolean) {
    // console.log('number: ', rowId, isChecked);
    if (isChecked === true) {
      this.listParams.selectedRowIds.push(rowId);
      this.listParams.selectedRowDetails.push(row);
      this.listParams.selectedRowStatus.push(status);
    } else {
      this.listParams.selectedRowStatus.splice(this.listParams.selectedRowIds.indexOf(rowId), 1);
      this.listParams.selectedRowDetails.splice(this.listParams.selectedRowIds.indexOf(rowId), 1);
      this.listParams.selectedRowIds.splice(this.listParams.selectedRowIds.indexOf(rowId), 1);
    }
    // console.log("this.selectedRow Id ", this.listParams.selectedRowIds, this.listParams.selectedRowStatus);
    this.showHideActivateDeactivateButton();
  }

  showHideActivateDeactivateButton() {
    if (this.listParams.selectedRowStatus.indexOf(true) > -1) {
      this.listParams.disableDeactivateBtn = false;
    } else {
      this.listParams.disableDeactivateBtn = true;
    }

    if (this.listParams.selectedRowStatus.indexOf(false) > -1) {
      this.listParams.disableActivateBtn = false;
    } else {
      this.listParams.disableActivateBtn = true;
    }
    // console.log('btn ', this.listParams.disableActivateBtn, this.listParams.disableDeactivateBtn, this.listParams.selectedRowStatus);
  }

  selectAllRows() {
    for (const i in this.listParams.apiData) {
      if (this.listParams.selectedAllRow !== undefined) {
        this.listParams.apiData[i].action = this.listParams.selectedAllRow;
        this.drawList();
        if (this.listParams.selectedAllRow === true) {
          this.listParams.selectedRowIds.push(this.listParams.apiData[i].id);
          this.listParams.selectedRowDetails.push(this.listParams.apiData[i]);
          this.listParams.selectedRowStatus.push(this.listParams.apiData[i].active);
        } else {
          this.listParams.selectedRowIds = [];
          this.listParams.selectedRowDetails = [];
          this.listParams.selectedRowStatus = [];
        }
      }
    }
    // console.log(this.listParams.selectedRowIds);
    // console.log(this.listParams.selectedRowStatus);
    this.filterDataForAudienceList();
    this.showHideActivateDeactivateButton();
  }


  resetSelection() {
    // console.log('reset called');
    this.listParams.selectedAllRow = false;
    this.listParams.disableActivateBtn = true;
    this.listParams.disableDeactivateBtn = true;
    this.listParams.selectedRowIds = [];
    this.listParams.selectedRowDetails = [];
    this.listParams.selectedRowStatus = [];
    // console.log(this.allRowSelected,this.disableActivateBtn,this.disableDeactivateBtn,this.selectedRowIds,this.selectedRowStatus);
  }


  showMessageAfterAction(apiResp) {
    let successMsg = "Successfully updated the status of " + this.entity + "(s).";
    let errorMsg = "Error while updating the status of " + this.entity + "(s)!!";
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
    }
    else {
      this.alertService.error(errorMsg, false, true);

    }
    var that = this;
    setTimeout(function () {
      that.alertService.clear(true);
    }, 2500);

  }

  seggregateRequiredIdsFromAllIds(requiredType): number[] {
    let idsToBeDeactivated: number[] = [];
    this.listParams.selectedRowStatus.forEach((status, index) => {
      if (status == requiredType)
        idsToBeDeactivated.push(this.listParams.selectedRowIds[index]);
    });
    return idsToBeDeactivated

  }

  inConsistentStatus() {
    let arr: boolean[] = this.listParams.selectedRowStatus;
    arr.sort();
    return (arr[0] !== arr[arr.length - 1]);

  }

  changeStatus(activate: number): void {
    let idsWhoseStatusIsToBeChanged: number[] = this.listParams.selectedRowIds;

    let msg = 'All selected item will be deactivated';
    if (activate === 1) {
      msg = 'All selected item will be activated';
    }

    // this.confirmationModalService.confirm(ConfirmationModalComponent, 'Warning', msg).then(confirmed => {
    //   if (confirmed) {
    //     if (activate == 1) {//activation
    //       if (this.inConsistentStatus())
    //         idsWhoseStatusIsToBeChanged = this.seggregateRequiredIdsFromAllIds(false);
    //       // console.log('ids To Be Activated', idsWhoseStatusIsToBeChanged)
    //       this.genericListService.activateEntity(this.entity, idsWhoseStatusIsToBeChanged).subscribe(resp => {
    //         // console.log(resp);
    //         this.fetchAPIData('confirm');
    //         this.showMessageAfterAction(resp);
    //       });

    //     } else {//deactivation
    //       if (this.inConsistentStatus())
    //         idsWhoseStatusIsToBeChanged = this.seggregateRequiredIdsFromAllIds(true);
    //       // console.log('ids To Be De-activated', idsWhoseStatusIsToBeChanged)
    //       this.genericListService.deactivateEntity(this.entity, idsWhoseStatusIsToBeChanged).subscribe(resp => {
    //         // console.log(resp);
    //         this.fetchAPIData('confirm');
    //         this.showMessageAfterAction(resp);

    //       });
    //     }
    //   }
    // }).catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          if (activate === 1) {// activation
            if (this.inConsistentStatus()) {
              idsWhoseStatusIsToBeChanged = this.seggregateRequiredIdsFromAllIds(false);
            }
            // console.log('ids To Be Activated', idsWhoseStatusIsToBeChanged)
            this.genericListService.activateEntity(this.entity, idsWhoseStatusIsToBeChanged).subscribe(resp => {
              // console.log(resp);
              this.fetchAPIData('confirm');
              this.showMessageAfterAction(resp);
            });

          } else {// deactivation
            if (this.inConsistentStatus())
              idsWhoseStatusIsToBeChanged = this.seggregateRequiredIdsFromAllIds(true);
            // console.log('ids To Be De-activated', idsWhoseStatusIsToBeChanged)
            this.genericListService.deactivateEntity(this.entity, idsWhoseStatusIsToBeChanged).subscribe(resp => {
              // console.log(resp);
              this.fetchAPIData('confirm');
              this.showMessageAfterAction(resp);

            });
          }
        } else {
          console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)')
        }
      }
    );
  }

  downloadCSV() { }

  associateToStrategies() {
    let creatives: Array<BaseModel> = [];

    // tslint:disable-next-line: forin
    for (const i in this.listParams.selectedRowDetails) {
      const cr = this.listParams.selectedRowDetails[i];
      if (cr.errorMsg) {
        break;
      }
      const creative: BaseModel = {};
      creative.id = cr.id;
      creative.name = cr.name;
      creatives.push(creative);
    }

    // console.log(creatives);


    this.modal.open(CrAssociationModalComponent, {
      width: '80%',
      data: { advertiserId: this.advId, creativeList: creatives, redirectOnCancel: '/advertiser/' + this.advId + '/creative' }
    });

    // this.modalRef.close(null);

  }

  getIndex(i: number) {
    // console.log(i);
    return i % 2;
  }



  filterDataForAudienceList() {
    if (this.entity === AppConstants.ENTITY.AUDIENCE && Array.isArray(this.listParams.apiData)) {

      this.listParams.apiData.forEach((uiTableRow, currentIdx) => {
        let isToBeRemoved = this.getDisableStatus(uiTableRow);
        if (isToBeRemoved) {
          this.listParams.apiData[currentIdx].action = false; // for ui checkbox

          const idxToBeRemoved = this.listParams.selectedRowIds.indexOf(uiTableRow.id);
          this.listParams.selectedRowIds.splice(idxToBeRemoved, 1); // remove from api-request-ids
          this.listParams.selectedRowDetails.splice(idxToBeRemoved, 1);
          this.listParams.selectedRowStatus.splice(idxToBeRemoved, 1);
        }
      });

    }
  }


  getDisableStatus(row: any): boolean {
    if (this.entity !== AppConstants.ENTITY.AUDIENCE) {
      return false;
    }

    const isClickerAudience = (row && row.segmentType && row.segmentType === AudienceConstants.SEGMENT_TYPE.CLICKER) ? true : false;
    const isDmpAudience = (this.selectedAudienceType === AudienceConstants.TYPE.DMP) ? true : false; // not checking indivisual row , but selected option
    return (isClickerAudience || isDmpAudience);
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    if (this.dateRangeSubscription) {
      this.dateRangeSubscription.unsubscribe();
    }
    if (this.dmpSubscription) {
      this.dmpSubscription.unsubscribe();
    }
    if (this.listDataSub) {
      this.listDataSub.unsubscribe();
    }
  }

  /**
   * If filters list contains duration object, remove them and add the new values for start and end date
   * @param filters - list of DashboardFilters object
   * @param dateRange - new date range
   */
  private addDateRangeFilter(filters: DashboardFilters[], dateRange: DateRange) {

    if (filters && filters.length > 0) {
      filters = filters.filter(item => (item.column !== DURATION));
    }

    if (dateRange && dateRange.startDateEpoch && dateRange.endDateEpoch) {
      const duration: Duration = {
        startTimeStamp: dateRange.startDateEpoch,
        endTimeStamp: dateRange.endDateEpoch
      }
      const durationFilter: DashboardFilters = {
        column: DURATION,
        operator: null,
        value: (duration as any)
      };
      filters.push(durationFilter);
    }

    return filters;
  }

  getTooltip(column, row) {
    if (column && column.showToolTip) {
      return column.cellTooltip(row);
    }
  }

}
