<template>
  <div class="content-table">
    <div class="card">
      <Toast />
      
      <h1 class="mb-4">Selamat Datang di Dashboard {{ userRole }}</h1>

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
import totalKirim from '../components/grafik/total-kirim.vue';

const router = useRouter();
const toast = useToast();

// Get user role from localStorage
const userRole = computed(() => {
  try {
    return localStorage.getItem('role') || '';
  } catch {
    return '';
  }
});

onMounted(() => {
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