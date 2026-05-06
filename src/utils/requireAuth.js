// src/utils/requireAuth.js (atau lokasi lainnya)
export function requireAuth(to, from, next) {
    const token = localStorage.getItem("accessToken"); // Ambil token dari localStorage

    if (!token) {
        return next({ name: "login" }); // Arahkan ke halaman login jika token tidak ada
    }

    next(); // Lanjutkan ke halaman tujuan jika token ada
}
