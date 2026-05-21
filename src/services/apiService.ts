
// src/services/apiService.js
import axios from "axios";
import router from "../router";

  const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 15000
});
  
apiClient.interceptors.request.use(
  (config) => {
    //menambah token ke header request jika ada
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request config: ", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      router.push("/login");
    }
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
