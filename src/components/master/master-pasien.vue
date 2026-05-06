<template>
  <div class="content-tabel">
    <div class="card">
      <Toast />

      <!-- Button -->
      <Toolbar class="mb-2">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" class="mr-2"
                  @click="confirmDeleteSelected"
                  :disabled="!selectedPasiens || !selectedPasiens.length" />
          <Button label="Update" icon="pi pi-pencil" severity="info" @click="openEdit"
                  :disabled="!selectedPasiens || !selectedPasiens.length" />
        </template>

        <!-- Export -->
        <template #end>
          <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import"
                      class="mr-2 inline-block" />
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataTable ref="dt" :value="data" v-model:selection="selectedPasiens" dataKey="id" :paginator="true"
                 :rows="10" :filters="filters"
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 :rowsPerPageOptions="[5, 10, 25]"
                 currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} Data">
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h3 class="m-0" style="padding-right: 550px;">Data Master Pasien</h3>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <Column selectionMode="multiple" style="" :exportable="false"></Column>
        <Column field="nama" header="Nama" sortable style=""></Column>
        <Column field="nik" header="NIK" sortable style=""></Column>
        <Column field="jenis_kelamin" header="Jenis Kelamin" sortable style=""></Column>
        <Column field="tempat_lahir" header="Tempat Lahir" sortable style=""></Column>
        <Column field="tanggal_lahir" header="Tanggal Lahir" sortable style=""></Column>
        <Column field="alamat" header="Alamat" sortable style=""></Column>
        <Column field="no_telepon" header="No. Telepon" sortable style=""></Column>
        <Column header="Lihat Detail Pasien" :exportable="false" style="">
          <template #body="slotProps">
            <Button icon="pi pi-eye" rounded outlined class="mr-2"
                    @click="viewDetails(slotProps.data)"
                    severity="info" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create Dialog -->
    <Dialog v-model:visible="createDialog" :style="{ width: '450px' }" header="Tambah Pasien" :modal="true" class="p-fluid">
      <!-- Nama -->
      <div class="field">
        <label for="nama">Nama</label>
        <InputText id="nama" v-model.trim="data.nama" required :invalid="submitted && !data.nama" />
        <small class="p-error" v-if="submitted && !data.nama">Nama pasien wajib diisi.</small>
      </div>

      <!-- NIK -->
      <div class="field">
        <label for="nik">NIK</label>
        <InputText id="nik" v-model.trim="data.nik" required :invalid="submitted && !data.nik" />
        <small class="p-error" v-if="submitted && !data.nik">NIK wajib diisi.</small>
      </div>

      <!-- Jenis Kelamin -->
      <div class="field">
        <label for="jenis_kelamin">Jenis Kelamin</label>
        <Dropdown id="jenis_kelamin" v-model="data.jenis_kelamin" :options="jenisKelaminOptions" 
                  optionLabel="label" optionValue="value" placeholder="Pilih Jenis Kelamin" />
      </div>

      <!-- Tempat Lahir -->
      <div class="field">
        <label for="tempat_lahir">Tempat Lahir</label>
        <InputText id="tempat_lahir" v-model.trim="data.tempat_lahir" />
      </div>

      <!-- Tanggal Lahir -->
      <div class="field">
        <label for="tanggal_lahir">Tanggal Lahir</label>
        <Calendar id="tanggal_lahir" v-model="data.tanggal_lahir" dateFormat="yy-mm-dd" />
      </div>

      <!-- Alamat -->
      <div class="field">
        <label for="alamat">Alamat</label>
        <Textarea id="alamat" v-model.trim="data.alamat" rows="4" />
      </div>

      <!-- No. Telepon -->
      <div class="field">
        <label for="no_telepon">No. Telepon</label>
        <InputText id="no_telepon" v-model.trim="data.no_telepon" />
      </div>

      <!-- Footer -->
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" text @click="create" />
      </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="editDialog" :style="{ width: '450px' }" header="Edit Data Pasien" :modal="true" class="p-fluid">
      <!-- Nama -->
      <div class="field">
        <label for="nama">Nama</label>
        <InputText id="nama" v-model.trim="pasien.nama" required :invalid="submitted && !pasien.nama" />
        <small class="p-error" v-if="submitted && !pasien.nama">Nama pasien wajib diisi.</small>
      </div>

      <!-- NIK -->
      <div class="field">
        <label for="nik">NIK</label>
        <InputText id="nik" v-model.trim="pasien.nik" required :invalid="submitted && !pasien.nik" />
        <small class="p-error" v-if="submitted && !pasien.nik">NIK wajib diisi.</small>
      </div>

      <!-- Jenis Kelamin -->
      <div class="field">
        <label for="jenis_kelamin">Jenis Kelamin</label>
        <Dropdown id="jenis_kelamin" v-model="pasien.jenis_kelamin" :options="jenisKelaminOptions" 
                  optionLabel="label" optionValue="value" placeholder="Pilih Jenis Kelamin" />
      </div>

      <!-- Tempat Lahir -->
      <div class="field">
        <label for="tempat_lahir">Tempat Lahir</label>
        <InputText id="tempat_lahir" v-model.trim="pasien.tempat_lahir" />
      </div>

      <!-- Tanggal Lahir -->
      <div class="field">
        <label for="tanggal_lahir">Tanggal Lahir</label>
        <Calendar id="tanggal_lahir" v-model="pasien.tanggal_lahir" dateFormat="yy-mm-dd" />
      </div>

      <!-- Alamat -->
      <div class="field">
        <label for="alamat">Alamat</label>
        <Textarea id="alamat" v-model.trim="pasien.alamat" rows="4" />
      </div>

      <!-- No. Telepon -->
      <div class="field">
        <label for="no_telepon">No. Telepon</label>
        <InputText id="no_telepon" v-model.trim="pasien.no_telepon" />
      </div>

      <!-- Footer -->
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Update" icon="pi pi-check" text @click="update" />
      </template>
    </Dialog>

    <!-- Delete Dialog -->
    <Dialog v-model:visible="deleteDataDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="pasien">Apakah anda yakin akan menghapus data ini ?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDataDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedData" />
      </template>
    </Dialog>
  </div>
