<template>
  <div class="upload-page">
    <Toast />

    <!-- ── Page Header ──────────────────────────────────────────────────── -->
    <div class="up-header">
      <div class="up-header__left">
        <p class="up-header__sub">DICOM</p>
        <h1 class="up-header__title">Log Upload</h1>
      </div>
      <div class="up-scp" :class="scpStatus.running ? 'up-scp--up' : 'up-scp--down'">
        <span class="up-scp__dot" />
        <div class="up-scp__body">
          <span class="up-scp__label">SCP Listener</span>
          <span class="up-scp__status">{{ scpStatus.running ? 'RUNNING' : 'STOPPED' }}</span>
          <span v-if="scpStatus.running" class="up-scp__meta">
            AE: <b>{{ scpStatus.aeTitle || '-' }}</b> · Port: <b>{{ scpStatus.port || '-' }}</b>
          </span>
        </div>
        <div v-if="scpStatus.running" class="up-scp__conn">
          <span class="up-scp__conn-count">{{ scpStatus.activeConnections }}</span>
          <span class="up-scp__conn-label">koneksi</span>
        </div>
      </div>
    </div>

    <!-- ── Top panels: Upload + Monitor ───────────────────────────────── -->
    <div class="up-panels">

      <!-- Upload panel -->
      <div class="up-panel">
        <div class="up-panel__header">
          <div class="up-panel__icon"><i class="pi pi-cloud-upload" /></div>
          <span class="up-panel__title">Upload DICOM</span>
          <span class="up-panel__hint">Maks. 5 GB per file · .dcm</span>
        </div>
        <div class="up-panel__body">
          <FileUpload
            ref="fileUpload"
            mode="advanced"
            :multiple="true"
            accept=".dcm,application/dicom,application/octet-stream"
            :maxFileSize="5000000000"
            customUpload
            @uploader="uploadDicom"
          >
            <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
              <div class="fu-actions">
                <Button label="Import File" icon="pi pi-file" size="small" @click="chooseCallback()" />
                <Button label="Import Folder" icon="pi pi-folder-open" severity="secondary" size="small" @click="triggerFolderInput" />
                <Button label="Upload" icon="pi pi-upload" severity="success" size="small"
                  :disabled="!files || files.length === 0" @click="uploadCallback()" />
                <Button label="Clear" icon="pi pi-times" severity="danger" size="small"
                  :disabled="!files || files.length === 0" @click="clearCallback()" />
              </div>
            </template>
            <template #empty>
              <div class="fu-empty">
                <i class="pi pi-cloud-upload fu-empty__icon" />
                <p class="fu-empty__text">Drag &amp; Drop file DICOM ke sini</p>
                <span class="fu-empty__hint">atau gunakan tombol Import di atas</span>
              </div>
            </template>
          </FileUpload>

          <input ref="folderInput" type="file" webkitdirectory directory multiple hidden @change="onFolderSelected" />
        </div>
      </div>

      <!-- Monitor panel -->
      <div class="up-panel">
        <div class="up-panel__header">
          <div class="up-panel__icon up-panel__icon--blue"><i class="pi pi-desktop" /></div>
          <span class="up-panel__title">Monitor Service</span>
        </div>
        <div class="up-panel__body">
          <MiniMonitoringView />
        </div>
      </div>

    </div>

    <!-- ── DataTable ───────────────────────────────────────────────────── -->
    <div class="up-table-panel">
      <DataTable
        ref="dt"
        :value="data"
        v-model:selection="selectedPasiens"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} Data"
      >
        <template #header>
          <div
            class="flex flex-wrap gap-2 align-items-center justify-content-between mb-3"
          >
            <h3 class="m-0">Data Dicom Yang Telah Di Upload</h3>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Search..."
              />
            </IconField>
          </div>
          <Button
            label="Kirim Terpilih"
            icon="pi pi-send"
            severity="success"
            class=""
            @click="sendSelectedDicom"
            :disabled="!selectedPasiens || !selectedPasiens.length"
          />
        </template>

        <Column selectionMode="multiple" style="" :exportable="false"></Column>
        <!-- <Column field="createdAt" header="Tanggal" :body="formatDate" sortable style=""></Column> -->
        <Column field="createdAt" header="Tanggal" sortable>
          <template #body="{ data }">
            {{ formatTanggal(data.createdAt) }}
          </template>
        </Column>
        <Column field="source" header="Source" sortable>
          <template #body="slotProps">
            <Tag
              v-if="slotProps.data.source === 'SCP'"
              severity="info"
              value="SCP"
              icon="pi pi-desktop"
            ></Tag>
            <Tag
              v-else
              severity="secondary"
              value="WEB"
              icon="pi pi-cloud-upload"
            ></Tag>
          </template>
        </Column>
        <Column field="callingAeTitle" header="Calling AE" sortable>
          <template #body="slotProps">
            <span v-if="slotProps.data.callingAeTitle">{{
              slotProps.data.callingAeTitle
            }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </Column>
        <Column
          field="patientName"
          header="Nama Pasien"
          sortable
          style=""
        ></Column>
        <Column
          field="accessionNumber"
          header="Accession Number"
          sortable
          style=""
        ></Column>
        <Column field="patientId" header="No RM" sortable style=""></Column>
        <Column
          field="studyInstanceUid"
          header="Study Instance UID"
          sortable
          style="max-width: 150px"
        >
          <template #body="slotProps">
            <div
              class="text-overflow-ellipsis overflow-hidden white-space-nowrap"
              v-tooltip.top="slotProps.data.studyInstanceUid"
            >
              {{ slotProps.data.studyInstanceUid }}
            </div>
          </template>
        </Column>
        <Column
          field="message"
          header="Keterangan"
          sortable
          style="max-width: 150px"
        >
          <template #body="slotProps">
            <div
              class="text-overflow-ellipsis overflow-hidden white-space-nowrap"
              v-tooltip.top="slotProps.data.message"
            >
              {{ slotProps.data.message }}
            </div>
          </template>
        </Column>
        <Column header="Status Upload" sortable style="" field="status">
          <template #body="slotProps">
            <Tag
              :severity="getUploadStatusSeverity(slotProps.data.status)"
              :value="getUploadStatusLabel(slotProps.data.status)"
            />
          </template>
        </Column>
        <Column header="Status Kirim" sortable style="" field="routerStatus">
          <template #body="slotProps">
            <Tag
              :severity="getSendStatusSeverity(slotProps.data)"
              :value="getSendStatusLabel(slotProps.data)"
            />
          </template>
        </Column>
        <Column header="Aksi" :exportable="false" style="min-width: 7rem">
          <template #body="slotProps">
            <!-- Lihat Detail -->
            <!-- <Button icon="pi pi-eye" rounded outlined class="mr-2"
                            v-tooltip.top="'Lihat Detail'"
                            @click="viewDetails(slotProps.data)"
                            severity="info" /> -->

            <!-- Cek Service Request di SatuSehat -->
            <Button
              v-if="slotProps.data.accessionNumber"
              icon="pi pi-search"
              rounded
              outlined
              class="mr-2"
              v-tooltip.top="'Cek Service Request'"
              @click="checkServiceRequest(slotProps.data)"
              severity="help"
              :loading="slotProps.data._checkingSR"
            />

            <!-- Tombol kirim pertama kali (belum dikirim / uploaded) -->
            <Button
              v-if="slotProps.data.status === 'UPLOADED'"
              icon="pi pi-send"
              rounded
              outlined
              class="mr-2"
              v-tooltip.top="'Kirim ke Router'"
              @click="sendDicom(slotProps.data)"
              severity="success"
            />

            <!-- Tombol retry: muncul saat gagal ke router ATAU gagal ke SatuSehat -->
            <Button
              v-if="isRetryable(slotProps.data)"
              icon="pi pi-replay"
              rounded
              outlined
              class="mr-2"
              v-tooltip.top="'Kirim Ulang'"
              @click="retryDicom(slotProps.data)"
              severity="warning"
              :loading="slotProps.data._retrying"
            />

            <!-- Indikator loading saat sedang mengirim -->
            <Button
              v-if="slotProps.data.status === 'SENDING'"
              icon="pi pi-spin pi-spinner"
              rounded
              outlined
              class="mr-2"
              severity="info"
              disabled
            />

            <!-- Sukses: tombol kirim di-disabled -->
            <Button
              v-if="
                slotProps.data.status === 'SENT' &&
                slotProps.data.routerStatus === 'SUCCESS'
              "
              icon="pi pi-check"
              rounded
              outlined
              class="mr-2"
              severity="success"
              disabled
            />
          </template>
        </Column>
      </DataTable>
    </div><!-- /up-table-panel -->

    <!-- Create Dialog -->
    <Dialog
      v-model:visible="createDialog"
      :style="{ width: '450px' }"
      header="Tambah Pasien"
      :modal="true"
      class="p-fluid"
    >
      <!-- Nama -->
      <div class="field">
        <label for="nama">Nama</label>
        <InputText
          id="nama"
          v-model.trim="data.nama"
          required
          :invalid="submitted && !data.nama"
        />
        <small class="p-error" v-if="submitted && !data.nama"
          >Nama pasien wajib diisi.</small
        >
      </div>

      <!-- NIK -->
      <div class="field">
        <label for="nik">NIK</label>
        <InputText
          id="nik"
          v-model.trim="data.nik"
          required
          :invalid="submitted && !data.nik"
        />
        <small class="p-error" v-if="submitted && !data.nik"
          >NIK wajib diisi.</small
        >
      </div>

      <!-- Jenis Kelamin -->
      <div class="field">
        <label for="jenis_kelamin">Jenis Kelamin</label>
        <Dropdown
          id="jenis_kelamin"
          v-model="data.jenis_kelamin"
          :options="jenisKelaminOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih Jenis Kelamin"
        />
      </div>

      <!-- Tempat Lahir -->
      <div class="field">
        <label for="tempat_lahir">Tempat Lahir</label>
        <InputText id="tempat_lahir" v-model.trim="data.tempat_lahir" />
      </div>

      <!-- Tanggal Lahir -->
      <div class="field">
        <label for="tanggal_lahir">Tanggal Lahir</label>
        <Calendar
          id="tanggal_lahir"
          v-model="data.tanggal_lahir"
          dateFormat="yy-mm-dd"
        />
      </div>

      <!-- Alamat -->
      <div class="field">
        <label for="alamat">Alamat</label>
        <Textarea id="alamat" v-model.trim="data.alamat" rows="4" />
      </div>

      <!-- No. Telepon -->
      <div class="field">
        <label for="no_telepon">No. Telepon</label>
        <InputText id="no_telepon" v-model.trim="data.no_telepon" />
      </div>

      <!-- Footer -->
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" text @click="create" />
      </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="editDialog"
      :style="{ width: '450px' }"
      header="Edit Data Pasien"
      :modal="true"
      class="p-fluid"
    >
      <!-- Nama -->
      <div class="field">
        <label for="nama">Nama</label>
        <InputText
          id="nama"
          v-model.trim="pasien.nama"
          required
          :invalid="submitted && !pasien.nama"
        />
        <small class="p-error" v-if="submitted && !pasien.nama"
          >Nama pasien wajib diisi.</small
        >
      </div>

      <!-- NIK -->
      <div class="field">
        <label for="nik">NIK</label>
        <InputText
          id="nik"
          v-model.trim="pasien.nik"
          required
          :invalid="submitted && !pasien.nik"
        />
        <small class="p-error" v-if="submitted && !pasien.nik"
          >NIK wajib diisi.</small
        >
      </div>

      <!-- Jenis Kelamin -->
      <div class="field">
        <label for="jenis_kelamin">Jenis Kelamin</label>
        <Dropdown
          id="jenis_kelamin"
          v-model="pasien.jenis_kelamin"
          :options="jenisKelaminOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih Jenis Kelamin"
        />
      </div>

      <!-- Tempat Lahir -->
      <div class="field">
        <label for="tempat_lahir">Tempat Lahir</label>
        <InputText id="tempat_lahir" v-model.trim="pasien.tempat_lahir" />
      </div>

      <!-- Tanggal Lahir -->
      <div class="field">
        <label for="tanggal_lahir">Tanggal Lahir</label>
        <Calendar
          id="tanggal_lahir"
          v-model="pasien.tanggal_lahir"
          dateFormat="yy-mm-dd"
        />
      </div>

      <!-- Alamat -->
      <div class="field">
        <label for="alamat">Alamat</label>
        <Textarea id="alamat" v-model.trim="pasien.alamat" rows="4" />
      </div>

      <!-- No. Telepon -->
      <div class="field">
        <label for="no_telepon">No. Telepon</label>
        <InputText id="no_telepon" v-model.trim="pasien.no_telepon" />
      </div>

      <!-- Footer -->
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Update" icon="pi pi-check" text @click="update" />
      </template>
    </Dialog>

    <!-- Delete Dialog -->
    <Dialog
      v-model:visible="deleteDataDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="pasien">Apakah anda yakin akan menghapus data ini ?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteDataDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          text
          @click="deleteSelectedData"
        />
      </template>
    </Dialog>

    <!-- Service Request Check Dialog -->
    <Dialog
      v-model:visible="srDialog"
      :style="{ width: '520px' }"
      header="Cek Service Request SatuSehat"
      :modal="true"
    >
      <div v-if="srLoading" class="flex justify-content-center py-4">
        <i
          class="pi pi-spin pi-spinner"
          style="font-size: 2rem; color: var(--primary-color)"
        ></i>
      </div>
      <div v-else-if="srResult">
        <div class="flex align-items-center gap-2 mb-3">
          <i
            :class="
              srResult.found ? 'pi pi-check-circle' : 'pi pi-times-circle'
            "
            :style="{
              fontSize: '1.5rem',
              color: srResult.found ? '#16a34a' : '#dc2626',
            }"
          ></i>
          <strong>{{ srResult.message }}</strong>
        </div>

        <div v-if="srResult.found" class="surface-ground border-round p-3">
          <div class="grid">
            <div class="col-5 font-semibold">Accession Number</div>
            <div class="col-7">{{ srResult.accessionNumber }}</div>
            <div class="col-5 font-semibold">ServiceRequest ID</div>
            <div class="col-7" style="word-break: break-all">
              {{ srResult.serviceRequestId }}
            </div>
            <div class="col-5 font-semibold">Patient ID (FHIR)</div>
            <div class="col-7" style="word-break: break-all">
              {{ srResult.patientId || "-" }}
            </div>
            <div class="col-5 font-semibold">Status</div>
            <div class="col-7">
              <Tag
                :severity="srResult.status === 'active' ? 'success' : 'info'"
                :value="srResult.status || '-'"
              />
            </div>
          </div>
        </div>

        <div v-if="srResult.error" class="mt-2">
          <Tag severity="danger" value="Error" />
          <small class="ml-2 text-red-500">{{ srResult.message }}</small>
        </div>
      </div>
      <template #footer>
        <Button
          label="Tutup"
          icon="pi pi-times"
          text
          @click="srDialog = false"
        />
      </template>
    </Dialog>

    <!-- Upload Progress Dialog -->
    <Dialog
      v-model:visible="uploadProgressDialog"
      :style="{ width: '600px' }"
      header="Proses Upload"
      :modal="true"
      :closable="false"
    >
      <div class="mb-3">
        <ProgressBar :value="uploadProgressValue"></ProgressBar>
        <div class="text-center mt-2">{{ uploadProgressText }}</div>
      </div>
      <div class="max-h-20rem overflow-y-auto">
        <div
          v-for="(file, index) in uploadStatuses"
          :key="index"
          class="flex justify-content-between align-items-center p-2 border-bottom-1 surface-border"
        >
          <span
            class="text-overflow-ellipsis overflow-hidden white-space-nowrap"
            style="max-width: 70%"
            :title="file.name"
            >{{ file.name }}</span
          >
          <Tag
            :severity="
              file.status === 'SUCCESS'
                ? 'success'
                : file.status === 'FAILED'
                  ? 'danger'
                  : file.status === 'DUPLICATE'
                    ? 'warning'
                    : 'info'
            "
            :value="file.status"
          ></Tag>
        </div>
      </div>
      <template #footer>
        <Button
          label="Tutup"
          icon="pi pi-times"
          text
          @click="closeUploadProgressDialog"
          :disabled="isUploading"
        />
      </template>
    </Dialog>

    <!-- Folder Scan Confirmation Dialog -->
    <Dialog
      v-model:visible="folderConfirmDialog"
      :style="{ width: '520px' }"
      header="Konfirmasi Upload Folder"
      :modal="true"
    >
      <div class="flex align-items-center gap-3 mb-3">
        <i
          class="pi pi-folder-open"
          style="font-size: 2rem; color: var(--primary-color)"
        ></i>
        <div>
          <p class="m-0 font-semibold">{{ folderScanResult.folderName }}</p>
          <small class="text-gray-500"
            >{{ folderScanResult.totalScanned }} file dipindai dari
            folder</small
          >
        </div>
      </div>

      <div class="surface-ground border-round p-3 mb-3">
        <div class="grid">
          <div class="col-7 font-semibold">File DICOM ditemukan</div>
          <div class="col-5">
            <Tag
              severity="success"
              :value="`${folderScanResult.dicomCount} file`"
            ></Tag>
          </div>
          <div class="col-7 font-semibold">File non-DICOM (diabaikan)</div>
          <div class="col-5">
            <Tag
              severity="secondary"
              :value="`${folderScanResult.skippedCount} file`"
            ></Tag>
          </div>
        </div>
      </div>

      <div v-if="folderScanResult.dicomCount === 0" class="mb-3">
        <Message severity="warn" :closable="false"
          >Tidak ada file DICOM yang ditemukan dalam folder ini.
        </Message>
      </div>

      <div v-if="folderScanResult.dicomCount > 0" class="mb-3">
        <small class="text-gray-500">Contoh file yang akan diupload:</small>
        <div
          class="max-h-10rem overflow-y-auto mt-1 surface-ground border-round p-2"
        >
          <div
            v-for="(file, index) in folderScanResult.previewFiles"
            :key="index"
            class="text-sm py-1 border-bottom-1 surface-border"
          >
            <i class="pi pi-file mr-1" style="font-size: 0.8rem"></i>
            <span :title="file.path">{{ file.name }}</span>
            <small class="text-gray-400 ml-2"
              >({{ formatFileSize(file.size) }})</small
            >
          </div>
          <div
            v-if="folderScanResult.dicomCount > 10"
            class="text-sm py-1 text-gray-400 text-center"
          >
            ... dan {{ folderScanResult.dicomCount - 10 }} file lainnya
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          text
          @click="folderConfirmDialog = false"
        />
        <Button
          label="Upload"
          icon="pi pi-upload"
          @click="uploadFolderFiles"
          :disabled="folderScanResult.dicomCount === 0"
        />
      </template>
    </Dialog>
  </div><!-- /upload-page -->
