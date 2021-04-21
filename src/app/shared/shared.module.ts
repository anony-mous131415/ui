import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule, MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule,
  MatChipsModule
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { PixelTypePipe } from '@app/shared/_pipes/pixel-type.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateRangePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { BreadcrumbModule, IconsModule, ModalModule } from 'angular-bootstrap-md';
import { BlockUIModule } from 'ng-block-ui';
import { ClickOutsideModule } from 'ng-click-outside';
import { InputTrimModule } from 'ng2-trim-directive';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CdCreateComponent } from './_components/click-destinations/cd-create/cd-create.component';
import { CdListComponent } from './_components/click-destinations/cd-list/cd-list.component';
import { AdvStaticHeaderComponent } from './_directives/adv-static-header/adv-static-header.component';
import { AdvertiserAccessRoDisableDirective } from './_directives/advertiser-access-ro-disable/advertiser-access-ro-disable.directive';
import { AlertComponent } from './_directives/alert/alert.component';
import { BreadcrumbsComponent } from './_directives/breadcrumbs/breadcrumbs.component';
import { ChartComponent } from './_directives/chart/chart.component';
import { DateRangePickerComponent } from './_directives/date-range-picker/date-range-picker.component';
import { DisableDemoDirective } from './_directives/disable-demo/disable-demo.directive';
import { DisableRoDirective } from './_directives/disable-ro/disable-ro.directive';
import { DragDropDirective } from './_directives/drag-drop/drag-drop.directive';
import { EntityDetailsRowComponent } from './_directives/entity-details-row/entity-details-row.component';
import { EntitySelectorRadioComponent } from './_directives/entity-selector-radio/entity-selector-radio.component';
import { FormBrowseComponent } from './_directives/form-browse/form-browse.component';
import { FormCheckboxComponent } from './_directives/form-checkbox/form-checkbox.component';
import { FormInputComponent } from './_directives/form-input/form-input.component';
import { FormRadioInputComponent } from './_directives/form-radio-input/form-radio-input.component';
import { FormRadioComponent } from './_directives/form-radio/form-radio.component';
import { FormSelectComponent } from './_directives/form-select/form-select.component';
import { FormStatusComponent } from './_directives/form-status/form-status.component';
import { FormTextareaComponent } from './_directives/form-textarea/form-textarea.component';
import { GenericListComponent } from './_directives/generic-list/generic-list.component';
import { GenericUploaderComponent } from './_directives/generic-uploader/generic-uploader.component';
import { ImageGridComponent } from './_directives/image-grid/image-grid.component';
import { LicenseeSwitcherComponent } from './_directives/licensee-switcher/licensee-switcher.component';
import { ListComponent } from './_directives/list/list.component';
import { MenucrumbsComponent } from './_directives/menucrumbs/menucrumbs.component';
import { NavbarComponent } from './_directives/navbar/navbar.component';
import { SliderThreeWayComponent } from './_directives/slider-three-way/slider-three-way.component';
import { SliderComponent } from './_directives/slider/slider.component';
import { AuditDetailsModalComponent } from './_directives/_modals/audit-details-modal/audit-details-modal.component';
import { BulkUploadModalComponent } from './_directives/_modals/bulk-upload-modal/bulk-upload-modal.component';
import { CdConfirmationModalComponent } from './_directives/_modals/cd-confirmation-modal/cd-confirmation-modal.component';
import { CdSelectModalComponent } from './_directives/_modals/cd-select-modal/cd-select-modal.component';
import { CommonModalComponent } from './_directives/_modals/common-modal/common-modal.component';
import { ConfirmationModalComponent } from './_directives/_modals/confirmation-modal/confirmation-modal.component';
import { CpaTargetModalComponent } from './_directives/_modals/cpa-target-modal/cpa-target-modal.component';
import { ImageGridModalComponent } from './_directives/_modals/image-grid-modal/image-grid-modal.component';
import { StrategyQuickEditModalComponent } from './_directives/_modals/strategy-quick-edit-modal/strategy-quick-edit-modal.component';
import { EpochDateFormatPipe } from './_pipes/epoch-date-format.pipe';
import { NumFormatPipe } from './_pipes/num-format.pipe';
import { SafeHtmlPipe } from './_pipes/safe-html.pipe';
import { SafeUrlPipe } from './_pipes/safe-url.pipe';
import { SecondsToTimePipe } from './_pipes/seconds-to-time.pipe';
import { PixelFormModalComponent } from './_components/pixel/pixel-form-modal/pixel-form-modal.component';
import { ConversionTrackerCreateComponent } from './_components/pixel/conversion-tracker-create/conversion-tracker-create.component';
import { CdTextAreaComponent } from './_directives/cd-text-area/cd-text-area.component';


