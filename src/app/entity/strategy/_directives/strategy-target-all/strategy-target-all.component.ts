import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiResponseObjectDictionaryResponse, DashboardControllerService, DashboardFilters, SearchRequest } from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GridData } from '../../_services/strategy.service';

@Component({
  selector: 'app-strategy-target-all',
  templateUrl: './strategy-target-all.component.html',
  styleUrls: ['./strategy-target-all.component.scss']
})
export class StrategyTargetAllComponent implements OnInit, OnChanges, OnDestroy {

  autoCompleteSubscription: Subscription;

  @Input() identifier: string;
  @Input() entity: string;
  @Input() icon: string;
  @Input() actionBtnLabel: string;
  @Input() targetOptions: any[];
  @Input() selectionList: any[];
  @Input() targetAlltext: string;
  @Input() defaultToTarget: boolean;

  @Output() actionBtnClick: EventEmitter<any> = new EventEmitter();
  @Output() selectionRemoved: EventEmitter<any> = new EventEmitter();
  @Output() targetOptionChange: EventEmitter<any> = new EventEmitter();

  selTargetOption: any;
  showTargetAllText = false;
  disableInput = false;

  constructor(
    private dashboardService: DashboardControllerService
  ) { }

  ctrl = new FormControl();
  options: any[] = [];
  optionsLength: number = this.options.length;

  ngOnInit() {
    this.autoCompleteSubscription = this.ctrl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        value => {
          if (value !== null && value !== undefined && value.trim().length > 1) {
            this.getAutoCompleteResult(this.entity, value);
          }
        }
      );
    this.initComponent();
  }

  ngOnDestroy() {
    this.autoCompleteSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initComponent();
  }

  onRadioChange(event) {
    if (event.value === 0) {
      this.selectionList = [];
      this.showTargetAllText = true;
      this.disableInput = true;
      this.ctrl.disable();
    } else {
      this.showTargetAllText = false;
      this.disableInput = false;
      this.ctrl.enable();
    }

    this.targetOptionChange.emit({ identifier: this.identifier, targetOption: event.value });
  }

  onClickBrowse() {
    this.actionBtnClick.emit({ identifier: this.identifier, selection: this.selTargetOption });
  }

  addToSelection(type: number, option?: any) {
    const ids = this.selectionList.map(item => item.id);
    if (type === -1) {
      this.options.forEach(opt => {
        if (ids.indexOf(opt.id) === -1) {
          this.selectionList.push(opt);
          ids.push(opt.id);
        }
        opt.selected = true;
      });
    } else {
      if (ids.indexOf(option.id) === -1) {
        this.selectionList.push(option);
      }
      option.selected = true;
    }

    // deal category selection not appearing issue fixes
    this.showTargetAllText = (this.selectionList.length === 0) ? true : false;
  }

  removeItemFromSelection(data: GridData) {
    this.selectionList = this.selectionList.filter(item => item.id !== data.id);
    const rmIndex = this.options.findIndex(item => item.id === data.id);
    if (rmIndex !== -1) {
      this.options[rmIndex].selected = false;
    }
    this.selectionRemoved.emit({ identifier: this.identifier, item: data });
  }

  private initComponent() {
    if (this.entity !== 'DEAL_CATEGORY') {

      if (this.targetOptions !== null && this.targetOptions !== undefined) {
        const filOptions = this.targetOptions.filter(opt => opt.checked);
        if (filOptions.length > 0) {
          this.selTargetOption = filOptions[0].value;
          this.showTargetAllText = (filOptions[0].id === 'all') ? true : false;
          this.disableInput = (filOptions[0].id === 'all') ? true : false;

          filOptions[0].id === 'all' ? this.ctrl.disable() : this.ctrl.enable();
        }
      }
    } else {
      this.showTargetAllText = (this.selectionList.length === 0) ? true : false;
    }

  }

  private getAutoCompleteResult(entity: any, searchText: string) {
    if (searchText.trim().length > 1) {

      const searchReq = {
        filters: [{
          column: 'name',
          value: searchText
        } as DashboardFilters]
      } as SearchRequest;

      if (this.identifier === 'android-app-category') {
        searchReq.filters.push({
          column: 'osId',
          value: '4'
        });
      }

      if (this.identifier === 'ios-app-category') {
        searchReq.filters.push({
          column: 'osId',
          value: '3'
        });
      }
      // this.http.post('http://localhost:10045/v2/api/dictionary/' + entity + '?pageNumber=0&pageSize=1000&refresh=false&sort=id-', searchReq, {
      //   headers: { token: this.strService.getAuthToken() }
      // })
      this.dashboardService.getDictionaryUsingPOST(entity, 0, 1000, false, null,
        searchReq, 'id-')
        .subscribe(
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
            console.log('[InventorySourceModalComponent] error', error);
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
    const ids = this.selectionList.map(item => item.id);
    function isSelected(id: number) {
      return ids.indexOf(id) !== -1 ? true : false;
    }

    return list.filter(item => item.active).map(item => {
      return { id: item.id, name: item.name, selected: isSelected(item.id) };
    });
  }

}
