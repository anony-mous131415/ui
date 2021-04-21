import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface InjectedData {
  type: number,
  modalMsg: string,
  saveBtnMsg: string,
  msgMap?: Map<string, Array<string>>
}

@Component({
  selector: 'app-cd-confirmation-modal',
  templateUrl: './cd-confirmation-modal.component.html',
  styleUrls: ['./cd-confirmation-modal.component.scss']
})
export class CdConfirmationModalComponent implements OnInit {

  @Output() close: EventEmitter<boolean> = new EventEmitter();

  tempCD;
  disableSelectButton = true;
  showErrorMessage = false;

  keyArr: string[] = [];

  constructor(
    private modalRef: MatDialogRef<CdConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) private injectedData: InjectedData,
  ) { }

  ngOnInit() {
    // console.log(this.injectedData.msgMap);
    if (this.injectedData.type === 1) {
      for (const [key, value] of this.injectedData.msgMap.entries()) {
        this.keyArr.push(key);
      }
    }
  }


  decline() {
    this.modalRef.close(false);
  }

  accept() {
    this.modalRef.close(true);
  }


  get dataInjected() {
    return this.injectedData;
  }


}
