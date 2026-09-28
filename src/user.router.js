import { Router } from 'express';
import database from './database.js';
import { RequestError, UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';

const router = Router();
const users = new UserService(new UserRepository());

router.get(['/', '/list'], async (request, response, next) => {
  try {
    response.status(200).json(await users.list());
  } catch (error) {
    next(error);
  }
});

router.post(['/', '/signup'], async (request, response, next) => {
  try {
    await users.register(request.body ?? {});
    response.status(201).json({ message: 'Created' });
  } catch (error) {
    next(error);
  }
});

export const handleError = (error, request, response, next) => {
  if (error instanceof RequestError) {
    return response.status(error.status).json({ error: error.message, ...error.details });
  }
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  console.error(error);
  return response.status(500).json({ error: 'Internal server error.' });
};

export const closeDatabase = () => database.end();
export default router;
