<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useGradeStore } from '~/stores/gradeStore';
import { useSantriStore } from '@/stores/santriStore';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';
import Divider from 'primevue/divider';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';

// Define layout untuk halaman login
definePageMeta({
  layout: 'auth',
});

const route = useRoute();
const toast = useToast();
const gradeStore = useGradeStore();
const santriStore = useSantriStore();

// State Management
const daftarSantri = ref([]);
const originalData = ref([]);
const editedGrades = ref([]);
const dt = ref(null);
const filters = ref({});
const categories = ref([]);
const subjects = ref([]);
const loading = ref(true);
const error = ref(null);
const editingCell = ref(null);
const statusOptions = ['belum', 'proses', 'sudah'];
const isEditMode = ref(false);
const pentashihList = ref([]);
const columnFreeze = ref(false);
const angkatanOptions = ref([]);
const sessionUserId = ref(1);
const sessionUserName = ref('Admin');
const expandedRows = ref([]);
const raportData = ref(null);

// Data yang sudah diformat untuk tabel
const progressData = computed(() => {
  if (!raportData.value) return [];

  let formattedData = [];
  let categoryCounters = {};

  raportData.value.categories.forEach((category) => {
    // Reset counter untuk setiap kategori
    categoryCounters[category.id] = 1;

    category.subjects.forEach((subject) => {
      formattedData.push({
        id: subject.id,
        no: categoryCounters[category.id]++,
        category: category.name,
        subject: subject.name,
        hafalan: subject.hafalan || 'belum',
        setoran: subject.setoran || 'belum',
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
  if (!raportData.value) return '0';
  const uniqueCategories = [...new Set(progressData.value.map((item) => item.category))];
  return (uniqueCategories.indexOf(categoryName) + 1).toString();
};

// Fungsi untuk fetch data santri dan grades
const getSantriGrades = async () => {
  loading.value = true;
  try {
    const santriRes = await santriStore.getAll();
    const gradeRes = await gradeStore.getAll();

    // Transform data untuk tabel
    daftarSantri.value = santriRes.data.map((santri) => {
      const subjectsData = {};

      subjects.value.forEach((subject) => {
        subjectsData[subject.name] = {
          setoran: subject.has_setoran ? 'belum' : null,
          hafalan: subject.has_hafalan ? 'belum' : null,
          pentashih: {
            id: null,
            name: '-',
          },
          date: '',
          id_category: subject.id_category,
          id_subject: subject.id,
        };
      });

      const santriGrades = gradeRes.data.filter((g) => g.id_santri === santri.id);

      santriGrades.forEach((grade) => {
        const subjectName = grade.subject_name;

        if (grade.setoran) {
          subjectsData[subjectName].setoran = grade.setoran;
        }
        if (grade.hafalan) {
          subjectsData[subjectName].hafalan = grade.hafalan;
        }

        if (grade.setoran !== 'belum' || grade.hafalan !== 'belum') {
          subjectsData[subjectName].pentashih = {
            id: grade.id_pentashih,
            name: grade.pentashih_name,
          };
          subjectsData[subjectName].date = grade.updated_at;
        }
      });

      const latestGrade = santriGrades
        .filter((g) => g.setoran !== 'belum' || g.hafalan !== 'belum')
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

      return {
        santri: {
          id: santri.id,
          name: santri.fullname,
          code: santri.code,
          angkatan: santri.college_year,
          gender: santri.gender,
        },
        subjects: subjectsData,
        pentashih: {
          id: latestGrade?.id_pentashih || null,
          name: latestGrade?.pentashih_name || '-',
        },
        tanggal: latestGrade?.updated_at || '',
      };
    });
  } catch (err) {
    console.error('Error fetching santri grades:', err);
    error.value = 'Gagal mengambil data penilaian';
  } finally {
    loading.value = false;
  }
};

// Fungsi untuk fetch data kategori, subject, dan pentashih
const fetchData = async () => {
  loading.value = true;
  try {
    await Promise.all([gradeStore.fetchCategories(), gradeStore.fetchSubjects(), gradeStore.fetchPentashih()]);

    categories.value = gradeStore.getCategories;
    subjects.value = gradeStore.getSubjects;

    pentashihList.value = gradeStore.getPentashihList.map((p) => ({
      value: p.id_pentashih,
      label: p.name,
    }));
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Gagal mengambil data';
  } finally {
    loading.value = false;
  }
};

// Inisialisasi filter
const initFilters = () => {
  filters.value = {
    'santri.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'santri.angkatan': { value: null, matchMode: FilterMatchMode.EQUALS },
    'santri.gender': { value: null, matchMode: FilterMatchMode.EQUALS },
    'pentashih.name': { value: null, matchMode: FilterMatchMode.EQUALS },
  };
};

// Computed property untuk struktur kolom
const columnGroups = computed(() => {
  const level1 = categories.value.map((category) => ({
    header: category.name,
    colspan: subjects.value
      .filter((s) => s.id_category === category.id)
      .reduce((acc, subj) => acc + (subj.has_hafalan ? 1 : 0) + (subj.has_setoran ? 1 : 0), 0),
  }));

  const level2 = categories.value
    .map((category) =>
      subjects.value
        .filter((s) => s.id_category === category.id)
        .map((subject) => ({
          header: subject.name,
          colspan: (subject.has_hafalan ? 1 : 0) + (subject.has_setoran ? 1 : 0),
        }))
    )
    .flat();

  const level3 = subjects.value
    .map((subject) => {
      const columns = [];
      if (subject.has_setoran) {
        columns.push({
          header: 'Setoran',
          field: `${subject.id}_setoran`,
          subject_name: subject.name,
        });
      }
      if (subject.has_hafalan) {
        columns.push({
          header: 'Hafalan',
          field: `${subject.id}_hafalan`,
          subject_name: subject.name,
        });
      }
      return columns;
    })
    .flat();

  return { level1, level2, level3 };
});

// Helper Functions
const formatDate = (dateString) => {
  if (dateString === '-') return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getBadgeSeverity = (status) => {
  switch (status) {
    case 'sudah':
      return 'success';
    case 'proses':
      return 'warn';
    case 'belum':
      return 'danger';
    default:
      return null;
  }
};

const getGenderLabel = (gender) => {
  return santriStore.getGenderLabel(gender);
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const getUniqueAngkatan = () => {
  const angkatanSet = new Set();

  daftarSantri.value.forEach((santri) => {
    if (santri.santri.angkatan) {
      angkatanSet.add(santri.santri.angkatan);
    }
  });

  return Array.from(angkatanSet).map((angkatan) => ({
    label: angkatan,
    value: angkatan,
  }));
};

// Edit Mode Functions
const toggleEditMode = () => {
  if (isEditMode.value) {
    saveChanges();
  } else {
    originalData.value = JSON.parse(JSON.stringify(daftarSantri.value));
    editedGrades.value = [];
  }

  isEditMode.value = !isEditMode.value;

  if (!isEditMode.value) {
    editingCell.value = null;
  }
};

const cancelEditMode = () => {
  isEditMode.value = false;
  editingCell.value = null;
  daftarSantri.value = JSON.parse(JSON.stringify(originalData.value));
  editedGrades.value = [];
  toast.add({ severity: 'info', summary: 'Dibatalkan', detail: 'Perubahan telah dibatalkan', life: 3000 });
};

const onCellEditComplete = ({ data, newValue, field }) => {
  if (!isEditMode.value) return;

  const [subjectName, gradeType] = field.split('_');

  if (gradeType === 'setoran' || gradeType === 'hafalan') {
    data.subjects[subjectName][gradeType] = newValue;

    if (newValue !== 'belum') {
      data.subjects[subjectName].pentashih = {
        id: sessionUserId.value,
        name: sessionUserName.value,
      };
      data.subjects[subjectName].date = new Date().toISOString().split('T')[0];
    }

    trackChange({
      data,
      subjectName,
      gradeType,
      newValue,
    });
  }

  editingCell.value = null;
};

const onCellEditCancel = () => {
  if (!isEditMode.value) return;
  editingCell.value = null;
};

const trackChange = ({ data, subjectName, gradeType, newValue }) => {
  const subject = data.subjects[subjectName];

  const changeData = {
    santri: {
      id: data.santri.id,
      name: data.santri.name,
    },
    subject: {
      id: subject.id_subject,
      id_category: subject.id_category,
      name: subjectName,
      category: categories.value.find((c) => c.id === subject.id_category)?.name || '',
      setoran: gradeType === 'setoran' ? newValue : subject.setoran,
      hafalan: gradeType === 'hafalan' ? newValue : subject.hafalan,
    },
    pentashih:
      newValue !== 'belum'
        ? {
            id: sessionUserId.value,
            name: sessionUserName.value,
          }
        : null,
    date: newValue !== 'belum' ? new Date().toISOString().split('T')[0] : null,
  };

  const existingIndex = editedGrades.value.findIndex((item) => item.santri.id === changeData.santri.id && item.subject.id === changeData.subject.id);

  if (existingIndex !== -1) {
    const existingData = editedGrades.value[existingIndex];
    editedGrades.value[existingIndex] = {
      ...existingData,
      subject: {
        ...existingData.subject,
        [gradeType]: newValue,
      },
      pentashih: changeData.pentashih || existingData.pentashih,
      date: changeData.date || existingData.date,
    };
  } else {
    editedGrades.value.push(changeData);
  }
};

const saveChanges = async () => {
  loading.value = true;

  try {
    if (editedGrades.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'Tidak ada perubahan',
        detail: 'Tidak ada perubahan yang perlu disimpan',
        life: 3000,
      });
      loading.value = false;
      return;
    }

    editedGrades.value.forEach((change) => {
      gradeStore.addEditedGrade(change);
    });

    await gradeStore.saveAllChanges();
    await getSantriGrades();

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `${editedGrades.value.length} perubahan berhasil disimpan`,
      life: 3000,
    });

    editedGrades.value = [];
    isEditMode.value = false;
  } catch (error) {
    console.error('Error updating grades:', error);
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Terjadi kesalahan saat menyimpan perubahan',
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const handlePentashihChange = (data) => {
  if (!isEditMode.value) return;

  const pentashihOption = pentashihList.value.find((p) => p.value === data.pentashih.id);
  const pentashihId = data.pentashih.id;
  const pentashihName = pentashihOption?.label || 'Admin';

  data.pentashih.name = pentashihName;

  const santriId = data.santri.id;
  const subjects = Object.keys(data.subjects);

  subjects.forEach((subjectName) => {
    const subjectData = data.subjects[subjectName];

    if (subjectData.setoran && subjectData.setoran !== 'belum') {
      const changeData = {
        id_santri: santriId,
        id_category: subjectData.id_category,
        id_subject: subjectData.id_subject,
        setoran: subjectData.setoran,
        pentashih: pentashihId,
        pentashih_name: pentashihName,
        tanggal: data.tanggal,
        gradeType: 'setoran',
      };

      trackChange(changeData);
    }

    if (subjectData.hafalan && subjectData.hafalan !== 'belum') {
      const changeData = {
        id_santri: santriId,
        id_category: subjectData.id_category,
        id_subject: subjectData.id_subject,
        hafalan: subjectData.hafalan,
        pentashih: pentashihId,
        pentashih_name: pentashihName,
        tanggal: data.tanggal,
        gradeType: 'hafalan',
      };

      trackChange(changeData);
    }
  });

  data.tanggal = new Date().toISOString();
};

const handleDateChange = (data) => {
  if (!isEditMode.value) return;

  const pentashihId = data.pentashih.id || 1;
  const pentashihOption = pentashihList.value.find((p) => p.value === pentashihId);
  const pentashihName = pentashihOption?.label || 'Admin';

  const santriId = data.santri.id;
  const subjects = Object.keys(data.subjects);

  subjects.forEach((subjectName) => {
    const subjectData = data.subjects[subjectName];

    if (subjectData.setoran && subjectData.setoran !== 'belum') {
      const changeData = {
        id_santri: santriId,
        id_category: subjectData.id_category,
        id_subject: subjectData.id_subject,
        setoran: subjectData.setoran,
        pentashih: pentashihId,
        pentashih_name: pentashihName,
        tanggal: data.tanggal,
        gradeType: 'setoran',
      };

      trackChange(changeData);
    }

    if (subjectData.hafalan && subjectData.hafalan !== 'belum') {
      const changeData = {
        id_santri: santriId,
        id_category: subjectData.id_category,
        id_subject: subjectData.id_subject,
        hafalan: subjectData.hafalan,
        pentashih: pentashihId,
        pentashih_name: pentashihName,
        tanggal: data.tanggal,
        gradeType: 'hafalan',
      };

      trackChange(changeData);
    }
  });
};

// Lifecycle Hooks
onBeforeMount(() => {
  initFilters();
});

onMounted(async () => {
  loading.value = true;
  try {
    const data = await gradeStore.getByCode(route.params.code);
    if (!data) {
      throw new Error('Data tidak ditemukan');
    }
    raportData.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }

  await fetchData();
  await getSantriGrades();
  angkatanOptions.value = getUniqueAngkatan();
});

const exportCSV = () => {
  dt.value.exportCSV();
};

// Computed untuk opsi pentashih
const getPentashihOptionsWithAll = () => {
  if (pentashihList.value.length === 0) return [];
  return [...pentashihList.value];
};

const pentashihOptionsWithAll = computed(() => {
  return getPentashihOptionsWithAll();
});
</script>

<template>
  <div class="grid grid-cols-1 gap-6 p-10">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[200px]">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="!raportData" class="bg-red-100 text-red-700 p-4 rounded-lg">Data tidak ditemukan</div>

    <!-- Content -->
    <div v-else class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div v-if="route.params.code !== 'admin'">
        <div class="flex items-center gap-4 mb-6">
          <span class="text-emerald-600 rounded-full bg-emerald-100 size-10 flex items-center justify-center text-lg">
            <Icon name="lucide:book-open-check" size="21" class="text-emerald-500" />
          </span>
          <h2 class="text-2xl font-semibold text-slate-800">Raport Santri</h2>
        </div>

        <div class="bg-white rounded-xl mb-6">
          <!-- data santri -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-slate-500">Nama Lengkap</p>
                  <p class="font-medium">{{ raportData.santri.fullname }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500">Angkatan</p>
                  <p class="font-medium">{{ raportData.santri.college_year || '-' }}</p>
                </div>
              </div>
            </div>
            <div>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-slate-500">Program Studi</p>
                  <p class="font-medium">{{ raportData.santri.major || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500">Universitas</p>
                  <p class="font-medium">{{ raportData.santri.university || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          :value="progressData"
          rowGroupMode="subheader"
          groupRowsBy="category"
          sortMode="single"
          sortField="category"
          :sortOrder="1"
          tableStyle="min-width: 50rem"
          v-model:expandedRows="expandedRows"
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
      <div v-else>
        <div class="flex items-center gap-4 mb-6">
          <span class="text-emerald-600 rounded-full bg-emerald-100 size-10 flex items-center justify-center text-lg">
            <Icon name="lucide:book-open-check" size="21" class="text-emerald-500" />
          </span>
          <h2 class="text-2xl font-semibold text-slate-800">Raport Santri</h2>
        </div>

        <Toolbar class="toolbar mb-2 !pt-0 !px-0 !border-none">
          <template v-slot:start>
            <div class="flex gap-4 items-center">
              <Message severity="info" icon="pi pi-info-circle" class="ml-2">
                <strong>Tips:</strong> Jika menggunakan mouse, gunakan <strong>Shift + Scroll</strong> untuk scrolling secara horizontal.
              </Message>
            </div>
          </template>
          <template v-slot:end>
            <div class="flex gap-4 items-center"></div>
          </template>
        </Toolbar>

        <!-- Tambahkan Filter Dropdown di Sini -->
        <div class="flex justify-between mb-4 gap-4">
          <div class="flex gap-4">
            <FloatLabel class="w-48" variant="on">
              <Select
                inputId="angkatanFilter"
                :options="angkatanOptions"
                optionLabel="label"
                optionValue="value"
                v-model="filters['santri.angkatan'].value"
                class="w-full"
                showClear
              />
              <label for="angkatanFilter">Angkatan</label>
            </FloatLabel>
            <FloatLabel class="w-48" variant="on">
              <Select
                inputId="genderFilter"
                :options="santriStore.getGenderList"
                optionLabel="label"
                optionValue="value"
                v-model="filters['santri.gender'].value"
                class="w-full"
                showClear
              />
              <label for="genderFilter">Gender</label>
            </FloatLabel>
            <FloatLabel class="w-48" variant="on">
              <Select
                inputId="pentashihFilter"
                :options="pentashihOptionsWithAll"
                optionLabel="label"
                optionValue="value"
                v-model="filters['pentashih.name'].value"
                class="w-full"
                showClear
              />
              <label for="pentashihFilter">Pentashih</label>
            </FloatLabel>
            <Divider layout="vertical" class="h-full border-none" />
            <IconField iconPosition="left" class="block mt-2 md:mt-0">
              <InputIcon class="pi pi-search" />
              <InputText class="w-96" v-model="filters['santri.name'].value" placeholder="Cari santri..." />
            </IconField>
          </div>

          <ToggleButton v-model="columnFreeze" onIcon="pi pi-lock-open" offIcon="pi pi-lock" onLabel="Unfreeze Column" offLabel="Freeze Column" />
        </div>

        <template v-if="loading">
          <div class="border border-slate-200 rounded-lg px-6 py-4">
            <!-- Header Skeleton -->
            <div class="flex gap-4 mb-4 border-b border-slate-200 py-6">
              <Skeleton shape="circle" size="2rem" class="mb-1" />
              <div class="flex gap-4 w-full">
                <Skeleton width="25%" height="2rem" class="mb-1" />
                <Skeleton width="25%" height="2rem" class="mb-1" />
                <Skeleton width="25%" height="2rem" class="mb-1" />
                <Skeleton width="25%" height="2rem" class="mb-1" />
              </div>
            </div>

            <div v-for="i in 10" :key="i" class="flex gap-4 mb-2 items-center py-2 hover:bg-surface-100 transition-colors duration-200">
              <Skeleton shape="circle" size="2rem" class="mr-2" />
              <div class="flex gap-4 w-full">
                <Skeleton width="25%" height="1.5rem" />
                <Skeleton width="25%" height="1.5rem" />
                <Skeleton width="25%" height="1.5rem" />
                <Skeleton width="25%" height="1.5rem" />
              </div>
            </div>
          </div>
        </template>

        <DataTable
          v-else
          ref="dt"
          :value="daftarSantri"
          dataKey="santri.id"
          :filters="filters"
          showGridlines
          :class="{ 'edit-mode': isEditMode, 'rounded-table': true }"
          scrollable
          scrollHeight="flex"
          :scrollDirection="'horizontal'"
          tableStyle="width:100rem;"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50, 100]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} santri"
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="No." headerStyle="min-width:3rem; font-weight: bold" :rowspan="3" :frozen="true" />
              <Column
                header="Nama"
                headerStyle="min-width:8rem; border-right: 1px solid var(--p-datatable-body-cell-border-color); font-weight: bold"
                :rowspan="3"
                :frozen="true"
              />
              <Column header="Angkatan" headerStyle="min-width:6rem; border-left: none; font-weight: bold" :rowspan="3" />
              <Column header="Gender" headerStyle="min-width:6rem; font-weight: bold" :rowspan="3" />
              <Column header="Kode" headerStyle="min-width:6rem; font-weight: bold" :rowspan="3" />
              <div v-for="col in columnGroups.level1" :key="col.header">
                <Column :header="col.header" :colspan="col.colspan" style="font-weight: bold" />
              </div>
              <Column header="Pentashih" :rowspan="3" :frozen="columnFreeze" alignFrozen="right" />
              <Column header="Update Terakhir" :rowspan="3" style="min-width: 8rem; font-weight: bold" :frozen="columnFreeze" alignFrozen="right" />
            </Row>
            <Row>
              <div v-for="col in columnGroups.level2" :key="col.header">
                <Column :header="col.header" :colspan="col.colspan" style="font-weight: bold" />
              </div>
            </Row>
            <Row>
              <div v-for="col in columnGroups.level3" :key="col.field">
                <Column :header="col.header" style="font-weight: bold" />
              </div>
            </Row>
          </ColumnGroup>

          <Column :frozen="true" style="z-index: 2">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>

          <Column
            field="santri.name"
            :sortable="true"
            style="border-right: 1px solid var(--p-datatable-body-cell-border-color) !important"
            :frozen="true"
          >
            <template #body="slotProps">
              {{ slotProps.data.santri.name }}
            </template>
          </Column>
          <Column field="santri.angkatan" style="min-width: 6rem; border-left: none" :sortable="true">
            <template #body="slotProps">
              {{ slotProps.data.santri.angkatan }}
            </template>
          </Column>
          <Column field="santri.gender" class="capitalize" style="min-width: 6rem" :sortable="true">
            <template #body="slotProps">
              {{ getGenderLabel(slotProps.data.santri.gender) }}
            </template>
          </Column>
          <Column field="santri.code">
            <template #body="slotProps">
              {{ slotProps.data.santri.code }}
            </template>
          </Column>

          <template v-for="subject in subjects">
            <Column :key="subject.id" v-if="subject.has_setoran" :field="`subjects.${subject.name}.setoran`">
              <template #body="slotProps">
                <div class="cell-editing w-28">
                  <Tag
                    v-show="editingCell !== `${slotProps.data.santri.id}-${subject.name}-setoran`"
                    :value="slotProps.data.subjects[subject.name]?.setoran"
                    :severity="getBadgeSeverity(slotProps.data.subjects[subject.name]?.setoran)"
                    class="grade-tag"
                    :class="{ clickable: isEditMode }"
                    @click="isEditMode && (editingCell = `${slotProps.data.santri.id}-${subject.name}-setoran`)"
                  />
                  <Select
                    v-show="editingCell === `${slotProps.data.santri.id}-${subject.name}-setoran`"
                    v-model="slotProps.data.subjects[subject.name].setoran"
                    :options="statusOptions"
                    class="grade-dropdown"
                    @change="
                      (event) => {
                        console.log('Select changed:', event);
                        const newValue = event.value;

                        // Update nilai langsung di data
                        slotProps.data.subjects[subject.name].setoran = newValue;

                        // Panggil onCellEditComplete
                        onCellEditComplete({
                          data: slotProps.data,
                          newValue: newValue,
                          field: `${subject.name}_setoran`,
                        });
                      }
                    "
                    @blur="onCellEditCancel"
                  />
                </div>
              </template>
            </Column>

            <Column :key="`${subject.id}-hafalan`" v-if="subject.has_hafalan" :field="`subjects.${subject.name}.hafalan`">
              <template #body="slotProps">
                <div class="cell-editing w-28">
                  <Tag
                    v-show="editingCell !== `${slotProps.data.santri.id}-${subject.name}-hafalan`"
                    :value="slotProps.data.subjects[subject.name]?.hafalan"
                    :severity="getBadgeSeverity(slotProps.data.subjects[subject.name]?.hafalan)"
                    class="grade-tag"
                    :class="{ clickable: isEditMode }"
                    @click="isEditMode && (editingCell = `${slotProps.data.santri.id}-${subject.name}-hafalan`)"
                  />
                  <Select
                    v-show="editingCell === `${slotProps.data.santri.id}-${subject.name}-hafalan`"
                    v-model="slotProps.data.subjects[subject.name].hafalan"
                    :options="statusOptions"
                    class="grade-dropdown"
                    @change="
                      (event) => {
                        console.log('Select changed:', event);
                        const newValue = event.value;

                        // Update nilai langsung di data
                        slotProps.data.subjects[subject.name].hafalan = newValue;

                        // Panggil onCellEditComplete
                        onCellEditComplete({
                          data: slotProps.data,
                          newValue: newValue,
                          field: `${subject.name}_hafalan`,
                        });
                      }
                    "
                    @blur="onCellEditCancel"
                  />
                </div>
              </template>
            </Column>
          </template>

          <Column field="pentashih.name" headerStyle="min-width:5rem" :frozen="columnFreeze" alignFrozen="right">
            <template #body="slotProps">
              <div class="cell-editing w-32">
                <template v-if="isEditMode">
                  <Select
                    v-model="slotProps.data.pentashih.id"
                    :options="pentashihOptionsWithAll"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    @change="handlePentashihChange(slotProps.data)"
                  />
                </template>
                <template v-else>
                  {{ slotProps.data.pentashih.name }}
                </template>
              </div>
            </template>
          </Column>
          <Column field="tanggal" headerStyle="min-width:5rem" :frozen="columnFreeze" alignFrozen="right">
            <template #body="slotProps">
              <div class="cell-editing w-36">
                <template v-if="isEditMode">
                  <DatePicker
                    v-model="slotProps.data.tanggal"
                    :showIcon="true"
                    :dateFormat="isValidDate(slotProps.data.tanggal) ? 'dd/mm/yy' : ''"
                    :maxDate="new Date()"
                    :value="isValidDate(slotProps.data.tanggal) ? new Date(slotProps.data.tanggal) : null"
                    class="w-full"
                    @date-select="handleDateChange(slotProps.data)"
                  />
                </template>
                <template v-else>
                  {{ slotProps.data.tanggal ? formatDate(slotProps.data.tanggal) : '-' }}
                </template>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
