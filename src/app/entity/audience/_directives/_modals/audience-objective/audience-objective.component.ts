import { Component, OnInit, Optional } from '@angular/core';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import { AudienceConstants } from '@app/entities/_constants/AudienceConstants';


@Component({
  selector: 'app-audience-objective',
  templateUrl: './audience-objective.component.html',
  styleUrls: ['./audience-objective.component.scss']
})
export class AudienceObjectiveComponent implements OnInit {

  objective: any;
  audConst: typeof AudienceConstants;

  showDmpObjective: boolean;

  constructor(
    @Optional() private readonly activeModal: NgbActiveModal,
    private audienceService: AudienceService
  ) { }

  ngOnInit() {
    this.audConst = AudienceConstants;
    this.audienceService.accessWatcher().subscribe(dmp => {
      // console.log(dmp);
      this.showDmpObjective = dmp;
    });
  }

  setObjective(obj) {
    this.objective = obj;
    // console.log(this.objective);
  }

  done() {
    if (!this.objective) { //not selected , display warning
    }
    else { //pass value to caller
      this.activeModal.close(this.objective);
      this.dismissModal();
    }
  }

  dismissModal() {
    this.activeModal.close();
  }


}
