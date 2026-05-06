import apiClient from "../../services/apiService";

export const layananOptions = [
  { label: "Balita", value: "balita" },
  { label: "Ibu Hamil", value: "ibu_hamil" },
  { label: "Lansia", value: "lansia" },
  { label: "Imunisasi", value: "imunisasi" },
  { label: "Umum", value: "umum" },
];

export const visitStatusOptions = [
  { label: "Terdaftar", value: "terdaftar" },
  { label: "Diperiksa", value: "diperiksa" },
  { label: "Selesai", value: "selesai" },
  { label: "Batal", value: "batal" },
];

export const scheduleStatusOptions = [
  { label: "Terjadwal", value: "terjadwal" },
  { label: "Berjalan", value: "berjalan" },
  { label: "Selesai", value: "selesai" },
  { label: "Batal", value: "batal" },
];

export const risikoOptions = [
  { label: "Rendah", value: "rendah" },
  { label: "Sedang", value: "sedang" },
  { label: "Tinggi", value: "tinggi" },
];

export const giziOptions = [
  { label: "Naik", value: "naik" },
  { label: "Tetap", value: "tetap" },
  { label: "Turun", value: "turun" },
  { label: "Gizi Baik", value: "gizi_baik" },
  { label: "Gizi Kurang", value: "gizi_kurang" },
  { label: "Gizi Buruk", value: "gizi_buruk" },
  { label: "Risiko Stunting", value: "risiko_stunting" },
];

export function toApiDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toApiTime(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 5);
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

export function labelFrom(options: Array<{ label: string; value: string }>, value: string): string {
  return options.find((item) => item.value === value)?.label || value || "-";
}

export async function fetchPosyandu() {
  const response = await apiClient.get("/posyandu");
  return response.data.data || [];
}

export async function fetchPatients() {
  const response = await apiClient.get("/pasien");
  return response.data.data || [];
}

export async function fetchSchedules(params = {}) {
  const response = await apiClient.get("/jadwal-posyandu", { params });
  return response.data.data || [];
}

export async function fetchVisits(params = {}) {
  const response = await apiClient.get("/kunjungan-posyandu", { params });
  return response.data.data || [];
}
