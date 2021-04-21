import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ReportingRequest } from '@revxui/api-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AdvancedConstants } from '../../_constants/AdvancedConstants';
import { CommonResultModalComponent } from '../../_directives/_modals/common-result-modal/common-result-modal.component';
import { OptParams, ReportBuilderService } from '../../_services/report-builder.service';
import { EntitiesService } from '@app/shared/_services/entities.service';
@Component({
  selector: 'app-video-report',
  templateUrl: './video-report.component.html',
  styleUrls: ['./video-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})

// "type": "STATIC | ENTITY | FROM_LIST"

export class VideoReportComponent implements OnInit {

  // get this JSON from API call
  configJson: any;
  breadcrumbs: string;

  uiMetrics = [
    { value: 'impressions', label: 'Impressions', tooltip: AdvancedConstants.DEFINATION.IMPRESSION, preselected: true, showROuser: true },
    { value: 'clicks', label: 'Clicks', tooltip: AdvancedConstants.DEFINATION.CLICK, preselected: true, showROuser: true },
    { value: 'total_install', label: 'Installs', tooltip: AdvancedConstants.DEFINATION.INSTALL, preselected: true, showROuser: true },
    { value: 'imp_installs', label: 'View Installs', tooltip: AdvancedConstants.DEFINATION.VIEW_INSTALL, preselected: true, showROuser: false },
    { value: 'click_installs', label: 'Click Installs', tooltip: AdvancedConstants.DEFINATION.CLICK_INSTALL, preselected: true,showROuser: false },
    { value: 'conversions', label: 'Conversions', tooltip: AdvancedConstants.DEFINATION.CONVERSION, preselected: true, showROuser: true },
    { value: 'conversions_view', label: 'View Conversions', tooltip: AdvancedConstants.DEFINATION.VIEW_CONV, preselected: true, showROuser: true },
    { value: 'conversions_click', label: 'Click Conversions', tooltip: AdvancedConstants.DEFINATION.CLICK_CONV, preselected: true, showROuser: true },
    { value: 'revenue', label: 'Adv Spend', tooltip: AdvancedConstants.DEFINATION.ADV_SPEND, preselected: true, showROuser: true },
    { value: 'spend', label: 'Media Spend', tooltip: AdvancedConstants.DEFINATION.MEDIA_SPEND, preselected: true, showROuser: false },
    { value: 'margin', label: 'Margin', tooltip: AdvancedConstants.DEFINATION.MARGIN, preselected: true, showROuser: false },
    { value: 'ctr', label: 'CTR', tooltip: AdvancedConstants.DEFINATION.CTR, preselected: true, showROuser: true },
    { value: 'ctc', label: 'CTC', tooltip: AdvancedConstants.DEFINATION.CTC, preselected: true, showROuser: true },
    { value: 'cpi', label: 'CPI', tooltip: AdvancedConstants.DEFINATION.CPI, preselected: true, showROuser: false },
    { value: 'iti', label: 'ITI', tooltip: AdvancedConstants.DEFINATION.ITI, preselected: true, showROuser: true },
    { value: 'conv_rate', label: 'CR', tooltip: AdvancedConstants.DEFINATION.CR, preselected: false, showROuser: true },
    { value: 'cvr', label: 'CVR', tooltip: AdvancedConstants.DEFINATION.CVR, preselected: false, showROuser: true },
    { value: 'click_txn_amount', label: 'Click Adv Revenue', tooltip: AdvancedConstants.DEFINATION.CLICK_ADV_REV, preselected: false, showROuser: true },
    { value: 'view_txn_amount', label: 'View Adv Revenue', tooltip: AdvancedConstants.DEFINATION.VIEW_ADV_REV, preselected: false, showROuser: true },
    { value: 'roi', label: 'ROI', tooltip: AdvancedConstants.DEFINATION.ROI, preselected: false, showROuser: true },
    { value: 'imp_per_conv', label: 'Imp per Conv', tooltip: AdvancedConstants.DEFINATION.IMP_PER_CONV, preselected: false, showROuser: false },
    { value: 'publisher_ecpm', label: 'Publisher eCPM', tooltip: AdvancedConstants.DEFINATION.PUB_ECPM, preselected: false, showROuser: false },
    { value: 'publisher_ecpc', label: 'eCPC', tooltip: AdvancedConstants.DEFINATION.ECPC, preselected: false, showROuser: false },
    { value: 'publisher_ecpa', label: 'eCPA', tooltip: AdvancedConstants.DEFINATION.ECPA, preselected: false, showROuser: false },
    { value: 'txn_amount', label: 'Adv Revenue', tooltip: AdvancedConstants.DEFINATION.ADV_REV, preselected: false, showROuser: false},
    { value: 'advertiser_ecpm', label: 'Advertiser eCPM', tooltip: AdvancedConstants.DEFINATION.ADV_ECPM, preselected: false, showROuser: true },
    { value: 'imp_video_start', label: 'Video Start Impressions', tooltip: 'The Ad shown to the user is called as Impression.', preselected: true },
    { value: 'imp_video_pause', label: 'Video Pause Impressions', tooltip: 'The Ad shown to the user is called as Impression.', preselected: true },
    { value: 'imp_video_skip', label: 'Video Skip Impressions', tooltip: 'The Ad shown to the user is called as Impression.', preselected: true },
    { value: 'imp_video_first_quartile', label: 'Video 1st Quartile Impressions', tooltip: 'The Ad shown to the user is called as Impression.', preselected: true },
    { value: 'imp_video_second_quartile', label: 'Video 2nd Quartile Impressions', tooltip: 'The Ad shown to the user is called as Impression.', preselected: true },
    { value: 'imp_video_third_quartile', label: 'Video 3rd Quartile Impressions', tooltip: 'The Ad shown to the user is called as Impression.', preselected: true },
    { value: 'imp_video_complete', label: 'Video Complete Impressions', tooltip: 'The Ad shown to the user is called as Impression.', preselected: true }
  ];

  @BlockUI() blockUI: NgBlockUI;
  error: any = {
    metric: { msg: '' },
    groupBy: { msg: '' }
  };

  isRequestValid: boolean = true;
  request: ReportingRequest;
  public modalOption: NgbModalOptions = {};
  constructor(private reportBuilderService: ReportBuilderService,
    private alertService: AlertService,
    private entityService: EntitiesService,
    readonly modalService: NgbModal,) { }

  ngOnInit() {
    this.handleBreadcrumbs();
    this.entityService.remomveROuserMetrics(this.uiMetrics);
    this.blockUI.start('Please wait...');
    this.reportBuilderService.getConfig().subscribe(resp=>{
      this.configJson = JSON.parse(resp.respObject);
      this.subscribeToEvents();
      this.blockUI.stop();
    }, err => {
      this.blockUI.stop();
    });
    this.reportBuilderService.setReportType(AppConstants.REPORTS.VIDEO);
  }

  handleBreadcrumbs(id?: string) {
    const breadcrumbsObj = { video: { id: '', name: '' } };
    this.breadcrumbs = JSON.stringify(breadcrumbsObj);
  }

  subscribeToEvents() {
    this.reportBuilderService.onGetOptions.subscribe(params => this.handleOptions(params.option));
    this.reportBuilderService.onActionChanged.subscribe(params => this.handleActionChange(params));
  }

  handleOptions(option: any) {
    switch (option.id) {
      case "metric_list":
        const metrics = this.uiMetrics.map(metric => {
          return {
            id: metric.value,
            isSelected: metric.preselected,
            name: metric.label,
            tooltip: metric.tooltip
          } as OptParams;
        });
        this.reportBuilderService.setOptions(option.id, metrics);
        break;
      case "group_by_list":
         const group_by_list = [
          { name: 'Advertiser', id: 'advertiser', isSelected: false, } as OptParams,
          { name: 'Campaign', id: 'campaign', isSelected: false } as OptParams,
          { name: 'Strategy', id: 'strategy', isSelected: false } as OptParams,
          { name: 'Aggregator', id: 'aggregator', isSelected: false } as OptParams,
          { name: 'Country', id: 'country', isSelected: false } as OptParams,
          { name: 'State', id: 'state', isSelected: false } as OptParams,
          { name: 'City', id: 'city', isSelected: false } as OptParams,
          { name: 'Creative', id: 'creative', isSelected: false } as OptParams,
          { name: 'Position', id: 'position', isSelected: false } as OptParams,
          { name: 'Native Video', id: 'native_video', isSelected: false } as OptParams,
          { name: 'OS', id: 'os', isSelected: false } as OptParams
         ];
         this.reportBuilderService.setOptions(option.id, group_by_list);
        break;
      default:
        break;
    }
  }

  handleActionChange(params: any) { 
    if(params.id === 'metric_list') {
      const allSelected = this.uiMetrics.length === this.reportBuilderService.valueMap['metric_list'].length;
      this.reportBuilderService.valueMap['select_all'] = allSelected;
    }
    this.buildRequestObject(this.reportBuilderService.getValueMap());   
    this.checkIfRequestValid();
  }

  onClickRunReport() {
    const valueMap = this.reportBuilderService.getValueMap();
    this.request = this.buildRequestObject(valueMap);
    this.checkIfRequestValid();
    if(this.isRequestValid) {
      this.blockUI.start('Fetching report data. Please wait...');
      this.reportBuilderService.show('videoreport').subscribe(
        (resp: any) => {
          if (resp && resp.respObject) {
            this.reportBuilderService.setResult(resp.respObject);
            this.modalOption.centered = true;
            this.modalOption.keyboard = false;
            this.modalOption.windowClass = 'custom-size';
            this.modalService.open(CommonResultModalComponent, this.modalOption);
          }
          this.blockUI.stop();
        }, (error: any) => {
          this.alertService.error('Error. Please try again later.', false, true);
          const that = this;
          setTimeout(() => {
            that.alertService.clear(true);
          }, 1500);
          this.blockUI.stop();
        }
      );
    }
  }

  buildRequestObject(valueMap: Map<string, any>) {
    const request = {} as ReportingRequest;
    request.columns = valueMap["metric_list"];
    request.interval = valueMap["date_range"].interval;
    request.duration = {}; 
    request.duration.start_timestamp = valueMap["date_range"].start_timestamp;
    request.duration.end_timestamp = valueMap["date_range"].end_timestamp;
    request.page_number = 1;
    request.page_size = 50;
    request.sort_by = [];
    request.group_by = valueMap["group_by_list"];
    request.filters = valueMap["fold_position"].length !==4 ? [{column: 'position', operator: 'in', value: valueMap["fold_position"]}] : [];
    this.configJson[1].children.options.forEach(option => {
      const items = option.items.filter(item=>item.type === 'ENTITY_SELECTOR');
      items.forEach(item => {
        request.filters = this.reportBuilderService.buildEntityFilterRequestObject(valueMap[item.id],item.parent_entities.length > 0 ? [...item.parent_entities, ...item.entities] : item.entities, request.filters);
      });
    });
    request.currency_of = valueMap['currency_select'][0];
    this.reportBuilderService.setRequestObject(request);
    return request;
  }

  checkIfRequestValid() {
    this.isRequestValid = true;
    const reqObj = this.reportBuilderService.getRequestObject();
    if (reqObj.columns === null || reqObj.columns === undefined || !Array.isArray(reqObj.columns) || reqObj.columns.length === 0) {
      this.isRequestValid = false;
      this.configJson[2].errorMsg = `Select atleast one \'Metric\' to run the report.`;
    } else {
      this.configJson[2].errorMsg = '';
    }

    if (reqObj.group_by !== null && reqObj.group_by !== undefined) {
      if (reqObj.group_by.length > 7) {
        this.isRequestValid = false;
        this.configJson[3].errorMsg = `More than 7 \'Group By\' options selected.`;
      } else {
        this.configJson[3].errorMsg = '';
      }
    }
  }

}
