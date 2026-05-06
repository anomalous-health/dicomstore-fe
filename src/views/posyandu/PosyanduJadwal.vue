<template>
  <div class="dicomstore-page">
    <Toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Jadwal Posyandu</h1>
        <p class="page-subtitle">Atur tanggal kegiatan dan jenis layanan di setiap posyandu.</p>
      </div>
      <Button icon="pi pi-plus" label="Tambah Jadwal" @click="openCreate" />
    </div>

    <div class="content-panel">
      <div class="table-toolbar">
        <Dropdown v-model="filterPosyanduId" :options="posyanduOptions" optionLabel="label" optionValue="value" showClear placeholder="Semua Posyandu" />
        <Button icon="pi pi-refresh" text rounded @click="loadData" :loading="loading" />
      </div>

      <DataTable :value="items" :loading="loading" :paginator="true" :rows="10" dataKey="id" responsiveLayout="scroll">
        <Column field="tanggal" header="Tanggal" sortable />
        <Column field="judul" header="Kegiatan" />
        <Column header="Posyandu">
          <template #body="{ data }">{{ data.posyandu?.nama || "-" }}</template>
        </Column>
        <Column header="Waktu">
          <template #body="{ data }">{{ data.jam_mulai || "-" }} - {{ data.jam_selesai || "-" }}</template>
        </Column>
        <Column header="Layanan">
          <template #body="{ data }">{{ labelFrom(layananOptions, data.jenis_kegiatan) }}</template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="statusSeverity(data.status)" :value="labelFrom(scheduleStatusOptions, data.status)" />
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

    <Dialog v-model:visible="dialogVisible" :header="form.id ? 'Edit Jadwal' : 'Tambah Jadwal'" modal :style="{ width: '48rem' }">
      <div class="form-grid">
        <div class="form-field full">
          <label>Posyandu</label>
          <Dropdown v-model="form.posyandu_id" :options="posyanduOptions" optionLabel="label" optionValue="value" placeholder="Pilih posyandu" />
        </div>
        <div class="form-field full">
          <label>Judul Kegiatan</label>
          <InputText v-model="form.judul" />
        </div>
        <div class="form-field">
          <label>Tanggal</label>
          <Calendar v-model="form.tanggal" dateFormat="yy-mm-dd" showIcon />
        </div>
        <div class="form-field">
          <label>Jenis Kegiatan</label>
          <Dropdown v-model="form.jenis_kegiatan" :options="layananOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="form-field">
          <label>Jam Mulai</label>
          <Calendar v-model="form.jam_mulai" timeOnly hourFormat="24" />
        </div>
        <div class="form-field">
          <label>Jam Selesai</label>
          <Calendar v-model="form.jam_selesai" timeOnly hourFormat="24" />
        </div>
        <div class="form-field">
          <label>Status</label>
          <Dropdown v-model="form.status" :options="scheduleStatusOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="form-field full">
          <label>Catatan</label>
          <Textarea v-model="form.catatan" rows="3" />
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
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import apiClient from "../../services/apiService";
import { fetchPosyandu, fetchSchedules, labelFrom, layananOptions, scheduleStatusOptions, toApiDate, toApiTime } from "./posyanduService";
import "./posyandu.css";

const toast = useToast();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const items = ref([]);
const posyandus = ref([]);
const filterPosyanduId = ref(null);
const form = reactive({
  id: null,
  posyandu_id: null,
  judul: "",
  tanggal: null,
  jam_mulai: null,
  jam_selesai: null,
  jenis_kegiatan: "umum",
  status: "terjadwal",
  catatan: "",
});

const posyanduOptions = computed(() => posyandus.value.map((item) => ({ label: `${item.kode} - ${item.nama}`, value: item.id })));

function statusSeverity(status) {
  return { selesai: "success", berjalan: "info", batal: "danger" }[status] || "warning";
}

function resetForm() {
  Object.assign(form, {
    id: null,
    posyandu_id: null,
    judul: "",
    tanggal: new Date(),
    jam_mulai: null,
    jam_selesai: null,
    jenis_kegiatan: "umum",
    status: "terjadwal",
    catatan: "",
  });
}

async function loadData() {
  try {
    loading.value = true;
    items.value = await fetchSchedules({ posyandu_id: filterPosyanduId.value || undefined });
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Jadwal tidak dapat dimuat", life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  posyandus.value = await fetchPosyandu();
}

function openCreate() {
  resetForm();
  dialogVisible.value = true;
}

function parseTime(time) {
  if (!time) return null;
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date;
}

function openEdit(item) {
  Object.assign(form, {
    ...item,
    tanggal: item.tanggal ? new Date(item.tanggal) : null,
    jam_mulai: parseTime(item.jam_mulai),
    jam_selesai: parseTime(item.jam_selesai),
  });
  dialogVisible.value = true;
}

async function save() {
  try {
    saving.value = true;
    const payload = {
      posyandu_id: form.posyandu_id,
      judul: form.judul,
      tanggal: toApiDate(form.tanggal),
      jam_mulai: toApiTime(form.jam_mulai),
      jam_selesai: toApiTime(form.jam_selesai),
      jenis_kegiatan: form.jenis_kegiatan,
      status: form.status,
      catatan: form.catatan,
    };
    if (form.id) await apiClient.put(`/jadwal-posyandu/${form.id}`, payload);
    else await apiClient.post("/jadwal-posyandu", payload);
    toast.add({ severity: "success", summary: "Berhasil", detail: "Jadwal disimpan", life: 2500 });
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Jadwal belum tersimpan", life: 3000 });
  } finally {
    saving.value = false;
  }
}

async function remove(item) {
  if (!confirm(`Hapus jadwal ${item.judul}?`)) return;
  try {
    await apiClient.delete(`/jadwal-posyandu/${item.id}`);
    toast.add({ severity: "success", summary: "Berhasil", detail: "Jadwal dihapus", life: 2500 });
    loadData();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Jadwal tidak dapat dihapus", life: 3000 });
  }
}

watch(filterPosyanduId, loadData);

onMounted(async () => {
  await loadOptions();
  await loadData();
});
</script>
