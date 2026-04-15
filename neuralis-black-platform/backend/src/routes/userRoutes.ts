import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.get('/', (req, res) => controller.getAllUsers(req, res));
  router.get('/:id', (req, res) => controller.getUser(req, res));
  router.post('/', (req, res) => controller.createUser(req, res));
  router.put('/:id', (req, res) => controller.updateUser(req, res));
  router.delete('/:id', (req, res) => controller.deleteUser(req, res));

  return router;
}
