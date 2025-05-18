<script setup>
import { computed } from 'vue';
import { useAuth } from '#imports';
import AdminDashboard from '~/components/AdminDashboard.vue';
import PentashihDashboard from '~/components/PentashihDashboard.vue';
import SantriDashboard from '~/components/SantriDashboard.vue';

const { data } = useAuth();
const userRole = computed(() => data.value?.user?.role);

// Komponen dashboard yang sesuai dengan role
const DashboardComponent = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return AdminDashboard;
    case 'pentashih':
      return PentashihDashboard;
    case 'santri':
      return SantriDashboard;
    default:
      return null;
  }
});
</script>

<template>
  <component :is="DashboardComponent" v-if="DashboardComponent" />
  <div v-else class="text-center p-8">
    <p class="text-gray-500">Loading dashboard...</p>
  </div>
</template>
