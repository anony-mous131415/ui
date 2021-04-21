import { Injectable } from '@angular/core';
import {
  DashboardControllerService,
  ApiResponseObjectListMenuCrubResponse,
  ApiResponseObjectMenuCrubResponse,
  DashboardFilters,
  SearchRequest
} from '@revxui/api-client-ts';
import { Observable } from 'rxjs';
// import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AppConstants } from '../_constants/AppConstants';
import { CommonService } from './common.service';
import { AudienceService } from '@app/entity/audience/_services/audience.service';

const STATUS_VALID = 1;
const STATUS_IN_PROGRESS = 0;
const STATUS_INVALID = -1;


@Injectable({
  providedIn: 'root'
})
export class MenucrumbsService {

  private menucrumbs: any = null;
  private menucrumbStatus = STATUS_INVALID;
  public showDmpMenu = false;

  private successCallbackFn = null;
  private errorCallbackFn = null;

  constructor(
    private dashboardApiService: DashboardControllerService,
    private commonService: CommonService,
    private audienceService: AudienceService,
  ) { }


  /**
   * api call to get the menucrumbs data
   */
  get(): Observable<ApiResponseObjectListMenuCrubResponse> {
    return this.dashboardApiService.getMenuCrumbsUsingGET();
  }

  /**
   *
   * @param tableEntity
   * @param searchTxt
   * @param filters
   * api for searching in menu-crumbs only
   */
  getByName(tableEntity: any, searchTxt: string, filters?: DashboardFilters[]): Observable<ApiResponseObjectMenuCrubResponse> {
    const request: SearchRequest = {};
    if (filters) {
      request.filters = filters;
    }
    return this.dashboardApiService.searchByNameUsingPOST(tableEntity, null, request, searchTxt);
  }

  /**
   *
   * @param showDmpMenu
   * get basic empty menucrumbs for populating data
   */
  createMenucrumbsObject(showDmpMenu: boolean) {
    const menu = [
      {
        title: 'Home',
        href: '/home',
        entity: 'HOME',
        menu: null,
      },
      {
        title: 'Advertisers',
        href: null,
        entity: 'ADVERTISER',
        activeEntity: 'ADVERTISER',
        menu: {
          leftSide: {
            view: [{ entity: 'ADVERTISER', title: 'Advertisers', href: '/advertiser', active: true }],
            create: [{ entity: 'Advertiser', href: '/advertiser/create' }],
          },
          rightSide: [
            {
              searchTxt: '',
              entity: 'ADVERTISER',
              list: [], active: true,
              detailsLink: '/advertiser/details',
              viewAllMessage: 'See all Advertisers',
              viewAllLink: '/advertiser',
              viewAllQueryParam: null
            },
          ]
        },
      },
      {
        title: 'Campaigns',
        href: null,
        entity: 'CAMPAIGN',
        activeEntity: 'CAMPAIGN',
        menu: {
          leftSide: {
            view: [
              { entity: 'CAMPAIGN', title: 'Campaigns', href: '/campaign', active: true },
              { entity: 'STRATEGY', title: 'Strategies', href: '/strategy', active: false },
            ],
            create: [
              { entity: 'Campaign', href: '/campaign/create' },
              { entity: 'Strategy', href: '/strategy/create' }
            ],
          },
          rightSide: [
            {
              searchTxt: '',
              entity: 'CAMPAIGN',
              list: [], active: true,
              detailsLink: '/campaign/details',
              viewAllMessage: 'See all Campaigns',
              viewAllLink: '/campaign',
              viewAllQueryParam: null
            },
            {
              searchTxt: '',
              entity: 'STRATEGY',
              list: [], active: false,
              detailsLink: '/strategy/details',
              viewAllMessage: 'See all Strategies',
              viewAllLink: '/strategy',
              viewAllQueryParam: null
            }
          ]
        },
      },
      {
        title: 'Creatives',
        href: null,
        entity: 'CREATIVE',
        activeEntity: 'CREATIVE',
        menu: {
          leftSide: {
            view: [{ entity: 'CREATIVE', title: 'Creatives', href: '/creative', active: true }],
            create: [{ entity: 'Creative', href: '/creative/create' }],
          },
          rightSide: [
            {
              searchTxt: '',
              entity: 'CREATIVE',
              list: [], active: true,
              detailsLink: '/creative/details',
              viewAllMessage: 'See all Creatives',
              viewAllLink: '/creative',
              viewAllQueryParam: null
            },
          ]
        },
      },
      {
        title: 'Audience',
        href: null,
        entity: 'AUDIENCE',
        activeEntity: 'AUDIENCE',
        menu: {
          leftSide: {
            view: [
              {
                entity: AudienceConstants.TYPE.APP,
                title: 'App Audience',
                href: '/audience',
                queryHref: AudienceConstants.TYPE.APP,
                active: true
              },
              {
                entity: AudienceConstants.TYPE.WEB,
                title: 'Website Audience',
                href: '/audience',
                queryHref: AudienceConstants.TYPE.WEB,
                active: false
              },
              {
                entity: AudienceConstants.TYPE.DMP,
                title: 'DMP Audience',
                href: '/audience',
                queryHref: AudienceConstants.TYPE.DMP,
                active: false
              },
            ],
            create: [{ entity: 'Audience', href: '/audience/create' }],
          },
          rightSide: [

            // app audience
            {
              searchTxt: '',
              entity: AudienceConstants.TYPE.APP,
              list: [], active: true, // must be true
              detailsLink: '/audience/details',
              viewAllMessage: 'See all App Audience',
              viewAllLink: '/audience',
              viewAllQueryParam: AudienceConstants.TYPE.APP
            },

            // web audience
            {
              searchTxt: '',
              entity: AudienceConstants.TYPE.WEB,
              list: [], active: false,
              detailsLink: '/audience/details',
              viewAllMessage: 'See all Website Audience',
              viewAllLink: '/audience',
              viewAllQueryParam: AudienceConstants.TYPE.WEB
            },

            // Dmp audience
            {
              searchTxt: '',
              entity: AudienceConstants.TYPE.DMP,
              list: [], active: false,
              detailsLink: '/audience/details',
              viewAllMessage: 'See all DMP Audience',
              viewAllLink: '/audience',
              viewAllQueryParam: AudienceConstants.TYPE.DMP
            },
          ]
        },
      },
      {
        title: 'Reports',
        href: null,
        entity: 'REPORT',
        activeEntity: 'REPORT',
        isList: true,
        menu: {
          list: [
            { entity: 'REPORT_ADVANCED', title: 'Advanced Reports', href: '/report/advanced', active: false },
            { entity: 'REPORT_CONVERSION', title: 'Conversion Report', href: '/report/conversion', active: true },
            { entity: 'REPORT_VIDEO', title: 'Video Creatives Report', href: '/report/video', active: false },
            { entity: 'REPORT_SLICEX', title: 'SliceX', href: '/report/slicex', active: false },
          ],
        },
      }
    ];


    if (!showDmpMenu) {
      menu[4].menu.leftSide.view.splice(2, 1);
      menu[4].menu.rightSide.splice(2, 1);
    }

    return menu;
  }

