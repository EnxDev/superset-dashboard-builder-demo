import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([ScatterChart, TooltipComponent, GridComponent, CanvasRenderer]);

const data = Array.from({ length: 30 }, () => [
  Math.round(Math.random() * 100),
  Math.round(Math.random() * 100),
]);

const option = {
  tooltip: {},
  grid: { left: 36, right: 12, top: 12, bottom: 24 },
  xAxis: { axisLabel: { fontSize: 10 } },
  yAxis: { axisLabel: { fontSize: 10 } },
  series: [{
    type: 'scatter',
    data,
    symbolSize: 8,
    itemStyle: { color: '#20A7C9', opacity: 0.7 },
  }],
};

export default function ScatterPreview() {
  return <ReactEChartsCore echarts={echarts} option={option} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />;
}
