import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, TooltipComponent, GridComponent, CanvasRenderer]);

const option = {
  tooltip: { trigger: 'axis' },
  grid: { left: 36, right: 12, top: 12, bottom: 24 },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], boundaryGap: false, axisLabel: { fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [{
    type: 'line',
    data: [150, 230, 224, 318, 435, 390, 410],
    smooth: true,
    areaStyle: { opacity: 0.15 },
    lineStyle: { width: 2 },
    color: '#20A7C9',
  }],
};

export default function LinePreview() {
  return <ReactEChartsCore echarts={echarts} option={option} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />;
}
