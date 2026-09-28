import bcrypt from 'bcrypt';

const required = ['userEmail', 'userPassword', 'userFirstName', 'userLastName', 'userTel', 'dateOfBirth'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^[a-z\d]{8,15}$/i;

export class RequestError extends Error {
  constructor(message, status = 400, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const ageAt = (birthDate) => {
  const [year, month, day] = birthDate.split('-').map(Number);
  const today = new Date();
  const beforeBirthday = today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);
  return today.getFullYear() - year - Number(beforeBirthday);
};

export class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  async register(input = {}) {
    const missingFields = required.filter((key) => input[key] === undefined || input[key] === null || input[key] === '');
    if (missingFields.length) {
      throw new RequestError('Missing mandatory fields.', 400, { missingFields });
    }

    const email = String(input.userEmail).trim().toLowerCase();
    const password = String(input.userPassword);
    const dateOfBirth = String(input.dateOfBirth);

    if (email.length > 85 || !emailPattern.test(email)) {
      throw new RequestError('userEmail must be a valid email address (maximum 85 characters).');
    }
    if (!passwordPattern.test(password)) {
      throw new RequestError('userPassword must contain 8-15 alphanumeric characters.');
    }
    for (const [field, label] of [['userFirstName', 'firstName'], ['userLastName', 'lastName'], ['userTel', 'telephone']]) {
      if (String(input[field]).length > 50) throw new RequestError(`${field} must be at most 50 characters.`);
      input[label] = String(input[field]).trim();
    }
    if (!this.isValidDate(dateOfBirth) || new Date(`${dateOfBirth}T00:00:00`) > new Date()) {
      throw new RequestError('dateOfBirth must be a valid date in YYYY-MM-DD format and cannot be in the future.');
    }

    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS ?? 10));
    try {
      await this.repository.create({
        email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        telephone: input.telephone,
        dateOfBirth,
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new RequestError('Email already exists.', 409);
      throw error;
    }
  }

  async list() {
    const rows = await this.repository.findAll();
    return rows.map((row) => ({ ...row, age: ageAt(row.dateOfBirth) }));
  }

  isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }
}
