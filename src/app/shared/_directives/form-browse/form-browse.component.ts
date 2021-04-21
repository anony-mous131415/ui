import { AfterViewInit, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormBrowseModalComponent } from '@app/entity/campaign/_directives/_modals/form-browse-modal/form-browse-modal.component';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-form-browse',
  templateUrl: './form-browse.component.html',
  styleUrls: ['./form-browse.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormBrowseComponent),
      multi: true
    }
  ]
})
export class FormBrowseComponent implements ControlValueAccessor, OnInit, AfterViewInit {


  @Input() entity: string;
  @Input() label: string;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() validationMsg: string;
  @Input() validated: string;
  @Input() btnPlaceHolder: string;
  @Input() maxLen: string;
  @Input() minLen: string;
  @Input() width: string;

  public modalOption: NgbModalOptions = {}

  selectionDone: boolean = false;
  val = '';
  // val :any;

  onChange: any = () => { };
  onTouch: any = () => { };

  constructor(
    private readonly modalService: NgbModal,
  ) { }

  ngOnInit() {
    // console.log('input value:', this.val, this.value);
  }

  ngAfterViewInit() {
    // console.log('input value:', this.val, this.value);
  }


  get value() {
    return this.val;
  }

  set value(val) {
    if (val !== undefined && this.val !== val) {
      // console.log('input value:', this.val, this.value);
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    }

  }

  writeValue(value: any) {
    // console.log('input value:', this.val, this.value);
    this.val = value;
    this.onChange(value);
    this.onTouch(value);
  }

  registerOnChange(fn: any) {
    // console.log('input value:', this.val, this.value);
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    // console.log('input value:', this.val, this.value);
    this.onTouch = fn;
  }

  openModal() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    this.modalOption.windowClass = 'modal-xl'
    const modal: NgbModalRef = this.modalService.open(FormBrowseModalComponent, this.modalOption);
    modal.componentInstance.entity = this.entity;
    modal.result.then((result) => {
      if (result) {

        // console.log('RECERIVED IN MID',typeof result , result);
        // this.objective=result;
        this.val = result;
        this.selectionDone = true;
        this.writeValue(result);
      }
    });
  }

}
