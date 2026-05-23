const db = require('../config/database');

exports.getHistory = async (req, res) => {
  let query = `
      SELECT
        appointments.id AS appointment_id,

        users.name AS patient_name,

        appointments.doctor_name,

        appointments.visit_date,

        appointments.complaint,

        medical_records.diagnosis,

        prescriptions.notes AS prescription_notes,

        medicines.name AS medicine_name,

        payments.amount,

        payments.payment_status

      FROM appointments

      JOIN users
      ON appointments.patient_id = users.id

      LEFT JOIN medical_records
      ON appointments.id = medical_records.appointment_id

      LEFT JOIN prescriptions
      ON appointments.id = prescriptions.appointment_id

      LEFT JOIN medicines
      ON prescriptions.medicine_id = medicines.id

      LEFT JOIN payments
      ON prescriptions.id = payments.prescription_id
    `;

  let values = [];

  if (req.authUser.role === 'pasien') {
    query += ' WHERE appointments.patient_id = ?';
    values.push(req.authUser.sub);
  }

  const [rows] = await db.query(query, values);

  res.json(rows);
};
