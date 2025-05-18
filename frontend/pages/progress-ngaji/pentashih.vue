<script setup>
import { onMounted, ref, computed } from 'vue';
import { useDialog } from 'primevue/usedialog';
import { useGradeStore } from '@/stores/gradeStore';
import PentashihFormDialog from '@/components/dialogs/PentashihFormDialog.vue';
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import { useSantriStore } from '@/stores/santriStore';

const dialog = useDialog();
const dt = ref();
const daftarPentashih = ref([]);
const loading = ref(false);
const error = ref(null);
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { value: null, matchMode: 'contains' },
});
const sortField = ref(null);
const sortOrder = ref(null);
const santriStore = useSantriStore();
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

const fetchDaftarPentashih = async () => {
  loading.value = true;
  try {
    await gradeStore.fetchPentashih();
    daftarPentashih.value = gradeStore.getPentashihList;
  } catch (error) {
    console.error('Fetch Error: Gagal mengambil data pentashih, ', error);
    error.value = 'Fetch Error: Gagal mengambil data pentashih';
  } finally {
    loading.value = false;
  }
};

const addHandler = () => {
  dialog.open(PentashihFormDialog, {
    props: {
      header: 'Tambah Pentashih',
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

const editHandler = (pentashih) => {
  dialog.open(PentashihFormDialog, {
    props: {
      header: 'Edit Pentashih',
      style: {
        minWidth: '32rem',
      },
      modal: true,
    },
    data: { ...pentashih },
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
      await gradeStore.updatePentashih(data.id, data);
    } else {
      await gradeStore.createPentashih(data);
    }
    await fetchDaftarPentashih();
  } catch (error) {
    console.error('Error saving pentashih: ', error);
  }
};

const deleteHandler = (pentashih) => {
  dialog.open(DeleteDialog, {
    props: {
      header: 'Hapus Pentashih',
      modal: true,
    },
    data: pentashih,
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
    await gradeStore.deletePentashih(id);
    await fetchDaftarPentashih();
  } catch (error) {
    console.error('Error deleting pentashih: ', error);
  }
};

const getGenderLabel = (gender) => {
  return santriStore.getGenderLabel(gender);
};

const getGenderSeverity = (gender) => {
  return gender === 'male' ? 'info' : 'warning';
};

onMounted(() => {
  fetchDaftarPentashih();
});
</script>

<template>
  <div class="card bg-white border-slate-200 rounded-lg border p-8 h-full">
    <div class="flex flex-col gap-2">
      <!-- <h3 class="text-2xl font-bold">Daftar Pentashih</h3> -->
      <Toolbar class="toolbar !px-0 !border-none">
        <template #start>
          <Button v-if="showResetButton" type="button" icon="pi pi-filter-slash" label="Bersihkan" outlined @click="clearTable()" />
        </template>
        <template #end>
          <div class="flex gap-4">
            <IconField iconPosition="left" class="block w-80 mt-2 md:mt-0">
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Cari pentashih..." class="w-full" />
            </IconField>
            <Button label="Tambah Pentashih" icon="pi pi-plus" severity="primary" @click="addHandler" />
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
      :value="daftarPentashih"
      :filters="filters"
      removableSort
      dataKey="id"
      showGridlines
      stripedRows
      :globalFilterFields="['name']"
      tableStyle="min-width: 50rem"
      filterDisplay="menu"
      class="p-datatable-hoverable rounded-table"
    >
      <Column field="id" header="No." style="width: 2rem">
        <template #body="{ data }">
          {{ data.id }}
        </template>
      </Column>

      <Column field="name" header="Nama Pentashih" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.name }}
        </template>
      </Column>

      <Column field="gender" header="Gender" sortable style="width: 10rem">
        <template #body="{ data }">
          <Tag :value="getGenderLabel(data.gender)" :severity="getGenderSeverity(data.gender)" />
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="santriStore.getGenderList"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Gender"
            class="p-column-filter"
            :showClear="true"
          >
            <template #value="slotProps">
              <Tag v-if="slotProps.value" :value="getGenderLabel(slotProps.value)" :severity="getGenderSeverity(slotProps.value)" />
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <Tag :value="slotProps.option.label" :severity="getGenderSeverity(slotProps.option.value)" />
            </template>
          </Dropdown>
        </template>
      </Column>

      <Column field="santri_list" header="Daftar Santri" style="min-width: 20rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-2">
            <Chip
              v-for="santri in data.santri_list"
              :key="santri.id"
              :label="santri.name"
              class="!bg-[var(--p-primary-100)] !text-[var(--p-primary-800)] !px-4 !rounded-2xl font-medium"
            />
          </div>
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
