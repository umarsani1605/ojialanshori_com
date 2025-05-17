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

    <!-- Data Santri -->
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
            <Button label="Edit" icon="pi pi-pencil" @click="navigateToEdit" />
            <Button label="Kembali" severity="secondary" outlined icon="pi pi-arrow-left" @click="navigateBack" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Informasi Pribadi -->
          <div class="space-y-6">
            <div class="flex items-center gap-3">
              <Icon name="lucide:user" class="w-7 h-7 text-green-600" />
              <h2 class="text-lg font-semibold text-slate-900">Informasi Pribadi</h2>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Nama Panggilan</p>
                <p class="text-base font-medium text-slate-900">{{ santri.nickname || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Email</p>
                <p class="text-base font-medium text-slate-900">{{ santri.email || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Telepon</p>
                <p class="text-base font-medium text-slate-900">{{ santri.phone || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Tempat Lahir</p>
                <p class="text-base font-medium text-slate-900">{{ santri.birth_place || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Tanggal Lahir</p>
                <p class="text-base font-medium text-slate-900">{{ formatDate(santri.birth_date) || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Informasi Akademik -->
          <div class="space-y-6">
            <div class="flex items-center gap-3">
              <Icon name="lucide:graduation-cap" class="w-7 h-7 text-green-600" />
              <h2 class="text-lg font-semibold text-slate-900">Informasi Akademik</h2>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Universitas</p>
                <p class="text-base font-medium text-slate-900">{{ santri.university || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Fakultas</p>
                <p class="text-base font-medium text-slate-900">{{ santri.faculty || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Jurusan</p>
                <p class="text-base font-medium text-slate-900">{{ santri.major || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Tahun Masuk</p>
                <p class="text-base font-medium text-slate-900">{{ santri.incoming_year || '-' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Tahun Kuliah</p>
                <p class="text-base font-medium text-slate-900">{{ santri.college_year || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Alamat -->
          <div class="space-y-6 md:col-span-2">
            <div class="flex items-center gap-3">
              <Icon name="lucide:map-pin" class="w-7 h-7 text-green-600" />
              <h2 class="text-lg font-semibold text-slate-900">Alamat</h2>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-500">Alamat Lengkap</p>
                <p class="text-base font-medium text-slate-900">{{ santri.full_address || '-' }}</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>

    <!-- Not Found -->
    <div v-else class="text-center min-h-[400px] flex items-center justify-center text-slate-500">Data santri tidak ditemukan</div>
  </div>
</template>
