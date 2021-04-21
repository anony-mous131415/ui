import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules, NoPreloading } from '@angular/router';
import { AuthenticationComponent } from '@app/startup/_components/authentication/authentication.component';
import { PageNotFoundComponent } from './startup/_components/page-not-found/page-not-found.component';


/*
const routes: Routes = [
  { path: '', component: AuthenticationComponent, canActivate: [AuthGuard] },
  { path: 'login', component: AuthenticationComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: AppConstants.URL_ADVERTISERS, component: AdvertiserListComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/create', component: AdvertiserCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'advertiser/create/:id', component: AdvertiserCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'advertiser/settings/:id', component: AdvertiserSettingsComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'advertiser/details/:id', component: AdvertiserDetailsComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/smarttag/:id', component: AdvertiserSmarttagComponent, canActivate: [AuthGuard] },

  { path: 'advertiser/smarttag', component: AdvertiserSmarttagComponent, canActivate: [AuthGuard] },

  { path: 'advertiser/:id/catalog', component: CatalogListComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/catalog/:cid', component: CatalogDetailsComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/pixel', component: ConversionTrackerListComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/pixel/details/:pid', component: ConversionTrackerDetailsComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/pixel/tracker/:pid', component: ConversionTrackerCodeComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/pixel/create', component: ConversionTrackerCreateComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/pixel/create/:pid', component: ConversionTrackerCreateComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/clickdestinations', component: CdListComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/cdcreate', component: CdCreateComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/cdcreate/:cdid', component: CdCreateComponent, canActivate: [AuthGuard] },

  { path: 'advertiser/:id/creative', component: CreativeListComponent },
  { path: 'advertiser/:id/creative/create', component: CreativeCreateComponent },


  { path: AppConstants.URL_CAMPAIGNS, component: CampaignListComponent, canActivate: [AuthGuard] },
  { path: 'campaign/create', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'campaign/create/:cid', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'campaign/details/:cid', component: CampaignDetailsComponent, canActivate: [AuthGuard] },
  { path: 'advertiser/:id/campaign/create', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'advertiser/:id/campaign/create/:cid', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  { path: AppConstants.URL_STRATEGIES, component: StrategyListComponent, canActivate: [AuthGuard] },
  { path: 'strategy/details/:id', component: StrategyDetailsComponent, canActivate: [AuthGuard] },
  { path: 'strategy/create', component: StrategyEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'strategy/edit/:sid', component: StrategyEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'campaign/:cid/strategy/create', component: StrategyEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  { path: AppConstants.URL_AUDIENCE, component: AudienceListComponent, canActivate: [AuthGuard] },
  { path: 'audience/details/:audId', component: AudienceDetailsComponent, canActivate: [AuthGuard] },
  { path: 'audience/create', component: AudienceCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'audience/create/:audId', component: AudienceCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'audience/duplicate/:audDupId', component: AudienceCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },


  { path: AppConstants.URL_CREATIVES, component: CreativeListComponent, canActivate: [AuthGuard] },
  { path: 'creative/create', component: CreativeCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'creative/details/:cid', component: CreativeDetailsComponent, canActivate: [AuthGuard] },
  { path: 'creative/edit/:cid', component: CreativeEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },


  { path: 'report/slicex', component: SlicexComponent, canActivate: [AuthGuard] },
  { path: 'report/conversion', component: ConversionComponent, canActivate: [AuthGuard] },
  { path: 'report/advanced', component: AdvancedComponent, canActivate: [AuthGuard] },
  { path: 'report/advanced/result', component: AdvanceResultComponent, canActivate: [AuthGuard] },



  // { path: 'test/:cid', component: StrCrAssociationModalComponent },

  // otherwise redirect to home
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
  { path: '404', component: PageNotFoundComponent }

  // otherwise redirect to home

];
*/

const routes: Routes = [
  // NO LAZY LOADING
  { path: '', component: AuthenticationComponent },
  { path: 'login', component: AuthenticationComponent },

  // LAZY LOADING
  { path: 'home', loadChildren: () => import('./home/home.module').then(item => item.HomeModule) },
  { path: 'advertiser', loadChildren: () => import('./entity/advertiser/advertiser.module').then(item => item.AdvertiserModule) },
  { path: 'campaign', loadChildren: () => import('./entity/campaign/campaign.module').then(item => item.CampaignModule) },
  { path: 'strategy', loadChildren: () => import('./entity/strategy/strategy.module').then(item => item.StrategyModule) },
  { path: 'creative', loadChildren: () => import('./entity/creative/creative.module').then(item => item.CreativeModule) },
  { path: 'audience', loadChildren: () => import('./entity/audience/audience.module').then(item => item.AudienceModule) },
  { path: 'report', loadChildren: () => import('./entity/report/report.module').then(item => item.ReportModule) },


  // WILDCARD ROUTES : NO LAZY LOADING
  { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
