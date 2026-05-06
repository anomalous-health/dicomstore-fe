<template>
  <div class="content-tabel">
    <div class="card">
      <Toast />

      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Detail Pasien</h2>
        <div class="flex gap-2">
          <Button icon="pi pi-plus" label="Tambah Diagnosa" severity="success" @click="$router.push(`/master/pasien/${$route.params.id}/diagnosa`)" />
          <Button icon="pi pi-plus" label="Tambah Resep" severity="info" @click="$router.push(`/master/pasien/${$route.params.id}/obat`)" />
          <Button icon="pi pi-arrow-left" label="Kembali" @click="$router.push('/master/pasien')" />
        </div>
      </div>

      <div v-if="loading" class="flex justify-content-center">
        <ProgressSpinner />
      </div>

      <div v-else class="grid">
        <!-- Data Pasien -->
        <div class="col-12 md:col-6">
          <Panel header="Informasi Pasien" class="mb-3 custom-panel">
            <div class="grid">
              <div class="col-4 font-bold">No. RM</div>
              <div class="col-8">{{ pasien.no_rm }}</div>

              <div class="col-4 font-bold">Nama</div>
              <div class="col-8">{{ pasien.nama }}</div>
            
              <div class="col-4 font-bold">Nama Ibu</div>
              <div class="col-8">{{ pasien.nama_ibu }}</div>
            
              <div class="col-4 font-bold">Nama Ayah</div>
              <div class="col-8">{{ pasien.nama_ayah }}</div>

              <div class="col-4 font-bold">NIK</div>
              <div class="col-8">{{ pasien.nik }}</div>

              <div class="col-4 font-bold">Jenis Kelamin</div>
              <div class="col-8">{{ pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</div>

              <div class="col-4 font-bold">Tempat Lahir</div>
              <div class="col-8">{{ pasien.tempat_lahir }}</div>

              <div class="col-4 font-bold">Tanggal Lahir</div>
              <div class="col-8">{{ formatDate(pasien.tanggal_lahir) }}</div>

              <div class="col-4 font-bold">Alamat</div>
              <div class="col-8">{{ pasien.alamat }}</div>

              <div class="col-4 font-bold">No. Telepon</div>
              <div class="col-8">{{ pasien.no_telepon }}</div>
            </div>
          </Panel>
        </div>

        <!-- Data Kesehatan Terbaru -->
        <div class="col-12 md:col-6">
          <Panel header="Data Kesehatan Terbaru" class="mb-3 custom-panel">
            <div v-if="pasien.data_kesehatan_terbaru" class="grid">
              <!-- Tampilkan data kesehatan jika ada -->
              <div class="col-12">Data kesehatan akan ditampilkan di sini</div>
            </div>
            <div v-else class="text-center text-500">
              Belum ada data kesehatan terbaru
            </div>
          </Panel>
        </div>

        <!-- Riwayat Diagnosa -->
        <div class="col-12">
          <Panel header="Riwayat Diagnosa" class="mb-3 custom-panel">
            <DataTable :value="pasien.data_diagnosa" :paginator="true" :rows="5" 
                       :rowsPerPageOptions="[5, 10, 20]" responsiveLayout="scroll">
              <Column field="created_at" header="Tanggal" :body="(data) => formatDate(data.created_at)"></Column>
              <Column field="keluhan" header="Keluhan"></Column>
              <Column field="diagnosis" header="Diagnosis"></Column>
              <Column field="tindakan" header="Tindakan"></Column>
              <Column field="catatan" header="Catatan"></Column>
            </DataTable>
          </Panel>
        </div>

        <!-- Riwayat Obat -->
        <div class="col-12">
          <Panel header="Riwayat Pemberian Obat" class="mb-3 custom-panel">
            <DataTable :value="pasien.data_obat" :paginator="true" :rows="5" 
                       :rowsPerPageOptions="[5, 10, 20]" responsiveLayout="scroll">
              <Column field="created_at" header="Tanggal" :body="(data) => formatDate(data.created_at)"></Column>
              <Column field="medicine_id" header="Obat"></Column>
              <Column field="jumlah" header="Jumlah"></Column>
              <Column field="aturan_pakai" header="Aturan Pakai"></Column>
              <Column field="keterangan" header="Keterangan"></Column>
            </DataTable>
          </Panel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import apiClient from '../../services/apiService';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const route = useRoute();
const toast = useToast();
const loading = ref(true);
const pasien = ref({
  data_diagnosa: [],
  data_obat: []
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
      toast.add({ severity: 'error', summary: 'Error', detail: 'AccessToken tidak tersedia', life: 3000 });
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

onMounted(() => {
  fetchPasienDetail();
});
</script>

<style>
@import '../style.css';

.font-bold {
  font-weight: 600;
}
</style> 