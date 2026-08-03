<template>
    <div class="total-kirim-wrapper">
        <Toast />

        <!-- ── Row 1: Status pengiriman (3 cards) ───────────────────────── -->
        <div class="metric-row mb-4">
            <div class="metric-card metric-card--success">
                <div class="metric-card__bg-icon"><i class="pi pi-check-circle" /></div>
                <div class="metric-card__icon-wrap">
                    <i class="pi pi-check-circle" />
                </div>
                <div class="metric-card__body">
                    <span class="metric-card__label">Sukses Terkirim</span>
                    <span class="metric-card__value">{{ summaryData.success }}</span>
                </div>
                <div class="metric-card__trend">
                    <i class="pi pi-arrow-up-right" /> kirim
                </div>
            </div>

            <div class="metric-card metric-card--failed">
                <div class="metric-card__bg-icon"><i class="pi pi-times-circle" /></div>
                <div class="metric-card__icon-wrap">
                    <i class="pi pi-times-circle" />
                </div>
                <div class="metric-card__body">
                    <span class="metric-card__label">Gagal Terkirim</span>
                    <span class="metric-card__value">{{ summaryData.failed }}</span>
                </div>
                <div class="metric-card__trend metric-card__trend--warn">
                    <i class="pi pi-exclamation-triangle" /> error
                </div>
            </div>

            <div class="metric-card metric-card--pending">
                <div class="metric-card__bg-icon"><i class="pi pi-clock" /></div>
                <div class="metric-card__icon-wrap">
                    <i class="pi pi-clock" />
                </div>
                <div class="metric-card__body">
                    <span class="metric-card__label">Belum Dikirim</span>
                    <span class="metric-card__value">{{ summaryData.pending }}</span>
                </div>
                <div class="metric-card__trend metric-card__trend--neutral">
                    <i class="pi pi-hourglass" /> antrian
                </div>
            </div>
        </div>

        <!-- ── Row 2: Sumber data (2 cards) ────────────────────────────── -->
        <div class="metric-row metric-row--2col mb-4">
            <div class="metric-card metric-card--web">
                <div class="metric-card__bg-icon"><i class="pi pi-cloud-upload" /></div>
                <div class="metric-card__icon-wrap">
                    <i class="pi pi-cloud-upload" />
                </div>
                <div class="metric-card__body">
                    <span class="metric-card__label">Upload via Web</span>
                    <span class="metric-card__value">{{ summaryData.web }}</span>
                </div>
                <div class="metric-card__trend metric-card__trend--neutral">
                    <i class="pi pi-globe" /> web
                </div>
            </div>

            <div class="metric-card metric-card--scp">
                <div class="metric-card__bg-icon"><i class="pi pi-desktop" /></div>
                <div class="metric-card__icon-wrap">
                    <i class="pi pi-desktop" />
                </div>
                <div class="metric-card__body">
                    <span class="metric-card__label">Terima dari Modality (SCP)</span>
                    <span class="metric-card__value">{{ summaryData.scp }}</span>
                </div>
                <div class="metric-card__trend metric-card__trend--neutral">
                    <i class="pi pi-wifi" /> modality
                </div>
            </div>
        </div>

        <!-- ── Chart ────────────────────────────────────────────────────── -->
        <div class="chart-panel">
            <div class="chart-panel__header">
                <div class="chart-panel__title-group">
                    <div class="chart-panel__icon-wrap">
                        <i class="pi pi-chart-bar" />
                    </div>
                    <div>
                        <h3 class="chart-panel__title">Statistik Pengiriman Imaging Study</h3>
                        <p class="chart-panel__subtitle">Ke SatuSehat · Auto refresh tiap 30 detik</p>
                    </div>
                </div>
                <SelectButton v-model="selectedPeriod" :options="periodOptions"
                    optionLabel="label" optionValue="value" :allowEmpty="false"
                    @change="onPeriodChange" class="chart-period-btn" />
            </div>

            <div class="chart-container">
                <Bar v-if="chartReady" :data="chartData" :options="chartOptions" />
                <div v-else class="chart-loading">
                    <ProgressSpinner style="width: 44px; height: 44px" />
                    <p>Memuat data grafik...</p>
                </div>
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
/* ── Metric rows ─────────────────────────────────────────────────────────── */
.metric-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.metric-row--2col {
    grid-template-columns: repeat(2, 1fr);
}

/* ── Metric card ─────────────────────────────────────────────────────────── */
.metric-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.25rem 1.25rem 1.5rem;
    border-radius: 14px;
    color: #fff;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: default;
}

.metric-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

/* Decorative large bg icon */
.metric-card__bg-icon {
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 5rem;
    opacity: 0.08;
    pointer-events: none;
    line-height: 1;
}

/* Small icon circle */
.metric-card__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
    flex-shrink: 0;
    backdrop-filter: blur(4px);
}

.metric-card__icon-wrap i {
    font-size: 1.25rem;
}

/* Body */
.metric-card__body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
}

.metric-card__label {
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.85;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.metric-card__value {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
}

/* Trend chip */
.metric-card__trend {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
    align-self: flex-start;

    i { font-size: 0.65rem; }
}

.metric-card__trend--warn    { background: rgba(255, 200, 100, 0.25); }
.metric-card__trend--neutral { background: rgba(255, 255, 255, 0.12); }

/* Card color variants */
.metric-card--success { background: linear-gradient(135deg, #065f46 0%, #059669 100%); }
.metric-card--failed  { background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); }
.metric-card--pending { background: linear-gradient(135deg, #78350f 0%, #d97706 100%); }
.metric-card--web     { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); }
.metric-card--scp     { background: linear-gradient(135deg, #1a1f35 0%, #4f46e5 100%); }

/* ── Chart panel ─────────────────────────────────────────────────────────── */
.chart-panel {
    background: var(--surface-card, #ffffff);
    border: 1px solid var(--surface-border, #e5e7eb);
    border-radius: 14px;
    overflow: hidden;
}

.chart-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid var(--surface-border, #f3f4f6);
    flex-wrap: wrap;
}

.chart-panel__title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.chart-panel__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #ecfdf5;
    color: #059669;
    flex-shrink: 0;

    i { font-size: 1rem; }
}

.chart-panel__title {
    margin: 0 0 0.1rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-color, #111827);
}

.chart-panel__subtitle {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-color-secondary, #9ca3af);
}

.chart-container {
    position: relative;
    height: 380px;
    padding: 1.25rem 1.5rem 1rem;
}

.chart-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.75rem;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
    .metric-row       { grid-template-columns: repeat(2, 1fr); }
    .metric-row--2col { grid-template-columns: 1fr; }
    .chart-container  { height: 300px; }
}

@media (max-width: 600px) {
    .metric-row { grid-template-columns: 1fr; }
    .metric-card__value { font-size: 1.6rem; }
    .chart-panel__header { flex-direction: column; align-items: flex-start; }
}
</style>