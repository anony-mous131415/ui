import { Component, OnInit, Optional } from '@angular/core';
import { CampaignConstants } from '@app/entity/campaign/_constants/CampaignConstants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-campaign-objective-modal',
  templateUrl: './campaign-objective-modal.component.html',
  styleUrls: ['./campaign-objective-modal.component.scss']
})
export class CampaignObjectiveModalComponent implements OnInit {

  campaignConstants;

  showWarning: boolean;

  objective: string = null;

  constructor(
    @Optional() private readonly activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {
    this.campaignConstants = CampaignConstants;
    this.showWarning = false;
  }

  done() {
    if (!this.objective) { //not selected , display warning
      this.showWarning = true;
    }
    else { //pass objective to caller
      this.activeModal.close(this.objective);
      this.dismissModal();
    }
  }

  dismissModal() {
    this.activeModal.close();
  }

  setObjective(obj) {
    this.showWarning = false;
    this.objective = obj;
  }
}
