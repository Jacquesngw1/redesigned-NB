import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { sanitizeUser } from '../models/User';

export class UserController {
  constructor(private userService: UserService) {}

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ data: sanitizeUser(user) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }

  async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json({ data: users.map(sanitizeUser) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password, role } = req.body;

      if (!email || !name || !password) {
        res.status(400).json({ error: 'Email, name, and password are required' });
        return;
      }

      const user = await this.userService.createUser({ email, name, password, role });
      res.status(201).json({ data: sanitizeUser(user) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message.includes('already exists') || message.includes('Invalid') || message.includes('Password')) {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);
      res.json({ data: sanitizeUser(user) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message === 'User not found') {
        res.status(404).json({ error: message });
        return;
      }
      if (message.includes('Invalid') || message.includes('already in use')) {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message === 'User not found') {
        res.status(404).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }
}
