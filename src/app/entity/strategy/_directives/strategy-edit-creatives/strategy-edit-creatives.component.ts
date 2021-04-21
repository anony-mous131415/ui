import { Component, Input, OnDestroy, OnInit, ViewChild, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { StrategyConstants } from '@app/entity/strategy/_constants/StrategyConstants';
import { CREATIVE_IMAGE_API, MODE, StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { CommonService } from '@app/shared/_services/common.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { environment } from '@env/environment';
import {
  CreativeCompactDTO, CreativeControllerService,



  CreativeDTO, DashboardFilters, SearchRequest, StrategyDTO
} from '@revxui/api-client-ts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


import { StrategyBulkEditService } from '../../_services/strategy-bulk-edit.service';


interface Creative {
  totalCount: number;
  selectedCount: number;
  creativeList: any[];
}

@Component({
  selector: 'app-strategy-edit-creatives',
  templateUrl: './strategy-edit-creatives.component.html',
  styleUrls: ['./strategy-edit-creatives.component.scss']
})
export class StrategyEditCreativesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() mode: number;
  @Input() isBulkEdit: boolean;
  @Input() advId: number;//revx-371 used in bulk-edit strategy only 
  @Input() apiSkadParam: boolean;



  strDetailsSub: Subscription;
  strAdvDetailsSub: Subscription;
  searchSubscription: Subscription;

  @ViewChild(MatPaginator, null) paginator: MatPaginator;

  strategyDTO: StrategyDTO;
  SCONST = StrategyConstants;
  MODE = MODE;
  CREATIVE_IMAGE_API = CREATIVE_IMAGE_API;
  title = StrategyConstants.STEP_TITLE_CREATIVES;

  creativeList: any[] = [];
  allCreativeList: Map<number, Creative>;
  allCreativeGroupDays: number[];
  selectedCreativeList: any[] = [];

  totalNoOfRecords: number;
  searchReq: SearchRequest = null;
  searchText: string;

  filters = {
    channel: { title: 'Channel', list: ['Display'] },
    placement: { title: 'Placement', list: ['Desktop', 'Mobile Web', 'Mobile Applications'] },
    mobileOS: { title: 'Mobile OS', list: ['Android', 'iOS'] },
    device: { title: 'Device', list: ['Smartphone', 'Tablet'] }
  };

  isCreativesAvailable: boolean = false;
  isShowAllCreativesActive = true;
  isShowSelectedCreativesActive = false;
  isSortOrderASC = false;
  sortOrder: string = 'creationDate-';

  originHost = environment.hosts.origin;
  requestInProgress = false;
  ctrl = new FormControl();


  creative = {
    allowedBulkEditOpts: [],
    selectedBulkEditOpt: null
  };



  constructor(
    private strService: StrategyService,
    private creativeService: CreativeControllerService,
    private router: Router,
    private commonService: CommonService,
    private bulkEditService: StrategyBulkEditService

  ) { }


  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.apiSkadParam && changes.apiSkadParam.currentValue != changes.apiSkadParam.previousValue) {
      // console.log('CALLED API');
      this.getAllCreativesForAdvertiser(1, 50);
    }

    if (changes && changes.advId && changes.advId.currentValue != changes.advId.previousValue) {
      this.resetSearch();
    }

  }

  get filter() {
    return Object.keys(this.filters);
  }

  getCreativeForDay(day: number) {
    return this.allCreativeList.get(day).creativeList;
  }

  getSelectedCount(day: number) {
    return this.allCreativeList.get(day).selectedCount;
  }

  getTotalCount(day: number) {
    return this.allCreativeList.get(day).totalCount;
  }

  formatDate(day: number) {
    return moment(this.commonService.getDateFromEpoch(day)).format('MMMM DD, YYYY');
  }

  ngOnInit() {

    if (this.isBulkEdit) {
      this.setBulkEditParams();
    }

    this.subscribeToEvents();
    this.searchSubscription = this.ctrl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        value => {
          if (value !== null && value !== undefined) {
            this.onCreativeSearch(value);
          }
        }
      );
    this.paginator.page.subscribe(page => {
      this.getAllCreativesForAdvertiser(page.pageIndex + 1, page.pageSize);
    });
  }

  ngOnDestroy() {
    // this.strDetailsSub.unsubscribe();
    // this.strAdvDetailsSub.unsubscribe();
  }



  resetSearch() {

    if (this.isBulkEdit && (this.advId === null || this.advId === undefined)) {
      return;
    }

    this.searchText = null;
    this.searchReq = {} as SearchRequest;
    this.searchReq.filters = [];
    this.searchReq.filters.push({
      column: 'advertiserId',
      value: (this.isBulkEdit) ? this.advId.toString() : this.strategyDTO.advertiser.id.toString()
    });
    this.searchReq.filters.push({
      column: 'status',
      value: 'active'
    });

    // REVX-468 : refresh was being passed as false everytime
    this.getAllCreativesForAdvertiser(1, this.paginator.pageSize, true, true);
  }

  onCreativeSearch(value) {
    this.searchText = value;
    if (this.searchText !== null && this.searchText !== undefined) {
      if (this.searchText.trim().length > 1) {
        this.searchReq.filters = this.searchReq.filters.filter(item => item.column === 'advertiserId');
        this.searchReq.filters.push({
          column: 'name',
          value: this.searchText
        });
        this.searchReq.filters.push({
          column: 'status',
          value: 'active'
        });
        // REVX-468
        this.getAllCreativesForAdvertiser(1, this.paginator.pageSize, false, true);
      } else if (this.searchText.trim().length === 0) {
        this.searchReq.filters = this.searchReq.filters.filter(item => item.column !== 'name');

        // REVX-468
        this.getAllCreativesForAdvertiser(1, this.paginator.pageSize, false, true);
      }
    } else {
      this.searchReq.filters = this.searchReq.filters.filter(item => item.column === 'advertiserId');
      this.getAllCreativesForAdvertiser(1, this.paginator.pageSize);
    }
  }

  changeSortOrder(order: number) {

    if (order === 1) { // ASC
      this.isSortOrderASC = true;
      this.sortOrder = 'creationDate+';
    } else if (order === -1) { // DESC
      this.isSortOrderASC = false;
      this.sortOrder = 'creationDate-';
    }
    this.getAllCreativesForAdvertiser(1, this.paginator.pageSize, false, true);
  }

  isFormValid() {
    return true;
  }

  goToPrevStep() {
    const confirmation = confirm(AppConstants.WARNING_MSG);
    if (confirmation) {
      this.goToStep(3, false);
    }
  }

  onReviewAndSave() {
    this.goToStep(5, true);
  }

  updateStrategyObject() {
    const selCreatives = this.selectedCreativeList;
    if (selCreatives !== null && selCreatives !== undefined && Array.isArray(selCreatives) && selCreatives.length > 0) {
      // this.strategyDTO.creatives = selCreatives.map(item => ({ id: item.id, name: item.name } as BaseModel));
      this.strategyDTO.creatives = selCreatives.map(item => ({ ...item }));
    } else {
      this.strategyDTO.creatives = null;
    }

    this.strService.setStrDetails(this.strategyDTO);
  }

  showAllCreatives() {
    this.isShowAllCreativesActive = true;
    this.isShowSelectedCreativesActive = false;
  }

  showSelectedCreatives() {
    this.isShowSelectedCreativesActive = true;
    this.isShowAllCreativesActive = false;
  }

  isAllSelected(day: number) {
    return this.allCreativeList.get(day).creativeList.filter(item => !item.selected).length === 0;
  }

  toggleSelectionAll(event, day: number) {
    this.allCreativeList.get(day).creativeList
      .filter(item => item.selected !== event.checked)
      .forEach(creative => {
        this.toggleSelection(day, creative, event.checked);
      });
  }

  //REVX-1045 : index -1 check
  toggleSelection(day: number, creative: CreativeDTO, select?: boolean) {
    const isSelected = (select) ? !select : this.isCreativeSelected(creative.id);
    if (isSelected) {
      const index = this.selectedCreativeList.findIndex(item => item.id === creative.id);
      if (index >= 0) {
        this.selectedCreativeList.splice(index, 1);
        this.allCreativeList.get(day).selectedCount -= 1;
        const mapIndex = this.allCreativeList.get(day).creativeList.findIndex(item => item.id === creative.id);
        if (mapIndex >= 0) {
          this.allCreativeList.get(day).creativeList[mapIndex].selected = false;
        }
      }
    } else {
      this.selectedCreativeList.push(creative);
      this.allCreativeList.get(day).selectedCount += 1;
      const mapIndex = this.allCreativeList.get(day).creativeList.findIndex(item => item.id === creative.id);
      if (mapIndex >= 0) {
        this.allCreativeList.get(day).creativeList[mapIndex].selected = true;
      }
    }
  }

  //REVX-1045 : index -1 check
  clearAllSelection() {
    this.selectedCreativeList.forEach(creative => {
      creative.selected = false;
      // const day = this.commonService.getEpochFromDate(this.strService.getDateValue(creative.creationTime));

      const currDate = new Date(creative.creationTime * 1000);
      const day = this.commonService.getEpochFromDate(new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()));

      const creativeObj = this.allCreativeList.get(day);
      if (creativeObj !== null && creativeObj !== undefined) {
        creativeObj.selectedCount = 0;
        const index = creativeObj.creativeList.findIndex(item => item.id === creative.id);
        if (index >= 0) {
          creativeObj.creativeList[index].selected = false;
        }
      }
    });

    this.selectedCreativeList = [];
  }

  //REVX-1045 : index check
  clearSelection(creative: any) {
    creative.selected = false;
    // const day = this.commonService.getEpochFromDate(this.strService.getDateValue(creative.creationTime));
    const currDate = new Date(creative.creationTime * 1000);
    const day = this.commonService.getEpochFromDate(new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()));

    const creativeObj = this.allCreativeList.get(day);
    if (creativeObj !== null && creativeObj !== undefined) {
      creativeObj.selectedCount -= (creativeObj.selectedCount > 0) ? 1 : 0;
      const index = creativeObj.creativeList.findIndex(item => item.id === creative.id);
      if (index >= 0) {
        creativeObj.creativeList[index].selected = false;
      }
    }
    this.selectedCreativeList = this.selectedCreativeList.filter(item => item.id !== creative.id);
  }

  goToCreativeDetailsPage(creative: any) {
    if (document && document.location) {
      const url = document.location.origin + '/creative/details/' + creative.id;
      this.router.navigate([]).then(result => { window.open(url, '_blank'); });
    }
  }

  private subscribeToEvents() {
    this.strDetailsSub = this.strService.onStrategyDetailsSet.subscribe(
      param => {
        if (param && param.callCreativeApi) {
          this.handleStrategyDetailsSet(param.strDetails);
          this.resetErrorObject();
        }
      }
    );

    this.strAdvDetailsSub = this.strService.onAdvertiserDetailsSet.subscribe(
      param => this.handleAdvertiserDetailsSet(param.details)
    );

    //REVX-724 : skad ui changes
    // this.isStrategySkadSub = this.strService.isStrategySkad.subscribe((param: boolean) => {
    //   this.apiSkadParam = param;
    //   // console.log('api-Skad-param : ', this.apiSkadParam);
    // });

  }

  resetErrorObject() {
  }

  private handleStrategyDetailsSet(strDetails: StrategyDTO) {

    if (this.isBulkEdit && (this.advId === null || this.advId === undefined)) {
      return;
    }

    if (strDetails !== null) {
      this.strategyDTO = strDetails;
      if (this.mode === MODE.EDIT || this.isBulkEdit) {
        if (this.searchReq === null || this.searchReq === undefined ||
          this.searchReq.filters.findIndex(item => item.column === 'advertiserId') === -1) {
          this.searchReq = {
            filters: [
              {
                column: 'advertiserId',
                value: (this.isBulkEdit) ? this.advId.toString() : this.strategyDTO.advertiser.id.toString() // '5437'
              } as DashboardFilters,
              {
                column: 'status',
                value: 'active'
              } as DashboardFilters
            ]
          };
        }
      }
      this.setCreativeDetails(strDetails);
    }
  }

  private handleAdvertiserDetailsSet(advDetails: any) {

    if (this.isBulkEdit && (this.advId === null || this.advId === undefined)) {
      return;
    }

    this.searchReq = {
      filters: [
        {
          column: 'advertiserId',
          value: (this.isBulkEdit) ? this.advId.toString() : advDetails.id.toString() // '5437'
        } as DashboardFilters,
        {
          column: 'status',
          value: 'active'
        } as DashboardFilters
      ]
    };
    this.getAllCreativesForAdvertiser();
    this.selectedCreativeList = [];
  }

  private setCreativeDetails(strDetails: StrategyDTO) {

    if (this.allCreativeList === null || this.allCreativeList === undefined || this.allCreativeList.size === 0) {
      this.getAllCreativesForAdvertiser();
    }

    this.selectedCreativeList = (strDetails.creatives) ? strDetails.creatives.map((item: any) => {
      return {
        ...item,
        size: {
          width: item.width,
          heigh: item.height,
        },
        urlPath: item.urlPath,
        type: item.type,
        selected: true
      };
    }) : [];
  }

  private getAllCreativesForAdvertiser(pageNo?: number, pageSize?: number, resetPaginator?: boolean, refreshReq?: boolean) {
    this.requestInProgress = true;

    // REVX-468 : refresh was being passed as false everytime
    const localRefresh = (refreshReq == true) ? true : false;

    //REVX-724 : skad-ui changes
    let skadParam: boolean = (this.apiSkadParam) ? true : false;

    this.creativeService.searchCreativesCompactUsingPOST(this.searchReq, (pageNo) ? pageNo : 1, (pageSize) ? pageSize : 50,
      localRefresh, null, skadParam, this.sortOrder, this.strService.getAuthToken())
      .subscribe(
        (response: any) => {
          if (!resetPaginator) {
            resetPaginator = false;
          }

          if (response) {
            this.setCreativeData(response, resetPaginator);
          }

          // if (response && response.data) {
          //   this.setCreativeData(response, resetPaginator);
          // }
          this.requestInProgress = false;
        }, error => {
          this.requestInProgress = false;
        }
      );
  }

  setCreativeData(response: any, resetPaginator?: boolean) {
    if (response && response.respObject && response.respObject.data !== undefined
      && Array.isArray(response.respObject.data) && response.respObject.data.length > 0) {
      this.allCreativeList = this.groupCreativeByDate(response.respObject.data);

      // if (response && response.data !== undefined && Array.isArray(response.data) && response.data.length > 0) {
      //   this.allCreativeList = this.groupCreativeByDate(response.data);

      this.isCreativesAvailable = true;
      if (resetPaginator) {
        this.paginator.firstPage();
      }

      this.totalNoOfRecords = (response && response.respObject
        && response.respObject.totalNoOfRecords) ? response.respObject.totalNoOfRecords : 0;
      // this.totalNoOfRecords = (response && response.totalNoOfRecords) ? response.totalNoOfRecords : 0;

      this.paginator.length = this.totalNoOfRecords;
      if (this.allCreativeList !== null && this.allCreativeList !== undefined) {
        this.allCreativeGroupDays = Array.from(this.allCreativeList.keys());
      } else {
        this.allCreativeGroupDays = null;
      }
    } else {
      this.isCreativesAvailable = false;
      this.allCreativeGroupDays = null;
    }
  }

  private groupCreativeByDate(creativeList: CreativeCompactDTO[]) {
    const groupedCreatives: Map<number, Creative> = new Map<number, Creative>();

    creativeList.filter(item => item.active).forEach(creative => {
      const currDate = new Date(creative.creationTime * 1000);
      const date = this.commonService.getEpochFromDate(new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()));
      if (!groupedCreatives.has(date)) {
        groupedCreatives.set(date, {
          totalCount: 0,
          selectedCount: 0,
          creativeList: []
        } as Creative);
      }

      const list = groupedCreatives.get(date);
      list.totalCount += 1;
      const isSelected = this.isCreativeSelected(creative.id);
      list.selectedCount += isSelected ? 1 : 0;
      list.creativeList.push({
        ...creative,
        selected: isSelected
      });
      groupedCreatives.set(date, list);
    });

    return groupedCreatives;
  }

  private isCreativeSelected(creativeID: number) {
    const selCreativeIDs = this.selectedCreativeList.map(item => item.id);
    return (selCreativeIDs.indexOf(creativeID) !== -1) ? true : false;
  }

  private goToStep(stepNo: number, performValidation: boolean) {

    if (!performValidation) {
      this.strService.setStepperIndex(stepNo);
    }

    if (performValidation && this.isFormValid()) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
      this.strService.setMaxStepperVisited(5);
      this.strService.setStepperIndex(stepNo);
    }
  }

  getSelectedStatus(creative: CreativeDTO): boolean {
    const idList = (this.selectedCreativeList.length > 0) ? this.selectedCreativeList.map(x => x.id) : [];
    return idList.includes(creative.id);
  }


  validate() {
    if (this.isFormValid()) {
      this.updateBulkEditSelection();
      this.updateStrategyObject();
    }
  }


  //revx-371 : bulk edit
  setBulkEditParams() {
    let requiredParams = this.bulkEditService.getBulkEditSettings(this.SCONST.STEP_TITLE_CREATIVES);
    if (requiredParams) {
      this.creative = requiredParams as any;
    }
  }


  updateBulkEditSelection() {
    if (this.isBulkEdit) {
      this.bulkEditService.setBulkEditOptionSelected(this.SCONST.BULK_EDIT_KEYS.CREATIVE, this.creative.selectedBulkEditOpt);
    }
  }


  isToBeHidden() {
    if (this.isBulkEdit) {
      return this.creative.selectedBulkEditOpt === this.SCONST.NO_CHANGE;
    }
    return false;
  }



}
