const db = require('../config/database');
const { validateRequiredFields, validatePositive } = require('../utils/validator');

exports.createAppointment = async (req, res) => {
  const {
    patient_id,
    doctor_name,
    visit_date,
    queue_number,
    complaint
  } = req.body;

  const requiredFields = {
    doctor_name,
    visit_date,
    queue_number
  };

  if (req.authUser.role === 'admin') {
    requiredFields.patient_id = patient_id;
  }

  const requiredError = validateRequiredFields(requiredFields);
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const queueError = validatePositive('Queue number', queue_number);
  if (queueError) {
    return res.status(400).json({ message: queueError });
  }

  const [result] = await db.query(
    `
      INSERT INTO appointments
      (patient_id, doctor_name, visit_date, queue_number, complaint)
      VALUES (?, ?, ?, ?, ?)
      `,
    [
      req.authUser.role === 'admin' ? patient_id : req.authUser.sub,
      doctor_name,
      visit_date,
      queue_number,
      complaint
    ]
  );

  res.status(201).json({
    message: 'Appointment berhasil dibuat',
    id: result.insertId
  });
};

exports.getAppointments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let baseQuery = `
      SELECT
        appointments.id,
        users.name AS patient_name,
        appointments.doctor_name,
        appointments.visit_date,
        appointments.queue_number,
        appointments.complaint

      FROM appointments

      JOIN users
      ON appointments.patient_id = users.id
    `;

  const where = [];
  const values = [];

  if (req.authUser.role === 'pasien') {
    where.push('appointments.patient_id = ?');
    values.push(req.authUser.sub);
  }

  if (req.query.doctor_name) {
    where.push('appointments.doctor_name LIKE ?');
    values.push(`%${req.query.doctor_name}%`);
  }

  if (req.query.search) {
    where.push('(users.name LIKE ? OR appointments.doctor_name LIKE ? OR appointments.complaint LIKE ?)');
    values.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`);
  }

  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

  const finalQuery = baseQuery + whereSql + ' ORDER BY appointments.id DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [rows] = await db.query(finalQuery, values);

  res.json({ data: rows, page, limit });
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const {
    doctor_name,
    visit_date,
    queue_number,
    complaint
  } = req.body;

  const requiredError = validateRequiredFields({ doctor_name, visit_date, queue_number });
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const queueError = validatePositive('Queue number', queue_number);
  if (queueError) {
    return res.status(400).json({ message: queueError });
  }

  await db.query(
    `
      UPDATE appointments
      SET doctor_name=?, visit_date=?, queue_number=?, complaint=?
      WHERE id=?
      `,
    [
      doctor_name,
      visit_date,
      queue_number,
      complaint,
      id
    ]
  );

  res.json({
    message: 'Appointment berhasil diupdate'
  });
};

exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM appointments WHERE id=?',
    [id]
  );

  res.json({
    message: 'Appointment berhasil dihapus'
  });
};
