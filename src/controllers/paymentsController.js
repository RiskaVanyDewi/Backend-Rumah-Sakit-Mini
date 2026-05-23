const db = require('../config/database');

exports.createPayment = async (req, res, next) => {
  try {
    const {
      prescription_id,
      amount,
      payment_status
    } = req.body;

    if (
      !prescription_id ||
      !amount
    ) {
      return res.status(400).json({
        message: 'Semua field wajib diisi'
      });
    }

    const [result] = await db.query(
      `
        INSERT INTO payments
        (
          prescription_id,
          amount,
          payment_status
        )
        VALUES (?, ?, ?)
        `,
      [
        prescription_id,
        amount,
        payment_status || 'pending'
      ]
    );

    res.status(201).json({
      message: 'Pembayaran berhasil ditambahkan',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
        SELECT
          payments.id,

          users.name AS patient_name,

          medicines.name AS medicine_name,

          payments.amount,
          payments.payment_status,
          payments.created_at

        FROM payments

        JOIN prescriptions
        ON payments.prescription_id = prescriptions.id

        JOIN users
        ON prescriptions.patient_id = users.id

        JOIN medicines
        ON prescriptions.medicine_id = medicines.id

        ORDER BY payments.id DESC
      `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};
