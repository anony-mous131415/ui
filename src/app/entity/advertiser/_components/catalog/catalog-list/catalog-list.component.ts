import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesService } from '@app/shared/_services/entities.service';

@Component({
  selector: 'app-catalog-list',
  templateUrl: './catalog-list.component.html',
  styleUrls: ['./catalog-list.component.scss']
})
export class CatalogListComponent implements OnInit {
  entityId;
  breadcrumbs = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

    this.route.parent.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      if (!isNaN(Number(id))) {
        this.entityId = id;
      } else {
        this.router.navigate(['']);
      }

    });
  }
}
