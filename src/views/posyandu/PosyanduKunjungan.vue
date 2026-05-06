<template>
  <div class="dicomstore-page">
    <Toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Kunjungan Posyandu</h1>
        <p class="page-subtitle">Registrasi layanan harian dan pencatatan hasil pemeriksaan.</p>
      </div>
      <Button icon="pi pi-plus" label="Tambah Kunjungan" @click="openVisitCreate" />
    </div>

    <div class="content-panel">
      <div class="table-toolbar">
        <div class="status-row">
          <Dropdown v-model="filters.posyandu_id" :options="posyanduOptions" optionLabel="label" optionValue="value" showClear placeholder="Semua Posyandu" />
          <Dropdown v-model="filters.jenis_layanan" :options="layananOptions" optionLabel="label" optionValue="value" showClear placeholder="Semua Layanan" />
          <Dropdown v-model="filters.status" :options="visitStatusOptions" optionLabel="label" optionValue="value" showClear placeholder="Semua Status" />
        </div>
        <Button icon="pi pi-refresh" text rounded @click="loadVisits" :loading="loading" />
      </div>

      <DataTable :value="visits" :loading="loading" :paginator="true" :rows="10" dataKey="id" responsiveLayout="scroll">
        <Column field="tanggal_kunjungan" header="Tanggal" sortable />
        <Column header="Pasien">
          <template #body="{ data }">
            <div class="font-medium">{{ data.patient?.nama || "-" }}</div>
            <small class="text-color-secondary">{{ data.patient?.nik || "-" }}</small>
          </template>
        </Column>
        <Column header="Posyandu">
          <template #body="{ data }">{{ data.posyandu?.nama || "-" }}</template>
        </Column>
        <Column header="Layanan">
          <template #body="{ data }">{{ labelFrom(layananOptions, data.jenis_layanan) }}</template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="visitSeverity(data.status)" :value="labelFrom(visitStatusOptions, data.status)" />
          </template>
        </Column>
        <Column header="Hasil">
          <template #body="{ data }">
            <div class="status-row">
              <Tag v-if="data.growth_measurement" severity="success" value="Pengukuran" />
              <Tag v-if="data.pregnancy_checkup" severity="info" value="Ibu Hamil" />
              <Tag v-if="data.immunization_records?.length" severity="warning" value="Imunisasi" />
              <span v-if="!data.growth_measurement && !data.pregnancy_checkup && !data.immunization_records?.length">-</span>
            </div>
          </template>
        </Column>
        <Column header="Aksi" style="min-width: 17rem">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" rounded text @click="openVisitEdit(data)" />
            <Button v-if="data.jenis_layanan === 'balita'" icon="pi pi-chart-line" rounded text severity="success" v-tooltip.top="'Pengukuran balita'" @click="openGrowth(data)" />
            <Button v-if="['balita', 'imunisasi'].includes(data.jenis_layanan)" icon="pi pi-shield" rounded text severity="warning" v-tooltip.top="'Imunisasi/Vitamin'" @click="openImmunization(data)" />
            <Button v-if="data.jenis_layanan === 'ibu_hamil'" icon="pi pi-heart" rounded text severity="info" v-tooltip.top="'Pemeriksaan ibu hamil'" @click="openPregnancy(data)" />
            <Button icon="pi pi-trash" rounded text severity="danger" @click="removeVisit(data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="visitDialog" :header="visitForm.id ? 'Edit Kunjungan' : 'Tambah Kunjungan'" modal :style="{ width: '48rem' }">
      <div class="form-grid">
        <div class="form-field full">
          <label>Pasien</label>
          <Dropdown v-model="visitForm.patient_id" :options="patientOptions" optionLabel="label" optionValue="value" filter placeholder="Pilih pasien" />
        </div>
        <div class="form-field">
          <label>Posyandu</label>
          <Dropdown v-model="visitForm.posyandu_id" :options="posyanduOptions" optionLabel="label" optionValue="value" placeholder="Pilih posyandu" />
        </div>
        <div class="form-field">
          <label>Jadwal</label>
          <Dropdown v-model="visitForm.schedule_id" :options="scheduleOptions" optionLabel="label" optionValue="value" showClear placeholder="Opsional" />
        </div>
        <div class="form-field">
          <label>Tanggal Kunjungan</label>
          <Calendar v-model="visitForm.tanggal_kunjungan" dateFormat="yy-mm-dd" showIcon />
        </div>
        <div class="form-field">
          <label>Jenis Layanan</label>
          <Dropdown v-model="visitForm.jenis_layanan" :options="layananOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="form-field">
          <label>Status</label>
          <Dropdown v-model="visitForm.status" :options="visitStatusOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="form-field full">
          <label>Keluhan</label>
          <Textarea v-model="visitForm.keluhan" rows="2" />
        </div>
        <div class="form-field full">
          <label>Catatan</label>
          <Textarea v-model="visitForm.catatan" rows="2" />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text @click="visitDialog = false" />
        <Button label="Simpan" icon="pi pi-save" @click="saveVisit" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="growthDialog" header="Pengukuran Balita" modal :style="{ width: '42rem' }">
      <div class="form-grid">
        <div class="form-field">
          <label>Berat Badan (kg)</label>
          <InputNumber v-model="growthForm.berat_badan" :minFractionDigits="1" :maxFractionDigits="2" />
        </div>
        <div class="form-field">
          <label>Tinggi Badan (cm)</label>
          <InputNumber v-model="growthForm.tinggi_badan" :minFractionDigits="1" :maxFractionDigits="2" />
        </div>
        <div class="form-field">
          <label>Lingkar Kepala (cm)</label>
          <InputNumber v-model="growthForm.lingkar_kepala" :minFractionDigits="1" :maxFractionDigits="2" />
        </div>
        <div class="form-field">
          <label>Lingkar Lengan (cm)</label>
          <InputNumber v-model="growthForm.lingkar_lengan" :minFractionDigits="1" :maxFractionDigits="2" />
        </div>
        <div class="form-field full">
          <label>Status Gizi</label>
          <Dropdown v-model="growthForm.status_gizi" :options="giziOptions" optionLabel="label" optionValue="value" showClear />
        </div>
        <div class="form-field full">
          <label>Catatan</label>
          <Textarea v-model="growthForm.catatan" rows="3" />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text @click="growthDialog = false" />
        <Button label="Simpan" icon="pi pi-save" @click="saveGrowth" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="immunizationDialog" header="Imunisasi / Vitamin" modal :style="{ width: '42rem' }">
      <div class="form-grid">
        <div class="form-field">
          <label>Nama Imunisasi/Vitamin</label>
          <InputText v-model="immunizationForm.nama_imunisasi" />
        </div>
        <div class="form-field">
          <label>Dosis</label>
          <InputText v-model="immunizationForm.dosis" />
        </div>
        <div class="form-field">
          <label>Tanggal Pemberian</label>
          <Calendar v-model="immunizationForm.tanggal_pemberian" dateFormat="yy-mm-dd" showIcon />
        </div>
        <div class="form-field">
          <label>Tanggal Berikutnya</label>
          <Calendar v-model="immunizationForm.tanggal_berikutnya" dateFormat="yy-mm-dd" showIcon />
        </div>
        <div class="form-field full">
          <label>Catatan</label>
          <Textarea v-model="immunizationForm.catatan" rows="3" />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text @click="immunizationDialog = false" />
        <Button label="Simpan" icon="pi pi-save" @click="saveImmunization" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="pregnancyDialog" header="Pemeriksaan Ibu Hamil" modal :style="{ width: '50rem' }">
      <div class="form-grid">
        <div class="form-field">
          <label>Usia Kehamilan (minggu)</label>
          <InputNumber v-model="pregnancyForm.usia_kehamilan_minggu" :min="1" :max="45" />
        </div>
        <div class="form-field">
          <label>Berat Badan (kg)</label>
          <InputNumber v-model="pregnancyForm.berat_badan" :minFractionDigits="1" :maxFractionDigits="2" />
        </div>
        <div class="form-field">
          <label>Sistole</label>
          <InputNumber v-model="pregnancyForm.tekanan_darah_sistole" />
        </div>
        <div class="form-field">
          <label>Diastole</label>
          <InputNumber v-model="pregnancyForm.tekanan_darah_diastole" />
        </div>
        <div class="form-field">
          <label>Tinggi Fundus</label>
          <InputNumber v-model="pregnancyForm.tinggi_fundus" />
        </div>
        <div class="form-field">
          <label>DJJ</label>
          <InputNumber v-model="pregnancyForm.denyut_jantung_janin" />
        </div>
        <div class="form-field">
          <label>Status Risiko</label>
          <Dropdown v-model="pregnancyForm.status_risiko" :options="risikoOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="form-field">
          <label>Kontrol Berikutnya</label>
          <Calendar v-model="pregnancyForm.tanggal_kontrol_berikutnya" dateFormat="yy-mm-dd" showIcon />
        </div>
        <div class="form-field full">
          <label>Keluhan</label>
          <Textarea v-model="pregnancyForm.keluhan" rows="2" />
        </div>
        <div class="form-field full">
          <label>Tindakan</label>
          <Textarea v-model="pregnancyForm.tindakan" rows="2" />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text @click="pregnancyDialog = false" />
        <Button label="Simpan" icon="pi pi-save" @click="savePregnancy" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import apiClient from "../../services/apiService";
