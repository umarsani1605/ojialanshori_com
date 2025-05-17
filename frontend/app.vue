<script setup>
import { ref } from 'vue';

const items = ref([
  {
    label: 'Update',
    icon: 'pi pi-refresh',
  },
  {
    label: 'Delete',
    icon: 'pi pi-times',
  },
  {
    separator: true,
  },
  {
    label: 'Home',
    icon: 'pi pi-home',
  },
]);

const loading = ref([false, false, false]);

function load(index) {
  loading.value[index] = true;
  setTimeout(() => (loading.value[index] = false), 1000);
}
</script>

<template>
  <div class="h-screen w-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
