<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '#imports';

// Cek status autentikasi
const { status, data, signOut } = useAuth();
const isAuthenticated = computed(() => status.value === 'authenticated');
// Ambil data user dari auth
const userData = computed(() => data.value?.user || { fullname: 'Guest' });

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
        items: [
          {
            label: 'Semua',
            to: '/progress-ngaji',
          },
          {
            label: 'Pentashih',
            to: '/progress-ngaji/pentashih',
          },
          {
            label: 'Kategori',
            to: '/progress-ngaji/kategori',
          },
          {
            label: 'Subyek',
            to: '/progress-ngaji/subyek',
          },
        ],
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
const expandedMenus = ref(new Set());

const toggleMenu = (itemPath) => {
  if (expandedMenus.value.has(itemPath)) {
    expandedMenus.value.delete(itemPath);
  } else {
    expandedMenus.value.add(itemPath);
  }
};

const isMenuExpanded = (itemPath) => {
  return expandedMenus.value.has(itemPath);
};

const pageTitle = computed(() => {
  const currentPath = route.path;
  const menuItem = menuItems.flatMap((group) => group.items).find((item) => item.to === currentPath);

  return menuItem ? menuItem.label : 'Dashboard';
});

// Fungsi untuk logout
const handleLogout = async () => {
  try {
    await signOut();
    // Redirect setelah logout berhasil dilakukan oleh middleware
  } catch (error) {
    console.error('Logout error', error);
  }
};
</script>

<template>
  <div class="h-full w-full bg-slate-100 flex">
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
                <div
                  class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-gray-100 cursor-pointer"
                  :class="{
                    '!bg-emerald-100/50 text-emerald-500 font-medium': item.items ? route.path.startsWith(item.to) : route.path === item.to,
                  }"
                >
                  <NuxtLink v-if="!item.items" :to="item.to" class="flex items-center flex-1">
                    <Icon :name="item.icon" class="mr-3" />
                    <span>{{ item.label }}</span>
                  </NuxtLink>
                  <button v-else class="flex items-center justify-between w-full cursor-pointer" @click="toggleMenu(item.to)">
                    <div class="flex items-center">
                      <Icon :name="item.icon" class="mr-3" />
                      <span>{{ item.label }}</span>
                    </div>
                    <Icon
                      :name="isMenuExpanded(item.to) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                      size="16"
                      class="transition-transform duration-200"
                    />
                  </button>
                </div>
                <!-- Submenu -->
                <transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="transform -translate-y-1 opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-200 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform -translate-y-1 opacity-0"
                >
                  <ul v-if="item.items && isMenuExpanded(item.to)" class="ml-7 mt-2 space-y-1">
                    <li v-for="subItem in item.items" :key="subItem.to">
                      <NuxtLink
                        :to="subItem.to"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-gray-100"
                        :class="{
                          '!bg-slate-200/50 font-medium': route.path === subItem.to,
                        }"
                      >
                        <span>{{ subItem.label }}</span>
                      </NuxtLink>
                    </li>
                  </ul>
                </transition>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-[calc(100%-20rem)] flex flex-col flex-1 h-fit">
      <div class="w-full h-16 flex flex-row px-4 py-3 items-center justify-between bg-white border-b border-gray-200">
        <h2 class="h-full text-xl font-semibold flex items-center text-gray-700">{{ pageTitle }}</h2>
        <div class="h-full cursor-pointer px-4 flex items-center justify-center gap-4 rounded-lg transition hover:bg-gray-200">
          <Icon name="lucide:user" size="18" />
          <span class="">{{ userData.fullname }}</span>
          <Button
            v-if="isAuthenticated"
            icon="pi pi-sign-out"
            text
            rounded
            severity="secondary"
            aria-label="Logout"
            title="Logout"
            @click="handleLogout"
          />
        </div>
      </div>
      <div class="h-full p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
