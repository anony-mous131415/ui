import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AudienceListComponent } from './_components/audience-list/audience-list.component';
import { AuthGuard } from '@app/shared/_services/auth-guard.service';
import { AudienceDetailsComponent } from './_components/audience-details/audience-details.component';
import { AudienceCreateComponent } from './_components/audience-create/audience-create.component';
import { PendingChangesGuard } from '@app/shared/_guard/pending-changes.guard';


const routes: Routes = [
  { path: '', component: AudienceListComponent, canActivate: [AuthGuard] },
  { path: 'details/:audId', component: AudienceDetailsComponent, canActivate: [AuthGuard] },
  { path: 'create', component: AudienceCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'create/:audId', component: AudienceCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'duplicate/:audDupId', component: AudienceCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AudienceRoutingModule { }
