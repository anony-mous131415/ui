import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';


@Component({
  selector: 'app-bulk-edit-review-request-response',
  templateUrl: './bulk-edit-review-request-response.component.html',
  styleUrls: ['./bulk-edit-review-request-response.component.scss']
})
export class BulkEditReviewRequestResponseComponent implements OnInit {


  PANE_REQ = 'left';
  PANE_RES = 'right';

  // updatedText = "hello";
  // textDomains = "hi";

  selectedPane: any;
  failedText;

  passedColumns = ['id', 'name'];
  failedColumns = ['id', 'name', 'message'];

  passedDataSource: MatTableDataSource<any>;
  failedDataSource: MatTableDataSource<any>;


  constructor(
    public modalRef: MatDialogRef<BulkEditReviewRequestResponseComponent>,
    @Inject(MAT_DIALOG_DATA) private injectedData: any,
  ) { }

  ngOnInit() {
    this.selectedPane = this.PANE_RES;
    this.passedDataSource = new MatTableDataSource(this.injectedData.response.passed);
    this.failedDataSource = new MatTableDataSource(this.injectedData.response.failed);
    // console.log(this.injectedData);
  }


  togglePane() {
    if (this.selectedPane === this.PANE_REQ) {
      this.selectedPane = this.PANE_RES
    } else {
      this.selectedPane = this.PANE_REQ;

    }
  }

  get config() {
    return this.injectedData;
  }






  closeModal() {
    this.modalRef.close();
  }



  /**
   * 
   * @param id 
   * id=0 : failed array length
   * id=1 : passed array length
   */
  getArrayLen(id: number): number {
    if (id === 0) {
      return (this.config && this.config.response && this.config.response.failed) ? this.config.response.failed.length : 0;
    } else {
      return (this.config && this.config.response && this.config.response.passed) ? this.config.response.passed.length : 0;
    }
  }



}

