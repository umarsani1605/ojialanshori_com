<script setup>
import Chart from 'primevue/chart';
import { ref, onMounted, computed } from 'vue';
import { useStatisticsStore } from '~/stores/statisticsStore';

const statisticsStore = useStatisticsStore();

// Grafik perbandingan santri putra & putri
const genderChartData = computed(() => ({
  labels: ['Putra', 'Putri'],
  datasets: [
    {
      label: 'Jumlah',
      backgroundColor: ['#fba4af', '#60a5fa'],
      data: [statisticsStore.stats.genderDistribution.male, statisticsStore.stats.genderDistribution.female],
    },
  ],
}));

const genderChartOptions = ref({
  plugins: {
    legend: { display: true, position: 'bottom' },
  },
  responsive: true,
});

// Grafik batang perbandingan santri per tahun kuliah
const angkatanChartData = computed(() => {
  const years = statisticsStore.stats.yearlyDistribution.map((item) => item.college_year);
  const totals = statisticsStore.stats.yearlyDistribution.map((item) => item.total);

  return {
    labels: years,
    datasets: [
      {
        label: 'Santri',
        backgroundColor: '#60a5fa',
        data: totals,
      },
    ],
  };
});

const angkatanChartOptions = ref({
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (tooltipItems) => {
          const year = tooltipItems[0].label;
          return `Angkatan ${year}`;
        },
        label: (context) => {
          return `${context.parsed.y} santri`;
        },
      },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
        callback: (value) => `${value} santri`,
      },
    },
  },
});

// Fetch data saat komponen dimount
onMounted(() => {
  statisticsStore.fetchDashboardStats();
});
</script>

<style></style>

<template>
  <div class="grid grid-cols-1 gap-6">
    <!-- Loading State -->
    <div v-if="statisticsStore.loading" class="flex justify-center items-center min-h-[200px]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="statisticsStore.error" class="alert alert-error">
      {{ statisticsStore.error }}
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Statistik Santri -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Pendaftar Baru -->
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4 border-l-4 border-blue-500">
          <div class="bg-blue-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <div class="text-gray-500 text-sm">Pendaftar Baru</div>
            <div class="text-2xl font-bold">5</div>
          </div>
        </div>

        <!-- Total Santri -->
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4 border-l-4 border-purple-500">
          <div class="bg-purple-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <div class="text-gray-500 text-sm">Total Santri</div>
            <div class="text-2xl font-bold">{{ statisticsStore.stats.totalSantri }}</div>
          </div>
        </div>

        <!-- Santri Aktif -->
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4 border-l-4 border-green-500">
          <div class="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="text-gray-500 text-sm">Santri Aktif</div>
            <div class="text-2xl font-bold">{{ statisticsStore.stats.activeSantri }}</div>
          </div>
        </div>

        <!-- Santri Tidak Aktif -->
        <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4 border-l-4 border-red-500">
          <div class="bg-red-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div class="text-gray-500 text-sm">Santri Tidak Aktif</div>
            <div class="text-2xl font-bold">{{ statisticsStore.stats.inactiveSantri }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
        <!-- Grafik Angkatan -->
        <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div class="mb-2 font-semibold">Santri per Angkatan</div>
          <Chart type="bar" :data="angkatanChartData" :options="angkatanChartOptions" class="w-full h-full" />
        </div>
        <!-- Grafik Perbandingan Putra & Putri -->
        <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div class="mb-2 font-semibold">Perbandingan Santri Putra & Putri</div>
          <Chart type="pie" :data="genderChartData" :options="genderChartOptions" class="w-full h-100 flex items-center justify-center" />
        </div>
      </div>
    </template>
  </div>
</template>
