import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/_services/auth-guard.service';
import { SlicexComponent } from './_components/slicex/slicex.component';
import { AdvancedComponent } from './_components/advance-report/advanced/advanced.component';
import { ConversionComponent } from './_components/conversion-report/conversion/conversion.component';
import { CommonResultComponent } from './_components/common-result/common-result.component';
import { VideoReportComponent } from './_components/video-report/video-report.component';


const routes: Routes = [
  { path: 'slicex', component: SlicexComponent, canActivate: [AuthGuard] },

  { path: 'conversion', component: ConversionComponent, canActivate: [AuthGuard] },
  { path: 'advanced', component: AdvancedComponent, canActivate: [AuthGuard] },

  { path: 'video', component: VideoReportComponent, canActivate: [AuthGuard] },

  { path: 'advanced/result', component: CommonResultComponent, canActivate: [AuthGuard] },
  { path: 'conversion/result', component: CommonResultComponent, canActivate: [AuthGuard] },
  { path: 'video/result', component: CommonResultComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
