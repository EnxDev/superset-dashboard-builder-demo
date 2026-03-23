import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const option = {
  tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
  legend: { bottom: 0, textStyle: { fontSize: 10, color: '#999' } },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '42%'],
    label: { show: false },
    data: [
      { value: 335, name: 'Electronics' },
      { value: 234, name: 'Clothing' },
      { value: 154, name: 'Food' },
      { value: 135, name: 'Software' },
      { value: 98,  name: 'Other' },
    ],
    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' } },
  }],
};

export default function PiePreview() {
  return <ReactEChartsCore echarts={echarts} option={option} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />;
}
