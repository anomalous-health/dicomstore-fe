<template>
  <div class="content-table">
    <div class="card">
      <Toast />
      
      <h1 class="mb-4">Selamat Datang di Dashboard {{ userRole }}</h1>

      <!-- <div class="grid">
        <div class="col-12 md:col-6 lg:col-4">
          <div class="surface-card shadow-2 p-3 border-round mb-3" style="border-left: 6px solid var(--blue-500)">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-2">Status SCP Listener</span>
                <div class="text-900 font-medium text-xl">
                  <Tag v-if="scpStatus.running" severity="success" value="RUNNING"></Tag>
                  <Tag v-else severity="danger" value="STOPPED"></Tag>
                </div>
              </div>
              <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                <i class="pi pi-desktop text-blue-500 text-xl"></i>
              </div>
            </div>
            <span class="text-green-500 font-medium">{{ scpStatus.activeConnections }} </span>
            <span class="text-500">koneksi aktif</span>
            <div class="mt-2 text-sm text-600">
              AE Title: <strong>{{ scpStatus.aeTitle || '-' }}</strong> | Port: <strong>{{ scpStatus.port || '-' }}</strong>
            </div>
          </div>
        </div>
      </div> -->

      <div class="grid">
        <div class="col-12">
          <Panel header="" class="mb-3">
           <totalKirim/>
          </Panel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
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

// Get user role from localStorage
const userRole = computed(() => {
  try {
    return localStorage.getItem('role') || '';
  } catch {
    return '';
  }
});

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
  // Set interval to refresh active connections every 5 seconds
  const interval = setInterval(fetchScpStatus, 5000);
  // cleanup on unmount
  return () => clearInterval(interval);
});
</script>

<style scoped>
.card {
  padding: 0.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

:deep(.p-panel) {
  margin-bottom: 1rem;
}

:deep(.p-datatable) {
  margin-top: 1rem;
}
</style>