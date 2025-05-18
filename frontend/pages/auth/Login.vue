<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useAuth } from '#imports';

// Define layout untuk halaman login
definePageMeta({
  layout: 'auth',
});

const router = useRouter();
const toast = useToast();
const { signIn, status } = useAuth();

const form = ref({
  emailOrPhone: '',
  password: '',
});

const loading = ref(false);

const handleLogin = async () => {
  if (!form.value.emailOrPhone || !form.value.password) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Email/No HP dan password harus diisi', life: 3000 });
    return;
  }

  loading.value = true;
  try {
    // Menggunakan format yang benar untuk provider local
    await signIn({
      emailOrPhone: form.value.emailOrPhone,
      password: form.value.password,
    });

    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Login berhasil', life: 3000 });

    // Redirect ke dashboard setelah login berhasil
    if (status.value === 'authenticated') {
      router.push('/');
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Terjadi kesalahan saat login',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-surface-ground">
    <div class="card w-full max-w-lg p-12 bg-white rounded-2xl">
      <div class="flex justify-center mb-12">
        <img src="/logo.png" alt="logo" class="h-20" />
      </div>

      <h1 class="text-3xl font-bold text-center text-900 mb-2">Login</h1>
      <p class="text-center text-500 mb-8">Silahkan masukkan kredensial Anda</p>

      <div class="mt-8">
        <div class="mb-5">
          <label for="emailOrPhone" class="block text-700 font-medium mb-2">Email / No. HP</label>
          <IconField class="w-full">
            <InputIcon class="pi pi-envelope" />
            <InputText id="emailOrPhone" v-model="form.emailOrPhone" class="w-full" placeholder="Masukkan email atau nomor HP" />
          </IconField>
        </div>

        <div class="mb-8">
          <label for="password" class="block text-700 font-medium mb-2">Password</label>
          <IconField class="w-full">
            <InputIcon class="pi pi-lock" />
            <InputText
              id="password"
              v-model="form.password"
              type="password"
              class="w-full"
              placeholder="Masukkan password"
              @keyup.enter="handleLogin"
            />
          </IconField>
        </div>

        <Button label="Masuk" class="rounded-3xl w-full p-3 text-xl bg-[#10b981] hover:bg-[#19a77b]" @click="handleLogin" :loading="loading" />
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
}

.card {
  box-shadow: 0px 4px 30px rgba(221, 224, 255, 0.54);
}
</style>
