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
    <div class="login-page">
        <Toast />

        <!-- Kiri: Emerald-700 branding -->
        <div class="panel-brand">
            <div class="brand-top-bar">
                <img src="/logo-medicverse.svg" class="brand-logo-img" alt="MedicVerse" />
                <img src="/satusehat.svg" class="brand-logo-img satusehat" alt="SatuSehat" />
            </div>
            <div class="brand-center">
                <h1 class="brand-tagline">Sistem Monitoring DICOM Router<br>Terintegrasi dengan SatuSehat</h1>
            </div>

            <!-- Radiology scanner -->
            <div class="radio-scan">
                <!-- Rings -->
                <div class="scan-ring r1" />
                <div class="scan-ring r2" />
                <div class="scan-ring r3" />

                <!-- Crosshair -->
                <div class="scan-cross ch-h" />
                <div class="scan-cross ch-v" />

                <!-- Corner brackets -->
                <div class="scan-bracket br-tl" />
                <div class="scan-bracket br-tr" />
                <div class="scan-bracket br-bl" />
                <div class="scan-bracket br-br" />

                <!-- Sweep beams -->
                <div class="scan-sweep" />
                <div class="scan-sweep sweep-counter" />

                <!-- Orbit dots on r2 -->
                <div class="orbit-wrap ow-1"><div class="orbit-dot" /></div>
                <div class="orbit-wrap ow-2"><div class="orbit-dot" /></div>
                <div class="orbit-wrap ow-3"><div class="orbit-dot" /></div>

                <!-- Cardinal blips on r1 -->
                <div class="scan-blip blip-n" />
                <div class="scan-blip blip-e" />
                <div class="scan-blip blip-s" />
                <div class="scan-blip blip-w" />

                <!-- Core -->
                <div class="scan-core" />
            </div>

            <!-- EKG line -->
            <div class="ekg-wrapper">
                <svg class="ekg-svg" viewBox="0 0 800 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- 2 identical cycles for seamless scroll -->
                    <polyline class="ekg-path" points="
                        0,40   30,40  40,34  50,28  60,34  70,40  85,40
                        88,22  92,5   96,62  100,40
                        110,40 125,34 140,24 155,34 170,40
                        200,40 230,40 240,34 250,28 260,34 270,40 285,40
                        288,22 292,5  296,62 300,40
                        310,40 325,34 340,24 355,34 370,40
                        400,40 430,40 440,34 450,28 460,34 470,40 485,40
                        488,22 492,5  496,62 500,40
                        510,40 525,34 540,24 555,34 570,40
                        600,40 630,40 640,34 650,28 660,34 670,40 685,40
                        688,22 692,5  696,62 700,40
                        710,40 725,34 740,24 755,34 770,40
                        800,40
                    " />
                </svg>
            </div>
        </div>

        <!-- Kanan: Form putih -->
        <div class="panel-form">
            <div class="form-inner">
                <img src="/assets/logo.png" class="form-logo" alt="Logo" />

                <p class="form-subtitle">Masukkan username dan password akun Anda untuk masuk ke dalam aplikasi</p>

                <div class="form-fields">
                    <div class="field-group">
                        <label for="username">Username <span class="required">*</span></label>
                        <InputText v-model="username" id="username" type="text" placeholder="Masukkan username Anda" />
                    </div>
                    <div class="field-group">
                        <label for="password">Password <span class="required">*</span></label>
                        <InputText v-model="password" id="password" type="password" placeholder="Masukkan password Anda" @keyup.enter="login" />
                    </div>
                    <Button label="Masuk →" @click="login()" :loading="loading" class="login-btn" />
                </div>
            </div>
            <div class="deco-circles" />
        </div>

    </div>
</template>

<style></style>
