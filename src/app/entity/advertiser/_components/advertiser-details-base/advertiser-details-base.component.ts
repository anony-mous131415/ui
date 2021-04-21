import { Component, OnInit } from '@angular/core';
import { AdvertiserPojo } from '@revxui/api-client-ts';
import { ActivatedRoute, Router } from '@angular/router';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { AdvertiserService } from '../../_services/advertiser.service';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import { CommonService } from '@app/shared/_services/common.service';
import { AdvConstants } from '../../_constants/AdvConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
  selector: 'app-advertiser-details-base',
  templateUrl: './advertiser-details-base.component.html',
  styleUrls: ['./advertiser-details-base.component.scss']
})
export class AdvertiserDetailsBaseComponent implements OnInit {

  entityId: string;
  column = 'advertiserId';
  breadcrumbs = '';
  advPojo;
  advConst = AdvConstants;
  dateCreated: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService,
    private advService: AdvertiserService,
    private strService: StrategyService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.advPojo = {} as AdvertiserPojo;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      // console.log(params.get('id'))
      if (id && !isNaN(Number(id))) {
        this.entityId = id;
        this.getDetailsById(Number(id));
      } else {
        this.router.navigate(['']);
      }
    });
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

}
