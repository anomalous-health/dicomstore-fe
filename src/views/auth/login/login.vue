<script>
import apiClient from "../../../services/apiService";
// import "../../../assets/form.css";
import "../login/login.scss";

export default {
    data() {
        return {
            username: "",
            password: "",
            loading: false,
        };
    },
    methods: {
        async login() {
            if (!this.username || !this.password) {
                this.$toast.add({
                    severity: "warn",
                    summary: "Login belum lengkap",
                    detail: "Username dan password wajib diisi.",
                    life: 3000,
                });
                return;
            }

            try {
                this.loading = true;
                const response = await apiClient.post('/auth/login', {
                    username: this.username,
                    password: this.password,
                },);
                // console.log(response.data.data.accessToken);

                if (response.status === 200) {
                    // Login berhasil
                    const token = response.data.token;
                    // Simpan token akses di localStorage
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('token', token);
                    this.$router.push({ path: '/home' });
                    // Redirect ke halaman yang sesuai
                } else {
                    // Tangani situasi lain jika diperlukan
                    this.$toast.add({
                        severity: "error",
                        summary: "Login gagal",
                        detail: "Username atau password salah.",
                        life: 3000,
                    });
                }

            } catch (error) {
                // Tangani kesalahan jika terjadi
                console.error("Terjadi kesalahan saat login:", error);
                const message = error.response?.data?.message || "Username atau password salah.";
                this.$toast.add({
                    severity: "error",
                    summary: "Login gagal",
                    detail: message,
                    life: 3500,
                });
            } finally {
                this.loading = false;
            }
        },
    },


};
</script>

<template>
    <div class="container">
        <Toast />
        <div class="login-wrapper">
            <div class="container-login">
                <div class="card">
                    <div class="flex flex-column md:flex-row">
                        <div class="w-full md:w-5 flex flex-column ">

                            <div class="gambar-side" />

                        </div>
                        <div class="w-full md:w-2">
                            <Divider layout="vertical" class="hidden md:flex"></Divider>
                        </div>

                        <div class="login-side">
                            <h2 style="text-align: center;">Login</h2>
                            <div class="flex flex-column align-items-center justify-content-center gap-5 py-2" style="">
                                <div
                                    class="p-float-label p-input-icon-left flex flex-wrap justify-content-center align-items-center gap-2">
                                    <label class="w-5rem">Username</label>
                                    <InputText v-model="username" id="username" type="text" class="w-12rem" />
                                </div>

                                <div
                                    class="p-float-label p-input-icon-left flex flex-wrap justify-content-center align-items-center gap-2">
                                    <label class="w-5rem">Password</label>
                                    <InputText v-model="password" id="password" type="password" class="w-12rem"
                                        @keyup.enter="login" />
                                </div>
                                <div>
                                    <Button label="Login" @click="login()" icon="pi pi-user" class="w-10rem" :loading="loading"></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style></style>
