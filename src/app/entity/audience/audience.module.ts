import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AudienceRoutingModule } from './audience-routing.module';
import { AudienceCreateComponent } from './_components/audience-create/audience-create.component';
import { AudienceDetailsComponent } from './_components/audience-details/audience-details.component';
import { AudienceListComponent } from './_components/audience-list/audience-list.component';
import { AudienceRulesComponent } from './_directives/audience-rules/audience-rules.component';
import { AudienceObjectiveComponent } from './_directives/_modals/audience-objective/audience-objective.component';
import { DmpAudienceModalComponent } from './_directives/_modals/dmp-audience-modal/dmp-audience-modal.component';
import { RemoteFileModalComponent } from './_directives/_modals/remote-file-modal/remote-file-modal.component';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [
    AudienceCreateComponent,
    AudienceDetailsComponent,
    AudienceListComponent,

    AudienceRulesComponent,
    AudienceObjectiveComponent,
    DmpAudienceModalComponent,
    RemoteFileModalComponent
  ],
  imports: [
    AudienceRoutingModule,
    SharedModule
  ],
  entryComponents: [
    AudienceRulesComponent,
    AudienceObjectiveComponent,
    DmpAudienceModalComponent,
    RemoteFileModalComponent
  ]
})
export class AudienceModule { }
