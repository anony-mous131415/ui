import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { UserInfo } from '@revxui/auth-client-ts';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnChanges {
  licenseeName: string;
  bcList = [];
  @Input() bc: string;
  @Input() licensee: string;

  constructor(
    private authUIService: AuthenticationService,
  ) { }

  ngOnInit() {

    this.authUIService.licenseeSelectionWatcher().subscribe((item: UserInfo) => {
      this.initializeBreadcrumbs();
    });
  }

  initializeBreadcrumbs() {
    this.bcList = [];
    this.licenseeName = localStorage.getItem(AppConstants.CACHED_LICENSEE_NAME);

    const licenseeContent = { title: AppConstants.ENTITY.LICENSEE + ':', link: '/' + AppConstants.URL_HOME, name: this.licenseeName };
    this.bcList.push(licenseeContent);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildBreadcrumbs(changes);
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  buildBreadcrumbs(changes) {
    this.initializeBreadcrumbs();
    if (changes && changes.bc && changes.bc.currentValue) {
      const bcObject = (this.isJsonString(changes.bc.currentValue)) ? JSON.parse(changes.bc.currentValue) : {};
      if (bcObject.advertiser) {
        const colStr = bcObject.advertiser.id ? ':' : '';
        const content = {
          title: AppConstants.ENTITY.ADVERTISER + colStr,
          link: '/' + AppConstants.URL_ADVERTISERS + '/details/' + bcObject.advertiser.id,
          name: bcObject.advertiser.name
        };
        this.bcList.push(content);
      }

      if (bcObject.campaign) {
        const colStr = bcObject.campaign.id ? ':' : '';
        const content = {
          title: AppConstants.ENTITY.CAMPAIGN + colStr,
          link: '/' + AppConstants.URL_CAMPAIGNS + '/details/' + bcObject.campaign.id,
          name: bcObject.campaign.name
        };
        this.bcList.push(content);
      }

      if (bcObject.strategy) {
        const colStr = bcObject.strategy.id ? ':' : '';
        const content = {
          title: AppConstants.ENTITY.STRATEGY + colStr,
          link: '/' + AppConstants.URL_STRATEGIES + '/details/' + bcObject.strategy.id,
          name: bcObject.strategy.name
        };
        this.bcList.push(content);
      }

      if (bcObject.creative) {
        const colStr = bcObject.creative.id ? ':' : '';
        const content = {
          title: AppConstants.ENTITY.CREATIVE + colStr,
          link: '/' + AppConstants.URL_CREATIVES + '/details/' + bcObject.creative.id,
          name: bcObject.creative.name
        };
        this.bcList.push(content);
      }

      if (bcObject.audience) {
        const colStr = bcObject.audience.id ? ':' : '';
        const content = {
          title: AppConstants.ENTITY.AUDIENCE + colStr,
          link: '/' + AppConstants.URL_AUDIENCE + '/details/' + bcObject.audience.id,
          name: bcObject.audience.name
        };
        this.bcList.push(content);
      }
      if (bcObject.campaignCreate) {
        const content = {
          title: 'Create Campaign',
          link: '/' + AppConstants.URL_CAMPAIGNS + '/create',
        };
        this.bcList.push(content);
      }

      if (bcObject.advertiserCreate) {
        const content = {
          title: 'Create Advertiser',
          link: '/' + AppConstants.URL_ADVERTISERS + '/create',
        };
        this.bcList.push(content);
      }

      if (bcObject.strategyCreate) {
        const content = {
          title: 'Create Strategy',
          link: '/' + AppConstants.URL_STRATEGIES + '/create',
        };
        this.bcList.push(content);
      }

      if (bcObject.audienceCreate) {
        const content = {
          title: 'Create Audience',
          link: '/' + AppConstants.URL_AUDIENCE + '/create',
        };
        this.bcList.push(content);
      }
      if(bcObject.advanced) {
        const colStr = bcObject.advanced.id ? ':' : '';
        const content = {
          link:'/' + AppConstants.URL_REPORT + '/advanced/' + bcObject.advanced.id,
          name: 'Advanced Reports'
        };
        this.bcList.push(content);
      }

      if(bcObject.conversion) {
        const colStr = bcObject.conversion.id ? ':' : '';
        const content = {
          link:'/' + AppConstants.URL_REPORT + '/conversion/' + bcObject.conversion.id,
          name: 'Conversion Reports'
        };
        this.bcList.push(content);
      }

      if(bcObject.video) {
        const colStr = bcObject.video.id ? ':' : '';
        const content = {
          link:'/' + AppConstants.URL_REPORT + '/video/' + bcObject.video.id,
          name: 'Video Creatives Report'
        };
        this.bcList.push(content);
      }

      if(bcObject.slicex) {
        const colStr = bcObject.slicex.id ? ':' : '';
        const content = {
          link:'/' + AppConstants.URL_REPORT + '/slicex/' + bcObject.slicex.id,
          name: 'Slicex'
        };
        this.bcList.push(content);
      }

      if(bcObject.advancedResult) {
        const colStr = bcObject.advancedResult.id ? ':' : '';
        const content = {
          title: 'Advanced Report Result' + colStr,
          link:'/' + AppConstants.URL_REPORT + '/advanced/result',
          name: bcObject.advancedResult.name
        };
        this.bcList.push(content);
      }

      if(bcObject.conversionResult) {
        const colStr = bcObject.conversionResult.id ? ':' : '';
        const content = {
          title: 'Conversion Report Result' + colStr,
          link:'/' + AppConstants.URL_REPORT + '/advanced/result',
          name: bcObject.conversionResult.name
        };
        this.bcList.push(content);
      }
    }
  }
}
