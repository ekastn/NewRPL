import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Daftarkan komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function EmotionChart({ emotionStats }) {
    const chartRef = useRef(null);
    
    if (!emotionStats || emotionStats.length === 0) {
        return <div>Tidak ada data untuk ditampilkan</div>;
    }
    
    // Definisikan warna emosi
    const emotionColors = {
        happy: 'rgba(75, 192, 192, 0.8)',     // Teal
        neutral: 'rgba(153, 102, 255, 0.8)',   // Ungu
        tired: 'rgba(255, 159, 64, 0.8)',      // Orange
        stressed: 'rgba(255, 99, 132, 0.8)',   // Merah
        excited: 'rgba(54, 162, 235, 0.8)'     // Biru
    };
    
    // Dapatkan emoji emosi untuk label
    const getEmotionEmoji = (emotion) => {
        const emojis = {
            happy: '😊',
            neutral: '😐',
            tired: '😔',
            stressed: '😠',
            excited: '😃'
        };
        
        return emojis[emotion] || '';
    };
    
    // Siapkan data grafik
    const chartData = {
        labels: emotionStats.map(stat => `${getEmotionEmoji(stat.mood)} ${stat.mood}`),
        datasets: [
            {
                label: 'Emosi Tim',
                data: emotionStats.map(stat => stat.count),
                backgroundColor: emotionStats.map(stat => emotionColors[stat.mood] || 'rgba(201, 203, 207, 0.8)'),
                borderWidth: 1,
            },
        ],
    };
    
    // Opsi grafik
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: (context) => {
                        const index = context[0].dataIndex;
                        if (index >= 0 && index < emotionStats.length) {
                            const emotion = emotionStats[index].mood;
                            return emotion.charAt(0).toUpperCase() + emotion.slice(1);
                        }
                        return '';
                    },
                    label: (context) => {
                        const count = context.parsed.y;
                        const total = emotionStats.reduce((acc, stat) => acc + stat.count, 0);
                        return `Jumlah: ${count} (${Math.round(count / total * 100)}%)`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    // Tambahkan error boundary
    useEffect(() => {
        const chart = chartRef.current;
        
        return () => {
            if (chart) {
                try {
                    chart.destroy();
                } catch (e) {
                    console.error('Error destroying chart:', e);
                }
            }
        };
    }, []);
    
    return (
        <div style={{ width: '100%', height: '200px' }}>
            <Bar ref={chartRef} data={chartData} options={options} />
        </div>
    );
}

export default EmotionChart;