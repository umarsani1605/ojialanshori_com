<script setup>
import { onMounted, ref } from 'vue';
import { useDialog } from 'primevue/usedialog';
import { useGradeStore } from '@/stores/gradeStore';
import { useSantriStore } from '@/stores/santriStore';
import GradeFormDialog from '@/components/dialogs/GradeFormDialog.vue';
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue';

const dialog = useDialog();
const dt = ref();
const daftarGrade = ref([]);
const pentashihList = ref([]);
const categoryList = ref([]);
const subjectList = ref([]);
const loading = ref(false);
const error = ref(null);
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  santri_name: { value: null, matchMode: 'contains' },
  pentashih_name: { value: null, matchMode: 'contains' },
  category_name: { value: null, matchMode: 'contains' },
  subject_name: { value: null, matchMode: 'contains' },
  hafalan: { value: null, matchMode: 'equals' },
  setoran: { value: null, matchMode: 'equals' },
});

const gradeStore = useGradeStore();
const santriStore = useSantriStore();

const getStatusClass = (status) => {
  switch (status) {
    case 'sudah':
      return 'bg-green-100 text-green-700';
    case 'proses':
      return 'bg-yellow-100 text-yellow-700';
    case 'belum':
      return 'bg-red-100 text-red-700';
    default:
      return '';
  }
};

const fetchAllData = async () => {
  loading.value = true;
  try {
    console.log('Memulai pengambilan data...');

    const [gradesRes, pentashihRes] = await Promise.all([gradeStore.getAll(), santriStore.getAll({ role: 'pentashih' })]);

    await Promise.all([gradeStore.fetchCategories(), gradeStore.fetchSubjects()]);

    console.log('Response dari grade:', gradesRes);
    console.log('Response dari pentashih:', pentashihRes);
    console.log('Response dari kategori:', gradeStore.getCategories);
    console.log('Response dari subject:', gradeStore.getSubjects);

    daftarGrade.value = gradesRes.data;
    pentashihList.value = pentashihRes.data;
    categoryList.value = gradeStore.getCategories;
    subjectList.value = gradeStore.getSubjects;

    console.log('Data berhasil disimpan ke state:');
    console.log('daftarGrade:', daftarGrade.value);
    console.log('pentashihList:', pentashihList.value);
    console.log('categoryList:', categoryList.value);
    console.log('subjectList:', subjectList.value);
  } catch (error) {
    console.error('Error saat mengambil data:', error);
    console.error('Detail error:', {
      message: error.message,
      stack: error.stack,
    });
    error.value = 'Gagal mengambil data';
  } finally {
    loading.value = false;
    console.log('Proses pengambilan data selesai');
  }
};

const addHandler = () => {
  dialog.open(GradeFormDialog, {
    props: {
      header: 'Tambah Grade',
      style: {
        minWidth: '32rem',
      },
      modal: true,
    },
    data: {
      pentashihList: pentashihList.value,
      categoryList: categoryList.value,
      subjectList: subjectList.value,
    },
    emits: {
      onSave: (data) => {
        saveData(data);
      },
      onCancel: () => {},
    },
  });
};

const editHandler = (grade) => {
  dialog.open(GradeFormDialog, {
    props: {
      header: 'Edit Grade',
      style: {
        minWidth: '32rem',
      },
      modal: true,
    },
    data: {
      ...grade,
      pentashihList: pentashihList.value,
      categoryList: categoryList.value,
      subjectList: subjectList.value,
    },
    emits: {
      onSave: (data) => {
        saveData(data);
      },
      onCancel: () => {},
    },
  });
};

const saveData = async (data) => {
  try {
    if (data.id) {
      await gradeStore.update(data.id, data);
    } else {
      await gradeStore.create(data);
    }
    await fetchAllData();
  } catch (error) {
    console.error('Error saving grade: ', error);
  }
};

const deleteHandler = (grade) => {
  dialog.open(DeleteDialog, {
    props: {
      header: 'Hapus Grade',
      style: {
        width: '32rem',
      },
      modal: true,
    },
    data: grade,
    emits: {
      onConfirm: (data) => {
        console.log('masuk delete, data: ', data);
        deleteData(data.id);
      },
      onCancel: () => {},
    },
  });
};

const deleteData = async (id) => {
  try {
    await gradeStore.remove(id);
    await fetchAllData();
  } catch (error) {
    console.error('Error deleting grade: ', error);
  }
};

const fetchDaftarSantri = async () => {
  try {
    await santriStore.getAll();
  } catch (error) {
    console.error('Error fetching santri:', error);
  }
};

