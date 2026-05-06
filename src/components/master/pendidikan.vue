<template>
    <div class="content-tabel">
        <div class="card">
            <Toast />

            <!-- Button -->
            <Toolbar class="mb-2">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" class="mr-2"
                        @click="confirmDeleteSelected"
                        :disabled="!selectedPendidikans || !selectedPendidikans.length" />
                    <Button label="Update" icon="pi pi-pencil" severity="info" @click="openEdit"
                        :disabled="!selectedPendidikans || !selectedPendidikans.length" />
                </template>

                <!-- Export -->
                <template #end>
                    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import"
                        class="mr-2 inline-block" />
                    <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable ref="dt" :value="data" v-model:selection="selectedPendidikans" dataKey="id" :paginator="true"
                :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} Data">
                <template #header>
                    <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                        <h3 class="m-0" style="padding-right: 550px;">Data Master Pendidikan</h3>
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>

                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="code" header="Code" sortable style="min-width:12rem"></Column>
                <Column field="nama" header="Pendidikan" sortable style="min-width:16rem"></Column>
                <Column header="Status Aktif" sortable style="min-width:12rem">
                    <template #body="{ data }">
                        <span :class="data.is_active ? 'text-green-500' : 'text-red-500'">
                            {{ data.is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </template>
                </Column>

            </DataTable>
        </div>


        <!-- create data -->
        <Dialog v-model:visible="createDialog" :style="{ width: '450px' }" header="Tambah Pendidikan" :modal="true"
            class="p-fluid">
            <img v-if="pendidikan.image"
                :src="`https://primefaces.org/cdn/primevue/images/pendidikan/${pendidikan.image}`"
                :alt="pendidikan.image" class="block m-auto pb-3" />
            <div class="field">
                <label for="nama">Pendidikan</label>
                <InputText id="nama" v-model.trim="data.nama" required="true" autofocus
                    :invalid="submitted && !data.nama" />
                <small class="p-error" v-if="submitted && !data.nama">Pendidikan is required.</small>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" text @click="create" />
            </template>
        </Dialog>


        <!-- Edit data -->
        <Dialog v-model:visible="editDialog" :style="{ width: '450px' }" header="Edit Data Pendidikan" :modal="true"
            class="p-fluid">
            <img v-if="pendidikan.image"
                :src="`https://primefaces.org/cdn/primevue/images/pendidikan/${pendidikan.image}`"
                :alt="pendidikan.image" class="block m-auto pb-3" />
            <div class="field">
                <label for="nama">Pendidikan</label>
                <InputText id="nama" v-model.trim="pendidikan.nama" required="true" autofocus
                    :invalid="submitted && !pendidikan.nama" />
                <small class="p-error" v-if="submitted && !pendidikan.nama">Pendidikan is required.</small>
            </div>

            <div class="field">
                <label for="is_active">Status Aktif</label>
                <Dropdown :options="[{ label: 'Aktif', value: true }, { label: 'Tidak Aktif', value: false }]"
                    v-if="pendidikan.value" v-model="pendidikan.value.is_active" optionLabel="label"
                    placeholder="Pilih Status" />
            </div>


            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Update" icon="pi pi-check" text @click="update" />
                <!-- <Button :label="pendidikan.value.id ? 'Update' : 'Save'" icon="pi pi-check" text @click="update" /> -->
            </template>
        </Dialog>


        <Dialog v-model:visible="deleteDataDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="pendidikan">Apakah anda yakin akan menghapus data ini ?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteDataDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedData" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import apiClient from '../../services/apiService';
import "../style.css"

onMounted(() => {
    fetchData();
    // fetchPendidikan();
});

const data = ref([]);
const pendidikanOptions = ref([]);

const toast = useToast();
const dt = ref();
const pendidikans = ref();
const createDialog = ref(false);
const editDialog = ref(false);
const deleteData = ref(false);
const deleteDataDialog = ref(false);
const pendidikan = ref({});



const selectedPendidikans = ref();
const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

const openNew = () => {
    pendidikan.value = {
        nama: '',
        is_active: true
    };
    submitted.value = false;
    createDialog.value = true;
};

const openEdit = () => {
    if (selectedPendidikans.value && selectedPendidikans.value.length === 1) {
        pendidikan.value = { ...selectedPendidikans.value[0] };
        pendidikan.value.is_active = pendidikan.value.is_active ?? true; // Set default jika undefined
        submitted.value = false;
        editDialog.value = true;
    } else {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Pilih satu data untuk diedit', life: 3000 });
    }
};


const hideDialog = () => {
    createDialog.value = false;
    editDialog.value = false;
    submitted.value = false;
};


const deletePendidikan = () => {
    pendidikans.value = pendidikans.value.filter(val => val.id !== pendidikan.value.id);
    deleteData.value = false;
    pendidikan.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
};
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < pendidikans.value.length; i++) {
        if (pendidikans.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
};

const createId = () => {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteDataDialog.value = true;
};

const fetchData = async () => {
    try {
        // Ambil accessToken dari local storage atau state aplikasi
        const accessToken = localStorage.getItem("accessToken");
        // Sesuaikan dengan cara Anda menyimpan token

        // Pastikan accessToken telah disetel sebelum melakukan permintaan
        if (!accessToken) {
            store.commit("logout");
            console.error("AccessToken tidak tersedia");
            return;
        }

        // Set header Authorization dengan accessToken
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        const response = await apiClient.get('/pendidikan');
        data.value = response.data.data.pendidikan;
        console.log(data.value);
    } catch (error) {
        console.log('Error Fetch Data', error);
    }
};

const create = async () => {
    createDialog.value = false;  // Menutup dialog setelah pengiriman data
    try {
        const payload = {
            "nama": data.value.nama,
            "is_active": data.value.is_active
        };

        if (!data.value.nama) {
            alert('Nama pendidikan tidak boleh kosong!');
            return;
        }

        // Tambahkan Bearer token
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert('AccessToken tidak tersedia. Silakan login ulang.');
            return;
        }
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // console.log('Payload yang akan dikirim:', payload);

        // Kirim POST request
        const response = await apiClient.post('/pendidikan', payload);

        if (response.status === 201) {
            data.value.push(response.data);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Berhasil Disimpan', life: 3000 });

            fetchData();  // Refresh data
            console.log('Pendidikan berhasil disimpan:', response.data);
        } else {
            console.log('Gagal menyimpan pendidikan:', response.data);
            alert('Gagal menyimpan pendidikan.');
        }
    } catch (error) {
        if (error.response) {
            console.error('Response error:', error.response.data);
            alert(`Terjadi kesalahan: ${error.response.data.message || 'Periksa data yang dikirim.'}`);
        } else {
            console.error('Terjadi kesalahan:', error.message);
            toast.add({ severity: 'warn', summary: 'Error', detail: 'Gagal menyimpan data', life: 3000 });

        }
    }
};

const update = async () => {
    submitted.value = true;

    if (!pendidikan.value.nama) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Nama pendidikan wajib diisi.', life: 3000 });
        return;
    }

    try {
        const payload = {
            "nama": pendidikan.value.nama,
            "is_active": pendidikan.value.is_active
        };

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert('AccessToken tidak tersedia. Silakan login ulang.');
            return;
        }
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        const response = await apiClient.put(`/pendidikan/${pendidikan.value.id}`, payload);

        if (response.status === 200) {
            const index = data.value.findIndex(item => item.id === pendidikan.value.id);
            if (index !== -1) {
                data.value[index] = response.data;
            }
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Berhasil Diperbarui', life: 3000 });
            editDialog.value = false;
            fetchData(); // Refresh data untuk memastikan sinkronisasi
        } else {
            toast.add({ severity: 'warn', summary: 'Warning', detail: 'Gagal memperbarui data', life: 3000 });
        }
    } catch (error) {
        if (error.response) {
            toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message || 'Kesalahan saat memperbarui data.', life: 3000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi kesalahan saat memperbarui data.', life: 3000 });
        }
        console.error('Error updating data:', error);
    }
};


const deleteSelectedData = async () => {
    if (!selectedPendidikans.value || !selectedPendidikans.value.length) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'No items selected', life: 3000 });
        return;
    }

    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert('AccessToken tidak tersedia. Silakan login ulang.');
            return;
        }
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // Loop atau batch delete request untuk setiap item terpilih
        for (let data of selectedPendidikans.value) {
            await apiClient.delete(`/pendidikan/${data.id}`);
        }

        // Perbarui daftar produk setelah berhasil menghapus
        data.value = data.value.filter(val => !selectedPendidikans.value.includes(val));
        selectedPendidikans.value = null;
        deleteDataDialog.value = false;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Dihapus', life: 3000 });

        fetchData(); // Refresh data dari server untuk memastikan sinkronisasi
    } catch (error) {
        console.error('Error deleting selected products:', error);
        alert('Gagal menghapus produk. Silakan coba lagi.');
    }
};



</script>