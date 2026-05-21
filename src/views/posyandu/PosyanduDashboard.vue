<template>
  <div class="dicomstore-page">
    <Toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Ringkasan layanan, sasaran, dan aktivitas bulan berjalan.</p>
      </div>
      <div class="status-row">
        <Calendar v-model="filters.tanggal_mulai" dateFormat="yy-mm-dd" showIcon />
        <Calendar v-model="filters.tanggal_selesai" dateFormat="yy-mm-dd" showIcon />
        <Button icon="pi pi-refresh" label="Muat" @click="loadDashboard" :loading="loading" />
      </div>
    </div>

    <div class="metric-grid">
      <div v-for="item in metrics" :key="item.label" class="metric-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value">{{ item.value }}</div>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-6">
        <div class="content-panel">
          <h3 class="mt-0">Kunjungan per Layanan</h3>
          <DataTable :value="serviceRows" :loading="loading" dataKey="layanan">
            <Column field="layanan" header="Layanan" />
            <Column field="total" header="Total" />
          </DataTable>
        </div>
      </div>
      <div class="col-12 lg:col-6">
        <div class="content-panel">
          <h3 class="mt-0">Periode</h3>
          <div class="status-row">
            <Tag severity="info" :value="dashboard?.periode?.tanggal_mulai || '-'" />
            <Tag severity="success" :value="dashboard?.periode?.tanggal_selesai || '-'" />
          </div>
          <Divider />
          <p class="m-0 text-color-secondary">Data diambil dari proses keseluruhan.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import apiClient from "../../services/apiService";
import { labelFrom, layananOptions, toApiDate } from "./posyanduService";
import "./posyandu.css";

const toast = useToast();
const loading = ref(false);
const dashboard = ref(null);
const now = new Date();
const filters = reactive({
  tanggal_mulai: new Date(now.getFullYear(), now.getMonth(), 1),
  tanggal_selesai: new Date(now.getFullYear(), now.getMonth() + 1, 0),
});

const metrics = computed(() => [
  { label: "Posyandu Aktif", value: dashboard.value?.total_posyandu || 0 },
  { label: "Jadwal", value: dashboard.value?.total_jadwal || 0 },
  { label: "Kunjungan", value: dashboard.value?.total_kunjungan || 0 },
  { label: "Balita", value: dashboard.value?.total_balita || 0 },
  { label: "Ibu Hamil", value: dashboard.value?.total_ibu_hamil || 0 },
  { label: "Pengukuran Balita", value: dashboard.value?.total_pengukuran_balita || 0 },
  { label: "Imunisasi/Vitamin", value: dashboard.value?.total_imunisasi || 0 },
  { label: "Pemeriksaan Ibu Hamil", value: dashboard.value?.total_pemeriksaan_ibu_hamil || 0 },
]);

const serviceRows = computed(() => {
  const data = dashboard.value?.kunjungan_per_layanan || {};
  return Object.entries(data).map(([layanan, total]) => ({
    layanan: labelFrom(layananOptions, layanan),
    total,
  }));
});

async function loadDashboard() {
  try {
    loading.value = true;
    const response = await apiClient.get("/posyandu-dashboard", {
      params: {
        tanggal_mulai: toApiDate(filters.tanggal_mulai),
        tanggal_selesai: toApiDate(filters.tanggal_selesai),
      },
    });
    dashboard.value = response.data.data;
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Dashboard tidak dapat dimuat", life: 3000 });
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
</script>
