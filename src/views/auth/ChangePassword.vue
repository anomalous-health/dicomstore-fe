<template>
  <div class="change-password-container">
    <Card class="change-password-card">
      <template #title>Ubah Password</template>
      <template #content>
        <form @submit.prevent="changePassword">
          <div class="p-field">
            <label for="oldPassword">Password Lama</label>
            <Password
              id="oldPassword"
              v-model="form.oldPassword"
              placeholder="Masukkan password lama"
              :feedback="false"
              :toggleMask="true"
              required
            />
          </div>
          <div class="p-field">
            <label for="newPassword">Password Baru</label>
            <Password
              id="newPassword"
              v-model="form.newPassword"
              placeholder="Masukkan password baru"
              :feedback="false"
              :toggleMask="true"
              required
            />
          </div>
          <div class="p-field">
            <label for="confirmPassword">Konfirmasi Password Baru</label>
            <Password
              id="confirmPassword"
              v-model="form.confirmPassword"
              placeholder="Konfirmasi password baru"
              :feedback="false"
              :toggleMask="true"
              required
            />
          </div>
          <Button type="submit" label="Ubah Password" :loading="loading" />
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import apiClient from '../../services/apiService';

const toast = useToast();

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(false);

const changePassword = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Password baru dan konfirmasi tidak cocok', life: 3000 });
    return;
  }

  loading.value = true;
  try {
    const accessToken = localStorage.getItem('accessToken');
    await apiClient.post('/auth/change-password', {
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Password berhasil diubah', life: 3000 });
    form.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Gagal mengubah password', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.change-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
}

.change-password-card {
  width: 400px;
}

.p-field {
  margin-bottom: 1.5rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
</style>