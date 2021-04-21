export class HighChartCustom {

    chart: any = {
        height: 320,
        spacingLeft: 0,
        zoomType: 'xy',
        marginBottom: 70
    };

    credits: any = {
        enabled: false
    };

    legend: any = {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 0,
        floating: true,
        backgroundColor: 'rgba(255,255,255,0.25)'
    };

    title: any = {
        text: ''
    };

    subtitle: any = {
        text: ''
    };

    tooltip: any = {
        shared: false,
        useHTML: true,
        headerFormat: '<strong style=\'font-size:10px\'>{point.key}</strong>',
        pointFormat: ' {point.tooltipData}',
        style: {
            zIndex: 10000000
        }
    };

    xAxis: any[] = [{

        categories: [] = [], // fill this
        index: 0,
        isX: true
    }];

    yAxis: any[]; // fill this
    series: any[]; // fill this


    constructor() {
    }



    setSeries(seriesData: any[]) {
        this.series = seriesData;
    }

    setYAxisLabels(yLabels: any[]) {
        this.yAxis = yLabels;
    }

    setXAxisLabels(xLabels: any[]) {
        this.xAxis[0].categories = xLabels;
    }

}
