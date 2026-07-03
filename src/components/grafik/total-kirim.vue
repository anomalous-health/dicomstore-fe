<template>
    <div class="total-kirim-wrapper">
        <Toast />

        <!-- Summary Cards -->
        <div class="grid mb-3">
            <div class="col-12 md:col-4">
                <div class="summary-card summary-card--success">
                    <div class="summary-card__icon">
                        <i class="pi pi-check-circle"></i>
                    </div>
                    <div class="summary-card__content">
                        <span class="summary-card__label">Sukses Terkirim</span>
                        <span class="summary-card__value">{{ summaryData.success }}</span>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="summary-card summary-card--failed">
                    <div class="summary-card__icon">
                        <i class="pi pi-times-circle"></i>
                    </div>
                    <div class="summary-card__content">
                        <span class="summary-card__label">Gagal Terkirim</span>
                        <span class="summary-card__value">{{ summaryData.failed }}</span>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="summary-card summary-card--pending">
                    <div class="summary-card__icon">
                        <i class="pi pi-clock"></i>
                    </div>
                    <div class="summary-card__content">
                        <span class="summary-card__label">Belum Dikirim</span>
                        <span class="summary-card__value">{{ summaryData.pending }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid mb-3">
            <div class="col-12 md:col-6">
                <div class="summary-card summary-card--web">
                    <div class="summary-card__icon">
                        <i class="pi pi-cloud-upload"></i>
                    </div>
                    <div class="summary-card__content">
                        <span class="summary-card__label">Upload via Web</span>
                        <span class="summary-card__value">{{ summaryData.web }}</span>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="summary-card summary-card--scp">
                    <div class="summary-card__icon">
                        <i class="pi pi-desktop"></i>
                    </div>
                    <div class="summary-card__content">
                        <span class="summary-card__label">Terima dari Modality (SCP)</span>
                        <span class="summary-card__value">{{ summaryData.scp }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart Section -->
        <div class="grid">
            <div class="col-12">
                <Panel>
                    <template #header>
                        <div class="chart-header">
                            <h3 class="chart-header__title">
                                <i class="pi pi-chart-bar mr-2"></i>
                                Statistik Pengiriman Imagging Study Ke Satu Sehat
                            </h3>
                            <div class="chart-header__controls">
                                <SelectButton v-model="selectedPeriod" :options="periodOptions"
                                    optionLabel="label" optionValue="value" :allowEmpty="false"
                                    @change="onPeriodChange" />
                            </div>
                        </div>
                    </template>
                    <div class="chart-container">
                        <Bar v-if="chartReady" :data="chartData" :options="chartOptions" />
                        <div v-else class="chart-loading">
                            <ProgressSpinner style="width: 50px; height: 50px" />
                            <p>Memuat data grafik...</p>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { format, parse } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import apiClient from '../../services/apiService';
import "./grafik.css";

import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from 'chart.js'

import { Bar } from 'vue-chartjs'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
)

const intervalId = ref(null);
const toast = useToast();
const rawData = ref([]);
const chartReady = ref(false);

// Period selector
const selectedPeriod = ref('daily');
const periodOptions = [
    { label: 'Per Hari', value: 'daily' },
    { label: 'Per Bulan', value: 'monthly' }
];

// Summary data
const summaryData = ref({
    success: 0,
    failed: 0,
    pending: 0,
    web: 0,
    scp: 0
});

// Chart data
const chartData = ref({
    labels: [],
    datasets: []
});

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false
    },
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                font: {
                    size: 13
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
                title: (items) => {
                    if (!items.length) return '';
                    const label = items[0].label;
                    if (selectedPeriod.value === 'monthly') {
                        return label;
                    }
                    // Format date nicely for daily
                    try {
                        const date = parse(label, 'yyyy-MM-dd', new Date());
                        return format(date, 'dd MMMM yyyy', { locale: localeId });
                    } catch {
                        return label;
                    }
                },
                footer: (items) => {
                    const total = items.reduce((sum, item) => sum + item.raw, 0);
                    return `Total: ${total}`;
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: { size: 11 },
                maxRotation: 45,
                minRotation: 0,
                callback: function (value) {
                    const label = this.getLabelForValue(value);
                    if (selectedPeriod.value === 'daily') {
                        try {
                            const date = parse(label, 'yyyy-MM-dd', new Date());
                            return format(date, 'dd MMM', { locale: localeId });
                        } catch {
                            return label;
                        }
                    }
                    return label;
                }
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1,
                font: { size: 12 },
                precision: 0
            },
            grid: {
                color: 'rgba(200, 200, 200, 0.15)'
            }
        }
    }
}));

