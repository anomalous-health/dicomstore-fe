<template>
    <div class="monitor-page">
        <Toast />

        <section class="monitor-header">
            <div>
                <h2>Monitoring DICOM Router</h2>
                <!-- <p>Realtime terminal log PM2 untuk upload dan sent DICOM ke SATUSEHAT.</p> -->
            </div>
            <div class="header-actions">
                <Button icon="pi pi-refresh" label="Muat ulang" text @click="loadServices" :loading="loading" />
                <Button icon="pi pi-download" label="Download log" severity="secondary" @click="downloadLog" :disabled="!selectedService" />
                <!-- <Button icon="pi pi-replay" label="Restart PM2" severity="danger" @click="restartService" :loading="restarting" :disabled="!selectedService" /> -->
            </div>
        </section>

        <!-- <section class="monitor-toolbar" ">
            <div class="control">
                <label>Service</label>
                <Dropdown
                    v-model="selectedService"
                    :options="serviceOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih service"
                    class="control-input"
                    @change="changeService"
                />
            </div>
            <div class="control control-small">
                <label>Stream</label>
                <SelectButton v-model="stream" :options="streamOptions" optionLabel="label" optionValue="value" @change="loadInitialLogs" />
            </div>
            <div class="switch-control">
                <InputSwitch v-model="autoScroll" inputId="auto-scroll" />
                <label for="auto-scroll">Auto scroll</label>
            </div>
            <div class="switch-control">
                <InputSwitch v-model="errorOnly" inputId="error-only" />
                <label for="error-only">Filter ERROR</label>
            </div>
            <IconField iconPosition="left" class="search-box">
                <InputIcon><i class="pi pi-search" /></InputIcon>
                <InputText v-model="keyword" placeholder="Cari log" />
            </IconField>
        </section> -->

        <section class="metric-grid">
            <div class="metric">
                <span>Status</span>
                <strong :class="statusClass">{{ currentStatus?.status || 'OFFLINE' }}</strong>
            </div>
            <div class="metric">
                <span>CPU</span>
                <strong>{{ formatCpu(currentStatus?.cpu) }}</strong>
            </div>
            <div class="metric">
                <span>Memory</span>
                <strong>{{ formatMemory(currentStatus?.memory) }}</strong>
            </div>
            <div class="metric">
                <span>Restart</span>
                <strong>{{ currentStatus?.restartCount ?? 0 }}</strong>
            </div>
        </section>

        <section ref="terminalRef" class="terminal">
            <div v-if="visibleLogs.length === 0" class="terminal-empty">Belum ada log untuk service ini.</div>
            <div v-for="entry in visibleLogs" :key="entry.id" :class="['terminal-line', entry.stream, { error: isErrorLine(entry.line) }]">
                <span class="time">{{ entry.time }}</span>
                <span class="stream">{{ entry.stream }}</span>
                <span class="message">{{ entry.line }}</span>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
// import SockJS from 'sockjs-client';
import SockJS from 'sockjs-client/dist/sockjs'
import Stomp from 'stompjs';
import apiClient from '../../services/apiService';

const toast = useToast();
const services = ref([]);
const selectedService = ref('');
const currentStatus = computed(() => services.value.find((service) => service.name === selectedService.value));
const stream = ref('out');
const streamOptions = [
    { label: 'OUT', value: 'out' },
    { label: 'ERROR', value: 'error' }
];
const logs = ref([]);
const autoScroll = ref(true);
const errorOnly = ref(false);
const keyword = ref('');
const loading = ref(false);
const restarting = ref(false);
const terminalRef = ref(null);

let stompClient = null;
let statusSubscription = null;
let logSubscription = null;
let logSequence = 0;

const serviceOptions = computed(() => services.value.map((service) => ({
    label: service.name,
    value: service.name
})));

const statusClass = computed(() => {
    const status = currentStatus.value?.status?.toLowerCase() || 'offline';
    return {
        online: status === 'online',
        offline: status !== 'online'
    };
});

const visibleLogs = computed(() => {
    const term = keyword.value.trim().toLowerCase();
    return logs.value.filter((entry) => {
        if (errorOnly.value && !isErrorLine(entry.line) && entry.stream !== 'error') {
            return false;
        }
        if (term && !entry.line.toLowerCase().includes(term)) {
            return false;
        }
        return true;
    });
});

onMounted(async () => {
    await loadServices();
    connectSocket();
});

onBeforeUnmount(() => {
    unsubscribeLogs();
    statusSubscription?.unsubscribe();
    if (stompClient?.connected) {
        stompClient.disconnect();
    }
});

watch([logs, visibleLogs, autoScroll], () => {
    if (autoScroll.value) {
        scrollToBottom();
    }
});

