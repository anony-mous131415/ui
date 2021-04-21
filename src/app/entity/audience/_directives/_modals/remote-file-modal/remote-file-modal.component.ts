import { Component, Input, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { AudienceConstants, COMPRESSION, PROTOCOL } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseModel, PixelRemoteConfigDTO, RemoteFileDTO } from '@revxui/api-client-ts';
import { PixelDataScheduleDTO } from '@revxui/api-client-ts/model/pixelDataScheduleDTO';

@Component({
  selector: 'app-remote-file-modal',
  templateUrl: './remote-file-modal.component.html',
  styleUrls: ['./remote-file-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemoteFileModalComponent implements OnInit {

  @Input() editDetails: any;
  appConst = AppConstants;

  audConst = AudienceConstants;

  protocolArr: BaseModel[] = [
    { id: PROTOCOL.FTP, name: 'FTP://' },
    { id: PROTOCOL.SFTP, name: 'SFTP://' },
    { id: PROTOCOL.HTTP, name: 'HTTP://' },
    { id: PROTOCOL.HTTPS, name: 'HTTPS://' }
  ];

  freqUnitArr: BaseModel[] = [
    { id: AudienceConstants.FREQUENCY_UNIT.DAY, name: 'Day(s)' },
    { id: AudienceConstants.FREQUENCY_UNIT.WEEK, name: 'Week(s)' },
    { id: AudienceConstants.FREQUENCY_UNIT.MONTH, name: 'Months(s)' },

  ];

  compressionArr: BaseModel[] = [
    { id: COMPRESSION.NONE, name: 'No Compression' },
    { id: COMPRESSION.ZIP, name: 'zip' },
    { id: COMPRESSION.GZIP, name: 'gzip' },
  ];

  formValidated: boolean = true;

  objective = {} as PixelDataScheduleDTO

  constructor(
    @Optional() private readonly activeModal: NgbActiveModal,
    private audService: AudienceService,
    // private modalRef: MatDialogRef<RemoteFileModalComponent>,
    // @Inject(MAT_DIALOG_DATA) private configData: any,
  ) { }


  initForm() {
    this.objective.protocol = PROTOCOL.FTP;
    this.objective.frequencyUnit = AudienceConstants.FREQUENCY_UNIT.DAY;
    this.objective.compressionType = COMPRESSION.NONE;
  }

  ngOnInit() {
    if (this.editDetails) {
      // console.log(this.editDetails);
      this.objective = { ...this.editDetails };
      // console.log(this.objective);
    } else {
      this.initForm();
    }
  }

  dismissModal() {
    // this.activeModal.close();
    this.activeModal.close(null);
    // this.modalRef.close();
  }

  done() {
    this.validateRemoteUploadForm();
    if (this.formValidated) {
      this.objective.frequencyValue = Number(this.objective.frequencyValue);

      this.objective.remoteFile = {} as RemoteFileDTO;
      let x = this.objective.protocol as unknown as keyof typeof PROTOCOL;
      let compNum: any = PROTOCOL[x];
      this.objective.remoteFile.protocol = compNum; //will be used to display protocol in ui create page

      // console.log(this.objective)
      // if (this.objective.protocol !== PROTOCOL.SFTP) {
      //   this.audService.checkRemoteFile(this.getPixelRemoteConfigDTO()).subscribe(resp => {
      //     console.log(resp);
      //     if (resp && resp.respObject && resp.respObject.id && resp.respObject.name) {
      //       this.activeModal.close(this.objective);
      //       this.dismissModal();
      //     } else {
      //       console.log('ERROR IN VALIDATION !!');
      //       this.activeModal.close(null);
      //       this.dismissModal();
      //     }
      //   }, error => {
      //     console.log(error);
      //   })
      // } else {

      // this.modalRef.close(this.objective);
      this.activeModal.close(this.objective);
      this.dismissModal();
      //   }
    }
  }

  getPixelRemoteConfigDTO(): PixelRemoteConfigDTO {
    let remoteConfigDTO = {} as PixelRemoteConfigDTO;
    remoteConfigDTO.protocol = this.objective.protocol;
    remoteConfigDTO.password = this.objective.password;
    remoteConfigDTO.url = this.objective.url;
    remoteConfigDTO.username = this.objective.username;
    remoteConfigDTO.remoteFile = {} as RemoteFileDTO;
    return remoteConfigDTO;
  }

  validateRemoteUploadForm() {
    // if (!this.objective.url || !this.objective.frequencyValue || (this.objective.frequencyValue && this.isNotDigit(this.objective.frequencyValue))) {
    //   // console.log('!url OR !value or wrong val');
    //   this.formValidated = false;
    // } else {
    //   this.formValidated = true;
    // }

    let valid: boolean = true;

    if (this.isInvalidUrl()) {
      valid = false;
    }
    if (!this.objective.frequencyValue) {
      valid = false;
      //feilds is required
    }

    if (this.objective.frequencyValue && this.isNotDigit(this.objective.frequencyValue)) {
      valid = false;
      //donot user special chars
    }

    this.formValidated = valid;

  }


  isInvalidUrl(): boolean {
    let url: string = this.objective.url
    if (!url) {
      return true;
    }
    url = url.trim().toLowerCase();
    if (url.startsWith('http') || url.startsWith('https') || url.startsWith('ftp') || url.startsWith('sftp')) {
      return true;
    }
    return false;
  }




  isNotDigit(x): boolean {
    const reg = new RegExp('^[0-9]+$');
    if (Number(x) < 1 || !reg.test(x)) {
      return true;
    }
    return false;
  }

  protocolChange(url_below) {
    if (this.objective.protocol === PROTOCOL.SFTP) {
      url_below.innerText = "In case of SFTP, the data entered won't be validated";
    } else {
      url_below.innerText = ' ';
    }
  }

}

