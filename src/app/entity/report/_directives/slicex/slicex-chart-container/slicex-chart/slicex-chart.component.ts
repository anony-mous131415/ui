import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation  } from '@angular/core';
import { ChartData, SlicexChartService } from '@app/entity/report/_services/slicex-chart.service';
import { CommonService } from '@app/shared/_services/common.service';
import * as Highcharts from 'highcharts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-slicex-chart',
  templateUrl: './slicex-chart.component.html',
  styleUrls: ['./slicex-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SlicexChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input('data') chartData: ChartData = null;
  @Input('option') chartOption: any = {};
  @Input('compare') isCompareEnabled: boolean = false;

  chartDimensionResetSubscription: Subscription;

  chartObj = null;

  constructor(private commonService: CommonService, private chartService: SlicexChartService) { }

  ngOnInit() {
    this.chartOption.chart.type = this.chartData.ChartType;
    this.chartOption.series = this.chartData.ChartSeries;
  }

  ngAfterViewInit() {
    this.initChart();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isCompareEnabled !== null && changes.isCompareEnabled !== undefined) {
      this.isCompareEnabled = changes.isCompareEnabled.currentValue;
    }
  }

  ngOnDestroy() {
    if (this.chartDimensionResetSubscription) {
      this.chartDimensionResetSubscription.unsubscribe();
    }
  }

  private initChart() {
    const freq = this.chartData.Frequency;
    const metricUnit = this.chartData.MetricUnit;
    const metricUnitValue = this.chartData.MetricUnitValue;
    const numFormatter = this.commonService.nrFormat;
    const isCompareEnabled = this.isCompareEnabled; // this.chartData.Total.change ? true : false;

    function formatTooltip() {
      const xValue = (freq === 'hourly') ? Highcharts.dateFormat('%b %e %Hhr', this.x) : Highcharts.dateFormat('%b %e', this.x);
      const yValue = numFormatter(this.y, metricUnit, metricUnitValue);

      let tooltip = '<strong style="color: var(--primary-color); font-weight: 100;">' + xValue + ':' + yValue + '</strong>';
      if (isCompareEnabled) {
        const y1Value = (this.points[1]) ? numFormatter(this.points[1].y, metricUnit, metricUnitValue) : null;
        tooltip += ' | ' + '<a style="color: var(--secondary-color);">' + y1Value + '</a>';
      }
      return tooltip;
    }

    function yAxisLabelFormatter() {
      return numFormatter(this.value, metricUnit, metricUnitValue, true);
    }

    this.chartOption.tooltip.formatter = formatTooltip;
    this.chartOption.yAxis.labels.formatter = yAxisLabelFormatter;

    this.chartOption.tooltip.shared = this.isCompareEnabled;
    Highcharts.charts.forEach((chart, index) => {
      if (chart && chart['renderTo'] && chart['renderTo']['id'] === this.chartData.ContainerID) {
        Highcharts.charts.splice(index, 1);
      }
    });
    //setTimeout(() => {
    this.chartObj = Highcharts.chart(this.chartData.ContainerID, this.chartOption);
    //}, 100);

    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    this.chartDimensionResetSubscription = this.chartService.onChartDimensionsReset.subscribe(
      () => {
        this.redraw();
      }
    );
  }

  redraw() {
    setTimeout(() => {
      this.chartObj.setSize(null);
    }, 100);
  }

  get total() {
    return this.chartData.Total;
  }

}
