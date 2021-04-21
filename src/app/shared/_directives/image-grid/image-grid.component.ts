import { AfterViewInit, Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { AdvConstants } from '@app/entity/advertiser/_constants/AdvConstants';
import { LogoFallbackUploadModalComponent } from '@app/shared/_components/pixel/logo-fallback-upload-modal/logo-fallback-upload-modal.component';
import { UPLOAD_CONST } from '@app/entity/advertiser/_services/advertiser.service';
import { ConfirmationModalComponent } from '@app/shared/_directives/_modals/confirmation-modal/confirmation-modal.component';
import { ApiResponseObjectListAppSettingsDTO, AppSettingsControllerService, AppSettingsDTO, AppSettingsPropertyDTO } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { ImageGridModalComponent } from '../_modals/image-grid-modal/image-grid-modal.component';

export interface ImageData {
  id: number;
  name: string;
  url: string;
  isSelected: boolean;
  props: AppSettingsPropertyDTO[];
  key: AppSettingsDTO.SettingsKeyEnum;
}

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss']
})
export class ImageGridComponent implements OnInit, OnDestroy, AfterViewInit {
  @BlockUI() blockUI: NgBlockUI;

  @Input() key: string;
  @Input() advId: number;
  @Input() type: number;
  @Input() title: string;
  @Input() showTitle: boolean;
  @Input() imgList: ImageData[];
  @Input() canSelectMultiple: boolean;
  @Output() selectedImagesEvent: EventEmitter<any> = new EventEmitter();

  
  //REVX-974 : when used for native creative : default logo is selectable 
  //but we must not show delete btn when default logo is selected
  @Input() canSelectDefaultLogo: boolean;

  selectedImages: ImageData[] = [];



  searchSubscription: Subscription;
  appConst = AppConstants;
  c1Images: ImageData[] = [];
  c2Images: ImageData[] = [];
  c3Images: ImageData[] = [];
  c4Images: ImageData[] = [];
  c5Images: ImageData[] = [];
  c6Images: ImageData[] = [];
  advConst = AdvConstants;
  ctrl = new FormControl();
  creativeSizeFilterCtrl = new FormControl();
  searchText: string;
  creativesize: any;

  creativeSizeMap = new Map<string, ImageData[]>();
  creativeSizeList: any[];
  requestInProgress = false;
  isDataAvailable = false;

  constructor(
    private modal: MatDialog,
    private appSettingService: AppSettingsControllerService,
    // private http: HttpClient
  ) { }

