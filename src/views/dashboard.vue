<template>
  <div class="dash-page">
    <Toast />

    <!-- ── Page Header ─────────────────────────────────────────────────── -->
    <div class="dash-header">
      <div class="dash-header__left">
        <p class="dash-header__greeting">Selamat Datang 👋</p>
        <h1 class="dash-header__title">{{ userRole || 'Dashboard' }}</h1>
        <p class="dash-header__date">{{ currentDate }}</p>
      </div>

      <!-- SCP Status Card -->
      <div class="scp-card" :class="scpStatus.running ? 'scp-card--up' : 'scp-card--down'">
        <div class="scp-card__indicator" />
        <div class="scp-card__body">
          <span class="scp-card__label">SCP Listener</span>
          <span class="scp-card__status">{{ scpStatus.running ? 'RUNNING' : 'STOPPED' }}</span>
          <span class="scp-card__meta" v-if="scpStatus.running">
            AE: <b>{{ scpStatus.aeTitle || '-' }}</b> &nbsp;·&nbsp; Port: <b>{{ scpStatus.port || '-' }}</b>
          </span>
        </div>
        <div class="scp-card__connections" v-if="scpStatus.running">
          <span class="scp-connections__count">{{ scpStatus.activeConnections }}</span>
          <span class="scp-connections__label">koneksi aktif</span>
        </div>
      </div>
    </div>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <totalKirim />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import apiClient from '../services/apiService';
import totalKirim from '../components/grafik/total-kirim.vue';

const router = useRouter();
const toast = useToast();
const scpStatus = ref({
  enabled: false,
  running: false,
  aeTitle: '',
  port: 0,
  activeConnections: 0
});

const userRole = computed(() => {
  try { return localStorage.getItem('role') || ''; } catch { return ''; }
});

const currentDate = computed(() =>
  format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })
);

const fetchScpStatus = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const response = await apiClient.get('/dicom/scp/status');
      scpStatus.value = response.data;
    }
  } catch (error) {
    console.error("Gagal mengambil status SCP", error);
  }
};

onMounted(() => {
  fetchScpStatus();
  const interval = setInterval(fetchScpStatus, 5000);
  return () => clearInterval(interval);
});
</script>

<style scoped>
.dash-page {
  padding: 1.5rem;
  max-width: 1600px;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}

.dash-header__greeting {
  margin: 0 0 0.15rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary, #6b7280);
}

.dash-header__title {
  margin: 0 0 0.2rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-color, #111827);
  letter-spacing: -0.02em;
  text-transform: capitalize;
}

.dash-header__date {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-color-secondary, #9ca3af);
}

/* ── SCP Status Card ─────────────────────────────────────────────────────── */
.scp-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid;
  min-width: 260px;
  position: relative;
  overflow: hidden;
}

.scp-card--up {
  background: #f0fdf4;
  border-color: #a7f3d0;
}

.scp-card--down {
  background: #fef2f2;
  border-color: #fecaca;
}

/* Pulse indicator dot */
.scp-card__indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.scp-card--up .scp-card__indicator {
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  animation: scp-pulse 2s ease-in-out infinite;
}

.scp-card--down .scp-card__indicator {
  background: #ef4444;
}

@keyframes scp-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

.scp-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.scp-card__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-color-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.scp-card__status {
  font-size: 0.95rem;
  font-weight: 700;
}

.scp-card--up .scp-card__status   { color: #047857; }
.scp-card--down .scp-card__status { color: #b91c1c; }

.scp-card__meta {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #6b7280);
}

.scp-card__connections {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 1rem;
  border-left: 1px solid #a7f3d0;
}

.scp-connections__count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #047857;
  line-height: 1;
}

.scp-connections__label {
  font-size: 0.7rem;
  color: #6b7280;
  white-space: nowrap;
}
</style>
