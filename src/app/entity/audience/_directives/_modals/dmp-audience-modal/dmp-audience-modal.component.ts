import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';


@Component({
  selector: 'app-dmp-audience-modal',
  templateUrl: './dmp-audience-modal.component.html',
  styleUrls: ['./dmp-audience-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DmpAudienceModalComponent implements OnInit {
  audConst = AudienceConstants;

  //for mat-table(5 feilds)
  displayedColumns = ['selected', 'sname', 'sync'];
  listSource: MatTableDataSource<any>;
  listLen: number;
  showProgressBar = false;//ui only
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  searchTxt: string = '';
  showDataUnavailableMsg: boolean = false;
  dataUnavailableMsg = 'No results found.';

  showAdvNotSelectedMsg: boolean = false;
  advNotSelectedMsg = 'No Advertiser selected. Please select an Advertiser first.';

  selectedElement: any; //selected radio from ui
  showWarning: boolean; //ui warning

  constructor(
    private modalRef: MatDialogRef<DmpAudienceModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private audService: AudienceService
  ) { }

  ngOnInit() {
    // console.log(this.configData);
    this.getAndSetDmpAudience(true);
  }

  getAndSetDmpAudience(isInit: boolean) {
    this.showProgressBar = true;
    this.audService.getAllDmpAudience(this.configData.advertiserId).subscribe(dmpResp => {
      const listData = (dmpResp && dmpResp.respObject && dmpResp.respObject.segments) ? dmpResp.respObject.segments : null;
      this.listSource = new MatTableDataSource(listData);
      if (listData) {
        this.listSource.paginator = this.paginator;
        this.listSource.sort = this.sort;
      }
      this.listLen = (dmpResp && dmpResp.respObject && dmpResp.respObject.segments !== null && dmpResp.respObject.segments !== undefined) ? dmpResp.respObject.segments.length : 0;
      this.showDataUnavailableMsg = (this.listLen === 0) ? true : false;
      this.showProgressBar = false;
      this.initSelection(isInit);

    }, (err: any) => {
      this.showProgressBar = false;
      this.showDataUnavailableMsg = true;
    });
  }


  initSelection(isInit: boolean) {
    if (isInit) {
      this.selectedElement = (this.configData.previousSelection) ? this.configData.previousSelection : null; // required when user reopens the modal
    } else {
      this.selectedElement = (this.selectedElement && this.selectedElement.sid) ? this.selectedElement : null; //required when user refreshes
    }
  }



  applySearchFilter(filterValue: string) {
    this.listSource.filter = filterValue.trim().toLowerCase();
    if (!this.listSource.filteredData.length) {
      this.showDataUnavailableMsg = true;
    } else {
      this.showDataUnavailableMsg = false;
    }
    if (this.listSource.paginator) {
      this.listSource.paginator.firstPage();
    }
  }



  elementClicked(row) {
    if (!row.isSynced) {
      this.selectedElement = row;
      this.showWarning = false;
    }
  }

  reload() {
    this.showDataUnavailableMsg = false;
    this.getAndSetDmpAudience(false);
  }


  clearAllClick() {
    this.selectedElement = null
  }


  done() {
    if (!this.selectedElement) {
      this.showWarning = true;
    } else {
      this.modalRef.close(this.selectedElement);
    }
  }

  cancel() {
    this.modalRef.close(null);
  }


}

