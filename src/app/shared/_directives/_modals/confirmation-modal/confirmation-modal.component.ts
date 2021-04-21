import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;

  constructor(
    private modalRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
  ) { }

  ngOnInit() {
  }


  get config() {
    return this.configData;
  }

  public decline() {
    // this.activeModal.close(false);
    this.modalRef.close(false);
  }

  public accept() {
    // this.activeModal.close(true);
    this.modalRef.close(true);
  }

  public dismiss() {
    // this.activeModal.dismiss();
    this.modalRef.close(false);
  }

}
