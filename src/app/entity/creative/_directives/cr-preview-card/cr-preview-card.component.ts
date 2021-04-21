import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeDTO } from '@revxui/api-client-ts';
import { CrPreviewModalComponent } from '../_modals/cr-preview-modal/cr-preview-modal.component';


@Component({
  selector: 'app-cr-preview-card',
  templateUrl: './cr-preview-card.component.html',
  styleUrls: ['./cr-preview-card.component.scss']
})
export class CrPreviewCardComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() cardType: string;
  @Input() nativeAssetData: string;
  @Output() syncRemovalOfCreative: EventEmitter<string> = new EventEmitter();
  @Output() syncUpdatedCreative: EventEmitter<CreativeDTO> = new EventEmitter();
  @Output() syncToggle: EventEmitter<any> = new EventEmitter();
  crConst = CreativeConstants;
  selectedType = true;

  list: any;
  value: any;

  cardObj = {
    title: '',
    bg: '',
    icon: ''
  };

  nativeAsset: string;

  formValidated = false;

  constructor(
    private modal: MatDialog
  ) { }

  ngOnInit() {

    if (this.data) {
      this.list = JSON.parse(this.data);
      // console.log('image list in the card ', this.list);
    }

    this.generateCardObj();
  }

  showPreviewModal(creativeDTO: CreativeDTO) {
    let nativeAssetJSON;
    if (this.nativeAsset) {
      nativeAssetJSON = JSON.parse(this.nativeAsset);
    }
    this.modal.open(CrPreviewModalComponent, {
      width: '50%',
      data: { creative: creativeDTO, nativeAsset: nativeAssetJSON }
    });
  }

  removeRawCreative(index: number) {
    const rawCreativeId = this.list[index].id;
    // console.log('rawcreative id ', rawCreativeId);
    this.list.splice(index, 1);
    // console.log('list ', index, this.list);
    this.syncRemovalOfCreative.emit(rawCreativeId);
  }

  // Update and sync the updated creative to the parent
  updateDimensionOfCreative(creative: CreativeDTO) {
    // console.log('update ', creative);
    this.syncUpdatedCreative.emit(creative);
  }

  handleToggle() {
    const obj = { nativeAd: this.list[0].nativeAd, cardType: this.cardType, selected: this.selectedType };

    this.syncToggle.emit(obj);
  }

  generateCardObj() {
    switch (this.cardType) {
      case CreativeConstants.ALLOWED_TYPES.IMAGE:
        this.cardObj.title = 'Image Creative';
        if (this.list.length > 1) {
          this.cardObj.title = 'Image Creatives';
        }
        this.cardObj.bg = 'image-background';
        this.cardObj.icon = 'fa fa-image';
        break;
      case CreativeConstants.ALLOWED_TYPES.VIDEO:
        this.cardObj.title = 'Video Creative';
        if (this.list.length > 1) {
          this.cardObj.title = 'Video Creatives';
        }
        this.cardObj.bg = 'video-background';
        this.cardObj.icon = 'fa fa-video';
        break;
      case CreativeConstants.ALLOWED_TYPES.HTML:
        this.cardObj.title = 'HTML Creative';
        if (this.list.length > 1) {
          this.cardObj.title = 'HTML Creatives';
        }
        this.cardObj.bg = 'html-background';
        this.cardObj.icon = 'fa fa-code';
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nativeAssetData && changes.nativeAssetData.currentValue) {
      this.nativeAsset = changes.nativeAssetData.currentValue;
    }
  }

  get validNativeAsset() {
    if (this.nativeAsset) {
      const nativeAssetJson = JSON.parse(this.nativeAsset);
      if (!nativeAssetJson.title || !nativeAssetJson.body || !nativeAssetJson.callToAction || !nativeAssetJson.iconurl) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }
}
