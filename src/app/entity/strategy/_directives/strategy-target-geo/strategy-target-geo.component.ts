import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DashboardControllerService, ApiResponseObjectDictionaryResponse, DashboardFilters, SearchRequest } from '@revxui/api-client-ts';
import { debounceTime } from 'rxjs/operators';
import { GridData } from '../../_services/strategy.service';

@Component({
  selector: 'app-strategy-target-geo',
  templateUrl: './strategy-target-geo.component.html',
  styleUrls: ['./strategy-target-geo.component.scss']
})
export class StrategyTargetGeoComponent implements OnInit, OnDestroy, OnChanges {

  autoCompleteSubscription: Subscription;

  @Input() identifier: string;
  @Input() title: string;
  @Input() entity: string;
  @Input() icon: string;
  @Input() actionBtnLabel: string;
  @Input() dependents: any[];
  @Input() targetList: any[];
  @Input() blockList: any[];
  @Input() targetAlltext: string;
  @Input() targetListHeader: string;
  @Input() blockListHeader: string;

  @Output() actionBtnClick: EventEmitter<string> = new EventEmitter();
  @Output() selectionRemoved: EventEmitter<any> = new EventEmitter();

  ctrl = new FormControl();
  options: any[] = [];
  optionsLength: number = this.options.length;

  selDependents = {};

  searchReq = {
    filters: []
  } as SearchRequest;

  constructor(
    private dashboardService: DashboardControllerService
  ) { }

  ngOnInit() {
    this.initComponent();
  }

