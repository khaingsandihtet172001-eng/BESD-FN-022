import database from './database.js';

export class UserRepository {
  async create({ email, passwordHash, firstName, lastName, telephone, dateOfBirth }) {
    const statement = `
      INSERT INTO \`user\`
        (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return database.execute(statement, [email, passwordHash, firstName, lastName, telephone, dateOfBirth]);
  }

  async findAll() {
    const [rows] = await database.execute(
      'SELECT userEmail, userFirstName, userLastName, userTel, dateOfBirth FROM `user` ORDER BY userEmail',
    );
    return rows;
  }
}
