import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-status',
  templateUrl: './form-status.component.html',
  styleUrls: ['./form-status.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormStatusComponent),
      multi: true
    }
  ]
})
export class FormStatusComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() buttonLabel: string;
  @Input() validationMsg: string;
  @Input() validated: string;
  @Input() disable: string;
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
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    }

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

}
