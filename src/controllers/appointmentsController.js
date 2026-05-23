const db = require('../config/database');

exports.createAppointment = async (req, res) => {
  const {
    patient_id,
    doctor_name,
    visit_date,
    queue_number,
    complaint
  } = req.body;

  if (
    !doctor_name ||
    !visit_date ||
    !queue_number
  ) {
    return res.status(400).json({
      message: 'Semua field wajib diisi'
    });
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
  let query = `
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

  let values = [];

  if (req.authUser.role === 'pasien') {
    query += ' WHERE appointments.patient_id = ?';
    values.push(req.authUser.sub);
  }

  const [rows] = await db.query(query, values);

  res.json(rows);
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const {
    doctor_name,
    visit_date,
    queue_number,
    complaint
  } = req.body;

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