</template>

<style scoped>
/* ── Page wrapper ────────────────────────────────────────────────────────── */
.upload-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

/* ── Page header ─────────────────────────────────────────────────────────── */
.up-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.up-header__sub {
  margin: 0 0 0.1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #10b981;
}

.up-header__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color, #111827);
  letter-spacing: -0.02em;
}

/* SCP badge */
.up-scp {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1.1rem;
  border-radius: 12px;
  border: 1px solid;
  min-width: 220px;
}

.up-scp--up  { background: #f0fdf4; border-color: #a7f3d0; }
.up-scp--down { background: #fef2f2; border-color: #fecaca; }

.up-scp__dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.up-scp--up  .up-scp__dot { background: #10b981; animation: scp-pulse 2s ease-in-out infinite; }
.up-scp--down .up-scp__dot { background: #ef4444; }

@keyframes scp-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50%       { box-shadow: 0 0 0 7px rgba(16,185,129,0); }
}

.up-scp__body { display: flex; flex-direction: column; gap: 0.05rem; }
.up-scp__label  { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
.up-scp__status { font-size: 0.875rem; font-weight: 700; }
.up-scp--up  .up-scp__status { color: #047857; }
.up-scp--down .up-scp__status { color: #b91c1c; }
.up-scp__meta   { font-size: 0.72rem; color: #6b7280; }

.up-scp__conn {
  margin-left: auto;
  display: flex; flex-direction: column; align-items: center;
  padding-left: 0.85rem;
  border-left: 1px solid #a7f3d0;
}
.up-scp__conn-count { font-size: 1.4rem; font-weight: 700; color: #047857; line-height: 1; }
.up-scp__conn-label { font-size: 0.68rem; color: #6b7280; }

/* ── Top panels ──────────────────────────────────────────────────────────── */
.up-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 900px) { .up-panels { grid-template-columns: 1fr; } }

.up-panel {
  background: var(--surface-card, #fff);
  border: 1px solid var(--surface-border, #e5e7eb);
  border-radius: 14px;
  overflow: hidden;
}

.up-panel__header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--surface-border, #f3f4f6);
}

.up-panel__icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #059669;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  i { font-size: 0.9rem; }
}

.up-panel__icon--blue { background: #eff6ff; color: #3b82f6; }

.up-panel__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-color, #111827);
}

.up-panel__hint {
  margin-left: auto;
  font-size: 0.72rem;
  color: #9ca3af;
}

.up-panel__body { padding: 1rem; }

/* FileUpload action row */
.fu-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
}

/* FileUpload empty zone */
.fu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  gap: 0.35rem;
}

.fu-empty__icon {
  font-size: 2.5rem;
  color: #a7f3d0;
  margin-bottom: 0.25rem;
}

.fu-empty__text {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color, #374151);
}

.fu-empty__hint {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* ── DataTable panel ─────────────────────────────────────────────────────── */
.up-table-panel {
  background: var(--surface-card, #fff);
  border: 1px solid var(--surface-border, #e5e7eb);
  border-radius: 14px;
  overflow: hidden;
}

/* Override PrimeVue DataTable inside our panel */
.up-table-panel :deep(.p-datatable-header) {
  background: transparent;
  border: none;
  padding: 1rem 1.25rem 0.75rem;
}

.up-table-panel :deep(.p-datatable-thead > tr > th) {
  background: var(--surface-ground, #f9fafb);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-color-secondary, #6b7280);
  padding: 0.65rem 1rem;
}

.up-table-panel :deep(.p-datatable-tbody > tr > td) {
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
}

.up-table-panel :deep(.p-datatable-tbody > tr:hover) {
  background: #f0fdf4 !important;
}

.up-table-panel :deep(.p-paginator) {
  border-top: 1px solid var(--surface-border, #e5e7eb);
  background: transparent;
  padding: 0.65rem 1rem;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import apiClient from "../../services/apiService";
import { useRouter } from "vue-router";
import MiniMonitoringView from "./MiniMonitoringView.vue";

import { formatTanggal } from "../../utils/dateHelper.js";

const getUploadStatusSeverity = (status) => {
  return status === "INVALID" ? "danger" : "success";
};

const getUploadStatusLabel = (status) => {
  return status === "INVALID" ? "Invalid" : "Sukses";
};

const getSendStatusSeverity = (rowData) => {
  const status = rowData.status;
  const routerStatus = rowData.routerStatus;

  if (status === "INVALID") return "danger";
  if (status === "UPLOADED") return "secondary";
  if (status === "SENDING") return "info";
  if (status === "FAILED") return "danger";

  // status is SENT
  if (routerStatus === "SUCCESS") return "success";
  if (routerStatus === "FAILED") return "danger";
  if (routerStatus === "SENDING") return "warning";

  return "info"; // SENT to router but not yet processed
};

const getSendStatusLabel = (rowData) => {
  const status = rowData.status;
  const routerStatus = rowData.routerStatus;

  if (status === "INVALID") return "Invalid";
  if (status === "UPLOADED") return "Belum Dikirim";
  if (status === "SENDING") return "Mengirim ke Router";
  if (status === "FAILED") return "Gagal ke Router";

  // status is SENT
  if (routerStatus === "SUCCESS") return "Terkirim ke SatuSehat";
  if (routerStatus === "FAILED") return "Gagal ke SatuSehat";
  if (routerStatus === "SENDING") return "Router Memproses";

  return "Terkirim ke Router";
};

onMounted(() => {
  fetchData();

  fetchScpStatus();
  const interval = setInterval(fetchScpStatus, 5000);
});

const checkServiceRequest = async (rowData) => {
  if (!rowData.accessionNumber) {
    toast.add({
      severity: "warn",
      summary: "Peringatan",
      detail: "Accession Number tidak tersedia",
      life: 3000,
    });
    return;
  }

  srResult.value = null;
  srLoading.value = true;
  srDialog.value = true;
  rowData._checkingSR = true;

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      srDialog.value = false;
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.get("/satusehat/service-request", {
      params: { accessionNumber: rowData.accessionNumber },
    });

    srResult.value = response.data;
  } catch (error) {
    console.error("Error checking ServiceRequest:", error);
    srResult.value = {
      found: false,
      error: true,
      accessionNumber: rowData.accessionNumber,
      message:
        error.response?.data?.message ||
        "Gagal mengecek ServiceRequest ke SatuSehat",
    };
  } finally {
    srLoading.value = false;
    rowData._checkingSR = false;
  }
};

const data = ref([]);
const toast = useToast();
const scpStatus = ref({
  enabled: false,
  running: false,
  aeTitle: "",
  port: 0,
  activeConnections: 0,
});
const dt = ref();
const fileUpload = ref(null);
const folderInput = ref(null);
const createDialog = ref(false);
const editDialog = ref(false);
const deleteDataDialog = ref(false);
const srDialog = ref(false);
const srResult = ref(null);
const srLoading = ref(false);
const pasien = ref({});
const selectedPasiens = ref();
const submitted = ref(false);
const router = useRouter();

const uploadProgressDialog = ref(false);
const isUploading = ref(false);
const uploadProgressValue = ref(0);
const uploadProgressText = ref("");
const uploadStatuses = ref([]);

// Folder upload state
const folderConfirmDialog = ref(false);
const folderDicomFiles = ref([]);
const folderScanResult = ref({
  folderName: "",
  totalScanned: 0,
  dicomCount: 0,
  skippedCount: 0,
  previewFiles: [],
});

const closeUploadProgressDialog = () => {
  uploadProgressDialog.value = false;
  uploadStatuses.value = [];
};

// ---- Folder Upload Functions ----

const triggerFolderInput = () => {
  if (folderInput.value) {
    folderInput.value.value = ""; // Reset agar bisa pilih folder yang sama
    folderInput.value.click();
  }
};

/**
 * Cek apakah sebuah file kemungkinan adalah file DICOM.
 * DICOM biasanya berekstensi .dcm, tapi kadang juga tanpa ekstensi.
 * Kita filter berdasarkan ekstensi .dcm dan juga file tanpa ekstensi
 * (karena banyak mesin DICOM menghasilkan file tanpa ekstensi).
 */
const isDicomFile = (file) => {
  const name = file.name.toLowerCase();
  // File dengan ekstensi .dcm
  if (name.endsWith(".dcm")) return true;
  // File DICOMDIR
  if (name === "dicomdir") return true;
  return false;
};

const onFolderSelected = (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  // Ambil nama folder utama dari path file pertama
  const firstPath = files[0].webkitRelativePath || "";
  const folderName = firstPath.split("/")[0] || "Folder";

  // Filter hanya file DICOM
  const dicomFiles = [];
  const allFiles = Array.from(files);

  for (const file of allFiles) {
    if (isDicomFile(file)) {
      dicomFiles.push(file);
    }
  }

  // Simpan file DICOM untuk diupload nanti
  folderDicomFiles.value = dicomFiles;

  // Siapkan preview (max 10 file)
  const previewFiles = dicomFiles.slice(0, 10).map((f) => ({
    name: f.name,
    path: f.webkitRelativePath || f.name,
    size: f.size,
  }));

  folderScanResult.value = {
    folderName,
    totalScanned: allFiles.length,
    dicomCount: dicomFiles.length,
    skippedCount: allFiles.length - dicomFiles.length,
    previewFiles,
  };

  folderConfirmDialog.value = true;
};

const uploadFolderFiles = async () => {
  const files = folderDicomFiles.value;
  if (!files || files.length === 0) return;

  folderConfirmDialog.value = false;

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  uploadProgressDialog.value = true;
  isUploading.value = true;
  uploadProgressValue.value = 0;
  uploadProgressText.value = `Mengupload 0 dari ${files.length} file DICOM dari folder...`;

  uploadStatuses.value = files.map((f) => ({
    name: f.webkitRelativePath || f.name,
    status: "UPLOADING",
  }));

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      isUploading.value = false;
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.post("/dicom/upload/batch", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        uploadProgressValue.value = percentCompleted;
        if (percentCompleted === 100) {
          uploadProgressText.value = "Memproses file di server...";
        } else {
          uploadProgressText.value = `Mengupload: ${percentCompleted}%`;
        }
      },
    });

    if (response.status === 200 || response.status === 201) {
      const resData = response.data;
      uploadProgressText.value = `Selesai: ${resData.sukses} sukses, ${resData.duplikat} duplikat, ${resData.gagal} gagal.`;

      if (resData.hasil && resData.hasil.length === files.length) {
        resData.hasil.forEach((h, i) => {
          if (h.status === "INVALID" || h.message.startsWith("Gagal")) {
            uploadStatuses.value[i].status = "FAILED";
          } else if (h.message && h.message.startsWith("Duplikat")) {
            uploadStatuses.value[i].status = "DUPLICATE";
            uploadStatuses.value[i].name += " (Duplikat)";
          } else {
            uploadStatuses.value[i].status = "SUCCESS";
          }
        });
      }

      toast.add({
        severity: "success",
        summary: "Upload Folder Selesai",
        detail: `${resData.sukses} sukses, ${resData.duplikat} duplikat, ${resData.gagal} gagal.`,
        life: 5000,
      });

      await fetchData();
    }
  } catch (error) {
    console.error("Error uploading folder files:", error);
    uploadProgressText.value = "Upload gagal";
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        error.response?.data?.message || "Gagal mengupload file dari folder",
      life: 3000,
    });
  } finally {
    isUploading.value = false;
    uploadProgressValue.value = 100;
    folderDicomFiles.value = [];
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const jenisKelaminOptions = [
  { label: "Laki-laki", value: "L" },
  { label: "Perempuan", value: "P" },
];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const openNew = () => {
  pasien.value = {
    nama: "",
    nik: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: null,
    alamat: "",
    no_telepon: "",
  };
  submitted.value = false;
  createDialog.value = true;
};

const openEdit = () => {
  if (selectedPasiens.value && selectedPasiens.value.length === 1) {
    pasien.value = { ...selectedPasiens.value[0] };
    submitted.value = false;
    editDialog.value = true;
  } else {
    toast.add({
      severity: "warn",
      summary: "Peringatan",
      detail: "Pilih satu data untuk diedit",
      life: 3000,
    });
  }
};

const hideDialog = () => {
  createDialog.value = false;
  editDialog.value = false;
  submitted.value = false;
};

const fetchData = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      store.commit("logout");
      console.error("AccessToken tidak tersedia");
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.get("/dicom");
    data.value = response.data.data;
  } catch (error) {
    console.log("Error Fetch Data", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal mengambil data",
      life: 3000,
    });
  }
};

const uploadDicom = async (event) => {
  const files = event.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  uploadProgressDialog.value = true;
  isUploading.value = true;
  uploadProgressValue.value = 0;
  uploadProgressText.value = `Mengupload 0 dari ${files.length} file...`;

  uploadStatuses.value = Array.from(files).map((f) => ({
    name: f.name,
    status: "UPLOADING",
  }));

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      isUploading.value = false;
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.post("/dicom/upload/batch", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        uploadProgressValue.value = percentCompleted;
        if (percentCompleted === 100) {
          uploadProgressText.value = "Memproses file di server...";
        } else {
          uploadProgressText.value = `Mengupload: ${percentCompleted}%`;
        }
      },
    });

    if (response.status === 200 || response.status === 201) {
      const resData = response.data;
      uploadProgressText.value = `Selesai: ${resData.sukses} sukses, ${resData.duplikat} duplikat, ${resData.gagal} gagal.`;

      if (resData.hasil && resData.hasil.length === files.length) {
        resData.hasil.forEach((h, i) => {
          if (h.status === "INVALID" || h.message.startsWith("Gagal")) {
            uploadStatuses.value[i].status = "FAILED";
          } else if (h.message && h.message.startsWith("Duplikat")) {
            uploadStatuses.value[i].status = "DUPLICATE";
            uploadStatuses.value[i].name += " (Duplikat)";
          } else {
            uploadStatuses.value[i].status = "SUCCESS";
          }
        });
      }

      toast.add({
        severity: "success",
        summary: "Upload Selesai",
        detail: `${resData.sukses} sukses, ${resData.duplikat} duplikat, ${resData.gagal} gagal.`,
        life: 5000,
      });

      await fetchData();

      if (fileUpload.value) {
        fileUpload.value.clear();
      }
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    uploadProgressText.value = "Upload gagal";
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || "Gagal mengupload file",
      life: 3000,
    });
  } finally {
    isUploading.value = false;
    uploadProgressValue.value = 100;
  }
};

const sendSelectedDicom = async () => {
  if (!selectedPasiens.value || !selectedPasiens.value.length) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Pilih file DICOM terlebih dahulu",
      life: 3000,
    });
    return;
  }

  const ids = selectedPasiens.value.map((item) => item.id);

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      return;
    }

    toast.add({
      severity: "info",
      summary: "Info",
      detail: `Mengirim ${ids.length} file ke router...`,
      life: 3000,
    });

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.post("/dicom/send/batch", ids);

    if (response.status === 200 || response.status === 201) {
      const resData = response.data;
      toast.add({
        severity: "success",
        summary: "Kirim Selesai",
        detail: `${resData.sukses} sukses dikirim ke router, ${resData.gagal} gagal.`,
        life: 5000,
      });
    }

    selectedPasiens.value = [];
    await fetchData();
  } catch (error) {
    console.error("Error sending selected DICOMs:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || "Gagal mengirim file terpilih",
      life: 3000,
    });
    await fetchData();
  }
};

