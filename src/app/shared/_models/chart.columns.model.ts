import { ChartColumnsPropsModel } from './chart.columns.props.model';

export interface ChartColumnsModel {
    id: number;
    name: string;
    advRevenue: ChartColumnsPropsModel; // Advertiser Revenue
    mediaSpend: ChartColumnsPropsModel; // Media Spend
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
    cost: ChartColumnsPropsModel; // Advertiser spend
    roi: ChartColumnsPropsModel;

    toString();
}
