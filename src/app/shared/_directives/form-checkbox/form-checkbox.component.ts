import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
  selector: 'app-form-checkbox',
  templateUrl: './form-checkbox.component.html',
  styleUrls: ['./form-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormCheckboxComponent),
      multi: true
    }
  ]
})
export class FormCheckboxComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() checkboxLevel: string;
  @Input() validationMsg: string;
  @Input() validated: string;
  @Input() disable: boolean;
  @Input() entity: string;

  @Input() showAlertMsg: boolean;
  @Input() alertMsgStr: string;

  @Output() advEvent = new EventEmitter();
  // @Input() placeholder: string;
  // @Input() maxLen: string;
  // @Input() minLen: string;
  // @Input() width: string;

  constructor() { }



  val = '';
  onChange: any = () => { };
  onTouch: any = () => { };

  get value() {
    return this.val;
  }

  set value(val) {
    if (val !== undefined && this.val !== val) {
      // console.log('input value', this.val, this.value);
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    }

  }

  writeValue(value: any) {
    // console.log('input value', this.val, this.value);
    this.value = value;
  }

  registerOnChange(fn: any) {
    // console.log('input value', this.val, this.value);
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    // console.log('input value', this.val, this.value);
    this.onTouch = fn;
  }

  //REVX-401
  cbEvent(event) {
    // if (this.entity === AppConstants.ENTITY.ADVERTISER) {
    this.advEvent.emit(event);
    // }
  }

}
