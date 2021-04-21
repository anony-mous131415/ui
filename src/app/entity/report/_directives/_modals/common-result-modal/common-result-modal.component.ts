import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-common-result-modal',
  templateUrl: './common-result-modal.component.html',
  styleUrls: ['./common-result-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommonResultModalComponent implements OnInit {

  constructor(readonly activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  close(){
    this.activeModal.close();
  }

}
