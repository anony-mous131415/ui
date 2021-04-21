import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pixel-form-modal',
  templateUrl: './pixel-form-modal.component.html',
  styleUrls: ['./pixel-form-modal.component.scss']
})
export class PixelFormModalComponent implements OnInit {

  advertiserDetails: string;

  constructor(public dialogRef: MatDialogRef<PixelFormModalComponent>,
    private modalRef: MatDialogRef<PixelFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.advertiserDetails = JSON.stringify(this.data);
  }

  buttonClick(event) {
    this.dismissModal(event);
  }

  dismissModal(event: any) {
    this.modalRef.close(event);
  }

}
