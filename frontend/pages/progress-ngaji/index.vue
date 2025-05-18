<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onMounted, ref, computed } from 'vue';
import Divider from 'primevue/divider';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import { useSantriStore } from '@/stores/santriStore';
import { useGradeStore } from '@/stores/gradeStore';

const toast = useToast();
const gradeStore = useGradeStore();
const santriStore = useSantriStore();

const daftarSantri = ref([]);
const originalData = ref([]); // Untuk menyimpan data original sebelum edit
const editedGrades = ref([]); // Untuk menyimpan data yang diedit

const dt = ref(null);
const filters = ref({});

// State untuk menyimpan data
const categories = ref([]);
const subjects = ref([]);
const loading = ref(false);
const error = ref(null);

const editingCell = ref(null);
const statusOptions = ['belum', 'proses', 'sudah'];

// Tambahkan state untuk mode edit
const isEditMode = ref(false);

// Tambahkan state untuk daftar pentashih
const pentashihList = ref([]);

const columnFreeze = ref(false);

// List opsi untuk filter angkatan (bisa dibuat dinamis dari data yang ada)
const angkatanOptions = ref([]);

const sessionUserId = ref(1); // ID pengguna yang sedang aktif
const sessionUserName = ref('Admin'); // Nama pengguna yang sedang aktif

