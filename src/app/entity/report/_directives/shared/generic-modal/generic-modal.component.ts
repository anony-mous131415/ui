import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { AdvancedUiService } from '@app/entity/report/_services/advanced-ui.service';


@Component({
  selector: 'app-generic-modal',
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss']
})
export class GenericModalComponent implements OnInit {

  listLen: number = 0;
  listSource: MatTableDataSource<any>;
  displayedColumns: string[] = [];
  listMetrics: any[] = [];
  bucket = [];
  allRowSelected: boolean;
  listData: any[] = [];
  modalValidated: boolean = true;
  showProgressBar: boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  constructor(
    private modalRef: MatDialogRef<GenericModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private advancedService: AdvancedUiService,
  ) { }

  ngOnInit() {
    this.initBucket();
    this.setTabelColumns();
    this.fetchData();
  }

  initBucket() {
    this.bucket = this.configData.inputArr;
  }

  setTabelColumns() {
    this.listMetrics = this.advancedService.getMetricsForList(this.configData.entity);
    this.displayedColumns = this.listMetrics.map(lc => lc.id);
  }

  fetchData() {
    this.showProgressBar = true;

    // this.advancedService.getListData(this.configData.entity).subscribe(response => {
    //   this.listSource = new MatTableDataSource(response);
    //   this.listData = response;
    //   this.listLen = response.length;
    //   setTimeout(() => this.paginator = this.paginator);
    //   setTimeout(() => this.sort = this.sort);
    //   setTimeout(() => { this.doCheckTheCheckboxIfDataInTheBucket(); });
    //   this.showProgressBar = false;

    // }, error => {
    //   // this.dataNotPresent = 'No data currently available.'
    //   this.listData = [];
    // });

  }

  selectAllClick() {
    if (this.allRowSelected === true) {
      for (const i in this.listData) {
        const id = Number(this.listData[i].id);
        this.bucket = this.bucket.filter((obj) => {
          return obj.id !== id;
        });

        this.bucket.push(this.listData[i]);
      }
      // select checkbox in ui
      this.listSource.data.map((obj) => {
        obj.select = true;
      });

    } else {
      for (const i in this.listData) {
        const id = Number(this.listData[i].id);
        this.bucket = this.bucket.filter((obj) => {
          return obj.id !== id;
        });
      }
      // unselect checkbox in ui
      this.listSource.data.map((adv) => {
        adv.select = false;
      });
    }

  }

  pushToBucket(row, action) {

    const advId = Number(row.id);
    if (action === true) {
      this.bucket.push(row);
      // Checking if all checked manually
      let allChecked = true;
      for (const idx in this.listSource.data) {
        const i = Number(idx);
        if (this.listSource.data[i].select !== true) {
          allChecked = false;
          break;
        }
      }
      this.allRowSelected = allChecked;
    } else {
      this.bucket = this.bucket.filter((obj) => {
        return obj.id !== advId;
      });

      // Unchecking the select all if one row is unchecked
      for (const idx in this.listSource.data) {
        const i = Number(idx);
        if (this.listSource.data[i].id === advId) {
          this.allRowSelected = false;
          this.listSource.data[i].select = false;
        }
      }
    }
  }

  doCheckTheCheckboxIfDataInTheBucket() {
    this.bucket.forEach(element => {
      this.listSource.data.forEach(obj => {
        if (element.id === obj.id) {
          obj.select = true;
        }
      });
    });
  }

  clearAllClick() {
    this.allRowSelected = false;
    this.bucket = [];
    this.listSource.data.map((obj) => {
      obj.select = false;
    });
  }

  done() {
    this.modalValidated = this.validate();
    if (this.modalValidated) {
      let dataToReturn = {
        data: this.bucket,
      }
      this.modalRef.close(dataToReturn);
    }
  }

  validate(): boolean {
    switch (this.configData.entity) {
      case AdvancedConstants.ENTITY.GROUP_BY:
        return this.bucket.length <= 7;
      default:
        return true;
    }
  }

  //trivial methods
  cancel() {
    this.modalRef.close(null);
  }
  reload() {
    this.fetchData();
  }
  searchFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Removing whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.listSource.filter = filterValue;
  }
  get config() {
    return this.configData;
  }
}
