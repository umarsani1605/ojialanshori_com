import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSantriStore = defineStore('santri', () => {
  const config = useRuntimeConfig();

  // State
  const defaultCollegeYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
  const collegeYearList = ref([]);
  const genderList = ref([
    { value: 'male', label: 'Putra' },
    { value: 'female', label: 'Putri' },
  ]);
  const statusList = ref([
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
  ]);
  const roleList = ref(['santri', 'pentashih']);
  const universityList = ref([]);
  const majorList = ref([]);
  const santriList = ref([]);
  const selectedSantri = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getCollegeYearList = computed(() => {
    // Jika collegeYearList kosong, gunakan defaultCollegeYears
    return collegeYearList.value.length > 0 ? collegeYearList.value : defaultCollegeYears;
  });
  const getGenderList = computed(() => genderList.value);
  const getGenderValues = computed(() => genderList.value.map((g) => g.value));
  const getGenderLabel = computed(() => (value) => {
    return genderList.value.find((g) => g.value === value)?.label || value;
  });
  const getStatusList = computed(() => statusList.value);
  const getStatusValues = computed(() => statusList.value.map((s) => s.value));
  const getStatusLabel = computed(() => (value) => {
    return statusList.value.find((s) => s.value === value)?.label || value;
  });
  const getUniversityList = computed(() => universityList.value);
  const getMajorList = computed(() => majorList.value);
  const getRoleList = computed(() => roleList.value);
  const getSantriList = computed(() => santriList.value);
  const getSelectedSantri = computed(() => selectedSantri.value);

  // Actions
  const getAll = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      // Buat params untuk query string
      const params = new URLSearchParams();
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.status !== undefined) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);

      const response = await $fetch(`${config.public.apiBase}/santri${params.toString() ? `?${params.toString()}` : ''}`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      santriList.value = response.data;

      // Update master data
      await setAllData(response.data);

      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil data santri:', err);
      error.value = err.message || 'Gagal mengambil data santri';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/santri/${id}`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      selectedSantri.value = response.data;
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil detail santri:', err);
      error.value = err.message || 'Gagal mengambil detail santri';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const create = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/santri`, {
        method: 'POST',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      santriList.value.push(response.data);
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menambah santri:', err);
      error.value = err.message || 'Gagal menambah santri';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/santri/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      const index = santriList.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        santriList.value[index] = response.data;
      }
      if (selectedSantri.value?.id === id) {
        selectedSantri.value = response.data;
      }
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengupdate santri:', err);
      error.value = err.message || 'Gagal mengupdate santri';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/santri/${id}`, {
        method: 'DELETE',
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      santriList.value = santriList.value.filter((s) => s.id !== id);
      if (selectedSantri.value?.id === id) {
        selectedSantri.value = null;
      }
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menghapus santri:', err);
      error.value = err.message || 'Gagal menghapus santri';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const search = async (query) => {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams({ query });
      const response = await $fetch(`${config.public.apiBase}/santri/search?${params.toString()}`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      santriList.value = response.data;
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mencari santri:', err);
      error.value = err.message || 'Gagal mencari santri';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setAllData = async (santriList) => {
    try {
      // Extract unique college_year values
      const uniqueCollegeYears = new Set(
        santriList.map((santri) => santri.college_year).filter(Boolean) // Remove null/undefined values
      );

      // Gabungkan dengan defaultCollegeYears untuk memastikan selalu ada opsi
      const allYears = new Set([...Array.from(uniqueCollegeYears), ...defaultCollegeYears]);

      // Urutkan secara descending (terbaru dulu)
      collegeYearList.value = Array.from(allYears)
        .filter(Boolean)
        .sort((a, b) => b - a);

      // Extract unique university values
      const uniqueUniversities = new Set(santriList.map((santri) => santri.university).filter(Boolean));
      universityList.value = Array.from(uniqueUniversities).sort();

      // Extract unique major values
      const uniqueMajors = new Set(santriList.map((santri) => santri.major).filter(Boolean));
      majorList.value = Array.from(uniqueMajors).sort();
    } catch (error) {
      console.error('Store Error: Gagal mengambil data master:', error);
      error.value = 'Gagal mengambil data master';
      throw error;
    }
  };

  const resetState = () => {
    // Jangan reset collegeYearList agar tetap tersedia untuk komponen lain
    universityList.value = [];
    majorList.value = [];
    santriList.value = [];
    selectedSantri.value = null;
    loading.value = false;
    error.value = null;
  };

  // Update role santri
  const updateRole = async (id, role) => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Updating role with data:', { id, role }); // Debug log

      const response = await $fetch(`${config.public.apiBase}/santri/role`, {
        method: 'PUT',
        body: { id, role },
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      // Update local data juga
      const index = santriList.value.findIndex(s => s.id === id);
      if (index !== -1) {
        santriList.value[index].role = role;
      }

      return response;
    } catch (err) {
      console.error('Store Error: Failed to update santri role:', err);
      error.value = err.message || 'Gagal mengupdate role santri';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    collegeYearList,
    genderList,
    statusList,
    roleList,
    universityList,
    majorList,
    santriList,
    selectedSantri,
    loading,
    error,
    // Getters
    getCollegeYearList,
    getGenderList,
    getGenderValues,
    getGenderLabel,
    getStatusList,
    getStatusValues,
    getStatusLabel,
    getUniversityList,
    getMajorList,
    getRoleList,
    getSantriList,
    getSelectedSantri,
    // Actions
    getAll,
    getById,
    create,
    update,
    remove,
    search,
    setAllData,
    resetState,
    updateRole,
  };
});
