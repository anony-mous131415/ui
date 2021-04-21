import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesConstants } from '@app/shared/_constants/EntitiesConstants';
import { DashbaordDataModel } from '@app/shared/_models/dashboardData.model';
import { DateRange } from '@app/shared/_models/date.range.model';
import { AlertService } from '@app/shared/_services/alert.service';
import { DateRangePickerService } from '@app/shared/_services/date-range-picker.service';
import { ListService } from '@app/shared/_services/list.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { DashboardData, DashboardFilters, DashboardRequest, DashboardResponse, Duration } from '@revxui/api-client-ts';
import { UserInfo } from '@revxui/auth-client-ts';
import { merge, Subject, Subscription, of, Observable } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { ConfirmationModalComponent } from '../_modals/confirmation-modal/confirmation-modal.component';
import { StrategyQuickEditModalComponent } from '../_modals/strategy-quick-edit-modal/strategy-quick-edit-modal.component';
import { StrategyBulkEditService, Helper } from '@app/entity/strategy/_services/strategy-bulk-edit.service';
import { BulkEditActivityLogComponent } from '@app/entity/strategy/_directives/_modals/bulk-edit-activity-log/bulk-edit-activity-log.component';
import { BulkEditReviewRequestResponseComponent } from '@app/entity/strategy/_directives/_modals/bulk-edit-review-request-response/bulk-edit-review-request-response.component';


const KEY_REFRESH = 'refresh';
const KEY_ONCHANGE = 'onChanges';
const KEY_ONINIT = 'onInit';
const KEY_DATE_CHANGE = 'date';


export interface ListApiParams {
  'refresh': boolean;
  'filter': string;
  'sort': string;
  'pageNo': number;
  'pageSize': number;
  'entity': any;
  'showUU': boolean;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() entity: string;
  @Input() column: string;
  @Input() entityId: string;
  @Input() listTitle: string;
  @Input() dataUnavailableMsg: string;
  @Input() showImportExport: string;


  //revx-371 : 2 options for bulk edit 
  @Input() showStrBulkEdit: boolean;
  @Input() openFromCampaignDetails: boolean;


  @Output() export: EventEmitter<{ entity: string, ids: number[], dateRange: DateRange }> = new EventEmitter();
  @Output() import: EventEmitter<{ entity: string }> = new EventEmitter();

  @Output() navigateToStrBulkEit: EventEmitter<{ navigate: boolean, data: any }> = new EventEmitter();
  @Output() openBulkEditLogModal: EventEmitter<boolean> = new EventEmitter();


  appConst = AppConstants;
  selectedAllRow = false;
  selectedRowIds: number[] = [];
  selectedRowStatus: boolean[] = [];
  selectedRowDetails: any[] = [];
  disableActivateBtn = true;
  disableDeactivateBtn = true;
  allRowSelected = false;

  searchSubscription: Subscription;
  private searchSubject: Subject<string> = new Subject<string>();
  listSearchForm: FormGroup;

  // FOR UI only
  showProgressBar = false;
  // FOR UI only
  selectedStatus = 'true';
  searchedText = '';
  showDataUnavailableMsg = false;
  searchedList = [];

  searchTxt = '';
  private listApiParams = {} as ListApiParams;

  metricsOptions = this.listService.getMetricsOptions();
  preSelectedMetrics = this.listService.getPreSelectedMetrics();
  selectedMetrics = new FormControl(this.preSelectedMetrics); // This users can select from UI

  listMetrics: any[] = [];
  displayedColumns: any;
  columns: any[] = [];

  private duration = {} as Duration;
  private dateRange = {} as DateRange;
  private dashboardReq = {} as DashboardRequest;
  private apiResponse = {} as DashboardResponse;
  private apiData: DashbaordDataModel[] = [];

  dashboardFilters: DashboardFilters[] = [];
  listSource: MatTableDataSource<DashboardData>;
  public listLen: number;

