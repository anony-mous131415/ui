import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatSelect } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AudienceConstants, COMPRESSION, MOBILE_METHOD_RADIO } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitySelectorRadioComponent } from '@app/shared/_directives/entity-selector-radio/entity-selector-radio.component';
import { ComponentCanDeactivate } from '@app/shared/_guard/pending-changes.guard';
import { AlertService } from '@app/shared/_services/alert.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AudienceDTO, DashboardControllerService, PixelDataFileDTO, PixelDataScheduleDTO } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { AudienceRulesComponent } from '../../_directives/audience-rules/audience-rules.component';
import { AudienceObjectiveComponent } from '../../_directives/_modals/audience-objective/audience-objective.component';
import { DmpAudienceModalComponent } from '../../_directives/_modals/dmp-audience-modal/dmp-audience-modal.component';
import { RemoteFileModalComponent } from '../../_directives/_modals/remote-file-modal/remote-file-modal.component';
import { MenucrumbsService } from '@app/shared/_services/menucrumbs.service';

export interface Assigner {
  audienceSrc: any;

  mobileMethodRadio: number;

  rules: any[];
  dispRules: any[];

  dmpDetails: any;

  remoteDetails: PixelDataScheduleDTO;

  localDetails: any;
  filePath: string; // for edit bug

  allowedExtensions: any[];
  apiRulesArr: any;
  apiRulesResp: any;
}

