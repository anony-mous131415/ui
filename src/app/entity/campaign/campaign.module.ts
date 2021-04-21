import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { CampaignRoutingModule } from './campaign-routing.module';
import { CampaignCreateComponent } from './_components/campaign-create/campaign-create.component';
import { CampaignDetailsComponent } from './_components/campaign-details/campaign-details.component';
import { CampaignListComponent } from './_components/campaign-list/campaign-list.component';
import { CampaignObjectiveModalComponent } from './_directives/_modals/campaign-objective-modal/campaign-objective-modal.component';
import { FormBrowseModalComponent } from './_directives/_modals/form-browse-modal/form-browse-modal.component';
import { CampaignObjectivePipe } from './_pipes/campaign-objective.pipe';
import { StrategyModule } from '../strategy/strategy.module';

@NgModule({
  declarations: [
    CampaignDetailsComponent,
    CampaignListComponent,
    CampaignCreateComponent,

    CampaignObjectiveModalComponent,
    FormBrowseModalComponent,

    CampaignObjectivePipe
  ],
  imports: [
    CampaignRoutingModule,
    SharedModule,
    StrategyModule
  ],
  entryComponents: [
    CampaignObjectiveModalComponent,
    FormBrowseModalComponent,

  ],
  providers: [
    CampaignObjectivePipe,
  ]
})
export class CampaignModule { }