const getSantriGrades = async () => {
  loading.value = true;
  try {
    const santriRes = await santriStore.getAll();
    const gradeRes = await gradeStore.getAll();

    console.log('gradeRes: ' + JSON.stringify(gradeRes));

    // Transform data untuk tabel
    daftarSantri.value = santriRes.data.map((santri) => {
      // Inisialisasi objek subjects dengan semua subject yang ada
      const subjectsData = {};

      // Isi default value untuk semua subject
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

      // Filter grade untuk santri ini
      const santriGrades = gradeRes.data.filter((g) => g.id_santri === santri.id);

      console.log('santriGrades: ' + JSON.stringify(santriGrades));

      // Update nilai dari grade yang ada
      santriGrades.forEach((grade) => {
        const subjectName = grade.subject_name;

        // Update nilai sesuai data grade
        if (grade.setoran) {
          subjectsData[subjectName].setoran = grade.setoran;
        }
        if (grade.hafalan) {
          subjectsData[subjectName].hafalan = grade.hafalan;
        }

        // Update pentashih dan tanggal jika ada perubahan nilai
        if (grade.setoran !== 'belum' || grade.hafalan !== 'belum') {
          subjectsData[subjectName].pentashih = {
            id: grade.id_pentashih,
            name: grade.pentashih_name,
          };
          subjectsData[subjectName].date = grade.updated_at;
        }
      });

      // Ambil pentashih dan tanggal terakhir dari grade yang bukan 'belum'
      const latestGrade = santriGrades
        .filter((g) => g.setoran !== 'belum' || g.hafalan !== 'belum')
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

      console.log('subjectsData' + subjectsData);

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

onBeforeMount(() => {
  initFilters();
});

onMounted(async () => {
  await fetchData(); // Ambil kategori dan subject dulu
  await getSantriGrades(); // Kemudian ambil data santri dan grade

  // Tambahkan kode ini setelah data diambil
  angkatanOptions.value = getUniqueAngkatan();

  console.log('columnGroups: ' + JSON.stringify(columnGroups.value));
  console.log('santri: ' + JSON.stringify(daftarSantri.value));
});

const exportCSV = () => {
  dt.value.exportCSV();
};

const initFilters = () => {
  filters.value = {
    'santri.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'santri.angkatan': { value: null, matchMode: FilterMatchMode.EQUALS },
    'santri.gender': { value: null, matchMode: FilterMatchMode.EQUALS },
    'pentashih.name': { value: null, matchMode: FilterMatchMode.EQUALS },
  };
};

// Fungsi untuk fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    // Gunakan gradeStore untuk mengambil data kategori, subjek, dan pentashih
    await Promise.all([gradeStore.fetchCategories(), gradeStore.fetchSubjects(), gradeStore.fetchPentashih()]);

    // Gunakan getter dari gradeStore
    categories.value = gradeStore.getCategories;
    subjects.value = gradeStore.getSubjects;

    // Format daftar pentashih untuk dropdown
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

const columnGroups = computed(() => {
  // Tingkat 1: Kategori
  const level1 = categories.value.map((category) => ({
    header: category.name,
    colspan: subjects.value
      .filter((s) => s.id_category === category.id)
      .reduce((acc, subj) => acc + (subj.has_hafalan ? 1 : 0) + (subj.has_setoran ? 1 : 0), 0),
  }));

  // Tingkat 2: Subyek
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

  // Tingkat 3: Setoran/Hafalan
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

const getGenderSeverity = (gender) => {
  return gender === 'male' ? 'info' : 'warning';
};

const onCellEditComplete = ({ data, newValue, field }) => {
  if (!isEditMode.value) return;

  console.log('🔍 data:', JSON.stringify(data));
  console.log('🔍 newValue:', newValue);
  console.log('🔍 field:', field);

  // Ekstrak informasi dari field (format: subjectName_gradeType)
  const [subjectName, gradeType] = field.split('_');
  console.log('🔍 subjectName:', subjectName);
  console.log('🔍 gradeType:', gradeType);

  // Update nilai grade di data
  if (gradeType === 'setoran' || gradeType === 'hafalan') {
    // Update nilai di subjects
    data.subjects[subjectName][gradeType] = newValue;

    // Jika nilai baru tidak 'belum', update pentashih dan tanggal
    if (newValue !== 'belum') {
      data.subjects[subjectName].pentashih = {
        id: sessionUserId.value,
        name: sessionUserName.value,
      };
      data.subjects[subjectName].date = new Date().toISOString().split('T')[0];
    }

    // Track perubahan untuk disimpan nanti
    trackChange({
      data,
      subjectName,
      gradeType,
      newValue,
    });
  }

  // Reset editingCell
  editingCell.value = null;
};

const onCellEditCancel = () => {
  if (!isEditMode.value) return;
  editingCell.value = null;
};

// Tambahkan fungsi untuk toggle edit mode
const toggleEditMode = () => {
  if (isEditMode.value) {
    // Jika sedang dalam mode edit dan tombol "Simpan" ditekan
    saveChanges();
  } else {
    // Jika akan masuk mode edit, simpan data original
    originalData.value = JSON.parse(JSON.stringify(daftarSantri.value));
    editedGrades.value = []; // Reset daftar perubahan
  }

  isEditMode.value = !isEditMode.value;

  // Reset editing cell saat mode edit dimatikan
  if (!isEditMode.value) {
    editingCell.value = null;
  }
};

// Tambahkan fungsi untuk cancel edit mode
const cancelEditMode = () => {
  isEditMode.value = false;
  editingCell.value = null;

  // Kembalikan data ke kondisi awal
  daftarSantri.value = JSON.parse(JSON.stringify(originalData.value));
  editedGrades.value = []; // Reset daftar perubahan

  toast.add({ severity: 'info', summary: 'Dibatalkan', detail: 'Perubahan telah dibatalkan', life: 3000 });
};

// Fungsi untuk melacak perubahan yang dilakukan
const trackChange = ({ data, subjectName, gradeType, newValue }) => {
  console.log('🔍 trackChange dipanggil dengan:', { data, subjectName, gradeType, newValue });

  const subject = data.subjects[subjectName];

  // Format data dalam struktur yang lebih terorganisir
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

  // Cek apakah sudah ada perubahan untuk santri dan subject yang sama
  const existingIndex = editedGrades.value.findIndex((item) => item.santri.id === changeData.santri.id && item.subject.id === changeData.subject.id);

  console.log('🔍 editedGrades sebelum update:', JSON.stringify(editedGrades.value, null, 2));

  if (existingIndex !== -1) {
    // Update data yang sudah ada dengan mempertahankan nilai yang tidak berubah
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
    // Tambahkan perubahan baru
    editedGrades.value.push(changeData);
  }

  console.log('🔍 editedGrades setelah update:', JSON.stringify(editedGrades.value, null, 2));
};

// Fungsi untuk menyimpan perubahan ke backend
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

    // Tambahkan setiap perubahan ke gradeStore
    editedGrades.value.forEach((change) => {
      gradeStore.addEditedGrade(change);
    });

    // Simpan semua perubahan menggunakan gradeStore
    await gradeStore.saveAllChanges();

    // Refresh data
    await getSantriGrades();

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `${editedGrades.value.length} perubahan berhasil disimpan`,
      life: 3000,
    });

    // Reset daftar perubahan
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

// Fungsi untuk memeriksa validitas tanggal
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Fungsi untuk mendapatkan angkatan yang unik dari data santri
const getUniqueAngkatan = () => {
  const angkatanSet = new Set();

  daftarSantri.value.forEach((santri) => {
    if (santri.santri.angkatan) {
      angkatanSet.add(santri.santri.angkatan);
    }
  });

  const options = Array.from(angkatanSet).map((angkatan) => ({
    label: angkatan,
    value: angkatan,
  }));

  return options;
};

// Tambahkan fungsi untuk mendapatkan daftar pentashih
const getPentashihOptionsWithAll = () => {
  if (pentashihList.value.length === 0) return [];

  // Buat salinan daftar pentashih
  const options = [...pentashihList.value];

  return options;
};

// Buat computed property untuk opsi pentashih dengan "Semua"
const pentashihOptionsWithAll = computed(() => {
  return getPentashihOptionsWithAll();
});

// Handler perubahan pentashih
const handlePentashihChange = (data) => {
  if (!isEditMode.value) return;

  console.log('🔍 handlePentashihChange data:', JSON.stringify(data));

  // Cari pentashih berdasarkan nilai id yang dipilih
  const pentashihOption = pentashihList.value.find((p) => p.value === data.pentashih.id);
  const pentashihId = data.pentashih.id;
  const pentashihName = pentashihOption?.label || 'Admin';

  // Update nilai pentashih di data
  data.pentashih.name = pentashihName;

  // Cari semua subject untuk santri ini yang memiliki grade
  const santriId = data.santri.id;
  const subjects = Object.keys(data.subjects);

  console.log('🔍 Mencari subjects untuk santri:', santriId);
  console.log('🔍 Daftar subjects:', subjects);

  // Untuk setiap subject, track perubahan pentashih
  subjects.forEach((subjectName) => {
    const subjectData = data.subjects[subjectName];
    console.log('🔍 Memproses subject:', subjectName, JSON.stringify(subjectData));

    // Track perubahan untuk setoran jika nilainya bukan 'belum'
    if (subjectData.setoran && subjectData.setoran !== 'belum') {
      console.log('🔍 Memproses setoran untuk', subjectName);

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

      console.log('🔍 trackChange untuk setoran:', JSON.stringify(changeData));
      trackChange(changeData);
    }

    // Track perubahan untuk hafalan jika nilainya bukan 'belum'
    if (subjectData.hafalan && subjectData.hafalan !== 'belum') {
      console.log('🔍 Memproses hafalan untuk', subjectName);

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

      console.log('🔍 trackChange untuk hafalan:', JSON.stringify(changeData));
      trackChange(changeData);
    }
  });

  // Update tanggal juga
  data.tanggal = new Date().toISOString();
};

// Handler perubahan tanggal
const handleDateChange = (data) => {
  if (!isEditMode.value) return;

  console.log('🔍 handleDateChange data:', JSON.stringify(data));

  // Gunakan id_pentashih yang sudah ada di data
  const pentashihId = data.pentashih.id || 1;
  const pentashihOption = pentashihList.value.find((p) => p.value === pentashihId);
  const pentashihName = pentashihOption?.label || 'Admin';

  // Cari semua subject untuk santri ini yang memiliki grade
  const santriId = data.santri.id;
  const subjects = Object.keys(data.subjects);

  console.log('🔍 Mencari subjects untuk santri:', santriId);
  console.log('🔍 Daftar subjects:', subjects);

  // Update tanggal untuk semua grade yang nilainya bukan 'belum'
  subjects.forEach((subjectName) => {
    const subjectData = data.subjects[subjectName];
    console.log('🔍 Memproses subject:', subjectName, JSON.stringify(subjectData));

    // Track perubahan untuk setoran jika nilainya bukan 'belum'
    if (subjectData.setoran && subjectData.setoran !== 'belum') {
      console.log('🔍 Memproses setoran untuk', subjectName);

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

      console.log('🔍 trackChange untuk tanggal (setoran):', JSON.stringify(changeData));
      trackChange(changeData);
    }

    // Track perubahan untuk hafalan jika nilainya bukan 'belum'
    if (subjectData.hafalan && subjectData.hafalan !== 'belum') {
      console.log('🔍 Memproses hafalan untuk', subjectName);

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

      console.log('🔍 trackChange untuk tanggal (hafalan):', JSON.stringify(changeData));
      trackChange(changeData);
    }
  });
};
</script>
<template>
  <div class="card bg-white border-slate-200 rounded-lg border p-8 h-full">
    <Toolbar class="toolbar mb-2 !pt-0 !px-0 !border-none">
      <template v-slot:start>
        <div class="flex gap-4 items-center">
          <Button v-if="!isEditMode" label="Mode Edit" icon="pi pi-pencil" severity="primary" @click="toggleEditMode" />
          <template v-else>
            <Button label="Simpan" icon="pi pi-check" severity="primary" :loading="loading" @click="toggleEditMode" />
            <Button label="Batal" icon="pi pi-times" severity="secondary" outlined @click="cancelEditMode" :disabled="loading" />
            <Divider layout="vertical" class="h-full" />
          </template>
          <Button label="Export" icon="pi pi-upload" severity="secondary" :outlined="true" @click="exportCSV($event)" />
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
</template>

<style>
/* Style untuk button */
.p-button-outlined.p-button-secondary {
  border-color: #cbd5e1 !important;
}
.p-button-outlined.p-button-secondary:hover {
  border-color: #94a3b8 !important;
}
/* Style untuk table */
.p-datatable .p-datatable-tbody > tr {
  height: 4.5rem;
}

/* Style untuk cell editing */
.cell-editing {
  display: flex;
  align-items: center;
}

.grade-tag {
  border: none;
  text-transform: capitalize;
  width: 100%;
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease;
}

.grade-tag.clickable {
  cursor: pointer;
}

/* Efek hover normal untuk semua tag clickable */
.grade-tag.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

/* Shaky animation hanya pada mode edit */
.edit-mode .grade-tag.clickable {
  transition: opacity 0.2s ease, transform 0.2s ease;
  border: 1px dashed currentColor;
}

.grade-dropdown {
  width: 100%;
  text-transform: capitalize;
}

/* Tambahkan style untuk FloatLabel dalam tabel */
.cell-editing .p-float-label {
  width: 100%;
}

.cell-editing .p-float-label label {
  font-size: 0.75rem;
}

.cell-editing .p-float-label input,
.cell-editing .p-float-label .p-select {
  padding-top: 1.2rem;
  padding-bottom: 0.3rem;
}

/* Style untuk table */
.toolbar {
  border: none;
}

.p-column-title {
  width: 100%;
  text-align: center;
}

/* Tambahkan style untuk divider */
.p-divider.p-divider-vertical {
  margin: 0;
  padding: 0;
  border-left-width: 1px;
  min-height: 2.5rem;
}

/* Tambahkan style untuk mode edit */
.p-datatable.edit-mode {
  outline: 1px solid #0fb57e;
  border-color: transparent;
}

/* Tambahkan style untuk input dalam mode edit */
.p-datatable.edit-mode .cell-editing .p-dropdown,
.p-datatable.edit-mode .cell-editing .p-datepicker {
  width: 100%;
}

.p-datatable.edit-mode .cell-editing .p-calendar {
  width: 100%;
}

.p-datatable.edit-mode .cell-editing .p-inputtext {
  width: 100%;
  padding: 0.4rem;
}

/* Style untuk filter container */
.filter-container {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.filter-item label {
  color: #495057;
}

/* Style untuk skeleton loading */
.p-skeleton {
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  margin: 0;
  overflow: hidden;
  position: relative;
}

.p-skeleton::after {
  animation: p-skeleton-animation 1.5s infinite;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
  content: '';
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transform: translateX(-100%);
  z-index: 1;
}

@keyframes p-skeleton-animation {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

/* Animasi hover untuk skeleton rows */
.hover\:bg-surface-100:hover {
  background-color: var(--surface-100);
}

/* Transisi untuk efek hover */
.transition-colors {
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Border radius untuk sudut-sudut tabel */
/* Pendekatan yang lebih sederhana */
.rounded-table {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--surface-200);
}

/* Target container utama */
.rounded-table .p-datatable-wrapper {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Header baris pertama kolom pertama */
.rounded-table .p-datatable-thead > tr:first-child > th:first-child {
  border-top-left-radius: 0.5rem;
}

/* Header baris pertama kolom terakhir */
.rounded-table .p-datatable-thead > tr:first-child > th:last-child {
  border-top-right-radius: 0.5rem;
}

/* Body baris terakhir kolom pertama */
.rounded-table .p-datatable-tbody > tr:last-child > td:first-child {
  border-bottom-left-radius: 0.5rem;
}

/* Body baris terakhir kolom terakhir */
.rounded-table .p-datatable-tbody > tr:last-child > td:last-child {
  border-bottom-right-radius: 0.5rem;
}

/* Handling untuk frozen columns */
.rounded-table .p-datatable-tbody > tr:last-child > td.p-frozen-column:first-child {
  border-bottom-left-radius: 0.5rem !important;
}

.rounded-table .p-datatable-tbody > tr:last-child > td.p-frozen-column[align-frozen='right']:last-child {
  border-bottom-right-radius: 0.5rem !important;
}

.rounded-table .p-datatable-thead > tr:first-child > th.p-frozen-column:first-child {
  border-top-left-radius: 0.5rem !important;
}

.rounded-table .p-datatable-thead > tr:first-child > th.p-frozen-column[align-frozen='right']:last-child {
  border-top-right-radius: 0.5rem !important;
}

/* Untuk mencegah shadow pada frozen columns menutupi border-radius */
.rounded-table .p-frozen-column[aria-frozen='true']:not([align-frozen='right'])::after,
.rounded-table .p-frozen-column[aria-frozen='true'][align-frozen='right']::before {
  border-radius: inherit;
}
</style>
