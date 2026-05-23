const express = require('express');
const {
  createPrescription,
  getPrescriptionById,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionsController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'dokter'), createPrescription);

router.get('/:id', authenticateToken, authorizeRoles('admin', 'dokter', 'apoteker'), getPrescriptionById);

router.put('/:id', authenticateToken, authorizeRoles('admin', 'dokter'), updatePrescription);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), deletePrescription);

module.exports = router;
