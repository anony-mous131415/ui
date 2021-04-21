import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PixelConstants } from '@app/entity/advertiser/_constants/PixelConstants';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { EntitiesService } from '@app/shared/_services/entities.service';
import { BaseModel, Pixel } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';


export interface TimeModel {
  value: string;
  unit: string;
}

@Component({
  selector: 'app-conversion-tracker-create',
  templateUrl: './conversion-tracker-create.component.html',
  styleUrls: ['./conversion-tracker-create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConversionTrackerCreateComponent implements OnInit, AfterViewInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;

  @Input() type: string;
  @Input() advertiserDetails: string;

  @Input() isNavbarRequired: boolean = true;


  @Output() buttonClick: EventEmitter<any> = new EventEmitter();
  errScrollId: string;
  appConst = AppConstants;

  pxlConst; pixelDto; radio: number;
  clickTime; viewTime; fcapTime;
  formValidated = true; advId: number; pixId: number;
  newPixel: boolean;
  saveClicked: boolean; //to disable propmt on saving pixel


  Num: string[] = [];
  Duration: string[] = ['Minute(s)', 'Hour(s)', 'Day(s)'];
  TypeStr: string[] = ['View', 'Click', 'Hybrid'];
  selectedTypeStr: string;
  Type: BaseModel[] = [
    { id: 0, name: 'VIEW_CONV' },
    { id: 1, name: 'CLICK_CONV' },
    { id: 2, name: 'HYBRID_CONV' },
  ];

  breadcrumbs: string;
  closed = false;

  constructor(
    private entitiesService: EntitiesService,
    private advService: AdvertiserService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  @HostListener('window:beforeunload', [])
  canDeactivate(): Observable<boolean> | boolean {
    if (this.saveClicked)
      return true
    return false;
  }

  initializeValues() {
    this.radio = 1;
    this.newPixel = true;
    this.clickTime = { value: '45', unit: this.Duration[2] };
    this.viewTime = { value: '45', unit: this.Duration[2] };
    this.fcapTime = { value: '10', unit: this.Duration[0] };
    this.pixelDto.type = this.Type[2];
    this.selectedTypeStr = this.TypeStr[2];
  }

  ngOnInit() {
    this.pxlConst = PixelConstants;
    this.pixelDto = {} as Pixel;
    this.clickTime = {} as TimeModel;
    this.viewTime = {} as TimeModel;
    this.fcapTime = {} as TimeModel;
    this.saveClicked = false;
    for (let i = 0; i < 45; i++) {
      this.Num[i] = (i + 1).toString();
    }

    if (this.advertiserDetails) {//if opened as modal
      this.modalInitHandler();
    } else {
      this.route.paramMap.subscribe(params => {
        // console.log(params);
        const id = params.get('id');
        const pid = params.get('pid');
        if (!pid) {
          this.initializeValues();
          if (id && !isNaN(Number(id))) {
            this.advId = Number(id);
            this.getDetailsById(Number(id));
            this.entitiesService.getDetailsById(this.advId, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
              // console.log('response ,', response);
              this.pixelDto.advertiserPojo = response.respObject;
            });
          }
        } else if (id && !isNaN(Number(id)) && !isNaN(Number(pid))) {
          this.newPixel = false;
          this.advId = Number(id);
          this.pixId = Number(pid);
          this.getDetailsById(Number(id));
          this.advService.getPixelById(this.pixId).subscribe(respPixel => {
            // console.log(respPixel);
            this.convertDtoToUi(respPixel);
          });
        }
      });
    }

    this.blockUI.stop();

  }

  ngOnDestroy() {
    this.blockUI.stop(); //needed when opened as modal
  }

  ngAfterViewInit() {
    this.scrollToTop();
  }

  modalInitHandler() {
    this.initializeValues();
    this.pixelDto.advertiserPojo = JSON.parse(this.advertiserDetails);
  }

  modalSavedHandler() {
    this.blockUI.start();

    this.advService.createPixel(this.pixelDto).subscribe(resp => {
      // console.log(resp);
      this.buttonClick.emit(PixelConstants.MODAL.SAVE);
      this.blockUI.stop();
    }, (error: any) => {

      this.blockUI.stop();

    });
  }


  save() {

    // console.log(this.pixelDto)

    this.validateUIModel();
    if (!this.formValidated) {
      this.scrollToError();
      return;
    }

    this.blockUI.start();
    this.saveClicked = true;

    this.convertUiToDto();
    // console.log('dto to be saved ==>', this.pixelDto);
    if (this.advertiserDetails) {//if opened as modal
      this.modalSavedHandler();
    } else {
      if (this.pixId) {
        this.advService.updatePixel(this.pixId, this.pixelDto).subscribe(resp => {
          this.router.navigate(['/advertiser/' + this.advId + '/pixel/details/' + this.pixId]);
          this.blockUI.stop();

        }, (error: any) => {
          this.saveClicked = false;
          this.blockUI.stop();

        });
      } else {
        this.advService.createPixel(this.pixelDto).subscribe(resp => {
          this.router.navigate(['/advertiser/' + this.advId + '/pixel/details/' + resp.respObject.id]);
          this.blockUI.stop();

        }, (error: any) => {
          this.saveClicked = false;
          this.blockUI.stop();

        });
      }
    }
  }

  validateUIModel() {
    const pixel = this.pixelDto;
    this.formValidated = true;
    this.errScrollId = 'bc-cont';
    if (!pixel.name) {
      this.formValidated = false;
      // console.log('name invalid !!');
      return;
    }

    this.errScrollId = 'tile-settings';
    if (this.radio === 2) {
      if (!pixel.userFcap || this.isInvalidNumber(Number(pixel.userFcap)) || !this.fcapTime.value || !this.fcapTime.unit) {
        this.formValidated = false;
        // console.log('radio input invalid !!');
      }
    }

  }

  convertUiToDto() {
    this.pixelDto.type = this.Type[this.TypeStr.indexOf(this.selectedTypeStr)];
    // type is click
    if (this.pixelDto.type.id === this.Type[0].id) {
      this.pixelDto.viewValidityWindow = this.timeModelToNumber(this.viewTime);
      this.pixelDto.clickValidityWindow = -1; // special value
    } else if (this.pixelDto.type.id === this.Type[1].id) { // type is view
      this.pixelDto.viewValidityWindow = -1; // special value
      this.pixelDto.clickValidityWindow = this.timeModelToNumber(this.clickTime);
    } else { // type is hybrid
      this.pixelDto.viewValidityWindow = this.timeModelToNumber(this.viewTime);
      this.pixelDto.clickValidityWindow = this.timeModelToNumber(this.clickTime);
    }
    if (this.radio === 1) {
      this.pixelDto.userFcap = (-1);
      this.pixelDto.fcapDuration = (-1);
    }
    if (this.radio === 2) {
      this.pixelDto.userFcap = Number(this.pixelDto.userFcap);
      this.pixelDto.fcapDuration = this.timeModelToNumber(this.fcapTime);
    }

    //create mode : activate pixel by default
    if (!this.pixId) {
      this.pixelDto.active = true;
    }

  }

  convertDtoToUi(respPixel) {
    this.pixelDto = respPixel.respObject;
    // type is view
    if (this.pixelDto.type.id === this.Type[0].id) {
      this.viewTime = this.NumberToTimeModel(this.pixelDto.viewValidityWindow);
      this.clickTime = { value: '45', unit: this.Duration[2] };
    }
    // type is click
    else if (this.pixelDto.type.id === this.Type[1].id) {
      this.viewTime = { value: '45', unit: this.Duration[2] };
      this.clickTime = this.NumberToTimeModel(this.pixelDto.clickValidityWindow);
    }
    // type is hybrid
    else {
      this.viewTime = this.NumberToTimeModel(this.pixelDto.viewValidityWindow);
      this.clickTime = this.NumberToTimeModel(this.pixelDto.clickValidityWindow);
    }
    if (this.pixelDto.fcapDuration !== -1) {
      this.radio = 2;
      this.fcapTime = this.NumberToTimeModel(this.pixelDto.fcapDuration);
    }
    if (this.pixelDto.fcapDuration === -1) {
      this.radio = 1;
      this.fcapTime = { value: '10', unit: this.Duration[1] };
    }
    this.selectedTypeStr = this.TypeStr[this.pixelDto.type.id];
    // console.log('DTO from pid un url==>', this.pixelDto);
  }


  timeModelToNumber(time: TimeModel): number {
    const secondsDay = 86400;
    const secondsHour = 3600;
    const secondsMinute = 60;
    let num = 0;
    if (time.unit === this.Duration[0]) {
      num = Number(time.value) * secondsMinute;
    } else if (time.unit === this.Duration[1]) {
      num = Number(time.value) * secondsHour;
    } else if (time.unit === this.Duration[2]) {
      num = Number(time.value) * secondsDay;
    }
    return num;
  }

  NumberToTimeModel(timeInSeconds: number, entity?: string): TimeModel {
    const secondsDay = 86400;
    const secondsHour = 3600;
    const secondsMin = 60;
    const timeModel = {} as TimeModel;

    if (!timeInSeconds || timeInSeconds === -1) {
      return { value: '10', unit: this.Duration[1] };
    } else {
      if (Math.floor(timeInSeconds % secondsDay) === 0) {
        timeModel.value = Math.floor(timeInSeconds / secondsDay).toString();
        timeModel.unit = this.Duration[2];
        return timeModel;
      } else if (Math.floor(timeInSeconds % secondsHour) === 0) {
        timeModel.value = Math.floor(timeInSeconds / secondsHour).toString();
        timeModel.unit = this.Duration[1];
        return timeModel;
      } else if (Math.floor(timeInSeconds % secondsMin) === 0) {
        timeModel.value = Math.floor(timeInSeconds / secondsMin).toString();
        timeModel.unit = this.Duration[0];
        return timeModel;
      }
    }
  }

  // returns true is (x) is Not a number(or number less that 1) , if (X)is number => false
  isInvalidNumber(x) {
    const reg = new RegExp('^[0-9]+$');
    return (!reg.test(x) || x < 1);
  }

  getDetailsById(id: number) {
    this.entitiesService.getDetailsById(id, AppConstants.ENTITY.ADVERTISER).subscribe(response => {
      const breadcrumbsObj = this.entitiesService.createBCObject(response.respObject);
      this.breadcrumbs = JSON.stringify(breadcrumbsObj);
    });
  }

  onCancel() {
    if (this.advertiserDetails) {
      this.buttonClick.emit(PixelConstants.MODAL.CLOSE);
    } else {
      // this.router.navigate(['/advertiser/' + this.advId + '/pixel']);
      this.router.navigate(['/advertiser/details/' + this.advId + '/pixel']);

    }
  }

  scrollToError() {
    // console.log('Went to==>', this.errScrollId);
    let el = document.getElementById(this.errScrollId);
    if (el)
      el.scrollIntoView({ behavior: 'smooth' });
  }

  private scrollToTop() {
    const pageContainer = document.querySelector('.pxl-form-container');
    if (pageContainer !== null && pageContainer !== undefined) {
      setTimeout(() => { pageContainer.scrollIntoView({ behavior: 'smooth' }); }, 500);
    }
  }
}
