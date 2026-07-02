<template>
  <div class="satusehat-config">
    <div class="card">


      <DataTable :value="configs" :loading="loading" stripedRows responsiveLayout="scroll" class="p-datatable-sm">
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h3 class="m-0" style="padding-right: 550px;">Konfigurasi SATUSEHAT API</h3>
            <Button label="Tambah Konfigurasi" icon="pi pi-plus" @click="openDialog()" class="p-button-success" />
          </div>
        </template>
        <Column field="id" header="ID" :sortable="true" style="width: 80px"></Column>
        <Column field="environment" header="Environment" :sortable="true">
          <template #body="slotProps">
            <Tag :value="slotProps.data.environment === 'prod' ? 'Production' : 'Staging'"
              :severity="slotProps.data.environment === 'prod' ? 'danger' : 'warning'" />
          </template>
        </Column>
        <Column field="organizationId" header="Organization ID" :sortable="true"></Column>
        <Column field="clientId" header="Client ID" :sortable="true">
          <template #body="slotProps">
            <span class="truncate-text">{{ slotProps.data.clientId }}</span>
          </template>
        </Column>
        <Column field="isActive" header="Status" :sortable="true" style="width: 120px">
          <template #body="slotProps">
            <Tag :value="slotProps.data.isActive ? 'Aktif' : 'Non-Aktif'"
              :severity="slotProps.data.isActive ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column field="updatedAt" header="Terakhir Diubah" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.updatedAt) }}
          </template>
        </Column>
        <Column header="Aksi" style="width: 280px">
          <template #body="slotProps">
            <div class="action-buttons">
              <Button icon="pi pi-eye" class="p-button-rounded p-button-info p-button-sm" v-tooltip.top="'Lihat Detail'"
                @click="viewDetail(slotProps.data)" />
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-sm" v-tooltip.top="'Edit'"
                @click="openDialog(slotProps.data)" />
              <Button v-if="!slotProps.data.isActive" icon="pi pi-check"
                class="p-button-rounded p-button-success p-button-sm" v-tooltip.top="'Aktifkan'"
                @click="activateConfig(slotProps.data.id)" />
              <Button icon="pi pi-wifi" class="p-button-rounded p-button-help p-button-sm"
                v-tooltip.top="'Test Koneksi'" @click="testConnection(slotProps.data.id)" />
              <Button v-if="!slotProps.data.isActive" icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-sm" v-tooltip.top="'Hapus'"
                @click="confirmDelete(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog Form -->
    <Dialog v-model:visible="dialogVisible" :header="editMode ? 'Edit Konfigurasi' : 'Tambah Konfigurasi'" :modal="true"
      :closable="true" :style="{ width: '600px' }">
      <div class="p-fluid">
        <div class="field">
          <label for="environment">Environment *</label>
          <Dropdown id="environment" v-model="formData.environment" :options="environmentOptions" optionLabel="label"
            optionValue="value" placeholder="Pilih Environment" />
        </div>

        <div class="field">
          <label for="authBaseUrl">Auth Base URL *</label>
          <InputText id="authBaseUrl" v-model="formData.authBaseUrl"
            placeholder="https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1" />
        </div>

        <div class="field">
          <label for="fhirBaseUrl">FHIR Base URL *</label>
          <InputText id="fhirBaseUrl" v-model="formData.fhirBaseUrl"
            placeholder="https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1" />
        </div>

        <div class="field">
          <label for="organizationId">Organization ID *</label>
          <InputText id="organizationId" v-model="formData.organizationId"
            placeholder="Organization ID dari SATUSEHAT" />
        </div>

        <div class="field">
          <label for="clientId">Client ID *</label>
          <InputText id="clientId" v-model="formData.clientId" placeholder="Client ID dari SATUSEHAT" />
        </div>

        <div class="field">
          <label for="clientSecret">Client Secret *</label>
          <Password id="clientSecret" v-model="formData.clientSecret" :feedback="false" toggleMask
            placeholder="Client Secret dari SATUSEHAT" />
        </div>

        <div class="field-checkbox">
          <Checkbox id="isActive" v-model="formData.isActive" :binary="true" />
          <label for="isActive">Set sebagai konfigurasi aktif</label>
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" @click="dialogVisible = false" class="p-button-text" />
        <Button label="Simpan" icon="pi pi-check" @click="saveConfig" :loading="saving" />
      </template>
    </Dialog>

    <!-- Dialog Detail -->
    <Dialog v-model:visible="detailDialogVisible" header="Detail Konfigurasi" :modal="true" :closable="true"
      :style="{ width: '600px' }">
      <div v-if="selectedConfig" class="config-detail">
        <div class="detail-row">
          <span class="label">ID:</span>
          <span class="value">{{ selectedConfig.id }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Environment:</span>
          <Tag :value="selectedConfig.environment === 'prod' ? 'Production' : 'Staging'"
            :severity="selectedConfig.environment === 'prod' ? 'danger' : 'warning'" />
        </div>
        <div class="detail-row">
          <span class="label">Auth Base URL:</span>
          <span class="value">{{ selectedConfig.authBaseUrl }}</span>
        </div>
        <div class="detail-row">
          <span class="label">FHIR Base URL:</span>
          <span class="value">{{ selectedConfig.fhirBaseUrl }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Organization ID:</span>
          <span class="value">{{ selectedConfig.organizationId }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Client ID:</span>
          <span class="value">{{ selectedConfig.clientId }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Client Secret:</span>
          <span class="value">{{ selectedConfig.clientSecret }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Status:</span>
          <Tag :value="selectedConfig.isActive ? 'Aktif' : 'Non-Aktif'"
            :severity="selectedConfig.isActive ? 'success' : 'secondary'" />
        </div>
        <div class="detail-row">
          <span class="label">Dibuat:</span>
          <span class="value">{{ formatDate(selectedConfig.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Terakhir Diubah:</span>
          <span class="value">{{ formatDate(selectedConfig.updatedAt) }}</span>
        </div>
        <div class="detail-row" v-if="selectedConfig.updatedBy">
          <span class="label">Diubah Oleh:</span>
          <span class="value">{{ selectedConfig.updatedBy }}</span>
        </div>
      </div>
    </Dialog>

    <!-- Confirm Delete Dialog -->
    <Dialog v-model:visible="deleteDialogVisible" header="Konfirmasi Hapus" :modal="true" :style="{ width: '400px' }">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #f59e0b"></i>
        <span>Apakah Anda yakin ingin menghapus konfigurasi ini?</span>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text" />
        <Button label="Hapus" icon="pi pi-trash" @click="deleteConfig" class="p-button-danger" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import satuSehatConfigService from '../../services/satuSehatConfigService';

const toast = useToast();

// State
const configs = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const editMode = ref(false);
const saving = ref(false);
const deleting = ref(false);
const selectedConfig = ref(null);

const formData = ref({
  environment: 'stg',
  authBaseUrl: '',
  fhirBaseUrl: '',
  organizationId: '',
  clientId: '',
  clientSecret: '',
  isActive: false,
});

const environmentOptions = [
  { label: 'Staging', value: 'stg' },
  { label: 'Production', value: 'prod' },
];

// Methods
const loadConfigs = async () => {
  loading.value = true;
  try {
    const response = await satuSehatConfigService.getAllConfigs();
    configs.value = response.data;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat konfigurasi',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const openDialog = (config = null) => {
  if (config) {
    editMode.value = true;
    selectedConfig.value = config;
    formData.value = {
      environment: config.environment,
      authBaseUrl: config.authBaseUrl,
      fhirBaseUrl: config.fhirBaseUrl,
      organizationId: config.organizationId,
      clientId: config.clientId,
      clientSecret: '', // Kosongkan untuk keamanan
      isActive: config.isActive,
    };
  } else {
    editMode.value = false;
    selectedConfig.value = null;
    formData.value = {
      environment: 'stg',
      authBaseUrl: 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1',
      fhirBaseUrl: 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1',
      organizationId: '',
      clientId: '',
      clientSecret: '',
      isActive: false,
    };
  }
  dialogVisible.value = true;
};

const saveConfig = async () => {
  if (!validateForm()) {
    return;
  }

  saving.value = true;
  try {
    if (editMode.value) {
      await satuSehatConfigService.updateConfig(selectedConfig.value.id, formData.value);
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Konfigurasi berhasil diupdate',
        life: 3000,
      });
    } else {
      await satuSehatConfigService.createConfig(formData.value);
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Konfigurasi berhasil ditambahkan',
        life: 3000,
      });
    }
    dialogVisible.value = false;
    loadConfigs();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Gagal menyimpan konfigurasi',
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};

const validateForm = () => {
  if (!formData.value.authBaseUrl || !formData.value.fhirBaseUrl ||
    !formData.value.organizationId || !formData.value.clientId) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Semua field wajib diisi',
      life: 3000,
    });
    return false;
  }

  if (!editMode.value && !formData.value.clientSecret) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Client Secret wajib diisi',
      life: 3000,
    });
    return false;
  }

  return true;
};

