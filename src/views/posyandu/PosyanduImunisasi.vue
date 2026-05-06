<template>
  <div class="dicomstore-page">
    <Toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Imunisasi & Vitamin</h1>
        <p class="page-subtitle">Catat pemberian imunisasi atau vitamin tanpa harus membuka detail kunjungan.</p>
      </div>
      <Button icon="pi pi-plus" label="Tambah Catatan" @click="openCreate" />
    </div>

    <div class="content-panel">
      <div class="table-toolbar">
        <Dropdown v-model="filters.patient_id" :options="patientOptions" optionLabel="label" optionValue="value" filter showClear placeholder="Semua pasien" />
        <Button icon="pi pi-refresh" text rounded @click="loadData" :loading="loading" />
      </div>

      <DataTable :value="records" :loading="loading" :paginator="true" :rows="10" dataKey="id" responsiveLayout="scroll">
        <Column field="tanggal_pemberian" header="Tanggal" sortable />
        <Column header="Pasien">
          <template #body="{ data }">
            <div class="font-medium">{{ data.patient_name }}</div>
            <small class="text-color-secondary">{{ data.patient_nik }}</small>
          </template>
        </Column>
        <Column field="nama_imunisasi" header="Imunisasi/Vitamin" />
        <Column field="dosis" header="Dosis" />
        <Column field="tanggal_berikutnya" header="Berikutnya" />
        <Column field="catatan" header="Catatan" />
      </DataTable>
    </div>

    <Dialog v-model:visible="dialogVisible" header="Tambah Imunisasi / Vitamin" modal :style="{ width: '42rem' }">
      <div class="form-grid">
        <div class="form-field full">
          <label>Pasien</label>
          <Dropdown v-model="form.patient_id" :options="patientOptions" optionLabel="label" optionValue="value" filter placeholder="Pilih pasien" />
        </div>
        <div class="form-field">
          <label>Nama Imunisasi/Vitamin</label>
          <InputText v-model="form.nama_imunisasi" />
        </div>
        <div class="form-field">
          <label>Dosis</label>
          <InputText v-model="form.dosis" />
        </div>
        <div class="form-field">
          <label>Tanggal Pemberian</label>
          <Calendar v-model="form.tanggal_pemberian" dateFormat="yy-mm-dd" showIcon />
        </div>
        <div class="form-field">
          <label>Tanggal Berikutnya</label>
          <Calendar v-model="form.tanggal_berikutnya" dateFormat="yy-mm-dd" showIcon />
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
import { fetchPatients, toApiDate } from "./posyanduService";
import "./posyandu.css";

const toast = useToast();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const patients = ref([]);
const records = ref([]);
const filters = reactive({ patient_id: null });
const form = reactive({ patient_id: null, nama_imunisasi: "", dosis: "", tanggal_pemberian: new Date(), tanggal_berikutnya: null, catatan: "" });

const patientOptions = computed(() => patients.value.map((item) => ({ label: `${item.nama} - ${item.nik}`, value: item.id })));

async function loadOptions() {
  patients.value = await fetchPatients();
}

async function loadData() {
  try {
    loading.value = true;
    const response = await apiClient.get("/imunisasi", { params: { patient_id: filters.patient_id || undefined } });
    records.value = (response.data.data || []).map((record) => ({
      ...record,
      patient_name: record.patient?.nama || "-",
      patient_nik: record.patient?.nik || "-",
    }));
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Data imunisasi tidak dapat dimuat", life: 3000 });
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  Object.assign(form, { patient_id: filters.patient_id || null, nama_imunisasi: "", dosis: "", tanggal_pemberian: new Date(), tanggal_berikutnya: null, catatan: "" });
  dialogVisible.value = true;
}

async function save() {
  try {
    saving.value = true;
    await apiClient.post("/imunisasi", {
      ...form,
      tanggal_pemberian: toApiDate(form.tanggal_pemberian),
      tanggal_berikutnya: toApiDate(form.tanggal_berikutnya),
    });
    toast.add({ severity: "success", summary: "Berhasil", detail: "Catatan imunisasi disimpan", life: 2500 });
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Catatan belum tersimpan", life: 3000 });
  } finally {
    saving.value = false;
  }
}

watch(filters, loadData);

onMounted(async () => {
  await loadOptions();
  await loadData();
});
</script>
