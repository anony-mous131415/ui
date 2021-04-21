import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SlicexFilterModalComponent } from './slicex-filter-modal/slicex-filter-modal.component';
import { SlicexChartService } from '@app/entity/report/_services/slicex-chart.service';
import { SlicexListService } from '@app/entity/report/_services/slicex-list.service';
import { AlertService } from '@app/shared/_services/alert.service';

const MAX_FILTER_VALUES_TO_DISPLAY = 2;

@Component({
  selector: 'app-slicex-filter',
  templateUrl: './slicex-filter.component.html',
  styleUrls: ['./slicex-filter.component.scss']
})
export class SlicexBreadcrumComponent implements OnInit {
  @Input('bc') breadcrumbs = null;
  @Output() clear: EventEmitter<{ entity: string, entityID: number, entityValue: string }> = new EventEmitter();

  remainingFilterCount = {};
  constructor(
    private modal: MatDialog,
    private chartService: SlicexChartService,
    private listService: SlicexListService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
  }

  get bc() {
    return this.breadcrumbs;
  }

  get bcEntities() {
    return (this.breadcrumbs === null) ? [] : Object.keys(this.breadcrumbs);
  }

  checkArrow(index, entity) {
    if (this.bc[entity].values.length === 0 || index === this.bcEntities.length - 1) {
      return true;
    } else {
      return false;
    }
  }

  getBCList(entity: string, list: any[]) {
    const size = list.length;
    if (size <= MAX_FILTER_VALUES_TO_DISPLAY) {
      this.remainingFilterCount[entity] = null;
      return list;
    } else {
      const rmList = size - MAX_FILTER_VALUES_TO_DISPLAY;
      this.remainingFilterCount[entity] = rmList;
      return list.slice(0, MAX_FILTER_VALUES_TO_DISPLAY);
    }
  }

  clearSelection(inpEntity: string, inpEntityID: number, inpEntityValue: string) {
    if (this.listService.getIsDateRangeValid()) {
      this.clear.emit({
        entity: inpEntity,
        entityID: inpEntityID,
        entityValue: inpEntityValue
      });
    } else {
      this.alertService.error(this.listService.getValidationMessage());
    }

  }


  clearAll() {
    const filteredList = [];
    Object.keys(this.breadcrumbs).forEach(key => {
      filteredList.push(...this.breadcrumbs[key].values.map(item => {
        return { id: item.id, entity: key };
      }));
    });
    this.handleFilterClear({ remainingList: {}, removedList: filteredList });
  }

  showFilterModal(entity: string) {
    const filters = {};
    Object.keys(this.breadcrumbs).forEach(key => filters[key] = {
      name: this.breadcrumbs[key].name,
      values: Object.assign([], this.breadcrumbs[key].values)
    });

    const modalRef = this.modal.open(SlicexFilterModalComponent, {
      width: '50%',
      data: filters
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.handleFilterClear(result);
        }
      }
    );
  }

  private handleFilterClear(result) {
    if (this.listService.getIsDateRangeValid()) {
      this.breadcrumbs = result;
      this.chartService.updateFilters(result.remainingList);
      this.listService.updateFilters(result.remainingList);
      result.removedList.forEach(item => {
        this.listService.onEntitySelectionClear(item.entity, item.id);
      });
    } else {
      this.alertService.error(this.listService.getValidationMessage());
    }
  }

}
