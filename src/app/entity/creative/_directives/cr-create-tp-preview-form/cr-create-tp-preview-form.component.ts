import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CreativeDTO } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CrAssociationModalComponent } from '../_modals/cr-association-modal/cr-association-modal.component';
import { CrCreateRespModalComponent } from '../_modals/cr-create-resp-modal/cr-create-resp-modal.component';
import { CrVerifyModalComponent } from '../_modals/cr-verify-modal/cr-verify-modal.component';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';

@Component({
  selector: 'app-cr-create-tp-preview-form',
  templateUrl: './cr-create-tp-preview-form.component.html',
  styleUrls: ['./cr-create-tp-preview-form.component.scss']
})
export class CrCreateTpPreviewFormComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  @Input() rawCreativesJSONStr: string;
  @Input() advertiserId: string;
  @Output() syncCreativeDTOs: EventEmitter<Array<CreativeDTO>> = new EventEmitter();

  creativeMockups: Array<CreativeDTO> = [];
  errorMsg: any = {
    verifyError: '',
    globalError: ''
  };

  clickVerified = false;
  appConst = AppConstants;
  formValidated = true;

  constructor(
    private modal: MatDialog,
    private crService: CreativeService,
    private menuService: MenucrumbsService,
  ) { }

  ngOnInit() {
    // this.creativeMockups = [{ "id": null, "name": "cr_adTag_6804_ec6fd612.html", "modifiedTime": null, "modifiedBy": null, "active": false, "creationTime": 1580726395, "createdBy": 1829, "size": { "height": null, "width": null }, "content": "<div id='jivoxPlayer'><iframe src='http://as.jivox.com/player/iabplayer.php?siteId=94e770cc0ab1cf&campaignId=31518&clickTagURL=|CLICK|http://www.clubmahindra.com/' width='300' height='250' frameborder='0' scrolling='no' marginwidth='0' marginheight='0'></iframe></div>", "clickDestination": { "id": 26096, "name": "Flipkart Native Andr Static Test", "modifiedTime": null, "modifiedBy": null, "active": false, "creationTime": null, "createdBy": null, "advertiserId": 6804, "licenseeId": 33, "clickUrl": "flipkart://fk.dl/de_wv_CL%7Csem_--https%3A%2F%2Fwww.flipkart.com~q~cmpid--_content_appretar_static_test20191220_revx", "webClickUrl": "flipkart://fk.dl/de_wv_CL%7Csem_--https%3A%2F%2Fwww.flipkart.com~q~cmpid--_content_appretar_static_test20191220_revx", "iosCLickUrl": "flipkart://fk.dl/de_wv_CL%7Csem_--https%3A%2F%2Fwww.flipkart.com~q~cmpid--_content_appretar_static_test20191220_revx", "androidClickUrl": "flipkart://fk.dl/de_wv_CL%7Csem_--https%3A%2F%2Fwww.flipkart.com~q~cmpid--_content_appretar_static_test20191220_revx", "serverTrackingUrl": "", "webS2sClickTrackingUrl": "", "iosS2sClickTrackingUrl": "", "androidS2sClickTrackingUrl": "", "webImpressionTracker": "", "iosImpressionTracker": "", "androidImpressionTracker": null, "campaignType": "UA", "dco": true, "refactored": false }, "type": "html", "contentType": null, "advertiser": { "id": 6804, "name": "Flipkart_App" }, "previewUrl": "http://origin.atomex.net/cr_temp/6804/adTag/cr_adTag_6804_ec6fd612.html", "urlPath": null, "videoAttributes": null, "nativeAsset": null, "errorMsg": null, "videoUploadType": null, "vastCreative": null, "thirdPartyAdTag": null, "dcoAd": false, "nativeAd": false, "dcoAttributes": null, "refactored": true }];
    if (this.rawCreativesJSONStr) {
      this.creativeMockups = JSON.parse(this.rawCreativesJSONStr);
      // console.log('this.creativeMockups ', this.creativeMockups);
    } else {
      // show error
      return;
    }
  }

  onGoBackClick() {
    this.syncCreativeDTOs.emit(null);
  }

  // On create Click
  onContinueClick() {
    this.blockUI.start(CreativeConstants.BLOCKUI_GEN_CREATIVES);

    this.validateForm();

    if (!this.formValidated) {
      this.blockUI.stop();
      return;
    }
    const creativeDTOList = this.creativeMockups;

    this.crService.saveCreatives(creativeDTOList).subscribe(resp => {
      // this.alertService.success(CreativeConstants.SUCCESS_MSG_CREATED);
      // console.log('response', resp);
      this.menuService.invalidateMenucrumbsData();
      this.openCreativeRespModal(resp.data);
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
    });
  }

  openCreativeAssociateModal() {

    this.modal.open(CrAssociationModalComponent, {
      width: '80%',
      data: { advertiserId: this.advertiserId, crList: [] },
      disableClose: true
    });
  }

  openCreativeRespModal(crList: Array<CreativeDTO>) {
    this.modal.open(CrCreateRespModalComponent, {
      width: '60%',
      data: { advertiserId: this.advertiserId, creativeList: crList },
      disableClose: true
    });
  }

  validateForm() {
    let validated = true;
    if (this.clickVerified === false) {
      validated = false;
      this.errorMsg.globalError = CreativeConstants.ERROR_MSG_CLICK_VERIFIED;
    }

    this.creativeMockups.forEach(creative => {
      if (!creative.size.height || !creative.size.width) {
        validated = false;
        this.errorMsg.globalError = CreativeConstants.ERROR_MSG_HTML_DIMENSION_MISSING;
      }
    });

    this.formValidated = validated;

  }

  openVerifyModal(creative: CreativeDTO) {
    const modalRef = this.modal.open(CrVerifyModalComponent, {
      width: '70%',
      data: creative,
      disableClose: true
    });

    modalRef.afterClosed().subscribe(resp => {
      // console.log('resp -- ', resp === true, resp === 'true');
      if (resp === true) {
        this.clickVerified = true;
        // console.log('this.clickVerified', this.clickVerified);
      }
    });
  }
}
