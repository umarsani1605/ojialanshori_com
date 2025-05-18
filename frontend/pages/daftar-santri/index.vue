<script setup>
// import { FilterMatchMode } from '@primevue/core/api';
import { ref, computed, onMounted } from 'vue';
import { useSantriStore } from '@/stores/santriStore';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Avatar from 'primevue/avatar';

const dt = ref();
const santriStore = useSantriStore();

// Mengambil data dari store
const daftarSantri = computed(() => {
  return santriStore.getSantriList.map((santri, idx) => ({
    ...santri,
    index: idx + 1,
  }));
});

const loading = computed(() => santriStore.loading);
const error = computed(() => santriStore.error);

// Mengambil data filter dari store
const angkatanList = computed(() => santriStore.getCollegeYearList);
const roleList = computed(() => santriStore.getRoleList);
const statusList = computed(() => santriStore.getStatusValues);

// Filter State
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  fullname: { value: null, matchMode: 'contains' },
  college_year: { value: null, matchMode: 'contains' },
  major: { value: null, matchMode: 'contains' },
  university: { value: null, matchMode: 'contains' },
  gender: { value: null, matchMode: 'equals' },
  status: { value: null, matchMode: 'equals' },
  role: { value: null, matchMode: 'equals' },
});

const sortField = ref(null);
const sortOrder = ref(null);

// Load data saat komponen dimount
onMounted(async () => {
  try {
    await santriStore.getAll();
  } catch (error) {
    console.error('Error loading santri data:', error);
  }
});

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

// Fungsi untuk mendapatkan inisial dari nama lengkap
const getInitials = (fullname) => {
  if (!fullname) return '';
  return fullname
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Fungsi untuk menampilkan label gender
const getGenderLabel = (gender) => {
  return gender === 'male' ? 'Putra' : gender === 'female' ? 'Putri' : '';
};

// Fungsi untuk navigasi ke halaman detail
const viewDetail = (santri) => {
  navigateTo(`/daftar-santri/${santri.id}`);
};
</script>

<template>
  <div class="card bg-white border-slate-200 rounded-lg border p-8 h-full">
    <div class="flex flex-col gap-2">
      <Toolbar class="toolbar !px-0 !border-none">
        <template #start>
          <Button v-if="showResetButton" type="button" icon="pi pi-filter-slash" label="Bersihkan" outlined @click="clearTable()" />
        </template>
        <template #end>
          <div class="flex gap-4">
            <IconField iconPosition="left" class="block w-80 mt-2 md:mt-0">
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Cari santri..." class="w-full" />
            </IconField>
            <Button label="Tambah Santri" icon="pi pi-plus" severity="primary" @click="$router.push('/santri/add')" />
          </div>
        </template>
      </Toolbar>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="border border-slate-200 rounded-lg px-6 py-4">
      <!-- Header Skeleton -->
      <div class="flex gap-4 mb-4 border-b border-slate-200 py-6">
        <Skeleton shape="circle" size="2rem" class="mr-2" />
        <div class="flex gap-8 w-full">
          <Skeleton width="10%" height="2rem" class="mb-1" />
          <Skeleton width="20%" height="2rem" class="mb-1" />
          <Skeleton width="10%" height="2rem" class="mb-1" />
          <Skeleton width="10%" height="2rem" class="mb-1" />
          <Skeleton width="15%" height="2rem" class="mb-1" />
          <Skeleton width="15%" height="2rem" class="mb-1" />
          <Skeleton width="10%" height="2rem" class="mb-1" />
          <Skeleton width="5%" height="2rem" class="mb-1" />
        </div>
      </div>

      <!-- Data Skeleton -->
      <div v-for="i in 10" :key="i" class="flex gap-4 mb-2 items-center py-2 hover:bg-surface-100 transition-colors duration-200">
        <Skeleton shape="circle" size="2rem" class="mr-2" />
        <div class="flex gap-8 w-full">
          <Skeleton width="10%" height="1.5rem" />
          <Skeleton width="20%" height="1.5rem" />
          <Skeleton width="10%" height="1.5rem" />
          <Skeleton width="10%" height="1.5rem" />
          <Skeleton width="15%" height="1.5rem" />
          <Skeleton width="15%" height="1.5rem" />
          <Skeleton width="10%" height="1.5rem" />
          <Skeleton width="5%" height="1.5rem" />
        </div>
      </div>

      <!-- Pagination Skeleton -->
      <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <Skeleton width="15%" height="2rem" />
        <div class="flex gap-2">
          <Skeleton width="2.5rem" height="2rem" />
          <Skeleton width="2.5rem" height="2rem" />
          <Skeleton width="2.5rem" height="2rem" />
          <Skeleton width="2.5rem" height="2rem" />
          <Skeleton width="2.5rem" height="2rem" />
        </div>
        <Skeleton width="20%" height="2rem" />
      </div>
    </div>

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
      :globalFilterFields="['fullname', 'college_year', 'gender', 'major', 'university', 'status', 'role']"
      tableStyle="min-width: 50rem"
      filterDisplay="menu"
      class="p-datatable-hoverable rounded-table"
    >
      <Column field="index" header="No" sortable style="min-width: 2rem">
        <template #body="{ data }">
          {{ data.index }}
        </template>
      </Column>

      <Column field="fullname" header="Nama" sortable style="min-width: 16rem">
        <template #body="{ data }">
          <div class="flex items-center gap-4">
            <Avatar :label="getInitials(data.fullname)" shape="circle" size="normal" />
            <span>{{ data.fullname }}</span>
          </div>
        </template>
      </Column>

      <Column field="college_year" header="Angkatan" :showFilterMatchModes="false" sortable style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="angkatanList" placeholder="Pilih Angkatan" class="p-column-filter" />
        </template>
      </Column>

      <Column field="gender" header="Putra/Putri" :showFilterMatchModes="false" sortable style="min-width: 8rem">
        <template #body="{ data }">
          {{ getGenderLabel(data.gender) }}
        </template>
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="['male', 'female']"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Gender"
            class="p-column-filter"
          />
        </template>
      </Column>

      <Column field="major" header="Jurusan" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.major }}
        </template>
      </Column>

      <Column field="university" header="Universitas" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.university }}
        </template>
      </Column>

      <Column field="status" header="Status" :showFilterMatchModes="false" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <Tag :value="santriStore.getStatusLabel(data.status)" :severity="data.status === 'active' ? 'success' : 'danger'" />
        </template>
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="statusList" placeholder="Pilih Status" class="p-column-filter" />
        </template>
      </Column>

      <Column style="width: 5rem">
        <template #body="slotProps">
          <Button icon="pi pi-info-circle" label="Detail" @click="viewDetail(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
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

/* Style untuk opsi dropdown */
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
</style>