@Component({
  selector: 'app-audience-create',
  templateUrl: './audience-create.component.html',
  styleUrls: ['./audience-create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AudienceCreateComponent implements OnInit, ComponentCanDeactivate {
  @BlockUI() blockUI: NgBlockUI;

  maxFileSizeInKB: number = 2048 * 100;

  showRulesSpinner = false;
  errScrollId: string;
  Duration: any[] = [
    { id: AudienceConstants.DURATION_UNIT.MINUTE, name: 'Minute(s)' },
    { id: AudienceConstants.DURATION_UNIT.HOUR, name: 'Hour(s)' },
    { id: AudienceConstants.DURATION_UNIT.DAY, name: 'Day(s)' },
  ];

  audConst;
  appConst = AppConstants;
  mobileMethodEnum = MOBILE_METHOD_RADIO;

  formValidated: boolean = true;
  audienceDto = {} as AudienceDTO;
  assigner = {} as Assigner;
  audId: number; // only for edit
  dupAudId: number;

  saveClicked: boolean; // to disable propmt on saving campaign
  breadcrumbs: string;


  public modalOption: NgbModalOptions = {}
  public listCtrl: FormControl = new FormControl();
  public listFilterCtrl: FormControl = new FormControl();
  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  @HostListener('window:beforeunload', [])
  canDeactivate(): Observable<boolean> | boolean {
    if (this.saveClicked)
      return true
    return false;
  }

  constructor(
    private readonly modalService: NgbModal,
    private audService: AudienceService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private entitiesService: EntitiesService,
    private dashboardService: DashboardControllerService,
    public dialog: MatDialog,
    private menuService: MenucrumbsService,

  ) { }

  initNewAudience() {
    this.assigner.mobileMethodRadio = MOBILE_METHOD_RADIO.RULE;
    this.assigner.rules = [];
    this.assigner.dispRules = [];
    this.audienceDto.durationUnit = this.Duration[0].id;
    this.openAdvModal(true);
  }

  ngOnInit() {
    this.modalOption.backdrop = 'static'; // these options are same for all modals
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    this.modalOption.centered = true;
    this.saveClicked = false;
    this.audConst = AudienceConstants;
    this.assigner.allowedExtensions = ['csv', 'txt', 'zip', 'gz'];
    this.breadcrumbs = JSON.stringify({ 'audienceCreate': {id: '', name: ''}});
    this.route.paramMap.subscribe(params => {
      const id = params.get('audId');
      const dupId = params.get('audDupId');
      if (dupId && !isNaN(Number(dupId))) {
        this.dupAudId = Number(dupId);
        this.setDuplicateAudience();
      } else {
        if (id && !isNaN(Number(id))) {
          this.audId = Number(id);
          this.getAudienceDetails();
        } else if (!id) {
          this.initNewAudience(); // call for new audience not for edit existing audience
        }
      }
    });

    this.blockUI.stop();
  }

  getDetailsById() {
    this.entitiesService.getDetailsById(this.audId, AppConstants.ENTITY.AUDIENCE).subscribe(response => {
      // console.log(response)
      let breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      if (Object.entries(breadcrumbsObj).length === 0) {
        breadcrumbsObj = {
          audience: { id: this.audienceDto.id, name: this.audienceDto.name },
        };
      }
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  setDuplicateAudience() {
    this.audService.getAudienceById(this.dupAudId).subscribe(resp => {
      let duplicateDto = resp.respObject
      this.audienceDto.name = duplicateDto.name;
      this.audienceDto.advertiser = duplicateDto.advertiser;
      if (duplicateDto.description) {
        this.audienceDto.description = duplicateDto.description;
      }
      if (duplicateDto.userDataType === AudienceConstants.USER_DATA_TYPE.WEBSITE) {
        this.assigner.audienceSrc = AudienceConstants.OBJECTIVE.WEBSITE
      } else if (duplicateDto.userDataType === AudienceConstants.USER_DATA_TYPE.MOBILE) {
        this.assigner.mobileMethodRadio = MOBILE_METHOD_RADIO.RULE;
        this.assigner.audienceSrc = AudienceConstants.OBJECTIVE.MOBILE
      }
      this.audienceDto.duration = duplicateDto.duration;
      this.audienceDto.durationUnit = duplicateDto.durationUnit;
      this.displayRules(duplicateDto.ruleExpression);
    });
  }

  getAudienceDetails() {
    this.audService.getAudienceById(this.audId).subscribe(audResp => {
      // console.log(audResp);
      this.audienceDto = audResp.respObject;
      this.getDetailsById();
      this.setAssigner();
    });
  }

  setAssigner() {
    // called when user edits audience , DMP cannot be edited
    if (this.audienceDto.ruleExpression && !this.audienceDto.pixelDataFile && !this.audienceDto.pixelDataSchedule && this.audienceDto.userDataType === AudienceConstants.USER_DATA_TYPE.WEBSITE) {
      this.assigner.audienceSrc = AudienceConstants.OBJECTIVE.WEBSITE;
    }
    else {
      this.assigner.audienceSrc = AudienceConstants.OBJECTIVE.MOBILE;
      if (this.audienceDto.ruleExpression) {
        this.assigner.mobileMethodRadio = MOBILE_METHOD_RADIO.RULE;
      } else if (this.audienceDto.pixelDataFile) {
        this.assigner.mobileMethodRadio = MOBILE_METHOD_RADIO.DEVICE;
        this.assigner.localDetails = this.audienceDto.pixelDataFile;
        this.assigner.filePath = this.assigner.localDetails.filePath;
      } else if (this.audienceDto.pixelDataSchedule) {
        this.assigner.mobileMethodRadio = MOBILE_METHOD_RADIO.DEVICE;
        this.assigner.remoteDetails = this.audienceDto.pixelDataSchedule;
      }
    }

    if (this.audienceDto.ruleExpression) {
      this.displayRules(this.audienceDto.ruleExpression);
    }
  }

  openAdvModal(init?: boolean) {
    const modal: NgbModalRef = this.modalService.open(EntitySelectorRadioComponent, this.modalOption);
    modal.componentInstance.entityType = AppConstants.ENTITY.ADVERTISER; // will open for 'advertiser' only
    modal.result.then((result) => {
      if (result) {
        this.audienceDto.advertiser = result; // directly
        this.audService.getAccess(this.audienceDto.advertiser.id).subscribe(resp => {  // api call for isDmpAccess
          // console.log(resp);
          if (resp && resp.respObject) {
            this.audService.accessRefresh(resp.respObject.isDmpAccess);
            // if (init) {
            this.assigner.audienceSrc = null; // reset on change of advertiser
            this.openObjectiveModal();
            // }
          }
        });
      }
    });
  }

  openObjectiveModal() {
    this.modalOption.size = null;
    const modal: NgbModalRef = this.modalService.open(AudienceObjectiveComponent, this.modalOption);
    modal.result.then((result) => {
      if (result) {
        // console.log(result);
        if (this.assigner.audienceSrc !== result) {
          // objective changed !!
          // console.log('objective changed !!');
          this.audienceDto.name = null; // reset this bcz if switch from DMP to WEBSITE/MOBILE then name used to be the one from DMP
          this.audienceDto.description = null;
        }
        this.assigner.audienceSrc = result;
        if (result === AudienceConstants.OBJECTIVE.DMP) {
          this.openModalForDmpAudience();
        }
      }
    });
    this.modalOption.size = 'lg';
  }

  openModalForDmpAudience() {
    let dataRequired = {
      advertierId: null,
      previousSelection: null
    }

    if (this.audienceDto.advertiser) {
      dataRequired.advertierId = this.audienceDto.advertiser.id;
    }
    if (this.assigner && this.assigner.dmpDetails) {
      dataRequired.previousSelection = this.assigner.dmpDetails;
    }

    let dialogRef = this.dialog.open(DmpAudienceModalComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: {
        advertiserId: dataRequired.advertierId,
        previousSelection: dataRequired.previousSelection
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && (!this.assigner.dmpDetails || result.sid !== this.assigner.dmpDetails.sid)) {
        this.assigner.dmpDetails = result;
        this.convertUiToDto();
      }
    });
  }

  openRemoteModal(editDetail?: any) {
    const modal: NgbModalRef = this.modalService.open(RemoteFileModalComponent, this.modalOption);
    if (editDetail) {
      modal.componentInstance.editDetails = editDetail;
    }
    modal.result.then((result) => {
      if (result) {
        this.assigner.localDetails = null;
        this.assigner.remoteDetails = result;
      }
    });
  }

  openRulesModal(rule?: any, editIndex?: number) {
    // this.modalOption.size = 'xl';
    this.showRulesSpinner = true;
    this.audService.getRules().subscribe(resp => {
      this.assigner.apiRulesResp = resp;
      this.assigner.apiRulesArr = resp.respObject.metaRules;
      this.showRulesSpinner = false;
      const modal: NgbModalRef = this.modalService.open(AudienceRulesComponent, this.modalOption);
      modal.componentInstance.inputRuleResp = this.assigner.apiRulesResp;
      if (rule) {
        modal.componentInstance.ruleToBeEdited = rule;
      }
      modal.result.then((result) => {
        if (result) {
          if (editIndex >= 0) {
            this.assigner.rules.splice(editIndex, 0, result);
          }
          else {
            this.assigner.rules.push(result);
          }
          this.assigner.dispRules = this.audService.getDispRules(this.assigner.rules, this.assigner.apiRulesArr);
        }
      });
    })
  }

  removeRule(indexToBeRemoved) {
    // let indexToBeRemoved = this.assigner.rules.findIndex(x => x.id === rule.id);
    // console.log('indexToBeRemoved==>', indexToBeRemoved);
    this.assigner.rules.splice(indexToBeRemoved, 1);
    this.assigner.dispRules.splice(indexToBeRemoved, 1);
    // console.log(this.assigner.dispRules);
  }

  editRule(indexToBeEdited) {
    // console.log('indexToBeEdited==>', indexToBeEdited);
    // this.openRulesModal(this.assigner.dispRules[indexToBeEdited]);
    this.openRulesModal(this.assigner.rules[indexToBeEdited], indexToBeEdited);
    this.removeRule(indexToBeEdited);

  }

  save() {
    this.validateUIModel();
    if (!this.formValidated) {
      this.scrollToError();
      return;
    }
    this.saveClicked = true;
    this.convertUiToDto();
    // console.log(this.audienceDto);

    this.blockUI.start();
    if (!this.audId) {
      this.audService.createAudience(this.audienceDto).subscribe(resp => {
        if (resp && resp.respObject) {
          // console.log('resp ', resp);
          this.menuService.invalidateMenucrumbsData();
          this.router.navigate(['/audience/details/' + resp.respObject.id]);
          this.blockUI.stop();
        }
      }, (error: any) => {
        this.saveClicked = false;
        this.blockUI.stop();
      });
    } else {
      this.audService.updateAudience(this.audienceDto, this.audId).subscribe(resp => {
        if (resp && resp.respObject) {
          // console.log('resp ', resp);
          this.menuService.invalidateMenucrumbsData();
          this.router.navigate(['/audience/details/' + resp.respObject.id]);
          this.blockUI.stop();
        }
      }, (error: any) => {
        this.saveClicked = false;
        this.blockUI.stop();
      });

    }
  }

  validateUIModel() {
    this.errScrollId = 'tile-basic';
    if (!this.audienceDto.name) {
      // console.log('invalid ==> name or advertier missing');
      this.formValidated = false;
      return;
    }
    if (!this.assigner.audienceSrc) {
      // console.log('invalid ==> audience source missing');
      this.formValidated = false;
      return;
    } else {
      this.errScrollId = null;
      switch (this.assigner.audienceSrc) {
        case AudienceConstants.OBJECTIVE.WEBSITE:
          if ((this.assigner.rules.length < 1 || !this.audienceDto.duration) || (this.audienceDto.duration && this.isInvalidNum(this.audienceDto.duration) || this.isLessThanOne(this.audienceDto.duration))) {
            // console.log('invalid ==> duration or rules missing ');
            this.formValidated = false;
            return;
          }
          break;

        case AudienceConstants.OBJECTIVE.MOBILE:
          if (this.assigner.mobileMethodRadio === MOBILE_METHOD_RADIO.RULE) {
            if ((this.assigner.rules.length < 1 || !this.audienceDto.duration) || (this.audienceDto.duration && this.isInvalidNum(this.audienceDto.duration) || this.isLessThanOne(this.audienceDto.duration))) {
              // console.log('invalid ==> duration or rules missing ');
              this.formValidated = false;
              return;
            }
          } else if (this.assigner.mobileMethodRadio === MOBILE_METHOD_RADIO.DEVICE) {
            if (!this.assigner.remoteDetails && !this.assigner.localDetails) {
              // console.log('invalid ==> no local OR remote file');
              this.formValidated = false;
              return;
            }
          }
          break;

        case AudienceConstants.OBJECTIVE.DMP:
          if (!this.assigner.dmpDetails) {
            // console.log('invalid ==> DMP segment missing');
            this.alertService.warning(AudienceConstants.VALIDATION_DMP_MISSING, false, true);
            var that = this;
            setTimeout(function () {
              that.alertService.clear(true);
            }, 3000);
            this.formValidated = false;
            return;
          }
          break;
      }
    }
    this.formValidated = true;
  }

  convertUiToDto() {
    this.audienceDto.active = true; // HARD-CODED

    // other pojo assignments
    switch (this.assigner.audienceSrc) {
      case AudienceConstants.OBJECTIVE.WEBSITE:
        this.audienceDto.segmentType = AudienceConstants.SEGMENT_TYPE.WEBSITE;
        this.audienceDto.userDataType = AudienceConstants.USER_DATA_TYPE.WEBSITE;
        this.audienceDto.dataSourceType = AudienceConstants.DATA_SRC_TYPE.WEBSITE;
        this.audienceDto.pixelDataFile = null;
        this.audienceDto.pixelDataSchedule = null;
        this.audienceDto.segmentType = null;
        this.audienceDto.remoteSegmentId = null;
        break;

      case AudienceConstants.OBJECTIVE.MOBILE:
        this.audienceDto.segmentType = AudienceConstants.SEGMENT_TYPE.MOBILE
        this.audienceDto.userDataType = AudienceConstants.USER_DATA_TYPE.MOBILE;
        this.audienceDto.remoteSegmentId = null;

        this.audienceDto.pixelDataFile = null; // for mobile(local) ruleExp will be asssigned below
        this.audienceDto.pixelDataSchedule = null; // for mobile(remote) ruleExp will be asssigned below
        this.audienceDto.ruleExpression = null; // for mobile(rule) ruleExp will be asssigned below
        this.audienceDto.remoteSegmentId = null;

        if (this.assigner.mobileMethodRadio === MOBILE_METHOD_RADIO.RULE) {
          this.audienceDto.dataSourceType = AudienceConstants.DATA_SRC_TYPE.MOBILE_RULE; // MOBILE-RULE (rule expression assigned at last)
        } else if (this.assigner.mobileMethodRadio === MOBILE_METHOD_RADIO.DEVICE && this.assigner.remoteDetails) { // MOBILE-LOCAL
          this.audienceDto.dataSourceType = AudienceConstants.DATA_SRC_TYPE.MOBILE_REMOTE;

          this.audienceDto.pixelDataSchedule = {} as PixelDataScheduleDTO;
          this.audienceDto.pixelDataSchedule = this.assigner.remoteDetails;
        } else if (this.assigner.mobileMethodRadio === MOBILE_METHOD_RADIO.DEVICE && this.assigner.localDetails) { // MOBILE-REMOTE
          this.audienceDto.dataSourceType = AudienceConstants.DATA_SRC_TYPE.MOBILE_LOCAL;

          this.audienceDto.pixelDataFile = {} as PixelDataFileDTO;
          this.audienceDto.pixelDataFile.name = this.assigner.localDetails.name;
          this.audienceDto.pixelDataFile.filePath = this.assigner.filePath;
          let typedCompString = this.assigner.localDetails.compressionType as keyof typeof COMPRESSION;
          let compNum: any = COMPRESSION[typedCompString];
          this.audienceDto.pixelDataFile.compressionType = compNum;
        }

        break;

      case AudienceConstants.OBJECTIVE.DMP:
        this.audienceDto.segmentType = AudienceConstants.SEGMENT_TYPE.DMP;
        this.audienceDto.userDataType = AudienceConstants.USER_DATA_TYPE.DMP;
        this.audienceDto.dataSourceType = AudienceConstants.DATA_SRC_TYPE.DMP;
        this.audienceDto.pixelDataFile = null;
        this.audienceDto.ruleExpression = null;

        this.audienceDto.remoteSegmentId = this.assigner.dmpDetails.sid;
        this.audienceDto.name = this.assigner.dmpDetails.sname;
        this.audienceDto.description = this.assigner.dmpDetails.sdescription;

        this.audienceDto.pixelDataSchedule = {} as PixelDataScheduleDTO;
        this.audienceDto.pixelDataSchedule.protocol = AudienceConstants.DMP_DATA_SCHEDULE.PROTOCOL;
        this.audienceDto.pixelDataSchedule.url = AudienceConstants.DMP_DATA_SCHEDULE.URL
        this.audienceDto.pixelDataSchedule.encodingType = AudienceConstants.DMP_DATA_SCHEDULE.ENCODING;
        this.audienceDto.pixelDataSchedule.compressionType = AudienceConstants.DMP_DATA_SCHEDULE.COMPR;
        this.audienceDto.pixelDataSchedule.frequencyValue = AudienceConstants.DMP_DATA_SCHEDULE.FREQ_VAL;
        this.audienceDto.pixelDataSchedule.frequencyUnit = AudienceConstants.DMP_DATA_SCHEDULE.FREQ_UNIT;

        break;
    }

    if (this.assigner.audienceSrc === AudienceConstants.OBJECTIVE.WEBSITE || (this.assigner.audienceSrc === AudienceConstants.OBJECTIVE.MOBILE && this.assigner.mobileMethodRadio === MOBILE_METHOD_RADIO.RULE)) {
      this.audienceDto.duration = Number(this.audienceDto.duration);
      this.audienceDto.ruleExpression = this.audService.getFinalRuleExp(this.assigner.rules);
    } else { // DEFAULT EXPIRY
      this.audienceDto.duration = AudienceConstants.DEFAULT_DUARTION_VALUE;
      const unit: any = AudienceConstants.DURATION_UNIT.DAY;
      this.audienceDto.durationUnit = unit;
    }

  }

  isLessThanOne(x) {
    if (Number(x) < 1)
      return true;
    else
      return false;
  }

  isInvalidNum(x) {
    const reg = new RegExp('^[0-9]+$');
    if (!reg.test(x)) {
      return true;
    }
    return false;
  }


  localFileUpload(event) {
    // console.log(event);
    this.assigner.remoteDetails = null;
    this.assigner.localDetails = event.data[0];
    this.assigner.filePath = this.assigner.localDetails.localFileLocation;
  }

  changeFile(fileType: string, action: number) {
    if (!action) {
      if (this.assigner.localDetails) {
        this.assigner.localDetails = null;
      } else if (this.assigner.remoteDetails) {
        this.assigner.remoteDetails = null;
      }
    } else if (fileType === 'remote') {
      this.openRemoteModal(this.assigner.remoteDetails);
    }
  }

  scrollToError() {
    if (this.errScrollId) {
      let el = document.getElementById(this.errScrollId);
      if (el)
        el.scrollIntoView({ behavior: 'smooth' });
    }
  }


  getUrl() {
    if (this.audienceDto.advertiser) {
      return 'advertiser/smarttag/' + this.audienceDto.advertiser.id;
    }
    return 'advertiser/smarttag';
  }

  displayRules(ruleExpression) {
    this.assigner.rules = this.audService.ruleDtoToReqRules(ruleExpression);
    this.showRulesSpinner = true;
    this.audService.getRules().subscribe(resp => {
      this.assigner.apiRulesResp = resp;
      this.assigner.apiRulesArr = resp.respObject.metaRules;
      this.assigner.dispRules = this.audService.getDispRules(this.assigner.rules, this.assigner.apiRulesArr);
      this.showRulesSpinner = false;
    });
  }

  onCancelClick() {
    if (!this.audId) {
      // this.router.navigate(['audience']);
      this.router.navigate(['audience'], {
        queryParams: {
          'type': 'app'
        }
      });

    } else {
      this.router.navigate(['audience', 'details', this.audId]);
    }
  }

}
