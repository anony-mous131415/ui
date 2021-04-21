import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceElement, AudienceTBObject, GridData, StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import {
  ApiResponseObjectDictionaryResponse,
  DashboardControllerService,
  SearchRequest
} from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-target-block-audience-modal',
  templateUrl: './target-block-audience-modal.component.html',
  styleUrls: ['./target-block-audience-modal.component.scss']
})
export class TargetBlockAudienceModalComponent implements OnInit, OnDestroy {

  audConst = AudienceConstants;
  dmpAccessSubscription: Subscription;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  totalRowCount: any = {
    app: 0,
    web: 0,
    dmp: 0
  };

  sortDirection: any = 'name+';
  totalNoOfRecords = 0;
  noDataCurrently = false;

  gridData: MatTableDataSource<GridData>;

  colDef = [
    { id: 'name', title: 'Name' }
  ];
  columnsToDisplay = ['name'];

  selTargetList: GridData[] = [];
  selBlockList: GridData[] = [];

  audienceTBObject: AudienceTBObject = this.strService.initAudienceSelectionObject();

  searchReq: SearchRequest;
  // searchText: string;

  errMessage: string = null;
  requestInProgress = false;
  // ctrl = new FormControl();

  audienceType: any[];
  selectedAudienceType: any;

  bool_t: boolean = false;
  arr_t: AudienceElement[] = [];

  bool_b: boolean = false;
  arr_b: AudienceElement[] = [];
  showDmpSelection: boolean;

  constructor(
    private dashboardService: DashboardControllerService,
    private modalRef: MatDialogRef<TargetBlockAudienceModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any | any,
    private strService: StrategyService,
    private http: HttpClient
  ) { }

  ngOnDestroy() {
    this.dmpAccessSubscription.unsubscribe();
  }

  ngOnInit() {

    this.dmpAccessSubscription = this.strService.advDmpAccessSubject.subscribe((dmpStatus: boolean) => {
      this.showDmpSelection = dmpStatus;
      this.audienceType = this.strService.getAudienceType(dmpStatus);
      this.selectedAudienceType = this.audienceType[0].value;
      this.initModalValue();
    });

    // TBD: entity needs to be corrected
    this.paginator.page.subscribe(page => {
      this.getTableData(page.pageIndex + 1, page.pageSize);
    });

    // TBD: entity needs to be corrected
    this.getTableData(1, 50);
  }


  getTableData(pageIndex: number, pageSize: number, resetPagination?: boolean) {
    this.requestInProgress = true;

    let entity = this.formRequest() as any;

    this.dashboardService.getDictionaryUsingPOST(entity, pageIndex, pageSize, false, null,
      this.searchReq, this.sortDirection)
      .subscribe(
        (response: ApiResponseObjectDictionaryResponse) => {

          this.noDataCurrently = (response && response.respObject && response.respObject.totalNoOfRecords) ? false : true;
          this.initGridData(response.respObject, resetPagination);
          this.requestInProgress = false;
        },
        (error: any) => {
          this.requestInProgress = false;
        }
      );
  }



  formRequest() {
    let entity: string = AppConstants.ENTITY.AUDIENCE;

    if (this.selectedAudienceType === AudienceConstants.TYPE.WEB) {
      this.initSearchFilter(AudienceConstants.TYPE_API_VAL.WEB);
    } else if (this.selectedAudienceType === AudienceConstants.TYPE.APP) {
      this.initSearchFilter(AudienceConstants.TYPE_API_VAL.APP);
    } else if (this.selectedAudienceType === AudienceConstants.TYPE.DMP) {
      this.initSearchFilter(AudienceConstants.TYPE_API_VAL.DMP);
      entity = AppConstants.ENTITY.DMP_AUDIENCE;
    }
    return entity;
  }


  initSearchFilter(searchVal) {
    this.searchReq = null;
    this.searchReq = {
      filters: [{
        column: AudienceConstants.TYPE_API_KEY,
        value: searchVal
      }]
    }

    if (this.searchInput && this.searchInput.nativeElement && this.searchInput.nativeElement.value) {
      this.searchReq.filters.push({ column: 'name', value: this.searchInput.nativeElement.value })
    }

  }

