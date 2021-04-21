import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { ReportRoutingModule } from './report-routing.module';
import { AdvancedComponent } from './_components/advance-report/advanced/advanced.component';
import { CommonResultComponent } from './_components/common-result/common-result.component';
import { ConversionComponent } from './_components/conversion-report/conversion/conversion.component';
import { SlicexComponent } from './_components/slicex/slicex.component';
import { VideoReportComponent } from './_components/video-report/video-report.component';
import { AdvancedFiltersComponent } from './_directives/advance-report/advanced-filters/advanced-filters.component';
import { AdvancedMetricsComponent } from './_directives/advance-report/advanced-metrics/advanced-metrics.component';
import { AdconDatePickerComponent } from './_directives/shared/adcon-date-picker/adcon-date-picker.component';
import { EntitySelectorComponent } from './_directives/shared/entity-selector/entity-selector.component';
import { GenericModalComponent } from './_directives/shared/generic-modal/generic-modal.component';
import { ReportBuilderComponent } from './_directives/shared/report-builder/report-builder.component';
import { ViewSelectionComponent } from './_directives/shared/view-selection/view-selection.component';
import { SlicexChartContainerComponent } from './_directives/slicex/slicex-chart-container/slicex-chart-container.component';
import { SlicexChartComponent } from './_directives/slicex/slicex-chart-container/slicex-chart/slicex-chart.component';
import { SlicexDatePickerComponent } from './_directives/slicex/slicex-date-picker/slicex-date-picker.component';
import { SlicexFilterModalComponent } from './_directives/slicex/slicex-filter/slicex-filter-modal/slicex-filter-modal.component';
import { SlicexBreadcrumComponent } from './_directives/slicex/slicex-filter/slicex-filter.component';
import { SlicexGridComponent } from './_directives/slicex/slicex-grid/slicex-grid.component';
import { SlicexListContainerComponent } from './_directives/slicex/slicex-list-container/slicex-list-container.component';
import { SlicexListComponent } from './_directives/slicex/slicex-list-container/slicex-list/slicex-list.component';
import { ReportBuilderDatePickerComponent } from './_directives/shared/report-builder-date-picker/report-builder-date-picker.component';
import { CommonResultModalComponent } from './_directives/_modals/common-result-modal/common-result-modal.component';

@NgModule({
  declarations: [
    AdvancedComponent,
    ConversionComponent,
    SlicexComponent,

    AdvancedFiltersComponent,
    AdvancedMetricsComponent,
    SlicexChartContainerComponent,
    SlicexChartComponent,
    SlicexListContainerComponent,
    SlicexListComponent,
    SlicexGridComponent,
    SlicexBreadcrumComponent,
    SlicexDatePickerComponent,

    AdconDatePickerComponent,
    EntitySelectorComponent,
    ViewSelectionComponent,

    SlicexFilterModalComponent,
    GenericModalComponent,
    CommonResultComponent,

    VideoReportComponent,
    ReportBuilderComponent,
    ReportBuilderDatePickerComponent,
    CommonResultModalComponent
  ],
  imports: [
    ReportRoutingModule,
    SharedModule
  ],
  entryComponents: [
    SlicexFilterModalComponent,
    EntitySelectorComponent,
    GenericModalComponent,
    ViewSelectionComponent,
    CommonResultModalComponent
  ]
})
export class ReportModule { }
