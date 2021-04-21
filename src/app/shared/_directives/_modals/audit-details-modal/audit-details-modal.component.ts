import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { AuditService } from '@app/shared/_services/audit.service';
import { CommonService } from '@app/shared/_services/common.service';
import { AuditDetails } from '@revxui/api-client-ts/model/auditDetails';
import * as moment from 'moment';


@Component({
  selector: 'app-audit-details-modal',
  templateUrl: './audit-details-modal.component.html',
  styleUrls: ['./audit-details-modal.component.scss']
})
export class AuditDetailsModalComponent implements OnInit {

  PANE_LEFT = 'left';
  PANE_RIGHT = 'right';

  displayedColumns: string[] = ['time', 'entity', 'feild', 'madeBy', 'oldValue', 'newValue', 'nextBtn'];
  listSource: MatTableDataSource<any>;
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sort1', { static: false }) sort1: MatSort;
  showProgressBar: boolean;
  selelctedDetails: any;
  selectedPane: string;

  constructor(
    private modalRef: MatDialogRef<AuditDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) private injectedData: any,
    private auditService: AuditService,
    private commonService: CommonService,
  ) { }



  ngOnInit() {
    this.makeRequest();
  }

  get config() {
    return this.injectedData;
  }


  makeRequest() {
    this.selectedPane = this.PANE_LEFT;
    this.selelctedDetails = null;
    this.showProgressBar = true;
    this.auditService.getAuditFullDetails(this.injectedData.startEpoch, this.injectedData.endEpoch,
      this.injectedData.entityType, this.injectedData.entityId).subscribe(resp => {
        if (resp && resp.respObject) {
          const formattedArray = this.formatApiResp(resp.respObject);
          this.listSource = new MatTableDataSource(formattedArray);
          this.listSource.sort = this.sort1;
          this.listSource.paginator = this.paginator1;
          this.showProgressBar = false;
        }
      }, (error: any) => {
        this.showProgressBar = false;
      });

  }


  formatApiResp(apiRespArr: AuditDetails[]): any[] {
    let returnArr = [];
    apiRespArr.forEach(respObj => {
      const _time = moment.utc(respObj.timestamp * 1000).format('LT');
      const _type = (respObj.entity_type) ? respObj.entity_type : 'NA';
      const _entity = _type[0].toUpperCase() + _type.slice(1) + ' : ' + respObj.entity_name;
      const _user = this.commonService.getUserName(respObj.user_name);

      respObj.changes.forEach(apiChange => {

        let formattedOldVal = (apiChange.oldValue && apiChange.oldValue != 'null') ? apiChange.oldValue : 'NA';
        let formattedNewVal = (apiChange.newValue && apiChange.newValue != 'null') ? apiChange.newValue : 'NA';

        //formatting in case of start and end time changes (handled at api-side)
        if (this.isDateFeild(apiChange.fieldName)) {
          //   // formatting old val if present
          //   if (formattedOldVal != 'NA') {
          //     // formattedOldVal = (formattedOldVal === '-1') ? '-1' : moment((+formattedOldVal) * 1000).format('lll');
          //   }
          //   //formatting new val if present
          //   if (formattedNewVal != 'NA') {
          //     // formattedNewVal = (formattedNewVal === CampaignConstants.NEVER_ENDING_EPOCH.toString()) ? 'Never Ending' : moment((+formattedNewVal) * 1000).format('lll');
          //   }
        }

        //format non-time-related numeric sring to 2 decimal places
        else {
          if (this.isNumeric(formattedOldVal)) {
            formattedOldVal = parseFloat(formattedOldVal).toFixed(2);
          }

          if (this.isNumeric(formattedNewVal)) {
            formattedNewVal = parseFloat(formattedNewVal).toFixed(2);

          }
        }

        const objInArr = {
          time: _time,
          entity: _entity,
          feild: (apiChange.fieldName) ? apiChange.fieldName : 'NA',
          madeBy: _user,
          oldValue: formattedOldVal,
          newValue: formattedNewVal
        };


        returnArr.push(objInArr);

        //TODO : remove these , 
        // for (let i = 0; i < 15; i++) {
        //   returnArr.push(objInArr);
        // }

      });
    });
    return returnArr;
  }




  onNextButtonClick(element: AuditDetails) {
    // console.log(element);
    this.selectedPane = this.PANE_RIGHT;
    this.selelctedDetails = element;
  }

  onGoBackClick() {
    this.selectedPane = this.PANE_LEFT;
    this.selelctedDetails = null;
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listSource.filter = filterValue.trim().toLowerCase();
  }


  closeModal() {
    this.modalRef.close(null);
  }




  isNumeric(str): boolean {
    if (typeof str != "string") return false
    // return /^-?\d+$/.test(str);
    return !isNaN(parseFloat(str)) && isFinite(parseFloat(str));
  }


  isDateFeild(str: string) {
    if (!str || !str.length) {
      return false;
    }
    const possible = ['end time', 'end date', 'start time', 'start date'];
    return possible.includes(str.toLowerCase());
  }


}
