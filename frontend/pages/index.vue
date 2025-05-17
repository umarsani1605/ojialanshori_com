<template>
  <div class="grid grid-cols-1 gap-6">
    <!-- Statistik Santri -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
        <div class="text-gray-500">Pendaftar Baru</div>
        <div class="text-2xl font-bold">{{ pendaftarBaru }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
        <div class="text-gray-500">Santri Aktif</div>
        <div class="text-3xl font-bold">{{ santriAktif }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Grafik Angkatan -->
      <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
        <div class="mb-2 font-semibold">Santri per Angkatan (2018-2024)</div>
        <Chart type="bar" :data="angkatanChartData" :options="angkatanChartOptions" class="w-full" />
      </div>
      <!-- Grafik Perbandingan Putra & Putri -->
      <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
        <div class="mb-2 font-semibold">Perbandingan Santri Putra & Putri</div>
        <Chart type="pie" :data="genderChartData" :options="genderChartOptions" class="w-full h-80 flex items-center justify-center" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Chart from 'primevue/chart';
import { ref } from 'vue';

// Data dummy
const santriAktif = 320;
const pendaftarBaru = 45;

// Grafik batang perbandingan santri putra & putri
const genderChartData = ref({
  labels: ['Putra', 'Putri'],
  datasets: [
    {
      label: 'Jumlah',
      backgroundColor: ['#fba4af', '#60a5fa'],
      data: [180, 140],
    },
  ],
});
const genderChartOptions = ref({
  plugins: {
    legend: { display: true, position: 'bottom' },
  },
  responsive: true,
});

// Grafik batang perbandingan santri angkatan 2018-2024
const angkatanChartData = ref({
  labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      label: 'Santri',
      backgroundColor: '#60a5fa',
      data: [30, 40, 50, 60, 55, 45, 40],
    },
  ],
});
const angkatanChartOptions = ref({
  plugins: {
    legend: { display: false },
  },
  responsive: true,
});
</script>

<style></style>
