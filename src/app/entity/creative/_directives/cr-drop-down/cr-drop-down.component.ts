import { Component, OnInit, Input, ViewChild, OnDestroy, OnChanges, AfterViewInit, forwardRef, Output, EventEmitter } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { SearchRequest } from '@revxui/api-client-ts';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';


@Component({
  selector: 'app-cr-drop-down',
  templateUrl: './cr-drop-down.component.html',
  styleUrls: ['./cr-drop-down.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CrDropDownComponent),
      multi: true
    }
  ]
})
export class CrDropDownComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges, AfterViewInit {



  @Input() options: any[];
  // value: any;


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
  @Output() valchange = new EventEmitter(); // for advertiser form only

  /** list of id and values */
  protected list: any[];

  /** control for the selected list */
  public listCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public listFilterCtrl: FormControl = new FormControl();

  /** list of lists filtered by search keyword */
  public filteredLists: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

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
    this.fetchRequiredEntities();
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }


  protected setInitialValue() {
    this.filteredLists
      .pipe(take(0), takeUntil(this.onDestroy))
      .subscribe(() => {
        this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
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

    this.list = this.options;
    // this.listCtrl.setValue(this.list[2]);
    this.filteredLists.next(this.list.slice());
    this.listFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filterLists();
      });

  }

  emitAdvRegion() {
    // if (this.entity === 'COUNTRY') {
      this.valchange.emit(this.value);
    // }
  }

}
