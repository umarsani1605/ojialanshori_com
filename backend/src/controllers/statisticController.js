import StatisticModel from '../models/statisticModel.js';
import logger from '../utils/logger.js';

class StatisticController {
  static async getDashboardStats(req, res) {
    try {
      logger.info('Mengambil statistik dashboard');
      
      const stats = await StatisticModel.getDashboardStats();
      
      logger.info('Berhasil mengambil statistik dashboard');
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error('Error saat mengambil statistik dashboard:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default StatisticController; 