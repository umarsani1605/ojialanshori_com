<template>
  <div class="grid grid-cols-1 gap-6">
    <!-- Loading State -->
    <div v-if="gradeStore.loading" class="flex justify-center items-center min-h-[200px]">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="gradeStore.error" class="bg-red-100 text-red-700 p-4 rounded-lg">
      {{ gradeStore.error }}
    </div>

    <!-- Content -->
    <div v-else class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-4 mb-6">
        <span class="text-emerald-600 rounded-full bg-emerald-100 size-10 flex items-center justify-center text-lg">
          <Icon name="lucide:book-open-check" size="21" class="text-emerald-500" />
        </span>
        <h2 class="text-xl font-semibold text-slate-800">Progress Santri</h2>
      </div>
      <DataTable
        :value="progressData"
        scrollable
        scrollHeight="750px"
        rowGroupMode="subheader"
        groupRowsBy="category"
        sortMode="single"
        sortField="category"
        :sortOrder="1"
        tableStyle="min-width: 50rem"
        v-model="expandedRows"
        showGridlines
        stripedRows
      >
        <!-- Template untuk Group Header -->
        <template #groupheader="slotProps">
          <div class="flex items-center gap-2 p-2">
            <span class="font-bold text-lg">{{ slotProps.data.category }}</span>
          </div>
        </template>

        <!-- Kolom-kolom -->
        <Column field="category" header="Kategori" />
        <Column field="no" header="No" style="width: 4rem" />
        <Column field="subject" header="Subyek" style="min-width: 12rem" />
        <Column field="hafalan" header="Status Hafalan" style="min-width: 8rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.hafalan" :severity="getHafalanSeverity(slotProps.data.hafalan)" class="capitalize" />
          </template>
        </Column>
        <Column field="setoran" header="Status Setoran" style="min-width: 8rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.setoran" :severity="getSetoranSeverity(slotProps.data.setoran)" class="capitalize" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGradeStore } from '~/stores/gradeStore';
import { useAuth } from '#imports';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';

const gradeStore = useGradeStore();
const { data: authData } = useAuth();
const expandedRows = ref([]);

// Data yang sudah diformat untuk tabel
const progressData = computed(() => {
  // Mengambil grade list yang sudah difilter untuk santri yang login
  const grades = gradeStore.getGradeList;
  const categories = gradeStore.getCategories;
  const subjects = gradeStore.getSubjects;

  let formattedData = [];
  let categoryCounters = {};

  categories.forEach((category) => {
    // Reset counter untuk setiap kategori
    categoryCounters[category.id] = 1;

    // Filter subject untuk kategori ini
    const categorySubjects = subjects.filter((s) => s.id_category === category.id);

    categorySubjects.forEach((subject) => {
      const grade = grades.find((g) => g.id_subject === subject.id && g.id_santri === authData.value.user.id);

      formattedData.push({
        id: subject.id,
        no: categoryCounters[category.id]++,
        category: category.name,
        subject: subject.name,
        hafalan: grade?.hafalan || 'belum',
        setoran: grade?.setoran || 'belum',
      });
    });
  });

  return formattedData;
});

// Helper untuk mendapatkan jumlah subject per kategori
const getSubjectCount = (category) => {
  return progressData.value.filter((item) => item.category === category).length;
};

// Helper untuk warna status
const getHafalanSeverity = (status) => {
  switch (status) {
    case 'sudah':
      return 'success';
    case 'proses':
      return 'warning';
    default:
      return 'danger';
  }
};

const getSetoranSeverity = (status) => {
  switch (status) {
    case 'sudah':
      return 'success';
    case 'proses':
      return 'warning';
    default:
      return 'danger';
  }
};

// Helper untuk mendapatkan index kategori
const getCategoryIndex = (categoryName) => {
  const uniqueCategories = [...new Set(progressData.value.map((item) => item.category))];
  return (uniqueCategories.indexOf(categoryName) + 1).toString();
};

onMounted(async () => {
  try {
    // Fetch semua data yang diperlukan
    await Promise.all([
      gradeStore.fetchCategories(),
      gradeStore.fetchSubjects(),
      gradeStore.getAll({
        id_santri: authData.value.user.id,
      }),
    ]);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>
