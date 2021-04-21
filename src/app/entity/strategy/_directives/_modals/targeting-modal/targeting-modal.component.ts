import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange, MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import {
  ApiResponseObjectDictionaryResponse,
  ApiResponseObjectEResponseobject, DashboardControllerService, DashboardFilters, SearchRequest
} from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-targeting-modal',
  templateUrl: './targeting-modal.component.html',
  styleUrls: ['./targeting-modal.component.scss']
})
export class TargetingModalComponent implements OnInit {

  rowSelectionSubscription: Subscription;
  searchSubscription: Subscription;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  totalRowCount: number = 0;
  sortDirection: any = 'name+';
  gridData: MatTableDataSource<any>;
  columnsToDisplay = ['name'];
  selTargetList: any[] = [];
  selBlockList: any[] = [];
  searchReq: SearchRequest;
  searchText: string;
  errMessage: string = null;
  requestInProgress = false;
  ctrl = new FormControl();

  constructor(
    public modalRef: MatDialogRef<TargetingModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private dashboardService: DashboardControllerService,
    private strService: StrategyService,
  ) { }

  ngOnInit() {
    this.initValues();
    this.searchSubscription = this.ctrl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        value => {
          if (value !== null && value !== undefined) {
            this.onEntitySearch(value);
          }
        }
      );

