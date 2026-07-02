<template>
  <div class="content-table">
    <div class="card">
      <Toast />
      

      <div class="grid">
        <div class="col-6">
          <Panel>
            <template #header>
            <div class="txtcenter" style="">
              <h3>DATA YANG BERHASIL TERKIRIM KE SATUSEHAT</h3>
            </div>
            </template>
            <h2 class="mb-4">{{ totalKirim }}</h2>
            
        </Panel>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- <style scoped>
@import './grafik.css';
</style> -->

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import apiClient from '../../services/apiService';
import "./grafik.css";


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
  fetchPatients();
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