const create = async () => {
  submitted.value = true;

  if (!pasien.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Nama dan NIK wajib diisi",
      life: 3000,
    });
    return;
  }
  const payload = {
    nama: data.value.nama,
    nik: data.value.nik,
    jenis_kelamin: data.value.jenis_kelamin,
    tempat_lahir: data.value.tempat_lahir,
    tanggal_lahir: data.value.tanggal_lahir,
    alamat: data.value.alamat,
    no_telepon: data.value.no_telepon,
  };

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.post("/pasien", payload);

    if (response.status === 201) {
      createDialog.value = false;
      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Data Berhasil Disimpan",
        life: 3000,
      });
      fetchData();
    }
  } catch (error) {
    console.error("Error creating data:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || "Gagal menyimpan data",
      life: 3000,
    });
  }
};

const sendDicom = async (rowData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.post(`/dicom/${rowData.id}/send`);

    if (response.status === 200 || response.status === 201) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "File berhasil dikirim ke router dan sedang diproses",
        life: 3000,
      });
    }

    await fetchData();
  } catch (error) {
    console.error("Error sending file:", error);
    toast.add({
      severity: "error",
      summary: "Gagal Mengirim DICOM",
      detail: responseMessage(error, "Gagal mengirim file"),
      life: 6000,
    });
    await fetchData();
  }
};

