<script setup>
import { onMounted, ref, computed } from 'vue';
import { useDialog } from 'primevue/usedialog';
import { useGradeStore } from '@/stores/gradeStore';
import SubjectFormDialog from '@/components/dialogs/SubjectFormDialog.vue';
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue';

const dialog = useDialog();
const dt = ref();
const daftarSubject = ref([]);
const loading = ref(false);
const error = ref(null);
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { value: null, matchMode: 'contains' },
});
const sortField = ref(null);
const sortOrder = ref(null);

const gradeStore = useGradeStore();

const hasActiveFilters = computed(() => {
  return Object.keys(filters.value).some((key) => filters.value[key].value !== null && filters.value[key].value !== '');
});

const hasActiveSort = computed(() => {
  return sortField.value !== null && sortOrder.value !== null;
});

const showResetButton = computed(() => {
  return hasActiveFilters.value || hasActiveSort.value;
});

const clearTable = async () => {
  sortField.value = null;
  sortOrder.value = null;

  Object.keys(filters.value).forEach((key) => {
    filters.value[key].value = null;
  });
};

const fetchDaftarSubject = async () => {
  loading.value = true;
  try {
    await gradeStore.fetchSubjects();
    daftarSubject.value = gradeStore.getSubjects;
  } catch (error) {
    console.error('Fetch Error: Gagal mengambil data subject, ', error);
    error.value = 'Fetch Error: Gagal mengambil data subject';
  } finally {
    loading.value = false;
  }
};

const addHandler = () => {
  dialog.open(SubjectFormDialog, {
    props: {
      header: 'Tambah Mata Pelajaran',
      style: {
        minWidth: '32rem',
      },
      modal: true,
    },
    data: {},
    emits: {
      onSave: (data) => {
        saveData(data);
      },
      onCancel: () => {},
    },
  });
};

const editHandler = (subject) => {
  dialog.open(SubjectFormDialog, {
    props: {
      header: 'Edit Mata Pelajaran',
      style: {
        minWidth: '32rem',
      },
      modal: true,
    },
    data: { ...subject },
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
      await gradeStore.updateSubject(data.id, data);
    } else {
      await gradeStore.createSubject(data);
    }
    await fetchDaftarSubject();
  } catch (error) {
    console.error('Error saving subject: ', error);
  }
};

const deleteHandler = (subject) => {
  dialog.open(DeleteDialog, {
    props: {
      header: 'Hapus Mata Pelajaran',
      modal: true,
    },
    data: subject,
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
    await gradeStore.deleteSubject(id);
    await fetchDaftarSubject();
  } catch (error) {
    console.error('Error deleting subject: ', error);
  }
};

onMounted(() => {
  fetchDaftarSubject();
});
</script>

<template>
  <div class="card bg-white border-slate-200 rounded-lg border p-8 h-full">
    <div class="flex flex-col gap-2">
      <!-- <h3 class="text-2xl font-bold">Daftar Mata Pelajaran</h3> -->
      <Toolbar class="toolbar !px-0 !border-none">
        <template #start>
          <Button v-if="showResetButton" type="button" icon="pi pi-filter-slash" label="Bersihkan" outlined @click="clearTable()" />
        </template>
        <template #end>
          <div class="flex gap-4">
            <IconField iconPosition="left" class="block w-80 mt-2 md:mt-0">
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Cari mata pelajaran..." class="w-full" />
            </IconField>
            <Button label="Tambah Mata Pelajaran" icon="pi pi-plus" severity="primary" @click="addHandler" />
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
      :value="daftarSubject"
      :filters="filters"
      removableSort
      dataKey="id"
      showGridlines
      stripedRows
      :globalFilterFields="['name', 'category_name']"
      tableStyle="min-width: 50rem"
      filterDisplay="menu"
      class="p-datatable-hoverable rounded-table"
    >
      <Column field="index" header="No." style="width: 2rem">
        <template #body="{ data }">
          {{ data.index }}
        </template>
      </Column>

      <Column field="name" header="Nama" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.name }}
        </template>
      </Column>

      <Column field="category_name" header="Kategori" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.category_name }}
        </template>
      </Column>

      <Column field="has_hafalan" header="Hafalan" style="min-width: 8rem">
        <template #body="{ data }">
          <i :class="data.has_hafalan ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
        </template>
      </Column>

      <Column field="has_setoran" header="Setoran" style="min-width: 8rem">
        <template #body="{ data }">
          <i :class="data.has_setoran ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
        </template>
      </Column>

      <Column style="width: 8rem">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editHandler(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteHandler(slotProps.data)" />
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
