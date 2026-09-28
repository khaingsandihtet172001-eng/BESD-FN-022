import { expect } from 'chai';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../src/app.js';
import database from '../src/database.js';
import { closeDatabase } from '../src/user.router.js';

const fixtures = [
  ['daranporn@gmail.com', 'Sira', 'Weerakittana', '0891234567', '2012-05-26'],
  ['boonpoj@gmail.com', 'Rosanan', 'Suvanabhumiwong', '0641825563', '2011-10-17'],
  ['bodin_thai@gmail.com', 'Tankwan', 'Srisuk', '0986345661', '2007-04-29'],
];

async function restoreExamRows() {
  await database.execute('DELETE FROM `user`');
  const hash = await bcrypt.hash('examPass123', 10);
  for (const [email, firstName, lastName, telephone, dateOfBirth] of fixtures) {
    await database.execute(
      'INSERT INTO `user` (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, firstName, lastName, telephone, dateOfBirth],
    );
  }
}

describe('Short-course user API', function () {
  before(restoreExamRows);
  after(async function () {
    await restoreExamRows();
    await closeDatabase();
  });

  it('IT-1 lists three accounts without exposing password hashes', async function () {
    const response = await request(app).get('/users');
    expect(response.status).to.equal(200);
    expect(response.body).to.have.length(3);
    expect(response.body[0].age).to.be.a('number');
    for (const user of response.body) expect(user).not.to.have.property('userPassword');
  });

  it('IT-2 registers a user and stores a bcrypt hash', async function () {
    const response = await request(app).post('/users').send({
      userEmail: 'new.student@example.com', userPassword: 'abc12345', userFirstName: 'New',
      userLastName: 'Student', userTel: '0812345678', dateOfBirth: '2000-01-15',
    });
    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('Created');
    const [[{ total }]] = await database.execute('SELECT COUNT(*) AS total FROM `user`');
    expect(total).to.equal(4);
    const [[record]] = await database.execute('SELECT userPassword FROM `user` WHERE userEmail = ?', ['new.student@example.com']);
    expect(await bcrypt.compare('abc12345', record.userPassword)).to.equal(true);
  });

  it('IT-3 rejects an email that is already registered', async function () {
    const response = await request(app).post('/user/signup').send({
      userEmail: 'daranporn@gmail.com', userPassword: 'abc12345', userFirstName: 'Test',
      userLastName: 'Duplicate', userTel: '0812345678', dateOfBirth: '2000-01-15',
    });
    expect(response.status).to.equal(409);
    expect(response.body.error).to.match(/email already exists/i);
  });

  it('IT-4 reports missing registration fields', async function () {
    const response = await request(app).post('/users').send({ userEmail: 'incomplete@example.com' });
    expect(response.status).to.equal(400);
    expect(response.body.error).to.match(/missing mandatory fields/i);
    expect(response.body.missingFields).to.include('userPassword');
  });
});
