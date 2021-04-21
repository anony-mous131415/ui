import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';
import { ClickDestinationConstants } from '@app/entity/advertiser/_constants/ClickDestinationConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ClickDestination } from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';
import { CdCreateComponent } from '../cd-create/cd-create.component';

@Component({
  selector: 'app-cd-list',
  templateUrl: './cd-list.component.html',
  styleUrls: ['./cd-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class CdListComponent implements OnInit, OnDestroy {

  clickDestination: ClickDestination;

  @Input() advertiserId: string;
  @Input() showSelectOption: string;
  @Input() useAsDirective: string;

  getCD: Subscription;

  @Output() syncSelectedClickDestination: EventEmitter<ClickDestination> = new EventEmitter();
  @Output() noCdFound: EventEmitter<boolean> = new EventEmitter();
  noSearchResult: string;

  showRadioSelect = false;
  hideHeader = false;

  cdConst = ClickDestinationConstants;
  showProgressBar = false;

  public modalOption: NgbModalOptions = {}

  advId: number;
  breadcrumbs: string;
  refresh: boolean;
  cdList: Array<ClickDestination>;
  cdListLen: number;

  //REVX-724
  displayedColumns = ['action', 'name', 'id', 'dco', 'skad', 'campaignType'];
  menu: any;

  cdSource: MatTableDataSource<ClickDestination>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  noDataMsg: string;

  closed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService,
    private advService: AdvertiserService,
    private modal: MatDialog,
    private readonly modalService: NgbModal,
    private crService: CreativeService
  ) { }

  ngOnDestroy() {
    if (this.getCD) {
      this.getCD.unsubscribe();
    }
  }

  ngOnInit() {
    this.menu = [{
      icon: 'fa fa-pencil',
      label: 'Edit',
      // href: '/advertiser/' + this.advId + '/pixel/create/',
    }];

    if (this.useAsDirective && this.useAsDirective === 'true') {
      this.subscribeToEvent();
    }


    if (!this.advertiserId) {
      this.route.parent.paramMap.subscribe(params => {
        const id = params.get('id');
        if (!isNaN(Number(id))) {
          this.advId = Number(id);
          // this.getDetailsById(this.advId);
          this.getClickDestinations();
        } else {
          this.router.navigate(['']);
        }

      });
    } else {
      this.advId = Number(this.advertiserId);
      this.getClickDestinations();
    }

    if (this.showSelectOption) {
      if (this.showSelectOption === 'true') {
        this.showRadioSelect = true;
      }
    }

    if (this.useAsDirective) {
      if (this.useAsDirective === 'true') {
        this.hideHeader = true;
      }
    }
  }


  subscribeToEvent() {
    this.getCD = this.crService.selectedCD.subscribe(cd => {
      if (cd) {
        this.clickDestination = cd;
      } else {
        this.clickDestination = null;
      }
    });
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  getClickDestinations() {
    this.showProgressBar = true;
    this.advService.getClickDestinationList(this.advId, 1, 200, this.refresh, null, null, 'id-').subscribe((resp: any) => {
      if (!resp.error) {

        this.cdList = (resp && resp.respObject && resp.respObject.data) ? resp.respObject.data : [];
        // this.cdList = (resp && resp.data) ? resp.data : [];

        this.noCdFound.emit(false);

        this.noDataMsg = (!resp || !resp.respObject || !resp.respObject.totalNoOfRecords) ? AdvConstants.NO_CLICK_DEST_MSG : null;
        // this.noDataMsg = (!resp || !resp.totalNoOfRecords) ? AdvConstants.NO_CLICK_DEST_MSG : null;
        this.cdSource = new MatTableDataSource(this.cdList);

        this.cdListLen = (resp && resp.respObject && resp.respObject.totalNoOfRecords) ? resp.respObject.totalNoOfRecords : 0;
        // this.cdListLen = (resp && resp.totalNoOfRecords) ? resp.totalNoOfRecords : 0;

        setTimeout(() => this.cdSource.paginator = this.paginator);
        setTimeout(() => this.cdSource.sort = this.sort);
      } else {
        this.noCdFound.emit(true);
        this.noDataMsg = AdvConstants.NO_CLICK_DEST_MSG;
      }
      this.refresh = false;
      this.showProgressBar = false;
    }, catchError => {
      this.showProgressBar = false;
    });
  }

  // Search click destination by text
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Removing whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    if (this.cdSource) {
      this.cdSource.filter = filterValue;
      if (!this.cdSource.filteredData.length) {
        this.noSearchResult = 'No results found.'
      } else {
        this.noSearchResult = null;
      }
    }
  }

  reload() {
    this.refresh = true;
    this.getClickDestinations();
  }

  showClickDestinationModal(row, from: string) {
    // if (!row || (this.showRadioSelect && from === 'name') || (!this.showRadioSelect && from === 'menu')) {
    this.clickDestination = row;
    if (!this.clickDestination) {
      this.clickDestination = {} as ClickDestination;
      this.clickDestination.advertiserId = this.advId;
    }
    const modalRef = this.modal.open(CdCreateComponent, {
      width: '70%',
      height: '90%',
      // maxHeight: '90%',
      data: {
        cd: { ...this.clickDestination },
        advertiserId: +this.advId
      },
      disableClose: true,
    });

    modalRef.afterClosed().subscribe(result => {
      if (result) {
        this.getClickDestinations();
      }
    });
    // }
  }

  selectClickDestination() {
    this.syncSelectedClickDestination.emit(this.clickDestination);
  }

  rowClick(row) {
    this.clickDestination = row;
    this.selectClickDestination();
  }



  //<!-- REVX-724 add new column for is Skad Network here-->
  // <!-- values : yes/no-->

}
