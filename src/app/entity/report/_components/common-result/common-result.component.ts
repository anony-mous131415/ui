import { Component, OnInit, ViewChild, OnDestroy, Optional, Input } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { } from '@app/shared/_services/common.service';
import { MatPaginator, PageEvent, MatSort } from '@angular/material';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';
import { SortModel, ReportingRequest } from '@revxui/api-client-ts';
import { ConvUiService } from '../../_services/conv-ui.service';
import { CommonReportingService } from '../../_services/common-reporting.service';
import { AdvancedUiService } from '../../_services/advanced-ui.service';
import { ReportBuilderService } from '../../_services/report-builder.service';
@Component({
  selector: 'app-common-result',
  templateUrl: './common-result.component.html',
  styleUrls: ['./common-result.component.scss']
})
export class CommonResultComponent implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  pageSizeAdv = [50, 100, 150, 200, 500];
  pageSizeConv = [50, 100, 150, 200, 500, 1000, 2000];

  ENTITY: string;
  appConst = AppConstants;
  @Input() isReportModal: boolean = false;
  showProgressBar = false;
  showDataUnavailableMsg = false;
  dataUnavailableMsg = '';

  result: any;
  columnsToDisplay: string[] = [];

  columnPropertiesList: any[] = null;

  dataSource = null;
  breadcrumbs: string;
  totalRows = 0;
  reportType: string;
  requiredProperties: {};
  request: ReportingRequest;

  constructor(
    private advancedService: AdvancedUiService,
    private router: Router,
    private commonReportingService: CommonReportingService,
    private convService: ConvUiService,
    private reportBuilderService: ReportBuilderService,
  ) { }

  ngOnDestroy() {
    const selectedService = this.getRespectiveService();
    selectedService.resetOnLeave();
  }

  ngOnInit() {
    this.reportType = this.commonReportingService.getReportType();
    this.ENTITY = (this.reportType === AppConstants.REPORTS.ADVANCED || this.reportType === AppConstants.REPORTS.VIDEO) ? 'rtb' : 'conversionreport';
    if(this.reportType === AppConstants.REPORTS.ADVANCED) 
      this.ENTITY = 'rtb';
    else if(this.reportType === AppConstants.REPORTS.CONVERSION)
      this.ENTITY = 'conversionreport';
    else if(this.reportType === AppConstants.REPORTS.VIDEO) 
      this.ENTITY = 'videoreport';
    this.requiredProperties = this.commonReportingService.getRequiredMetrics(this.reportType);
    const selectedService = this.getRespectiveService();
    this.result = selectedService.getResult();
    this.request = selectedService.getRequestObject();

    this.tabulateResult();

    this.paginator.page.subscribe((page: PageEvent) => {
      selectedService.setPageNumber(page.pageIndex + 1);
      selectedService.setPageSize(page.pageSize);
      this.makePaginationRequest();
    });
    this.handleBreadcrumbs();
  }

  handleBreadcrumbs(id?: string) {
    const objKey = this.reportType+'Result';
    const breadcrumbsObj = { [this.reportType]: {id: '', name: ''}, [objKey]: {id: '', name: ''}};
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  getColumns() {
    if (this.columnPropertiesList === null) {
      this.columnPropertiesList = Object.keys(this.requiredProperties).map(key => this.requiredProperties[key]);
    }
    return this.columnPropertiesList;
  }

  private tabulateResult() {
    this.columnsToDisplay = [];

    // group by columns
    if (this.result !== null && this.result !== undefined) {
      const groupBys: string[] = this.result['group_by'];
      if (groupBys !== null && groupBys !== undefined && groupBys.length > 0) {
        groupBys.forEach((item: string) => {
          const prop = this.requiredProperties[item];
          if (prop !== null && prop !== undefined) {
            const displayCols = prop.columnsToDisplay;
            displayCols.forEach(col => {
              if (this.columnsToDisplay.indexOf(col) === -1) {
                this.columnsToDisplay.push(col);
              }
            });
          }
        });
      } else {
        const interval = this.result.interval;
        if (interval !== null && interval !== undefined && interval !== ReportingRequest.IntervalEnum.None) {
          this.columnsToDisplay.push('ts_utc_hour');
        }
      }
      //Show date and time if interval is none
      const interval = this.result.interval;
      if (interval !== null && interval !== undefined && interval === ReportingRequest.IntervalEnum.None && this.reportType !== AppConstants.REPORTS.CONVERSION) {
        this.columnsToDisplay.push('ts_utc_hour');
      }
    }

    // select columns
    if (this.request !== null && this.request !== undefined) {
      const selects: string[] = this.request.columns;

      selects.filter((sel: string) => {
        const prop = this.requiredProperties[sel];
        if (prop !== null && prop !== undefined) {
          const displayCols = prop.columnsToDisplay;
          displayCols.forEach(col => {
            if (this.columnsToDisplay.indexOf(col) === -1) {
              this.columnsToDisplay.push(col);
            }
          });
        }
      });
    }

    if (this.reportType !== AppConstants.REPORTS.CONVERSION) {
      this.checkDateColumnsToBeDisplayed();
    }

    if (this.result !== null && this.result !== undefined && this.result.results !== null && this.result.results !== undefined) {
      if (this.result.results.length > 0) {
        const formatterResult = this.result.results.map((row: any, idx: number) => {
          const obj = {};
          this.columnsToDisplay.forEach(col => {
            obj[col] = row[col];
            if (col === 'bid_price') {
              obj['bid_price_currency'] = row.bid_price_currency;
            }
          });
          obj['currency'] = row.currency;
          obj['index'] = idx + 1;
          return obj;
        });

        this.dataSource = formatterResult;
        this.totalRows = this.result.total_results_count;
      } else {
        this.showDataUnavailableMsg = true;
        this.dataUnavailableMsg = 'No data available';
      }
    } else {
      this.showDataUnavailableMsg = true;
      this.dataUnavailableMsg = 'No data available';
    }
  }

  checkDateColumnsToBeDisplayed() {
    const dateCandidates = ['ts_utc_hour', 'ts_utc_day', 'ts_utc_week', 'timestamp'];
    const columns = [...this.columnsToDisplay];
    columns.forEach((item) => {
      if (dateCandidates.indexOf(item) !== -1) {
        const colIndex = this.columnsToDisplay.indexOf(item);
        this.columnsToDisplay.splice(colIndex, 1);
        this.columnsToDisplay.splice(0, 0, 'endtime');
        this.columnsToDisplay.splice(0, 0, 'starttime');
      }
    });
  }

  exportReport() {
    this.blockUI.start('Exporting report data. Please wait...');
    const selectedService = this.getRespectiveService();
    selectedService.export(this.ENTITY)
      .subscribe(
        (resp: any) => {
          // console.log('SUCCESS ', resp);
          if (resp && resp.respObject) {
            const fileUrl = resp.respObject.fileDownloadUrl;
            if (fileUrl !== null && fileUrl !== undefined) {
              const link = document.createElement('a');
              link.href = fileUrl;
              link.click();
            }
          }
          this.blockUI.stop();
        }, (error: any) => {
          console.log('ERROR ', error);
          this.blockUI.stop();
        }
      );
  }

  goBack() {
    this.router.navigate(['report', this.reportType]);
  }

  sortChange(event: any) {
    const selectedService = this.getRespectiveService();
    const reqObj = selectedService.getRequestObject();
    const sortBy = {} as SortModel;
    sortBy.column = event.active;
    sortBy.ascending = (event.direction === 'asc') ? true : false;
    const sortByList = [] as Array<SortModel>;
    sortByList.push(sortBy);
    reqObj.sort_by = sortByList;

    this.showProgressBar = true;
    this.blockUI.start('Sorting report data. Please wait...');
    selectedService.show(this.ENTITY)
      .subscribe(
        (resp: any) => {
          // console.log('SUCCESS ', resp);
          if (resp && resp.respObject) {
            // selectedService.setResult(resp.respObject);
            // this.result = selectedService.getResult();
            // this.tabulateResult();
            this.onApiSuccess(selectedService, resp.respObject);
          }
          // this.blockUI.stop();
          // this.showProgressBar = false;
          this.afterApiCall();
        }, (error: any) => {
          // console.log('ERROR ', error);
          // this.blockUI.stop();
          // this.showProgressBar = false;
          this.afterApiCall();
        }
      );

  }

  makePaginationRequest() {
    const selectedService = this.getRespectiveService();
    this.showProgressBar = true;
    this.blockUI.start('Fetching report data. Please wait...');
    selectedService.show(this.ENTITY)
      .subscribe(
        (resp: any) => {
          // console.log('SUCCESS ', resp);
          if (resp && resp.respObject) {
            // selectedService.setResult(resp.respObject);
            // this.result = selectedService.getResult();
            // this.tabulateResult();
            this.onApiSuccess(selectedService, resp.respObject);
          }
          // this.blockUI.stop();
          // this.showProgressBar = false;
          this.afterApiCall();
        }, (error: any) => {
          // console.log('ERROR ', error);
          // this.blockUI.stop();
          // this.showProgressBar = false;
          this.afterApiCall();
        }
      );
  }

  onApiSuccess(selectedService: any, apiResp: any) {
    selectedService.setResult(apiResp);
    this.result = selectedService.getResult();
    this.tabulateResult();
  }

  afterApiCall() {
    this.blockUI.stop();
    this.showProgressBar = false;
  }

  hideColumn() {
    this.blockUI.start('Please wait...');
    if (this.isAdvHidden()) {
      this.columnsToDisplay.splice(0, 0, 'advertiser', 'campaign', 'strategy');
    } else {
      this.columnsToDisplay.splice(0, 3);
    }
    this.blockUI.stop();
  }


  getPageSize() {
    if (this.reportType === AppConstants.REPORTS.ADVANCED || this.reportType === AppConstants.REPORTS.VIDEO) {
      return this.pageSizeAdv
    } else if (this.reportType === AppConstants.REPORTS.CONVERSION) {
      return this.pageSizeConv
    } 
  }


  getRespectiveService() {
    if(this.reportType === AppConstants.REPORTS.ADVANCED) 
      return this.advancedService;
    else if (this.reportType === AppConstants.REPORTS.VIDEO) 
      return this.reportBuilderService;
    else
      return this.convService;
  }

  isAdvHidden(): boolean {
    return (this.columnsToDisplay[0] !== AppConstants.ENTITY.ADVERTISER.toLowerCase()) ? true : false;
  }

}