</template>

<style>
@import '../style.css';
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import apiClient from '../../services/apiService';
import { useRouter } from 'vue-router';

onMounted(() => {
  fetchData();
});

const data = ref([]);
const toast = useToast();
const dt = ref();
const createDialog = ref(false);
const editDialog = ref(false);
const deleteDataDialog = ref(false);
const pasien = ref({});
const selectedPasiens = ref();
const submitted = ref(false);
const router = useRouter();

const jenisKelaminOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' }
];

const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const openNew = () => {
  pasien.value = {
    nama: '',
    nik: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: null,
    alamat: '',
    no_telepon: ''
  };
  submitted.value = false;
  createDialog.value = true;
};

const openEdit = () => {
  if (selectedPasiens.value && selectedPasiens.value.length === 1) {
    pasien.value = { ...selectedPasiens.value[0] };
    submitted.value = false;
    editDialog.value = true;
  } else {
    toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Pilih satu data untuk diedit', life: 3000 });
  }
};

const hideDialog = () => {
  createDialog.value = false;
  editDialog.value = false;
  submitted.value = false;
};

const fetchData = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      store.commit("logout");
      console.error("AccessToken tidak tersedia");
      return;
    }

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    const response = await apiClient.get('/pasien');
    data.value = response.data.data;
  } catch (error) {
    console.log('Error Fetch Data', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data', life: 3000 });
  }
};

const create = async () => {
  submitted.value = true;

  if (!pasien.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Nama dan NIK wajib diisi', life: 3000 });
    return;
  }
    const payload = {
      nama: data.value.nama,
      nik: data.value.nik,
      jenis_kelamin: data.value.jenis_kelamin,
      tempat_lahir: data.value.tempat_lahir,
      tanggal_lahir: data.value.tanggal_lahir,
      alamat: data.value.alamat,
      no_telepon: data.value.no_telepon
    };

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'AccessToken tidak tersedia', life: 3000 });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    const response = await apiClient.post('/pasien', payload);

    if (response.status === 201) {
      createDialog.value = false;
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Berhasil Disimpan', life: 3000 });
      fetchData();
    }
  } catch (error) {
    console.error('Error creating data:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Gagal menyimpan data', 
      life: 3000 
    });
  }
};

const update = async () => {
  submitted.value = true;

  if (!pasien.value.nama || !pasien.value.nik) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Nama dan NIK wajib diisi', life: 3000 });
    return;
  }

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'AccessToken tidak tersedia', life: 3000 });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    const response = await apiClient.put(`/pasien/${pasien.value.id}`, pasien.value);

    if (response.status === 200) {
      editDialog.value = false;
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Berhasil Diperbarui', life: 3000 });
      fetchData();
    }
  } catch (error) {
    console.error('Error updating data:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Gagal memperbarui data', 
      life: 3000 
    });
  }
};

const deleteSelectedData = async () => {
  if (!selectedPasiens.value || !selectedPasiens.value.length) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'No items selected', life: 3000 });
    return;
  }

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'AccessToken tidak tersedia', life: 3000 });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    for (let data of selectedPasiens.value) {
    const response = await apiClient.delete(`/pasien/${data.id}`);
    toast.add({ 
        severity: 'success', 
        summary: 'Berhasil', 
        detail: response.data.pesan || 'Data berhasil dihapus', 
        life: 3000 
    });
    }
    data.value = data.value.filter(val => !selectedPasiens.value.includes(val));
    selectedPasiens.value = null;
    deleteDataDialog.value = false;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Dihapus', life: 3000 });

    fetchData();
  } catch (error) {
    console.error('Error deleting data:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
        detail: error.response?.data?.pesan || error.response?.data?.message || `Gagal hapus data ${data.id}`,
        life: 3000 
        
    });
  }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
  deleteDataDialog.value = true;
};

const viewDetails = (data) => {
  router.push(`/master/pasien/${data.id}`);
};
</script> 