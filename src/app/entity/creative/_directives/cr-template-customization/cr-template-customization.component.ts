import { Component, EventEmitter, Input, OnInit, Optional, Output, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdvertiserService } from '@app/entity/advertiser/_services/advertiser.service';
import { ImageGridModalComponent } from '@app/shared/_directives/_modals/image-grid-modal/image-grid-modal.component';
import { AlertService } from '@app/shared/_services/alert.service';
import { CommonService } from '@app/shared/_services/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CreativeDetails } from '@revxui/api-client-ts/model/creativeDetails';
import { CreativeTemplateDTO } from '@revxui/api-client-ts/model/creativeTemplateDTO';
import { TemplateThemeDTO } from '@revxui/api-client-ts/model/templateThemeDTO';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AppConstants } from '../../../../shared/_constants/AppConstants';
import { CreativeConstants } from '../../_constants/CreativeConstants';
import { CreativeService } from '../../_services/creative.service';
import { CrCreateUpdateThemeModalComponent } from '../_modals/cr-create-update-theme-modal/cr-create-update-theme-modal.component';
@Component({
  selector: 'app-cr-template-customization',
  templateUrl: './cr-template-customization.component.html',
  styleUrls: ['./cr-template-customization.component.scss']
})
export class CrTemplateCustomizationComponent implements OnInit {

  allTemplateVariables: Array<any>;
  @Input() selectedTemplates: Array<CreativeTemplateDTO> = [];
  @Input() crBasicDetails: CreativeDetails;
  allTemplateThemes: Array<TemplateThemeDTO>;
  @Input() edit: any;
  logoLink: string;
  fallbackImageLink: string;
  overlayImageLink: string;
  @Output() syncTemplateCustomization: EventEmitter<any> = new EventEmitter();
  themeSelected;
  themeAction: string;
  themeName: string;
  templateVariables: any;
  templateVariablesValues = {};
  constructor(@Optional() readonly activeModal: NgbActiveModal, private commonService: CommonService,
    private crService: CreativeService, public modal: MatDialog, private advService: AdvertiserService,
    public alertService: AlertService,) {
  }
  @BlockUI() blockUI: NgBlockUI;

  ngOnInit() {
    if (this.edit)
      this.blockUI.start('Please Wait...');
    this.crService.getCreativeTemplateVariables().subscribe(resp => {
      let temp: any = resp.respObject;
      let invalidVariables = ['width', 'height'];
      temp = temp.filter(item => !invalidVariables.includes(item.variableKey));
      temp.forEach((item, index, object) => {
        if (item.variableType === 'SELECT' && item.elasticSearchIndex) {
          this.commonService.getDetailDictionary(item.elasticSearchIndex, 1, 1000).subscribe(resp => {
            object[index] = { ...item, options: resp.respObject.data };
            this.allTemplateVariables = temp;
            this.initTemplates();
          })
        }
      });
    });
    this.crService.getTemplateThemesUsingGET(this.crBasicDetails.advertiserId).subscribe(resp => {
      this.allTemplateThemes = resp.respObject;
    });
  }

