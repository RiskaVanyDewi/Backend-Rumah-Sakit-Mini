const db = require('../config/database');
const { validateRequiredFields } = require('../utils/validator');

exports.getAllSchedules = async (req, res) => {
  const [rows] = await db.query(`
      SELECT
        doctor_schedules.id,
        users.name AS doctor_name,
        doctor_schedules.specialization,
        doctor_schedules.practice_day,
        doctor_schedules.start_time,
        doctor_schedules.end_time

      FROM doctor_schedules

      JOIN users
      ON doctor_schedules.doctor_id = users.id
    `);

  res.json(rows);
};

exports.getMySchedule = async (req, res) => {
  const [rows] = await db.query(`
      SELECT
        doctor_schedules.id,
        users.name AS doctor_name,
        doctor_schedules.specialization,
        doctor_schedules.practice_day,
        doctor_schedules.start_time,
        doctor_schedules.end_time

      FROM doctor_schedules

      JOIN users
      ON doctor_schedules.doctor_id = users.id

      WHERE doctor_schedules.doctor_id = ?
    `, [req.authUser.sub]);

  res.json(rows);
};

exports.createSchedule = async (req, res) => {
  const {
    doctor_id,
    specialization,
    practice_day,
    start_time,
    end_time
  } = req.body;

  const requiredError = validateRequiredFields({ doctor_id, specialization, practice_day, start_time, end_time });
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const [result] = await db.query(
    `
      INSERT INTO doctor_schedules
      (
        doctor_id,
        specialization,
        practice_day,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?, ?)
      `,
    [
      doctor_id,
      specialization,
      practice_day,
      start_time,
      end_time
    ]
  );

  res.status(201).json({
    message: 'Jadwal dokter berhasil ditambahkan',
    id: result.insertId
  });
};

exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const {
    specialization,
    practice_day,
    start_time,
    end_time
  } = req.body;

  const requiredError = validateRequiredFields({ specialization, practice_day, start_time, end_time });
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  await db.query(
    `
      UPDATE doctor_schedules
      SET
        specialization=?,
        practice_day=?,
        start_time=?,
        end_time=?
      WHERE id=?
    `,
    [
      specialization,
      practice_day,
      start_time,
      end_time,
      id
    ]
  );

  res.json({
    message: 'Jadwal dokter berhasil diupdate'
  });
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM doctor_schedules WHERE id=?',
    [id]
  );

  res.json({
    message: 'Jadwal dokter berhasil dihapus'
  });
};
