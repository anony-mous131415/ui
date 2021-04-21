import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { StrategyRoutingModule } from './strategy-routing.module';
import { StrategyDetailsComponent } from './_components/strategy-details/strategy-details.component';
import { StrategyEditComponent } from './_components/strategy-edit/strategy-edit.component';
import { StrategyListComponent } from './_components/strategy-list/strategy-list.component';
import { StrategyEditBasicComponent } from './_directives/strategy-edit-basic/strategy-edit-basic.component';
import { StrategyEditBudgetComponent } from './_directives/strategy-edit-budget/strategy-edit-budget.component';
import { StrategyEditCreativesComponent } from './_directives/strategy-edit-creatives/strategy-edit-creatives.component';
import { StrategyEditInventoryComponent } from './_directives/strategy-edit-inventory/strategy-edit-inventory.component';
import { StrategyEditReviewComponent } from './_directives/strategy-edit-review/strategy-edit-review.component';
import { StrategyEditTargetingComponent } from './_directives/strategy-edit-targeting/strategy-edit-targeting.component';
import { StrategyStaticHeaderComponent } from './_directives/strategy-static-header/strategy-static-header.component';
import { StrategySummaryComponent } from './_directives/strategy-summary/strategy-summary.component';
import { StrategyTargetAllComponent } from './_directives/strategy-target-all/strategy-target-all.component';
import { StrategyTargetGeoComponent } from './_directives/strategy-target-geo/strategy-target-geo.component';
import { StrategyTargetSpecificComponent } from './_directives/strategy-target-specific/strategy-target-specific.component';
import { StrategyTargetComponent } from './_directives/strategy-target/strategy-target.component';
import { AppTargetModalComponent } from './_directives/_modals/app-target-modal/app-target-modal.component';
import { DuplicateStrategyModalComponent } from './_directives/_modals/duplicate-strategy-modal/duplicate-strategy-modal.component';
import { OsVersionModalComponent } from './_directives/_modals/os-version-modal/os-version-modal.component';
import { TargetBlockAudienceModalComponent } from './_directives/_modals/target-block-audience-modal/target-block-audience-modal.component';
import { TargetBlockModalComponent } from './_directives/_modals/target-block-modal/target-block-modal.component';
import { Tbm2Component } from './_directives/_modals/tbm2/tbm2.component';
import { TargetingModalComponent } from './_directives/_modals/targeting-modal/targeting-modal.component';
import { StrategyBulkEditComponent } from './_components/strategy-bulk-edit/strategy-bulk-edit.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BulkEditActivityLogComponent } from './_directives/_modals/bulk-edit-activity-log/bulk-edit-activity-log.component';
import { BulkEditReviewRequestResponseComponent } from './_directives/_modals/bulk-edit-review-request-response/bulk-edit-review-request-response.component';

@NgModule({
  declarations: [
    StrategyDetailsComponent,
    StrategyEditComponent,
    StrategyListComponent,

    StrategyEditBasicComponent,
    StrategyEditBudgetComponent,
    StrategyEditTargetingComponent,
    StrategyEditInventoryComponent,
    StrategyEditCreativesComponent,
    StrategyEditReviewComponent,
    StrategyStaticHeaderComponent,
    StrategySummaryComponent,
    StrategyTargetComponent,
    StrategyTargetAllComponent,
    StrategyTargetGeoComponent,
    StrategyTargetSpecificComponent,

    AppTargetModalComponent,
    DuplicateStrategyModalComponent,
    OsVersionModalComponent,
    TargetBlockAudienceModalComponent,
    TargetBlockModalComponent,
    Tbm2Component,
    TargetingModalComponent,
    StrategyBulkEditComponent,
    BulkEditActivityLogComponent,
    BulkEditReviewRequestResponseComponent,
  ],
  imports: [
    StrategyRoutingModule,
    SharedModule,
    MatButtonToggleModule
  ],
  exports:[
    BulkEditActivityLogComponent
  ],

  entryComponents: [
    AppTargetModalComponent,
    DuplicateStrategyModalComponent,
    OsVersionModalComponent,
    TargetBlockAudienceModalComponent,
    TargetBlockModalComponent,
    Tbm2Component,
    TargetingModalComponent,
    BulkEditActivityLogComponent,
    BulkEditReviewRequestResponseComponent
  ]
})
export class StrategyModule { }
