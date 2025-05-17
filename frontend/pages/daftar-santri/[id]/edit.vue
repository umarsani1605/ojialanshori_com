<script setup>
import { useSantriStore } from '@/stores/santriStore';
import { onMounted, ref, watch } from 'vue';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const route = useRoute();
const santriStore = useSantriStore();

// State
const error = ref(null);
const isEditing = ref(true); // Selalu dalam mode edit
const hasChanges = ref(false);
const showConfirmDialog = ref(false);
const confirmDialogType = ref(''); // 'save' atau 'cancel'
const originalData = ref(null);

// Computed
const loading = computed(() => santriStore.loading);
const santri = computed(() => santriStore.getSelectedSantri);

// Fungsi untuk mendapatkan label status
const getStatusLabel = (status) => santriStore.getStatusLabel(status);

// Fungsi untuk mendapatkan label gender
const getGenderLabel = (gender) => santriStore.getGenderLabel(gender);

// Fungsi untuk mendapatkan inisial nama
const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Fungsi untuk memformat tanggal
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Fungsi untuk membatalkan edit
const cancelEdit = () => {
  if (hasChanges.value) {
    confirmDialogType.value = 'cancel';
    showConfirmDialog.value = true;
  } else {
    navigateBack();
  }
};

// Fungsi untuk menyimpan perubahan
const saveChanges = async () => {
  confirmDialogType.value = 'save';
  showConfirmDialog.value = true;
};

// Fungsi untuk konfirmasi aksi
const confirmAction = async () => {
  if (confirmDialogType.value === 'save' && santri.value) {
    try {
      await santriStore.update(santri.value.id, santri.value);
      navigateBack();
    } catch (err) {
      error.value = err.message;
    }
  } else {
    navigateBack();
  }
  showConfirmDialog.value = false;
};

// Fungsi untuk kembali ke halaman detail
const navigateBack = () => {
  navigateTo(`/daftar-santri/${route.params.id}`);
};

// Watch untuk perubahan data
watch(
  () => santri.value,
  (newVal, oldVal) => {
    if (oldVal && newVal) {
      hasChanges.value = JSON.stringify(newVal) !== JSON.stringify(oldVal);
    }
  },
  { deep: true }
);

// Ambil data santri saat komponen dimount
onMounted(async () => {
  try {
    await santriStore.getById(route.params.id);
    if (santri.value) {
      originalData.value = JSON.stringify(santri.value);
    }
  } catch (err) {
    error.value = err.message;
  }
});
</script>

