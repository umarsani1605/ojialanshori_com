<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import { useGradeStore } from '~/stores/gradeStore';
import { useAuth } from '#imports';

// Define layout untuk halaman raport
definePageMeta({
  layout: 'auth',
  auth: false,
});

const router = useRouter();
const toast = useToast();
const gradeStore = useGradeStore();
const { status } = useAuth();

const code = ref('');
const loading = ref(false);
const raportData = ref(null);

const handleSearch = async () => {
  if (!code.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Kode santri harus diisi', life: 3000 });
    return;
  }

  loading.value = true;
  try {
    await router.push(`/progress-ngaji/${code.value}`);
  } catch (error) {
    console.error('Error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Terjadi kesalahan',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const handleLogin = () => {
  router.push('/auth/login');
};

// Helper untuk warna status
const getStatusSeverity = (status) => {
  switch (status) {
    case 'sudah':
      return 'success';
    case 'proses':
      return 'warning';
    default:
      return 'danger';
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-surface-ground">
    <div class="card w-[400px] p-12 bg-white rounded-2xl">
      <div class="flex justify-center mb-12">
        <img src="/logo.png" alt="logo" class="h-20" />
      </div>

      <h1 class="text-3xl font-bold text-center text-900 mb-2">Raport Santri</h1>
      <p class="text-center text-500 mb-8">Masukkan kode santri Anda untuk melihat raport</p>

      <!-- Form Pencarian -->
      <div class="mt-8">
        <div class="mb-6">
          <InputText v-model="code" placeholder="Masukkan kode santri" class="w-full" @keyup.enter="handleSearch" />
        </div>

        <Button label="Lihat Raport" class="w-full p-3 text-xl" @click="handleSearch" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-inputtext) {
  height: 2.85rem;
  border-radius: 0.65rem;
  background-color: #e6f0fe;
  border-color: transparent;
  border-width: 2px;
}

:deep(.p-button) {
  border-radius: 0.65rem;
  background-color: #10b981;
}

:deep(.p-button:hover) {
  background-color: #19a77b;
}

:deep(.p-button.p-button-text) {
  background-color: transparent;
}

:deep(.p-button.p-button-text:hover) {
  background-color: #e6f0fe;
}

.card {
  box-shadow: 0px 4px 30px rgba(221, 224, 255, 0.54);
}

table {
  border-radius: 8px;
  overflow: hidden;
}

th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #475569;
}

td {
  color: #334155;
}
</style>
