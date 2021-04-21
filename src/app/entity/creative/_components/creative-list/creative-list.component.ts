import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-creative-list',
  templateUrl: './creative-list.component.html',
  styleUrls: ['./creative-list.component.scss']
})
export class CreativeListComponent implements OnInit {
  breadcrumbs: string;
  dropdownMenu: string;

  advId: number;

  createPageLink: string;

  isAdvertiserPage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.checkIsAdvertiserPage();
  }

  ngOnInit() {

    this.route.parent.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && !isNaN(Number(id))) {
        this.advId = Number(id);
        this.createPageLink = '/advertiser/' + this.advId.toString() + '/creative/create';
      } else {
        this.createPageLink = '/creative/create';
      }
    });

    this.handleBreadcrumbs();

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
        href: '/creative/edit/',
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

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { creative: { id: '', name: '' } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  checkIsAdvertiserPage() {
    const route = this.router.routerState.snapshot.url;
    const index = route.indexOf('advertiser');
    this.isAdvertiserPage = (index !== -1) ? true : false;
  }

}
