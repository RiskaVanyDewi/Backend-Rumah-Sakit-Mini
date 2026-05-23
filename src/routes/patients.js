const express = require('express');
const {
  getAllPatients,
  getMyPatientProfile,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientsController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin', 'dokter'), getAllPatients);

router.get('/me', authenticateToken, authorizeRoles('pasien'), getMyPatientProfile);

router.post('/', authenticateToken, authorizeRoles('admin'), createPatient);

router.put('/:id', authenticateToken, authorizeRoles('admin'), updatePatient);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), deletePatient);

module.exports = router;
