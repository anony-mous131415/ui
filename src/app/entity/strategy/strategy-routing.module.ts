import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StrategyListComponent } from './_components/strategy-list/strategy-list.component';
import { AuthGuard } from '@app/shared/_services/auth-guard.service';
import { StrategyDetailsComponent } from './_components/strategy-details/strategy-details.component';
import { PendingChangesGuard } from '@app/shared/_guard/pending-changes.guard';
import { StrategyEditComponent } from './_components/strategy-edit/strategy-edit.component';
import { StrategyBulkEditComponent } from './_components/strategy-bulk-edit/strategy-bulk-edit.component';
import { StrategyBulkEditGaurd } from '@app/shared/_guard/strategy-bulk-edit.gaurd';


const routes: Routes = [
  { path: '', component: StrategyListComponent, canActivate: [AuthGuard] },
  { path: 'details/:id', component: StrategyDetailsComponent, canActivate: [AuthGuard] },
  { path: 'create', component: StrategyEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'edit/:sid', component: StrategyEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  { path: ':cid/create', component: StrategyEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },

  //REVX-371 : strategy bulk edit
  { path: 'bulkEdit', component: StrategyBulkEditComponent, canActivate: [StrategyBulkEditGaurd] },


];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StrategyRoutingModule { }
