<template>
  <div class="content-tabel">
    <div class="card">
      <Toast />

      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Tambah Diagnosa Pasien</h2>
        <Button icon="pi pi-arrow-left" label="Kembali" @click="$router.push('/master/pasien')" />
      </div>

      <div v-if="loading" class="flex justify-content-center">
        <ProgressSpinner />
      </div>

      <div v-else class="grid">
        <!-- Data Pasien -->
        <div class="col-12 md:col-4">
          <Panel header="Informasi Pasien" class="mb-3">
            <div class="grid">
              <div class="col-4 font-bold">No. RM</div>
              <div class="col-8">{{ pasien.no_rm || '-' }}</div>

              <div class="col-4 font-bold">Nama</div>
              <div class="col-8">{{ pasien.nama || '-' }}</div>

              <div class="col-4 font-bold">Jenis Kelamin</div>
              <div class="col-8">{{ pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</div>

              <div class="col-4 font-bold">Tanggal Lahir</div>
              <div class="col-8">{{ formatDate(pasien.tanggal_lahir) }}</div>
            </div>
          </Panel>
        </div>

        <!-- Form Diagnosa -->
        <div class="col-12 md:col-8">
          <Panel header="Form Diagnosa" class="mb-7" style="font-size: larger;">
            <form @submit.prevent="saveDiagnosis">
              <div class="grid">
                <!-- Keluhan -->
                <div class="col-12 field">
                  <label for="keluhan" class="font-bold">Keluhan *</label>
                  <Textarea
                    id="keluhan"
                    v-model="diagnosisForm.keluhan"
                    :class="{'p-invalid': submitted && !diagnosisForm.keluhan}"
                    rows="3"
                    placeholder="Masukkan keluhan pasien"
                    required
                  />
                  <small class="p-error" v-if="submitted && !diagnosisForm.keluhan">
                    Keluhan wajib diisi.
                  </small>
                </div>

                <!-- Diagnosis -->
                <div class="col-12 field">
                  <label for="diagnosis" class="font-bold">Diagnosis *</label>
                  <Textarea
                    id="diagnosis"
                    v-model="diagnosisForm.diagnosis"
                    :class="{'p-invalid': submitted && !diagnosisForm.diagnosis}"
                    rows="3"
                    placeholder="Masukkan diagnosis"
                    required
                  />
                  <small class="p-error" v-if="submitted && !diagnosisForm.diagnosis">
                    Diagnosis wajib diisi.
                  </small>
                </div>

                <!-- Tindakan -->
                <div class="col-12 field">
                  <label for="tindakan" class="font-bold">Tindakan *</label>
                  <Textarea
                    id="tindakan"
                    v-model="diagnosisForm.tindakan"
                    :class="{'p-invalid': submitted && !diagnosisForm.tindakan}"
                    rows="3"
                    placeholder="Masukkan tindakan yang diberikan"
                    required
                  />
                  <small class="p-error" v-if="submitted && !diagnosisForm.tindakan">
                    Tindakan wajib diisi.
                  </small>
                </div>

                <!-- Catatan -->
                <div class="col-12 field">
                  <label for="catatan" class="font-bold">Catatan</label>
                  <Textarea
                    id="catatan"
                    v-model="diagnosisForm.catatan"
                    rows="3"
                    placeholder="Masukkan catatan tambahan (opsional)"
                  />
                </div>

                <!-- Tombol Submit -->
                <div class="col-12 flex justify-content-end">
                  <Button type="submit" label="Simpan Diagnosa" icon="pi pi-save" />
                </div>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import apiClient from '../../services/apiService';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const submitted = ref(false);
const pasien = ref({});

const diagnosisForm = ref({
  keluhan: '',
  diagnosis: '',
  tindakan: '',
  catatan: ''
});

// Format tanggal ke format Indonesia
const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMMM yyyy', { locale: id });
};

const fetchPasienDetail = async () => {
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
    const response = await apiClient.get(`/pasien/${route.params.id}`);
    pasien.value = response.data.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
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

const saveDiagnosis = async () => {
  submitted.value = true;

  if (!diagnosisForm.value.keluhan || !diagnosisForm.value.diagnosis || !diagnosisForm.value.tindakan) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Mohon lengkapi semua field yang wajib diisi',
      life: 3000
    });
    return;
  }

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
    await apiClient.post(`/pasien/${route.params.id}/diagnosis`, diagnosisForm.value);
    
    toast.add({
      severity: 'success',
      summary: 'Sukses',
      detail: 'Diagnosa berhasil disimpan',
      life: 3000
    });

    // Redirect ke halaman detail pasien
    router.push(`/master/pasien/${route.params.id}`);
  } catch (error) {
    console.error('Error saving diagnosis:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.pesan || 'Gagal menyimpan diagnosa',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPasienDetail();
});
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

.font-bold {
  font-weight: 600;
}

:deep(.p-panel) {
  margin-bottom: 1rem;
}

.card {
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}
</style> 