import { AfterViewInit, Component, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { CommonService } from '@app/shared/_services/common.service';
import { BaseModel, DashboardFilters, SearchRequest } from '@revxui/api-client-ts';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true
    }
  ]
})
export class FormSelectComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() label: string;
  @Input() entity: any;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() validationMsg: string;
  @Input() validated: string;
  @Input() width: string;
  @Input() disable: string;
  @Input() marginBottom: string;

  @Input() filterValue: string; // for advertiser form only
  @Output() countryEvent = new EventEmitter(); // for advertiser form only

  /** list of id and values */
  protected list: BaseModel[];

  /** control for the selected list */
  public listCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public listFilterCtrl: FormControl = new FormControl();

  /** list of lists filtered by search keyword */
  public filteredLists: ReplaySubject<BaseModel[]> = new ReplaySubject<BaseModel[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected onDestroy = new Subject<void>();


  constructor(
    private commonService: CommonService
  ) { }

  val = '';
  onChange: any = () => { };
  onTouch: any = () => { };

  set value(val) {
    if (val !== undefined && this.val !== val) {
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    }

  }

  get value() {
    return this.val;
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }


  ngOnInit() {
    this.fetchRequiredEntities();
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnChanges() {
    if (this.entity === 'TIMEZONE') {
      // console.log(this.filterValue);
      this.fetchRequiredEntities();
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredLists are loaded initially
   */
  protected setInitialValue() {
    this.filteredLists
      .pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredLists are loaded initially
        // and after the mat-option elements are available
        this.singleSelect.compareWith = (a: BaseModel, b: BaseModel) => a && b && a.id === b.id;
      });
  }

  protected filterLists() {
    if (!this.list) {
      return;
    }
    // get the search keyword
    let search = this.listFilterCtrl.value;
    if (!search) {
      this.filteredLists.next(this.list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    let result: any[] = this.list.filter(ele =>
      ele.name.toLowerCase().indexOf(search) > -1
    );

    // filter the list
    this.filteredLists.next(
      result
    );
  }

  fetchRequiredEntities() {

    const searchReq = {} as SearchRequest;

    // REVX-306: decoupling advertiser region and timezone.
    // removing the countryId filter which was being passed to dictionary API of Timezone
    /*if (this.entity === 'TIMEZONE' && this.filterValue) {
      var searchReq = {} as SearchRequest;
      let dashboardFilters = {} as DashboardFilters;
      let arrDashboardFilters: DashboardFilters[] = [];

      dashboardFilters.column = 'countryId';
      dashboardFilters.value = this.filterValue;

      arrDashboardFilters.push(dashboardFilters);
      searchReq.filters = arrDashboardFilters;

    }*/
    // console.log(searchReq);

    //revx-657 : fetch only active MMPs
    if (this.entity === 'MMP') {
      let filter = {} as DashboardFilters;
      filter.column = 'active';
      filter.value = 'true';
      let arrDashboardFilters: DashboardFilters[] = [filter];
      searchReq.filters = arrDashboardFilters;
    }

    this.commonService.getDetailDictionary(this.entity, 1, 1000, false, null, searchReq)
      .subscribe((resp: any) => {
        this.list = resp.respObject.data;
        // this.listCtrl.setValue(this.list[2]);
        this.filteredLists.next(this.list.slice());
        this.listFilterCtrl.valueChanges
          .pipe(takeUntil(this.onDestroy))
          .subscribe(() => {
            this.filterLists();
          });
      });

    // console.log(this.filteredLists);
  }

  emitAdvRegion() {
    if (this.entity === 'COUNTRY') {
      this.countryEvent.emit(this.value);
    }
  }

}
