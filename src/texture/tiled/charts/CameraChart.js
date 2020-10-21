import { Chart } from '@antv/g2';


/**
 * 绘制相机移动相关的图表
 */
class CameraChart {

    constructor(data) {
        this.trace = data;
        this.chart = null;
        this.initChart();
    }

    initChart = () => {
        // Step 1: 创建 Chart 对象
        let chart = new Chart({
            container: 'c1', // 指定图表容器 ID
            width: 1200, // 指定图表宽度
            height: 300, // 指定图表高度
            autoFit: true,
        });

        // Step 2: 载入数据源
        chart.data(this.trace);

        // Step 3: 创建图形语法，绘制柱状图
        chart.scale({
            time: {
                range: [0, 1],
                alias: '时间'
            },
            x: {
                alias: 'x坐标',
                min: 0,
                nice: true,
                max: 1
            },
            y: {
                alias: 'y坐标',
                min: 0,
                nice: true,
                max: 1
            },
            px: {
                alias: 'x预测',
                min: 0,
                nice: true,
                max: 1
            },
            py: {
                alias: 'y预测',
                min: 0,
                nice: true,
                max: 1
            },
            errX: {
                alias: 'x预测MAE',
                min: 0,
                nice: true,
                max: 0.5
            },
            errY: {
                alias: 'y预测MAE',
                min: 0,
                nice: true,
                max: 0.5
            }
        });
        chart.axis('time', {
            title: {}
        });
        chart.axis('x', {
            title: {}
        });
        chart.axis('y', {
            title: {}
        });
        chart.axis('px', {
            title: {}
        });
        chart.axis('py', {
            title: {}
        });
        chart.axis('errX', {
            title: {}
        });
        chart.axis('errY', {
            title: {}
        });
        chart.tooltip({
            showCrosshairs: true, // 展示 Tooltip 辅助线
            shared: true,
        });
        chart.legend({
            custom: 'true',
            items: [
                { name: 'x', value: 'x', marker: { symbol: 'line', style: { stroke: '#1890ff', lineWidth: 2 } } },
                { name: 'y', value: 'y', marker: { symbol: 'line', style: { stroke: '#ff00ff', lineWidth: 2 } } },
                { name: 'predictX', value: 'px', marker: { symbol: 'line', style: { stroke: '#80ff00', lineWidth: 2 } } },
                { name: 'predictY', value: 'py', marker: { symbol: 'line', style: { stroke: '#ff0000', lineWidth: 2 } } },
                { name: 'errorX', value: 'errX', marker: { symbol: 'line', style: { stroke: '#ffff00', lineWidth: 2 } } },
                { name: 'errorY', value: 'errY', marker: { symbol: 'line', style: { stroke: '#ff8000', lineWidth: 2 } } },

            ],
        });
        chart.line().position('time*x').color('#1890ff');
        chart.line().position('time*y').color('#ff00ff');
        chart.line().position('time*px').color('#80ff00');
        chart.line().position('time*py').color('#ff0000');
        chart.line().position('time*errX').color('#ffff00');
        chart.line().position('time*errY').color('#ff8000');
        // Step 4: 渲染图表
        chart.render();
        this.chart = chart;
    }

    updateData = (data) => {
        this.chart.changeData(data);
    }

}

export default CameraChart;