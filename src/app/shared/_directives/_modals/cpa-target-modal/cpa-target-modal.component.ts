import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { StrategyConstants } from '@app/entity/strategy/_constants/StrategyConstants';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Component({
  selector: 'app-cpa-target-modal',
  templateUrl: './cpa-target-modal.component.html',
  styleUrls: ['./cpa-target-modal.component.scss']
})
export class CpaTargetModalComponent implements OnInit {

  SCONST = StrategyConstants;
  appConst = AppConstants;

  copyBidPrice = true;
  copyBidPriceValue: any = null;

  showValidationMsg = false;

  constructor(
    private modalRef: MatDialogRef<CpaTargetModalComponent>,
  ) { }

  ngOnInit() {
  }

  onCancelClick() {
    // console.log(this.copyBidPrice, this.copyBidPriceValue);
    this.modalRef.close(null);
  }

  onSaveClick() {
    // console.log(this.copyBidPrice, this.copyBidPriceValue);
    if (this.isFormValid()) {
      this.showValidationMsg = false;
      this.modalRef.close({
        copyBidPriceToCPATarget: this.copyBidPrice,
        cpaTargetValue: this.copyBidPriceValue
      });
    } else {
      this.showValidationMsg = true;
    }
  }

  onOptionChange(event: any) {
    if (event.value) {
      this.copyBidPriceValue = null;
    }
  }

  private isFormValid() {
    if (this.copyBidPrice) {
      return true;
    } else {
      return this.isValidCPATarget(this.copyBidPriceValue);
    }
  }

  isValidCPATarget(target): boolean {
    if (target && !this.isInvalidNumber(target) && Math.ceil(parseFloat(target)) > 0) {
      return true;
    } else {
      return false;
    }
  }

  isInvalidNumber(x): boolean {
    const reg = new RegExp('^[0-9]+(?:\.[0-9]+)?$'); // regex for floating numbers
    if (parseFloat(x) < 0 || !reg.test(x)) {
      return true;
    }
    return false;
  }

}
