<template>
  <div class="dicomstore-page">
    <Toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Pendaftaran Ibu & Bayi</h1>
        <p class="page-subtitle">Daftarkan sasaran posyandu baru dan cegah data ganda dari NIK.</p>
      </div>
      <Button icon="pi pi-refresh" label="Muat Data" @click="loadPatients" :loading="loading" />
    </div>

    <TabView v-model:activeIndex="activeTab">
      <TabPanel header="Ibu Hamil">
        <div class="content-panel">
          <div class="status-row mb-3">
            <Tag severity="info" value="Sasaran: Ibu Hamil" />
            <Tag v-if="existingMother" severity="warning" value="Sudah Terdaftar" />
          </div>

          <div v-if="existingMother" class="existing-box mb-3">
            <div>
              <div class="font-semibold">{{ existingMother.nama }}</div>
              <small>{{ existingMother.no_rm }} | {{ existingMother.nik }}</small>
            </div>
            <Button icon="pi pi-eye" label="Lihat Pasien" text @click="goToPatient(existingMother.id)" />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>NIK Ibu</label>
              <InputText v-model="motherForm.nik" maxlength="16" @blur="checkMotherNik" />
            </div>
            <div class="form-field">
              <label>Nomor KK</label>
              <InputText v-model="motherForm.nomor_kk" maxlength="20" />
            </div>
            <div class="form-field">
              <label>Nama Ibu</label>
              <InputText v-model="motherForm.nama" />
            </div>
            <div class="form-field">
              <label>No. Telepon</label>
              <InputText v-model="motherForm.no_telepon" maxlength="15" />
            </div>
            <div class="form-field">
              <label>Tempat Lahir</label>
              <InputText v-model="motherForm.tempat_lahir" />
            </div>
            <div class="form-field">
              <label>Tanggal Lahir</label>
              <Calendar v-model="motherForm.tanggal_lahir" dateFormat="yy-mm-dd" showIcon />
            </div>
            <div class="form-field full">
              <label>Alamat</label>
              <Textarea v-model="motherForm.alamat" rows="3" />
            </div>
          </div>

          <div class="form-actions">
            <Button icon="pi pi-save" label="Daftarkan Ibu" @click="registerMother" :loading="saving" :disabled="Boolean(existingMother)" />
          </div>
        </div>
      </TabPanel>

      <TabPanel header="Bayi / Balita">
        <div class="content-panel">
          <div class="status-row mb-3">
            <Tag severity="success" value="Sasaran: Bayi / Balita" />
            <Tag v-if="existingBaby" severity="warning" value="Sudah Terdaftar" />
          </div>

          <div v-if="existingBaby" class="existing-box mb-3">
            <div>
              <div class="font-semibold">{{ existingBaby.nama }}</div>
              <small>{{ existingBaby.no_rm }} | {{ existingBaby.nik }}</small>
            </div>
            <Button icon="pi pi-eye" label="Lihat Pasien" text @click="goToPatient(existingBaby.id)" />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>NIK Bayi/Balita</label>
              <InputText v-model="babyForm.nik" maxlength="16" @blur="checkBabyNik" />
            </div>
            <div class="form-field">
              <label>Nomor KK</label>
              <InputText v-model="babyForm.nomor_kk" maxlength="20" />
            </div>
            <div class="form-field">
              <label>Nama Bayi/Balita</label>
              <InputText v-model="babyForm.nama" />
            </div>
            <div class="form-field">
              <label>Jenis Kelamin</label>
              <Dropdown v-model="babyForm.jenis_kelamin" :options="genderOptions" optionLabel="label" optionValue="value" />
            </div>
            <div class="form-field">
              <label>Tempat Lahir</label>
              <InputText v-model="babyForm.tempat_lahir" />
            </div>
            <div class="form-field">
              <label>Tanggal Lahir</label>
              <Calendar v-model="babyForm.tanggal_lahir" dateFormat="yy-mm-dd" showIcon />
            </div>
            <div class="form-field">
              <label>Nama Ayah</label>
              <InputText v-model="babyForm.nama_ayah" />
            </div>
            <div class="form-field">
              <label>Nama Ibu</label>
              <InputText v-model="babyForm.nama_ibu" />
            </div>
            <div class="form-field">
              <label>No. Telepon Orang Tua</label>
              <InputText v-model="babyForm.no_telepon" maxlength="15" />
            </div>
            <div class="form-field full">
              <label>Alamat</label>
              <Textarea v-model="babyForm.alamat" rows="3" />
            </div>
          </div>

          <div class="form-actions">
            <Button icon="pi pi-save" label="Daftarkan Bayi/Balita" @click="registerBaby" :loading="saving" :disabled="Boolean(existingBaby)" />
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import apiClient from "../../services/apiService";
import { toApiDate } from "./posyanduService";
import "./posyandu.css";

