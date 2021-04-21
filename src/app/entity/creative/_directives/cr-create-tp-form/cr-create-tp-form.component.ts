import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
  selector: 'app-cr-create-tp-form',
  templateUrl: './cr-create-tp-form.component.html',
  styleUrls: ['./cr-create-tp-form.component.scss']
})
export class CrCreateTpFormComponent implements OnInit {

  @Output() syncTpAdTag: EventEmitter<string> = new EventEmitter();

  formValidated = true;
  appConst = AppConstants;

  crConst = CreativeConstants;
  // crBasicDetails = {} as CreativeDetails;

  adTag: string;

  tooltipPosition: string = 'above';
  tooltip: string = '';

  constructor(
  ) { }

  ngOnInit() {
  }

  onGoBackClick() {
    this.syncTpAdTag.emit(null);
  }

  onContinueClick() {
    this.formValidated = true;

    if (!this.validateForm()) {
      return;
    }

    this.syncTpAdTag.emit(this.adTag);

  }

  validateForm() {
    if (!this.adTag) {
      this.formValidated = false;
      return false;
    }

    return true;
  }

}
