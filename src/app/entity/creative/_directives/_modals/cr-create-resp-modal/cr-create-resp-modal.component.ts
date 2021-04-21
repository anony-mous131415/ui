import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { CreativeDTO, BaseModel } from '@revxui/api-client-ts';
import { CrAssociationModalComponent } from '../cr-association-modal/cr-association-modal.component';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cr-create-resp-modal',
  templateUrl: './cr-create-resp-modal.component.html',
  styleUrls: ['./cr-create-resp-modal.component.scss']
})
export class CrCreateRespModalComponent implements OnInit {

  crList: Array<CreativeDTO>;
  constructor(
    private modalRef: MatDialogRef<CrCreateRespModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modal: MatDialog,
    private router: Router,
  ) { }

  ngOnInit() {
    // console.log(this.data);
    this.crList = this.data.creativeList;
  }

  associateToStrategies() {

    const creatives: Array<BaseModel> = [];

    // tslint:disable-next-line: forin
    for (const i in this.crList) {
      const cr = this.crList[i];
      if (cr.errorMsg) {
        break;
      }
      const creative: BaseModel = {};
      creative.id = cr.id;
      creative.name = cr.name;
      creatives.push(creative);
    }


    this.modal.open(CrAssociationModalComponent, {
      width: '80%',
      data: { advertiserId: this.data.advertiserId, creativeList: creatives, redirectOnCancel: AppConstants.URL_CREATIVES }
    });

    this.modalRef.close(null);

    // const crAssociateModalSubscription = modalRef.componentInstance.crAssociateObj.subscribe(crAssociate => {
    //   console.log('crAssociate ', crAssociate);
    //   // this.native = nativeAsset;
    //   // this.nativeStr = JSON.stringify(nativeAsset);
    //   // console.log('native ', this.native);
    //   crAssociateModalSubscription.unsubscribe();
    // });
  }

  cancel() {
    this.router.navigate([AppConstants.URL_CREATIVES]);
    this.modalRef.close(null);
  }

  getSuccessListLength() {
    return this.crList.filter(cr => cr.errorMsg === null).length;
  }

}