const viewDetail = (config) => {
  selectedConfig.value = config;
  detailDialogVisible.value = true;
};

const activateConfig = async (id) => {
  try {
    await satuSehatConfigService.activateConfig(id);
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Konfigurasi berhasil diaktifkan',
      life: 3000,
    });
    loadConfigs();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal mengaktifkan konfigurasi',
      life: 3000,
    });
  }
};

const testConnection = async (id) => {
  try {
    const response = await satuSehatConfigService.testConnection(id);
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Koneksi ke SATUSEHAT API berhasil',
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: response.data.message || 'Koneksi ke SATUSEHAT API gagal',
        life: 3000,
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Gagal melakukan test koneksi',
      life: 3000,
    });
  }
};

const confirmDelete = (config) => {
  selectedConfig.value = config;
  deleteDialogVisible.value = true;
};

const deleteConfig = async () => {
  deleting.value = true;
  try {
    await satuSehatConfigService.deleteConfig(selectedConfig.value.id);
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Konfigurasi berhasil dihapus',
      life: 3000,
    });
    deleteDialogVisible.value = false;
    loadConfigs();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.error || 'Gagal menghapus konfigurasi',
      life: 3000,
    });
  } finally {
    deleting.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Lifecycle
onMounted(() => {
  loadConfigs();
});
</script>

<style scoped>
.satusehat-config {
  padding: 1.5rem;
}

/* .card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
} */

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.truncate-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.config-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.detail-row .label {
  font-weight: 600;
  color: #374151;
  min-width: 180px;
}

.detail-row .value {
  color: #6b7280;
  word-break: break-all;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.confirmation-content span {
  font-size: 1rem;
  color: #374151;
}
</style>
