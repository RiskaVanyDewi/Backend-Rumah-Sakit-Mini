const express = require('express');
const {
  getAllMedicalRecords,
  getMyMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecordsController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), getAllMedicalRecords);

router.get('/me', authenticateToken, authorizeRoles('pasien'), getMyMedicalRecords);

router.post('/', authenticateToken, authorizeRoles('dokter'), createMedicalRecord);

router.put('/:id', authenticateToken, authorizeRoles('dokter'), updateMedicalRecord);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteMedicalRecord);

module.exports = router;
