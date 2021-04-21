import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { CreativeRoutingModule } from './creative-routing.module';
import { CreativeCreateComponent } from './_components/creative-create/creative-create.component';
import { CreativeDetailsComponent } from './_components/creative-details/creative-details.component';
import { CreativeEditComponent } from './_components/creative-edit/creative-edit.component';
import { CreativeListComponent } from './_components/creative-list/creative-list.component';
import { CrCreateBasicFormComponent } from './_directives/cr-create-basic-form/cr-create-basic-form.component';
import { CrCreateDcoPreviewFormComponent } from './_directives/cr-create-dco-preview-form/cr-create-dco-preview-form.component';
import { CrCreateDcoUploadFormComponent } from './_directives/cr-create-dco-upload-form/cr-create-dco-upload-form.component';
import { CrCreatePreviewFormComponent } from './_directives/cr-create-preview-form/cr-create-preview-form.component';
import { CrCreateTpFormComponent } from './_directives/cr-create-tp-form/cr-create-tp-form.component';
import { CrCreateTpPreviewFormComponent } from './_directives/cr-create-tp-preview-form/cr-create-tp-preview-form.component';
import { CrCreateUploadFormComponent } from './_directives/cr-create-upload-form/cr-create-upload-form.component';
import { CrCreateVastFormComponent } from './_directives/cr-create-vast-form/cr-create-vast-form.component';
import { CrNativeFormComponent } from './_directives/cr-native-form/cr-native-form.component';
import { CrPreviewCardComponent } from './_directives/cr-preview-card/cr-preview-card.component';
import { CrAssociationModalComponent } from './_directives/_modals/cr-association-modal/cr-association-modal.component';
import { CrCreateRespModalComponent } from './_directives/_modals/cr-create-resp-modal/cr-create-resp-modal.component';
import { CrNativeFormModalComponent } from './_directives/_modals/cr-native-form-modal/cr-native-form-modal.component';
import { CrPreviewModalComponent } from './_directives/_modals/cr-preview-modal/cr-preview-modal.component';
import { CrVerifyModalComponent } from './_directives/_modals/cr-verify-modal/cr-verify-modal.component';
import { StrCrAssociationModalComponent } from './_directives/_modals/str-cr-association-modal/str-cr-association-modal.component';
import { CrTemplateSelectionComponent } from './_directives/cr-template-selection/cr-template-selection.component';
import { CrTemplateCustomizationComponent } from './_directives/cr-template-customization/cr-template-customization.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { CrDropDownComponent } from './_directives/cr-drop-down/cr-drop-down.component';
import { LogoFallbackUploadModalComponent } from '@app/shared/_components/pixel/logo-fallback-upload-modal/logo-fallback-upload-modal.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CrCreateUpdateThemeModalComponent } from './_directives/_modals/cr-create-update-theme-modal/cr-create-update-theme-modal.component';


@NgModule({
  declarations: [
    CreativeCreateComponent,
    CreativeListComponent,
    CreativeEditComponent,
    CreativeDetailsComponent,

    CrCreateBasicFormComponent,
    CrCreateDcoPreviewFormComponent,
    CrCreateDcoUploadFormComponent,
    CrCreatePreviewFormComponent,
    CrCreateTpFormComponent,
    CrCreateTpPreviewFormComponent,
    CrCreateUploadFormComponent,
    CrCreateVastFormComponent,
    CrNativeFormComponent,
    CrPreviewCardComponent,

    StrCrAssociationModalComponent,
    CrAssociationModalComponent,
    CrCreateRespModalComponent,
    CrNativeFormModalComponent,
    CrPreviewModalComponent,
    CrVerifyModalComponent,
    CrTemplateSelectionComponent,
    CrTemplateCustomizationComponent,
    CrDropDownComponent,
    LogoFallbackUploadModalComponent,
    CrCreateUpdateThemeModalComponent
  ],
  imports: [
    CreativeRoutingModule,
    SharedModule,
    ColorPickerModule,
    MatDialogModule
  ],
  exports: [
    CreativeListComponent,
    CreativeCreateComponent,
    CrTemplateCustomizationComponent
  ],
  entryComponents: [
    StrCrAssociationModalComponent,
    CrAssociationModalComponent,
    CrCreateRespModalComponent,
    CrNativeFormModalComponent,
    CrPreviewModalComponent,
    CrVerifyModalComponent,
    LogoFallbackUploadModalComponent,
    CrTemplateCustomizationComponent,
    CrCreateUpdateThemeModalComponent
  ]
})
export class CreativeModule { }
