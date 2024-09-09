import React, { useMemo } from 'react';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import './Timeline.css';

// Define the plugin outside of the component
const vintageLabelsPlugin = {
    id: 'vintageLabels',
    afterDatasetsDraw(chart, args, options) {
        console.log('afterDatasetsDraw called');

        const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: { x, y } } = chart;

        if (!ctx) {
            console.error('Canvas context is not available');
            return;
        }

        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        chart.data.datasets.forEach((dataset, i) => {
            console.log(`Processing dataset ${i}:`, dataset);

            const meta = chart.getDatasetMeta(i);
            if (!meta) {
                console.error(`Dataset meta not found for dataset ${i}`);
                return;
            }

            if (!meta.hidden) {
                meta.data.forEach((element, index) => {
                    if (index === 0) {  // Only draw label once per vintage
                        console.log(`Drawing label for dataset ${i}, element ${index}`);

                        if (!element || typeof element.x === 'undefined' || typeof element.y === 'undefined') {
                            console.error(`Invalid element data for dataset ${i}, element ${index}`);
                            return;
                        }

                        const startX = element.x;
                        const endX = meta.data[1] ? meta.data[1].x : startX;
                        const midX = (startX + endX) / 2;
                        const yPos = element.y;

                        // Draw text outline
                        // ctx.lineWidth = 3;
                        // ctx.strokeStyle = 'black';
                        // ctx.strokeText(dataset.vintage, midX, yPos);

                        // Draw text
                        ctx.fillStyle = 'white';
                        ctx.fillText(dataset.vintage, midX, yPos);

                        console.log(`Label drawn at (${midX}, ${yPos})`);
                    }
                });
            }
        });

        ctx.restore();
    }
};

// Register the plugin
ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, vintageLabelsPlugin);

// Define a color palette
const colorPalette = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#7BC225', '#B56DFF'
];

const Timeline = ({ vintages }) => {
    console.log('Timeline component rendered');

    const excelDateToJSDate = (excelDate) => new Date((excelDate - 25569) * 86400 * 1000);

    // Create a color mapping for vintages
    const vintageColorMap = useMemo(() => {
        const uniqueVintages = [...new Set(vintages.map(v => v.vintage))].sort();
        return Object.fromEntries(uniqueVintages.map((vintage, index) => [vintage, colorPalette[index % colorPalette.length]]));
    }, [vintages]);

    const processedVintages = vintages.map((v, index) => ({
        ...v,
        color: vintageColorMap[v.vintage],
        ivtStart: excelDateToJSDate(v.ivtStart),
        ivtEnd: excelDateToJSDate(v.ivtEnd),
        vtdStart: excelDateToJSDate(v.vtdStart),
        vtdEnd: excelDateToJSDate(v.vtdEnd)
    }));

    const startDate = new Date(Math.min(...processedVintages.flatMap(v => [v.ivtStart, v.vtdStart])));
    const endDate = new Date(Math.max(...processedVintages.flatMap(v => [v.ivtEnd, v.vtdEnd])));

    console.log('Processed vintages:', processedVintages);

    const data = {
        datasets: [
            ...processedVintages.map(v => ({
                label: `Ideal - Vintage ${v.vintage}`,
                data: [
                    { x: v.ivtStart, y: 1 },
                    { x: v.ivtEnd, y: 1 }
                ],
                borderColor: v.color,
                backgroundColor: v.color,
                borderWidth: 20,
                pointRadius: 0,
                vintage: v.vintage
            })),
            ...processedVintages.map(v => ({
                label: `Planned - Vintage ${v.vintage}`,
                data: [
                    { x: v.vtdStart, y: 0 },
                    { x: v.vtdEnd, y: 0 }
                ],
                borderColor: v.color,
                backgroundColor: v.color,
                borderWidth: 20,
                pointRadius: 0,
                vintage: v.vintage
            }))
        ]
    };

    console.log('Chart data:', data);

    const options = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'year',
                    displayFormats: {
                        year: 'yyyy'
                    }
                },
                min: startDate,
                max: endDate,
                title: {
                    display: false
                },
                grid: {
                    drawOnChartArea: false
                }
            },
            y: {
                display: true,
                min: -0.5,
                max: 1.5,
                ticks: {
                    callback: function (value, index, values) {
                        if (value === 0) return 'Planned';
                        if (value === 1) return 'Ideal';
                        return '';
                    }
                },
                grid: {
                    drawBorder: false,
                    drawTicks: false,
                    drawOnChartArea: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: (context) => context[0].dataset.label,
                    label: (context) => {
                        const data = context.raw;
                        return `${data.x.toDateString()}`;
                    }
                }
            },
            vintageLabels: {} // This enables the plugin
        },
        maintainAspectRatio: false
    };

    return (
        <div className="timeline">
            <div className="chart-container">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default Timeline;