  ngOnInit() {
    if (this.imgList && this.imgList.length > 0) {
      this.isDataAvailable = true;
      this.groupImages(this.imgList);
      this.creativeSizeList = this.extractCreativeSizes(this.imgList);
    } else {
      this.getImageListForKey(this.key, this.advId);
    }
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.searchSubscription = this.ctrl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        value => {
          this.searchCreatives(value);
        }
      );
  }

  getImageList(index: number) {
    switch (index) {
      case 1: return this.c1Images;
      case 2: return this.c2Images;
      case 3: return this.c3Images;
      case 4: return this.c4Images;
      case 5: return this.c5Images;
      case 6: return this.c6Images;
    }
  }

  openUploadModel() {
    switch (this.type) {
      case UPLOAD_CONST.LOGO: this.openLogoUploadModel(); break;
      case UPLOAD_CONST.FALLBACK: this.openFallbackImageUploadModel(); break;
      case UPLOAD_CONST.OVERLAY: this.openOverlayImageUploadModel(); break;
      default: return;
    }
  }

  expandImageGrid() {
    this.openImageGridModal();
  }


  //REVX-974 : when used for native creative : default logo is selectable 
  //but we must not show delete btn when default logo is selected
  toggleSelected(image: ImageData) {
    const isCurrentlySelected = image.isSelected;
    if (isCurrentlySelected) {
      // remove from selected list
      const index = this.selectedImages.findIndex(item => item.id === image.id);
      if (index !== -1) {
        this.selectedImages.splice(index, 1);
      }
    } else {
      // add to selected list
      if (this.canSelectMultiple !== undefined && !this.canSelectMultiple) {
        this.selectedImages.forEach(image => {
          image.isSelected = false;
        });
        this.selectedImages = [];
      }
      this.selectedImages.push(image);
    }
    image.isSelected = !image.isSelected;
    this.selectedImagesEvent.emit(this.selectedImages);
  }

  onDeleteSelectedImages() {
    if (this.selectedImages.length > 0) {
      const msg = `You are about the delete ${this.selectedImages.length}
       ${this.getTypeTitle(this.type)}. Are you sure you want to continue ?`;

      const modalRef = this.modal.open(ConfirmationModalComponent, {
        data: {
          title: 'Warning',
          message: msg
        },
      });

      modalRef.afterClosed().subscribe(
        confirmed => {
          if (confirmed) {
            this.blockUI.start('Deleting ' + this.getTypeTitle(this.type) + ', Please wait...');
            this.deleteSelectedImages();
          }
        }
      );
    }
  }

  onCreativeSizeChange(event: any) {
    let imageList: ImageData[] = [];
    if (event && event.value && event.value.length > 0) {
      event.value.forEach(item => {
        imageList.push(...this.creativeSizeMap.get(item.name));
      });
    } else {
      imageList = [...this.imgList];
    }

    this.groupImages(imageList);
  }

  getImageListForKey(key: any, advId: number) {
    this.requestInProgress = true;
    // this.http.get('http://localhost:10045/v2/api/appsettings?advertiserId=' + advId + '&settingsKey=' + key, {
    //   headers: { token: 'eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNp0js1Kw0AQx18lzDmUDaml6UkxEQKxSq-uyLqZ0LHpJuxuolLyJh58Pp_C2VTEi5dh-M3_Y07ghmfYgHL7VzKLEc1B-UvVNC0udHeEGJzuenQs2d1VxdNVfltumZLysElWYinSRCRJDPjW_4BlNoMXT2ySQ76-WPHMxXreBc-iyL8-P0KKC8EnCYNDW9aSEzKRxRLU4PedJU_oGD7IP-USHuOzwagj8lX-97wEFjpsUXusK9JoHAYD9-nBWjT6_bqrzxHldjfLlfY0BtSo1iEDCl-lKW-_dTct9QdlfVSamlR0P_qo8iybJpi-AQAA__8.VHn15O4KS311mkoZFJiNDdR1BvF4ytsG3IIjD7iyAM4' }
    // })
    key = key === 'LOGO_LINK' ? [key, 'DEFAULT_LOGO'] : [key];
    this.appSettingService.getAppSettingsUsingGET(advId, null, key)
      .subscribe((resp: ApiResponseObjectListAppSettingsDTO) => {
        if (resp && resp.respObject && resp.respObject.length > 0) {
          const appSettingsList: AppSettingsDTO[] = resp.respObject;
          this.imgList = appSettingsList.map((item: AppSettingsDTO) => {
            return {
              id: item.id,
              name: this.extractNameFromUrl(item.settingsValue),
              url: item.settingsValue,
              isSelected: false,
              props: item.appSettingsProperties,
              key: item.settingsKey
            } as ImageData;
          });
          this.groupImages(this.imgList);
          this.creativeSizeList = this.extractCreativeSizes(this.imgList);
          this.isDataAvailable = true;
        } else {
          this.isDataAvailable = false;
        }
        this.requestInProgress = false;
        this.blockUI.stop();
      }, error => {
        this.requestInProgress = false;
        this.blockUI.stop();
      });
  }

  deleteSelectedImages() {
    // call update api with isActive as false
    const appSettingsList: AppSettingsDTO[] = [];
    this.selectedImages.forEach(item => {
      const appSetting: AppSettingsDTO = {
        id: item.id,
        advertiserId: this.advId,
        active: false,
        settingsKey: this.key,
        settingsType: AppSettingsDTO.SettingsTypeEnum.STRING,
        settingsValue: item.url, // .replace('https', 'http'),
        appSettingsProperties: [],
      } as AppSettingsDTO;
      appSettingsList.push(appSetting);
    });

    // this.http.post('http://localhost:10045/v2/api/appsettings/update', appSettingsList, {
    //   headers: { token: 'eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNp0js1Kw0AQx18lzDmUDaml6UkxEQKxSq-uyLqZ0LHpJuxuolLyJh58Pp_C2VTEi5dh-M3_Y07ghmfYgHL7VzKLEc1B-UvVNC0udHeEGJzuenQs2d1VxdNVfltumZLysElWYinSRCRJDPjW_4BlNoMXT2ySQ76-WPHMxXreBc-iyL8-P0KKC8EnCYNDW9aSEzKRxRLU4PedJU_oGD7IP-USHuOzwagj8lX-97wEFjpsUXusK9JoHAYD9-nBWjT6_bqrzxHldjfLlfY0BtSo1iEDCl-lKW-_dTct9QdlfVSamlR0P_qo8iybJpi-AQAA__8.VHn15O4KS311mkoZFJiNDdR1BvF4ytsG3IIjD7iyAM4' }
    // })
    this.appSettingService.updateAppSettingsUsingPOST(appSettingsList)
      .subscribe((resp: ApiResponseObjectListAppSettingsDTO) => {
        if (resp && resp.respObject) {
          this.getImageListForKey(this.key, this.advId);
          this.selectedImages = [];
        }
      }, error => {
        this.blockUI.stop();
      });
  }

  /**
   * REVX-450
   * This methods sets the necessary configuration details for logo upload and shows LogoFallbackUploadModalComponent as a modal
   */
  openLogoUploadModel() {
    const config = {
      title: this.advConst.UPLOAD_LOGO_MODAL_TITLE,
      allowMultipleUploads: true,
      extensions: ['.jpg', '.jpeg', '.png'],
      dimensions: [{ w: 300, h: 300 }],
      maxFileSize: 2048,
    };
    this.openUploadModal(config);
  }

  /**
   * REVX-450
   * This methods sets the necessary configuration details for fallback image upload and shows LogoFallbackUploadModalComponent as a modal
   */
  openFallbackImageUploadModel() {
    const config = {
      title: this.advConst.UPLOAD_FALLBACK_MODAL_TITLE,
      allowMultipleUploads: true,
      extensions: ['.jpg', '.jpeg', '.png'],
      dimensions: null,
      maxFileSize: 2048,
    };
    this.openUploadModal(config);
  }

  /**
   * REVX-450
   * This methods sets the necessary configuration details for overlay image upload and shows LogoFallbackUploadModalComponent as a modal
   */
  openOverlayImageUploadModel() {
    const config = {
      title: this.advConst.UPLOAD_OVERLAY_MODAL_TITLE,
      allowMultipleUploads: true,
      extensions: ['.jpg', '.jpeg', '.png', '.gif'],
      dimensions: null,
      maxFileSize: 2048,
    };
    this.openUploadModal(config);
  }

  /**
   * REVX-450
   * This methods handles openning and closing of LogoFallbackUploadModalComponent modal
   * @param config - configuration object to be passed to the LogoFallbackUploadModalComponent
   */
  openUploadModal(config: any) {
    const modalRef = this.modal.open(LogoFallbackUploadModalComponent, {
      width: '99%',
      maxHeight: '90vh',
      disableClose: true,
      data: config
    });

    modalRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          const uploadedFiles: any[] = result.data;
          if (uploadedFiles) {
            this.blockUI.start(`Saving uploaded ${this.getTypeTitle(this.type)}. Please wait...`);
            const appSettingsList: AppSettingsDTO[] = [];
            uploadedFiles.forEach(file => {
              const appSetting: AppSettingsDTO = {
                advertiserId: this.advId,
                active: true,
                settingsKey: this.key,
                settingsType: AppSettingsDTO.SettingsTypeEnum.STRING,
                settingsValue: file.url, // .replace('https', 'http'),
                appSettingsProperties: this.getAppSettingProps(file.prop)
              } as AppSettingsDTO;
              appSettingsList.push(appSetting);
            });
            // this.http.post('http://localhost:10045/v2/api/appsettings', appSettingsList, {
            //   headers: { token: 'eyJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNp0js1Kw0AQx18lzDmUDaml6UkxEQKxSq-uyLqZ0LHpJuxuolLyJh58Pp_C2VTEi5dh-M3_Y07ghmfYgHL7VzKLEc1B-UvVNC0udHeEGJzuenQs2d1VxdNVfltumZLysElWYinSRCRJDPjW_4BlNoMXT2ySQ76-WPHMxXreBc-iyL8-P0KKC8EnCYNDW9aSEzKRxRLU4PedJU_oGD7IP-USHuOzwagj8lX-97wEFjpsUXusK9JoHAYD9-nBWjT6_bqrzxHldjfLlfY0BtSo1iEDCl-lKW-_dTct9QdlfVSamlR0P_qo8iybJpi-AQAA__8.VHn15O4KS311mkoZFJiNDdR1BvF4ytsG3IIjD7iyAM4' }
            // })
            this.appSettingService.createAppSettingsUsingPOST(appSettingsList)
              .subscribe((resp: ApiResponseObjectListAppSettingsDTO) => {
                if (resp && resp.respObject) {
                  this.getImageListForKey(this.key, this.advId);
                }
              }, error => {
                this.blockUI.stop();
              });
          }
        }
      }
    );
  }

  getAppSettingProps(properties: any) {
    const settingProps: AppSettingsPropertyDTO[] = [];
    Object.keys(properties).forEach(key => {
      const prop = {
        propertyKey: key,
        propertyValue: properties[key]
      } as AppSettingsPropertyDTO;
      settingProps.push(prop);
    });

    return settingProps;
  }

  openImageGridModal() {
    this.modal.open(ImageGridModalComponent, {
      width: '99%',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        key: this.key,
        advId: this.advId,
        type: this.type,
        title: this.title,
        showTitle: false,
        imgList: this.imgList,
        canSelectMultiple: true
      }
    });
  }

  groupImages(images: ImageData[]) {
    this.c1Images = [];
    this.c2Images = [];
    this.c3Images = [];
    this.c4Images = [];
    this.c5Images = [];
    this.c6Images = [];
    images.forEach((img, idx) => {
      const index = (idx % 6) + 1;

      switch (index) {
        case 1: this.c1Images.push(img); break;
        case 2: this.c2Images.push(img); break;
        case 3: this.c3Images.push(img); break;
        case 4: this.c4Images.push(img); break;
        case 5: this.c5Images.push(img); break;
        case 6: this.c6Images.push(img); break;
      }
    });
  }

  extractCreativeSizes(images: ImageData[]) {
    const sizeOpts = new Set<string>();
    images.forEach((item) => {
      if (item && item.props && item.props.length) {
        const dimIndex = item.props.findIndex(prop => prop.propertyKey === AppSettingsPropertyDTO.PropertyKeyEnum.DIMENSIONS);
        if (dimIndex !== -1) {
          sizeOpts.add(item.props[dimIndex].propertyValue);
        }
      }
    });
    setTimeout(() => {
      this.buildCreativeSizeFilterMap(images);
    }, 10);

    if (sizeOpts && sizeOpts.size > 0) {
      return [...sizeOpts].map((item, index) => {
        return { id: index, name: item };
      });
    } else {
      return null;
    }
  }

  buildCreativeSizeFilterMap(images: ImageData[]) {
    const sizeMap = new Map<string, ImageData[]>();
    images.forEach((item) => {
      if (item && item.props && item.props.length) {
        const dimIndex = item.props.findIndex(prop => prop.propertyKey === AppSettingsPropertyDTO.PropertyKeyEnum.DIMENSIONS);
        if (dimIndex !== -1) {
          const prop = item.props[dimIndex];
          if (!sizeMap.has(prop.propertyValue)) {
            sizeMap.set(prop.propertyValue, []);
          }
          sizeMap.get(prop.propertyValue).push(item);
        }
      }
    });
    this.creativeSizeMap = sizeMap;
  }

  searchCreatives(searchText: string) {
    let imageList: ImageData[] = [];
    if (searchText && searchText.trim() && searchText.trim().length >= 2) {
      imageList = this.imgList.filter(img => img.name.toLocaleLowerCase().includes(searchText.trim().toLocaleLowerCase()));
    } else {
      imageList = [...this.imgList];
    }
    this.isDataAvailable = (imageList.length === 0) ? false : true;

    this.groupImages(imageList);
  }

  extractNameFromUrl(url: string) {
    const parts: string[] = url.split('/');
    return (parts) ? parts[parts.length - 1] : '';
  }

  getTypeTitle(type: number) {
    switch (type) {
      case UPLOAD_CONST.LOGO: return 'logo(s)';
      case UPLOAD_CONST.FALLBACK: return 'fallback image(s)';
      case UPLOAD_CONST.OVERLAY: return 'overlay image(s)';
      default: return;
    }
  }

  selectedImagesHasNoDefaultLogo() {
    let noDefaultLogo = true;
    for(const index in this.selectedImages) {
      if(this.selectedImages[index].key === 'DEFAULT_LOGO') {
        noDefaultLogo = false;
        break;
      }
    }
    return noDefaultLogo;
  }
}
