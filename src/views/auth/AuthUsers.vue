<template>
  <div class="auth-users-page">
    <Toast />
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengguna</h1>
        <p class="page-subtitle">Kelola akun login, role akses, dan password.</p>
      </div>
      <Button icon="pi pi-refresh" label="Muat Ulang" @click="loadUsers" :loading="loading" />
    </div>

    <TabView>
      <TabPanel header="Daftar User">
        <div class="content-panel">
          <div class="table-toolbar">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="search" placeholder="Cari nama, email, role" @keyup.enter="loadUsers" />
            </span>
            <Button icon="pi pi-plus" label="Register User" @click="openCreate" />
          </div>

          <DataTable :value="users" :loading="loading" :paginator="true" :rows="10" dataKey="id" responsiveLayout="scroll">
            <Column field="name" header="Nama" sortable />
            <Column field="email" header="Email" sortable />
            <Column header="Role">
              <template #body="{ data }">
                <Tag :severity="roleSeverity(data.role)" :value="roleLabel(data.role)" />
              </template>
            </Column>
            <Column field="created_at" header="Dibuat" sortable>
              <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
            </Column>
            <Column header="Aksi" style="width: 9rem">
              <template #body="{ data }">
                <Button icon="pi pi-pencil" rounded text @click="openEdit(data)" />
                <Button icon="pi pi-trash" rounded text severity="danger" @click="removeUser(data)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </TabPanel>

      <TabPanel header="Register User">
        <div class="content-panel form-shell">
          <div class="form-grid">
            <div class="form-field">
              <label>Nama</label>
              <InputText v-model="registerForm.name" />
            </div>
            <div class="form-field">
              <label>Email</label>
              <InputText v-model="registerForm.email" type="email" />
            </div>
            <div class="form-field">
              <label>Role</label>
              <Dropdown v-model="registerForm.role" :options="roleOptions" optionLabel="label" optionValue="value" />
            </div>
            <div class="form-field">
              <label>Password</label>
              <Password v-model="registerForm.password" toggleMask :feedback="false" />
            </div>
            <div class="form-field">
              <label>Konfirmasi Password</label>
              <Password v-model="registerForm.password_confirmation" toggleMask :feedback="false" />
            </div>
          </div>
          <div class="form-actions">
            <Button icon="pi pi-save" label="Simpan User" @click="registerUser" :loading="saving" />
          </div>
        </div>
      </TabPanel>

      <TabPanel header="Ganti Password">
        <div class="content-panel form-shell">
          <div class="form-grid">
            <div class="form-field full">
              <label>Password Lama</label>
              <Password v-model="passwordForm.current_password" toggleMask :feedback="false" />
            </div>
            <div class="form-field">
              <label>Password Baru</label>
              <Password v-model="passwordForm.password" toggleMask />
            </div>
            <div class="form-field">
              <label>Konfirmasi Password Baru</label>
              <Password v-model="passwordForm.password_confirmation" toggleMask :feedback="false" />
            </div>
          </div>
          <div class="form-actions">
            <Button icon="pi pi-key" label="Ganti Password" severity="warning" @click="changePassword" :loading="savingPassword" />
          </div>
        </div>
      </TabPanel>
    </TabView>

    <Dialog v-model:visible="dialogVisible" :header="editForm.id ? 'Edit User' : 'Register User'" modal :style="{ width: '42rem' }">
      <div class="form-grid">
        <div class="form-field">
          <label>Nama</label>
          <InputText v-model="editForm.name" />
        </div>
        <div class="form-field">
          <label>Email</label>
          <InputText v-model="editForm.email" type="email" />
        </div>
        <div class="form-field">
          <label>Role</label>
          <Dropdown v-model="editForm.role" :options="roleOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="form-field">
          <label>Password Baru</label>
          <Password v-model="editForm.password" toggleMask :feedback="false" placeholder="Opsional" />
        </div>
        <div class="form-field">
          <label>Konfirmasi Password</label>
          <Password v-model="editForm.password_confirmation" toggleMask :feedback="false" placeholder="Opsional" />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text @click="dialogVisible = false" />
        <Button label="Simpan" icon="pi pi-save" @click="saveEdit" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import apiClient from "../../services/apiService";
// import "../posyandu/posyandu.css";
import "../../assets/auth.css";