/**
 * Kondisi retry: gagal kirim ke router (status FAILED)
 * atau sudah sampai router tapi gagal diteruskan ke SatuSehat (routerStatus FAILED)
 */
const isRetryable = (rowData) => {
  return (
    rowData.status === "FAILED" ||
    (rowData.status === "SENT" && rowData.routerStatus === "FAILED")
  );
};

const retryDicom = async (rowData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      return;
    }

    // Tandai baris sedang retry (loading indicator)
    rowData._retrying = true;

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.post(`/dicom/${rowData.id}/retry`);

    // Response contains the upload object (may be returned with 200 or error status)
    const uploadResult = response.data;

    if (uploadResult) {
      // Jika routerStatus FAILED atau status FAILED, tampilkan detail payload
      if (
        uploadResult.routerStatus === "FAILED" ||
        uploadResult.status === "FAILED"
      ) {
        // Tampilkan singkat: hanya routerStatus
        const detailText = `routerStatus: ${uploadResult.routerStatus || uploadResult.status}`;
        toast.add({
          severity: "error",
          summary: "Gagal Kirim Ulang Cek log.",
          detail: detailText,
          life: 8000,
        });
      } else {
        toast.add({
          severity: "success",
          summary: "Berhasil",
          detail: "Pengiriman ulang berhasil dimulai",
          life: 3000,
        });
      }
    } else {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Pengiriman ulang berhasil dimulai",
        life: 3000,
      });
    }

    await fetchData();
  } catch (error) {
    console.error("Error retrying DICOM:", error);
    // Jika backend mengembalikan body (mis. upload object) pada error (502), tampilkan juga payloadnya
    const respData = error.response?.data;
    let detailMsg = responseMessage(error, "Gagal melakukan kirim ulang DICOM");
    if (respData) {
      try {
        if (typeof respData === "object" && respData.routerStatus) {
          detailMsg = `routerStatus: ${respData.routerStatus}`;
        } else {
          detailMsg =
            typeof respData === "string"
              ? respData
              : respData.message || respData.pesan || JSON.stringify(respData);
        }
      } catch (e) {
        detailMsg = JSON.stringify(respData);
      }
    }

    toast.add({
      severity: "error",
      summary: "Gagal Kirim Ulang",
      detail: detailMsg,
      life: 8000,
    });
    await fetchData();
    rowData._retrying = false;
  }
};

