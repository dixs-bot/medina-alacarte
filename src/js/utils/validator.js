/**
 * Form validation helpers
 */
export function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val));
}

export function isPhone(val) {
  return /^[0-9+]{10,15}$/.test(String(val).replace(/[\s-]/g, ''));
}

export function isRequired(val) {
  return val !== null && val !== undefined && String(val).trim().length > 0;
}

export function minLength(val, min) {
  return String(val).trim().length >= min;
}

/**
 * Validasi form — return { valid, errors }
 * @param {Object} fields { fieldName: { value, rules: [{rule, msg}] } }
 */
export function validateForm(fields) {
  const errors = {};
  let valid = true;

  for (const [name, { value, rules }] of Object.entries(fields)) {
    for (const { rule, msg } of rules) {
      let passed = false;
      if (rule === 'required') passed = isRequired(value);
      else if (rule === 'email') passed = isEmail(value);
      else if (rule === 'phone') passed = isPhone(value);
      else if (typeof rule === 'function') passed = rule(value);

      if (!passed) {
        errors[name] = msg;
        valid = false;
        break;
      }
    }
  }

  return { valid, errors };
}
