const db = require('../config/database');

exports.getAllMedicalRecords = async (req, res) => {
  const [rows] = await db.query(`
      SELECT
        medical_records.id,

        patient.name AS patient_name,

        doctor.name AS doctor_name,

        medical_records.diagnosis,
        medical_records.treatment,
        medical_records.notes,
        medical_records.created_at

      FROM medical_records

      JOIN users AS patient
      ON medical_records.patient_id = patient.id

      JOIN users AS doctor
      ON medical_records.doctor_id = doctor.id
    `);

  res.json(rows);
};

exports.getMyMedicalRecords = async (req, res) => {
  const [rows] = await db.query(`
      SELECT
        medical_records.id,

        doctor.name AS doctor_name,

        medical_records.diagnosis,
        medical_records.treatment,
        medical_records.notes,
        medical_records.created_at

      FROM medical_records

      JOIN users AS doctor
      ON medical_records.doctor_id = doctor.id

      WHERE medical_records.patient_id = ?
    `, [req.authUser.sub]);

  res.json(rows);
};

exports.createMedicalRecord = async (req, res) => {
  const {
    patient_id,
    appointment_id,
    diagnosis,
    treatment,
    notes
  } = req.body;

  if (
    !patient_id ||
    !appointment_id ||
    !diagnosis
  ) {
    return res.status(400).json({
      message: 'Field wajib diisi'
    });
  }

  const [result] = await db.query(
    `
      INSERT INTO medical_records
      (
        patient_id,
        doctor_id,
        appointment_id,
        diagnosis,
        treatment,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
    [
      patient_id,
      req.authUser.sub,
      appointment_id,
      diagnosis,
      treatment,
      notes
    ]
  );

  res.status(201).json({
    message: 'Rekam medis berhasil dibuat',
    id: result.insertId
  });
};

exports.updateMedicalRecord = async (req, res) => {
  const { id } = req.params;
  const {
    diagnosis,
    treatment,
    notes
  } = req.body;

  await db.query(
    `
      UPDATE medical_records
      SET
        diagnosis=?,
        treatment=?,
        notes=?
      WHERE id=?
      `,
    [
      diagnosis,
      treatment,
      notes,
      id
    ]
  );

  res.json({
    message: 'Rekam medis berhasil diupdate'
  });
};

exports.deleteMedicalRecord = async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM medical_records WHERE id=?',
    [id]
  );

  res.json({
    message: 'Rekam medis berhasil dihapus'
  });
};
