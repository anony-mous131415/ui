import { Component, Inject, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA, MatCheckboxChange } from '@angular/material';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import {
  ApiResponseObjectDictionaryResponse,
  ApiResponseObjectEResponseobject, DashboardControllerService, DashboardFilters, SearchRequest
} from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-target-block-modal',
  templateUrl: './target-block-modal.component.html',
  styleUrls: ['./target-block-modal.component.scss']
})
export class TargetBlockModalComponent implements OnInit, OnDestroy, AfterViewInit {

  rowSelectionSubscription: Subscription;
  searchSubscription: Subscription;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  totalRowCount: number = 0;

  sortDirection: any = 'name+';

  gridData: MatTableDataSource<any>;
  // selection: SelectionModel<any> = null;

  colDef = [
    { id: 'name', title: 'Name' }
  ];
  columnsToDisplay = ['select', 'name'];

  selTargetList: any[] = [];
  selBlockList: any[] = [];

  searchReq: SearchRequest;
  searchText: string;

  errMessage: string = null;
  requestInProgress = false;
  ctrl = new FormControl();

  masterCbStatus: boolean = false;
  allDataTillNow: any[] = [];

  userHasSearched: boolean = false;
  isCheckBoxApplicable: boolean = false
  auxillaryCbStatus: boolean = false;


  masterCbToggle(event: MatCheckboxChange) {
    this.masterCbStatus = event.checked;

    if (this.masterCbStatus) {

      if (this.gridData && this.gridData.filteredData && this.gridData.filteredData.length > 0) {

        this.gridData.filteredData.forEach(element => {
          if (this.config.type === 1) {
            this.addToTargetBucket(element);
          }
          else if (this.config.type === -1) {
            this.addToBlockBucket(element);
          }
        });

      }
    }

    else {
      if (this.gridData && this.gridData.filteredData && this.gridData.filteredData.length > 0) {

        this.gridData.filteredData.forEach(element => {
          if (this.config.type === 1) {
            this.deleteFromBucket(this.selTargetList, element);
          }
          else if (this.config.type === -1) {
            this.deleteFromBucket(this.selBlockList, element);
          }
        });
      }
    }
  }