const router = useRouter();
const toast = useToast();
const activeTab = ref(0);
const loading = ref(false);
const saving = ref(false);
const patients = ref([]);

const genderOptions = [
  { label: "Laki-laki", value: "L" },
  { label: "Perempuan", value: "P" },
];

const motherForm = reactive({
  nama: "",
  nik: "",
  nomor_kk: "",
  jenis_kelamin: "P",
  kategori_sasaran: "ibu_hamil",
  tempat_lahir: "",
  tanggal_lahir: null,
  alamat: "",
  nama_ayah: "",
  nama_ibu: "",
  no_telepon: "",
});

const babyForm = reactive({
  nama: "",
  nik: "",
  nomor_kk: "",
  jenis_kelamin: "L",
  kategori_sasaran: "balita",
  tempat_lahir: "",
  tanggal_lahir: null,
  alamat: "",
  nama_ayah: "",
  nama_ibu: "",
  no_telepon: "",
});

const existingMother = computed(() => findPatientByNik(motherForm.nik));
const existingBaby = computed(() => findPatientByNik(babyForm.nik));

function findPatientByNik(nik) {
  if (!nik || nik.length !== 16) return null;
  return patients.value.find((patient) => patient.nik === nik) || null;
}

function showError(error, fallback) {
  const errors = error.response?.data?.errors;
  const detail = errors ? Object.values(errors).flat().join(", ") : error.response?.data?.pesan || fallback;
  toast.add({ severity: "error", summary: "Gagal", detail, life: 4000 });
}

async function loadPatients() {
  try {
    loading.value = true;
    const response = await apiClient.get("/pasien");
    patients.value = response.data.data || [];
  } catch (error) {
    showError(error, "Data pasien tidak dapat dimuat");
  } finally {
    loading.value = false;
  }
}

function checkMotherNik() {
  if (existingMother.value) {
    toast.add({ severity: "warn", summary: "Sudah terdaftar", detail: `${existingMother.value.nama} sudah ada di data pasien.`, life: 3500 });
  }
}

function checkBabyNik() {
  if (existingBaby.value) {
    toast.add({ severity: "warn", summary: "Sudah terdaftar", detail: `${existingBaby.value.nama} sudah ada di data pasien.`, life: 3500 });
  }
}

function validateNik(nik) {
  return /^\d{16}$/.test(nik);
}

function buildPayload(form) {
  return {
    ...form,
    tanggal_lahir: toApiDate(form.tanggal_lahir),
  };
}

function resetMotherForm() {
  Object.assign(motherForm, {
    nama: "",
    nik: "",
    nomor_kk: "",
    jenis_kelamin: "P",
    kategori_sasaran: "ibu_hamil",
    tempat_lahir: "",
    tanggal_lahir: null,
    alamat: "",
    nama_ayah: "",
    nama_ibu: "",
    no_telepon: "",
  });
}

function resetBabyForm() {
  Object.assign(babyForm, {
    nama: "",
    nik: "",
    nomor_kk: "",
    jenis_kelamin: "L",
    kategori_sasaran: "balita",
    tempat_lahir: "",
    tanggal_lahir: null,
    alamat: "",
    nama_ayah: "",
    nama_ibu: "",
    no_telepon: "",
  });
}

async function registerMother() {
  if (!validateNik(motherForm.nik)) {
    toast.add({ severity: "warn", summary: "NIK tidak valid", detail: "NIK harus 16 digit angka.", life: 3000 });
    return;
  }

  if (existingMother.value) {
    checkMotherNik();
    return;
  }

  await registerPatient(motherForm, resetMotherForm, "Ibu berhasil didaftarkan");
}

async function registerBaby() {
  if (!validateNik(babyForm.nik)) {
    toast.add({ severity: "warn", summary: "NIK tidak valid", detail: "NIK harus 16 digit angka.", life: 3000 });
    return;
  }

  if (existingBaby.value) {
    checkBabyNik();
    return;
  }

  await registerPatient(babyForm, resetBabyForm, "Bayi/Balita berhasil didaftarkan");
}

async function registerPatient(form, resetForm, successMessage) {
  try {
    saving.value = true;
    await apiClient.post("/pasien", buildPayload(form));
    toast.add({ severity: "success", summary: "Berhasil", detail: successMessage, life: 3000 });
    resetForm();
    await loadPatients();
  } catch (error) {
    showError(error, "Pendaftaran belum tersimpan");
  } finally {
    saving.value = false;
  }
}

function goToPatient(id) {
  router.push(`/master/pasien/${id}`);
}

onMounted(loadPatients);
</script>

<style scoped>
.existing-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--yellow-300);
  background: var(--yellow-50);
  color: var(--text-color);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
