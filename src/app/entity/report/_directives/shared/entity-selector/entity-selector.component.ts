import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialogRef,
  MatExpansionPanel,
  MatPaginator,
  MatSort,
  MatTableDataSource,
  MAT_DIALOG_DATA
} from '@angular/material';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { AdvancedUiService } from '@app/entity/report/_services/advanced-ui.service';
import { CommonReportingService, DisaplayUi, GridData, ListApiParams, ModalObject } from '@app/entity/report/_services/common-reporting.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DashboardFilters, SearchRequest } from '@revxui/api-client-ts';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-entity-selector',
  templateUrl: './entity-selector.component.html',
  styleUrls: ['./entity-selector.component.scss'],
  viewProviders: [MatExpansionPanel]
})

export class EntitySelectorComponent implements OnInit, AfterViewInit {

  appConst = AppConstants;
  advancedConst = AdvancedConstants;

  showErrorMessage = false;

  CURR_TABLE_LEVEL = AdvancedConstants.TABLE.LEFT_MOST;
  listMetrics: any[] = [];

  private listApiParams = {} as ListApiParams;//for search , sort , pagination , filter
  displayedColumns = [];
  isCreativeModal: boolean = false; //for creatives , advertiser checkbox not needed

  l1_listLen: number = 0;
  l2_listLen: number = 0;
  l3_listLen: number = 0;

  l1_display: DisaplayUi;
  l2_display: DisaplayUi;
  l3_display: DisaplayUi;

  l1_object: ModalObject;
  l2_object: ModalObject;
  l3_object: ModalObject;

  // original: Map<number, boolean>;

  showProgressBar: boolean = false;

  l1_obj_selected = {} as GridData;
  l2_obj_selected = {} as GridData;

  l1_current_ids: number[] = [];
  l2_current_ids: number[] = [];
  l3_current_ids: number[] = [];

  l1_source: MatTableDataSource<GridData>;
  l2_source: MatTableDataSource<GridData>;
  l3_source: MatTableDataSource<GridData>;

  @ViewChild('paginator', { static: false }) paginator: MatPaginator;
  @ViewChild('sort', { static: false }) sort: MatSort;

  @ViewChild('paginator2', { static: false }) paginator2: MatPaginator;
  @ViewChild('sort2', { static: false }) sort2: MatSort;

  @ViewChild('paginator3', { static: false }) paginator3: MatPaginator;
  @ViewChild('sort3', { static: false }) sort3: MatSort;


  searchInput: string = '';

  constructor(
    private modalRef: MatDialogRef<EntitySelectorComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private advancedService: AdvancedUiService,
    private commonReportingService: CommonReportingService,
  ) { }

  ngOnInit() {
    this.isCreativeModal = (this.configData.title.toString().trim() === 'SELECT CREATIVES') ? true : false;
    this.initModalValues();
    this.setTabelColumns();
    this.get_l1_data();
  }

