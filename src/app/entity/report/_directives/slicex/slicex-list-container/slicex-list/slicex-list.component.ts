import { AfterViewInit, Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { SlicexListService, RawListData, ListData } from '@app/entity/report/_services/slicex-list.service';
import { AlertService } from '@app/shared/_services/alert.service';

@Component({
  selector: 'app-slicex-list',
  templateUrl: './slicex-list.component.html',
  styleUrls: ['./slicex-list.component.scss']
})
export class SlicexListComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input('data') listData: RawListData;
  @Input('loading') loading: boolean = false;
  @Input('gridview') gridview: boolean = true;
  @Input('compare') isCompareEnabled: boolean = false;
  @Input() isActiveEntity: boolean = false;
  @Input('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC';

  listSelection: number[] = [];
  isExpanded = false;

  listSelectionSubscription: Subscription;
  clearListSelectionSubscription: Subscription;

  constructor(
    private listService: SlicexListService,
    private alertService: AlertService) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    const newListData: RawListData = (changes.listData) ? changes.listData.currentValue : null;
    if (newListData) {
      this.selectListItems(newListData.listData);
      this.listData = newListData;
      this.isExpanded = (this.listData.listData !== null
        && this.listData.listData !== undefined
        && Array.isArray(this.listData.listData)
        && this.listData.listData.length > 0) ? true : false;
    }
  }

  ngAfterViewInit() {
    this.listSelectionSubscription = this.listService.onUpdateEntitySelection.subscribe(
      param => {
        if (this.listData.entity === param.entity) {
          this.listSelection = param.selections;
          this.selectListItems(this.listData.listData);
        }
      }
    );

    this.clearListSelectionSubscription = this.listService.onClearEntitySelection.subscribe(
      param => {
        if (this.listData.entity === param.entity) {
          const index = this.listSelection.indexOf(param.entityID);
          index !== -1 ? this.listSelection.splice(index, 1) : null;
          this.selectListItems(this.listData.listData);
        }
      }
    );
  }

  ngOnDestroy() {
    this.listSelectionSubscription.unsubscribe();
    this.clearListSelectionSubscription.unsubscribe();
  }

  checkboxToggle(event: any, entity: string, id: number, name: string, listItem: any) {
    if (this.listService.getIsDateRangeValid()) {
      if (event.checked) {
        if (this.listSelection.indexOf(id) === -1) {
          this.listSelection.push(id);
        }
      } else {
        const index = this.listSelection.indexOf(id);
        if (index !== -1) {
          this.listSelection.splice(index, 1);
        }
      }
      this.selectListItems(this.listData.listData);
      this.listService.onEntitySelectionChanged(entity, id, name, event.checked);
    } else {
      setTimeout(() => {
        listItem.checked = !listItem.checked;
      }, 0);
      this.alertService.error(this.listService.getValidationMessage());
    }
  }

  expandCollapseEntity(entity: string) {
    if (this.listService.getIsDateRangeValid()) {
      this.listService.onEntityExpanded(entity, !this.isExpanded);
    } else {
      this.alertService.error(this.listService.getValidationMessage());
    }
  }

  showGridDetails(entity: string) {
    if (this.listService.getIsDateRangeValid()) {
      if (this.listData.listData.length === 0) {
        this.listService.onForceExpandEntityGridDetails(entity, this.sortOrder, this.listData.data,
          this.listSelection, this.listData.orderMetric);
      } else {
        this.listService.onOpenEntityGridDetails(entity, this.sortOrder, this.listData.data, this.listSelection, this.listData.orderMetric);
      }
    } else {
      this.alertService.error(this.listService.getValidationMessage());
    }
  }

  selectListItems(data: ListData[]) {
    if (this.listSelection.length === 0) {
      data.forEach(item => item.checked = false);
    } else {
      const selectedList: ListData[] = [];
      const unSelectedList: ListData[] = [];

      data.forEach(item => {
        item.checked = (this.listSelection.indexOf(item.id) !== -1) ? true : false;
        item.checked ? selectedList.push(item) : unSelectedList.push(item);
      });

      this.listData.listData = this.mergeLists(selectedList, unSelectedList);
    }
  }

  mergeLists(list1: ListData[], list2: ListData[]) {
    const list: ListData[] = [];
    list.push(...list1);
    list.push(...list2);

    return list;
  }

  /**
   * Method to intercept the COPY event. This mothod formats the selected data into csv.
   * Works only in SliceX List.
   * @param event - event
   */
  @HostListener('document:copy', ['$event'])
  copy(event) {
    const modulus = (this.isCompareEnabled) ? 3 : 2;
    const textOnlyFormatted: string[] = (this.isCompareEnabled) ? ['Name, Value, Change'] : ['Name, Value'];
    const regX = new RegExp('\n', 'g');
    const textOnly: string = document.getSelection().toString();
    if (textOnly) {
      let parts: string[] = textOnly.split(regX);
      parts = parts.filter(part => (part !== null && part !== undefined && part !== ''));
      let csvString = [];
      parts.forEach((part: string, index: number) => {
        if (index !== 0 && index % modulus === 0) {
          textOnlyFormatted.push(csvString.join(', '));
          csvString = [];
        }
        csvString.push(part);
      });
      if (csvString && csvString.length > 0) {
        textOnlyFormatted.push(csvString.join(', '));
      }
    }

    const clipdata = event.clipboardData;
    clipdata.setData('text/plain', textOnlyFormatted.join('\n'));

    event.preventDefault();
  }

}