async function loadServices() {
    loading.value = true;
    try {
        const response = await apiClient.get('/pm2/services');
        services.value = response.data || [];
        if (!selectedService.value && services.value.length > 0) {
            selectedService.value = services.value[0].name;
            await loadInitialLogs();
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil service PM2', life: 3000 });
    } finally {
        loading.value = false;
    }
}

async function changeService() {
    await loadInitialLogs();
    subscribeLogs();
}

async function loadInitialLogs() {
    if (!selectedService.value) {
        logs.value = [];
        return;
    }
    try {
        const response = await apiClient.get(`/pm2/services/${encodeURIComponent(selectedService.value)}/logs`, {
            params: { stream: stream.value, lines: 400 }
        });
        logs.value = (response.data.logs || '')
            .split(/\r?\n/)
            .filter(Boolean)
            .map((line) => createLogEntry(line, stream.value));
    } catch (error) {
        logs.value = [];
    } finally {
        scrollToBottom();
    }
}

function connectSocket() {
    const baseUrl = import.meta.env.VITE_WS_BASE || 'http://localhost:8080';
    const socket = new SockJS(`${baseUrl}/logs`);
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};
    stompClient.connect({}, () => {
        statusSubscription = stompClient.subscribe('/topic/pm2/status', (message) => {
            services.value = JSON.parse(message.body);
        });
        subscribeLogs();
    }, () => {
        toast.add({ severity: 'warn', summary: 'Socket', detail: 'Koneksi realtime log terputus', life: 3000 });
    });
}

function subscribeLogs() {
    if (!stompClient?.connected || !selectedService.value) {
        return;
    }
    unsubscribeLogs();
    logSubscription = stompClient.subscribe(`/topic/pm2/logs/${encodeURIComponent(selectedService.value)}`, (message) => {
        const payload = JSON.parse(message.body);
        if (payload.stream !== stream.value) {
            return;
        }
        logs.value.push(createLogEntry(payload.line, payload.stream, payload.timestamp));
        if (logs.value.length > 1500) {
            logs.value.splice(0, logs.value.length - 1500);
        }
    });
}

function unsubscribeLogs() {
    if (logSubscription) {
        logSubscription.unsubscribe();
        logSubscription = null;
    }
}

async function restartService() {
    if (!selectedService.value) {
        return;
    }
    restarting.value = true;
    try {
        await apiClient.post(`/pm2/services/${encodeURIComponent(selectedService.value)}/restart`);
        toast.add({ severity: 'success', summary: 'Restart PM2', detail: 'Service berhasil direstart', life: 3000 });
        await loadServices();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Restart gagal', detail: error.response?.data?.message || 'Pastikan user memiliki role ADMIN dan PM2 tersedia', life: 4000 });
    } finally {
        restarting.value = false;
    }
}

async function downloadLog() {
    if (!selectedService.value) {
        return;
    }
    try {
        const response = await apiClient.get(`/pm2/services/${encodeURIComponent(selectedService.value)}/download`, {
            params: { stream: stream.value },
            responseType: 'blob'
        });
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${selectedService.value}-${stream.value}.log`;
        link.click();
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Download gagal', detail: 'Log tidak bisa didownload', life: 3000 });
    }
}

function createLogEntry(line, logStream, timestamp = null) {
    const date = timestamp ? new Date(timestamp) : new Date();
    return {
        id: `${Date.now()}-${logSequence++}`,
        stream: logStream,
        line,
        time: date.toLocaleTimeString('id-ID', { hour12: false })
    };
}

function isErrorLine(line) {
    return /error|exception|failed|fatal/i.test(line || '');
}

function formatCpu(value) {
    return `${Number(value || 0).toFixed(1)}%`;
}

function formatMemory(bytes) {
    const value = Number(bytes || 0);
    if (value <= 0) {
        return '0 MB';
    }
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function scrollToBottom() {
    nextTick(() => {
        if (terminalRef.value) {
            terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
        }
    });
}
</script>

<style scoped>
.monitor-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.monitor-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.monitor-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.monitor-header p {
    margin: 0.35rem 0 0;
    color: var(--text-color-secondary);
}

.header-actions,
.monitor-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.monitor-toolbar {
    padding: 0.75rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-card);
}

.control {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 220px;
}

.control-small {
    min-width: 150px;
}

.control label,
.switch-control label {
    font-size: 0.85rem;
    color: var(--text-color-secondary);
}

.control-input {
    width: 100%;
}

.switch-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 42px;
    padding-top: 1.1rem;
}

.search-box {
    min-width: 220px;
    margin-left: auto;
}

.search-box :deep(input) {
    width: 100%;
}

.metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(140px, 1fr));
    gap: 0.75rem;
}

.metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-card);
}

.metric span {
    color: var(--text-color-secondary);
}

.metric strong {
    font-size: 1.05rem;
}

.online {
    color: #16a34a;
}

.offline {
    color: #dc2626;
}

.terminal {
    height: min(62vh, 180px);
    min-height: 100px;
    overflow-y: auto;
    border-radius: 8px;
    border: 1px solid #1f2937;
    background: #070b12;
    color: #d1d5db;
    padding: 0.85rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 0.86rem;
    line-height: 1.55;
}

.terminal-empty {
    color: #94a3b8;
}

.terminal-line {
    display: grid;
    grid-template-columns: 78px 54px minmax(0, 1fr);
    gap: 0.75rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.terminal-line .time {
    color: #60a5fa;
}

.terminal-line .stream {
    color: #a78bfa;
    text-transform: uppercase;
}

.terminal-line.error,
.terminal-line.error .stream {
    color: #f87171;
}

@media (max-width: 900px) {
    .monitor-header {
        flex-direction: column;
    }

    .header-actions,
    .monitor-toolbar {
        width: 100%;
    }

    .search-box {
        margin-left: 0;
        width: 100%;
    }

    .metric-grid {
        grid-template-columns: repeat(2, minmax(120px, 1fr));
    }
}
</style>
