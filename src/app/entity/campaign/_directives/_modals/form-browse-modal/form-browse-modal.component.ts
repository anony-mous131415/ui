import { Component, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { CommonService } from '@app/shared/_services/common.service';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DashboardControllerService } from '@revxui/api-client-ts';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-form-browse-modal',
  templateUrl: './form-browse-modal.component.html',
  styleUrls: ['./form-browse-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormBrowseModalComponent implements OnInit {

  @Input() public entity; //pixel or advertiser
  selectedStatus: any;

  //for mat-table(5 feilds)
  displayedColumns = ['selected', 'active', 'name'];
  listSource: any = new MatTableDataSource();
  showProgressBar = false;//ui only
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //for search api storing and fetching and data-unavailable
  searchTxt: string = '';
  showDataUnavailableMsg: boolean = false;
  dataUnavailableMsg = 'No results were found for the searched text !!';

  selectedElement: any; //seleccted radio from ui
  showWarning: boolean; //ui warning 

  objective: any;  //passing selected to caller

  constructor(
    private commonService: CommonService,
    @Optional() private readonly activeModal: NgbActiveModal,
    private dashboardControllerService: DashboardControllerService,
  ) { }

  ngOnInit() {
    this.showWarning = false;
    this.getAndSetRequiredEntities();
  }

  getAndSetRequiredEntities() {
    this.showProgressBar = true;

    const entityReq = this.commonService.getDictionary(this.entity, 1, 10);

    forkJoin([entityReq]).subscribe(results => {
      // console.log(results[0]);
      this.setListSource(results[0].respObject.data);
      this.showProgressBar = false;
    });
  }

  setListSource(dataToBeDisplayed) {
    this.listSource = new MatTableDataSource(dataToBeDisplayed); //donot assign direcctly , use MatTDS
    this.listSource.sort = this.sort;
    this.listSource.paginator = this.paginator;

    // console.log(this.displayedColumns);
    // console.log(this.)
    // console.log(this.listSource);
  }

  done() {
    if (!this.selectedElement) {
      this.showWarning = true;

    } else {
      this.objective = this.selectedElement;
      this.activeModal.close(this.objective);
      this.dismissModal();
    }
  }

  dismissModal() {
    this.activeModal.close();
  }

  applyStatusFilter(activeStatus?: boolean) {
    //for filtering based on activ einactrive status --via API calls (not implimented in old ui)
  }

  reload() {
    this.showDataUnavailableMsg = false;
    this.getAndSetRequiredEntities();
  }

  formSearchString(val) {
    // console.log('### storing...');
    this.searchTxt = val;
    // console.log(this.searchTxt);
  }

  applySearchFilter() {
    this.showProgressBar = true;
    // console.log('@@@ fetching...');
    this.dashboardControllerService.searchByNameUsingPOST(this.entity).subscribe(apiResp => {
      // console.log(apiResp);
      if (apiResp.respObject.menuList.length === 0) {
        this.showDataUnavailableMsg = true;
      } else {
        this.showDataUnavailableMsg = false;
      }
      this.setListSource(apiResp.respObject.menuList);
      this.showProgressBar = false;
    });
  }

}
