import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/_services/auth-guard.service';
import { PendingChangesGuard } from '@app/shared/_guard/pending-changes.guard';
import { CampaignListComponent } from './_components/campaign-list/campaign-list.component';
import { CampaignCreateComponent } from './_components/campaign-create/campaign-create.component';
import { CampaignDetailsComponent } from './_components/campaign-details/campaign-details.component';


const routes: Routes = [
  { path: '', component: CampaignListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'create/:cid', component: CampaignCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'details/:cid', component: CampaignDetailsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule { }
