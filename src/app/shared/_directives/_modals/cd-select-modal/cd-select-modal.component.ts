import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CreativeService } from '@app/entity/creative/_services/creative.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ClickDestination } from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cd-select-modal',
  templateUrl: './cd-select-modal.component.html',
  styleUrls: ['./cd-select-modal.component.scss']
})
export class CdSelectModalComponent implements OnInit {

  @Output() syncSelectedCD: EventEmitter<ClickDestination> = new EventEmitter();

  getCD: Subscription;

  appConst = AppConstants;
  tempCD;
  disableSelectButton = true;
  showErrorMessage = false;
  disableDone = false;

  constructor(
    private modalRef: MatDialogRef<CdSelectModalComponent>,
    @Inject(MAT_DIALOG_DATA) private obj: any,
    private crService: CreativeService

  ) { }

  ngOnInit() {
    // console.log('obj ', this.obj);
    this.subscribeToEvent();
  }

  subscribeToEvent() {
    this.getCD = this.crService.selectedCD.subscribe(cd => {
      if (cd) {
        this.tempCD = cd;
      } else {
        this.tempCD = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.getCD) {
      this.getCD.unsubscribe();
    }
  }

  cancel() {
    this.modalRef.close(null);
  }

  onSelectClick() {
    if (!this.tempCD) {
      this.showErrorMessage = true;
      return;
    } else {
      this.showErrorMessage = false;
    }
    this.syncSelectedCD.emit(this.tempCD);
    this.modalRef.close(null);
  }

  get advertiserId() {
    return this.obj.advertiserId;
  }

  syncSelectedClickDestination(clickDestination: ClickDestination) {
    // console.log('click Destination selected ', clickDestination);
    this.tempCD = clickDestination;
    this.disableSelectButton = false;
  }

  noCdFound(event: boolean) {
    this.disableDone = event;
    // console.log(this.disableDone);
  }

}