  onEntitySearch() {
    this.getTableData(this.paginator.pageIndex, this.paginator.pageSize, true);
  }

  get config() {
    return this.configData;
  }

  sortData(event) {
    if (event.direction === 'desc') {
      this.sortDirection = 'name-';
    } else {
      this.sortDirection = 'name+';
    }
    this.getTableData(1, this.paginator.pageSize);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearAllSelection() {
    this.audienceTBObject = this.strService.initAudienceSelectionObject();
  }


  onSaveClick() {
    this.modalRef.close({
      audienceTBObject: this.audienceTBObject
    });
  }

  onCancelClick() {
    this.modalRef.close(null);
  }



  initGridData(resp: any, resetPagination?: boolean) {
    this.totalNoOfRecords = (resp && resp.totalNoOfRecords) ? resp.totalNoOfRecords : 0;
    this.setTotalRowCount(this.totalNoOfRecords, this.selectedAudienceType);

    const tableInput = (resp && resp.data) ? resp.data : null
    this.gridData = new MatTableDataSource(tableInput);

    // this.gridData = new MatTableDataSource(resp.data);

    this.selTargetList = this.getArray(this.selectedAudienceType, 1);
    this.selBlockList = this.getArray(this.selectedAudienceType, 0);
    const targetIds = this.selTargetList.map(item => item.id);
    const blockIds = this.selBlockList.map(item => item.id);
    const selIds = [...targetIds, ...blockIds];

    this.gridData.data.filter(item => selIds.indexOf(item.id) !== -1)
      .forEach(item => {
        if (targetIds.indexOf(item.id) !== -1) {
          item.isTargetted = true;
          item.isBlocked = false;
        }

        if (blockIds.indexOf(item.id) !== -1) {
          item.isTargetted = false;
          item.isBlocked = true;
        }
      });

    this.paginator.length = this.totalNoOfRecords;
    if (resetPagination) {
      this.paginator.firstPage();
    }
  }


  onAudTypeChange(event: any) {
    this.selectedAudienceType = event.value;
    this.searchInput.nativeElement.value = null;
    this.getTableData(0, 50, false);
  }

  onReset() {
    this.searchInput.nativeElement.value = '';
    this.getTableData(0, 50, true);
  }


  /**
   *
   * @param type to determine type of audience
   * @param status can be zero or 1 denoting block and target set respy.
   */
  audienceBucketSize(type: string, status: number) {
    if (status === 0) {
      return this.audienceTBObject[type].blockedList.length;
    } else {
      return this.audienceTBObject[type].targetList.length;
    }
  }

  /**
   *
   * @param type to determine type of audience
   * @param setType array to be derived from which set
   */
  getArray(type: string, setType: number): any[] {

    if (!type || !type.length) {
      return [];
    }

    if (setType === 0) {
      return this.audienceTBObject[type].blockedList;
    } else {
      return this.audienceTBObject[type].targetList;
    }
  }

  /**
   *
   * @param row ui table row
   * @param type type of audience in which the row belongs
   * @param setType to be removed from which set
   * purpose : remove directly from MY SELECTION area
   */
  removeItemSelection(row: any, type: string, setType: number) {
    if (setType === 0) {
      this.deleteFromBucket(this.audienceTBObject[type].blockedList, row);
    } else {
      this.deleteFromBucket(this.audienceTBObject[type].targetList, row);
    }
  }

  /**
   *
   * @param type audience to be cleared
   */
  clearSpecific(type: string) {
    this.audienceTBObject[type].blockedList = [];
    this.audienceTBObject[type].targetList = [];
  }

  /**
   *
   * @param row check if this row is blocked : ui indicator
   */
  isRowBlocked(row: any) {
    return this.isRowTargettedOrBlocked(row, this.selectedAudienceType, false);
  }

  /**
   *
   * @param row check if this row is targetted : ui indicator
   */
  isRowTargetted(row: any) {
    return this.isRowTargettedOrBlocked(row, this.selectedAudienceType, true);
  }

  isRowTargettedOrBlocked(row: any, audType: string, isTarget: boolean) {
    if (!row || !row.id || !audType) {
      return false;
    }
    const idList = this.getIdsArray(isTarget ? this.audienceTBObject[audType].targetList : this.audienceTBObject[audType].blockedList);
    return idList.includes(row.id);
  }

  // private addToList(item: any, isTarget: boolean) {
  //   const type = item.type;
  //   if (isTarget) {
  //     (this.audienceTBObject[type] as TargetingObject).targetList.push(item);
  //   } else {
  //     (this.audienceTBObject[type] as TargetingObject).blockedList.push(item);
  //   }
  // }

  /**
   * to initialize modal with the received data
   */
  initModalValue() {
    this.configData.targetList.forEach((item: AudienceElement) => {
      // this.addToList(item, true);
      const type = item.type;
      switch (type) {
        case AudienceConstants.TYPE.APP:
          this.addToBucket(this.audienceTBObject.app.targetList, item);
          break;
        case AudienceConstants.TYPE.WEB:
          this.addToBucket(this.audienceTBObject.web.targetList, item);
          break;
        case AudienceConstants.TYPE.DMP:
          this.addToBucket(this.audienceTBObject.dmp.targetList, item);
          break;
      }
    });

    this.configData.blockList.forEach(item => {
      // this.addToList(item, false);
      const type = item.type;
      switch (type) {
        case AudienceConstants.TYPE.APP:
          this.addToBucket(this.audienceTBObject.app.blockedList, item);
          break;
        case AudienceConstants.TYPE.WEB:
          this.addToBucket(this.audienceTBObject.web.blockedList, item);
          break;
        case AudienceConstants.TYPE.DMP:
          this.addToBucket(this.audienceTBObject.dmp.blockedList, item);
          break;
      }
    });
  }

  /**
   *
   * @param inputBucket takes this argument and returns [] of id of elements in the set
   */
  getIdsArray(inputBucket: AudienceElement[]): number[] {
    const isWellDefined = (inputBucket && Array.isArray(inputBucket) && inputBucket.length) ? true : false;
    const arr: number[] = (isWellDefined) ? inputBucket.map(x => x.id) : [];
    return arr;
  }

  /**
   *
   * @param inputSet : set on which operation is to be performed : only if element not there already
   * @param inputElement : element to be operated
   */
  addToBucket(inputBucket: any[], inputElement: AudienceElement) {
    const targetIdArr = this.getIdsArray(inputBucket);
    if (inputElement && inputElement.id && !targetIdArr.includes(inputElement.id)) {
      inputBucket.push(inputElement);
    }
  }

  /**
   *
   * @param inputBucket : set on which operation is to be performed : only if element is there already
   * @param inputElement : element to be operated  (DRY)
   */
  deleteFromBucket(inputBucket: any[], inputElement: AudienceElement) {

    if (!inputElement || !inputElement.id || !inputBucket) {
      return;
    }

    const blockIdArr = this.getIdsArray(inputBucket);
    if (inputElement && inputElement.id) {
      const index = blockIdArr.findIndex(item => item === inputElement.id);
      if (index !== -1) {
        inputBucket.splice(index, 1);
      }
    }
  }

  /**
   *
   * @param row for adding this row in appropriate targeting set
   */
  addToTargetBucket(row: any) {
    this.updateBucket(this.selectedAudienceType, row, true);
  }

  /**
   *
   * @param row for adding this row in appropriate blocking set
   */
  addToBlockBucket(row: AudienceElement) {
    this.updateBucket(this.selectedAudienceType, row, false);
  }

  /**
   *
   * @param destination_bucket : row will be added to this set
   * @param source_bucket : row will be removed from this set (if present)
   * @param row : element to be inserted
   */
  updateBucket(audType: string, row: AudienceElement, isTarget: boolean) {

    if (!audType || !audType.length || !row) {
      return;
    }

    if (isTarget) {
      this.deleteFromBucket(this.audienceTBObject[audType].blockedList, row);
      this.addToBucket(this.audienceTBObject[audType].targetList, row);
    } else {
      this.deleteFromBucket(this.audienceTBObject[audType].targetList, row);
      this.addToBucket(this.audienceTBObject[audType].blockedList, row);
    }
  }

  setTotalRowCount(rowCount: number, audType: string) {
    this.totalRowCount[audType] = rowCount;
  }


}
