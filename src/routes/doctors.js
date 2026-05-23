const express = require('express');
const {
  getAllDoctors,
  getMyDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorsController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, getAllDoctors);

router.get('/me', authenticateToken, authorizeRoles('dokter'), getMyDoctorProfile);

router.post('/', authenticateToken, authorizeRoles('admin'), createDoctor);

router.put('/:id', authenticateToken, authorizeRoles('admin'), updateDoctor);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteDoctor);

module.exports = router;
