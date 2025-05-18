import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGradeStore = defineStore('grade', () => {
  const config = useRuntimeConfig();

  // State
  const hafalanStatusList = ref(['belum', 'proses', 'sudah']);
  const setoranStatusList = ref(['belum', 'proses', 'sudah']);
  const gradeList = ref([]);
  const currentGrade = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const editedGrades = ref([]);
  const hasUnsavedChanges = ref(false);

  // State untuk kategori
  const categories = ref([]);
  const currentCategory = ref(null);

  // State untuk subject
  const subjects = ref([]);
  const currentSubject = ref(null);

  // State untuk pentashih
  const pentashihList = ref([]);

  const filters = ref({
    id_santri: null,
    id_pentashih: null,
    id_category: null,
    id_subject: null,
    page: 1,
    limit: 10,
  });

  // Getters
  const getHafalanStatusList = computed(() => hafalanStatusList.value);
  const getSetoranStatusList = computed(() => setoranStatusList.value);
  const getGradeList = computed(() => gradeList.value);
  const getCurrentGrade = computed(() => currentGrade.value);
  const getEditedGrades = computed(() => editedGrades.value);
  const getHasUnsavedChanges = computed(() => hasUnsavedChanges.value);

  // Getters untuk kategori
  const getCategories = computed(() => categories.value);
  const getCategoryById = computed(() => (id) => categories.value.find((category) => category.id === id));

  // Getters untuk subject
  const getSubjects = computed(() => subjects.value);
  const getSubjectById = computed(() => (id) => subjects.value.find((subject) => subject.id === id));
  const getSubjectsByCategory = computed(() => (categoryId) => subjects.value.filter((subject) => subject.id_category === categoryId));

  const getGradeBySantriAndSubject = computed(() => (santriId, subjectId) => {
    return gradeList.value.find((grade) => grade.id_santri === santriId && grade.id_subject === subjectId);
  });

  // Getters for Pentashih
  const getPentashihList = computed(() => {
    return Object.values(pentashihList.value || []);
  });

  // Actions untuk kategori
  const fetchCategories = async () => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/categories`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      categories.value = response.data;
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil data kategori:', err);
      error.value = err.message || 'Gagal mengambil data kategori';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (data) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/categories`, {
        method: 'POST',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      categories.value.push(response.data);
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menambah kategori:', err);
      error.value = err.message || 'Gagal menambah kategori';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id, data) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/categories/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      const index = categories.value.findIndex((category) => category.id === id);
      if (index !== -1) {
        categories.value[index] = response.data;
      }
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengupdate kategori:', err);
      error.value = err.message || 'Gagal mengupdate kategori';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      categories.value = categories.value.filter((category) => category.id !== id);
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menghapus kategori:', err);
      error.value = err.message || 'Gagal menghapus kategori';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions untuk subject
  const fetchSubjects = async () => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/subjects`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      subjects.value = response.data;
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil data subject:', err);
      error.value = err.message || 'Gagal mengambil data subject';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSubject = async (data) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/subjects`, {
        method: 'POST',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      subjects.value.push(response.data);
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menambah subject:', err);
      error.value = err.message || 'Gagal menambah subject';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSubject = async (id, data) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/subjects/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      const index = subjects.value.findIndex((subject) => subject.id === id);
      if (index !== -1) {
        subjects.value[index] = response.data;
      }
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengupdate subject:', err);
      error.value = err.message || 'Gagal mengupdate subject';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSubject = async (id) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/subjects/${id}`, {
        method: 'DELETE',
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      subjects.value = subjects.value.filter((subject) => subject.id !== id);
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menghapus subject:', err);
      error.value = err.message || 'Gagal menghapus subject';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSubjectsByCategory = async (categoryId) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/subjects/category/${categoryId}`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil data subject berdasarkan kategori:', err);
      error.value = err.message || 'Gagal mengambil data subject berdasarkan kategori';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions untuk grade
  const getAll = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (filters.id_santri) params.append('id_santri', filters.id_santri);
      if (filters.id_pentashih) params.append('id_pentashih', filters.id_pentashih);
      if (filters.id_category) params.append('id_category', filters.id_category);
      if (filters.id_subject) params.append('id_subject', filters.id_subject);

      const response = await $fetch(`${config.public.apiBase}/grades${params.toString() ? `?${params.toString()}` : ''}`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      gradeList.value = response.data;
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil data grade:', err);
      error.value = err.message || 'Gagal mengambil data grade';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/${id}`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      currentGrade.value = response.data;
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil detail grade:', err);
      error.value = err.message || 'Gagal mengambil detail grade';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const create = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades`, {
        method: 'POST',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      gradeList.value.push(response.data);
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menambah grade:', err);
      error.value = err.message || 'Gagal menambah grade';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      const index = gradeList.value.findIndex((grade) => grade.id === id);
      if (index !== -1) {
        gradeList.value[index] = response.data;
      }
      if (currentGrade.value?.id === id) {
        currentGrade.value = response.data;
      }
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengupdate grade:', err);
      error.value = err.message || 'Gagal mengupdate grade';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/${id}`, {
        method: 'DELETE',
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      gradeList.value = gradeList.value.filter((grade) => grade.id !== id);
      if (currentGrade.value?.id === id) {
        currentGrade.value = null;
      }
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menghapus grade:', err);
      error.value = err.message || 'Gagal menghapus grade';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Action untuk menambah perubahan ke dalam tracking
  const addEditedGrade = (change) => {
    const existingIndex = editedGrades.value.findIndex((g) => g.santri.id === change.santri.id && g.subject.id === change.subject.id);

    if (existingIndex !== -1) {
      editedGrades.value[existingIndex] = change;
    } else {
      editedGrades.value.push(change);
    }
    hasUnsavedChanges.value = true;
  };

  // Action untuk membersihkan tracking perubahan
  const clearEditedGrades = () => {
    editedGrades.value = [];
    hasUnsavedChanges.value = false;
  };

  // Action untuk menyimpan semua perubahan
  const saveAllChanges = async () => {
    loading.value = true;
    error.value = null;
    try {
      const updatePromises = editedGrades.value.map(async (change) => {
        const existingGrade = getGradeBySantriAndSubject.value(change.santri.id, change.subject.id);

        const gradeData = {
          id_santri: change.santri.id,
          id_pentashih: change.pentashih?.id,
          id_category: change.subject.id_category,
          id_subject: change.subject.id,
          setoran: change.subject.setoran,
          hafalan: change.subject.hafalan,
        };

        if (existingGrade) {
          return update(existingGrade.id, gradeData);
        } else {
          return create(gradeData);
        }
      });

      await Promise.all(updatePromises);
      clearEditedGrades();
      await getAll(filters.value);
      return true;
    } catch (err) {
      console.error('Store Error: Gagal menyimpan perubahan:', err);
      error.value = err.message || 'Gagal menyimpan perubahan';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Action untuk mengatur filter
  const setFilters = (newFilters) => {
    filters.value = {
      ...filters.value,
      ...newFilters,
    };
  };

  // Action untuk reset filter
  const resetFilters = () => {
    filters.value = {
      id_santri: null,
      id_pentashih: null,
      id_category: null,
      id_subject: null,
      page: 1,
      limit: 10,
    };
  };

  // Actions untuk pentashih
  const fetchPentashih = async () => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/pentashih`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      pentashihList.value = response.data;
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil data pentashih:', err);
      error.value = err.message || 'Gagal mengambil data pentashih';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPentashih = async (data) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/pentashih`, {
        method: 'POST',
        body: data,
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      // Refresh daftar pentashih setelah menambah
      await fetchPentashih();
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menambah pentashih:', err);
      error.value = err.message || 'Gagal menambah pentashih';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePentashih = async (id, data) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/pentashih/${id}`, {
        method: 'PUT',
        body: data.santri_ids || [],
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      // Refresh daftar pentashih setelah update
      await fetchPentashih();
      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengupdate pentashih:', err);
      error.value = err.message || 'Gagal mengupdate pentashih';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePentashih = async (id) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/pentashih/${id}`, {
        method: 'DELETE',
      });

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      // Refresh daftar pentashih setelah menghapus
      await fetchPentashih();
      return response;
    } catch (err) {
      console.error('Store Error: Gagal menghapus pentashih:', err);
      error.value = err.message || 'Gagal menghapus pentashih';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSantriByPentashihId = async (id) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/grades/pentashih/${id}/santri`);

      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      return response;
    } catch (err) {
      console.error('Store Error: Gagal mengambil daftar santri pentashih:', err);
      error.value = err.message || 'Gagal mengambil daftar santri pentashih';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    hafalanStatusList,
    setoranStatusList,
    gradeList,
    currentGrade,
    loading,
    error,
    editedGrades,
    hasUnsavedChanges,
    filters,
    categories,
    subjects,
    pentashihList,
    // Getters
    getHafalanStatusList,
    getSetoranStatusList,
    getGradeList,
    getCurrentGrade,
    getEditedGrades,
    getHasUnsavedChanges,
    getGradeBySantriAndSubject,
    getCategories,
    getCategoryById,
    getSubjects,
    getSubjectById,
    getSubjectsByCategory,
    getPentashihList,
    // Actions untuk grade
    getAll,
    getById,
    create,
    update,
    remove,
    addEditedGrade,
    clearEditedGrades,
    saveAllChanges,
    setFilters,
    resetFilters,
    // Actions untuk kategori
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    // Actions untuk subject
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchSubjectsByCategory,
    // Actions untuk pentashih
    fetchPentashih,
    createPentashih,
    updatePentashih,
    deletePentashih,
    getSantriByPentashihId,
  };
});
