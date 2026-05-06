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
                  :disabled="!selectedobats || !selectedobats.length" />
          <Button label="Update" icon="pi pi-pencil" severity="info" @click="openEdit"
                  :disabled="!selectedobats || !selectedobats.length" />
        </template>

        <!-- Export -->
        <template #end>
          <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import"
                      class="mr-2 inline-block" />
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataTable ref="dt" :value="data" v-model:selection="selectedobats" dataKey="id" :paginator="true"
                 :rows="10" :filters="filters"
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 :rowsPerPageOptions="[5, 10, 25]"
                 currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} Data">
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h3 class="m-0" style="padding-right: 550px;">Data Master Obat</h3>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>

        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="kode" header="Kode" sortable style="min-width:12rem"></Column>
        <Column field="nama" header="Nama" sortable style="min-width:16rem"></Column>
        <Column field="deskripsi" header="Deskripsi" sortable style=""></Column>
        <Column field="kategori" header="Kategori" sortable style=""></Column>
        <Column field="satuan" header="Satuan" sortable style=""></Column>
        <Column field="harga" header="Harga" sortable style=""></Column>
        <Column field="stok" header="Stok" sortable style=""></Column>
<!--        <Column header="Status Aktif" sortable style="min-width:12rem"-->
<!--        >-->
<!--          <template #body="{ data }">-->
<!--                        <span :class="data.is_active ? 'text-green-500' : 'text-red-500'">-->
<!--                            {{ data.is_active ? 'Aktif' : 'Tidak Aktif' }}-->
<!--                        </span>-->
<!--          </template>-->
<!--        </Column>-->

      </DataTable>
    </div>


    <!-- create data -->
    <Dialog v-model:visible="createDialog" :style="{ width: '450px' }" header="Tambah Obat" :modal="true" class="p-fluid">
      <!-- Gambar (opsional) -->
      <img v-if="data.image"
           :src="`https://primefaces.org/cdn/primevue/images/obat/${data.image}`"
           :alt="data.image" class="block m-auto pb-3" />

      <!-- Kode -->
      <div class="field">
        <label for="kode">Kode</label>
        <InputText id="kode" v-model.trim="data.kode" required :invalid="submitted && !data.kode" />
        <small class="p-error" v-if="submitted && !data.kode">Kode obat wajib diisi.</small>
      </div>

      <!-- Nama -->
      <div class="field">
        <label for="nama">Nama</label>
        <InputText id="nama" v-model.trim="data.nama" required :invalid="submitted && !data.nama" />
        <small class="p-error" v-if="submitted && !data.nama">Nama obat wajib diisi.</small>
      </div>

      <!-- Deskripsi -->
      <div class="field">
        <label for="deskripsi">Deskripsi</label>
        <InputText id="deskripsi" v-model.trim="data.deskripsi" />
      </div>

      <!-- Kategori -->
      <div class="field">
        <label for="kategori">Kategori</label>
        <InputText id="kategori" v-model.trim="data.kategori" />
      </div>

      <!-- Satuan -->
      <div class="field">
        <label for="satuan">Satuan</label>
        <InputText id="satuan" v-model.trim="data.satuan" />
      </div>

      <!-- Harga -->
      <div class="field">
        <label for="harga">Harga</label>
        <InputNumber v-model="data.harga" inputId="harga" mode="currency" currency="IDR" locale="id-ID" />
      </div>

      <!-- Stok -->
      <div class="field">
        <label for="stok">Stok</label>
        <InputNumber v-model="data.stok" inputId="stok" />
      </div>

      <!-- Footer -->
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" text @click="create" />
      </template>
    </Dialog>



    <Dialog v-model:visible="editDialog" :style="{ width: '450px' }" header="Edit Data Obat" :modal="true" class="p-fluid">
      <!-- Gambar -->
      <img v-if="obat.image"
           :src="`https://primefaces.org/cdn/primevue/images/obat/${obat.image}`"
           :alt="obat.image" class="block m-auto pb-3" />

      <!-- Kode Obat -->
      <div class="field">
        <label for="kode">Kode</label>
        <InputText id="kode" v-model.trim="obat.kode" required />
      </div>

      <!-- Nama -->
      <div class="field">
        <label for="nama">Nama</label>
        <InputText id="nama" v-model.trim="obat.nama" required :invalid="submitted && !obat.nama" />
        <small class="p-error" v-if="submitted && !obat.nama">Nama obat wajib diisi.</small>
      </div>

      <!-- Deskripsi -->
      <div class="field">
        <label for="deskripsi">Deskripsi</label>
        <InputText id="deskripsi" v-model.trim="obat.deskripsi" />
      </div>

      <!-- Kategori -->
      <div class="field">
        <label for="kategori">Kategori</label>
        <InputText id="kategori" v-model.trim="obat.kategori" />
      </div>

      <!-- Satuan -->
      <div class="field">
        <label for="satuan">Satuan</label>
        <InputText id="satuan" v-model.trim="obat.satuan" />
      </div>

      <!-- Harga -->
      <div class="field">
        <label for="harga">Harga</label>
        <InputNumber v-model="obat.harga" inputId="harga" mode="currency" currency="IDR" locale="id-ID" />
      </div>

      <!-- Stok -->
      <div class="field">
        <label for="stok">Stok</label>
        <InputNumber v-model="obat.stok" inputId="stok" />
      </div>

      <!-- Footer -->
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Update" icon="pi pi-check" text @click="update" />
      </template>
    </Dialog>



    <Dialog v-model:visible="deleteDataDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="obat">Apakah anda yakin akan menghapus data ini ?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDataDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedData" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import apiClient from '../../services/apiService';
