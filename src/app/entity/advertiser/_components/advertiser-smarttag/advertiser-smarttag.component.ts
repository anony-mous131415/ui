import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TagConstants } from '@app/entity/advertiser/_constants/TagConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitySelectorRadioComponent } from '@app/shared/_directives/entity-selector-radio/entity-selector-radio.component';
import { BaseModel } from '@app/shared/_models/base';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Tag } from '@revxui/api-client-ts';


@Component({
  selector: 'app-advertiser-smarttag',
  templateUrl: './advertiser-smarttag.component.html',
  styleUrls: ['./advertiser-smarttag.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdvertiserSmarttagComponent implements OnInit {
  breadcrumbs: string;
  advId: number;
  appConst = AppConstants;

  tagConst = TagConstants;
  formValidated = true;

  tagPlacementSelected;
  tagPlacements;

  tagTypeSelected;
  tagTypes;

  tag = {} as Tag;
  public modalOption: NgbModalOptions = {};
  bmForAdvertiser: BaseModel;

  closed = false;

  constructor(
    private advService: AdvertiserService,
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService,
    private readonly modalService: NgbModal,
  ) { }

  ngOnInit() {

    this.route.parent.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      if (!isNaN(Number(id))) {
        this.advId = Number(id);
        // if (this.advId)
        //   this.getDetailsById();
      } else {
        this.router.navigate(['']);
      }
    });


    this.tagPlacementSelected = 'desktop';
    this.tagPlacements = [
      { id: 'desktop', value: 'Desktop website or Mobile website' },
      { id: 'mobile', value: 'Mobile App' }
    ];

    this.tagPlacements = JSON.stringify(this.tagPlacements);

    this.tagTypeSelected = 'js';
    this.tagTypes = [
      { id: 'js', value: 'Javascript' },
      { id: 'img', value: 'Image' }
    ];

    this.tagTypes = JSON.stringify(this.tagTypes);

    if (this.advId) {
      this.getSmartTagDetails(this.advId);
    }

  }

  getDetailsById() {
    this.entitiesService.getDetailsById(this.advId, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  openModal(type: string) {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    this.modalOption.centered = true;

    const modal: NgbModalRef = this.modalService.open(EntitySelectorRadioComponent, this.modalOption);
    modal.componentInstance.entityType = type;//advertiser, campaign , pixel
    modal.result.then((result) => {
      if (result) {
        this.bmForAdvertiser = result;
        this.getSmartTagDetails(this.bmForAdvertiser.id);
      }
    });
  }

  getSmartTagDetails(advertiserId: number) {
    this.advService.getSmartTagUsingGET(advertiserId).subscribe(resp => {
      // console.log('resp ', resp);
      this.tag = resp.respObject;
    });
  }

}
