import { defineStore } from 'pinia';

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    loading: false,
    error: null,
    stats: {
      newRegistrants: 0,
      totalSantri: 0,
      activeSantri: 0,
      inactiveSantri: 0,
      genderDistribution: {
        male: 0,
        female: 0
      },
      yearlyDistribution: []
    }
  }),

  actions: {
    async fetchDashboardStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('http://localhost:8000/statistics/dashboard');
        const data = await response.json();
        
        if (data.status === 'success') {
          this.stats = data.data;
        } else {
          throw new Error(data.message || 'Gagal mengambil data statistik');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
}); 