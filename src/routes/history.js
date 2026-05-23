const express = require('express');
const { getHistory } = require('../controllers/historyController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin', 'pasien'), getHistory);

module.exports = router;
