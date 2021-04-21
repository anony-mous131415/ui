import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {

  constructor() { }


  createBCObject(response) {
    let breadcrumbsObj: any = {};

    if (response.parent && response.parent.parent && response.parent.parent.parent) {
      breadcrumbsObj = {
        advertiser: { id: response.parent.parent.id, name: response.parent.parent.name },
        campaign: { id: response.parent.id, name: response.parent.name },
        strategy: { id: response.id, name: response.name },
      };
    } else if (response.parent && response.parent.parent) {
      breadcrumbsObj = {
        advertiser: { id: response.parent.id, name: response.parent.name },
        campaign: { id: response.id, name: response.name },
      };
    } else if (response.parent) {
      breadcrumbsObj = {
        advertiser: { id: response.id, name: response.name },
      };
    }
    // this need to be handled in the respective component
    // else if (response.parent === null) {
    //   breadcrumbsObj = {
    //     audience: { id: response.id, name: response.name },
    //   };
    // }
    return breadcrumbsObj;
  }



}