  getMasterCbStatus(): boolean {

    let selectedList: any[] = [];
    if (this.config.type === 1) {
      selectedList = this.selTargetList;
    } else if (this.config.type === -1) {
      selectedList = this.selBlockList;
    }

    if (this.gridData && this.gridData.filteredData && this.gridData.filteredData.length) {
      let result = true
      let n = this.gridData.filteredData.length;
      for (let i = 0; i < n; i++) {
        let isNotPresent: boolean = (selectedList.findIndex(x => x.id === this.gridData.filteredData[i].id) === -1) ? true : false;
        if (isNotPresent) {
          result = false;
          break;
        }
      }
      return result;
    }

    return false;

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
      // this.updateMasterCbStatus(this.selTargetList);
    }
    //block
    else if (this.config.type == -1) {
      (newStatus) ? this.addToBucket(this.selBlockList, element) : this.deleteFromBucket(this.selBlockList, element);
      // this.updateMasterCbStatus(this.selBlockList);
    }
  }


  // updateMasterCbStatus(list: any[]) {
  //   this.masterCbStatus = (list && list.length === this.allDataTillNow.length) ? true : false;
  // }


  constructor(
    public modalRef: MatDialogRef<TargetBlockModalComponent>,
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
            // this.onEntitySearch(value);
          }
        }
      );

    // this.paginator.page.subscribe(page => {
    //   this.getTableData(false, this.configData.entity, page.pageIndex + 1, 1000);
    // });
    this.getTableData(true, this.configData.entity, 0, 1000);
  }


  initValues() {
    //put values in target and block bucket
    //targetting with check box
    if (this.config.type === 1) {
      this.masterCbStatus = (this.config && this.config.allSelected === true) ? true : false;
    }

    this.config.targetList.forEach(element => {
      this.addToAllDataSet(element);
      this.selTargetList.push(element);
    });

    this.config.blockList.forEach(element => {
      this.addToAllDataSet(element);
      this.selBlockList.push(element);
    });

    this.isCheckBoxApplicable = (this.config.type !== 0) ? true : false;
  }


  addToAllDataSet(element: any) {
    let ids = this.getIdsArray(this.allDataTillNow);
    let isNew = !ids.includes(element.id);
    if (isNew) {
      this.allDataTillNow.push(element);
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
            // (isInit) ? this.initGridData(response.respObject, resetPagination) : this.setGridData(response.respObject, resetPagination);
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
            // (isInit) ? this.initGridData(response.respObject, resetPagination) : this.setGridData(response.respObject, resetPagination);
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
    this.getTableData(false, this.configData.entity, 1, 1000, true);
  }

  // onEntitySearch(value) {
  //   const searchText = value;
  //   if (searchText != null && searchText !== undefined) {
  //     if (searchText.trim().length > 1) {
  //       this.searchReq = {
  //         filters: [{
  //           column: 'name',
  //           value: searchText
  //         } as DashboardFilters]
  //       } as SearchRequest;
  //       this.getTableData(false, this.configData.entity, this.paginator.pageIndex, this.paginator.pageSize, true);
  //       // (this.paginator) ? this.paginator.firstPage() : null;
  //     } else if (searchText.trim().length === 0) {
  //       if (this.searchReq && this.searchReq.filters) {
  //         this.searchReq.filters = this.searchReq.filters.filter(item => item.column !== 'name');
  //       }
  //       this.getTableData(false, this.configData.entity, this.paginator.pageIndex, this.paginator.pageSize, true);
  //       // (this.paginator) ? this.paginator.firstPage() : null;
  //     }
  //   } else {
  //     this.searchReq = null;
  //   }
  // }

  get config() {
    return this.configData;
  }

  sortData(event) {
    //   if (event.direction === 'desc') {
    //     this.sortDirection = 'name-';
    //   } else {
    //     this.sortDirection = 'name+';
    //   }
    //   this.getTableData(false, this.configData.entity, 1, this.paginator.pageSize);
    //   if (this.paginator) {
    //     this.paginator.firstPage();
    //   }
  }


  clearAllSelection() {
    this.selTargetList = [];
    this.selBlockList = [];

    this.configData.targetList = [];
    this.configData.blockList = [];

    this.masterCbStatus = false;
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
    let isAllRowsSelected = this.isAllRowsSelected(this.configData.type);

    // 1 is for targetting
    if (this.configData.type === 1) {
      // isAllRowsSelected = true;
      this.modalRef.close({
        ...this.configData,
        selectAll: isAllRowsSelected,
        targetList: this.selTargetList,
        blockList: this.selBlockList,
      });
    }


    // -1 is for block 
    else if (this.configData.type === -1) {
      // isAllRowsSelected = true;
      if (isAllRowsSelected) {
        this.showError(this.configData.blockAllErrorMsg);
      } else {
        this.modalRef.close({
          ...this.configData,
          selectAll: isAllRowsSelected,
          targetList: this.selTargetList,
          blockList: this.selBlockList,
        });
      }
    }


    else {
      this.modalRef.close({
        ...this.configData,
        targetList: this.selTargetList,
        blockList: this.selBlockList,
      });
    }

  }

  onCancelClick() {
    this.modalRef.close(null);
  }

  showError(msg: string) {
    this.errMessage = msg;
  }

  isAllRowsSelected(type?: number) {

    let allLen = this.allDataTillNow.length;
    let selectedListLen = 0;

    if (this.configData.type === 1) {
      selectedListLen = this.selTargetList.length;
    } else if (this.configData.type === -1) {
      selectedListLen = this.selBlockList.length;
    }

    // this.masterCbStatus = this.getMasterCbStatus();
    let result = (allLen === selectedListLen) ? true : false;
    return result;
  }


  setupTable(resp: any, resetPagination?: boolean) {
    this.columnsToDisplay = (this.configData.type === 0) ? ['name'] : this.columnsToDisplay;
    this.totalRowCount = resp.totalNoOfRecords;

    this.gridData = new MatTableDataSource(this.strService.filterAndTransformData(this.configData.entity, resp.data));
    this.gridData.data.forEach(x => {
      this.addToAllDataSet(x);
    });

    if (this.masterCbStatus) {
      this.gridData.data.forEach(element => {
        if (this.config.type === 1) {
          this.addToTargetBucket(element);
        }

        else if (this.config.type === -1) {
          this.addToBlockBucket(element);
        }
      });
    }

    // this.paginator.length = this.totalRowCount;
    // (resetPagination) ? this.paginator.firstPage() : null;

    this.gridData.paginator = this.paginator;
    this.gridData.sort = this.sort;
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


  applyFilter() {
    let filterValue = "";

    if (this.searchText && this.searchText.length > 0) {
      this.userHasSearched = true;
      filterValue = this.searchText.trim().toLowerCase();
    } else {
      this.userHasSearched = false;
    }

    this.gridData.filter = filterValue

    if (this.gridData.paginator) {
      this.gridData.paginator.firstPage();
    }

  }



}
