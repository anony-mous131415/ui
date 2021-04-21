import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-cr-create-update-theme-modal',
  templateUrl: './cr-create-update-theme-modal.component.html',
  styleUrls: ['./cr-create-update-theme-modal.component.scss']
})
export class CrCreateUpdateThemeModalComponent implements OnInit {

  constructor(
    private modalRef: MatDialogRef<CrCreateUpdateThemeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  themeName: string; 
  ngOnInit() {
    this.themeName = this.data.themeName; 
  }

  onCancelClick() {
    this.modalRef.close(null);
  }

  onDoneClick() {
    this.modalRef.close({themeName: this.themeName});
  }

}
