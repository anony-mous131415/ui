import { Component, OnInit, Inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import * as mock from '@app/entity/strategy/_services/mock'
// import { ActivityLogsStrategyBulkUpdateDTO } from '@revxui/api-client-ts/model/activityLogsStrategyBulkUpdateDTO';
import { StrategyBulkEditService } from '@app/entity/strategy/_services/strategy-bulk-edit.service';
import { BulkEditReviewRequestResponseComponent } from '../bulk-edit-review-request-response/bulk-edit-review-request-response.component';
import { merge, Subscription, interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BulkStrategyControllerService, ActivityLogsStrategyBulkUpdateDTO } from '@revxui/api-client-ts';
import { CommonService } from '@app/shared/_services/common.service';
import * as moment from 'moment';


const SECONDS = 1000;

interface RequestDetails {
  pageNum: number;
  pageSize: number;
  sortString: String
}


@Component({
  selector: 'app-bulk-edit-activity-log',
  templateUrl: './bulk-edit-activity-log.component.html',
  styleUrls: ['./bulk-edit-activity-log.component.scss']
})
export class BulkEditActivityLogComponent implements OnInit, AfterViewInit, OnDestroy {

  // displayedColumns: string[] = ['id', 'createdOn', 'modifiedOn', 'userName', 'reqRes', 'status',];
  displayedColumns: string[] = ['createdOn', 'status', 'userName', 'reqRes'];

  listSource: MatTableDataSource<any>;
  listLen: number;
  pageSizeArr: number[] = [];

  showProgressBar: boolean = false;

  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sort1', { static: false }) sort1: MatSort;
  noDataCurrently: boolean = false;

  private updateSubscription: Subscription;
  readonly RED ='red';
  readonly GREEN ='green';
  readonly BLUE ='blue';




  constructor(
    public modalRef: MatDialogRef<BulkEditActivityLogComponent>,
    @Inject(MAT_DIALOG_DATA) private injected: any,
    private bulkEditService: StrategyBulkEditService,
    private modal: MatDialog,
    private bulkEditApiService: BulkStrategyControllerService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.fetchBulkEditLogs();


    this.updateSubscription = interval(30 * SECONDS).subscribe((val) => {
      // console.log('called after 2 sec');
      this.fetchBulkEditLogs();

    });
  }


  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }


  ngAfterViewInit() {
    this.sort1.sortChange.subscribe(() => {
      this.paginator1.pageIndex = 0;
    });
    merge(this.sort1.sortChange, this.paginator1.page)
      .pipe(
        tap(() => {
          this.fetchBulkEditLogs();
        })
      )
      .subscribe();
  }


  getRequestParams(): RequestDetails {
    let pageNum = 1;
    let pageSize = 50;
    let sortString;

    if (this.paginator1 && this.paginator1.pageIndex) {
      pageNum = this.paginator1.pageIndex + 1;
    }

    if (this.paginator1 && this.paginator1.pageSize) {
      pageSize = this.paginator1.pageSize;
    }

    //only for soring
    sortString = (this.sort1 && this.sort1.active) ? this.sort1.active : null;
    if (sortString != null) {
      const direction = (this.sort1.direction === 'asc') ? '+' : '-';
      sortString = sortString.concat(direction);
    }

    return { pageNum, pageSize, sortString };
  }


  fetchBulkEditLogs() {
    this.showProgressBar = true;
    this.noDataCurrently = false;
    const req: RequestDetails = this.getRequestParams();

    this.bulkEditApiService.bulkEditActivityLogUsingGET(req.pageNum, req.pageSize, null, req.sortString as any).subscribe(resp => {
      // this.mockApiService.bulkEditActivityLogUsingGET(req.pageNum, req.pageSize, null, req.sortString as any).subscribe(resp => {

      // console.log(resp.respObject);
      this.listLen = 0;
      this.listSource = new MatTableDataSource([]);
      this.pageSizeArr = [50, 100];
      if (resp && resp.respObject) {
        const formattedArray: any[] = this.formatApiResp(resp.respObject.data);

        if (formattedArray.length < 1) {
          this.noDataCurrently = true;
        }


        this.listSource = new MatTableDataSource(formattedArray);
        this.listLen = resp.respObject.totalNoOfRecords;


        if (this.listLen > 100 && this.listLen <= 200) {
          this.pageSizeArr = [50, 100, 200];
        } else if (this.listLen > 200) {
          this.pageSizeArr = [50, 100, 200, this.listLen];
        }
      }
      this.showProgressBar = false;
    }, (error: any) => {

      this.showProgressBar = false;

    })
  }







  // applyFilter(event) {
  // }

  openReqResModal(element: ActivityLogsStrategyBulkUpdateDTO) {
    let formattedrequest = this.bulkEditService.convertBulkEditReqToUi(element.requestObj, element.requestObj.strategies);
    // let formattedrequest = mock.requestData;
    // console.log(formattedrequest);


    const modalRef = this.modal.open(BulkEditReviewRequestResponseComponent, {
      width: '85%',
      maxHeight: '100vh',
      disableClose: false,
      data: {
        request: formattedrequest,
        response: {
          failed: (element && element.responseObj && element.responseObj.failedStrategies) ? element.responseObj.failedStrategies : [],
          passed: (element && element.responseObj && element.responseObj.updatedStrategies) ? element.responseObj.updatedStrategies : []
        }

      },
    });
    modalRef.afterClosed().subscribe(result => { });
  }


  closeModal() {
    this.modalRef.close();
  }


  formatApiResp(apiRespArr: ActivityLogsStrategyBulkUpdateDTO[]): any[] {
    let returnArr = [];
    // return returnArr;
    apiRespArr.forEach(respObj => {
      const createTime = (respObj && respObj.createdOn) ? moment.utc(respObj.createdOn * 1000).format('lll') : '--';
      const modifyTime = (respObj && respObj.modifiedOn) ? moment.utc(respObj.modifiedOn * 1000).format('lll') : '--';

      let statusUi = '--';
      let statusColor = this.BLUE;
      if (respObj && respObj.status === ActivityLogsStrategyBulkUpdateDTO.StatusEnum.FAILED) {
        statusUi = "Failed";
        statusColor = this.RED;
      } else if (respObj && respObj.status === ActivityLogsStrategyBulkUpdateDTO.StatusEnum.INPROGRESS) {
        statusUi = "In progress";
      } else if (respObj && respObj.status === ActivityLogsStrategyBulkUpdateDTO.StatusEnum.PENDING) {
        statusUi = "Pending";
      } else if (respObj && respObj.status === ActivityLogsStrategyBulkUpdateDTO.StatusEnum.SUCCESS) {
        statusUi = "Success";
        statusColor = this.GREEN;
      }

      const objInArr = {
        id: respObj.id,
        createdOn: createTime,
        modifiedOn: modifyTime,
        userName: this.commonService.getUserName(respObj.userName),
        status: statusUi,
        color: statusColor,
        requestObj: respObj.requestObj,
        responseObj: respObj.responseObj,
      };


      returnArr.push(objInArr);

    });

    return returnArr;
  }







}