import {
  fetchPatients,
  fetchPosyandu,
  fetchSchedules,
  fetchVisits,
  giziOptions,
  labelFrom,
  layananOptions,
  risikoOptions,
  toApiDate,
  visitStatusOptions,
} from "./posyanduService";
import "./posyandu.css";

const toast = useToast();
const loading = ref(false);
const saving = ref(false);
const visits = ref([]);
const patients = ref([]);
const posyandus = ref([]);
const schedules = ref([]);
const selectedVisit = ref(null);
const visitDialog = ref(false);
const growthDialog = ref(false);
const immunizationDialog = ref(false);
const pregnancyDialog = ref(false);
const filters = reactive({ posyandu_id: null, jenis_layanan: null, status: null });

const visitForm = reactive({ id: null, patient_id: null, posyandu_id: null, schedule_id: null, tanggal_kunjungan: new Date(), jenis_layanan: "balita", status: "terdaftar", keluhan: "", catatan: "" });
const growthForm = reactive({ berat_badan: null, tinggi_badan: null, lingkar_kepala: null, lingkar_lengan: null, status_gizi: null, catatan: "" });
const immunizationForm = reactive({ nama_imunisasi: "", dosis: "", tanggal_pemberian: new Date(), tanggal_berikutnya: null, catatan: "" });
const pregnancyForm = reactive({ usia_kehamilan_minggu: null, berat_badan: null, tekanan_darah_sistole: null, tekanan_darah_diastole: null, tinggi_fundus: null, denyut_jantung_janin: null, status_risiko: "rendah", keluhan: "", tindakan: "", tanggal_kontrol_berikutnya: null });

