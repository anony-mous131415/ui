import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdCreateComponent } from '@app/shared/_components/click-destinations/cd-create/cd-create.component';
import { CdListComponent } from '@app/shared/_components/click-destinations/cd-list/cd-list.component';
import { PendingChangesGuard } from '@app/shared/_guard/pending-changes.guard';
import { AuthGuard } from '@app/shared/_services/auth-guard.service';
import { CampaignCreateComponent } from '../campaign/_components/campaign-create/campaign-create.component';
import { CreativeCreateComponent } from '../creative/_components/creative-create/creative-create.component';
import { CreativeListComponent } from '../creative/_components/creative-list/creative-list.component';
import { AdvertiserCreateComponent } from './_components/advertiser-create/advertiser-create.component';
import { AdvertiserDetailsComponent } from './_components/advertiser-details/advertiser-details.component';
import { AdvertiserListComponent } from './_components/advertiser-list/advertiser-list.component';
import { AdvertiserSettingsComponent } from './_components/advertiser-settings/advertiser-settings.component';
import { AdvertiserSmarttagComponent } from './_components/advertiser-smarttag/advertiser-smarttag.component';
import { CatalogDetailsComponent } from './_components/catalog/catalog-details/catalog-details.component';
import { CatalogListComponent } from './_components/catalog/catalog-list/catalog-list.component';
import { ConversionTrackerCodeComponent } from './_components/conversion-tracker/conversion-tracker-code/conversion-tracker-code.component';
// import { ConversionTrackerCreateComponent } from './_components/conversion-tracker/conversion-tracker-create/conversion-tracker-create.component';
import { ConversionTrackerDetailsComponent } from './_components/conversion-tracker/conversion-tracker-details/conversion-tracker-details.component';
import { ConversionTrackerListComponent } from './_components/conversion-tracker/conversion-tracker-list/conversion-tracker-list.component';
import { AdvertiserDetailsBaseComponent } from './_components/advertiser-details-base/advertiser-details-base.component';
import { ConversionTrackerCreateComponent } from '@app/shared/_components/pixel/conversion-tracker-create/conversion-tracker-create.component';


const routes: Routes = [
  { path: '', component: AdvertiserListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: AdvertiserCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'create/:id', component: AdvertiserCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  // { path: 'settings/:id', component: AdvertiserSettingsComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  {
    path: 'details/:id', component: AdvertiserDetailsBaseComponent, children: [
      { path: 'pixel', component: ConversionTrackerListComponent, canActivate: [AuthGuard] },
      { path: 'creative', component: CreativeListComponent, canActivate: [AuthGuard] },
      { path: 'catalog', component: CatalogListComponent, canActivate: [AuthGuard] },
      { path: 'clickdestinations', component: CdListComponent, canActivate: [AuthGuard] },
      { path: 'smarttag', component: AdvertiserSmarttagComponent, canActivate: [AuthGuard] },
      { path: 'settings', component: AdvertiserSettingsComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
      { path: '', component: AdvertiserDetailsComponent },
    ]
  },
  // { path: 'smarttag/:id', component: AdvertiserSmarttagComponent, canActivate: [AuthGuard] },
  // { path: 'smarttag', component: AdvertiserSmarttagComponent, canActivate: [AuthGuard] },
  // { path: ':id/catalog', component: CatalogListComponent, canActivate: [AuthGuard] },
  { path: ':id/catalog/:cid', component: CatalogDetailsComponent, canActivate: [AuthGuard] },
  // { path: ':id/pixel', component: ConversionTrackerListComponent, canActivate: [AuthGuard] },
  { path: ':id/pixel/details/:pid', component: ConversionTrackerDetailsComponent, canActivate: [AuthGuard] },
  { path: ':id/pixel/tracker/:pid', component: ConversionTrackerCodeComponent, canActivate: [AuthGuard] },
  { path: ':id/pixel/create', component: ConversionTrackerCreateComponent, canActivate: [AuthGuard] },
  { path: ':id/pixel/create/:pid', component: ConversionTrackerCreateComponent, canActivate: [AuthGuard] },
  // { path: ':id/clickdestinations', component: CdListComponent, canActivate: [AuthGuard] },
  { path: ':id/cdcreate', component: CdCreateComponent, canActivate: [AuthGuard] },
  { path: ':id/cdcreate/:cdid', component: CdCreateComponent, canActivate: [AuthGuard] },

  { path: ':id/campaign/create', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: ':id/campaign/create/:cid', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  // { path: ':id/creative', component: CreativeListComponent },
  { path: ':id/creative/create', component: CreativeCreateComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvertiserRoutingModule { }
