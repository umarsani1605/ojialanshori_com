import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/config/axios';

export const usePentashihStore = defineStore('pentashih', () => {
  // State
  const pentashihList = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getPentashihList = computed(() => pentashihList.value);
  const getPentashihById = computed(() => (id) => pentashihList.value.find((pentashih) => pentashih.id === id));

  // Actions
  const fetchPentashih = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get('/pentashih', { params });
      pentashihList.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Store Error: Gagal mengambil data pentashih:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchPentashihById = async (id) => {
    loading.value = true;
    try {
      const response = await api.get(`/pentashih/${id}`);
      return response.data;
    } catch (error) {
      console.error('Store Error: Gagal mengambil detail pentashih:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createPentashih = async (data) => {
    loading.value = true;
    try {
      const response = await api.post('/pentashih', data);
      pentashihList.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Store Error: Gagal menambah pentashih:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updatePentashih = async (id, data) => {
    loading.value = true;
    try {
      const response = await api.put(`/pentashih/${id}`, data);
      const index = pentashihList.value.findIndex((pentashih) => pentashih.id === id);
      if (index !== -1) {
        pentashihList.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Store Error: Gagal mengupdate pentashih:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deletePentashih = async (id) => {
    loading.value = true;
    try {
      await api.delete(`/pentashih/${id}`);
      pentashihList.value = pentashihList.value.filter((pentashih) => pentashih.id !== id);
    } catch (error) {
      console.error('Store Error: Gagal menghapus pentashih:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getSantriByPentashihId = async (pentashihId) => {
    loading.value = true;
    try {
      const response = await api.get(`/pentashih/${pentashihId}/santri`);
      return response.data;
    } catch (error) {
      console.error('Store Error: Gagal mengambil data santri berdasarkan pentashih:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    pentashihList,
    loading,
    error,
    // Getters
    getPentashihList,
    getPentashihById,
    // Actions
    fetchPentashih,
    fetchPentashihById,
    createPentashih,
    updatePentashih,
    deletePentashih,
    getSantriByPentashihId,
  };
});
