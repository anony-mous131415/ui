import { Component, OnInit } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
  selector: 'app-audience-list',
  templateUrl: './audience-list.component.html',
  styleUrls: ['./audience-list.component.scss']
})
export class AudienceListComponent implements OnInit {

  entity = AppConstants.ENTITY.ADVERTISER;
  breadcrumbs: string;
  dropdownMenu: any;

  constructor() { }

  ngOnInit() {
    this.handleBreadcrumbs();
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { audience: { id: '', name: '' } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }


}
