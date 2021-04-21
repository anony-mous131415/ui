import { ChartColumnsModel } from './chart.columns.model';
import { ChartColumnsPropsModel } from './chart.columns.props.model';
import { map } from 'highcharts';

export class ChartColumns {

    advRevenue: ChartColumnsPropsModel; //Advertiser Revenue
    mediaSpend: ChartColumnsPropsModel; //Media Spend
    impressions: ChartColumnsPropsModel;
    clicks: ChartColumnsPropsModel;
    installs: ChartColumnsPropsModel;
    conversions: ChartColumnsPropsModel;
    clickConversions: ChartColumnsPropsModel;
    viewConversions: ChartColumnsPropsModel;
    margin: ChartColumnsPropsModel;
    ecpm: ChartColumnsPropsModel;
    ecpa: ChartColumnsPropsModel;
    ecpc: ChartColumnsPropsModel;
    cpi: ChartColumnsPropsModel;
    ctr: ChartColumnsPropsModel;
    iti: ChartColumnsPropsModel;
    ctc: ChartColumnsPropsModel;
    cvr: ChartColumnsPropsModel;
    cost: ChartColumnsPropsModel; //Advertiser spend
    roi: ChartColumnsPropsModel;

    private chartColumnModel = {} as ChartColumnsModel;
    constructor(){
        let chartColumnProp = {} as ChartColumnsPropsModel;
        chartColumnProp.columnName = "advRevenue";
        chartColumnProp.displayName = "Advertiser Revenue";
        chartColumnProp.unit = localStorage.get("CURRENCY");

        
        let columnMap = new Map();
        columnMap.set("advRevenue", chartColumnProp);
        columnMap.set("mediaSpend", chartColumnProp);
        columnMap.set("impressions", chartColumnProp);

    }

    private prepChartColumn = function(columnName: string, 
        displayName: string, unit: string, ){
        let chartColumnProp = {} as ChartColumnsPropsModel;
        chartColumnProp.columnName = columnName;
        chartColumnProp.displayName = displayName;
        chartColumnProp.unit = unit;
    }
    
}
