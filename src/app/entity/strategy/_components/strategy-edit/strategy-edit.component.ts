import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, ViewEncapsulation, ViewChild, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  StrategyControllerService,
  ApiResponseObjectStrategyDTO,
  DashboardControllerService,
  SearchRequest,
  StrategyDTO,
} from '@revxui/api-client-ts';
import { Subscription, Observable } from 'rxjs';
import { ComponentCanDeactivate } from '@app/shared/_guard/pending-changes.guard';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { MODE, StrategyService, SkadSettings, DEFAULT_SKAD_SETTINGS } from '../../_services/strategy.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { StrategyEditBasicComponent } from '../../_directives/strategy-edit-basic/strategy-edit-basic.component';
import { StrategyEditInventoryComponent } from '../../_directives/strategy-edit-inventory/strategy-edit-inventory.component';
import { StrategyEditTargetingComponent } from '../../_directives/strategy-edit-targeting/strategy-edit-targeting.component';
import { StrategyEditBudgetComponent } from '../../_directives/strategy-edit-budget/strategy-edit-budget.component';
import { StrategyEditCreativesComponent } from '../../_directives/strategy-edit-creatives/strategy-edit-creatives.component';
import { AlertService } from '@app/shared/_services/alert.service';

const ROUTE_PARAM_SID = 'sid';
const ROUTE_PARAM_CID = 'cid';

