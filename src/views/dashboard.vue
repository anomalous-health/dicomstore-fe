<template>
  <div class="content-table">
    <div class="card">
      <Toast />
      
      <h1 class="mb-4">Selamat Datang di Dashboard {{ userRole }}</h1>

      <div class="grid">
        <div class="col-12">
          <Panel header="Data Pasien Terdaftar Hari ini" class="mb-3">
            <DataTable :value="patients" :paginator="true" :rows="10" 
                      :filters="filters"
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                      :rowsPerPageOptions="[5, 10, 25]"
                      currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} Data"
                      v-model:filters="filters" dataKey="id"
                      :loading="loading">
              
              <template #header>
                <div class="flex justify-content-between align-items-center">
                  <h3 class="m-0">Daftar Pasien</h3>
                  <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Cari..." />
                  </span>
                </div>
              </template>

              <Column field="nama" header="Nama" sortable></Column>
              <Column field="jenis_kelamin" header="Jenis Kelamin" sortable>
                <template #body="slotProps">
                  {{ slotProps.data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}
                </template>
              </Column>
              <Column field="tanggal_lahir" header="Tanggal Lahir" sortable>
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.tanggal_lahir) }}
                </template>
              </Column>
              <Column header="Aksi">
                <template #body="slotProps">
                  <Button icon="pi pi-eye" rounded outlined
                          @click="viewDetails(slotProps.data)"
                          class="mr-2" severity="info" />
                </template>
              </Column>
            </DataTable>
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

const fetchPatients = async () => {
  try {
    loading.value = true;
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Token tidak tersedia',
        life: 3000
      });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    const response = await apiClient.get('/pasien');
    patients.value = response.data.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.pesan || 'Gagal mengambil data pasien',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
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