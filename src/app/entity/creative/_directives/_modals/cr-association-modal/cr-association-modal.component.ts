import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { BaseModel } from '@app/shared/_models/base';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { DashboardFilters, SearchRequest } from '@revxui/api-client-ts';

@Component({
  selector: 'app-cr-association-modal',
  templateUrl: './cr-association-modal.component.html',
  styleUrls: ['./cr-association-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrAssociationModalComponent implements OnInit {

  showErrorMessage;
  disableSaveButton = false;

  appConst = AppConstants;
  crConst = CreativeConstants;

  showProgressBar = false;
  allRowSelected = false;

  campagins = [];
  strategies = [];

  selectedCampaign = {} as BaseModel;

  strategiesBucket = [];
  creativesBucket = [];

  selectedStatus: string;

  displayedColumns = ['active', 'name', 'action'];
  campSource: MatTableDataSource<BaseModel>;
  strSource: MatTableDataSource<any>;

  SHOW_TABLE = AppConstants.ENTITY.CAMPAIGN;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private modalRef: MatDialogRef<CrAssociationModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,

    private commonService: CommonService,
    private crService: CreativeService,
    private alertService: AlertService,
    private router: Router,
  ) { }

  ngOnInit() {
    // this.advertiserId = '';
    // get campaings for advertiser id
    // get strategies for campaign id
    // get after selecting the strategies
    // we need to add it to the selection box and
    // if the strategies list is populating again
    // we need to show the selected strategies
    this.getAllCampaignsForAdvertiser();
  }

  initializeTableParams() {

  }

  selectCampaign(campaign: BaseModel) {
    this.selectedCampaign = campaign;
    this.SHOW_TABLE = AppConstants.ENTITY.STRATEGY;
    this.displayedColumns = ['action', 'active', 'name'];
    this.getAllStrategiesForCampaign();
    // this.strSource = new MatTableDataSource(this.strategies);
  }

  backToParent() {
    this.selectedCampaign = {} as BaseModel;
    this.SHOW_TABLE = AppConstants.ENTITY.CAMPAIGN;
    this.displayedColumns = ['active', 'name', 'action'];
    this.campSource = new MatTableDataSource(this.campagins);
    setTimeout(() => this.campSource.paginator = this.paginator);
    setTimeout(() => this.campSource.sort = this.sort);
  }

  getAllCampaignsForAdvertiser(refresh?: boolean) {
    this.allRowSelected = false;
    let request: SearchRequest;
    const dashboardFilters = {} as DashboardFilters;
    dashboardFilters.column = 'advertiserId';
    dashboardFilters.value = this.data.advertiserId;
    request = { filters: [dashboardFilters] };

    // if (this.selectedStatus === 'true' || this.selectedStatus === 'false') {
    //   dashboardFilters.column = 'active';
    //   dashboardFilters.value = this.selectedStatus;
    //   request.filters.push(dashboardFilters);
    // }

    const entity: any = AppConstants.ENTITY.CAMPAIGN;
    this.showProgressBar = true;
    this.commonService.getDictionary(entity, 1, 1000, refresh, null, request).subscribe(resp => {
      // console.log('resp ', resp);
      if (resp && resp.respObject && resp.respObject.data) {
        this.campagins = resp.respObject.data;
        // console.log('this.campaigns ', this.campagins);
        this.campSource = new MatTableDataSource(this.campagins);
        setTimeout(() => this.campSource.paginator = this.paginator);
        setTimeout(() => this.campSource.sort = this.sort);
        // console.log('this.campSource ', this.campSource);
        this.showProgressBar = false;
      } else {
        this.campagins = [];
        this.showProgressBar = false;
      }
    }, error => {
      this.campagins = [];
    });
  }

  getAllStrategiesForCampaign(refresh?: boolean) {
    this.strSource = null;
    this.allRowSelected = false;
    let request = {} as SearchRequest;
    request.filters = [];
    const dashboardFilters = {} as DashboardFilters;
    dashboardFilters.column = 'campaignId';
    dashboardFilters.value = this.selectedCampaign.id.toString();
    request = { filters: [dashboardFilters] };
    const entity: any = AppConstants.ENTITY.STRATEGY;

    this.showProgressBar = true;
    this.commonService.getDictionary(entity, 1, 1000, refresh, null, request).subscribe(resp => {
      // console.log('resp ', resp);
      if (resp && resp.respObject && resp.respObject.data) {
        this.strategies = resp.respObject.data;
        this.strSource = new MatTableDataSource(resp.respObject.data);
        setTimeout(() => this.strSource.paginator = this.paginator);
        setTimeout(() => this.strSource.sort = this.sort);
        setTimeout(() => { this.doCheckTheCheckboxIfDataInTheBucket(); });
        this.showProgressBar = false;
      } else {
        this.strategies = [];
        this.showProgressBar = false;
      }
    }, error => {
      this.strategies = [];
    });
  }

  doCheckTheCheckboxIfDataInTheBucket() {
    this.strategiesBucket.forEach(element => {
      this.strSource.data.forEach(str => {
        if (element.id === str.id) {
          str.action = true;
        }
      });
    });

    // Checking if all checked manually
    let allChecked = true;
    // tslint:disable-next-line: forin
    for (const idx in this.strSource.data) {
      const i = Number(idx);
      if (this.strSource.data[i].action !== true) {
        allChecked = false;
        // console.log('cehck ', allChecked);
        break;
      }
    }
    this.allRowSelected = allChecked;
  }

  // Search campagin and strategies by text
  searchFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Removing whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    if (this.SHOW_TABLE === AppConstants.ENTITY.CAMPAIGN && this.campSource) {
      this.campSource.filter = filterValue;
    }
    if (this.SHOW_TABLE === AppConstants.ENTITY.STRATEGY && this.strSource) {
      this.strSource.filter = filterValue;
    }
  }

  applyStatusFilter(activeStatus?: boolean) {
    // this.resetSelection();
    // this.alertService.warning(EntitiesConstants.FETCHING_DATA, false, true);
    let source;
    if (this.SHOW_TABLE === AppConstants.ENTITY.CAMPAIGN) {
      source = new MatTableDataSource(this.campagins);
    }

    if (this.SHOW_TABLE === AppConstants.ENTITY.STRATEGY) {
      source = new MatTableDataSource(this.strategies);
    }

    // this.campSource = new MatTableDataSource(this.campagins);
    if (activeStatus === true) {
      this.selectedStatus = 'true';
      source.data = source.data.filter(e => e.active === true);
    } else if (activeStatus === false) {
      this.selectedStatus = 'false';
      source.data = source.data.filter(e => e.active === false);
    } else {
      this.selectedStatus = '';
    }

    if (this.SHOW_TABLE === AppConstants.ENTITY.CAMPAIGN) {
      this.campSource = source;
      this.campSource.paginator = this.paginator;
      this.campSource.sort = this.sort;
    }

    if (this.SHOW_TABLE === AppConstants.ENTITY.STRATEGY) {
      this.strSource = source;
      this.strSource.paginator = this.paginator;
      this.strSource.sort = this.sort;
    }

  }

  pushStrToBucket(row, action) {
    const strId = Number(row.id);
    if (action === true) {
      this.strategiesBucket.push(row);

      // Checking if all checked manually
      let allChecked = true;
      // tslint:disable-next-line: forin
      for (const idx in this.strSource.data) {
        const i = Number(idx);
        if (this.strSource.data[i].action !== true) {
          allChecked = false;
          // console.log('cehck ', allChecked);
          break;
        }
      }
      this.allRowSelected = allChecked;
    } else {
      this.strategiesBucket = this.strategiesBucket.filter((obj) => {
        return obj.id !== strId;
      });

      // Unchecking the select all if one row is unchecked
      // tslint:disable-next-line: forin
      for (const idx in this.strSource.data) {
        const i = Number(idx);
        if (this.strSource.data[i].id === strId) {
          this.allRowSelected = false;
          this.strSource.data[i].action = false;
        }
      }
    }
    // console.log('str bucket', this.strategiesBucket);

  }

  selectAllClick() {
    if (this.allRowSelected === true) {
      // tslint:disable-next-line: forin
      for (const i in this.strategies) {
        const strId = Number(this.strategies[i].id);
        this.strategiesBucket = this.strategiesBucket.filter((obj) => {
          return obj.id !== strId;
        });

        this.strategiesBucket.push(this.strategies[i]);
      }

      // select checkbox in ui
      this.strSource.data.map((strategy) => {
        strategy.action = true;
      });

    } else {
      // tslint:disable-next-line: forin
      for (const i in this.strategies) {
        const strId = Number(this.strategies[i].id);
        this.strategiesBucket = this.strategiesBucket.filter((obj) => {
          return obj.id !== strId;
        });
      }
      // unselect checkbox in ui
      this.strSource.data.map((strategy) => {
        strategy.action = false;
      });
    }
  }

  clearAllClick() {
    this.allRowSelected = false;
    this.strategiesBucket = [];
    this.strSource.data.map((strategy) => {
      strategy.action = false;
    });
  }

  removeStrFromBucket(str: BaseModel) {
    this.strategiesBucket = this.strategiesBucket.filter((obj) => {
      return obj.id !== str.id;
    });
  }

  reload() {
    if (this.SHOW_TABLE === AppConstants.ENTITY.CAMPAIGN) {
      this.getAllCampaignsForAdvertiser();
    }

    if (this.SHOW_TABLE === AppConstants.ENTITY.STRATEGY) {
      this.getAllStrategiesForCampaign();
    }
  }

  saveStrategies() {
    this.showErrorMessage = '';
    const strategyList = this.strategiesBucket;

    if (strategyList && strategyList.length === 0) {
      this.showErrorMessage = 'Please select any strategy to associate the creative(s)';
      return;
    }
    this.disableSaveButton = true;

    this.crService.associateStrategies(strategyList, this.data.creativeList).subscribe(resp => {
      // console.log('resp ', resp);
      if (resp.respObject.operationStatus === 'Failed') {
        // show the error and dont resume the modal
        this.showErrorMessage = CreativeConstants.ASSOCIATE_ERROR_MSG;
      } else {
        this.alertService.success(CreativeConstants.ASSOCIATE_SUCCESS_MSG, true);
        this.router.navigate([AppConstants.URL_STRATEGIES]);
        this.modalRef.close(true);
      }

      this.disableSaveButton = false;
    }, error => {
      this.errorHandling();
      this.showErrorMessage = CreativeConstants.ASSOCIATE_DUPLICATE_MSG;
      this.disableSaveButton = false;
    });
  }

  errorHandling() {
    // console.log('Error ....');
  }
  cancel() {
    this.router.navigate([this.data.redirectOnCancel]);
    this.modalRef.close(null);
  }

}