  ngOnChanges(changes: SimpleChange) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'allTemplateVariables':
          case 'selectedTemplates': {
            this.initTemplates();
          } break;
        }
      }
    }
  }

  sanitizeJson(template) {
    const start = template.htmlContent.indexOf('/*##JSON_START##*/');
    const end = template.htmlContent.indexOf('/*##JSON_END##*/');
    let data = template.htmlContent.substring(start + 18, end);
    data = data.replace(CreativeConstants.REMOVE_COMMENTS_IN_JSON_REGEX, (m, g) => g ? "" : m);
    try {
      JSON.parse(data);
    }
    catch (e) {
      data = escape(data);
      let n = data.lastIndexOf('%2C')
      data = data.slice(0, n) + data.slice(n).replace('%2C', '');
    }
    return unescape(data);
  }

  initTemplates() {
    this.fallbackImageLink = null;
    this.overlayImageLink = null;
    this.themeSelected = undefined;
    let uniqueTemplateVariables = new Set();
    for (let template of this.selectedTemplates) {
      let data = this.sanitizeJson(template);
      const styleObj = JSON.parse(data);
      Object.keys(styleObj).forEach(item => {
        uniqueTemplateVariables.add(item);
      });
    };
    this.selectedTemplates = [...this.selectedTemplates];
    this.templateVariables = this.getTemplateVariables(uniqueTemplateVariables);
    this.advService.getById(this.crBasicDetails.advertiserId).subscribe(response => {
      this.logoLink = response.respObject.defaultLogoDetails ? response.respObject.defaultLogoDetails.settingsValue : null;
      if (this.logoLink) {
        for (let template of this.selectedTemplates) {
          let data = this.sanitizeJson(template);
          const start = template.htmlContent.indexOf('/*##JSON_START##*/');
          const end = template.htmlContent.indexOf('/*##JSON_END##*/');
          const styleObj = JSON.parse(data);
          this.logoLink = styleObj['logoLink'] ? styleObj['logoLink'] : this.logoLink;
          this.fallbackImageLink = styleObj['defaultLink'];
          this.overlayImageLink = styleObj['overlayLink'];
          styleObj['logoLink'] = this.logoLink;
          if (this.edit) {
            Object.keys(styleObj).forEach(item =>
              this.templateVariablesValues[item] = styleObj[item]
            );
          }
          template.htmlContent = template.htmlContent.substring(0, start) + '/*##JSON_START##*/' + JSON.stringify(styleObj) + template.htmlContent.substring(end, template.htmlContent.length);
        }
      }
      this.createIframes();
      if (this.edit)
        this.blockUI.stop();
    });
  }

  createIframes() {
    let wraper = document.getElementById('templatesCustomization');
    wraper.innerHTML = '';
    var html = '';
    this.selectedTemplates.forEach((item, index) => {
      html += `
        <div style="display:inline-block;margin:0 auto">
          <div id="iframeWrapper" style="position: relative">
            <div id="iframeBlocker" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2"></div>
            <iframe id="templateCus${index}" style="margin: 10px; border: 0px; z-index: 1" class="iframe animated"
            width="${item.width}px" height="${item.height}px" src='javascript:document.write("")'>
            </iframe>
          </div>
        </div>
      `;
    });
    wraper.innerHTML = html;
    this.selectedTemplates.forEach((item, index) => {
      let el = document.getElementById('templateCus' + index) as HTMLIFrameElement;
      el.contentWindow.document.open();
      el.contentWindow.document.write(unescape(item.htmlContent));
      el.contentWindow.document.close();
    });
  }

  onContinueClick() {
    // this.panelOpenState = false;
    this.syncTemplateCustomization.emit({ step: CreativeConstants.STEP.PREVIEW, selectedTemplates: this.selectedTemplates });
  }


  onGoBackClick() {
    // this.panelOpenState = false;
    this.syncTemplateCustomization.emit(null);
  }

  getTemplateVariables(templateVariables) {
    let result = [];
    for (let tv of templateVariables) {
      const temp = this.allTemplateVariables.find(item => item.variableKey === tv)
      if (!!temp) {
        result.push({
          title: temp.variableTitle,
          key: temp.variableKey,
          type: temp.variableType,
          options: temp.options,
          elasticSearchIndex: temp.elasticSearchIndex,
          numberRange: temp.numberRange,
          hintMessage: temp.hintMessage
        });
        this.templateVariablesValues[temp.variableKey] = '';
      }
    }
    return result;
  }

  templateInputChange(event: any, key: string, tVariable?: any) {
    let currSymbol = null;
    if(key === 'currencySymbol') {
      let currency = tVariable.options.find(item=>item.id === event);
      currSymbol = AppConstants.CURRENCY_MAP[currency.currencyCode];
      this.templateVariablesValues['currencyCode'] = currency.id;
    } else {
      currSymbol = event;
    }
    this.templateVariablesValues[key] = event;
    this.changeValueInSelectedTemplates(key,currSymbol);
    this.createIframes();
  }

  changeValueInSelectedTemplates(key: string, value: string) {
    this.selectedTemplates.forEach(template => {
      let temp = unescape(template.htmlContent);
      let data = this.sanitizeJson(template);
      const start = template.htmlContent.indexOf('/*##JSON_START##*/');
      const end = template.htmlContent.indexOf('/*##JSON_END##*/');
      const styleObj = JSON.parse(data);
      if (styleObj.hasOwnProperty(key)) {
        styleObj[key] = value;
        if(key === 'currencySymbol') {
          styleObj['currencyCode'] = this.templateVariablesValues['currencyCode'];
        }
        const newStyle = JSON.stringify(styleObj);
        template.htmlContent = template.htmlContent.substring(0, start) + '/*##JSON_START##*/' + newStyle + template.htmlContent.substring(end, template.htmlContent.length);
      }
    })
  }

  openLogoModal(type: string) {
    let modalKey, modalType, modalTitle;
    switch (type) {
      case 'logoLink': {
        modalKey = 'LOGO_LINK';
        modalType = 1;
        modalTitle = 'Logo';
      } break;
      case 'defaultLink': {
        modalKey = 'FALLBACK_IMG_LINK';
        modalType = 2;
        modalTitle = 'Fallback Image';
      } break;
      case 'overlayLink': {
        modalKey = 'OVERLAY_IMG_LINK';
        modalType = 3;
        modalTitle = 'Overlay Image';
      } break;
    }
    const modalRef = this.modal.open(ImageGridModalComponent, {
      width: '99%',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        key: modalKey,
        advId: this.crBasicDetails.advertiserId,
        type: modalType,
        title: modalTitle,
        showTitle: false,
        imgList: null,
        canSelectMultiple: false,
      }
    });
    modalRef.afterClosed().subscribe(result => {
      if (!!result) {
        for (let template of this.selectedTemplates) {
          let data = this.sanitizeJson(template);
          const start = template.htmlContent.indexOf('/*##JSON_START##*/');
          const end = template.htmlContent.indexOf('/*##JSON_END##*/');
          const styleObj = JSON.parse(data);
          if (type === 'logoLink') {
            styleObj['logoLink'] = result;
            this.templateVariablesValues['logoLink'] = result;
            this.logoLink = result;
          }
          else if (type === 'defaultLink') {
            styleObj['fallbackImg'] = result;
            this.templateVariablesValues['fallbackImg'] = result;
            this.fallbackImageLink = result;
          }
          else if (type === 'overlayLink') {
            styleObj['overlayLink'] = result;
            this.templateVariablesValues['overlayLink'] = result;
            this.overlayImageLink = result;
          }
          template.htmlContent = template.htmlContent.substring(0, start) + '/*##JSON_START##*/' + JSON.stringify(styleObj) + template.htmlContent.substring(end, template.htmlContent.length);
        }
        this.createIframes();
      }
    });
  }

  themeChanged(event) {
    Object.keys(this.templateVariablesValues).forEach(key => this.templateVariablesValues[key] = "");
    const theme = this.allTemplateThemes.find(item => item.id === event.value);
    const themeJson = JSON.parse(theme.styleJson);
    this.themeSelected = theme.id;
    Object.keys(themeJson).map(key => {
      // if(themeJson[key]!=="")
      this.templateInputChange(themeJson[key], key);
    })
  }

  editContinue() {
    let data = this.sanitizeJson(this.selectedTemplates[0]);
    const styleObj = JSON.parse(data);
    this.activeModal.close(styleObj);
  }

  editCancel() {
    this.activeModal.close(null);
  }

  shouldShowOverlayImage() {
    return this.templateVariables ? this.templateVariables.findIndex(item => item.key === 'overlayLink') !== -1 : false;
  }

  showNumberRange(range: string) {
    const start = parseInt(range.split(":")[0]);
    const end = parseInt(range.split(":")[1]);
    let rangeArray = [];
    for (let iteratorIndex = start; iteratorIndex <= end; iteratorIndex++) {
      rangeArray.push(iteratorIndex);
    }
    return rangeArray;
  }

  openThemeSaveModal(type?: string) {
    let isUpdate = false;
    if (type === 'update') {
      this.themeName = this.allTemplateThemes.find(item => item.id === this.themeSelected).themeName;
      isUpdate = true;
    }
    const title = isUpdate ? 'Update Preset' : 'Save Preset';
    const modalRef = this.modal.open(CrCreateUpdateThemeModalComponent, {
      width: '350px',
      data: {
        title: title,
        themeName: isUpdate ? this.themeName : null
      },
    });
    modalRef.afterClosed().subscribe(
      data => {
        if (!isUpdate) {
          let themeDto: TemplateThemeDTO = {};
          themeDto.themeName = data.themeName;
          themeDto.advertiserId = this.crBasicDetails.advertiserId;
          themeDto.styleJson = JSON.stringify(this.templateVariablesValues);
          this.crService.saveTemplateTheme(themeDto).subscribe(response => {
            this.crService.getTemplateThemesUsingGET(this.crBasicDetails.advertiserId).subscribe(resp => {
              this.allTemplateThemes = resp.respObject;
              this.themeSelected = undefined;
              this.alertService.success('Successfully Saved!', false, true);
              const that = this;
              setTimeout(() => {
                that.alertService.clear(true);
              }, 2000);
            });
          });
        } else {
          const selectedTheme = this.allTemplateThemes.find(item => item.id === this.themeSelected);
          let themeDto: TemplateThemeDTO = { ...selectedTheme };
          const oldJson = JSON.parse(selectedTheme.styleJson);
          const newJson = this.templateVariablesValues;
          Object.keys(newJson).forEach(key => {
            oldJson[key] = newJson[key];
          });
          themeDto.styleJson = JSON.stringify(oldJson);
          themeDto.themeName = data.themeName;
          this.crService.updateTemplateTheme(selectedTheme.id, themeDto).subscribe(response => {
            this.crService.getTemplateThemesUsingGET(this.crBasicDetails.advertiserId).subscribe(resp => {
              this.allTemplateThemes = resp.respObject;
              this.themeSelected = undefined;
              this.alertService.success('Successfully updated!', false, true);
              const that = this;
              setTimeout(() => {
                that.alertService.clear(true);
              }, 2000);
            });
          });
        }
      });
  }

  shouldShow(key) {
    const offerRelated = ['hasOverlay', 'overlayDuration', 'num_overlay'];
    if(offerRelated.includes(key)) {
      return this.overlayImageLink ? true : false; 
    }
    return true;
  }

  getModelForSelect(key) {
    if(key === 'currencySymbol') {
      return this.templateVariablesValues['currencyCode'];
    }
    return this.templateVariablesValues[key];
  }

}
