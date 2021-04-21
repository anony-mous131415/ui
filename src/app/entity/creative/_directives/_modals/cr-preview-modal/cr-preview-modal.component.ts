import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';

@Component({
  selector: 'app-cr-preview-modal',
  templateUrl: './cr-preview-modal.component.html',
  styleUrls: ['./cr-preview-modal.component.scss']
})
export class CrPreviewModalComponent implements OnInit {

  crConst = CreativeConstants;
  previewObj = {
    name: '',
    advertiser: '',
    clickDestination: '',
    type: ''
  };

  constructor(
    private modalRef: MatDialogRef<CrPreviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit() {
  }

  onOkClick() {
    this.modalRef.close(null);
  }

  get creativeDTO() {
    // console.log('data ', this.data);
    return this.data.creative;
  }

  get nativeAssets() {
    if (this.data.nativeAsset) {
      return this.data.nativeAsset;
    }
    return null;
  }

}
