import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'campaignObjective'
})
export class CampaignObjectivePipe implements PipeTransform {

  campaignObjective = new Map();

  setCampaignObjective() {
    this.campaignObjective.set('WEBSITE', 'Website Conversions');
    this.campaignObjective.set('MOBILE_APP_INSTALLS', 'App Installs');
    this.campaignObjective.set('MOBILE_APP_ENGAGEMENT', 'App Engagement');
    this.campaignObjective.set('BRAND_AWARENESS', 'Brand Awareness');
  }

  transform(type: string): string {
    this.setCampaignObjective();
    return this.campaignObjective.get(type);
  }

}
