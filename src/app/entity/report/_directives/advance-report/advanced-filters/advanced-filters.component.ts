import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { AdvancedConstants } from '@app/entity/report/_constants/AdvancedConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { CheckBoxesObj, ModalObject, GridData, CommonReportingService } from '@app/entity/report/_services/common-reporting.service';
import { EntitySelectorComponent } from '../../shared/entity-selector/entity-selector.component';
import { ViewSelectionComponent } from '../../shared/view-selection/view-selection.component';
import { AdvancedUiService } from '@app/entity/report/_services/advanced-ui.service';

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.scss']
})
export class AdvancedFiltersComponent implements OnInit {
  advancedConst = AdvancedConstants;
  appConst = AppConstants;
  cmpConst = CampaignConstants;

  //check-boxes in filters
  positions: CheckBoxesObj[] = [];
  media: CheckBoxesObj[] = [];
  pricing: CheckBoxesObj[] = [];
  channels: CheckBoxesObj[] = [];

  country: ModalObject;
  state: ModalObject;
  city: ModalObject;
  aggregator: ModalObject;
  creative_size: ModalObject;
  advertiser: ModalObject;
  campaign: ModalObject;
  strategy: ModalObject;
  creative: ModalObject;

  adv_indicator: boolean = false;


  constructor(
    public dialog: MatDialog,
    private advancedService: AdvancedUiService,
    private alertService: AlertService,
    private commonReportingService: CommonReportingService
  ) { }

  ngOnInit() {
    this.initValues();
  }