onMounted(() => {
  fetchAllData();
});
</script>

<template>
  <div class="card bg-white border-slate-200 rounded-lg border p-8 h-full">
    <div class="flex flex-col gap-2">
      <!-- <h3 class="text-2xl font-bold">Daftar Grade</h3> -->
      <Toolbar class="toolbar !px-0 !border-none">
        <template #end>
          <div class="flex gap-4">
            <IconField iconPosition="left" class="block w-80 mt-2 md:mt-0">
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Cari grade..." class="w-full" />
            </IconField>
            <Button label="Tambah Grade" icon="pi pi-plus" severity="primary" @click="addHandler" />
          </div>
        </template>
      </Toolbar>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-4">Loading...</div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 text-red-500">
      {{ error }}
    </div>

    <!-- Data Table -->
    <DataTable
      v-else
      ref="dt"
      :value="daftarGrade"
      :filters="filters"
      dataKey="id"
      showGridlines
      stripedRows
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} grade"
      :globalFilterFields="['santri_name', 'pentashih_name', 'category_name', 'subject_name', 'hafalan', 'setoran']"
      tableStyle="min-width: 50rem"
      filterDisplay="menu"
      class="p-datatable-hoverable rounded-table"
    >
      <Column field="index" header="No." style="width: 4rem">
        <template #body="{ data }">
          {{ data.index }}
        </template>
      </Column>

      <Column field="santri_name" header="Santri" sortable style="min-width: 12rem" />
      <Column field="pentashih_name" header="Pentashih" sortable style="min-width: 12rem" />
      <Column field="category_name" header="Kategori" sortable style="min-width: 10rem" />
      <Column field="subject_name" header="Mata Pelajaran" sortable style="min-width: 12rem" />

      <Column field="hafalan" header="Status Hafalan" class="capitalize" sortable>
        <template #body="{ data }">
          <Tag :value="data.hafalan" :class="getStatusClass(data.hafalan)" />
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="gradeStore.getHafalanStatusList"
            placeholder="Pilih Status"
            class="p-column-filter capitalize"
            showClear
          />
        </template>
      </Column>

      <Column field="setoran" header="Status Setoran" class="capitalize" sortable>
        <template #body="{ data }">
          <Tag :value="data.setoran" :class="getStatusClass(data.setoran)" />
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="gradeStore.getSetoranStatusList"
            placeholder="Pilih Status"
            class="p-column-filter capitalize"
            showClear
          />
        </template>
      </Column>

      <Column :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2 justify-end">
            <Button icon="pi pi-pencil" rounded outlined aria-label="Edit" @click="editHandler(data)" />
            <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" @click="deleteHandler(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <DynamicDialog />
  </div>
</template>
<style scoped>
.p-datatable-thead .p-datatable-column-title {
  font-weight: 800;
  margin-inline-end: auto;
}
.p-datatable-thead .p-datatable-column-title + span {
  display: inline-flex;
}
.p-datatable-thead .p-datatable-popover-filter {
  margin-inline-start: 0;
}
.p-datatable.p-datatable-hoverable .p-datatable-tbody > tr:not(.p-highlight):hover {
  background: #f4f4f4;
  color: #495057;
}

.p-datatable.p-datatable-hoverable .p-datatable-tbody > tr {
  transition: background-color 0.2s;
}

/* Style untuk opsi dropdown role */
.p-select-list-container .p-select-option-label {
  text-transform: capitalize;
}

/* Style untuk button */
.p-button-outlined.p-button-secondary {
  border-color: #cbd5e1 !important;
}
.p-button-outlined.p-button-secondary:hover {
  border-color: #94a3b8 !important;
}

/* Style untuk table */
.toolbar {
  border: none;
}

.p-datatable .p-datatable-tbody > tr {
  height: 4.5rem;
}

.p-column-title {
  width: 100%;
  text-align: center;
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

/* Border radius untuk sudut-sudut tabel */
.rounded-table {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--surface-200);
}

.rounded-table .p-datatable-wrapper {
  border-radius: 0.5rem;
  overflow: hidden;
}

.rounded-table .p-datatable-thead > tr:first-child > th:first-child {
  border-top-left-radius: 0.5rem;
}

.rounded-table .p-datatable-thead > tr:first-child > th:last-child {
  border-top-right-radius: 0.5rem;
}

.rounded-table .p-datatable-tbody > tr:last-child > td:first-child {
  border-bottom-left-radius: 0.5rem;
}

.rounded-table .p-datatable-tbody > tr:last-child > td:last-child {
  border-bottom-right-radius: 0.5rem;
}
</style>
