import { Component, OnInit } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
  selector: 'app-advertiser-list',
  templateUrl: './advertiser-list.component.html',
  styleUrls: ['./advertiser-list.component.scss']
})
export class AdvertiserListComponent implements OnInit {

  entity = AppConstants.ENTITY.ADVERTISER;
  breadcrumbs: string;

  constructor() { }

  ngOnInit() {
    this.handleBreadcrumbs();
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { advertiser: { id: '', name: '' } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

}