const patientOptions = computed(() => patients.value.map((item) => ({ label: `${item.nama} - ${item.nik}`, value: item.id })));
const posyanduOptions = computed(() => posyandus.value.map((item) => ({ label: `${item.kode} - ${item.nama}`, value: item.id })));
const scheduleOptions = computed(() => schedules.value.map((item) => ({ label: `${item.tanggal} - ${item.judul}`, value: item.id })));

function visitSeverity(status) {
  return { selesai: "success", diperiksa: "info", batal: "danger" }[status] || "warning";
}

async function loadOptions() {
  const [patientData, posyanduData, scheduleData] = await Promise.all([fetchPatients(), fetchPosyandu(), fetchSchedules()]);
  patients.value = patientData;
  posyandus.value = posyanduData;
  schedules.value = scheduleData;
}

async function loadVisits() {
  try {
    loading.value = true;
    visits.value = await fetchVisits({
      posyandu_id: filters.posyandu_id || undefined,
      jenis_layanan: filters.jenis_layanan || undefined,
      status: filters.status || undefined,
    });
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Kunjungan tidak dapat dimuat", life: 3000 });
  } finally {
    loading.value = false;
  }
}

function openVisitCreate() {
  Object.assign(visitForm, { id: null, patient_id: null, posyandu_id: null, schedule_id: null, tanggal_kunjungan: new Date(), jenis_layanan: "balita", status: "terdaftar", keluhan: "", catatan: "" });
  visitDialog.value = true;
}

