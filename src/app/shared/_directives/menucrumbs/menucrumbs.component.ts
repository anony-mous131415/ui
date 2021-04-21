import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { AlertMessageConstants } from '@app/shared/_constants/alert-message.constants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';
import { DashboardFilters, MenuCrubResponse } from '@revxui/api-client-ts';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { UserInfo } from '@revxui/auth-client-ts';

export interface SearchDebounce {
  searchVal: string;
  entityType: string;
}

@Component({
  selector: 'app-menucrumbs',
  templateUrl: './menucrumbs.component.html',
  styleUrls: ['./menucrumbs.component.scss']
})
export class MenucrumbsComponent implements OnInit, OnDestroy {

  searchSubscription: Subscription;
  private searchSubject: Subject<SearchDebounce> = new Subject<SearchDebounce>();

  menuItemsList: MenuCrubResponse[] = [];
  menuList: any;
  noEntityFound: string;
  activeMenu: string;

  menucrumbs: any[] = [];
  showDmpMenu: boolean;

  constructor(
    private menucrumbService: MenucrumbsService,
    private commonService: CommonService,
    private router: Router,
    private audienceService: AudienceService,
    private authUIService: AuthenticationService,
  ) { }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(350)).subscribe((searchTextValue: SearchDebounce) => {
      this.callSearchApi(searchTextValue.searchVal, searchTextValue.entityType);
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menucrumbLinkActiveHandler();
      }
    });

    this.authUIService.licenseeSelectionWatcher().subscribe((item: UserInfo) => {
      // this.checkAdvertiserId();
      this.menucrumbService.invalidateMenucrumbsData();
      this.menucrumbService.initMenucrumbs((menucrumbs) => {
        this.success(menucrumbs);
      }, () => {
        this.error();
      });

    });

    // this.checkAdvertiserId();
    this.menucrumbService.initMenucrumbs((menucrumbs) => {
      this.success(menucrumbs);
    }, () => {
      this.error();
    });
  }

  private success(menucrumbs) {
    this.menucrumbs = menucrumbs;
    this.menucrumbLinkActiveHandler();
  }

  private error() {

  }


  /*
  checkAdvertiserId() {
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
  */

  /*
  formMenuCrumbs(isDmpMenu: boolean) {
    this.showDmpMenu = isDmpMenu;
    this.menucrumbs = this.menucrumbService.createMenucrumbsObject(this.showDmpMenu);
    this.getMenuCrumbs();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menucrumbLinkActiveHandler();
      }
    });
  }
  */

  /*
  getMenuCrumbs() {
    this.menucrumbService.get().subscribe(response => {
      if (response && response.respObject) {
        // console.log('menucrumb ', response);
        this.menuItemsList = response.respObject;
        this.menuList = this.menuItemsList.reduce((map, obj) => {
          map[obj.menuName] = obj.menuList;
          return map;
        }, {});
      }
      // localStorage.setItem(AppConstants.CACHED_MENUCRUMBS, JSON.stringify(this.menuList));

      this.populateMenucrumbsList(this.menuList);
      this.menucrumbLinkActiveHandler();
    });
  }
  */

  /*
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
  */
  searchEntitiesByTxt(txt: string, entity: string) {
    // console.log(entity);
    this.searchSubject.next({
      searchVal: txt,
      entityType: entity
    });
  }

  callSearchApi(txt: string, entity: any) {
    let list = [];
    this.noEntityFound = '';

    const filters: DashboardFilters[] = [];
    let audienceType: string = null;
    if (entity === AudienceConstants.TYPE.APP || entity === AudienceConstants.TYPE.WEB || entity === AudienceConstants.TYPE.DMP) {
      const audienceApiReq = {} as DashboardFilters;
      const requestBody = this.audienceService.getApiValue(entity);

      audienceApiReq.column = AudienceConstants.TYPE_API_KEY;
      audienceApiReq.value = requestBody.apiValue;
      audienceType = entity; // will be used to decide which array to assign into
      entity = requestBody.tableName; // over-riiden bcz it repesents table name

      filters.push(audienceApiReq);
    }

    this.menucrumbService.getByName(entity, txt, filters).subscribe(response => {
      if (response.respObject.menuList.length === 0) {
        this.noEntityFound = AlertMessageConstants.NO_ADVERTISER_FOUND;
      } else {
        list = response.respObject.menuList;
        this.noEntityFound = '';
      }

      switch (entity.toUpperCase()) {
        case AppConstants.ENTITY.HOME:
          break;
        case AppConstants.ENTITY.ADVERTISER:
          this.menucrumbs[1].menu.rightSide[0].list = list;
          break;
        case AppConstants.ENTITY.CAMPAIGN:
          this.menucrumbs[2].menu.rightSide[0].list = list;
          break;
        case AppConstants.ENTITY.STRATEGY:
          this.menucrumbs[2].menu.rightSide[1].list = list;
          break;
        case AppConstants.ENTITY.CREATIVE:
          this.menucrumbs[3].menu.rightSide[0].list = list;
          break;

        case AppConstants.ENTITY.AUDIENCE:
          if (audienceType === AudienceConstants.TYPE.APP) {
            this.menucrumbs[4].menu.rightSide[0].list = list;
          } else if (audienceType === AudienceConstants.TYPE.WEB) {
            this.menucrumbs[4].menu.rightSide[1].list = list;
          } else if (this.menucrumbService.showDmpMenu && audienceType === AudienceConstants.TYPE.DMP) {
            this.menucrumbs[4].menu.rightSide[2].list = list;
          }
          break;
      }
    });
  }



  menucrumbLinkActiveHandler() {
    const entity = this.commonService.getEntityFromURL();

    // un-highlight all report option
    this.menucrumbs[5].menu.list[0].active = false;
    this.menucrumbs[5].menu.list[1].active = false;
    this.menucrumbs[5].menu.list[2].active = false;

    switch (entity.toUpperCase()) {
      case AppConstants.ENTITY.HOME:
        this.activeMenu = AppConstants.ENTITY.HOME;
        break;
      case AppConstants.ENTITY.ADVERTISER:
        this.activeMenu = AppConstants.ENTITY.ADVERTISER;
        break;
      case AppConstants.ENTITY.CAMPAIGN:
        this.activeMenu = AppConstants.ENTITY.CAMPAIGN;
        this.menucrumbs[2].menu.leftSide.view[0].active = true;
        this.menucrumbs[2].menu.leftSide.view[1].active = false;
        this.menucrumbs[2].menu.rightSide[0].active = true;
        this.menucrumbs[2].menu.rightSide[1].active = false;
        this.menucrumbs[2].activeEntity = AppConstants.ENTITY.CAMPAIGN;
        break;
      case AppConstants.ENTITY.STRATEGY:
        this.activeMenu = AppConstants.ENTITY.CAMPAIGN;
        this.menucrumbs[2].menu.leftSide.view[0].active = false;
        this.menucrumbs[2].menu.leftSide.view[1].active = true;
        this.menucrumbs[2].menu.rightSide[0].active = false;
        this.menucrumbs[2].menu.rightSide[1].active = true;
        this.menucrumbs[2].activeEntity = AppConstants.ENTITY.STRATEGY;
        break;
      case AppConstants.ENTITY.CREATIVE:
        this.activeMenu = AppConstants.ENTITY.CREATIVE;
        this.menucrumbs[3].menu.leftSide.view[0].active = true;
        this.menucrumbs[3].menu.rightSide[0].active = true;
        this.menucrumbs[3].activeEntity = AppConstants.ENTITY.CREATIVE;
        break;

      case AppConstants.ENTITY.AUDIENCE:
        this.activeMenu = AppConstants.ENTITY.AUDIENCE;
        this.menucrumbs[4].activeEntity = AudienceConstants.TYPE.APP;
        this.mouseoverHandler(entity);
        break;

      case AppConstants.ENTITY.REPORT:
        this.activeMenu = AppConstants.ENTITY.REPORT;
        const type = this.commonService.getReportTypeFromURL();
        type.trim();
        if (type === AppConstants.REPORTS.ADVANCED) {
          this.menucrumbs[5].menu.list[0].active = true;
          this.menucrumbs[5].menu.list[1].active = false;
          this.menucrumbs[5].menu.list[2].active = false;
        }
        //REVX-537 : hovering over menucrumbs issue 
        else if (type === AppConstants.REPORTS.CONVERSION) {
          this.menucrumbs[5].menu.list[0].active = false;
          this.menucrumbs[5].menu.list[1].active = true;
          this.menucrumbs[5].menu.list[2].active = false;
        } else if (type === AppConstants.REPORTS.SLICEX) {
          this.menucrumbs[5].menu.list[0].active = false;
          this.menucrumbs[5].menu.list[1].active = false;
          this.menucrumbs[5].menu.list[2].active = true;

        }
        break;

      default:
        this.activeMenu = AppConstants.ENTITY.HOME;
        break;
    }

  }

  // For CAMPAIGNS AND STRATEGIES ONLY
  mouseoverHandler(entity) {
    switch (entity) {
      case AppConstants.ENTITY.CAMPAIGN:
        this.menucrumbs[2].menu.rightSide[0].active = true;
        this.menucrumbs[2].menu.rightSide[1].active = false;
        this.menucrumbs[2].menu.leftSide.view[0].active = true;
        this.menucrumbs[2].menu.leftSide.view[1].active = false;
        break;

      case AppConstants.ENTITY.STRATEGY:
        this.menucrumbs[2].menu.rightSide[0].active = false;
        this.menucrumbs[2].menu.rightSide[1].active = true;
        this.menucrumbs[2].menu.leftSide.view[0].active = false;
        this.menucrumbs[2].menu.leftSide.view[1].active = true;
        break;

      // AUDIENCE-menu
      case AudienceConstants.TYPE.APP:
      case AudienceConstants.TYPE.WEB:
      case AudienceConstants.TYPE.DMP:
        this.audienceMenuHandler(entity);
    }
  }


  /**
   *
   * @param entity : type of audience to be activate
   */
  audienceMenuHandler(entity) {
    this.deactivateAllAudience();
    let idxToBeActivated: number;

    if (this.menucrumbService.showDmpMenu) {
      idxToBeActivated = (entity === AudienceConstants.TYPE.APP) ? 0 : (entity === AudienceConstants.TYPE.WEB) ? 1 : 2;
    } else {
      idxToBeActivated = (entity === AudienceConstants.TYPE.APP) ? 0 : 1;
    }

    this.menucrumbs[4].menu.leftSide.view[idxToBeActivated].active = true;
    this.menucrumbs[4].menu.rightSide[idxToBeActivated].active = true;
  }


  /**
   * use to deactivate left and right menu of audience tab
   */
  deactivateAllAudience() {
    this.menucrumbs[4].menu.leftSide.view[0].active = false;
    this.menucrumbs[4].menu.leftSide.view[1].active = false;

    this.menucrumbs[4].menu.rightSide[0].active = false;
    this.menucrumbs[4].menu.rightSide[1].active = false;

    if (this.menucrumbService.showDmpMenu) {
      this.menucrumbs[4].menu.leftSide.view[2].active = false;
      this.menucrumbs[4].menu.rightSide[2].active = false;
    }

  }


  /**
   * @param link : all see all links will have this
   * @param queryParam : only audience types will have this , for others it will be null
   * purpose : audeice list link has query params
   */
  viewAllHandler(link, queryParamVal) {
    if (!queryParamVal) {
      this.routeWithOutQuery(link);
    } else {
      this.routeWithQuery(link, queryParamVal);
    }
  }

  routeWithQuery(link, queryParamVal) {
    this.router.navigate([link], {
      queryParams: {
        type: queryParamVal
      }
    });
  }

  routeWithOutQuery(link) {
    this.router.navigate([link]);
  }


  getPlaceHolder(entity: string): string {
    if (entity === AudienceConstants.TYPE.APP || entity === AudienceConstants.TYPE.WEB || entity === AudienceConstants.TYPE.DMP) {
      return 'Search ' + entity.toLowerCase() + ' audience';
    }
    return 'Search ' + entity.toLowerCase();
  }
}
