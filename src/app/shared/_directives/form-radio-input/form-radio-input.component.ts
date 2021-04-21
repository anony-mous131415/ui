import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { ThemeDirective } from '@app/startup/_directives/theme/theme.directive';

@Component({
  selector: 'app-form-radio-input',
  templateUrl: './form-radio-input.component.html',
  styleUrls: ['./form-radio-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormRadioInputComponent),
      multi: true
    }
  ]
})
export class FormRadioInputComponent implements ControlValueAccessor, OnInit {

  @Input() label: string;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() tab: string;
  @Input() options: any;
  @Input() validationMsg: string;
  @Input() validated: string;

  @Output() radioEmitter = new EventEmitter<any>();
  radio_btn: number = 1;

  radioEventFunc($event: MatRadioChange) {
    // console.log($event.value);
    this.radioEmitter.emit({ radio: this.radio_btn, name: this.tab, value: this.val });
    // console.log('fired');
  }


  constructor() { }

  ngOnInit() {
    // this.options = JSON.parse(this.options);
    // console.log('sdf', this.options, this.label);
    // this.radio_btn=2;
    // this.value='45';
  }

  val = ''
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

  isInvalidNumber(x){
  //   //returns true if number is not valid(string or negative
  //   //return false if x >= 0
  //   const reg = new RegExp('^[0-9]+$');
  //   if (!reg.test(x) || x < 0) {
  //     // console.log('string-or-negative-number');
  //     return true;
  //   }
  //   return false;
  }


}
