const db = require('../config/database');
const { validateRequiredFields, validateNonNegative } = require('../utils/validator');

exports.createPayment = async (req, res, next) => {
  try {
    const {
      prescription_id,
      amount,
      payment_status
    } = req.body;

    const requiredError = validateRequiredFields({ prescription_id, amount });
    if (requiredError) {
      return res.status(400).json({ message: requiredError });
    }

    const amountError = validateNonNegative('Amount', amount);
    if (amountError) {
      return res.status(400).json({ message: amountError });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let baseQuery = `
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
      `;

    const where = [];
    const values = [];

    if (req.query.payment_status) {
      where.push('payments.payment_status = ?');
      values.push(req.query.payment_status);
    }

    if (req.query.search) {
      where.push('(users.name LIKE ? OR medicines.name LIKE ?)');
      values.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

    const finalQuery = baseQuery + whereSql + ' ORDER BY payments.id DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [rows] = await db.query(finalQuery, values);

    res.json({ data: rows, page, limit });
  } catch (error) {
    next(error);
  }
};
