import { Overlay } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitySelectorRadioComponent } from '@app/shared/_directives/entity-selector-radio/entity-selector-radio.component';
import { CdSelectModalComponent } from '@app/shared/_directives/_modals/cd-select-modal/cd-select-modal.component';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiListResponseMacro,
  BaseModel,
  CatalogControllerService,
  CreativeDetails,
  DashboardControllerService,
  SearchRequest
} from '@revxui/api-client-ts';

@Component({
  selector: 'app-cr-create-basic-form',
  templateUrl: './cr-create-basic-form.component.html',
  styleUrls: ['./cr-create-basic-form.component.scss']
})
export class CrCreateBasicFormComponent implements OnInit {

  @Input() formValidatedStr: string;

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onAssetTypeChange: EventEmitter<string> = new EventEmitter();
  // tslint:disable-next-line: no-output-on-prefix
  // @Output() onDcoSelect: EventEmitter<boolean> = new EventEmitter();
  @Output() syncBasicDetails: EventEmitter<any> = new EventEmitter();
  // @Input() formValidated: string;


  crConst = CreativeConstants;
  basicDetails = {} as CreativeDetails;

  formValidated = true;
  selectedAdv: BaseModel;
  editAdvAllowed = true;
  disableCDSelect = true;

  crObj = {
    // assetTypeOptions: [{ id: 1, title: 'Image, Video, Zip(HTML)' },
    // { id: 2, title: 'Vast URL' }, { id: 3, title: 'Third Party Ad Tag' }],
    assetTypeOptions: CreativeConstants.ASSETS_UI_OPTIONS,
    assetTypeSelected: CreativeConstants.ASSETS_UI_OPTIONS[0].id,
    templateSelectionOptions: CreativeConstants.TEMPLATE_UI_OPTIONS,
    templateSelected: CreativeConstants.TEMPLATE_UI_OPTIONS[0].id,
    templateOption: false,
    disableAssetType: false,
    creativeType: 'display'
  };

  isDCODisabled = true;
  alertMsg = false;

  public modalOption: NgbModalOptions = {};

  constructor(
    private modal: MatDialog, private overlay: Overlay,
    private readonly modalService: NgbModal,
    private route: ActivatedRoute,
    private dashboardService: DashboardControllerService,
    private catalogService: CatalogControllerService,
    private crSerive: CreativeService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      // console.log(params);
      const id = params.get('id');
      if (id && !isNaN(Number(id))) {
        this.editAdvAllowed = false;
        this.disableCDSelect = false;
        this.basicDetails.advertiserId = Number(id);
        this.setAdvertiser(id);
      }

    });
    // http:// origin.atomex.net/cr_temp/16X9.jpg
    this.basicDetails.isDCO = false;
  }

  setAdvertiser(id: string) {
    const advEntity: any = AppConstants.ENTITY.ADVERTISER
    this.dashboardService.getByIdUsingGET3(Number(id), advEntity).subscribe(advResp => {
      if (advResp && advResp.respObject) {
        this.selectedAdv = { id: advResp.respObject.id, name: advResp.respObject.name };
        this.checkAdvertiserDCOApplicability(advResp.respObject.id);
      }
    });

  }

  public assetTypeSelectHandler() {
    if (this.basicDetails.isDCO) {
      return;
    }
    let section: string;
    if ((this.crObj.assetTypeSelected) === 1) {
      section = CreativeConstants.UPLOAD_SECTION;
    } else if (this.crObj.assetTypeSelected === 2) {
      section = CreativeConstants.UPLOAD_TP_SECTION;
    }
    this.onAssetTypeChange.emit(section);
  }

  public dcoCheckHandler() {
    this.crObj.disableAssetType = (this.basicDetails.isDCO === true);
    // this.onDcoSelect.emit(this.basicDetails.isDCO);
    this.assetTypeSelectHandler();
  }

  // public syncHandler() {
  //   this.syncBasicDetails.emit(this.basicDetails);
  // }

  public validateBasicDetails() {

    this.formValidated = true;

    if (!this.basicDetails.advertiserId) {
      this.formValidated = false;
    }

    if (!this.basicDetails.clickDestination) {
      this.formValidated = false;
    }

    if (!this.basicDetails.name) {
      this.formValidated = false;
    }

    let assetAndTemplate = {
      assetTypeSelected: this.crObj.assetTypeSelected,
      templateSelected: this.crObj.templateSelected
    }

    let emittedObject = {
      basicDetails: this.basicDetails,
      assetAndTemplateDetails: assetAndTemplate,
      templateOption: this.crObj.templateOption
    }


    if (this.formValidated === true) {
      this.syncBasicDetails.emit(emittedObject);
    }
  }

  public showClickDestinationModal() {
    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    // TODO: Need to change the advertiser Id
    const modalRef = this.modal.open(CdSelectModalComponent, {
      width: '70%',
      data: { advertiserId: this.basicDetails.advertiserId, clickDestination: this.basicDetails.clickDestination },
      autoFocus: false,
      scrollStrategy
    });

    const clickDestinationModalSubscription = modalRef.componentInstance.syncSelectedCD.subscribe(clickDestination => {
      // console.log('final cd selected ', clickDestination);
      this.basicDetails.clickDestination = clickDestination;
      this.crSerive.setSelectedCD(clickDestination);
      clickDestinationModalSubscription.unsubscribe();
    });
  }


  openAdvModal() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    // this.modalOption.windowClass = 'modal-xl'
    this.modalOption.centered = true;

    const modal: NgbModalRef = this.modalService.open(EntitySelectorRadioComponent, this.modalOption);
    modal.componentInstance.entityType = 'ADVERTISER';

    modal.result.then((result) => {
      if (result) {
        this.selectedAdv = result;
        this.basicDetails.advertiserId = result.id;
        this.basicDetails.clickDestination = null;
        this.disableCDSelect = false;
        this.checkAdvertiserDCOApplicability(result.id);
      }
    });
  }

  private checkAdvertiserDCOApplicability(advId: any) {
    const searchFilter = {
      filters: []
    } as SearchRequest;
    this.catalogService.getMacrosUsingPOST(advId, 1, 10, false, null, searchFilter, 'id-').subscribe(
      (response: ApiListResponseMacro) => {
        if (response && response.data && response.data.length > 0) {
          this.isDCODisabled = false;
          this.alertMsg = false;
        } else {
          this.isDCODisabled = true;
          this.alertMsg = true;
          this.basicDetails.isDCO = false;
        }
      },
      (error: any) => {
        this.isDCODisabled = true;
        this.alertMsg = true;
        this.basicDetails.isDCO = false;
      }
    );
  }

  gotoAdv() {
    // goto  : advertiser/details/:id
    this.router.navigate(['advertiser', 'details', this.selectedAdv.id]);
  }

  DCOSelectHandler() {
    if(this.basicDetails.isDCO) {
      this.crObj.templateOption = false;
      this.crObj.assetTypeSelected = null;
    } else {
      this.crObj.assetTypeSelected = CreativeConstants.ASSETS_UI_OPTIONS[0].id
    }
    this.assetTypeSelectHandler();
  }
}
