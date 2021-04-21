import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { METRICS } from '@app/entity/report/_services/slicex-chart.service';
import { SlicexDatePickerService } from '@app/entity/report/_services/slicex-date-picker.service';
import { GridOptions, SlicexListService } from '@app/entity/report/_services/slicex-list.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { SlicexGridData } from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';

const MAX_ROWS = 150;

@Component({
  selector: 'app-slicex-grid',
  templateUrl: './slicex-grid.component.html',
  styleUrls: ['./slicex-grid.component.scss']
})
export class SlicexGridComponent implements OnInit, OnChanges, OnDestroy {

  dateRangeSubscription: Subscription;
  clearListSelectionSubscription: Subscription;

  @Input('gridOptions') gridOptions: GridOptions = null;
  @Input('compare') isCompareEnabled: boolean = false;
  @Output() export: EventEmitter<string> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  metrics = [
    {
      id: 'active',
      hover: 'Active',
      showROuser: true,
      showSelectOption: false,
      preSelected: false,
      title: 'STATUS',
      type: '',
      cell: (element: any) => `${element.active}`,
      tooltipValue: (element: any) => `${element.active}`
    },
    {
      id: 'name',
      hover: 'Name',
      showROuser: true,
      showSelectOption: false,
      preSelected: false,
      title: 'NAME',
      type: '',
      cell: (element: any) => `${element.name}`,
      tooltipValue: (element: any) => `${element.name}`
    },
    {
      id: 'id',
      hover: 'ID',
      showROuser: true,
      showSelectOption: false,
      preSelected: false,
      title: 'ID',
      type: '',
      cell: (element: any) => `${element.id}`,
      tooltipValue: (element: any) => `${element.id}`
    },
    {
      id: 'revenue',
      hover: 'The licensee revenue that is actually paid towards running the campaign',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'ADV SPEND',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.revenue,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.revenue,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'cost',
      hover: 'Media spend',
      showROuser: false,
      showSelectOption: true,
      preSelected: true,
      title: 'MEDIA SPEND',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.cost,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.cost,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'margin',
      hover: 'Margin',
      showROuser: false,
      showSelectOption: true,
      preSelected: true,
      title: 'MARGIN',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.margin,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.margin,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'marginPercentage',
      hover: 'Margin Percentage',
      showROuser: false,
      showSelectOption: true,
      preSelected: false,
      title: 'MARGIN %',
      type: AppConstants.NUMBER_TYPE_PERCENTAGE,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.marginPercentage,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.marginPercentage,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`
    },
    {
      id: 'ctr',
      hover: 'Click upon impressions X 100',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'CTR',
      type: AppConstants.NUMBER_TYPE_PERCENTAGE,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.ctr,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.ctr,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`
    },
    {
      id: 'ctc',
      hover: 'Conversions upon clicks/clicks X 100',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'CTC',
      type: AppConstants.NUMBER_TYPE_PERCENTAGE,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.ctc,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.ctc,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`
    },
    {
      id: 'impressions',
      hover: 'Impressions',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'IMP\'S',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.impressions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.impressions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'clicks',
      hover: 'Clicks',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'CLICKS',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.clicks,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.clicks,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'installs',
      hover: 'Installs',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'INSTALLS',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.installs,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.installs,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'impInstalls',
      hover: 'View Installs',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'VIEW INSTALLS',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.impInstalls,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.impInstalls,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'clickInstalls',
      hover: 'Click Installs',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'CLICK INSTALLS',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.clickInstalls,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.clickInstalls,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'conversions',
      hover: 'Conversions',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'CONV\'S',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.conversions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.conversions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'viewConversions',
      hover: 'View Conversions',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'VIEW CONV\'S',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.viewConversions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.viewConversions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'clickConversions',
      hover: 'Click Conversions',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'CLICK CONV\'S',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.clickConversions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.clickConversions,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'ecpm',
      hover: 'Effective cost per mille impression',
      showROuser: false,
      showSelectOption: true,
      preSelected: false,
      title: 'eCPM',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.ecpm,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.ecpm,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'ecpc',
      hover: 'Effective cost per click',
      showROuser: false,
      showSelectOption: true,
      preSelected: false,
      title: 'eCPC',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.ecpc,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.ecpc,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'ecpi',
      hover: 'Effective cost per install',
      showROuser: false,
      showSelectOption: true,
      preSelected: false,
      title: 'eCPI',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.ecpi,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.ecpi,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'ecpa',
      hover: 'Effective cost per aquisition',
      showROuser: false,
      showSelectOption: true,
      preSelected: false,
      title: 'eCPA',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.ecpa,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.ecpa,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'erpm',
      hover: 'Effective revenue per mille impression',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'eRPM',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.erpm,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.erpm,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'erpc',
      hover: 'Effective revenue per click',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'eRPC',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.erpc,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.erpc,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'erpi',
      hover: 'Effective revenue per install',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'eRPI',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.erpi,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.erpi,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'erpa',
      hover: 'Effective revenue per acquisition',
      showROuser: true,
      showSelectOption: true,
      preSelected: true,
      title: 'eRPA',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.erpa,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.erpa,
        AppConstants.NUMBER_TYPE_CURRENCY, element.currencyId)}`
    },
    {
      id: 'iti',
      hover: 'Impression to Install',
      showROuser: true,
      showSelectOption: true,
      preSelected: false,
      title: 'ITI',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.iti,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.iti,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },
    {
      id: 'impPerConversion',
      hover: 'Impression per Conversion',
      showROuser: true,
      showSelectOption: true,
      preSelected: false,
      title: 'IMP PER CONV',
      type: AppConstants.NUMBER_TYPE_NOTHING,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.impPerConversion,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.impPerConversion,
        AppConstants.NUMBER_TYPE_NOTHING, element.currencyId)}`
    },

    //REVX-629 
    {
      id: 'cvr',
      hover: '(total conversions * 1000*100)/total impressions',
      showROuser: true,
      showSelectOption: true,
      preSelected: false,
      title: 'CVR',
      type: AppConstants.NUMBER_TYPE_PERCENTAGE,
      cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.cvr,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`,
      tooltipValue: (element: any) => `${this.listService.formatNumber(element.cvr,
        AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`
    }

  ];
  columnsToDisplay: string[] = [];
  columnMap: Map<string, string> = new Map<string, string>();
  selection = null;

  // grid props
  gridData: MatTableDataSource<SlicexGridData>;
  listLen = 0;
  usrRole: string = null;

  selGridMetrics: string[] = [];
  ddMetrics = [];

  uaMetrics: any[] = ['revenue', 'cost', 'margin', 'ctr', 'ctc',
    'impressions', 'clicks', 'installs', 'impInstalls', 'clickInstalls',
    'conversions', 'ecpm', 'ecpi', 'ecpa', 'iti', 'erpm', 'erpi', 'erpa', 'marginPercentage', 'impPerConversion'];
  rtMetric: any[] = ['revenue', 'cost', 'margin', 'ctr', 'ctc', 'impressions',
    'clicks', 'conversions', 'ecpm', 'ecpa', 'erpm',
    'erpc', 'erpa', 'marginPercentage', 'impPerConversion'];
  uaList: any[] = [];
  rtList: any[] = [];
  otherList: any[] = ['clickConversions', 'viewConversions', 'ecpc'];

  toggleUASelection = false;
  toggleRTSelection = false;
  showLoading = false;
  showGrid = true;
  shouldResetGrid = true;

  constructor(
    private listService: SlicexListService,
    private commonService: CommonService,
    private drpService: SlicexDatePickerService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    const metricsToBeRemoved = ['campaign', 'strategy', 'active', 'id'];
    // remove active column from metrics
    this.metrics = this.metrics.filter(metric => metricsToBeRemoved.indexOf(metric.id) === -1);
    this.usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);

    Object.keys(this.filterMetricsBasedOnRole(this.metrics)).forEach((item: string) => {
      if (METRICS[item] !== null && METRICS[item] !== undefined) {
        this.ddMetrics.push({ id: item, title: METRICS[item].display_name });
      }
    });

    Object.keys(this.filterMetricsBasedOnRole(this.metrics)).forEach((item: string) => {
      if (this.uaMetrics.indexOf(item) !== -1 && METRICS[item] !== null && METRICS[item] !== undefined) {
        this.uaList.push({ id: item, title: METRICS[item].display_name });
      }
    });

    Object.keys(this.filterMetricsBasedOnRole(this.metrics)).forEach((item: string) => {
      if (this.rtMetric.indexOf(item) !== -1 && METRICS[item] !== null && METRICS[item] !== undefined) {
        this.rtList.push({ id: item, title: METRICS[item].display_name });
      }
    });

    this.dateRangeSubscription = this.drpService.dateRangeWatcher().subscribe(
      (param: any) => {
        setTimeout(() => {
          if (this.listService.getIsDateRangeValid()) {
            this.showLoading = true;
          } else {
            this.alertService.error(this.listService.getValidationMessage());
          }
        }, 100);
      }
    );

    this.clearListSelectionSubscription = this.listService.onClearEntitySelection.subscribe(
      param => {
        const dataIndex = this.gridOptions.data.findIndex(item => item.id === param.entityID);
        const index = this.gridOptions.selections.indexOf(param.entityID);
        index !== -1 ? this.gridOptions.selections.splice(index, 1) : null;
        dataIndex !== -1 ? this.selection.deselect(this.gridOptions.data[dataIndex]) : null;
        // console.log(this.selection.selected);
      }
    );
  }

  ngOnDestroy() {
    this.dateRangeSubscription.unsubscribe();
    this.clearListSelectionSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.listService.getIsDateRangeValid()) {
      if (changes.gridOptions && changes.gridOptions.currentValue) {
        // if (this.shouldResetGrid) {
        this.initGrid();
        // }
        this.showLoading = false;
      }

      if (changes.isCompareEnabled && changes.isCompareEnabled.currentValue) {
        this.showLoading = true;
      }
    } else {
      this.alertService.error(this.listService.getValidationMessage());
    }
  }

  get nameAlias() {
    return this.gridOptions ? this.gridOptions.entityDisplayName : null;
  }

  sortData(event) {
    // if (this.listLen >= MAX_ROWS) {
    if (event.direction === 'asc' || event.direction === 'desc') {
      this.shouldResetGrid = false;
      this.showLoading = true;
      this.listService.sortEntityData(this.gridOptions.entity, event.active, event.direction, false);
    }
    // }
  }

  onExportClicked() {
    this.export.emit(this.gridOptions.entity);
  }

  filterGridData(filterValue: string) {
    this.gridData.filter = filterValue.trim().toLowerCase();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.gridData.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.gridData.data.forEach(row => this.selection.select(row));
  }

  closeGrid() {
    if (this.listService.getIsDateRangeValid()) {
      this.shouldResetGrid = true;
      this.listService.onCloseEntityGridDetails(this.gridOptions.entity, this.selection.selected,
        this.isSelectionChanged(this.gridOptions.selections, this.selection.selected.map(item => item.id)));
    } else {
      this.alertService.error(this.listService.getValidationMessage());
    }
  }

  // REVX-273
  getAllMetric(): any[] {
    let allMetrics = [];
    const myMetricSet: Set<string> = new Set<string>();
    this.uaList.forEach(item => myMetricSet.add(item.id));
    this.rtList.forEach(item => myMetricSet.add(item.id));
    this.otherList.forEach(item => myMetricSet.add(item));
    allMetrics = Array.from(myMetricSet);
    return allMetrics;
  }

  // REVX-273
  onUASelected() {
    this.toggleRTSelection = false;
    this.toggleUASelection = !this.toggleUASelection;
    this.selGridMetrics = (this.toggleUASelection) ? this.uaList.map(item => item.id) : this.getAllMetric();
    this.columnsToDisplay = this.updateColumnsToDisplay(this.selGridMetrics, false, true);
  }

  // REVX-273
  onRTSelected() {
    this.toggleUASelection = false;
    this.toggleRTSelection = !this.toggleRTSelection;
    this.selGridMetrics = (this.toggleRTSelection) ? this.rtList.map(item => item.id) : this.getAllMetric();
    this.columnsToDisplay = this.updateColumnsToDisplay(this.selGridMetrics, false, true);
  }

  // REVX-273
  onCheckboxChange(event) {
    if (event.isUserInput) {
      this.toggleRTSelection = false;
      this.toggleUASelection = false;
      const selected: boolean = event.source.selected;
      this.selGridMetrics = selected ? this.addToSelectionList([event.source.value]) :
        this.removeFromSelectionList([event.source.value]);
      this.columnsToDisplay = this.updateColumnsToDisplay([event.source.value], true, selected);
    }
  }


  trackByIndex(index, item) {
    return index;
  }

  private isSelectionChanged(inpSelections, currSelections) {
    if (inpSelections.length !== currSelections.length) {
      return true;
    } else {
      return false;
    }
  }

  public displayForUserRole(metric) {
    if (this.usrRole !== 'ROLE_RO') {
      return true;
    } else {
      return metric.showROuser;
    }
  }

  private addToSelectionList(list) {
    const selections = [...this.selGridMetrics];
    list.forEach(item => {
      this.selGridMetrics.indexOf(item) === -1 ? selections.push(item) : null;
    });
    return selections;
  }

  private removeFromSelectionList(list) {
    const selections = [...this.selGridMetrics];
    list.forEach(item => {
      const index = selections.indexOf(item);
      selections.splice(index, 1);
    });
    return selections;
  }

  /**
   * REVX-273
   * @param selections - selections
   * @param isAdd - isAdd
   *
   * is isAdd = true and items not in columnToDisp => add to columnToDisp
   * is isAdd = false and items in columnToDisp => remove from columnToDisp
   */
  private updateColumnsToDisplay(selections: string[], isCheckBox: boolean, isAdd: boolean) {
    let colToDisplay = [];


    if (isCheckBox) {
      colToDisplay = [...this.columnsToDisplay];
      selections.forEach(sel => {
        const index = colToDisplay.indexOf(sel);
        if (isCheckBox && isAdd) {
          index === -1 ? colToDisplay.push(sel) : null;
        } else if (isCheckBox && !isAdd) {
          index !== -1 ? colToDisplay.splice(index, 1) : null;
        }
      });
    }

    // REVX-273
    else if (!isCheckBox) {
      let tempArr = [];
      tempArr = [...selections];
      tempArr.splice(0, 0, 'select', 'name');
      colToDisplay = [...tempArr];
    }

    colToDisplay.sort((col1, col2) => {

      const metric1 = METRICS[col1];
      const metric2 = METRICS[col2];

      if (metric2 === null || metric2 === undefined || metric1 === null || metric1 === undefined) {
        return 0;
      }

      return +metric1.order - +metric2.order;
    });

    return colToDisplay;
  }


  private initGrid() {
    this.showGrid = false;

    if (this.shouldResetGrid) {
      // chage the 'name' property to the current display metric
      const nameIndex = this.metrics.findIndex(item => item.id === 'name');
      const nameMetricObj = {
        ...this.metrics[nameIndex],
        hover: this.gridOptions.entityDisplayName,
        title: this.gridOptions.entityDisplayName.toUpperCase()
      };
      this.metrics.splice(nameIndex, 1, nameMetricObj);

      this.columnsToDisplay = this.getColumnsToDisplay(this.metrics,
        this.gridOptions.orderMetric, this.gridOptions.isCompareEnabled);

      const selMetrics = [...this.columnsToDisplay];
      selMetrics.splice(0, 2);

      this.selGridMetrics = selMetrics;
    }

    // RPIP-200
    // if (this.gridOptions.isCompareEnabled) {
    this.modifyDataForCompare(this.gridOptions.isCompareEnabled, this.gridOptions.orderMetric, this.gridOptions.orderMetricUnit);
    // }

    const preSelectedRows = this.preSelectGridRows(this.gridOptions.data, this.gridOptions.selections);
    this.selection = new SelectionModel<SlicexGridData>(true, []);
    preSelectedRows.forEach(item => {
      this.selection.select(item);
    });

    this.gridData = new MatTableDataSource(this.gridOptions.data);
    this.paginator.firstPage();
    this.gridData.paginator = this.paginator;

    this.sort.active = this.gridOptions.orderMetric;
    this.sort.direction = this.gridOptions.order === 'ASC' ? 'asc' : 'desc';

    this.gridData.sort = this.sort;

    this.listLen = this.gridOptions.data.length;
    this.showGrid = true;
  }


  private preSelectGridRows(gridData: SlicexGridData[], selections: number[]) {
    let selectedRows: SlicexGridData[] = [];
    if (selections !== null && selections !== undefined && selections.length !== 0) {
      selectedRows = gridData.filter((row: SlicexGridData) => {
        return (selections.indexOf(row.id) !== -1);
      });
    }

    if (this.selection !== null && this.selection !== undefined) {
      const ids: number[] = this.selection.selected.map(item => item.id);
      selectedRows.push(...gridData.filter((row: SlicexGridData) => {
        return (ids.indexOf(row.id) !== -1);
      }));
    }

    return selectedRows;
  }

  private modifyDataForCompare(isCompareEnabled, metric, metricUnit) {
    if (!isCompareEnabled) {
      const changeIdx = this.metrics.map(item => item.id).indexOf('change');
      if (changeIdx !== -1) {
        this.metrics.splice(changeIdx, 1);
      }
      const changePercentIdx = this.metrics.map(item => item.id).indexOf('per_change');
      if (changePercentIdx !== -1) {
        this.metrics.splice(changePercentIdx, 1);
      }
      this.columnsToDisplay = this.columnsToDisplay.filter(item => item !== 'change' && item !== 'per_change');
    } else {
      const colChange = {
        id: 'change',
        hover: 'Change',
        showROuser: true,
        showSelectOption: false,
        preSelected: false,
        title: 'CHANGE',
        type: metricUnit,
        cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.change, metricUnit, element.currencyId)}`,
        tooltipValue: (element: any) => `${this.listService.formatNumber(element.change, metricUnit, element.currencyId)}`,
      };
      const colChangePercent = {
        id: 'per_change',
        hover: 'Change Percentage',
        showROuser: true,
        showSelectOption: false,
        preSelected: false,
        title: '% CHANGE',
        type: AppConstants.NUMBER_TYPE_PERCENTAGE,
        cell: (element: any) => `${this.commonService.nrFormatWithCurrency(element.per_change,
          AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`,
        tooltipValue: (element: any) => `${this.listService.formatNumber(element.per_change,
          AppConstants.NUMBER_TYPE_PERCENTAGE, element.currencyId)}`,
      };
      const changeIdx = this.metrics.map(item => item.id).indexOf('change');
      const colChangeIdx = this.columnsToDisplay.indexOf('change');
      (changeIdx === -1) ? this.metrics.push(colChange) : this.metrics.splice(changeIdx, 1, colChange);
      if (colChangeIdx === -1) {
        this.columnsToDisplay.splice(2, 0, 'change');
      }

      const changePercentIdx = this.metrics.map(item => item.id).indexOf('per_change');
      const colChangePercentIdx = this.columnsToDisplay.indexOf('per_change');
      (changePercentIdx === -1) ? this.metrics.push(colChangePercent) : this.metrics.splice(changePercentIdx, 1, colChangePercent);
      if (colChangePercentIdx === -1) {
        this.columnsToDisplay.splice(3, 0, 'per_change');
      }

      this.gridOptions.data = this.gridOptions.data.map(item => {
        const diff = item[metric] - item.compareToValue;
        const diffFactor = diff === 0 ? 0 : diff < 0 ? -1 : 1;
        const perChange = this.computeChange(item.compareToValue, item[metric]);
        item['change'] = diff;
        item['per_change'] = perChange;
        item['diffFactor'] = diffFactor;
        return item;
      });
    }
  }


  private getColumnsToDisplay(metrics: any, orderMetric: string, isCompareEnabled: boolean) {
    const displayColumns: string[] = [];
    metrics.forEach(metric => {
      if (metric.id !== orderMetric && this.displayForUserRole(metric)) {
        displayColumns.push(metric.id);
      }
    });

    displayColumns.splice(1, 0, orderMetric);
    if (isCompareEnabled) {
      const changeIndex = displayColumns.indexOf('change');
      changeIndex !== -1 ? displayColumns.splice(changeIndex, 1) : null;

      const changePerIndex = displayColumns.indexOf('per_change');
      changePerIndex !== -1 ? displayColumns.splice(changePerIndex, 1) : null;

      displayColumns.splice(1, 0, 'per_change');
      displayColumns.splice(1, 0, 'change');
    }

    displayColumns.unshift('select');

    return displayColumns;
  }

  private filterMetricsBasedOnRole(metrics) {
    const metricObj = {};
    const metricsToBeRemoved = ['cost', 'ecpa', 'ecpc', 'ecpm', 'ecpi', 'margin', 'marginPercentage'];

    const usrRole = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (usrRole === 'ROLE_RO') {
      metrics.forEach(metric => {
        if (metricsToBeRemoved.indexOf(metric.id) === -1) {
          metricObj[metric.id] = METRICS[metric.id];
        }
      });
    } else {
      metrics.forEach(metric => {
        metricObj[metric.id] = METRICS[metric.id];
      });
    }
    return metricObj;
  }

  private computeChange(v1: number, v2: number) {
    if (!v1 || !v2 || v1 === 0 || v2 === 0) {
      return 0;
    }

    return ((v2 - v1) / v1) * 100;
  }

}