  initValues() {
    // this.pricing = this.advancedService.getPricingObject();
    // this.channels = this.advancedService.getChannelObject();
    // this.positions = this.advancedService.getPositionObject();
    // this.media = this.advancedService.getCrMediaObject();
    this.pricing = this.advancedService.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.PRICING);
    this.channels = this.advancedService.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CHANNEL);
    this.positions = this.advancedService.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.POSITION);
    this.media = this.advancedService.getCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA);


    this.advertiser = this.advancedService.getModalEntities(AppConstants.ENTITY.ADVERTISER);
    this.campaign = this.advancedService.getModalEntities(AppConstants.ENTITY.CAMPAIGN);
    this.strategy = this.advancedService.getModalEntities(AppConstants.ENTITY.STRATEGY);
    this.country = this.advancedService.getModalEntities(AdvancedConstants.ENTITY.COUNTRY);
    this.state = this.advancedService.getModalEntities(AdvancedConstants.ENTITY.STATE);
    this.city = this.advancedService.getModalEntities(AdvancedConstants.ENTITY.CITY);
    this.aggregator = this.advancedService.getModalEntities(AppConstants.ENTITY.AGGREGATOR);
    this.creative = this.advancedService.getModalEntities(AppConstants.ENTITY.CREATIVE);
    this.creative_size = this.advancedService.getModalEntities(AdvancedConstants.ENTITY.CREATIVE_SIZE);
  }

  openModalForAdvCmpStr() {
    let dialogRef = this.dialog.open(EntitySelectorComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Select Strategy through Advertisers',
        entity: [AppConstants.ENTITY.ADVERTISER, AppConstants.ENTITY.CAMPAIGN, AppConstants.ENTITY.STRATEGY],
        header: ['Advertisers', 'Campaigns', 'Strategies'],
        l1_object: { ...this.advertiser },
        l2_object: { ...this.campaign },
        l3_object: { ...this.strategy }
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.advertiser = result.l1_object;
        this.campaign = result.l2_object;
        this.strategy = result.l3_object;
        this.advancedService.setAdvertiserGeographyFilter(true, this.advertiser, this.campaign, this.strategy, AdvancedConstants.FILTER_COLUMN.ADVERTISER, AdvancedConstants.FILTER_COLUMN.CAMPAIGN, AdvancedConstants.FILTER_COLUMN.STRATEGY); //set in service too
        // this.advancedService.setAdvCmpStrFilter(this.advertiser, this.campaign, this.strategy);
      }
    });
  }

  openModalForAgg() {
    let dialogRef = this.dialog.open(EntitySelectorComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Select Inventory Source',
        entity: [AppConstants.ENTITY.AGGREGATOR],
        header: ['Aggregators'],
        l1_object: { ...this.aggregator },
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.aggregator = result.l1_object;
        this.advancedService.setCreativeAggregatorFilter(AppConstants.ENTITY.AGGREGATOR, AdvancedConstants.FILTER_COLUMN.AGGREGATOR, this.aggregator);
        // this.advancedService.setAggregatorFilter(this.aggregator);
      }
    });

  }

  openModalForGeography() {
    let dialogRef = this.dialog.open(EntitySelectorComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Select Geography',
        entity: [AdvancedConstants.ENTITY.COUNTRY, AdvancedConstants.ENTITY.STATE, AdvancedConstants.ENTITY.CITY],
        header: ['Countries', 'States', 'Cities'],
        l1_object: { ...this.country },
        l2_object: { ...this.state },
        l3_object: { ...this.city },
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.country = result.l1_object;
        this.state = result.l2_object;
        this.city = result.l3_object;
        this.advancedService.setAdvertiserGeographyFilter(false, this.country, this.state, this.city, AdvancedConstants.FILTER_COLUMN.COUNTRY, AdvancedConstants.FILTER_COLUMN.STATE, AdvancedConstants.FILTER_COLUMN.CITY);
        // this.advancedService.setGeoFilter(this.country, this.state, this.city);
      }
    });
  }

  openModalForCreatives() {
    let dialogRef = this.dialog.open(EntitySelectorComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Select Creatives',
        entity: [AppConstants.ENTITY.ADVERTISER, AppConstants.ENTITY.CREATIVE],
        header: ['Advertisers', 'Creatives'],
        l1_object: { ...this.advertiser },
        l2_object: { ...this.creative },
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.creative = result.l2_object; //l1 is advertiser and l2 are creatives selection
        this.advancedService.setCreativeAggregatorFilter(this.appConst.ENTITY.CREATIVE, AdvancedConstants.FILTER_COLUMN.CREATIVE, this.creative);
        // this.advancedService.setCreativeFilter(this.creative);
      }
    });
  }

  openModalForCreativeSize() {
    let dialogRef = this.dialog.open(EntitySelectorComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Select Creative Size',
        entity: [AdvancedConstants.ENTITY.CREATIVE_SIZE],
        header: ['Sizes'],
        l1_object: { ...this.creative_size }
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.creative_size = result.l1_object;
        this.advancedService.setCreativeSizeFilter(this.creative_size);
      }
    });

  }

  changeCheckbox(type, obj: CheckBoxesObj) {
    obj.select = !obj.select;
    switch (type) {
      case AdvancedConstants.ENTITY.POSITIONS:
        this.advancedService.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.POSITION, this.positions);
        // this.advancedService.setPositionObject(this.positions);
        break;

      case AdvancedConstants.ENTITY.PRICING:
        this.advancedService.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.PRICING, this.pricing);
        // this.advancedService.setPricingObject(this.pricing);
        break;

      case AdvancedConstants.ENTITY.CHANNELS:
        this.advancedService.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CHANNEL, this.channels);
        // this.advancedService.setChannelObject(this.channels);
        break;

      //this is not used currently
      case AdvancedConstants.ENTITY.CREATIVE_MEDIA:
        this.advancedService.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CREATIVE_MEDIA, this.media);
        // this.advancedService.setCrMediaObject(this.media);
        break;
    }
  }


  resetSelection(entity) {
    this.alertService.success('Reset was successful.', false, true);
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);

    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER:
        this.advertiser = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.campaign = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.strategy = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.advancedService.setAdvertiserGeographyFilter(true, this.advertiser, this.campaign, this.strategy, AdvancedConstants.FILTER_COLUMN.ADVERTISER, AdvancedConstants.FILTER_COLUMN.CAMPAIGN, AdvancedConstants.FILTER_COLUMN.STRATEGY); //set in service too
        // this.advancedService.setAdvCmpStrFilter(this.advertiser, this.campaign, this.strategy); //set in service too
        break;

      case AppConstants.ENTITY.AGGREGATOR:
        this.aggregator = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.advancedService.setCreativeAggregatorFilter(AppConstants.ENTITY.AGGREGATOR, AdvancedConstants.FILTER_COLUMN.AGGREGATOR, this.aggregator);
        // this.advancedService.setAggregatorFilter(this.aggregator);
        break;

      case AdvancedConstants.ENTITY.GEOGRAPHY:
        this.country = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.state = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.city = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.advancedService.setAdvertiserGeographyFilter(false, this.country, this.state, this.city, AdvancedConstants.FILTER_COLUMN.COUNTRY, AdvancedConstants.FILTER_COLUMN.STATE, AdvancedConstants.FILTER_COLUMN.CITY);
        // this.advancedService.setGeoFilter(this.country, this.state, this.city);
        break;

      case AppConstants.ENTITY.CREATIVE:
        this.creative = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.advancedService.setCreativeAggregatorFilter(this.appConst.ENTITY.CREATIVE, AdvancedConstants.FILTER_COLUMN.CREATIVE, this.creative);
        // this.advancedService.setCreativeFilter(this.creative);
        break;

      case AdvancedConstants.ENTITY.CREATIVE_SIZE:
        this.creative_size = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        this.advancedService.setCreativeSizeFilter(this.creative_size);
        break;
    }
  }

  viewSelection(entity) {
    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER:
        this.openViewModal(AppConstants.ENTITY.ADVERTISER);
        break;

      case AppConstants.ENTITY.AGGREGATOR:
        this.openViewModal(AppConstants.ENTITY.AGGREGATOR);
        break;

      case AdvancedConstants.ENTITY.GEOGRAPHY:
        this.openViewModal(AdvancedConstants.ENTITY.GEOGRAPHY);
        break;

      case AppConstants.ENTITY.CREATIVE:
        this.openViewModal(AppConstants.ENTITY.CREATIVE);
        break;

      case AdvancedConstants.ENTITY.CREATIVE_SIZE:
        this.openViewModal(AdvancedConstants.ENTITY.CREATIVE_SIZE);
        break;
    }
  }


  openViewModal(entities: any) {
    let dialogRef = this.dialog.open(ViewSelectionComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Selection',
        entity: entities,
        type: AppConstants.REPORTS.ADVANCED

      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  resetCheckbox(type) {
    switch (type) {
      case AdvancedConstants.ENTITY.POSITIONS:
        this.positions.forEach(x => {
          x.select = true;
        });
        this.advancedService.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.POSITION, this.positions);
        // this.advancedService.setPositionObject(this.positions);
        break;

      case AdvancedConstants.ENTITY.PRICING:
        this.pricing.forEach(x => {
          x.select = true;
        });
        this.advancedService.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.PRICING, this.pricing);
        // this.advancedService.setPricingObject(this.pricing);
        break;

      case AdvancedConstants.ENTITY.CHANNELS:
        this.channels.forEach(x => {
          x.select = true;
        });
        this.advancedService.setCheckBoxObjectArray(AdvancedConstants.FILTER_COLUMN.CHANNEL, this.channels);
        // this.advancedService.setChannelObject(this.channels);
        break;

    }
  }


  checkForIndicator(entity): boolean {
    let l1: boolean = false;
    let l2: boolean = false;
    let l3: boolean = false;

    switch (entity) {
      case AppConstants.ENTITY.ADVERTISER:
        l1 = this.commonReportingService.getUiIndicatorForModals(this.advertiser);
        l2 = this.commonReportingService.getUiIndicatorForModals(this.campaign);
        l3 = this.commonReportingService.getUiIndicatorForModals(this.strategy);
        break;

      case AppConstants.ENTITY.AGGREGATOR:
        l1 = this.commonReportingService.getUiIndicatorForModals(this.aggregator);
        l2 = this.advancedService.getUiIndicatorForCheckBox(AdvancedConstants.ENTITY.POSITIONS)
        break;

      case AdvancedConstants.ENTITY.GEOGRAPHY:
        l1 = this.commonReportingService.getUiIndicatorForModals(this.country);
        l2 = this.commonReportingService.getUiIndicatorForModals(this.state);
        l3 = this.commonReportingService.getUiIndicatorForModals(this.city);
        break;

      case AppConstants.ENTITY.CREATIVE:
        l1 = this.commonReportingService.getUiIndicatorForModals(this.creative);
        l2 = this.commonReportingService.getUiIndicatorForModals(this.creative_size);
        break;

      case AdvancedConstants.ENTITY.CHANNELS:
        l1 = this.advancedService.getUiIndicatorForCheckBox(AdvancedConstants.ENTITY.CHANNELS);
        break;

      case AdvancedConstants.ENTITY.PRICING:
        l1 = this.advancedService.getUiIndicatorForCheckBox(AdvancedConstants.ENTITY.PRICING);
        break;
    }
    return (l1 || l2 || l3);
  }


}
