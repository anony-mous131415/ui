import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConvTrackerConstants } from '@app/entity/advertiser/_constants/ConvTrackerConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesService } from '@app/shared/_services/entities.service';

@Component({
  selector: 'app-conversion-tracker-list',
  templateUrl: './conversion-tracker-list.component.html',
  styleUrls: ['./conversion-tracker-list.component.scss']
})
export class ConversionTrackerListComponent implements OnInit {

  advId;
  breadcrumbs = '';
  dropdownMenu = '';
  convConst = ConvTrackerConstants;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService
  ) { }

  ngOnInit() {

    this.route.parent.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      if (!isNaN(Number(id))) {
        this.advId = id;
        // this.getDetailsById(Number(id));
      } else {
        this.router.navigate(['']);
      }

    });

    this.dropdownMenu = JSON.stringify([
      // {
      //   icon: 'fa fa-pencil-square-o',
      //   label: 'Quick Edit',
      //   click: function () {
      //     console.log(1);
      //   }
      // },
      {
        icon: 'fa fa-pencil',
        label: 'Edit',
        href: '/advertiser/' + this.advId + '/pixel/create/',
      },
      // {
      //   icon: 'fa fa-file-text-o',
      //   label: 'Get Report',
      //   href: '#',
      // },
      // {
      //   icon: 'fa fa-sort-amount-desc',
      //   label: 'Bid Analysis',
      //   href: '#',
      // }
    ]);
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

}
