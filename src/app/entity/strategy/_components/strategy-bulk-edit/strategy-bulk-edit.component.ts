import { Component, HostListener, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiResponseObjectStrategyDTO } from '@revxui/api-client-ts';
import { Observable, Subscription } from 'rxjs';
import { StrategyConstants } from '../../_constants/StrategyConstants';
import { StrategyBulkEditService, Helper } from '../../_services/strategy-bulk-edit.service';
import { MODE, StrategyService } from '../../_services/strategy.service';
import { StrategyEditBasicComponent } from '../../_directives/strategy-edit-basic/strategy-edit-basic.component';
import { StrategyEditInventoryComponent } from '../../_directives/strategy-edit-inventory/strategy-edit-inventory.component';
import { StrategyEditTargetingComponent } from '../../_directives/strategy-edit-targeting/strategy-edit-targeting.component';
import { StrategyEditBudgetComponent } from '../../_directives/strategy-edit-budget/strategy-edit-budget.component';
import { StrategyEditCreativesComponent } from '../../_directives/strategy-edit-creatives/strategy-edit-creatives.component';
import { StrategyObjectsService } from '../../_services/strategy-objects.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-strategy-bulk-edit',
  templateUrl: './strategy-bulk-edit.component.html',
  styleUrls: ['./strategy-bulk-edit.component.scss']
})
export class StrategyBulkEditComponent implements OnInit, AfterViewInit, OnDestroy {

  stepperIndexChangeSubscription: Subscription;

  SCONST = StrategyConstants;

  mode: number = MODE.CREATE;
  strategyID: number;
  campaignID: number;
  breadcrumbs: any = {};

  response: ApiResponseObjectStrategyDTO;

  openFromCampaignDetails: boolean;

  selStepperIndex = 0;
  advId: number;

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
    private strService: StrategyService,
    private strBulkEditService: StrategyBulkEditService,
    private objectService: StrategyObjectsService,
    private router: Router,
  ) { }

  ngOnInit() {
    // this.strService.setStrDetails(mockStrDto as any, false);
    // this.subscribeToEvents();
    // this.strService.resetMaxStepperVisited();
  }

  ngAfterViewInit() {
    let dto = this.objectService.getStrategyDto();
    this.strService.setStrDetails(dto as any, false, true, true);
    this.subscribeToEvents();
    this.strService.resetMaxStepperVisited();

  }


  subscribeToEvents() {
    this.strBulkEditService.strDetails.subscribe(data => {
      // console.log(data);
      this.openFromCampaignDetails = data.openFromCampaign;
      if (this.openFromCampaignDetails) {
        this.advId = data.advId;
      }
    });


    this.stepperIndexChangeSubscription = this.strService.onStepperIndexChange.subscribe(
      index => {
        this.setSelectedStepIndex(index);
      }
    );

  }


  ngOnDestroy() {
    Helper.ALLOWED = false;
    if (this.stepperIndexChangeSubscription) {
      this.stepperIndexChangeSubscription.unsubscribe();
    }
  }


  panelClick(targetStep: number, event?: any) {
    // event.stopPropagation();
    if (targetStep !== this.selStepperIndex) {
      switch (this.selStepperIndex) {
        case 0: this.basicDetails.validate(); break;
        case 1: this.inventoryDetails.validate(); break;
        case 2: this.targetingDetails.validate(); break;
        case 3: this.budgetDetails.validate(); break;
        case 4:
          if (this.openFromCampaignDetails) {
            this.creativeDetails.validate(); break;
          }
      }
    }

    this.setSelectedStepIndex(targetStep);
    const strDto = this.strService.getStrDetails();
    if (targetStep === 4) {
      this.strService.setStrDetails(strDto, false, true, true);
    } else if (targetStep !== 4) {
      this.strService.setStrDetails(strDto)
    }
  }


  setSelectedStepIndex(index: number) {
    this.selStepperIndex = index;
  }

  onStepChange(event) {
    this.selStepperIndex = event.selectedIndex;
  }

  isStepperLinear() {
    return (this.mode === MODE.EDIT);
  }


  onCancel(){
    this.router.navigate(['']);
  }


}