const router = useRouter();
const toast = useToast();
const loading = ref(false);
const saving = ref(false);
const savingPassword = ref(false);
const dialogVisible = ref(false);
const users = ref([]);
const search = ref("");

const roleOptions = [
  { label: "Pendaftaran", value: "pendaftaran" },
  { label: "Dokter", value: "dokter" },
  { label: "Perawat", value: "perawat" },
  { label: "Apoteker", value: "apoteker" },
  { label: "Kader", value: "kader" },
  { label: "Super Admin", value: "superadmin" },
];

const registerForm = reactive({
  name: "",
  email: "",
  role: "kader",
  password: "",
  password_confirmation: "",
});

const editForm = reactive({
  id: null,
  name: "",
  email: "",
  role: "kader",
  password: "",
  password_confirmation: "",
});

const passwordForm = reactive({
  current_password: "",
  password: "",
  password_confirmation: "",
});

function roleLabel(role) {
  return roleOptions.find((item) => item.value === role)?.label || role || "-";
}

function roleSeverity(role) {
  return {
    superadmin: "danger",
    dokter: "info",
    perawat: "success",
    kader: "warning",
    apoteker: "help",
  }[role] || "secondary";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function errorMessage(error, fallback) {
  const errors = error.response?.data?.errors;
  if (errors) {
    return Object.values(errors).flat().join(", ");
  }
  return error.response?.data?.message || error.response?.data?.pesan || fallback;
}

function resetRegisterForm() {
  Object.assign(registerForm, {
    name: "",
    email: "",
    role: "kader",
    password: "",
    password_confirmation: "",
  });
}

async function loadUsers() {
  try {
    loading.value = true;
    const response = await apiClient.get("/users", { params: { search: search.value || undefined } });
    users.value = response.data.data || [];
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: errorMessage(error, "Data user tidak dapat dimuat"), life: 3500 });
  } finally {
    loading.value = false;
  }
}

async function registerUser() {
  try {
    saving.value = true;
    await apiClient.post("/register", registerForm);
    toast.add({ severity: "success", summary: "Berhasil", detail: "User berhasil dibuat", life: 2500 });
    resetRegisterForm();
    loadUsers();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: errorMessage(error, "User belum tersimpan"), life: 4000 });
  } finally {
    saving.value = false;
  }
}

function openCreate() {
  Object.assign(editForm, { id: null, name: "", email: "", role: "kader", password: "", password_confirmation: "" });
  dialogVisible.value = true;
}

function openEdit(user) {
  Object.assign(editForm, { ...user, password: "", password_confirmation: "" });
  dialogVisible.value = true;
}

async function saveEdit() {
  try {
    saving.value = true;
    const payload = { ...editForm };
    if (!payload.password) {
      delete payload.password;
      delete payload.password_confirmation;
    }

    if (editForm.id) {
      await apiClient.put(`/users/${editForm.id}`, payload);
    } else {
      await apiClient.post("/register", payload);
    }

    toast.add({ severity: "success", summary: "Berhasil", detail: "User disimpan", life: 2500 });
    dialogVisible.value = false;
    loadUsers();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: errorMessage(error, "User belum tersimpan"), life: 4000 });
  } finally {
    saving.value = false;
  }
}

async function removeUser(user) {
  if (!confirm(`Hapus user ${user.name}?`)) return;

  try {
    await apiClient.delete(`/users/${user.id}`);
    toast.add({ severity: "success", summary: "Berhasil", detail: "User dihapus", life: 2500 });
    loadUsers();
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: errorMessage(error, "User tidak dapat dihapus"), life: 3500 });
  }
}

async function changePassword() {
  try {
    savingPassword.value = true;
    await apiClient.post("/change-password", passwordForm);
    toast.add({ severity: "success", summary: "Berhasil", detail: "Password diganti. Silakan login kembali.", life: 2500 });
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    setTimeout(() => router.push({ name: "login" }), 800);
  } catch (error) {
    toast.add({ severity: "error", summary: "Gagal", detail: errorMessage(error, "Password belum diganti"), life: 4000 });
  } finally {
    savingPassword.value = false;
  }
}

onMounted(loadUsers);
</script>

<style scoped>
.auth-users-page {
  padding: 1rem;
}

.form-shell {
  max-width: 820px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
