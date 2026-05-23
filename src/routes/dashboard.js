const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');

const {
  authenticateToken
} = require('../middlewares/auth');

router.get('/', authenticateToken, getDashboard);

module.exports = router;