  ngOnDestroy() {
    this.autoCompleteSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes !== null && changes !== undefined) {
      this.handleSelection(changes);
    }
  }

  onClickBrowse() {
    this.actionBtnClick.emit(this.identifier);
  }

  setSelection(entity, option) {
    this.selDependents[entity] = option.id;
  }

  addToTargetSelection(type: number, option?: any) {
    const ids = this.targetList.map(item => item.id);
    if (type === -1) {
      this.options.forEach(opt => {
        if (ids.indexOf(opt.id) === -1) {
          this.targetList.push(opt);
          ids.push(opt.id);
        }
        opt.targeted = true;
        opt.blocked = false;
      });
      this.removeFromBlockList(this.options.map(item => item.id));
    } else {
      if (ids.indexOf(option.id) === -1) {
        this.targetList.push(option);
      }
      option.targeted = true;
      option.blocked = false;
      this.removeFromBlockList([option.id]);
    }
  }

  addToBlockSelection(type: number, option?: any) {
    const ids = this.blockList.map(item => item.id);
    if (type === -1) {
      this.options.forEach(opt => {
        if (ids.indexOf(opt.id) === -1) {
          this.blockList.push(opt);
          ids.push(opt.id);
        }
        opt.blocked = true;
        opt.targeted = false;
      });
      this.removeFromTargetList(this.options.map(item => item.id));
    } else {
      if (ids.indexOf(option.id) === -1) {
        this.blockList.push(option);
      }
      option.blocked = true;
      option.targeted = false;
      this.removeFromTargetList([option.id]);
    }
  }

  removeFromTargetList(ids: number[]) {
    ids.forEach(id => {
      const index = this.targetList.findIndex(item => item.id === id);
      if (index !== -1) {
        this.targetList.splice(index, 1);
      }
    });
  }

  removeFromBlockList(ids: number[]) {
    ids.forEach(id => {
      const index = this.blockList.findIndex(item => item.id === id);
      if (index !== -1) {
        this.blockList.splice(index, 1);
      }
    });
  }

  removeItemFromSelection(data: GridData, type: number) {
    if (type === 1) {
      this.targetList = this.targetList.filter(item => item.id !== data.id);
    } else {
      this.blockList = this.blockList.filter(item => item.id !== data.id);
    }

    this.selectionRemoved.emit({ identifier: this.identifier, item: data, type: type });
  }

  private initComponent() {
    if (this.dependents !== null && this.dependents !== undefined) {
      this.dependents.forEach(dependent => {
        this.selDependents[dependent.entity] = '';
        dependent.options = [];
        dependent.optionsLength = 0;
        dependent.formControl = new FormControl();
        dependent.formControl.valueChanges
          .pipe(debounceTime(500))
          .subscribe(
            value => {
              if (value !== null && value !== undefined && value.trim().length > 1) {
                const searchReq = {
                  filters: [{
                    column: 'name',
                    value: value.trim()
                  } as DashboardFilters]
                } as SearchRequest;

                if (dependent.entity === 'STATE' && this.selDependents['COUNTRY'] !== null
                  && this.selDependents['COUNTRY'] !== undefined && this.selDependents['COUNTRY'] !== '') {
                  searchReq.filters.push({ column: 'countryId', value: this.selDependents['COUNTRY'] });
                }

                this.dashboardService.getDictionaryUsingPOST(dependent.entity, 0, 1000, false, null,
                  searchReq, 'name+').subscribe(
                    (response: ApiResponseObjectDictionaryResponse) => {
                      const list = response.respObject.data;
                      if (list !== null && list !== undefined && Array.isArray(list) && list.length > 0) {
                        dependent.options = list;
                        dependent.optionsLength = list.length;
                      } else {
                        dependent.options = [];
                        dependent.optionsLength = 0;
                      }
                    },
                    (error: any) => {
                      // console.log('[InventorySourceModalComponent] error', error);
                    }
                  );
              } else {
                dependent.options = [];
                dependent.optionsLength = 0;
                this.selDependents[dependent.entity] = '';
              }
            }
          );
      });
    }
    this.autoCompleteSubscription = this.ctrl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        value => {
          if (value !== null && value !== undefined && value.trim().length > 1) {
            this.getAutoCompleteResult(this.entity, value);
          }
        }
      );
  }

  private getAutoCompleteResult(entity: any, searchText: string) {
    if (searchText.trim().length > 1) {
      const searchReq = {
        filters: []
      } as SearchRequest;

      Object.keys(this.selDependents).forEach(key => {
        const col = (key === 'COUNTRY') ? 'countryId' : (key === 'STATE') ? 'stateId' : null;
        if (col !== null && (this.selDependents[key] !== null && this.selDependents[key] !== undefined && this.selDependents[key] !== '')) {
          searchReq.filters.push({ column: col, value: this.selDependents[key] } as DashboardFilters);
        }
      });

      searchReq.filters.push({ column: 'name', value: searchText.trim() } as DashboardFilters);

      this.dashboardService.getDetailDictionaryUsingPOST(entity, 0, 1000, false, null,
        searchReq, 'name+').subscribe(
          (response: ApiResponseObjectDictionaryResponse) => {
            const list = response.respObject.data;
            if (list !== null && list !== undefined && Array.isArray(list) && list.length > 0) {
              this.options = this.filterOptions(list);
              this.optionsLength = this.options.length;
            } else {
              this.resetOptions();
            }
          },
          (error: any) => {
            // console.log('[InventorySourceModalComponent] error', error);
          }
        );


    } else {
      this.resetOptions();
    }
  }

  private resetOptions() {
    this.options = [];
    this.optionsLength = this.options.length;
  }

  private filterOptions(list: any[]) {
    const targetIDs = this.targetList.map(item => item.id);
    const blockIDs = this.blockList.map(item => item.id);

    const entity = this.entity;

    function isTargeted(id: number) {
      return targetIDs.indexOf(id) !== -1 ? true : false;
    }

    function isBlocked(id: number) {
      return blockIDs.indexOf(id) !== -1 ? true : false;
    }

    function getName(item: any) {
      if (entity === 'COUNTRY') {
        return item.name;
      } else if (entity === 'STATE') {
        return `${item.countryName} - ${item.name}`;
      } else if (entity === 'CITY') {
        return `${item.countryName} - ${item.stateName} - ${item.name}`;
      } else {
        return item.name;
      }
    }

    return list.filter(item => item.active).map(item => {
      return {
        id: item.id,
        name: getName(item),
        targeted: isTargeted(item.id),
        blocked: isBlocked(item.id)
      };
    });
  }

  private handleSelection(changes: SimpleChanges) {
    Object.keys(changes).forEach(key => {
      if (key === 'blockList') {
        const blockList = changes[key].currentValue;
        if (blockList.length === 0) {
          this.options.map(item => {
            item.blocked = false;
          });
        } else {
          const ids = blockList.map(item => item.id);
          this.options.forEach(item => {
            if (ids.indexOf(item.id) !== -1) {
              item.blocked = true;
            } else {
              item.blocked = false;
            }
          });
        }
      } else if (key === 'targetList') {
        const targetList = changes[key].currentValue;
        if (targetList.length === 0) {
          this.options.forEach(item => {
            item.targeted = false;
          });
        } else {
          const ids = targetList.map(item => item.id);
          this.options.forEach(item => {
            if (ids.indexOf(item.id) !== -1) {
              item.targeted = true;
            } else {
              item.targeted = false;
            }
          });
        }
      }
    });
  }
}
