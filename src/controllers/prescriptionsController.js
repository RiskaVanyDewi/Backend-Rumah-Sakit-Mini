const db = require('../config/database');

exports.createPrescription = async (req, res, next) => {
  try {
    const {
      patient_id,
      medicine_id,
      dosage,
      notes
    } = req.body;

    if (
      !patient_id ||
      !medicine_id ||
      !dosage
    ) {
      return res.status(400).json({
        message: 'Semua field wajib diisi'
      });
    }

    const [result] = await db.query(
      `
        INSERT INTO prescriptions
        (
          patient_id,
          medicine_id,
          dosage,
          notes
        )
        VALUES (?, ?, ?, ?)
        `,
      [
        patient_id,
        medicine_id,
        dosage,
        notes
      ]
    );

    res.status(201).json({
      message: 'Resep berhasil dibuat',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
        SELECT
          prescriptions.id,

          users.name AS patient_name,

          medicines.name AS medicine_name,

          prescriptions.dosage,
          prescriptions.notes,
          prescriptions.created_at

        FROM prescriptions

        JOIN users
        ON prescriptions.patient_id = users.id

        JOIN medicines
        ON prescriptions.medicine_id = medicines.id

        WHERE prescriptions.id = ?
      `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Prescription tidak ditemukan'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updatePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      medicine_id,
      dosage,
      notes
    } = req.body;

    await db.query(
      `
        UPDATE prescriptions
        SET
          medicine_id=?,
          dosage=?,
          notes=?
        WHERE id=?
        `,
      [
        medicine_id,
        dosage,
        notes,
        id
      ]
    );

    res.json({
      message: 'Resep berhasil diupdate'
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query(
      'DELETE FROM prescriptions WHERE id=?',
      [id]
    );

    res.json({
      message: 'Resep berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};
