import apiClient from './apiService';

const SATUSEHAT_CONFIG_BASE = '/satusehat/config';

export default {
  // Get all configurations
  getAllConfigs() {
    return apiClient.get(SATUSEHAT_CONFIG_BASE);
  },

  // Get active configuration
  getActiveConfig() {
    return apiClient.get(`${SATUSEHAT_CONFIG_BASE}/active`);
  },

  // Get configuration by ID
  getConfigById(id: number) {
    return apiClient.get(`${SATUSEHAT_CONFIG_BASE}/${id}`);
  },

  // Create new configuration
  createConfig(data: any) {
    return apiClient.post(SATUSEHAT_CONFIG_BASE, data);
  },

  // Update configuration
  updateConfig(id: number, data: any) {
    return apiClient.put(`${SATUSEHAT_CONFIG_BASE}/${id}`, data);
  },

  // Activate configuration
  activateConfig(id: number) {
    return apiClient.post(`${SATUSEHAT_CONFIG_BASE}/${id}/activate`);
  },

  // Delete configuration
  deleteConfig(id: number) {
    return apiClient.delete(`${SATUSEHAT_CONFIG_BASE}/${id}`);
  },

  // Test connection
  testConnection(id: number) {
    return apiClient.post(`${SATUSEHAT_CONFIG_BASE}/${id}/test`);
  },
};
