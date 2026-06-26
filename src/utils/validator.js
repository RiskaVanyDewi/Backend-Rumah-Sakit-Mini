const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRequiredFields(fields) {
  const missing = [];

  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      missing.push(name);
      continue;
    }

    if (typeof value === 'string' && value.trim() === '') {
      missing.push(name);
    }
  }

  if (missing.length === 0) {
    return null;
  }

  return `Field ${missing.join(', ')} wajib diisi.`;
}

function validateEmail(email) {
  if (!emailRegex.test(String(email || ''))) {
    return 'Email tidak valid.';
  }

  return null;
}

function validatePassword(password) {
  if (String(password || '').length < 6) {
    return 'Password minimal 6 karakter.';
  }

  return null;
}

function validateNonNegative(fieldName, value) {
  const number = Number(value);

  if (Number.isNaN(number) || number < 0) {
    return `${fieldName} harus bernilai 0 atau lebih.`;
  }

  return null;
}

function validatePositive(fieldName, value) {
  const number = Number(value);

  if (Number.isNaN(number) || number <= 0) {
    return `${fieldName} harus lebih besar dari 0.`;
  }

  return null;
}

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validateNonNegative,
  validatePositive
};
