import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreativeListComponent } from './_components/creative-list/creative-list.component';
import { CreativeCreateComponent } from './_components/creative-create/creative-create.component';
import { CreativeDetailsComponent } from './_components/creative-details/creative-details.component';
import { CreativeEditComponent } from './_components/creative-edit/creative-edit.component';
import { AuthGuard } from '@app/shared/_services/auth-guard.service';
import { PendingChangesGuard } from '@app/shared/_guard/pending-changes.guard';


const routes: Routes = [
  { path: '', component: CreativeListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CreativeCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'details/:cid', component: CreativeDetailsComponent, canActivate: [AuthGuard] },
  { path: 'edit/:cid', component: CreativeEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreativeRoutingModule { }
