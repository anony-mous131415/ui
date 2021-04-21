import { Component, OnInit, Output, EventEmitter, Input, SimpleChange, ViewChild } from '@angular/core';
import { CreativeTemplateDTO } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { merge } from 'rxjs';
import { CreativeConstants } from '../../_constants/CreativeConstants';
import { CreativeService } from '../../_services/creative.service';
import { MatPaginator } from '@angular/material';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-cr-template-selection',
  templateUrl: './cr-template-selection.component.html',
  styleUrls: ['./cr-template-selection.component.scss']
})
export class CrTemplateSelectionComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  slots: number;
  templates: Array<CreativeTemplateDTO>=[];
  @Input() sizeFilter;
  @Input() crBasicDetails;
  @Input() uploadedImagesLocations;
  @Input() isDcoFlow: boolean;
  crConst = CreativeConstants;
  filteredTemplates: Array<CreativeTemplateDTO>=[];
  paginatedFilteredTemplates: Array<CreativeTemplateDTO> = [];
  selectedTemplates: Array<CreativeTemplateDTO>=[];
  slotsFilter = [];
  sizeSelectValue: Array<any> = [];
  slotsSelectValue: Array<any> = [];
  previewSelectValue: Array<any> = [];
  previewFilter = [
    { id: 1, name: 'No offer', value: true}, 
    { id: 2, name: 'With offer', value: false}
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() syncTemplateSelection: EventEmitter<any> = new EventEmitter();
  showAllTemplates = true;
  constructor(
    private crService: CreativeService,
  ) { }
  ngOnChanges(changes: SimpleChange) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if(propName === 'uploadedImagesLocations'){
          if(this.uploadedImagesLocations.length>0) {
            this.saveProductImages();
          }
        }
        if(propName === 'crBasicDetails') {
          if(this.isDcoFlow) {
            this.crService.getTemplatesMetadata(true).subscribe(resp => {
              this.sizeFilter = resp.respObject.templateSizes;
            });
          }
        }
        if(propName ==='isDcoFlow') {
          if(this.isDcoFlow) {
            this.slots = undefined;
            this.fetchTemplates();
          }
        }
      }
    }
  }

  onContinueClick() {
    this.syncTemplateSelection.emit({step: CreativeConstants.STEP.TEMPLATE_CUSTOMIZE, selectedTemplates: this.selectedTemplates});
  }

  setSlotsFilter() {
    let slotsSet = new Set();
    this.templates.forEach(item=>{
      slotsSet.add(item.slots);
    });
    this.slotsFilter = Array.from(slotsSet).map((item,index,object) => object[index] = { id: item, name: item});
  }

  saveProductImages() {
    let sizesMap = {};
    this.uploadedImagesLocations.forEach(item=>{
      let size = item.width+'x'+item.height;
      if(size in sizesMap) {
        sizesMap[size] += 1;
      } else {
        sizesMap[size] = 1;
      }
    });
    let max = -1;
    for(let i in sizesMap) {
      if(sizesMap[i]>max) {
        max = sizesMap[i];
      }
    }
    if(max!=-1) this.slots = max;
    this.setSlotsFilter();
    this.fetchTemplates();
  }

  ngAfterViewInit() {
    merge(this.paginator.page)
    .pipe(
      tap(() => this.pagination())
    )
    .subscribe();
  }

  pagination() {
    const pageNumber = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    this.paginatedFilteredTemplates = this.filteredTemplates.slice(pageNumber*pageSize, pageNumber*pageSize+pageSize);
    this.createIframes();
  }

  fetchTemplates() {
    this.blockUI.start('Loading Templates');
    this.crService.getCreativeTemplates(this.crBasicDetails.advertiserId,this.isDcoFlow,1,1000,undefined,this.slots).subscribe(resp => {
      this.blockUI.stop();
      this.templates = resp.respObject.data;
      let tempTemplates = [];
      this.templates.forEach(template => {
        let start = template.htmlContent.indexOf('/*##JSON_START##*/');
        let end = template.htmlContent.indexOf('/*##JSON_END##*/');
        if(start!==-1 && end !==1) {
          let data = template.templateVariables;
          data = data.replace(this.crConst.REMOVE_COMMENTS_IN_JSON_REGEX, (m, g) => g ? "" : m);
          try {
            JSON.parse(data);
          }
          catch (e) {
            data = escape(data);
            let n = data.lastIndexOf('%2C')
            data = data.slice(0, n) + data.slice(n).replace('%2C', '');
          }
          data = unescape(data);
          if(!this.isDcoFlow) {
            const styleObj = JSON.parse(data);
            let images = this.uploadedImagesLocations.filter(item=>item.width===template.width&&item.height===template.height).map(item=>item.filePath);
            if(template.slots === 1) {
              for(let i = 0; i < images.length; i++) {
                let tempTemplate = {...template};
                styleObj['templateImages'] = [images[i]];
                const newStyle = JSON.stringify(styleObj);
                tempTemplate.htmlContent = tempTemplate.htmlContent.substring(0, start) + '/*##JSON_START##*/' + newStyle + tempTemplate.htmlContent.substring(end, tempTemplate.htmlContent.length);
                tempTemplates.push(tempTemplate);
              }
            } else {
              styleObj['templateImages'] = images;
              const newStyle = JSON.stringify(styleObj);
              template.htmlContent = template.htmlContent.substring(0, start) + '/*##JSON_START##*/' + newStyle + template.htmlContent.substring(end, template.htmlContent.length);
              tempTemplates.push(template);
            }
          } else {
            template.htmlContent = template.htmlContent.replace("|DYNAMIC|NOENCODING|",template.dynamicItemList);
            start = template.htmlContent.indexOf('/*##JSON_START##*/');
            end = template.htmlContent.indexOf('/*##JSON_END##*/');
            template.htmlContent = template.htmlContent.substring(0, start) + '/*##JSON_START##*/' + data + template.htmlContent.substring(end, template.htmlContent.length);
            tempTemplates.push(template);
          }
        }
      });
      this.setSlotsFilter();
      this.templates = tempTemplates;
      this.filteredTemplates = tempTemplates;
      this.pagination();
      this.createIframes();
      this.createSelectedIframes();
      this.setSizeFilter();
    });
  }

  ngOnInit() {
  }

  setSizeFilter() {
    let tempSet = new Set(this.sizeFilter);
    this.sizeFilter = [...tempSet];
    let indexOfAll = this.sizeFilter.findIndex(item=>item.id === 0);
    if(indexOfAll!=-1)
      this.sizeFilter.splice(indexOfAll,1);
    this.sizeFilter.forEach((item,index,object) =>{
      if(typeof(item)==='string') {
        let size = item;
        object[index] = {};
        object[index].id = index + 1;
        object[index].name = size; 
        object[index].width = parseInt(size.split('x')[0]);
        object[index].height = parseInt(size.split('x')[1]);
      }
    });
    for(let i = this.sizeFilter.length -1 ; i >= 0; i-=1) {
      let item = this.sizeFilter[i];
      let remove = true;
      let height = item.height;
      let width = item.width;
      for(let j = 0 ; j < this.templates.length; j++ ){
        let itemTemplate = this.templates[j];
        if(itemTemplate.height === height && itemTemplate.width === width){
          remove = false;
          break;
        }
      }
      if(remove) {
        this.sizeFilter.splice(i,1);
      }
    }
    // this.sizeFilter.splice(0,0,{id: 0, name: 'All'});
  }
  createIframes() {
    let wraper = document.getElementById('templates');
    wraper.innerHTML='';
    var html = '';
    this.paginatedFilteredTemplates.forEach((item, index) => {
      html += `
        <div style="display:inline-block; margin:0 auto; position: relative" class="templateDiv">
          <div id="iframeWrapper" style="position: relative">
            <div id="iframeBlocker" style="position: absolute; top: 0; left: 0; width: 100%; height: 90%; z-index: 2"></div>
            <iframe id="templates${index}" style="margin: 10px; border: 0px; z-index: 1" class="iframe animated"
            width="${item.width}px" height="${item.height}px" src='javascript:document.write("")'>
            </iframe>
          </div>
          <button mat-raised-button class='btn-primary' style="padding: 3px 16px;color: black;margin: 10px auto;display: block;
          background: #dcdcdc !important;border-color: #dcdcdc !important;border-radius: 3px;">SELECT</button>
        </div>
      `;
    });
    wraper.innerHTML = html;
    this.paginatedFilteredTemplates.forEach((item, index) => {
      let el = document.getElementById('templates'+index)  as HTMLIFrameElement;
      el.contentWindow.document.open();
      el.contentWindow.document.write(unescape(item.htmlContent));
      el.contentWindow.document.close();
      let selectButton = el.parentElement.parentElement.children[1] as HTMLButtonElement;
      selectButton.onclick = (event) => {this.toggleSelection(item,event)};
    });
  }

  createSelectedIframes() {
    let wraper = document.getElementById('selectedTemplates');
    wraper.innerHTML='';
    var html = '';
    this.selectedTemplates.forEach((item, index) => {
      html += `
        <div style="display:inline-block; margin:0 auto; position: relative">
          <div id="iframeWrapper" style="position: relative">
            <div id="iframeBlocker" style="position: absolute; top: 0; left: 0; width: 100%; height: 90%; z-index: 2"></div>
            <iframe id="selectedTemplates${index}" style="margin: 10px; border: 0px; z-index: 1" class="iframe animated"
            width="${item.width}px" height="${item.height}px" src='javascript:document.write("")'>
            </iframe>
          </div>
        </div>
      `;
    });
    wraper.innerHTML = html;
    this.selectedTemplates.forEach((item, index) => {
      let el = document.getElementById('selectedTemplates'+index)  as HTMLIFrameElement;
      el.contentWindow.document.open();
      el.contentWindow.document.write(unescape(item.htmlContent));
      el.contentWindow.document.close();
    });
  }

  onGoBackClick() {
    this.clearSelections();
    this.syncTemplateSelection.emit(null);
  }

  valchange(event: any, type: string) {
    switch(type) {
      case 'size':
        this.sizeSelectValue = event; 
      break;
      case 'slots': 
        this.slotsSelectValue = event;
      break;
      case 'preview': 
        this.previewSelectValue = event;
      break;
    }
    this.clearSelections();
    //Filter by Size
    this.filteredTemplates = this.templates;
    if(this.sizeSelectValue.length>0) {
      this.filteredTemplates = this.filteredTemplates.filter(item=>{
        let returnValue = false;
        let loopBreak = false;
        this.sizeSelectValue.forEach(size=>{
          if(item.size === size.name) returnValue = true;
        });
        return returnValue;
      });
    }
    //Filter by slots
    if(this.slotsSelectValue.length>0) {
      this.filteredTemplates = this.filteredTemplates.filter(item => {
        let returnValue = false;
        this.slotsSelectValue.forEach(slot=>{
          if(item.slots === slot.id) returnValue = true;
        });
        return returnValue;
      });
    }
    //Filter by preview
    if(this.previewSelectValue.length>0) {
      this.filteredTemplates = this.filteredTemplates.filter(item => {
        let returnValue = false;
        this.previewSelectValue.forEach(preview=>{
          if(item.hasOverlay === preview.value) returnValue = true;
        });
        return returnValue;
      });
    }
    this.paginator.firstPage();
    this.pagination();
    this.createIframes();
  }

  toggleSelection(template, event?: any) {
    if(this.selectedTemplates.includes(template)){
      if(event) {
        event.target.innerHTML='SELECT';
        event.target.parentNode.childNodes[1].childNodes[1].style.opacity='1';
        const el = event.target.parentNode.childNodes[1].querySelectorAll('div');
        el[el.length-2].remove();
      }
      this.selectedTemplates.splice(this.selectedTemplates.indexOf(template),1);
      this.selectedTemplates = [...this.selectedTemplates];
    } else {
      if(event) {
        event.target.innerHTML='UNSELECT';
        const iframeEl = event.target.parentNode.childNodes[1].childNodes[3];
        let height = parseInt(iframeEl.height.split("px")[0])+15+"px";
        let width = parseInt(iframeEl.width.split("px")[0])+15+"px";
        let html = `
          <div style="opacity:0.5;background-color:var(--primary-color);height:${height};width:${width}"  
          class="card-img-overlay d-flex align-items-center text-center">
          <div class="card-title text-white w-100"><em class="fa fa-check fa-3x"></em></div>
          </div>
        `;
        event.target.parentNode.childNodes[1].insertAdjacentHTML('beforeend',html);
      }
      this.selectedTemplates = [...this.selectedTemplates,template];
    }
    this.createSelectedIframes();
  }

  clearSelections() {
    let allTemplatesDiv = Array.from(document.getElementsByClassName('templateDiv') as HTMLCollectionOf<HTMLElement>)
    for(let i = 0; i < allTemplatesDiv.length; i++) {
      let templateDiv = allTemplatesDiv[i];
      templateDiv.style.opacity = '1';
      templateDiv.querySelector('button').textContent = 'SELECT';
      const el = (<Element>templateDiv.childNodes[1]).querySelectorAll('div');
      let overlayElement = el[el.length-2];
      if(overlayElement) overlayElement.remove();
    }
    this.selectedTemplates = []; 
    this.createSelectedIframes();
  }

  allTemplatesClickHandler() {
    if(!this.showAllTemplates) {
      this.showAllTemplates = !this.showAllTemplates;
    }
  }

  showSelectedTemplatesClickHandler() {
    if(this.showAllTemplates){
      this.showAllTemplates=!this.showAllTemplates;
    }
  }
}
