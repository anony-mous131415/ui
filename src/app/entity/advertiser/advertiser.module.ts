import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { CreativeModule } from '../creative/creative.module';
import { AdvertiserRoutingModule } from './advertiser-routing.module';
import { AdvertiserCreateComponent } from './_components/advertiser-create/advertiser-create.component';
import { AdvertiserDetailsBaseComponent } from './_components/advertiser-details-base/advertiser-details-base.component';
import { AdvertiserDetailsComponent } from './_components/advertiser-details/advertiser-details.component';
import { AdvertiserListComponent } from './_components/advertiser-list/advertiser-list.component';
import { AdvertiserSettingsComponent } from './_components/advertiser-settings/advertiser-settings.component';
import { AdvertiserSmarttagComponent } from './_components/advertiser-smarttag/advertiser-smarttag.component';
import { CatalogDetailsComponent } from './_components/catalog/catalog-details/catalog-details.component';
import { CatalogListComponent } from './_components/catalog/catalog-list/catalog-list.component';
import { ConversionTrackerCodeComponent } from './_components/conversion-tracker/conversion-tracker-code/conversion-tracker-code.component';
import { ConversionTrackerDetailsComponent } from './_components/conversion-tracker/conversion-tracker-details/conversion-tracker-details.component';
import { ConversionTrackerListComponent } from './_components/conversion-tracker/conversion-tracker-list/conversion-tracker-list.component';
import { CampaignModule } from '../campaign/campaign.module';


@NgModule({
  declarations: [
    AdvertiserDetailsBaseComponent,
    AdvertiserDetailsComponent,
    AdvertiserListComponent,
    AdvertiserCreateComponent,
    AdvertiserSettingsComponent,
    AdvertiserSmarttagComponent,
    CatalogListComponent,
    CatalogDetailsComponent,
    ConversionTrackerListComponent,
    ConversionTrackerDetailsComponent,
    ConversionTrackerCodeComponent,
  ],
  imports: [
    AdvertiserRoutingModule,
    SharedModule,
    CreativeModule,
    CampaignModule
  ],
})
export class AdvertiserModule { }