  initMenucrumbs(success?, error?) {

    if (success) {
      this.successCallbackFn = success;
    }
    if (error) {
      this.errorCallbackFn = error;
    }

    if (this.menucrumbStatus === STATUS_INVALID) {
      this.checkAdvertiserId();
    } else if (this.menucrumbStatus === STATUS_VALID) {
      this.successCallbackFn(this.menucrumbs);
    } else {
      // do nothing
    }
  }

  getMenucrumbsData() {
    return this.menucrumbs;
  }

  invalidateMenucrumbsData() {
    this.menucrumbStatus = STATUS_INVALID;
    this.menucrumbs = null;
    this.initMenucrumbs(this.successCallbackFn, this.errorCallbackFn);
  }

  invalidateMenucrumbsForLogout() {
    this.menucrumbStatus = STATUS_INVALID;
    this.menucrumbs = null;
  }


  getIsShowDMP() {
    return this.getIsShowDMP;
  }


  private checkAdvertiserId() {
    this.menucrumbStatus = STATUS_IN_PROGRESS;
    const advIdEncoded = localStorage.getItem(AppConstants.ADVERTISER_ID_ENCODED);
    if (advIdEncoded) {
      const advId: number = this.commonService.decodeAdvId(advIdEncoded);
      this.audienceService.getAccess(advId).subscribe(resp => {
        const hasDmpAccess = (resp && resp.respObject && resp.respObject.isDmpAccess) ? resp.respObject.isDmpAccess : false;
        this.audienceService.dmpForAdvLevelAccess.next(hasDmpAccess);
        this.formMenuCrumbs(hasDmpAccess);
      }, err => {
        this.formMenuCrumbs(false);
        this.audienceService.dmpForAdvLevelAccess.next(false);
      });

    } else {
      this.audienceService.dmpForAdvLevelAccess.next(true);
      this.formMenuCrumbs(true);
    }
  }

  private formMenuCrumbs(isDmpMenu: boolean) {
    this.showDmpMenu = isDmpMenu;
    this.menucrumbs = this.createMenucrumbsObject(this.showDmpMenu);
    this.getMenuCrumbs();

  }

  private getMenuCrumbs() {
    let menuList = null;
    this.get().subscribe(response => {
      if (response && response.respObject) {
        const menuItemsList = response.respObject;
        menuList = menuItemsList.reduce((map, obj) => {
          map[obj.menuName] = obj.menuList;
          return map;
        }, {});
      }

      this.populateMenucrumbsList(menuList);
      this.menucrumbStatus = STATUS_VALID;
      if (this.successCallbackFn) {
        this.successCallbackFn(this.menucrumbs);
      }
    }, error => {
      this.menucrumbStatus = STATUS_INVALID;
      if (this.errorCallbackFn) {
        this.errorCallbackFn();
      }
    });
  }

  populateMenucrumbsList(menucrumbs) {
    // ADVERTISER LIST UPDATE
    this.menucrumbs[1].menu.rightSide[0].list = menucrumbs && menucrumbs.advertiser ? menucrumbs.advertiser : [];
    // CAMPAIGN LIST UPDATE
    this.menucrumbs[2].menu.rightSide[0].list = menucrumbs && menucrumbs.campaign ? menucrumbs.campaign : [];
    // STRATEGY LIST UPDATE
    this.menucrumbs[2].menu.rightSide[1].list = menucrumbs && menucrumbs.strategy ? menucrumbs.strategy : [];
    // CREATIVE LIST UPDATE
    this.menucrumbs[3].menu.rightSide[0].list = menucrumbs && menucrumbs.creative ? menucrumbs.creative : [];

    // AUDIENCE LIST
    this.menucrumbs[4].menu.rightSide[0].list = menucrumbs && menucrumbs.app_audience ? menucrumbs.app_audience : [];
    this.menucrumbs[4].menu.rightSide[1].list = menucrumbs && menucrumbs.web_audience ? menucrumbs.web_audience : [];


    if (this.showDmpMenu) {
      this.menucrumbs[4].menu.rightSide[2].list = menucrumbs && menucrumbs.dmp_audience ? menucrumbs.dmp_audience : [];
    }

  }


}
