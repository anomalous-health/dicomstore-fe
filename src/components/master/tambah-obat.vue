<template>
  <div class="content-tabel">
    <div class="card">
      <Toast />

      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Tambah Resep Obat</h2>
        <Button icon="pi pi-arrow-left" label="Kembali" @click="$router.push(`/master/pasien/${$route.params.id}`)" />
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

          <!-- Diagnosa Terakhir -->
          <Panel header="Diagnosa Terakhir" class="mb-3">
            <div v-if="pasien.data_diagnosa && pasien.data_diagnosa.length > 0">
              <div class="grid">
                <div class="col-4 font-bold">Tanggal</div>
                <div class="col-8">{{ formatDate(pasien.data_diagnosa[0].created_at) }}</div>

                <div class="col-4 font-bold">Keluhan</div>
                <div class="col-8">{{ pasien.data_diagnosa[0].keluhan }}</div>

                <div class="col-4 font-bold">Diagnosis</div>
                <div class="col-8">{{ pasien.data_diagnosa[0].diagnosis }}</div>

                <div class="col-4 font-bold">Tindakan</div>
                <div class="col-8">{{ pasien.data_diagnosa[0].tindakan }}</div>
              </div>
            </div>
            <div v-else class="text-center text-500">
              Belum ada diagnosa
            </div>
          </Panel>
        </div>

        <!-- Form Resep -->
        <div class="col-12 md:col-8">
          <Panel header="Form Resep Obat" class="mb-3">
            <form @submit.prevent="saveResep">
              <div class="grid">
                <!-- Pilih Diagnosa -->
                <div class="col-12 field">
                  <label for="diagnosis" class="font-bold">Pilih Diagnosa *</label>
                  <Dropdown
                    id="diagnosis"
                    v-model="resepForm.diagnosis_id"
                    :options="pasien.data_diagnosa"
                    optionLabel="diagnosis"
                    optionValue="id"
                    placeholder="Pilih diagnosa"
                    :class="{'p-invalid': submitted && !resepForm.diagnosis_id}"
                  />
                  <small class="p-error" v-if="submitted && !resepForm.diagnosis_id">
                    Diagnosa wajib dipilih
                  </small>
                </div>

                <!-- Pilih Obat -->
                <div class="col-12 field">
                  <label for="medicine" class="font-bold">Pilih Obat *</label>
                  <Dropdown
                    id="medicine"
                    v-model="resepForm.medicine_id"
                    :options="medicines"
                    optionLabel="nama"
                    optionValue="id"
                    placeholder="Pilih obat"
                    :class="{'p-invalid': submitted && !resepForm.medicine_id}"
                  />
                  <small class="p-error" v-if="submitted && !resepForm.medicine_id">
                    Obat wajib dipilih
                  </small>
                </div>

                <!-- Jumlah -->
                <div class="col-12 field">
                  <label for="jumlah" class="font-bold">Jumlah *</label>
                  <InputNumber
                    id="jumlah"
                    v-model="resepForm.jumlah"
                    :class="{'p-invalid': submitted && !resepForm.jumlah}"
                    placeholder="Masukkan jumlah obat"
                    :min="1"
                  />
                  <small class="p-error" v-if="submitted && !resepForm.jumlah">
                    Jumlah wajib diisi
                  </small>
                </div>

                <!-- Aturan Pakai -->
                <div class="col-12 field">
                  <label for="aturan_pakai" class="font-bold">Aturan Pakai *</label>
                  <InputText
                    id="aturan_pakai"
                    v-model="resepForm.aturan_pakai"
                    :class="{'p-invalid': submitted && !resepForm.aturan_pakai}"
                    placeholder="Contoh: 3 x 1 sehari setelah makan"
                  />
                  <small class="p-error" v-if="submitted && !resepForm.aturan_pakai">
                    Aturan pakai wajib diisi
                  </small>
                </div>

                <!-- Keterangan -->
                <div class="col-12 field">
                  <label for="keterangan" class="font-bold">Keterangan</label>
                  <Textarea
                    id="keterangan"
                    v-model="resepForm.keterangan"
                    rows="3"
                    placeholder="Masukkan keterangan tambahan (opsional)"
                  />
                </div>

                <!-- Submit Button -->
                <div class="col-12 flex justify-content-end">
                  <Button type="submit" label="Simpan Resep" icon="pi pi-save" />
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
const medicines = ref([]);

const resepForm = ref({
  medicine_id: null,
  diagnosis_id: null,
  jumlah: null,
  aturan_pakai: '',
  keterangan: ''
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
  }
};

const fetchMedicines = async () => {
  try {
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
    const response = await apiClient.get('/obat');
    medicines.value = response.data.data;
  } catch (error) {
    console.error('Error fetching medicines:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.pesan || 'Gagal mengambil data obat',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const saveResep = async () => {
  submitted.value = true;

  if (!resepForm.value.medicine_id || !resepForm.value.diagnosis_id || 
      !resepForm.value.jumlah || !resepForm.value.aturan_pakai) {
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
    await apiClient.post(`/pasien/${route.params.id}/obat`, resepForm.value);
    
    toast.add({
      severity: 'success',
      summary: 'Sukses',
      detail: 'Resep obat berhasil disimpan',
      life: 3000
    });

    // Redirect ke halaman detail pasien
    router.push(`/master/pasien/${route.params.id}`);
  } catch (error) {
    console.error('Error saving prescription:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.pesan || 'Gagal menyimpan resep obat',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchPasienDetail();
  await fetchMedicines();
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