// Fetch data from API
const fetchData = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error("Access token not found.");
            return;
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        const response = await apiClient.get('/dicom');
        rawData.value = response.data.data;

        updateSummary();
        buildChart();
        chartReady.value = true;
    } catch (error) {
        console.error("Error fetching data:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data grafik', life: 3000 });
    }
};

// Update summary cards
const updateSummary = () => {
    const items = rawData.value;
    summaryData.value = {
        success: items.filter(i => i.routerStatus === 'SUCCESS').length,
        failed: items.filter(i => i.status === 'FAILED' || i.routerStatus === 'FAILED').length,
        pending: items.filter(i => i.routerStatus === null && i.status !== 'INVALID' && i.status !== 'FAILED').length,
        web: items.filter(i => i.source === 'WEB' || !i.source).length,
        scp: items.filter(i => i.source === 'SCP').length
    };
};

/**
 * Group the raw data by date or month and build aligned chart datasets.
 * All three datasets share the same labels array so bars line up correctly.
 */
const buildChart = () => {
    const items = rawData.value;
    const grouped = {};

    items.forEach(item => {
        if (!item.createdAt) return;

        let key;
        if (selectedPeriod.value === 'monthly') {
            // Group by YYYY-MM
            key = item.createdAt.substring(0, 7);
        } else {
            // Group by YYYY-MM-DD
            key = item.createdAt.split('T')[0];
        }

        if (!grouped[key]) {
            grouped[key] = { success: 0, failed: 0, pending: 0 };
        }

        if (item.routerStatus === 'SUCCESS') {
            grouped[key].success += 1;
        } else if (item.status === 'FAILED' || item.routerStatus === 'FAILED') {
            grouped[key].failed += 1;
        } else if (item.status !== 'INVALID') {
            grouped[key].pending += 1;
        }
    });

    // Sort labels chronologically
    const sortedKeys = Object.keys(grouped).sort();

    // Format labels for monthly display
    const displayLabels = sortedKeys.map(key => {
        if (selectedPeriod.value === 'monthly') {
            try {
                const date = parse(key + '-01', 'yyyy-MM-dd', new Date());
                return format(date, 'MMMM yyyy', { locale: localeId });
            } catch {
                return key;
            }
        }
        return key;
    });

    chartData.value = {
        labels: displayLabels,
        datasets: [
            {
                label: 'Sukses Terkirim',
                data: sortedKeys.map(k => grouped[k].success),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            },
            {
                label: 'Gagal Terkirim',
                data: sortedKeys.map(k => grouped[k].failed),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            },
            {
                label: 'Belum Dikirim',
                data: sortedKeys.map(k => grouped[k].pending),
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                borderColor: 'rgba(251, 191, 36, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }
        ]
    };
};

const onPeriodChange = () => {
    buildChart();
};

onMounted(() => {
    fetchData();

    intervalId.value = setInterval(() => {
        fetchData();
    }, 30000); // per 30 detik
});
</script>

<style scoped>
/* Summary Cards */
.summary-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: default;
}

.summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.summary-card--success {
    background: linear-gradient(135deg, #065f46, #059669);
    color: #fff;
}

.summary-card--failed {
    background: linear-gradient(135deg, #7f1d1d, #dc2626);
    color: #fff;
}

.summary-card--pending {
    background: linear-gradient(135deg, #78350f, #d97706);
    color: #fff;
}

.summary-card--web {
    background: linear-gradient(135deg, #374151, #4b5563);
    color: #fff;
}

.summary-card--scp {
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    color: #fff;
}

.summary-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
}

.summary-card__icon i {
    font-size: 1.5rem;
}

.summary-card__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.summary-card__label {
    font-size: 0.85rem;
    opacity: 0.9;
    font-weight: 500;
}

.summary-card__value {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
}

/* Chart Header */
.chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    gap: 1rem;
}

.chart-header__title {
    margin: 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
}

.chart-header__controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

/* Chart Container */
.chart-container {
    position: relative;
    height: 400px;
    width: 100%;
}

.chart-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    color: var(--text-color-secondary);
}

/* Responsive */
@media (max-width: 768px) {
    .chart-container {
        height: 300px;
    }

    .chart-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .summary-card__value {
        font-size: 1.4rem;
    }
}
</style>