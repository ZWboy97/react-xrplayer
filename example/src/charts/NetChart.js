import { Chart } from '@antv/g2';


/**
 * 绘制Dash播放器的buffer清空
 */
class NetChart {

    constructor(data) {
        this.data = data;
        this.chart = null;
        this.initChart();
    }

    initChart = () => {
        // Step 1: 创建 Chart 对象
        let chart = new Chart({
            container: 'c3', // 指定图表容器 ID
            width: 1200, // 指定图表宽度
            height: 300, // 指定图表高度
            autoFit: true,
        });

        // Step 2: 载入数据源
        chart.data(this.data);

        // Step 3: 创建图形语法，绘制柱状图
        chart.scale({
            x: {
                type: 'cat',
                values: ['0', '1', '2', '3']
            },
            y: {
                type: 'cat',
                values: ['0', '1', '2', '3']
            },
            value: {
                nice: true
            }
        });
        chart.polygon().position('y*x')
            .color('value', '#BAE7FF-#1890FF-#0050B3')
            .label('value', {
                offset: -2,
                style: {
                    fill: '#fff',
                    shadowBlur: 2,
                    shadowColor: 'rgba(0, 0, 0, .45)',
                },
            })
            .style({
                lineWidth: 1,
                stroke: '#fff',
            });
        // Step 4: 渲染图表
        chart.render();
        this.chart = chart;
    }

    updateData = (data) => {
        this.chart.changeData(data);
    }

}

export default NetChart;