function openVisitEdit(item) {
  Object.assign(visitForm, { ...item, tanggal_kunjungan: item.tanggal_kunjungan ? new Date(item.tanggal_kunjungan) : null });
  visitDialog.value = true;
}

async function saveVisit() {
  try {
    saving.value = true;
    const payload = { ...visitForm, tanggal_kunjungan: toApiDate(visitForm.tanggal_kunjungan) };
    if (visitForm.id) await apiClient.put(`/kunjungan-posyandu/${visitForm.id}`, payload);
    else await apiClient.post("/kunjungan-posyandu", payload);
    toast.add({ severity: "success", summary: "Berhasil", detail: "Kunjungan disimpan", life: 2500 });
    visitDialog.value = false;
    loadVisits();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Kunjungan belum tersimpan", life: 3000 });
  } finally {
    saving.value = false;
  }
}

async function removeVisit(item) {
  if (!confirm(`Hapus kunjungan ${item.patient?.nama || ""}?`)) return;
  await apiClient.delete(`/kunjungan-posyandu/${item.id}`);
  toast.add({ severity: "success", summary: "Berhasil", detail: "Kunjungan dihapus", life: 2500 });
  loadVisits();
}

function openGrowth(item) {
  selectedVisit.value = item;
  Object.assign(growthForm, item.growth_measurement || { berat_badan: null, tinggi_badan: null, lingkar_kepala: null, lingkar_lengan: null, status_gizi: null, catatan: "" });
  growthDialog.value = true;
}

async function saveGrowth() {
  await saveVisitDetail(`/kunjungan-posyandu/${selectedVisit.value.id}/pengukuran-balita`, growthForm, () => (growthDialog.value = false));
}

function openImmunization(item) {
  selectedVisit.value = item;
  Object.assign(immunizationForm, { nama_imunisasi: "", dosis: "", tanggal_pemberian: new Date(), tanggal_berikutnya: null, catatan: "" });
  immunizationDialog.value = true;
}

async function saveImmunization() {
  const payload = { ...immunizationForm, tanggal_pemberian: toApiDate(immunizationForm.tanggal_pemberian), tanggal_berikutnya: toApiDate(immunizationForm.tanggal_berikutnya) };
  await saveVisitDetail(`/kunjungan-posyandu/${selectedVisit.value.id}/imunisasi`, payload, () => (immunizationDialog.value = false));
}

function openPregnancy(item) {
  selectedVisit.value = item;
  Object.assign(pregnancyForm, item.pregnancy_checkup || { usia_kehamilan_minggu: null, berat_badan: null, tekanan_darah_sistole: null, tekanan_darah_diastole: null, tinggi_fundus: null, denyut_jantung_janin: null, status_risiko: "rendah", keluhan: "", tindakan: "", tanggal_kontrol_berikutnya: null });
  if (pregnancyForm.tanggal_kontrol_berikutnya) pregnancyForm.tanggal_kontrol_berikutnya = new Date(pregnancyForm.tanggal_kontrol_berikutnya);
  pregnancyDialog.value = true;
}

async function savePregnancy() {
  const payload = { ...pregnancyForm, tanggal_kontrol_berikutnya: toApiDate(pregnancyForm.tanggal_kontrol_berikutnya) };
  await saveVisitDetail(`/kunjungan-posyandu/${selectedVisit.value.id}/pemeriksaan-ibu-hamil`, payload, () => (pregnancyDialog.value = false));
}

async function saveVisitDetail(url, payload, closeDialog) {
  try {
    saving.value = true;
    await apiClient.post(url, payload);
    toast.add({ severity: "success", summary: "Berhasil", detail: "Data pemeriksaan disimpan", life: 2500 });
    closeDialog();
    loadVisits();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: error.response?.data?.pesan || "Data belum tersimpan", life: 3000 });
  } finally {
    saving.value = false;
  }
}

watch(filters, loadVisits);

onMounted(async () => {
  await loadOptions();
  await loadVisits();
});
</script>
