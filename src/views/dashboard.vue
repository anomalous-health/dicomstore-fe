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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import apiClient from '../services/apiService';
import totalKirim from '../components/grafik/total-kirim.vue';

const router = useRouter();
const toast = useToast();
const loading = ref(true);
const patients = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Format tanggal ke format Indonesia
const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMMM yyyy', { locale: id });
};


const viewDetails = (patient) => {
  router.push(`/master/pasien/${patient.id}`);
};

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