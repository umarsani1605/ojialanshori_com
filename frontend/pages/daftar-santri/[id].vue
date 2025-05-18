<script setup>
import { useSantriStore } from '@/stores/santriStore';
import { onMounted } from 'vue';
import Avatar from 'primevue/avatar';
import Skeleton from 'primevue/skeleton';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const santriStore = useSantriStore();
const error = ref(null);

// Computed
const loading = computed(() => santriStore.loading);
const santri = computed(() => santriStore.getSelectedSantri);

// Fungsi untuk mendapatkan label status
const getStatusLabel = (status) => santriStore.getStatusLabel(status);

// Fungsi untuk mendapatkan label gender
const getGenderLabel = (gender) => santriStore.getGenderLabel(gender);
const getGenderLabelAlt = (gender) => {
  return gender === 'male' ? 'Laki-laki' : 'Perempuan';
};

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

// Fungsi untuk navigasi
const navigateToEdit = () => {
  router.push(`/daftar-santri/${route.params.id}/edit`);
};

const navigateBack = () => {
  router.push('/daftar-santri');
};

// Ambil data santri saat komponen dimount
onMounted(async () => {
  try {
    await santriStore.getById(route.params.id);
  } catch (err) {
    error.value = err.message;
  }
});
</script>

<template>
  <div class="">
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

    <!-- Data Santri -->
    <div v-else-if="santri" class="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <!-- Header -->
      <div class="p-10 border-b border-slate-200">
        <div class="flex justify-between items-start">
          <div class="space-y-4">
            <div class="flex items-center gap-6">
              <Avatar
                v-if="santri.photo_url"
                :image="santri.photo_url"
                shape="circle"
                size="xlarge"
                :pt="{
                  image: { class: 'w-16 h-16 object-cover' },
                }"
              />
              <Avatar
                v-else
                :label="getInitials(santri.fullname)"
                shape="circle"
                size="xlarge"
                :style="{ backgroundColor: '#ece9fc', color: '#2a1261' }"
              />
              <div>
                <div class="flex items-center gap-4">
                  <h1 class="text-2xl font-bold text-slate-900">{{ santri.fullname }}</h1>
                  <Tag :value="getStatusLabel(santri.status)" :severity="santri.status === 'active' ? 'success' : 'danger'" />
                </div>
                <p class="text-slate-500">{{ santri.code }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-4">
            <Button label="Edit" outlined icon="pi pi-pencil" @click="navigateToEdit" />
            <Button label="Kembali" icon="pi pi-arrow-right" @click="navigateBack" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-10 py-14">
        <div class="flex flex-col gap-10">
          <!-- Informasi Pribadi -->
          <div class="space-y-6">
            <div class="flex items-center gap-6">
              <span class="text-emerald-600 rounded-full bg-emerald-100 size-10 flex items-center justify-center text-lg">
                <Icon name="lucide:user" size="21" class="text-emerald-500 rounded-full p-1" />
              </span>
              <h2 class="text-xl font-semibold text-slate-900">Informasi Pribadi</h2>
            </div>

            <div class="grid grid-cols-3 gap-4 w-full pl-16">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Nama Panggilan</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.nickname || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Jenis Kelamin</p>
                <p class="text-lg font-medium text-slate-900">{{ getGenderLabelAlt(santri.gender) || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Tempat dan Tanggal Lahir</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.birth_place || '-' }}, {{ formatDate(santri.birth_date) || '-' }}</p>
              </div>

              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Email</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.email || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Telepon</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.phone || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Informasi Akademik -->
          <div class="space-y-6">
            <div class="flex items-center gap-6">
              <span class="text-emerald-600 rounded-full bg-emerald-100 size-10 flex items-center justify-center text-lg">
                <Icon name="lucide:graduation-cap" size="21" class="text-emerald-500 rounded-full p-1" />
              </span>
              <h2 class="text-xl font-semibold text-slate-900">Informasi Akademik</h2>
            </div>

            <div class="grid grid-cols-3 gap-4 w-full pl-16">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Universitas</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.university || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Fakultas</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.faculty || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Jurusan</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.major || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Tahun Masuk Omah Ngaji</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.incoming_year || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">Tahun Kuliah</p>
                <p class="text-lg font-medium text-slate-900">{{ santri.college_year || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Alamat -->
          <div class="space-y-6 md:col-span-2">
            <div class="flex items-center gap-6">
              <span class="text-emerald-600 rounded-full bg-emerald-100 size-10 flex items-center justify-center text-lg">
                <Icon name="lucide:map-pin" size="21" class="text-emerald-500 rounded-full p-1" />
              </span>
              <h2 class="text-xl font-semibold text-slate-900">Alamat</h2>
            </div>

            <div class="grid grid-cols-3 gap-4 w-full pl-16">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Alamat Lengkap</p>
                <p class="text-base font-medium text-slate-900">{{ santri.full_address || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Desa/Kelurahan</p>
                <p class="text-base font-medium text-slate-900">{{ santri.village || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Kecamatan</p>
                <p class="text-base font-medium text-slate-900">{{ santri.district || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Kota</p>
                <p class="text-base font-medium text-slate-900">{{ santri.city || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Provinsi</p>
                <p class="text-base font-medium text-slate-900">{{ santri.province || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center min-h-[400px] flex items-center justify-center text-slate-500">Data santri tidak ditemukan</div>
  </div>
</template>
