import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { CatalogFeed } from '@revxui/api-client-ts';

@Component({
  selector: 'app-catalog-details',
  templateUrl: './catalog-details.component.html',
  styleUrls: ['./catalog-details.component.scss']
})
export class CatalogDetailsComponent implements OnInit {
  advId: string;
  catalogId: string;
  advConst = AdvConstants;
  appConst = AppConstants;
  catalogFeed = {} as CatalogFeed;
  breadcrumbs: string;
  entityId: number = 0;
  lastUpdated: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advService: AdvertiserService,
    private entitiesService: EntitiesService,
    private commonService: CommonService
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      const cid = params.get('cid');
      if (!isNaN(Number(id)) && !isNaN(Number(cid))) {
        this.advId = id;
        this.catalogId = cid;
        this.getDetailsById(Number(id));
        this.getCatalogDetails(Number(cid));
      } else {
        this.router.navigate(['']);
      }

    });

  }

  getCatalogDetails(id: number) {
    this.advService.getCatalogById(id).subscribe(response => {
      // console.log('response ,', response);
      // this.advPojo = response.respObject;
      this.catalogFeed = response.respObject;
      this.lastUpdated = this.commonService.epochToUTCDateFormatter(this.catalogFeed.lastUpdated);
    });
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }


  //for html download href
  isDemoUser(): boolean {
    const role = localStorage.getItem(AppConstants.CACHED_USER_ROLE)
    return (role === AppConstants.USER_ROLE.DEMO) ? true : false;
  }


}
