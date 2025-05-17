import PentashihModel from '../models/pentashihModel.js';

class PentashihController {
  // Get all pentashih
  static async getAllPentashih(req, res) {
    try {
      const pentashih = await PentashihModel.getAllPentashih();

      res.status(200).json({
        status: 'success',
        data: pentashih.map((item, index) => ({
          id: index + 1,
          ...item,
        })),
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get single pentashih by ID
  static async getPentashihById(req, res) {
    try {
      const { id } = req.params;
      const pentashih = await PentashihModel.getPentashihById(id);

      if (!pentashih) {
        return res.status(404).json({
          status: 'error',
          message: 'Pentashih tidak ditemukan',
        });
      }

      res.status(200).json({
        status: 'success',
        data: pentashih,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Create new pentashih
  static async createPentashih(req, res) {
    try {
      const { id_pentashih, santri_ids } = req.body;

      if (!id_pentashih) {
        return res.status(400).json({
          status: 'error',
          message: 'ID Pentashih harus diisi',
        });
      }

      const newPentashih = await PentashihModel.createPentashih({
        id_pentashih,
        santri_ids,
      });

      res.status(201).json({
        status: 'success',
        message: 'Pentashih berhasil ditambahkan',
        data: newPentashih,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Update pentashih
  static async updatePentashih(req, res) {
    try {
      const { id } = req.params;
      const santri_ids = req.body;

      console.log('id: ' + id);
      console.log('santri_ids: ' + santri_ids);

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'ID Pentashih harus diisi',
        });
      }

      const updatedPentashih = await PentashihModel.updatePentashih(id, santri_ids);

      res.status(200).json({
        status: 'success',
        message: 'Pentashih berhasil diupdate',
        data: updatedPentashih,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Delete pentashih
  static async deletePentashih(req, res) {
    try {
      const { id } = req.params;

      const existingPentashih = await PentashihModel.getPentashihById(id);
      if (!existingPentashih) {
        return res.status(404).json({
          status: 'error',
          message: 'Pentashih tidak ditemukan',
        });
      }

      await PentashihModel.deletePentashih(id);

      res.status(200).json({
        status: 'success',
        message: 'Pentashih berhasil dihapus',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }

  // Get santri by pentashih ID
  static async getSantriByPentashihId(req, res) {
    try {
      const { id } = req.params;
      const santriList = await PentashihModel.getSantriByPentashihId(id);

      res.status(200).json({
        status: 'success',
        data: santriList,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Controller Error: ' + error.message,
      });
    }
  }
}

export default PentashihController;
