import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TooltipComponent, GridComponent, CanvasRenderer]);

const option = {
  tooltip: {},
  grid: { left: 36, right: 12, top: 12, bottom: 24 },
  xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], axisLabel: { fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [{
    type: 'bar',
    data: [820, 932, 901, 1290, 1330, 820, 1100],
    itemStyle: { borderRadius: [4, 4, 0, 0] },
    color: '#20A7C9',
  }],
};

export default function BarPreview() {
  return <ReactEChartsCore echarts={echarts} option={option} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />;
}