function responseMessage(error, fallback) {
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  // Jika data adalah objek, coba tampilkan message/pesan atau seluruh objek sebagai JSON
  if (data && typeof data === "object") {
    return data.message || data.pesan || JSON.stringify(data);
  }
  return error.message || fallback;
}

const update = async () => {
  submitted.value = true;

  if (!pasien.value.nama || !pasien.value.nik) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Nama dan NIK wajib diisi",
      life: 3000,
    });
    return;
  }

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    const response = await apiClient.put(
      `/pasien/${pasien.value.id}`,
      pasien.value,
    );

    if (response.status === 200) {
      editDialog.value = false;
      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Data Berhasil Diperbarui",
        life: 3000,
      });
      fetchData();
    }
  } catch (error) {
    console.error("Error updating data:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || "Gagal memperbarui data",
      life: 3000,
    });
  }
};

const deleteSelectedData = async () => {
  if (!selectedPasiens.value || !selectedPasiens.value.length) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "No items selected",
      life: 3000,
    });
    return;
  }

  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "AccessToken tidak tersedia",
        life: 3000,
      });
      return;
    }

    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;

    for (let data of selectedPasiens.value) {
      const response = await apiClient.delete(`/pasien/${data.id}`);
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: response.data.pesan || "Data berhasil dihapus",
        life: 3000,
      });
    }
    data.value = data.value.filter(
      (val) => !selectedPasiens.value.includes(val),
    );
    selectedPasiens.value = null;
    deleteDataDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Data Dihapus",
      life: 3000,
    });

    fetchData();
  } catch (error) {
    console.error("Error deleting data:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        error.response?.data?.pesan ||
        error.response?.data?.message ||
        `Gagal hapus data ${data.id}`,
      life: 3000,
    });
  }
};

const fetchScpStatus = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${accessToken}`;
      const response = await apiClient.get("/dicom/scp/status");
      scpStatus.value = response.data;
    }
  } catch (error) {
    console.error("Gagal mengambil status SCP", error);
  }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
  deleteDataDialog.value = true;
};

const viewDetails = (data) => {
  router.push(`/master/pasien/${data.id}`);
};
</script>
