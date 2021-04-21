import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatCheckboxChange, MatDialog } from '@angular/material';
import { OptParams, ReportBuilderService } from '@app/entity/report/_services/report-builder.service';
import { EntitySelectorComponent } from '../entity-selector/entity-selector.component';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ViewSelectionComponent } from '@app/entity/report/_directives/shared/view-selection/view-selection.component';
import { AlertService } from '@app/shared/_services/alert.service';
export interface GridData {
  id: number;
  name: string;
  isNotSelected: boolean;
}
@Component({
  selector: 'app-report-builder',
  templateUrl: './report-builder.component.html',
  styleUrls: ['./report-builder.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportBuilderComponent implements OnInit, AfterViewInit {
  @Input('config') config: any;

  reportElementValueMap: Map<string, any> = new Map<string, any>();

  optionsMap: Map<string, OptParams> = new Map<string, OptParams>();

  constructor(
    private reportBuilderService: ReportBuilderService,
    public dialog: MatDialog,
    private alertService: AlertService,
  ) { }

  // ----------- life cycle hooks -----------
  ngOnInit() {
    this.subscribeToEvents();
    this.initReport(this.config);
  }

  ngAfterViewInit(): void {

  }

  // ----------- ui handler methods -----------
  onCheckboxChange(event: MatCheckboxChange, child: any, option: any) {
    if (event.checked) {
      const values = [...this.reportElementValueMap[child.id]];
      values.push(option.id);
      this.reportElementValueMap[child.id] = values;
    } else {
      let values = this.reportElementValueMap[child.id];
      values = values.filter(item => item !== option.id);
      this.reportElementValueMap[child.id] = values;
    }
    this.reportBuilderService.setValueMap(this.reportElementValueMap);
    this.reportBuilderService.actionChanged(child, event);
  }

  onActionButtonClick(action: any) {
    this.reportBuilderService.actionChanged(action);
  }

  onActionCheckboxChange(event: MatCheckboxChange, action: any) {
    this.reportBuilderService.actionChanged(action, event);
  }

  openEntitySelectorModal(action: any) {
    let dialogRef = this.dialog.open(EntitySelectorComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: action.title,
        entity: action.parent_entities.length > 0 ? [...action.parent_entities, ...action.entities] : action.entities,
        header: action.headers,
        l1_object: this.reportBuilderService.getEntitySelectorResult(action.id, 'l1_object'),
        l2_object: this.reportBuilderService.getEntitySelectorResult(action.id, 'l2_object'),
        l3_object: this.reportBuilderService.getEntitySelectorResult(action.id, 'l3_object'),
        type: this.reportBuilderService.getReportType()
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if(action.parent_entities.length === 1) {
          result.l1_object = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        } else if( action.parent_entities.length === 2) {
          result.l1_object = { map: new Map<number, boolean>(), set: new Set<GridData>() };
          result.l2_object = { map: new Map<number, boolean>(), set: new Set<GridData>() };
        }
        this.reportBuilderService.setEntitySelectorResult(action.id, result);
      }
    });
  }

  // ----------- subscription events -----------


  // ----------- private methods -----------
  initReport(config: any) {
    const params = this.reportBuilderService.buildReportParams(config);
    this.reportElementValueMap = params.valueMap;
    this.optionsMap = params.optionsMap;
  }

  subscribeToEvents() {

  }

  openViewModal(option) {
    this.dialog.open(ViewSelectionComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        title: 'Selection',
        entity: option.entities,
        type: AppConstants.REPORTS.REPORT_BUILDER,
        key: option.id
      },
      disableClose: false
    });
  }

  resetSelection(option) {
    this.alertService.success('Reset was successful.', false, true);
    const that = this;
    setTimeout(() => {
      that.alertService.clear(true);
    }, 1500);
    this.reportBuilderService.setEntitySelectorResult(option.id, { 
      l1_object: { map: new Map<number, boolean>(), set: new Set<GridData>() }, 
      l2_object: { map: new Map<number, boolean>(), set: new Set<GridData>() },
      l3_object: { map: new Map<number, boolean>(), set: new Set<GridData>() }}
    );
  }

  checkForIndicator(group) {
    let hide = true;
    const onlyEntitySelectorGroup = group.items.filter(item => item.type === 'ENTITY_SELECTOR');
    onlyEntitySelectorGroup.forEach(item => {
      const obj = this.reportBuilderService.valueMap[item.id];
      hide = this.checkModal(obj.l1_object) || this.checkModal(obj.l2_object) || this.checkModal(obj.l3_object);
    });
    const checkBoxGroup = group.items.filter(item => item.type === 'CHECKBOX');
    checkBoxGroup.forEach(item => {
      hide = hide || this.reportBuilderService.valueMap[item.id].length !== this.reportBuilderService.optionsMap[item.id].length;
    });
    return hide;
  }

  checkModal(inputObj): boolean {
    let result: boolean = true;
    const arrFromSet = Array.from(inputObj.set);
    const selectedArr = arrFromSet.filter(x => !x['isNotSelected']);
    if (selectedArr.length === inputObj.set.size) {
      result = false;
    }
    return result;
  }


}
