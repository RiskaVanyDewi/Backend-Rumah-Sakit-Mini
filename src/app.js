require('dotenv').config();

const express = require('express');
const db = require('./config/database');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const {authenticateToken} = require('./middlewares/auth');
const { activityLogger } = require('./middlewares/activityLogger');
const appointmentsRoutes = require('./routes/appointments');
const medicinesRoutes = require('./routes/medicines');
const paymentsRoutes = require('./routes/payments');
const prescriptionsRouter = require('./routes/prescriptions');
const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');
const doctorSchedulesRouter = require('./routes/doctorSchedules');
const medicalRecordsRouter = require('./routes/medicalRecords');
const historyRouter = require('./routes/history');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(activityLogger);
app.use('/appointments', appointmentsRoutes);
app.use('/medicines', medicinesRoutes);
app.use('/payments', paymentsRoutes);
app.use('/prescriptions', prescriptionsRouter);
app.use('/patients', patientsRouter);
app.use('/doctors', doctorsRouter);
app.use('/doctor-schedules', doctorSchedulesRouter);
app.use('/medical-records', medicalRecordsRouter);
app.use('/history', historyRouter);
app.use('/dashboard', dashboardRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'APB API berjalan dengan baik.',
    endpoints: {
      users: {
        list: 'GET /users',
        create: 'POST /users',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id'
      },
      posts: {
        list: 'GET /posts',
        create: 'POST /posts',
        detail: 'GET /posts/:id',
        delete: 'DELETE /posts/:id'
      },
      extra: {
        userPosts: 'GET /userposts/:id'
      },
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login'
      }
    }
  });
});

app.get('/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');

    res.json({
      message: 'Koneksi aplikasi dan database normal.'
    });
  } catch (error) {
    next(error);
  }
});

app.get('/userposts/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [userRows] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan.'
      });
    }

    const [postRows] = await db.query(
      'SELECT id, title, content, user_id FROM posts WHERE user_id = ? ORDER BY id ASC',
      [id]
    );

    res.json({
      message: 'Daftar post untuk user berhasil diambil.',
      data: {
        user: userRows[0],
        posts: postRows
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use('/auth', authRouter);
app.use('/users', authenticateToken, usersRouter);
app.use('/posts', authenticateToken, postsRouter);

app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint tidak ditemukan.'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: 'Terjadi kesalahan pada server.',
    error: error.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`);
});
