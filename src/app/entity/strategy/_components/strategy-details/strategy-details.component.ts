import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { BlockUIConstants } from '@app/shared/_constants/BlockUIConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import {
  ApiResponseObjectStrategyDTO,
  CampaignDTO,
  DuplicateStrategyRequestDTO,
  StrategyControllerService,
  StrategyDTO
} from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { DuplicateStrategyModalComponent } from '../../_directives/_modals/duplicate-strategy-modal/duplicate-strategy-modal.component';
import { StrategyService } from '../../_services/strategy.service';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';

@Component({
  selector: 'app-strategy-details',
  templateUrl: './strategy-details.component.html',
  styleUrls: ['./strategy-details.component.scss']
})
export class StrategyDetailsComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;

  SCONST = StrategyConstants;

  entityId: string;
  column = 'strategyId';
  breadcrumbs: string;
  appConst = AppConstants;

  strategyDTO: StrategyDTO;
  campaignDTO: CampaignDTO;

  // header variables
  strName = '';
  strIsActive = false;

  summaryDetails: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService,
    private strService: StrategyService,
    private strAPIService: StrategyControllerService,
    private modal: MatDialog,
    private alertService: AlertService,
    private menuService: MenucrumbsService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      // console.log(params.get('id'))
      const id = params.get('id');
      if (!isNaN(Number(id))) {
        this.entityId = params.get('id');
        this.getDetailsById(Number(id));
      } else {
        this.router.navigate(['']);
      }
    });
    this.blockUI.stop();
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.STRATEGY).subscribe(response => {
      // console.log("response ", response);
      if (response && response.respObject && response.respObject.parent) {
        const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
        this.breadcrumbs = JSON.stringify(breadcrumbsObj);
      }
    });

    this.strAPIService.getStrategyByIdUsingGET(id, false, this.strService.getReqID(), this.strService.getAuthToken()).subscribe(
      (resp: ApiResponseObjectStrategyDTO) => {
        if (resp && resp.respObject) {
          this.strIsActive = resp.respObject.active;
          this.strName = resp.respObject.name;
          this.strategyDTO = resp.respObject;
          this.campaignDTO = resp.respObject.campaign;
          this.modCreativeDetails(this.strategyDTO);
          this.strService.setStrDetails(resp.respObject);

          // get summary details
          this.summaryDetails = this.strService.getStrReviewSummaryForDetailsPage();
        

          
          // console.log(this.summaryDetails);
          // console.log(JSON.stringify(this.summaryDetails));


        

        }
      }, (error: any) => {
        console.log(error);
      }
    );
  }

  onDuplicateStrategy(event) {
    // console.log(event);
    const modalRef = this.modal.open(DuplicateStrategyModalComponent, {
      width: '70%',
      maxHeight: '90vh',
      data: {
        strId: event.strId,
        title: this.SCONST.DUP_MODAL_TITLE,
        hint: this.SCONST.DUP_MODAL_TITLE_HINT,
        cmpStart: this.campaignDTO.startTime,
        cmpEnd: this.campaignDTO.endTime
      },
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          const duplicateStrategyRequestDTO: DuplicateStrategyRequestDTO = {
            name: result.strategyName,
            startTime: result.startTime,
            endTime: result.endTime,
            duplicateGeoTargeting: result.geoTargeting,
            duplicateBrowserTargeting: false,
            duplicateAudienceTargeting: true,
            duplicateDayPartTargeting: result.daypartTargeting,
            duplicateInventoryTargeting: result.inventoryTargeting,
            duplicateMobileTargeting: result.mobileTargeting,
            duplicatecreativesAttached: result.creativeAttached,
            duplicatePlacementTargeting: result.placementTargeting,
            duplicateConnectionTypeTargeting: result.connectionTypeTargeting,
            isNative: false
          };

          this.blockUI.start(BlockUIConstants.LOADING);

          // this.http.post('http://localhost:10045/v2/api/strategies/duplicate/' + this.entityId, duplicateStrategyRequestDTO, {
          //   headers: { token: this.strService.getAuthToken() }
          // }).subscribe(
          //   (resp: ApiResponseObjectStrategyDTO) => {
          //     this.showMessageAfterAction(resp, 'Duplicate strategy created successfully.',
          //       'Failed to create duplicate strategy. Please try again later.');
          //     this.blockUI.stop();
          //   },
          //   (error: any) => {
          //     this.showMessageAfterAction(error, 'Failed to create duplicate strategy. Please try again later.',
          //       'Failed to create duplicate strategy. Please try again later.');
          //     this.blockUI.stop();
          //   }
          // );

          this.strAPIService.duplicateStrategyUsingPOST(duplicateStrategyRequestDTO, +this.entityId, null,
            this.strService.getAuthToken()).subscribe(
              (resp: ApiResponseObjectStrategyDTO) => {
                this.menuService.invalidateMenucrumbsData();
                this.showMessageAfterAction(resp, 'Duplicate strategy created successfully.',
                  'Failed to create duplicate strategy. Please try again later.');
                this.blockUI.stop();
              },
              (error: any) => {
                this.showMessageAfterAction(error, 'Failed to create duplicate strategy. Please try again later.',
                  'Failed to create duplicate strategy. Please try again later.');
                this.blockUI.stop();
              }
            );
        }
      }
    );
  }

  goToPixel(pixelId) {
    const advId = this.strategyDTO.advertiser.id;
    this.router.navigate(['advertiser', advId, 'pixel', 'details', pixelId]);
  }

  private showMessageAfterAction(apiResp, successMsg, errorMsg) {
    if (apiResp && apiResp.respObject) {
      this.alertService.success(successMsg, false, true);
      const newStrId = apiResp.respObject.id;
      (newStrId) ? this.router.navigate(['strategy', 'details', newStrId]) : null;
    } else {
      this.alertService.error(errorMsg, false, true);
    }
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 5000);
  }

  private modCreativeDetails(strDetails: StrategyDTO) {
    if (strDetails !== null && strDetails !== undefined
      && strDetails.creatives !== null && strDetails.creatives !== undefined
      && Array.isArray(strDetails.creatives) && strDetails.creatives.length > 0) {
      strDetails.creatives.forEach((item: any) => {
        item.type = item.creativeType;
        item.urlPath = item.imageUrl;
      });
    }

  }

}