<template>
  <div class="p-8">
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div class="p-6 border-b border-slate-200">
        <div class="flex items-center gap-4">
          <Skeleton shape="circle" size="4rem" />
          <div class="flex-1">
            <Skeleton width="200px" height="2rem" class="mb-2" />
            <Skeleton width="100px" height="1rem" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-500 text-center min-h-[400px] flex items-center justify-center">
      {{ error }}
    </div>

    <!-- Form Edit -->
    <div v-else-if="santri" class="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-slate-200">
        <div class="flex justify-between items-start">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <Avatar
                v-if="santri.photo_url"
                :image="santri.photo_url"
                shape="circle"
                size="large"
                :pt="{
                  image: { class: 'w-16 h-16 object-cover' },
                }"
              />
              <Avatar
                v-else
                :label="getInitials(santri.fullname)"
                shape="circle"
                size="large"
                :style="{ backgroundColor: '#ece9fc', color: '#2a1261' }"
              />
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold text-slate-900">{{ santri.fullname }}</h1>
                  <Tag :value="getStatusLabel(santri.status)" :severity="santri.status === 'active' ? 'success' : 'danger'" />
                  <Tag :value="getGenderLabel(santri.gender)" severity="info" />
                </div>
                <p class="text-slate-500">{{ santri.code }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <Button label="Simpan" icon="pi pi-check" @click="saveChanges" :disabled="!hasChanges" />
            <Button label="Batalkan" severity="secondary" outlined icon="pi pi-times" @click="cancelEdit" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Informasi Pribadi -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:user" class="w-7 h-7 text-green-600" />
              <h2 class="text-lg font-semibold text-slate-900">Informasi Pribadi</h2>
            </div>

            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <label for="nickname">Nama Panggilan</label>
                <InputText id="nickname" :model-value="santri.nickname" @update:model-value="(v) => (santri.nickname = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="email">Email</label>
                <InputText id="email" :model-value="santri.email" @update:model-value="(v) => (santri.email = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="phone">Telepon</label>
                <InputText id="phone" :model-value="santri.phone" @update:model-value="(v) => (santri.phone = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="birth_place">Tempat Lahir</label>
                <InputText id="birth_place" :model-value="santri.birth_place" @update:model-value="(v) => (santri.birth_place = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="birth_date">Tanggal Lahir</label>
                <Calendar
                  id="birth_date"
                  :model-value="new Date(santri.birth_date)"
                  @update:model-value="(v) => (santri.birth_date = v)"
                  dateFormat="dd/mm/yy"
                  :showIcon="true"
                />
              </div>
            </div>
          </div>

          <!-- Informasi Akademik -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:graduation-cap" class="w-7 h-7 text-green-600" />
              <h2 class="text-lg font-semibold text-slate-900">Informasi Akademik</h2>
            </div>

            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <label for="university">Universitas</label>
                <InputText id="university" :model-value="santri.university" @update:model-value="(v) => (santri.university = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="faculty">Fakultas</label>
                <InputText id="faculty" :model-value="santri.faculty" @update:model-value="(v) => (santri.faculty = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="major">Jurusan</label>
                <InputText id="major" :model-value="santri.major" @update:model-value="(v) => (santri.major = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="incoming_year">Tahun Masuk</label>
                <InputText id="incoming_year" :model-value="santri.incoming_year" @update:model-value="(v) => (santri.incoming_year = v)" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="college_year">Tahun Kuliah</label>
                <InputText id="college_year" :model-value="santri.college_year" @update:model-value="(v) => (santri.college_year = v)" />
              </div>
            </div>
          </div>

          <!-- Alamat -->
          <div class="space-y-4 md:col-span-2">
            <div class="flex items-center gap-2">
              <Icon name="lucide:map-pin" class="w-7 h-7 text-green-600" />
              <h2 class="text-lg font-semibold text-slate-900">Alamat</h2>
            </div>

            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <label for="full_address">Alamat Lengkap</label>
                <Textarea id="full_address" :model-value="santri.full_address" @update:model-value="(v) => (santri.full_address = v)" rows="3" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="village">Desa/Kelurahan</label>
                  <InputText id="village" :model-value="santri.village" @update:model-value="(v) => (santri.village = v)" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="district">Kecamatan</label>
                  <InputText id="district" :model-value="santri.district" @update:model-value="(v) => (santri.district = v)" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="city">Kota</label>
                  <InputText id="city" :model-value="santri.city" @update:model-value="(v) => (santri.city = v)" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="province">Provinsi</label>
                  <InputText id="province" :model-value="santri.province" @update:model-value="(v) => (santri.province = v)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Konfirmasi -->
    <Dialog
      :visible="showConfirmDialog"
      @update:visible="showConfirmDialog = $event"
      :header="confirmDialogType === 'save' ? 'Konfirmasi Simpan' : 'Konfirmasi Batalkan'"
      :modal="true"
      :style="{ width: '350px' }"
    >
      <p class="m-0">
        {{
          confirmDialogType === 'save'
            ? 'Apakah Anda yakin ingin menyimpan perubahan?'
            : 'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?'
        }}
      </p>
      <template #footer>
        <Button label="Tidak" icon="pi pi-times" @click="showConfirmDialog = false" text />
        <Button label="Ya" icon="pi pi-check" @click="confirmAction" :severity="confirmDialogType === 'save' ? 'success' : 'danger'" autofocus />
      </template>
    </Dialog>
  </div>
</template>