import "../style.css"

onMounted(() => {
  fetchData();
  // fetchobat();
});

const data = ref([]);
const obatOptions = ref([]);

const toast = useToast();
const dt = ref();
const obats = ref();
const createDialog = ref(false);
const editDialog = ref(false);
const deleteData = ref(false);
const deleteDataDialog = ref(false);
const obat = ref({});



const selectedobats = ref();
const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

const openNew = () => {
  obat.value = {
    nama: '',
    is_active: true
  };
  submitted.value = false;
  createDialog.value = true;
};

const openEdit = () => {
  if (selectedobats.value && selectedobats.value.length === 1) {
    obat.value = { ...selectedobats.value[0] };
    obat.value.is_active = obat.value.is_active ?? true; // Set default jika undefined
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


const deleteobat = () => {
  obats.value = obats.value.filter(val => val.id !== obat.value.id);
  deleteData.value = false;
  obat.value = {};
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
};
const findIndexById = (id) => {
  let index = -1;
  for (let i = 0; i < obats.value.length; i++) {
    if (obats.value[i].id === id) {
      index = i;
      break;
    }
  }

  return index;
};

const createId = () => {
  let id = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
const exportCSV = () => {
  dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
  deleteDataDialog.value = true;
};

const fetchData = async () => {
  try {
    // Ambil accessToken dari local storage atau state aplikasi
    const accessToken = localStorage.getItem("accessToken");
    // Sesuaikan dengan cara Anda menyimpan token

    // Pastikan accessToken telah disetel sebelum melakukan permintaan
    if (!accessToken) {
      store.commit("logout");
      console.error("AccessToken tidak tersedia");
      return;
    }

    // Set header Authorization dengan accessToken
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    const response = await apiClient.get('/obat');
    data.value = response.data.data;
    console.log(data.value);
  } catch (error) {
    console.log('Error Fetch Data', error);
  }
};

const create = async () => {
  createDialog.value = false;  // Menutup dialog setelah pengiriman data
  try {
    const payload = {
      "kode": data.value.kode,
      "nama": data.value.nama,
      "deskripsi": data.value.deskripsi,
      "kategori": data.value.kategori,
      "satuan": data.value.satuan,
      "harga": data.value.harga,
      "stok": data.value.stok

    };

    if (!data.value.nama) {
      alert('Nama obat tidak boleh kosong!');
      return;
    }

    // Tambahkan Bearer token
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert('AccessToken tidak tersedia. Silakan login ulang.');
      return;
    }
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    // console.log('Payload yang akan dikirim:', payload);

    // Kirim POST request
    const response = await apiClient.post('/obat', payload);

    if (response.status === 201) {
      data.value.push(response.data);
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Berhasil Disimpan', life: 3000 });

      fetchData();  // Refresh data
      console.log('obat berhasil disimpan:', response.data);
    } else {
      console.log('Gagal menyimpan obat:', response.data);
      alert('Gagal menyimpan obat.');
    }
  } catch (error) {
    if (error.response) {
      console.error('Response error:', error.response.data);
      alert(`Terjadi kesalahan: ${error.response.data.message || 'Periksa data yang dikirim.'}`);
    } else {
      console.error('Terjadi kesalahan:', error.message);
      toast.add({ severity: 'warn', summary: 'Error', detail: 'Gagal menyimpan data', life: 3000 });

    }
  }
};

const update = async () => {
  submitted.value = true;

  if (!obat.value.nama) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Nama obat wajib diisi.', life: 3000 });
    return;
  }

  try {
    const payload = {
      "kode": obat.value.kode,
      "nama": obat.value.nama,
      "deskripsi": obat.value.deskripsi,
      "kategori": obat.value.kategori,
      "satuan": obat.value.satuan,
      "harga": obat.value.harga,
      "stok": obat.value.stok
    };

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert('AccessToken tidak tersedia. Silakan login ulang.');
      return;
    }
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    const response = await apiClient.put(`/obat/${obat.value.id}`, payload);

    if (response.status === 200) {
      const index = data.value.findIndex(item => item.id === obat.value.id);
      if (index !== -1) {
        data.value[index] = response.data;
      }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Berhasil Diperbarui', life: 3000 });
      editDialog.value = false;
      fetchData(); // Refresh data untuk memastikan sinkronisasi
    } else {
      toast.add({ severity: 'warn', summary: 'Warning', detail: 'Gagal memperbarui data', life: 3000 });
    }
  } catch (error) {
    if (error.response) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message || 'Kesalahan saat memperbarui data.', life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi kesalahan saat memperbarui data.', life: 3000 });
    }
    console.error('Error updating data:', error);
  }
};


const deleteSelectedData = async () => {
  if (!selectedobats.value || !selectedobats.value.length) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'No items selected', life: 3000 });
    return;
  }

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert('AccessToken tidak tersedia. Silakan login ulang.');
      return;
    }
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    // Loop atau batch delete request untuk setiap item terpilih
    for (let data of selectedobats.value) {
      await apiClient.delete(`/obat/${data.id}`);
    }

    // Perbarui daftar produk setelah berhasil menghapus
    data.value = data.value.filter(val => !selectedobats.value.includes(val));
    selectedobats.value = null;
    deleteDataDialog.value = false;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Dihapus', life: 3000 });

    fetchData(); // Refresh data dari server untuk memastikan sinkronisasi
  } catch (error) {
    console.error('Error deleting selected products:', error);
    alert('Gagal menghapus produk. Silakan coba lagi.');
  }
};



</script>