@NgModule({

  declarations: [
    // components
    CdListComponent,
    CdCreateComponent,

    // directives
    AdvStaticHeaderComponent,
    AdvertiserAccessRoDisableDirective,
    AlertComponent,
    BreadcrumbsComponent,
    ChartComponent,
    CommonModalComponent,
    ConfirmationModalComponent,
    DateRangePickerComponent,
    DisableDemoDirective,
    DisableRoDirective,
    DragDropDirective,
    EntityDetailsRowComponent,
    EntitySelectorRadioComponent,
    FormBrowseComponent,
    FormCheckboxComponent,
    FormInputComponent,
    FormRadioComponent,
    FormRadioInputComponent,
    FormSelectComponent,
    FormStatusComponent,
    FormTextareaComponent,
    GenericListComponent,
    GenericUploaderComponent,
    LicenseeSwitcherComponent,
    ListComponent,
    NavbarComponent,
    MenucrumbsComponent,
    SliderComponent,
    SliderThreeWayComponent,
    StrategyQuickEditModalComponent,
    CdSelectModalComponent,
    CdConfirmationModalComponent,
    BulkUploadModalComponent,
    CpaTargetModalComponent,
    AuditDetailsModalComponent,
    ConversionTrackerCreateComponent,
    PixelFormModalComponent,
    ImageGridComponent,
    ImageGridModalComponent,

    // pipes
    NumFormatPipe,
    EpochDateFormatPipe,
    SecondsToTimePipe,
    SafeHtmlPipe,
    DragDropDirective,
    SafeUrlPipe,
    PixelTypePipe,
    AuditDetailsModalComponent,
    CdTextAreaComponent,
  ],

  exports: [
    // components
    CdListComponent,
    CdCreateComponent,

    // directives
    AdvStaticHeaderComponent,
    AdvertiserAccessRoDisableDirective,
    AlertComponent,
    BreadcrumbsComponent,
    ChartComponent,
    CommonModalComponent,
    ConfirmationModalComponent,
    DateRangePickerComponent,
    DisableDemoDirective,
    DisableRoDirective,
    DragDropDirective,
    EntityDetailsRowComponent,
    EntitySelectorRadioComponent,
    FormBrowseComponent,
    FormCheckboxComponent,
    FormInputComponent,
    FormRadioComponent,
    FormRadioInputComponent,
    FormSelectComponent,
    FormStatusComponent,
    FormTextareaComponent,
    GenericListComponent,
    GenericUploaderComponent,
    LicenseeSwitcherComponent,
    ListComponent,
    NavbarComponent,
    MenucrumbsComponent,
    SliderComponent,
    SliderThreeWayComponent,
    StrategyQuickEditModalComponent,
    CdSelectModalComponent,
    CdConfirmationModalComponent,
    BulkUploadModalComponent,
    AuditDetailsModalComponent,
    CpaTargetModalComponent,
    ImageGridComponent,
    ImageGridModalComponent,

    ConversionTrackerCreateComponent,
    PixelFormModalComponent,

    // pipes
    NumFormatPipe,
    EpochDateFormatPipe,
    SecondsToTimePipe,
    SafeHtmlPipe,
    DragDropDirective,
    SafeUrlPipe,
    PixelTypePipe,

    // modules
    ModalModule,
    DateRangePickerModule,
    DateTimePickerModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BlockUIModule,
    ModalModule,
    NgxMatSelectSearchModule,
    ClickOutsideModule,
    InputTrimModule,
    BreadcrumbModule,
    IconsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatMenuModule,
    MatRadioModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatAutocompleteModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxMatSelectSearchModule,
    ClickOutsideModule,
    DateRangePickerModule,
    DateTimePickerModule,
    InputTrimModule,
    BreadcrumbModule,
    IconsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatMenuModule,
    MatExpansionModule,
    MatRadioModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    MatChipsModule,
    MatListModule,
    MatCardModule,
    MatProgressSpinnerModule,
    BlockUIModule.forRoot(),
    ModalModule.forRoot(),
  ],
  entryComponents: [
    EntitySelectorRadioComponent,
    StrategyQuickEditModalComponent,
    LicenseeSwitcherComponent,
    CommonModalComponent,
    ConfirmationModalComponent,
    CdSelectModalComponent,
    CdCreateComponent,
    CdConfirmationModalComponent,
    BulkUploadModalComponent,
    // AuditDetailsModalComponent,
    CpaTargetModalComponent,
    AuditDetailsModalComponent,
    PixelFormModalComponent,
    CpaTargetModalComponent,
    ImageGridModalComponent,
  ],
  providers: [
    NumFormatPipe,
    EpochDateFormatPipe,
    SecondsToTimePipe,
    SafeHtmlPipe,
    DragDropDirective,
    SafeUrlPipe,
    PixelTypePipe,
  ]
})
export class SharedModule { }
