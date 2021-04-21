import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConvTrackerConstants } from '@app/entity/advertiser/_constants/ConvTrackerConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { Pixel, Tag } from '@revxui/api-client-ts';



@Component({
  selector: 'app-conversion-tracker-code',
  templateUrl: './conversion-tracker-code.component.html',
  styleUrls: ['./conversion-tracker-code.component.scss']
})
export class ConversionTrackerCodeComponent implements OnInit {

  breadcrumbs: string;
  advId: string;
  pixelId: string;
  trkConst = ConvTrackerConstants;
  // trkCodeCode = {} as Tag;
  trkCode = {} as Tag;
  pixel = {} as Pixel;
  appConst = AppConstants;

  trkCodePlacementSelected;
  trkCodePlacements;

  trkCodeTypeSelected;
  trkCodeTypes;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advService: AdvertiserService,
    private entitiesService: EntitiesService,
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      const pid = params.get('pid');
      if (!isNaN(Number(id)) && !isNaN(Number(pid))) {
        this.advId = id;
        this.pixelId = pid;
        this.getDetailsById(Number(id));
        this.getTrackerCode(Number(pid));
      } else {
        this.router.navigate(['']);
      }

    });

    this.trkCodePlacementSelected = 'desktop';
    this.trkCodePlacements = [
      { id: 'desktop', value: 'Desktop website or Mobile website' },
      { id: 'mobile', value: 'Mobile App' }
    ];

    this.trkCodePlacements = JSON.stringify(this.trkCodePlacements);

    this.trkCodeTypeSelected = 'js';
    this.trkCodeTypes = [
      { id: 'js', value: 'Javascript' },
      { id: 'img', value: 'Image' }
    ];

    this.trkCodeTypes = JSON.stringify(this.trkCodeTypes);
  }

  getTrackerCode(pid: number) {
    this.advService.getPixelById(pid).subscribe(response => {
      // console.log('response ,', response);
      this.pixel = response.respObject;
    });

    this.advService.getTrackerCode(pid).subscribe(response => {
      // console.log('response ,', response);
      this.trkCode = response.respObject;
      // this.updateUIdata();
    });
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      // console.log(response);
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }


}
