import { AfterViewInit, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ]
})
export class FormInputComponent implements ControlValueAccessor, OnInit, AfterViewInit {

  @Input() label: string;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() validationMsg: string;
  @Input() validated: string;
  @Input() placeholder: string;
  @Input() maxLen: string;
  @Input() minLen: string;
  @Input() width: string;
  @Input() disable: string;
  @Input() type: string;

  @Input() textBefore: string;
  @Input() textAfter: string;
  @Input() marginBottom: string;

  val = '';
  onChange: any = () => { };
  onTouch: any = () => { };

  constructor() { }

  ngOnInit() {
    // console.log('input value', this.val, this.value);
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
    this.value = value;
  }

  registerOnChange(fn: any) {
    // console.log('input value:', this.val, this.value);
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    // console.log('input value:', this.val, this.value);
    this.onTouch = fn;
  }

}