  setTabelColumns() {
    this.listMetrics = this.advancedService.getMetricsForList(this.configData.entity[0]);
    this.displayedColumns = this.listMetrics.map(lc => lc.id);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          console.log('table-1');
          this.fetchListData();

        })
      )
      .subscribe();


    this.sort2.sortChange.subscribe(() => {
      this.paginator2.pageIndex = 0;
    });
    merge(this.sort2.sortChange, this.paginator2.page)
      .pipe(
        tap(() => {
          console.log('table-2');
          this.fetchListData();
        })
      )
      .subscribe();


    this.sort3.sortChange.subscribe(() => {
      this.paginator3.pageIndex = 0;
    });
    merge(this.sort3.sortChange, this.paginator3.page)
      .pipe(
        tap(() => {
          console.log('table-3');
          this.fetchListData();
        })
      )
      .subscribe();
  }

  fetchListData(searchFilter?: DashboardFilters) {
    switch (this.CURR_TABLE_LEVEL) {
      case AdvancedConstants.TABLE.LEFT_MOST:
        this.get_l1_data(searchFilter);
        break;
      case AdvancedConstants.TABLE.CENTER:
        this.get_l2_data(searchFilter);
        break;
      case AdvancedConstants.TABLE.RIGHT_MOST:
        this.get_l3_data(searchFilter);
        break;
    }
  }

  initModalValues() {
    if (this.configData) {

      //level : 1
      if (this.configData.l1_object) {
        // this.l1_object = this.configData.l1_object;
        let temp: ModalObject = this.configData.l1_object;
        this.l1_object = {
          map: new Map(temp.map),
          set: new Set()
        }
        temp.set.forEach(ele => {
          let new_ele = { ...ele }
          this.l1_object.set.add(new_ele);
        })
      }


      //level : 2
      if (this.configData.l2_object) {
        // this.l2_object = this.configData.l2_object;
        let temp_2: ModalObject = this.configData.l2_object;
        this.l2_object = {
          map: new Map(temp_2.map),
          set: new Set()
        }
        temp_2.set.forEach(ele => {
          let new_ele = { ...ele }
          this.l2_object.set.add(new_ele);
        })
      }


      //level : 3
      if (this.configData.l3_object) {
        // this.l3_object = this.configData.l3_object;
        let temp_3: ModalObject = this.configData.l3_object;
        this.l3_object = {
          map: new Map(temp_3.map),
          set: new Set()
        }
        temp_3.set.forEach(ele => {
          let new_ele = { ...ele }
          this.l3_object.set.add(new_ele);
        })
      }

      this.updateSelectionDisp();
    }
  }


  searchTableOnEnter() {
    if (this.searchInput.length) {
      this.searchInput = this.searchInput.trim();
      let searchFilter = {} as DashboardFilters;
      if (!isNaN(parseInt(this.searchInput))) {
        searchFilter.column = 'id';
        searchFilter.value = this.searchInput;
      } else {
        searchFilter.column = 'name'
        searchFilter.value = this.searchInput.toLowerCase();
      }
      this.fetchListData(searchFilter);
    } else {
      this.fetchListData();
    }

  }

  formRequestForList(searchFilter?: DashboardFilters) {
    //paginator and sort req
    switch (this.CURR_TABLE_LEVEL) {
      case AdvancedConstants.TABLE.LEFT_MOST:
        if (this.paginator && this.paginator.pageIndex) {
          this.listApiParams.pageNo = this.paginator.pageIndex + 1;
        } else {
          this.listApiParams.pageNo = 1;
        }
        if (this.paginator && this.paginator.pageSize) {
          this.listApiParams.pageSize = this.paginator.pageSize;
        } else {
          this.listApiParams.pageSize = 50;
        }
        if (this.sort && this.sort.active) {
          if (this.sort.direction === 'asc') {
            this.listApiParams.sort = this.sort.active + '+';
          } else {
            this.listApiParams.sort = this.sort.active + '-';
          }
        }
        break;

      case AdvancedConstants.TABLE.CENTER:
        if (this.paginator2 && this.paginator2.pageIndex) {
          this.listApiParams.pageNo = this.paginator2.pageIndex + 1;
        } else {
          this.listApiParams.pageNo = 1;
        }
        if (this.paginator2 && this.paginator2.pageSize) {
          this.listApiParams.pageSize = this.paginator2.pageSize;
        } else {
          this.listApiParams.pageSize = 50;
        }
        if (this.sort2 && this.sort2.active) {
          if (this.sort2.direction === 'asc') {
            this.listApiParams.sort = this.sort2.active + '+';
          } else {
            this.listApiParams.sort = this.sort2.active + '-';
          }
        }
        break;

      case AdvancedConstants.TABLE.RIGHT_MOST:

        if (this.paginator3 && this.paginator3.pageIndex) {
          this.listApiParams.pageNo = this.paginator3.pageIndex + 1;
        } else {
          this.listApiParams.pageNo = 1;
        }
        if (this.paginator3 && this.paginator3.pageSize) {
          this.listApiParams.pageSize = this.paginator3.pageSize;
        } else {
          this.listApiParams.pageSize = 50;
        }
        if (this.sort3 && this.sort3.active) {
          if (this.sort3.direction === 'asc') {
            this.listApiParams.sort = this.sort3.active + '+';
          } else {
            this.listApiParams.sort = this.sort3.active + '-';
          }
        }
        break;

    }


    //get children of selected parent
    if (this.CURR_TABLE_LEVEL !== AdvancedConstants.TABLE.LEFT_MOST) {
      this.listApiParams.request = {} as SearchRequest;
      let filters = [];
      let dashboardFilters = {} as DashboardFilters;
      switch (this.CURR_TABLE_LEVEL) {
        case AdvancedConstants.TABLE.CENTER://form request for : campaign or state or creatives
          dashboardFilters.value = this.l1_obj_selected.id.toString();
          if (this.configData.entity[1] === AppConstants.ENTITY.CAMPAIGN || this.configData.entity[1] === AppConstants.ENTITY.CREATIVE) {
            dashboardFilters.column = 'advertiserId';
            if(this.configData.type === AppConstants.REPORTS.VIDEO) {
              let videoFilters = {} as DashboardFilters;
              videoFilters.column = 'creativeType';
              videoFilters.value = 'video';
              let nativeVideoFilters = {} as DashboardFilters;
              nativeVideoFilters.column = 'creativeType';
              nativeVideoFilters.value = 'nativeVideo';
              filters.push(videoFilters, nativeVideoFilters);
            }
          } else if (this.configData.entity[1] === AdvancedConstants.ENTITY.STATE) {
            dashboardFilters.column = 'countryId';
          }
          break;

        case AdvancedConstants.TABLE.RIGHT_MOST://form request for : stratergy or city
          dashboardFilters.value = this.l2_obj_selected.id.toString();
          if (this.configData.entity[2] === AppConstants.ENTITY.STRATEGY) {
            dashboardFilters.column = 'campaignId';
          } else if (this.configData.entity[2] === AdvancedConstants.ENTITY.CITY) {
            dashboardFilters.column = 'stateId';
          }
          break;
      }
      filters.push(dashboardFilters);
      this.listApiParams.request.filters = [];
      this.listApiParams.request = { filters };
    }

    if (searchFilter) {
      if (!this.listApiParams.request) {
        this.listApiParams.request = {} as SearchRequest;
        this.listApiParams.request = { filters: [searchFilter] }
      } else {
        this.listApiParams.request.filters.push(searchFilter);
      }
    }
  }

  get_l1_data(searchFilter?: DashboardFilters) {
    this.showProgressBar = true;
    this.l1_source = new MatTableDataSource(null);
    this.formRequestForList(searchFilter);

    // this.listApiParams.pageSize = 3;
    this.advancedService.getListData(this.configData.entity[0], this.listApiParams).subscribe((resp: any) => {
      if (resp && resp.respObject && resp.respObject.data) {
        this.l1_listLen = resp.respObject.totalNoOfRecords;
        let apiData = resp.respObject.data;
        this.l1_current_ids = apiData.map(x => x.id);

        //if is true for 1st time fetch
        if (!this.l1_object) {
          this.l1_object.map.set(1, false); //master checkboxes for all adv (only 1 checkbox is required)
        } else if (this.l1_object.map.get(1) && !this.isCreativeModal) { //if master checkbox was not ticked
          apiData.forEach(obj => {
            obj.isNotSelected = true; //then un-select the incoming data
          })
        }

        let previousData = Array.from(this.l1_object.set);//older seen data present in set to Array
        let previousIds = previousData.map(x => x.id);//ids of above
        let dataNotSeenBefore = apiData.filter(x => !previousIds.includes(x.id));
        let setArr = [...previousData, ...dataNotSeenBefore];
        let tableArr = setArr.filter(x => this.l1_current_ids.includes(x.id));//only those records which are received by current api call

        this.l1_object.set = new Set(setArr);//l1_set has all l1 elements visited till now
        this.listApiParams = {};

        this.l1_source = new MatTableDataSource(tableArr);
        this.l1_source.sort = this.sort;
        this.showProgressBar = false;
      } else {
        this.l1_current_ids = [];
        this.showProgressBar = false;
        this.listApiParams = {};
      }
    }, error => {
      this.listApiParams = {};
      this.l1_current_ids = [];
    });
  }

  get_l2_data(searchFilter?: DashboardFilters) {
    this.showProgressBar = true;
    this.formRequestForList(searchFilter);
    this.l2_current_ids = null;
    this.l2_source = new MatTableDataSource(null);//reset table

    this.advancedService.getListData(this.configData.entity[1], this.listApiParams).subscribe(resp => {
      this.listApiParams = {};
      if (resp && resp.respObject && resp.respObject.data && resp.respObject.data.length) {
        this.l2_listLen = resp.respObject.totalNoOfRecords;
        let apiData = resp.respObject.data;
        this.l2_current_ids = apiData.map(x => x.id); //ids of data received from api-call

        if (!this.l2_object.map.has(this.l1_obj_selected.id)) {
          this.l2_object.map.set(this.l1_obj_selected.id, false); //master checkboxes for campaingns
        }

        if (this.l1_obj_selected.isNotSelected === true) { //if parent was not selected then un-select chilren before
          this.l2_object.map.set(this.l1_obj_selected.id, true);  // un-tick master checkbox bcz parent is not seleted
          apiData.forEach(obj => {
            obj.isNotSelected = true;
          })
        }

        let previousData = Array.from(this.l2_object.set);//SET to array
        let previousIds = previousData.map(x => x.id);//ids of above
        let dataNotSeenBefore = apiData.filter(x => !previousIds.includes(x.id)); //data from api-call which was not in SET previously
        let setArr = [...previousData, ...dataNotSeenBefore];
        let tableArr = setArr.filter(x => this.l2_current_ids.includes(x.id));//only those records which are received by current api call -> table

        this.l2_object.set = new Set(setArr);//l1_set has all l1 elements visited till now
        this.l2_source = new MatTableDataSource(tableArr);
        this.l2_source.sort = this.sort2;

        this.CURR_TABLE_LEVEL = AdvancedConstants.TABLE.CENTER;
        this.showProgressBar = false;
      } else {
        this.l2_current_ids = [];
        this.showProgressBar = false;
        this.listApiParams = {};
      }
    }, error => {
      this.l2_current_ids = [];
      this.listApiParams = {};
      this.showProgressBar = false;
    });

  }

  get_l3_data(searchFilter?: DashboardFilters) {
    this.l3_current_ids = null;
    this.formRequestForList(searchFilter);
    this.l3_source = new MatTableDataSource(null);//reset table

    this.showProgressBar = true;
    this.advancedService.getListData(this.configData.entity[2], this.listApiParams).subscribe(resp => {
      if (resp && resp.respObject && resp.respObject.data && resp.respObject.data.length) {
        this.l3_listLen = resp.respObject.totalNoOfRecords;
        let apiData = resp.respObject.data;
        this.l3_current_ids = apiData.map(x => x.id);

        if (!this.l3_object.map.has(this.l2_obj_selected.id)) {
          this.l3_object.map.set(this.l2_obj_selected.id, false); //master checkboxes for campaingns
        }

        if (this.l2_obj_selected.isNotSelected === true) { //if parent was not selected then un-select chilren before
          this.l3_object.map.set(this.l2_obj_selected.id, true);  // un-tick master checkbox bcz parent is not seleted
          apiData.forEach(obj => {
            obj.isNotSelected = true;
          })
        }

        let previousData = Array.from(this.l3_object.set);//older seen data present in set to Array
        let previousIds = previousData.map(x => x.id);//ids of above
        let dataNotSeenBefore = apiData.filter(x => !previousIds.includes(x.id));
        let setArr = [...previousData, ...dataNotSeenBefore];
        let tableArr = setArr.filter(x => this.l3_current_ids.includes(x.id));//only those records which are received by current api call

        this.l3_object.set = new Set(setArr);//l1_set has all l1 elements visited till now

        this.l3_source = new MatTableDataSource(tableArr);
        this.l3_source.sort = this.sort3;

        this.showProgressBar = false;

      } else {
        this.l3_current_ids = [];
        this.showProgressBar = false;
        this.listApiParams = {};
      }
    }, error => {
      this.l3_current_ids = [];
      this.listApiParams = {};
      this.showProgressBar = false;
    });
  }

  /****trivial methods start*******/
  select_l1(obj: GridData) {
    if (!obj.isNotSelected) {
      this.l1_obj_selected = obj;
      this.CURR_TABLE_LEVEL = AdvancedConstants.TABLE.CENTER;
      this.get_l2_data();
    }
  }


  select_l2(obj: GridData) {
    if (!obj.isNotSelected) {
      this.l2_obj_selected = obj;
      this.CURR_TABLE_LEVEL = AdvancedConstants.TABLE.RIGHT_MOST;
      this.get_l3_data();
    }
  }


  reload() {
    this.searchInput = ''
    this.listApiParams.sort = '';
    this.listApiParams.pageNo = 1;
    this.listApiParams.pageSize = 10;
    this.listApiParams.refresh = true;
    this.fetchListData();
  }


  cancel() {
    this.modalRef.close(null);
  }


  get config() {
    return this.configData;
  }
  /****trivial methods end*******/

  selectAllClick() {
    switch (this.CURR_TABLE_LEVEL) {
      case AdvancedConstants.TABLE.LEFT_MOST:
        this.l1_object.map.set(1, !this.l1_object.map.get(1));//setting master checkbox
        let bool_1: boolean = this.l1_object.map.get(1);
        let allData_1 = Array.from(this.l1_object.set);

        allData_1.forEach(element => {
          element.isNotSelected = bool_1
        });
        this.l1_object.set = new Set(allData_1);
        break;

      case AdvancedConstants.TABLE.CENTER:
        this.l2_object.map.set(this.l1_obj_selected.id, !this.l2_object.map.get(this.l1_obj_selected.id));//setting master checkbox
        let bool_2: boolean = this.l2_object.map.get(this.l1_obj_selected.id)
        let allData_2 = Array.from(this.l2_object.set);
        allData_2.forEach(element => {
          if (this.l2_current_ids.includes(element.id)) //change status of only current displayed data
            element.isNotSelected = bool_2;
        })
        this.l2_object.set = new Set(allData_2);
        this.changeParentStatus(bool_2);//select/unselect parent also if all children get selected/de-selected

        break;

      case AdvancedConstants.TABLE.RIGHT_MOST:
        //de-select parent also if all children get de-selected
        this.l3_object.map.set(this.l2_obj_selected.id, !this.l3_object.map.get(this.l2_obj_selected.id));//setting master checkbox
        let bool_3: boolean = this.l3_object.map.get(this.l2_obj_selected.id)
        let allData_3 = Array.from(this.l3_object.set);
        allData_3.forEach(element => {
          if (this.l3_current_ids.includes(element.id)) //change status of only current displayed data
            element.isNotSelected = bool_3;
        })
        this.l3_object.set = new Set(allData_3);
        this.changeParentStatus(bool_3);//de-select parent also if all children get de-selected
        break;
    }
    this.updateSelectionDisp();
  }

  clearAllClick() {
    let arr = Array.from(this.l1_object.set);
    let arr2 = Array.from(this.l2_object.set);
    let arr3 = Array.from(this.l3_object.set);

    arr.forEach(x => x.isNotSelected = false);
    arr2.forEach(x => x.isNotSelected = false);
    arr3.forEach(x => x.isNotSelected = false);

    this.l1_object.set = new Set(arr);
    this.l2_object.set = new Set(arr2);
    this.l3_object.set = new Set(arr3);
    this.updateSelectionDisp();
  }

  done() {
    let data = {
      l1_object: this.l1_object,
      l2_object: this.l2_object,
      l3_object: this.l3_object,
    }
    this.modalRef.close(data);
  }

  backToParent() {
    this.searchInput = '';
    switch (this.CURR_TABLE_LEVEL) {
      case AdvancedConstants.TABLE.LEFT_MOST:
        break;

      case AdvancedConstants.TABLE.CENTER:
        this.CURR_TABLE_LEVEL = AdvancedConstants.TABLE.LEFT_MOST;
        this.l1_obj_selected = {} as GridData;
        this.get_l1_data();
        break;

      case AdvancedConstants.TABLE.RIGHT_MOST:
        this.CURR_TABLE_LEVEL = AdvancedConstants.TABLE.CENTER;
        this.l2_obj_selected = {} as GridData
        this.get_l2_data();
        break;
    }
  }

  updateStatus(obj: GridData) {
    if (!this.showProgressBar) {
      obj.isNotSelected = !obj.isNotSelected;
      switch (this.CURR_TABLE_LEVEL) { //if user select and object , its parent was not selected earlier , it must be selected
        //also check if current selection makes all checkbox selected , then select master checkBox
        case AdvancedConstants.TABLE.LEFT_MOST:

          let all_not_Checked_1 = false;
          for (const idx in this.l1_source.data) {
            const i = Number(idx);
            if (this.l1_source.data[i].isNotSelected === true) {
              all_not_Checked_1 = true;
              break;
            }
          }
          this.l1_object.map.set(1, all_not_Checked_1);

          break;
        case AdvancedConstants.TABLE.CENTER:
          let all_not_Checked_2 = false;
          for (const idx in this.l2_source.data) {
            const i = Number(idx);
            if (this.l2_source.data[i].isNotSelected === true) {
              all_not_Checked_2 = true;
              break;
            }
          }
          this.l2_object.map.set(this.l1_obj_selected.id, all_not_Checked_2);
          if (obj.isNotSelected === false) {
            this.changeParentStatus(false);
          }
          break;
        case AdvancedConstants.TABLE.RIGHT_MOST:
          let all_not_Checked_3 = false;
          for (const idx in this.l3_source.data) {
            const i = Number(idx);
            if (this.l3_source.data[i].isNotSelected === true) {
              all_not_Checked_3 = true;
              break;
            }
          }
          this.l3_object.map.set(this.l2_obj_selected.id, all_not_Checked_3);

          if (obj.isNotSelected === false) {
            // this.changeParentStatus(false);
          }
          break;
      }
      this.updateSelectionDisp();
    }
  }

  changeParentStatus(newStatus: boolean) {
    if (this.CURR_TABLE_LEVEL === AdvancedConstants.TABLE.CENTER) {
      let arr = Array.from(this.l1_object.set);
      let parentIndex = arr.findIndex(x => x.id === this.l1_obj_selected.id);//findex of selected parent
      arr[parentIndex].isNotSelected = newStatus;//change parent status
      this.l1_object.set = new Set(arr);

    } else if (this.CURR_TABLE_LEVEL === AdvancedConstants.TABLE.RIGHT_MOST) {
      let arr = Array.from(this.l2_object.set);
      let parentIndex = arr.findIndex(x => x.id === this.l2_obj_selected.id);//findex of selected parent
      arr[parentIndex].isNotSelected = newStatus;//change parent status
      this.l2_object.set = new Set(arr);
    }
  }

  getMasterCheckboxStatus() {
    switch (this.CURR_TABLE_LEVEL) {
      case AdvancedConstants.TABLE.LEFT_MOST:
        return (!this.l1_object.map.get(1));

      case AdvancedConstants.TABLE.CENTER:
        return (!this.l2_object.map.get(this.l1_obj_selected.id));

      case AdvancedConstants.TABLE.RIGHT_MOST:
        return (!this.l3_object.map.get(this.l2_obj_selected.id));

    }
  }

  updateSelectionDisp() {
    this.l1_display = this.commonReportingService.getUiData(this.l1_object);
    if (this.config.entity.length > 1) {
      this.l2_display = this.commonReportingService.getUiData(this.l2_object);
    }
    if (this.config.entity.length > 2) {
      this.l3_display = this.commonReportingService.getUiData(this.l3_object);
    }
  }



}