    this.paginator.page.subscribe(page => {
      this.getTableData(false, this.configData.entity, page.pageIndex + 1, this.paginator.pageSize);
    });
    this.getTableData(true, this.configData.entity, 0, 100);
  }


  initValues() {
    this.config.targetList.forEach(element => {
      this.selTargetList.push(element);
    });

    this.config.blockList.forEach(element => {
      this.selBlockList.push(element);
    });
  }


  isRowSelected(element: any) {
    //target
    if (this.config.type === 1) {
      return this.isRowTargetted(element);
    }

    //block
    else if (this.config.type === -1) {
      return this.isRowBlocked(element);

    }
  }

  cbRowToggle(event: MatCheckboxChange, element: any) {
    let newStatus = event.checked;
    //target
    if (this.config.type == 1) {
      (newStatus) ? this.addToBucket(this.selTargetList, element) : this.deleteFromBucket(this.selTargetList, element);
    }
    //block
    else if (this.config.type == -1) {
      (newStatus) ? this.addToBucket(this.selBlockList, element) : this.deleteFromBucket(this.selBlockList, element);
    }
  }




  ngOnDestroy() {
    if (this.rowSelectionSubscription) {
      this.rowSelectionSubscription.unsubscribe();
    }

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getTableData(isInit: boolean, entity: any, pageIndex: number, pageSize: number, resetPagination?: boolean) {
    if (this.configData.custom !== null && this.configData.custom !== undefined) {
      if (this.searchReq !== null && this.searchReq !== undefined) {
        this.searchReq.filters = this.searchReq.filters.filter(item => item.column === 'name');
      } else {
        this.searchReq = { filters: [] };
      }

      Object.keys(this.configData.custom).forEach(key => {
        this.searchReq.filters.push({
          column: key,
          value: this.configData.custom[key]
        });
      });
    }

    this.requestInProgress = true;

    if (entity === 'STATE' || entity === 'CITY') {
      this.dashboardService.getDetailDictionaryUsingPOST(entity, pageIndex, pageSize, false, null,
        this.searchReq, this.sortDirection).subscribe(
          (response: ApiResponseObjectEResponseobject) => {
            this.setupTable(response.respObject, resetPagination);
            this.requestInProgress = false;
          },
          (error: any) => {
            this.requestInProgress = false;
          }
        );
    }

    else {
      this.dashboardService.getDictionaryUsingPOST(entity, pageIndex, pageSize, false, null,
        this.searchReq, this.sortDirection)
        .subscribe(
          (response: ApiResponseObjectDictionaryResponse) => {
            this.setupTable(response.respObject, resetPagination);
            this.requestInProgress = false;
          },
          (error: any) => {
            this.requestInProgress = false;
          }
        );
    }

  }

  onReset() {
    this.searchReq = null;
    this.searchText = '';
    this.getTableData(false, this.configData.entity, 1, 100, true);
  }

  onEntitySearch(value) {
    const searchText = value;
    if (searchText != null && searchText !== undefined) {
      if (searchText.trim().length > 1) {
        this.searchReq = {
          filters: [{
            column: 'name',
            value: searchText
          } as DashboardFilters]
        } as SearchRequest;
        this.getTableData(false, this.configData.entity, this.paginator.pageIndex, this.paginator.pageSize, true);
        // (this.paginator) ? this.paginator.firstPage() : null;
      } else if (searchText.trim().length === 0) {
        if (this.searchReq && this.searchReq.filters) {
          this.searchReq.filters = this.searchReq.filters.filter(item => item.column !== 'name');
        }
        this.getTableData(false, this.configData.entity, this.paginator.pageIndex, this.paginator.pageSize, true);
        // (this.paginator) ? this.paginator.firstPage() : null;
      }
    } else {
      this.searchReq = null;
    }
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
    this.getTableData(false, this.configData.entity, 1, this.paginator.pageSize);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  clearAllSelection() {
    this.selTargetList = [];
    this.selBlockList = [];

    this.configData.targetList = [];
    this.configData.blockList = [];

    // this.masterCbStatus = false;
  }

  removeItemSelectionFromSidePanel(element, type) {
    if (type === 1) {
      this.deleteFromBucket(this.selTargetList, element);
    } else if (type === -1) {
      this.deleteFromBucket(this.selBlockList, element);
    }
  }

  addToTargetList(row: any) {
    this.addToTargetBucket(row);
  }

  addToBlockList(row: any) {
    this.addToBlockBucket(row);
  }

  onSaveClick() {
    // let isAllRowsSelected = this.isAllRowsSelected(this.configData.type);
    this.modalRef.close({
      ...this.configData,
      targetList: this.selTargetList,
      blockList: this.selBlockList,
    });


  }

  onCancelClick() {
    this.modalRef.close(null);
  }

  showError(msg: string) {
    this.errMessage = msg;
  }

  isAllRowsSelected(type?: number) {
    return false;
  }


  setupTable(resp: any, resetPagination?: boolean) {
    this.totalRowCount = (resp && resp.totalNoOfRecords) ? resp.totalNoOfRecords : 0;
    this.gridData = new MatTableDataSource(this.strService.filterAndTransformData(this.configData.entity, resp.data));
    this.gridData.data.forEach(x => {
    });
    this.paginator.length = this.totalRowCount;
    (resetPagination) ? this.paginator.firstPage() : null;
  }

  ngAfterViewInit() {
    if (this.gridData) {
      this.gridData.paginator = this.paginator;
      this.gridData.sort = this.sort;
    }
  }



  getIdsArray(bucket: any[]): number[] {
    const isWellDefined = (bucket && Array.isArray(bucket) && bucket.length) ? true : false;
    const arr: number[] = (isWellDefined) ? bucket.map(x => x.id) : [];
    return arr;
  }


  updateBucket(element: any, isTarget: boolean) {
    if (isTarget) {
      this.deleteFromBucket(this.selBlockList, element);
      this.addToBucket(this.selTargetList, element);
    } else {
      this.deleteFromBucket(this.selTargetList, element);
      this.addToBucket(this.selBlockList, element);
    }
  }

  addToBucket(bucket: any[], element: any) {
    const targetIdArr = this.getIdsArray(bucket);
    if (element) {
      let idPresent = (element.id >= 0) ? true : false;
      let alreadyPresent = targetIdArr.includes(element.id);
      if (idPresent && !alreadyPresent) {
        bucket.push(element);
      }
    }
  }

  deleteFromBucket(bucket: any[], element: any) {
    const blockIdArr = this.getIdsArray(bucket);
    if (element) {
      let idPresent = (element.id >= 0) ? true : false;
      const index = blockIdArr.findIndex(item => item === element.id);
      if (idPresent && index !== -1) {
        bucket.splice(index, 1);
      }
    }
  }

  addToTargetBucket(element: any) {
    this.updateBucket(element, true);
  }

  addToBlockBucket(element: any) {
    this.updateBucket(element, false);
  }


  isRowTargetted(element): boolean {
    if (!element) {
      return false;
    }

    let idToCheck = (element.id >= 0) ? element.id : null;
    let ids: number[] = this.getIdsArray(this.selTargetList);
    return ids.includes(idToCheck);
  }

  isRowBlocked(element) {
    if (!element) {
      return false;
    }

    let idToCheck = (element.id >= 0) ? element.id : null;
    let ids: number[] = this.getIdsArray(this.selBlockList);
    return ids.includes(idToCheck);
  }

}
