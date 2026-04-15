import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';

export function createProjectRoutes(controller: ProjectController): Router {
  const router = Router();

  router.get('/', (req, res) => controller.getAllProjects(req, res));
  router.get('/:id', (req, res) => controller.getProject(req, res));
  router.get('/owner/:ownerId', (req, res) => controller.getProjectsByOwner(req, res));
  router.post('/', (req, res) => controller.createProject(req, res));
  router.put('/:id', (req, res) => controller.updateProject(req, res));
  router.delete('/:id', (req, res) => controller.deleteProject(req, res));
  router.post('/:id/archive', (req, res) => controller.archiveProject(req, res));

  return router;
}
