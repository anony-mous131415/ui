import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ApiResponseObjectDictionaryResponse, DashboardControllerService, DashboardFilters, SearchRequest } from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GridData, StrategyService } from '../../_services/strategy.service';

@Component({
  selector: 'app-strategy-target-specific',
  templateUrl: './strategy-target-specific.component.html',
  styleUrls: ['./strategy-target-specific.component.scss']
})
export class StrategyTargetSpecificComponent implements OnInit, OnDestroy, OnChanges {

  autoCompleteSubscription: Subscription;

  @Input() identifier: string;
  @Input() title: string;
  @Input() entity: string;
  @Input() icon: string;
  @Input() actionBtnLabel: string;
  @Input() targetList: any[] = [];
  @Input() targetOperator: string;
  @Input() blockList: any[] = [];
  @Input() blockOperator: string;
  @Input() targetAlltext: string;
  @Input() targetListHeader: string;
  @Input() blockListHeader: string;

  //revx-371 : bulk edit strategy
  @Input() hideAnyAllOptions: boolean;


  @Output() actionBtnClick: EventEmitter<string> = new EventEmitter();
  @Output() selectionRemoved: EventEmitter<any> = new EventEmitter();
  @Output() optionChange: EventEmitter<any> = new EventEmitter();

  ctrl = new FormControl();
  options: any[] = [];
  optionsLength: number = this.options.length;

  targetOperatorOptions: any[] = [
    { id: 'OR', name: 'Any' },
    { id: 'AND', name: 'All' }
  ];
  blockOperatorOptions: any[] = [
    { id: 'OR', name: 'Any' }
  ];

  audienceType: any[];
  selectedAudienceType: any = AudienceConstants.TYPE.APP;

  searchText: string;
  dmpAccessSubscription: Subscription;

  constructor(
    private dashboardService: DashboardControllerService,
    private strService: StrategyService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.dmpAccessSubscription = this.strService.advDmpAccessSubject.subscribe((dmpStatus: boolean) => {
      this.initComponent(dmpStatus);
    });
  }

  ngOnDestroy() {
    if (this.autoCompleteSubscription) {
      this.autoCompleteSubscription.unsubscribe();
    }
    if (this.dmpAccessSubscription) {
      this.dmpAccessSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes !== null && changes !== undefined) {
      this.handleSelection(changes);
    }
  }

  onClickBrowse() {
    this.actionBtnClick.emit(this.identifier);
  }

  addToTargetSelection(type: number, option?: any) {
    const ids = this.targetList.map(item => item.id);
    if (option) {
      option.type = this.selectedAudienceType;
    }
    if (type === -1) {
      this.options.forEach(opt => {
        if (ids.indexOf(opt.id) === -1) {
          opt.type = this.getAudienceTypeString(this.selectedAudienceType);
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
    if (option) {
      option.type = this.selectedAudienceType;
    }
    if (type === -1) {
      this.options.forEach(opt => {
        if (ids.indexOf(opt.id) === -1) {
          opt.type = this.getAudienceTypeString(this.selectedAudienceType);
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

  onOptChange(event, opttype) {
    // console.log(event, opttype);
    this.optionChange.emit({
      type: opttype,
      value: event.value
    });
  }

  onAudTypeChange(event: any) {
    this.getAutoCompleteResult(this.entity, this.searchText, this.selectedAudienceType);
  }

  private initComponent(dmpStatus: boolean) {
    if (this.identifier === 'audience') {
      this.audienceType = this.strService.getAudienceType(dmpStatus);
    }
    this.autoCompleteSubscription = this.ctrl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        value => {
          if (value !== null && value !== undefined && value.trim().length > 1) {
            this.searchText = value;
            this.getAutoCompleteResult(this.entity, value, this.selectedAudienceType);
          }
        }
      );
  }

  private getAutoCompleteResult(entity: any, searchText: string, type: string) {
    if (searchText && searchText.trim().length > 1) {
      const searchReq = {
        filters: [{
          column: 'name',
          value: searchText
        } as DashboardFilters]
      } as SearchRequest;

      switch (type) {
        case AudienceConstants.TYPE.APP:
        case AudienceConstants.TYPE.WEB:
          entity = AppConstants.ENTITY.AUDIENCE;
          const appWebTypeFilter = {
            column: 'user_data_type',
            value: ((type === AudienceConstants.TYPE.WEB) ? 'WEB_BROWSING' : 'MOBILE_APP').toLowerCase()
          };
          searchReq.filters.push(appWebTypeFilter);
          break;
        case AudienceConstants.TYPE.DMP:
          entity = AppConstants.ENTITY.DMP_AUDIENCE;
          const dmpTypeFilter = {
            column: 'user_data_type',
            value: 'DMP'.toLowerCase()
          };
          searchReq.filters.push(dmpTypeFilter);
          break;
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

    function isTargeted(id: number) {
      return targetIDs.indexOf(id) !== -1 ? true : false;
    }

    function isBlocked(id: number) {
      return blockIDs.indexOf(id) !== -1 ? true : false;
    }

    //autosuggest filtering for non-audince
    if (this.entity !== AppConstants.ENTITY.AUDIENCE) {
      return list.filter(item => item.active).map(item => {
        return {
          id: item.id,
          name: item.name,
          targeted: isTargeted(item.id),
          blocked: isBlocked(item.id)
        };
      });
    }

    //autosuggest filtering for audince
    else {
      return list.map(item => {
        return {
          id: item.id,
          name: item.name,
          targeted: isTargeted(item.id),
          blocked: isBlocked(item.id)
        };
      });
    }

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

  getAudienceTypeString(audType: string) {
    let audTypeStr = '';
    switch (audType) {
      case AudienceConstants.TYPE.APP:
        audTypeStr = AudienceConstants.LABEL.APP;
        break;
      case AudienceConstants.TYPE.WEB:
        audTypeStr = AudienceConstants.LABEL.WEB;
        break;
      case AudienceConstants.TYPE.DMP:
        audTypeStr = AudienceConstants.LABEL.DMP;
        break;
    }

    return audTypeStr;
  }
}
