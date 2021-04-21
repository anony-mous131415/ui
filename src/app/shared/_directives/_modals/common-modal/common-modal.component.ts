import { Component } from '@angular/core';

@Component({
  selector: 'app-common-modal',
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonModalComponent {

  constructor(
    // @Optional() private readonly activeModal: NgbActiveModal,
    // public model: CommonModel
  ) {
  }

  // public confirm(): void {
  //   if (this.activeModal)
  //     this.activeModal.close();
  //   else
  //     this.model.updated.next();
  // }

  // public dismiss(): void {
  //   if (this.activeModal)
  //     this.activeModal.dismiss();
  // }

}