@Component({
  selector: 'app-strategy-edit',
  templateUrl: './strategy-edit.component.html',
  styleUrls: ['./strategy-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StrategyEditComponent implements OnInit, AfterViewInit, OnDestroy, ComponentCanDeactivate {

  stepperIndexChangeSubscription: Subscription;
  maxStepperIndexCreateFlowSub: Subscription;

  apiSkadParam: boolean;

  SCONST = StrategyConstants;

  MODECONST = MODE;
  mode: number;
  strategyID: number;
  campaignID: number;
  breadcrumbs: any = {};

  response: ApiResponseObjectStrategyDTO;

  selStepperIndex = 0;
  maxValidStep: number;

  //REVX-724 : skad-ui changes
  isCampaignSkad: boolean = false;

  @HostListener('window:beforeunload', [])
  canDeactivate(): Observable<boolean> | boolean {
    return this.strService.getIsSaved();
  }
  @ViewChild(StrategyEditBasicComponent, { static: true }) basicDetails: StrategyEditBasicComponent;
  @ViewChild(StrategyEditInventoryComponent, { static: true }) inventoryDetails: StrategyEditInventoryComponent;
  @ViewChild(StrategyEditTargetingComponent, { static: true }) targetingDetails: StrategyEditTargetingComponent;
  @ViewChild(StrategyEditBudgetComponent, { static: true }) budgetDetails: StrategyEditBudgetComponent;
  @ViewChild(StrategyEditCreativesComponent, { static: true }) creativeDetails: StrategyEditCreativesComponent;
  constructor(
    private route: ActivatedRoute,
    private strService: StrategyService,
    private strAPIService: StrategyControllerService,
    private dashboardService: DashboardControllerService,
    private entityService: EntitiesService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.maxValidStep = 0;
    this.strService.setIsSaved(false);
    this.strategyID = this.route.snapshot.params[ROUTE_PARAM_SID];
    this.campaignID = this.route.snapshot.params[ROUTE_PARAM_CID];
    this.mode = (this.strategyID) ? MODE.EDIT : MODE.CREATE;
    this.breadcrumbs = JSON.stringify({ 'strategyCreate': { id: '', name: '' } });
    if (this.mode === MODE.EDIT) {

      // this.http.get('http://localhost:10045/v2/api/strategies/' + this.strategyID, {
      //   headers: { token: this.strService.getAuthToken() }
      // })
      this.getDetailsById(this.strategyID);
      this.strAPIService.getStrategyByIdUsingGET(this.strategyID, false, this.strService.getReqID(), this.strService.getAuthToken())
        .subscribe(
          (resp: ApiResponseObjectStrategyDTO) => {
            this.response = resp;
            this.modCreativeDetails(resp.respObject);
            this.strService.setStrDetails(resp.respObject, true, false, true);
            this.subscribeToQueryParams();
            this.checkIfStrategyIsSkadForEditFlow(this.response.respObject.campaign.id, true);
          },
          (error: any) => {
            this.strService.clearStrategyDetails();
            this.strService.setIsSaved(true);
            setTimeout(() => {
              this.onCancel();
            }, 2000);
          }
        );

    } else {
      this.strService.clearStrategyDetails();

      // setup subscription
      this.maxStepperIndexCreateFlowSub = this.strService.maxStepperVisitedSubject.subscribe(maxStepper => {
        this.maxValidStep = maxStepper;
      });
      this.strService.resetMaxStepperVisited();

      // set campaign-details
      if (this.campaignID !== null && this.campaignID !== undefined) {
        this.checkIfStrategyIsSkadForEditFlow(this.campaignID, false);//REVX-724 : skad ui changes

        const cmpSearchReq: SearchRequest = {
          filters: [{ column: 'id', value: this.campaignID.toString() }]
        };
        this.dashboardService.getDetailDictionaryUsingPOST('CAMPAIGN', 0, 1, false, null, cmpSearchReq)
          .subscribe(
            cmpResponse => {
              // console.log('[CAMPAIGN]', cmpResponse);
              if (cmpResponse && cmpResponse.respObject && cmpResponse.respObject.data
                && Array.isArray(cmpResponse.respObject.data) && cmpResponse.respObject.data.length > 0) {
                const cmpData = cmpResponse.respObject.data[0];
                this.strService.setCampaignDetails(cmpData);
                if (cmpData) {
                  this.entityService.getDetailsById(cmpData.advertiserId, 'ADVERTISER')
                    .subscribe(
                      advResponse => {
                        // console.log('[ADVERTISER]', advResponse);
                        if (advResponse && advResponse.respObject) {
                          const advData = advResponse.respObject;
                          this.strService.setAdvertiserDetails(advData);
                        }
                      }
                    );
                }
              }
            }
          );
      }
    }

    this.stepperIndexChangeSubscription = this.strService.onStepperIndexChange.subscribe(
      index => this.setSelectedStepIndex(index)
    );
  }

  ngOnDestroy() {
    this.stepperIndexChangeSubscription.unsubscribe();

    if (this.maxStepperIndexCreateFlowSub) {
      this.maxStepperIndexCreateFlowSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.scrollToTop();
  }

  onStepChange(event) {
    this.selStepperIndex = event.selectedIndex;
  }

  isStepperLinear() {
    return (this.mode === MODE.EDIT);
  }

  onCancel() {
    if (this.mode === MODE.EDIT) {
      this.router.navigate(['strategy', 'details', this.strategyID]);
    } else {
      this.router.navigate(['strategy']);
    }
    // this.location.back();
  }

  private setSelectedStepIndex(index: number) {
    this.selStepperIndex = index;
  }

  private subscribeToQueryParams() {
    this.route.queryParams.subscribe(param => {
      const stepIndex = param['index'];
      if (stepIndex !== null && stepIndex !== undefined) {
        this.setSelectedStepIndex(+stepIndex);
      }
    });
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

  private scrollToTop() {
    const pageContainer = document.querySelector('.strategy-form-container');
    if (pageContainer !== null && pageContainer !== undefined) {
      setTimeout(() => { pageContainer.scrollIntoView({ behavior: 'smooth' }); }, 500);
    }
  }


  getDetailsById(id: number) {
    this.entityService.getDetailsById(id, AppConstants.ENTITY.STRATEGY).subscribe(response => {
      // console.log("response ", response);
      if (response && response.respObject && response.respObject.parent) {
        const breadcrumbsObj = this.entityService.createBCObject(response.respObject);
        this.breadcrumbs = JSON.stringify(breadcrumbsObj);
      }
    });

  }


  getName() {
    const dto = this.strService.getStrDetails();
    const nameOfStratefy = (dto && dto.name && dto.name.length > 0) ? (' - ' + dto.name) : '';
    const prepend = (this.mode === MODE.EDIT) ? 'Edit Strategy' : 'Create Strategy';
    return prepend + nameOfStratefy;
  }

  getDisabledStatus(stepNumber: number): boolean {
    if (this.mode === MODE.CREATE) {
      // const stepStatus: boolean = (this.maxValidStep < stepNumber) ? false : true;
      const stepStatus: boolean = (this.maxValidStep < stepNumber) ? true : false;
      return stepStatus;
    } else {
      return false;
    }
  }


  //REVX-588 strategy switching by click on panel
  panelClick(stepIdx: number, event?: any) {
    // event.stopPropagation();
    if (stepIdx !== this.selStepperIndex)
      switch (this.selStepperIndex) {
        case 0: this.basicDetails.validate(); break;
        case 1: this.inventoryDetails.validate(); break;
        case 2: this.targetingDetails.validate(); break;
        case 3: this.budgetDetails.validate(); break;
        case 4: this.creativeDetails.validate(); break;
      }
    this.setSelectedStepIndex(stepIdx);
    const strDto = this.strService.getStrDetails();
    if (strDto !== {}) {
      this.strService.setStrDetails(strDto);
    }
  }





  skadTrigger(event: { isCampChanged: boolean, cmpId: number }) {
    if (event && event.isCampChanged && event.cmpId >= 0) {
      this.checkIfStrategyIsSkadForEditFlow(event.cmpId, false);
    }
  }



  /**
   * 
   * @param cmpId campaign id
   * 
   * given campaign id , it checks if we are allowed to create skad strategy or not
   * 
   */
  checkSkadPrivledgeForCampaign(cmpId: number) {
    this.entityService.getSkadPrivledge('campaignId', cmpId).subscribe((resp) => {
      if (resp && resp.respObject && resp.respObject.allowed) {
        // this.strService.isStrategySkad.next(true);
        this.apiSkadParam = true;
        this.emitSkadSettings();
      } else {
        // this.strService.isStrategySkad.next(false);
        this.apiSkadParam = false;
        this.strService.resetCampaignDetails();
        this.showInfo();
      }
    }, (error: any) => {
      // this.strService.isStrategySkad.next(false);
      this.apiSkadParam = false;

      this.strService.resetCampaignDetails();
    });
  }


  /**
   * 
   * @param cmpId the campaign ID
   * 
   * this method is excuted in 2 scenarions
   * case1. we edit a strategy
   * case2. when we create new strategy from campaign details page directly
   * 
   */
  checkIfStrategyIsSkadForEditFlow(cmpId: number, isEditFlow?: boolean) {
    const cmpSearchReq: SearchRequest = {
      filters: [{ column: 'campaignId', value: cmpId.toString() }]
    };
    this.dashboardService.getDetailDictionaryUsingPOST('CAMPAIGN', 0, 1, false, null, cmpSearchReq).subscribe(resp => {
      let isSkadCampaign = (resp && resp.respObject && resp.respObject.data.length === 1 && resp.respObject.data[0].skadTarget) ? true : false;
      if (isSkadCampaign) {
        //case1 : in edit flow , if a strategy is SKAD it will remain skad only , we cannot change this
        //we need only the SKAD settings now , for hiding some ui stuff
        if (isEditFlow) {
          // this.strService.isStrategySkad.next(true);
          this.apiSkadParam = true;

          this.emitSkadSettings();
        }

        //case2 : if we are here while execution , it means that campaign is skad
        //now we need to check if(the campaign has skad privledge) , then only we can procees
        else {
          this.checkSkadPrivledgeForCampaign(resp.respObject.data[0].id);
        }
      }

      //if we are here while execution , it means that campaign is non-skad
      //now we need to default settings only to proceed (no need to check campaign privledge)
      else {
        // this.strService.isStrategySkad.next(false);
        this.apiSkadParam = false;
        this.strService.skadSettings.next(DEFAULT_SKAD_SETTINGS);
      }
    }, (error: any) => {
      // this.strService.isStrategySkad.next(false);
      this.apiSkadParam = false;

      this.strService.skadSettings.next(DEFAULT_SKAD_SETTINGS);
    });

  }


  //REVX-724 : skad-ui changes
  emitSkadSettings() {
    this.strAPIService.getSkadSettingsUsingGET().subscribe((resp) => {
      if (resp && resp.respObject) {
        let settings: SkadSettings = JSON.parse(resp.respObject);
        // console.log(settings);
        this.strService.skadSettings.next(settings);
      } else {
        this.strService.skadSettings.next(DEFAULT_SKAD_SETTINGS);
      }
    }, (error: any) => {
      this.strService.skadSettings.next(DEFAULT_SKAD_SETTINGS);
    });
  }


  showInfo() {
    this.alertService.warning(StrategyConstants.SKAD_CAMPAIGN_LIMIT_REACHED, false, true);
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 2500);

  }




}
