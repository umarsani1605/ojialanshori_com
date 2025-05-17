<script setup>
// import { FilterMatchMode } from '@primevue/core/api';
import { ref, computed } from 'vue';
import { useDialog } from 'primevue/usedialog';
import SantriFormDialog from '@/components/dialogs/SantriFormDialog.vue';
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue';

const dialog = useDialog();
const dt = ref();

// Data Statis untuk Filter/Dropdown
const angkatanList = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
const jurusanList = ['IPA', 'IPS', 'Bahasa', 'Teknik'];
const roleList = ['santri', 'pengurus', 'ketua', 'pembina'];

// Data Statis Santri
const daftarSantri = ref(
  [
    {
      id: 1,
      name: 'Ahmad Fauzi',
      angkatan: '2019',
      gender: 'laki-laki',
      jurusan: 'IPA',
      role: 'santri',
    },
    {
      id: 2,
      name: 'Siti Aminah',
      angkatan: '2020',
      gender: 'perempuan',
      jurusan: 'IPS',
      role: 'pengurus',
    },
    {
      id: 3,
      name: 'Muhammad Rizki',
      angkatan: '2021',
      gender: 'laki-laki',
      jurusan: 'Teknik',
      role: 'ketua',
    },
    {
      id: 4,
      name: 'Fatimah Az-Zahra',
      angkatan: '2022',
      gender: 'perempuan',
      jurusan: 'Bahasa',
      role: 'santri',
    },
    {
      id: 5,
      name: 'Abdullah Malik',
      angkatan: '2023',
      gender: 'laki-laki',
      jurusan: 'IPA',
      role: 'santri',
    },
  ].map((santri, idx) => ({ ...santri, index: idx + 1 }))
);

// Filter State
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { value: null, matchMode: 'contains' },
  angkatan: { value: null, matchMode: 'contains' },
  gender: { value: null, matchMode: 'equals' },
  jurusan: { value: null, matchMode: 'contains' },
  role: { value: null, matchMode: 'contains' },
});

const sortField = ref(null);
const sortOrder = ref(null);

const hasActiveFilters = computed(() => {
  return Object.keys(filters.value).some((key) => filters.value[key].value !== null && filters.value[key].value !== '');
});

const hasActiveSort = computed(() => {
  return sortField.value !== null && sortOrder.value !== null;
});

const showResetButton = computed(() => {
  return hasActiveFilters.value || hasActiveSort.value;
});

const clearTable = () => {
  sortField.value = null;
  sortOrder.value = null;

  Object.keys(filters.value).forEach((key) => {
    filters.value[key].value = null;
  });
};

// Dialog Handlers
const addHandler = () => {
  dialog.open(SantriFormDialog, {
    props: {
      header: 'Tambah Santri',
      style: {
        minWidth: '32rem',
      },
      modal: true,
    },
    data: {},
    emits: {
      onSave: (data) => {
        // Tambah data baru ke array
        const newId = Math.max(...daftarSantri.value.map((s) => s.id)) + 1;
        daftarSantri.value.push({
          ...data,
          id: newId,
          index: daftarSantri.value.length + 1,
        });
      },
      onCancel: () => {},
    },
  });
};

const editHandler = (santri) => {
  dialog.open(SantriFormDialog, {
    props: {
      header: 'Edit Santri',
      style: {
        minWidth: '32rem',
      },
      modal: true,
    },
    data: { ...santri },
    emits: {
      onSave: (data) => {
        // Update data di array
        const idx = daftarSantri.value.findIndex((s) => s.id === data.id);
        if (idx !== -1) {
          daftarSantri.value[idx] = { ...data, index: idx + 1 };
        }
      },
      onCancel: () => {},
    },
  });
};

const deleteHandler = (santri) => {
  dialog.open(DeleteDialog, {
    props: {
      header: 'Hapus Santri',
      modal: true,
    },
    data: santri,
    emits: {
      onConfirm: (data) => {
        // Hapus data dari array
        daftarSantri.value = daftarSantri.value.filter((s) => s.id !== data.id).map((s, idx) => ({ ...s, index: idx + 1 }));
      },
      onCancel: () => {},
    },
  });
};
</script>

<template>
  <div class="card bg-white border-slate-200 rounded-lg border p-8">
    <div class="flex flex-col gap-2">
      <Toolbar class="toolbar !px-0 !border-none">
        <template #start>
          <Button v-if="showResetButton" type="button" icon="pi pi-filter-slash" label="Bersihkan" outlined @click="clearTable()" />
        </template>
        <template #end>
          <div class="flex gap-4">
            <IconField iconPosition="left" class="block w-80 mt-2 md:mt-0">
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Cari santri, angkatan, jurusan..." class="w-full" />
            </IconField>
            <Button label="Tambah Santri" icon="pi pi-plus" severity="primary" @click="addHandler" />
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
      v-model:filters="filters"
      v-model:sortField="sortField"
      v-model:sortOrder="sortOrder"
      :value="daftarSantri"
      :filters="filters"
      dataKey="id"
      showGridlines
      stripedRows
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} santri"
      :globalFilterFields="['name', 'angkatan', 'gender', 'jurusan', 'role']"
      tableStyle="min-width: 50rem"
      filterDisplay="menu"
      class="p-datatable-hoverable rounded-table"
    >
      <Column field="index" header="No" sortable style="min-width: 2rem">
        <template #body="{ data }">
          {{ data.index }}
        </template>
      </Column>
      <!-- Kolom-kolom dengan fitur sort -->
      <Column field="name" header="Nama" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.name }}
        </template>
      </Column>

      <Column field="angkatan" header="Angkatan" :showFilterMatchModes="false" sortable style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="angkatanList" placeholder="Pilih Angkatan" class="p-column-filter" />
        </template>
      </Column>

      <Column field="gender" header="Jenis Kelamin" class="capitalize" :showFilterMatchModes="false" sortable>
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="['laki-laki', 'perempuan']"
            placeholder="Pilih Jenis Kelamin"
            class="p-column-filter capitalize"
          />
        </template>
      </Column>

      <Column field="jurusan" header="Jurusan" :showFilterMatchModes="false" sortable style="min-width: 10rem">
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="jurusanList" placeholder="Pilih Jurusan" class="p-column-filter" />
        </template>
      </Column>

      <Column field="role" header="Role" class="capitalize" :showFilterMatchModes="false" sortable>
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="roleList" class="p-column-filter capitalize" placeholder="Pilih Role" />
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

<style>
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

/* Style untuk border radius pada tabel */
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
