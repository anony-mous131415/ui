import { Component, forwardRef, Input, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material';
import { ClickDestinationConstants } from '@app/entity/advertiser/_constants/ClickDestinationConstants';

@Component({
  selector: 'app-cd-text-area',
  templateUrl: './cd-text-area.component.html',
  styleUrls: ['./cd-text-area.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CdTextAreaComponent),
      multi: true
    }
  ]
})


export class CdTextAreaComponent implements OnInit, OnChanges, ControlValueAccessor {

  //REVX-401
  @Input() label: string;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() validationMsg: string;
  @Input() hasError: boolean;
  @Input() placeholder: string;
  @Input() maxLen: string;
  @Input() minLen: string;
  @Input() width: string;
  @Input() height: string;
  @Input() disable: boolean;
  @Input() rowsInput: number;

  @Input() marginBottom: string;

  @Input() hasInfo: boolean;
  @Input() infoMsg: string;
  @Input() isMacroList: boolean;
  @Input() macroList: any[];


  @ViewChild(MatMenuTrigger, { static: false }) macroListTrigger: MatMenuTrigger;

  cdConst = ClickDestinationConstants;



  constructor(
  ) { }

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

  isInfoMsg(): boolean {
    return this.validationMsg.toLowerCase().includes('info');
  }


  ngOnInit() {
    // console.log(this.isMacroList);
  }

  ngOnChanges(c: SimpleChanges) {
    // console.log(c);
  }

  closeMenu() {
    if (this.macroListTrigger) {
      this.macroListTrigger.closeMenu();
    }
  }


  handleMacroSelect(selectedMacro: string){
    this.val = this.val.concat(selectedMacro);
  }



}
