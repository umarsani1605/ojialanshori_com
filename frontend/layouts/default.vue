<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const menuItems = [
  {
    group: 'Dashboard',
    items: [
      {
        label: 'Dashboard',
        icon: 'lucide:layout-dashboard',
        to: '/',
      },
    ],
  },
  {
    group: 'Santri',
    items: [
      {
        label: 'PSB',
        icon: 'lucide:clipboard-list',
        to: '/psb',
      },
      {
        label: 'Daftar Santri',
        icon: 'lucide:users',
        to: '/daftar-santri',
      },
      {
        label: 'Progress Ngaji',
        icon: 'lucide:book-open',
        to: '/progress-ngaji',
      },
    ],
  },
  {
    group: 'Konten',
    items: [
      {
        label: 'Posts',
        icon: 'lucide:file-text',
        to: '/posts',
      },
      {
        label: 'Media',
        icon: 'lucide:image',
        to: '/media',
      },
      {
        label: 'Komentar',
        icon: 'lucide:message-square',
        to: '/komentar',
      },
    ],
  },
  {
    group: 'Pengaturan Website',
    items: [
      {
        label: 'Alat-Alat',
        icon: 'lucide:wrench',
        to: '/alat',
      },
      {
        label: 'Pengaturan',
        icon: 'lucide:settings',
        to: '/pengaturan',
      },
    ],
  },
];

const route = useRoute();

const pageTitle = computed(() => {
  const currentPath = route.path;
  const menuItem = menuItems.flatMap((group) => group.items).find((item) => item.to === currentPath);

  return menuItem ? menuItem.label : 'Dashboard';
});
</script>

<template>
  <div class="min-h-screen bg-slate-100 min-w-screen flex">
    <div class="w-80 bg-white border-r border-gray-200">
      <div to="/" class="layout-topbar-logo flex flex-col items-center justify-start !gap-6 mx-auto p-8 pb-0">
        <img src="/logo.png" alt="logo" class="h-16" />
        <span class="text-xl font-semibold">Omah Ngaji Al-Anshori</span>
        <Divider />
      </div>
      <div class="p-4">
        <nav>
          <div v-for="group in menuItems" :key="group.group" class="mb-6">
            <h3 v-if="group.group != 'Dashboard'" class="text-sm text-gray-400 mb-2 px-4">{{ group.group }}</h3>
            <ul>
              <li v-for="item in group.items" :key="item.to" class="mb-2">
                <NuxtLink
                  :to="item.to"
                  class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-gray-100"
                  active-class="!bg-emerald-100/50 text-emerald-500 font-medium"
                >
                  <Icon :name="item.icon" class="mr-3" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col flex-1">
      <div class="w-full h-16 flex flex-row px-4 py-3 items-center justify-between bg-white border-b border-gray-200">
        <h2 class="h-full text-xl font-semibold flex items-center text-gray-700">{{ pageTitle }}</h2>
        <div class="h-full cursor-pointer px-4 flex items-center justify-center gap-4 rounded-lg transition hover:bg-gray-200">
          <Icon name="lucide:user" size="18" />
          <span class="">Admin</span>
        </div>
      </div>
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
