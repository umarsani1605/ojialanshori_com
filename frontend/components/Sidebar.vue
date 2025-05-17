<script setup>
const menuItems = [
  { label: 'Button', icon: 'pi pi-fw pi-check-square', to: '/uikit/ButtonDoc' },
  { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/ChartDoc' },
  { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/FileDoc' },
  { label: 'Form Layout', icon: 'pi pi-fw pi-list', to: '/uikit/FormLayoutDoc' },
  { label: 'Input', icon: 'pi pi-fw pi-pencil', to: '/uikit/InputDoc' },
  { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/ListDoc' },
  { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/MediaDoc' },
  { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/MenuDoc' },
  { label: 'Messages', icon: 'pi pi-fw pi-comment', to: '/uikit/MessagesDoc' },
  { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/MiscDoc' },
  { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/OverlayDoc' },
  { label: 'Panels', icon: 'pi pi-fw pi-table', to: '/uikit/PanelsDoc' },
  { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/TableDoc' },
  { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/uikit/TimelineDoc' },
  { label: 'Tree', icon: 'pi pi-fw pi-sitemap', to: '/uikit/TreeDoc' },
];
</script>

<template>
  <div class="min-h-screen bg-gray-100 min-w-screen">
    <div class="flex">
      <!-- Sidebar -->
      <div class="w-64 bg-white shadow-lg">
        <div class="p-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">UI Kit</h2>
          <nav>
            <ul>
              <li v-for="item in menuItems" :key="item.to" class="mb-2">
                <NuxtLink
                  :to="item.to"
                  class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  active-class="bg-primary-50 text-primary-600"
                >
                  <i :class="[item.icon, 'mr-3']"></i>
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