  dateRangeSubscription: Subscription;

  @ViewChild('tableContent', { static: false }) public tableContent: ElementRef<any>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('input', { static: false }) input: ElementRef;
  menu: any[] = [];
  uuRespReceived: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private drpService: DateRangePickerService,
    private listService: ListService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private menucrumbService: MenucrumbsService,
    private router: Router,
    private modal: MatDialog,
    private authUIService: AuthenticationService,
    private menuService: MenucrumbsService,
  ) {

  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(500)).subscribe((searchInput: string) => {
      this.call_autosuggest_api(searchInput);
    });
    // For filtering with text
    this.listSearchForm = this.formBuilder.group({
      searchInput: ['', ''],
    });

    this.initializeList();
    this.subscribeDateRange();
    this.authUIService.licenseeSelectionWatcher().subscribe((item: UserInfo) => {
      this.fetchAPIData(KEY_ONINIT, null, false);
      // this.fetchAPIData(null, null, true);
      // this.fetchAPIDataWithUU();
    });
  }

  subscribeDateRange() {
    this.dateRangeSubscription = this.drpService.dateRangeWatcher().subscribe(dateRange => {
      if (dateRange) {
        this.dateRange = dateRange;
        this.fetchAPIData(KEY_DATE_CHANGE, null, false);
      }
    });
  }


  ngOnDestroy() {
    this.dateRangeSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  initializeList() {
    // this.selectedMetrics = this.listService.getMetricsForList();
    // console.log('pre selected ', this.preSelectedMetrics);
    this.listMetrics = this.listService.getMetricsForList(this.preSelectedMetrics, this.entity);
    this.displayedColumns = this.listMetrics.map(lc => lc.id);
    this.columns = this.route.snapshot.data['columns'];
    if (this.entity === AppConstants.ENTITY.STRATEGY.toLowerCase()) {
      this.setStrategyDropDownMenu();
    }
  }

  /**
   *  This detect the changes of the input parameters
   *  If parameter changes in the direcive, the below will be called
   *  @param changes - changes
   */
  ngOnChanges(changes: SimpleChanges) {

    if (this.dateRange && !this.dateRange.startDate) {
      this.dateRange = this.drpService.getCachedDateRange();
    }

    if (changes.entityId && changes.entityId.currentValue) {
      this.entityId = changes.entityId.currentValue;
    }

    if (changes.column && changes.column.currentValue) {
      this.column = changes.column.currentValue;
    }

    if (changes.entity && changes.entity.currentValue) {
      this.entity = changes.entity.currentValue;
    }

    // console.log('ng on change called ');
    this.fetchAPIData(KEY_ONCHANGE);
    // this.fetchAPIDataWithUU();
  }

  private updateListApiParams(toSortOnImpression?: boolean, showUUFlag?: boolean) {
    // this.listApiParams.entity = AppConstants.ROUTE_ENTITY_MAP[this.location.path().split('/')[1]];
    this.listApiParams.entity = this.entity.toUpperCase();

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

    if (toSortOnImpression && this.searchTxt && this.searchTxt.length > 0) {
      this.listApiParams.sort = 'impressions-';
    } else if (typeof toSortOnImpression === 'boolean' && !toSortOnImpression && (!this.searchTxt || !this.searchTxt.length)) {
      // toSortOnImpression must be false && search text is not there
      this.listApiParams.sort = null;
    }


    //when passed as null/undefined/false , it will be converted to false explicitely
    this.listApiParams.showUU = (!showUUFlag) ? false : true;
  }

  reload() {
    this.alertService.warning(EntitiesConstants.REFRESHING_DATA, false, true);
    this.listApiParams.sort = '';
    this.listApiParams.pageNo = 1;
    this.listApiParams.pageSize = 10;
    this.listApiParams.refresh = true;

    this.searchTxt = '';
    this.searchedText = '';
    this.showDataUnavailableMsg = false;

    this.selectedStatus = 'true';
    this.sort.active = '';
    this.sort.direction = '';


    // this.sort.sortChange.emit();

    this.paginator.pageIndex = 0;
    this.fetchAPIData(KEY_REFRESH, null, false);
    // this.fetchAPIDataWithUU();
  }

  downloadCSV() {
    if (this.entity.toLowerCase() !== AppConstants.ENTITY.CAMPAIGN.toLowerCase()) {
      this.alertService.warning(EntitiesConstants.EXPORTING_DATA, false, true);
      this.listService.getListDataCSV(this.dashboardReq, this.entity.toUpperCase()).subscribe(response => {
        if (response && response.respObject) {
          const fileUrl = response.respObject.fileDownloadUrl;
          const link = document.createElement('a');
          link.href = fileUrl;
          link.click();
          this.alertService.clear(true);
        }
      }, catchError => {
        this.alertService.clear(true);
      });
    } else {
      if (this.selectedRowIds.length > 0) {
        this.export.emit({ entity: this.entity, ids: this.selectedRowIds, dateRange: this.dateRange });
      }
    }
  }

  importCSV() {
    this.import.emit({ entity: this.entity });
  }

  updateListApiRequest() {
    this.duration.startTimeStamp = this.dateRange.startDateEpoch;
    this.duration.endTimeStamp = this.dateRange.endDateEpoch;
    this.dashboardReq.duration = this.duration;

    let dashboardFilter = {} as DashboardFilters;
    this.dashboardFilters = [];

    if (this.selectedStatus === 'true' || this.selectedStatus === 'false') {
      dashboardFilter.column = 'active';
      dashboardFilter.value = this.selectedStatus;
      this.dashboardFilters.push(dashboardFilter);
    }

    // console.log('dashabord filters ', this.dashboardFilters);

    if (this.column && this.entityId) {
      dashboardFilter = {} as DashboardFilters;
      dashboardFilter.column = this.column;
      dashboardFilter.value = this.entityId;
      this.dashboardFilters.push(dashboardFilter);
    }

    if (this.searchTxt) {
      dashboardFilter = {} as DashboardFilters;
      const id = Number(this.searchTxt);
      if (Number.isInteger(id)) {
        dashboardFilter.column = 'id';
      } else {
        dashboardFilter.column = 'name';
      }
      dashboardFilter.value = this.searchTxt;
      this.dashboardFilters.push(dashboardFilter);
    }

    this.dashboardReq.filters = this.dashboardFilters;
  }

  fetchAPIData(key?: string, toSortOnImpression?: boolean, showUUFlag?: boolean) {
    // console.log('key in fetchAPIData : ', key);
    // Need to check the entity from input and url are same
    this.updateListApiRequest();
    this.updateListApiParams(toSortOnImpression, showUUFlag);
    if (key === 'confirm') {
      this.listApiParams.refresh = true;
    }

    this.showProgressBar = true;
    // console.log('showProgressBar = ', this.showProgressBar);
    // console.log(this.dashboardReq);
    // console.log(this.listApiParams);
    // console.log(this.listApiParams.pageNo, this.listApiParams.pageSize, 'refresh= ', this.listApiParams.refresh, 'showUU=', this.listApiParams.showUU);
    // this.listApiParams.showUU = false;
    this.listService.getListData(this.dashboardReq, this.listApiParams)
      .subscribe(response => {
        this.showProgressBar = false;
        // console.log('showProgressBar = ', this.showProgressBar);
        if (this.searchTxt) {
          this.searchedText = this.searchTxt;
        }

        this.apiResponse = response.respObject;
        this.apiData = this.apiResponse.data;
        this.drawList();
        this.alertService.clear(true);



        //sequential calls 
        let callerKeyForSeqApi = [KEY_REFRESH, KEY_ONCHANGE, KEY_ONINIT, KEY_DATE_CHANGE];
        if (callerKeyForSeqApi.includes(key)) {
          this.fetchAPIDataWithUU();
        }


      }, catchError => {
        this.showProgressBar = false;
        this.uuRespReceived = true;
        this.alertService.clear(true);
      });
    this.resetSelection();
  }


  fetchAPIDataWithUU() {
    this.listApiParams.showUU = true;
    this.uuRespReceived = false;

    this.listService.getListData(this.dashboardReq, this.listApiParams)
      .subscribe(response => {
        this.uuRespReceived = true;
        if (this.searchTxt) {
          this.searchedText = this.searchTxt;
        }
        this.apiResponse = response.respObject;
        this.apiData = this.apiResponse.data;

        this.drawList();
        this.alertService.clear(true);
      }, catchError => {
        this.showProgressBar = false;
        this.uuRespReceived = true;
        this.alertService.clear(true);
      });
    this.resetSelection();
  }

  private drawList() {
    // convert data as list data
    this.listSource = new MatTableDataSource(this.apiData);
    // console.log("list source", this.listSource);
    this.listLen = this.apiResponse.totalNoOfRecords;

    this.showDataUnavailableMsg = (this.listLen === 0);
  }

  ngAfterViewInit() {
    // this.initilizeTableSorting();
    // console.log('ngAfterViewInit called');
    this.sort.sortChange.subscribe(() => {
      // console.log('ngAfterViewInit called');
      this.paginator.pageIndex = 0;
    });
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.fetchAPIData('SORT API CALLED', null, true))
      )
      .subscribe();
  }


  resetSelection() {
    // console.log('reset called');
    this.allRowSelected = false;
    this.disableActivateBtn = true;
    this.disableDeactivateBtn = true;
    this.selectedRowIds.length = 0;
    this.selectedRowDetails.length = 0;
    this.selectedRowStatus.length = 0;
  }

  applyStatusFilter(activeStatus?: boolean) {
    this.resetSelection();
    this.alertService.warning(EntitiesConstants.FETCHING_DATA, false, true);
    if (activeStatus === true) {
      this.selectedStatus = 'true';
    } else if (activeStatus === false) {
      this.selectedStatus = 'false';
    } else {
      this.selectedStatus = '';
    }
    this.fetchAPIData('LIST FILTER API CALL', null, true);
  }

  applySearchFilter(clearSearch?: boolean, toSortOnImpression?: boolean) {
    this.selectedStatus = '';
    this.alertService.warning(EntitiesConstants.FETCHING_DATA, false, true);
    if (clearSearch) {
      this.searchTxt = '';
    }
    this.searchedText = '';
    this.searchedList = [];
    this.fetchAPIData('SEARCH FILTER API CALL', toSortOnImpression, true);
  }

  hideSearchEntitiesResults() {
    this.searchedList = [];
  }

  searchEntitiesOnKeyup(searchInput: string) {
    this.searchSubject.next(searchInput);
  }

  call_autosuggest_api(txt: string) {
    // console.log('searchEntitiesOnKeyup');
    if (txt.length > 1) {
      const dashboardFiltersArray: DashboardFilters[] = [];
      if (this.column) {
        const dashboardFilters = {} as DashboardFilters;
        dashboardFilters.column = this.column;
        dashboardFilters.value = this.entityId;
        dashboardFiltersArray.push(dashboardFilters);
      }
      if (this.entityId) {
        const dashboardFilters = {} as DashboardFilters;
        dashboardFilters.column = 'advertiserId';
        dashboardFilters.value = this.entityId;
        dashboardFiltersArray.push(dashboardFilters);
      }

      this.menucrumbService.getByName(this.entity.toUpperCase(), txt, dashboardFiltersArray).subscribe(response => {
        if (response.respObject.menuList.length === 0) {
          this.searchedList = [];
        } else {
          this.searchedList = [];
          const list = response.respObject.menuList;
          for (const i in list) {
            if (Number(i) < 5) {
              this.searchedList.push(list[i]);
            }
          }
        }
      });
    } else {
      this.searchedList = [];
    }
  }

  onChangeSelectedMetrics(event) {
    // this.selectedMetrics.value
    // console.log('this selectedMetrics ', event.source.value, event.source.selected);
    if (event && event.source.selected) {
      if (this.preSelectedMetrics.indexOf(event.source.value) === -1) {
        this.preSelectedMetrics.push(event.source.value);
      }
    } else if (event && !event.source.selected) {
      this.preSelectedMetrics.splice(this.preSelectedMetrics.indexOf(event.source.value), 1);
    }

    // console.log('preselected ', this.preSelectedMetrics);
    // this.selectedMetrics.value
    // for(let i)
    this.initializeList();
    this.drawList();

  }

  // not in use currently
  public scrollRight(): void {
    this.tableContent.nativeElement.scrollTo({ left: (this.tableContent.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  }

  // not in use currently
  public scrollLeft(): void {
    this.tableContent.nativeElement.scrollTo({ left: (this.tableContent.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  }


  selectAllRows() {
    for (const i in this.apiData) {
      if (this.allRowSelected !== undefined) {
        this.apiData[i].action = this.allRowSelected;
        this.drawList();
        if (this.allRowSelected === true) {
          this.selectedRowIds.push(this.apiData[i].id);
          this.selectedRowDetails.push(this.apiData[i]);
          this.selectedRowStatus.push(this.apiData[i].active);
        } else {
          this.selectedRowIds = [];
          this.selectedRowDetails = [];
          this.selectedRowStatus = [];
        }
      }
    }
    // console.log("this.selectedRows ===> ", this.selectedRowDetails);
    this.showHideActivateDeactivateButton();
  }



  selectRow(rowId: number, row: any, isChecked: boolean, status: boolean) {
    // console.log('number: ', rowId, isChecked);
    if (isChecked === true) {
      this.selectedRowIds.push(rowId);
      this.selectedRowDetails.push(row);
      this.selectedRowStatus.push(status);
    } else {
      this.selectedRowStatus.splice(this.selectedRowIds.indexOf(rowId), 1);
      this.selectedRowDetails.splice(this.selectedRowIds.indexOf(rowId), 1);
      this.selectedRowIds.splice(this.selectedRowIds.indexOf(rowId), 1);
    }
    // console.log("this.selectedRows ===> ", this.selectedRowDetails);
    this.showHideActivateDeactivateButton();
  }


  showHideActivateDeactivateButton() {
    if (this.selectedRowStatus.indexOf(true) > -1) {
      // this.disableActivateBtn = false;
      this.disableDeactivateBtn = false;
    } else {
      // this.disableActivateBtn = true;
      this.disableDeactivateBtn = true;
    }

    if (this.selectedRowStatus.indexOf(false) > -1) {
      // this.disableDeactivateBtn = false;
      this.disableActivateBtn = false;
    } else {
      // this.disableDeactivateBtn = true;
      this.disableActivateBtn = true;
    }
    // console.log('btn ', this.disableActivateBtn, this.disableDeactivateBtn, this.selectedRowStatus);
  }

  showMessageAfterAction(apiResp) {
    const successMsg = 'Successfully updated the status of ' + this.entity + '(s).';
    const errorMsg = 'Error while updating the status of ' + this.entity + '(s)!!';
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 2500);

    this.resetSelection();
  }

  seggregateRequiredIdsFromAllIds(requiredType): number[] {
    const returnIds: number[] = [];
    this.selectedRowDetails.forEach((adv) => {
      if (adv.active === requiredType) {
        returnIds.push(adv.id);
      }
    });
    return returnIds;
  }

  inConsistentStatus() {
    const arr: boolean[] = this.selectedRowStatus;
    arr.sort();
    return (arr[0] !== arr[arr.length - 1]);

  }

  public confirm(activate: number): void {
    // const modal: NgbModalRef = this.modalService.open(ConfirmationModalComponent, { backdrop: 'static', keyboard: true });
    let idsWhoseStatusIsToBeChanged: number[] = this.selectedRowIds;

    let msg = 'All selected item will be deactivated';
    if (activate === 1) {
      msg = 'All selected item will be activated';
    }

    const modalRef = this.modal.open(ConfirmationModalComponent, {
      data: {
        title: 'Warning',
        message: msg
      },
    });

    modalRef.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          if (activate === 1) { // ACTIVATE
            if (this.inConsistentStatus()) {
              idsWhoseStatusIsToBeChanged = this.seggregateRequiredIdsFromAllIds(false);
            }
            // console.log('ids To Be Activated', idsWhoseStatusIsToBeChanged)
            this.listService.activateEntity(this.entity, idsWhoseStatusIsToBeChanged).subscribe(resp => {
              // console.log(resp);
              this.menuService.invalidateMenucrumbsData();
              this.fetchAPIData('confirm', null, true);
              this.showMessageAfterAction(resp);
            });

          } else { // DE-ACTIVATE
            if (this.inConsistentStatus()) {
              idsWhoseStatusIsToBeChanged = this.seggregateRequiredIdsFromAllIds(true);
            }
            // console.log('ids To Be De-activated', idsWhoseStatusIsToBeChanged)
            this.listService.deactivateEntity(this.entity, idsWhoseStatusIsToBeChanged).subscribe(resp => {
              // console.log(resp);
              this.menuService.invalidateMenucrumbsData();
              this.fetchAPIData('confirm', null, true);
              this.showMessageAfterAction(resp);

            });
          }
        } else {
          // console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        }
      });
  }

  createEntity() {
    // console.log('create');
    switch (this.entity) {

      case AppConstants.ENTITY.ADVERTISER.toLowerCase():
        // console.log('adv');
        this.router.navigate(['/advertiser/create']);
        break;

      case AppConstants.ENTITY.CAMPAIGN.toLowerCase():
        if (this.entityId) {
          this.router.navigate(['/advertiser/' + this.entityId + '/campaign/create']);
        } else {
          this.router.navigate(['/campaign/create']);
        }
        break;

      case AppConstants.ENTITY.STRATEGY.toLowerCase():
        if (this.entityId) {
          this.router.navigate(['/strategy/' + this.entityId + '/create']);
        } else {
          this.router.navigate(['/strategy/create']);
        }
        break;

      case AppConstants.ENTITY.AUDIENCE.toLowerCase():
        if (this.entityId) {
          this.router.navigate(['/campaign/' + this.entityId + '/strategy/create']);
        } else {
          this.router.navigate(['/audience/create']);
        }
        break;
    }

  }

  setStrategyDropDownMenu() {
    this.menu = [
      {
        icon: 'fa fa-pencil',
        label: 'Quick Edit',
        click: true
      },
    ];
  }

  quickEdit(row: any) {
    const dialogRef = this.modal.open(StrategyQuickEditModalComponent, {
      // width: '50%',
      // maxHeight: '90vh',

      width: '60%',
      // maxHeight: '90vh',
      height: '500px',

      data: {
        strategyId: row.id,
        // strategyId: 12345
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // refresh list nd send (refresh = true) in api call
        this.fetchAPIData('confirm', null, true);
      }
    });
  }


  //REVX-371 : strategy bulk edit
  onBulkEditClick() {

    const currAdvId: number = (this.selectedRowDetails && this.selectedRowDetails.length > 0 && this.selectedRowDetails[0].strategy) ? this.selectedRowDetails[0].strategy.advertiserId : null;

    let dataToEmit = {
      strategyList: this.selectedRowDetails,
      openFromCampaign: this.openFromCampaignDetails,
      advId: currAdvId
    }

    Helper.ALLOWED = true;
    this.navigateToStrBulkEit.emit({ navigate: true, data: dataToEmit });
  }



  onBulkEditLogClick() {
    this.openBulkEditLogModal.emit(true);
  }

}
