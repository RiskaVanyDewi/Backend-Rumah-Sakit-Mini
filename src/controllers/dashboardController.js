const db = require('../config/database');

exports.getDashboard = async (req, res) => {
  const role = req.authUser.role;

  if (role === 'pasien') {
    const [[appointments]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM appointments
        WHERE patient_id = ?
        `,
      [req.authUser.sub]
    );

    const [[medicalRecords]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM medical_records
        WHERE patient_id = ?
        `,
      [req.authUser.sub]
    );

    const [[payments]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM payments

        JOIN prescriptions
        ON payments.prescription_id = prescriptions.id

        WHERE prescriptions.patient_id = ?
        `,
      [req.authUser.sub]
    );

    return res.json({
      role: 'pasien',
      total_appointments: appointments.total,
      total_medical_records: medicalRecords.total,
      total_payments: payments.total
    });
  }

  if (role === 'dokter') {
    const [[patients]] = await db.query(
      `
        SELECT COUNT(DISTINCT patient_id) AS total
        FROM medical_records
        WHERE doctor_id = ?
        `,
      [req.authUser.sub]
    );

    const [[medicalRecords]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM medical_records
        WHERE doctor_id = ?
        `,
      [req.authUser.sub]
    );

    const [[prescriptions]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM prescriptions
        WHERE doctor_id = ?
        `,
      [req.authUser.sub]
    );

    return res.json({
      role: 'dokter',
      total_patients: patients.total,
      total_medical_records: medicalRecords.total,
      total_prescriptions: prescriptions.total
    });
  }

  if (role === 'admin' || role === 'kasir') {
    const [[transactions]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM payments
        `
    );

    const [[paid]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM payments
        WHERE payment_status = 'paid'
        `
    );

    const [[pending]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM payments
        WHERE payment_status = 'pending'
        `
    );

    return res.json({
      role: role,
      total_transactions: transactions.total,
      total_paid: paid.total,
      total_pending: pending.total
    });
  }

  res.status(403).json({
    message: 'Role tidak memiliki dashboard'
  });
};
