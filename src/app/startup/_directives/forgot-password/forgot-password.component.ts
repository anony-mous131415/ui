import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
  ) { }

  ngOnInit() {
  }

  dismissModal() {
    // this.activeModal.close();
    this.dialogRef.close();
  }

}
