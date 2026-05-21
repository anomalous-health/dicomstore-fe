<template>
  <div class="dicomstore-page">
    <Toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Data</h1>
        <p class="page-subtitle">Kelola lokasi, kader penanggung jawab, dan status dicom.</p>
      </div>
      <Button icon="pi pi-plus" label="Tambah Dicom" @click="openCreate" />
    </div>

    <div class="content-panel">
      <div class="table-toolbar">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="search" placeholder="Cari nama, kode, kelurahan" @keyup.enter="loadData" />
        </span>
        <Button icon="pi pi-refresh" text rounded @click="loadData" :loading="loading" />
      </div>

      <DataTable :value="items" :loading="loading" :paginator="true" :rows="10" dataKey="id" responsiveLayout="scroll">
        <Column field="kode" header="Kode" sortable />
        <Column field="nama" header="Nama" sortable />
        <Column field="desa_kelurahan" header="Desa/Kelurahan" />
        <Column field="kecamatan" header="Kecamatan" />
        <Column field="penanggung_jawab" header="Penanggung Jawab" />
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="data.is_active ? 'success' : 'danger'" :value="data.is_active ? 'Aktif' : 'Nonaktif'" />
          </template>
        </Column>
        <Column header="Aksi" style="width: 9rem">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" rounded text @click="openEdit(data)" />
            <Button icon="pi pi-trash" rounded text severity="danger" @click="remove(data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="dialogVisible" :header="form.id ? 'Edit Dicom' : 'Tambah Dicom'" modal :style="{ width: '46rem' }">
      <div class="form-grid">
        <div class="form-field">
          <label>Nama</label>
          <InputText v-model="form.nama" />
        </div>
        <div class="form-field">
          <label>Kode</label>
          <InputText v-model="form.kode" />
        </div>
        <div class="form-field full">
          <label>Alamat</label>
          <Textarea v-model="form.alamat" rows="3" />
        </div>
        <div class="form-field">
          <label>Desa/Kelurahan</label>
          <InputText v-model="form.desa_kelurahan" />
        </div>
        <div class="form-field">
          <label>Kecamatan</label>
          <InputText v-model="form.kecamatan" />
        </div>
        <div class="form-field">
          <label>Penanggung Jawab</label>
          <InputText v-model="form.penanggung_jawab" />
        </div>
        <div class="form-field">
          <label>No. Telepon</label>
          <InputText v-model="form.no_telepon" />
        </div>
        <div class="form-field">
          <label>Status</label>
          <InputSwitch v-model="form.is_active" />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text @click="dialogVisible = false" />
        <Button label="Simpan" icon="pi pi-save" @click="save" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import apiClient from "../../services/apiService";
import "./posyandu.css";

const toast = useToast();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const items = ref([]);
const search = ref("");
const form = reactive({
  id: null,
  nama: "",
  kode: "",
  alamat: "",
  desa_kelurahan: "",
  kecamatan: "",
  penanggung_jawab: "",
  no_telepon: "",
  is_active: true,
});

function resetForm() {
  Object.assign(form, {
    id: null,
    nama: "",
    kode: "",
    alamat: "",
    desa_kelurahan: "",
    kecamatan: "",
    penanggung_jawab: "",
    no_telepon: "",
    is_active: true,
  });
}

async function loadData() {
  try {
    loading.value = true;
    const response = await apiClient.get("/dicom", { params: { search: search.value || undefined } });
    items.value = response.data.data || [];
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Data dicom tidak dapat dimuat", life: 3000 });
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  dialogVisible.value = true;
}

function openEdit(item) {
  Object.assign(form, { ...item, is_active: Boolean(item.is_active) });
  dialogVisible.value = true;
}

async function save() {
  try {
    saving.value = true;
    const payload = { ...form };
    if (form.id) {
      await apiClient.put(`/dicom/${form.id}`, payload);
    } else {
      await apiClient.post("/dicom", payload);
    }
    toast.add({ severity: "success", summary: "Berhasil", detail: "Data dicom disimpan", life: 2500 });
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Data belum tersimpan", life: 3000 });
  } finally {
    saving.value = false;
  }
}

async function remove(item) {
  if (!confirm(`Hapus ${item.nama}?`)) return;
  try {
    await apiClient.delete(`/dicom/${item.id}`);
    toast.add({ severity: "success", summary: "Berhasil", detail: "Data dicom dihapus", life: 2500 });
    loadData();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Data tidak dapat dihapus", life: 3000 });
  }
}

onMounted(loadData);
</script>
