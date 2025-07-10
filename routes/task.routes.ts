import { FastifyInstance } from 'fastify';
import {
  completeTask,
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  importTasks,
  updateTask
} from '../src/controllers/task.controller';

export default async function taskRoutes(app: FastifyInstance) {
  app.post('/', createTask);
  app.get('/', getAllTasks);
  app.get('/:id', getTaskById);
  app.put('/:id', updateTask);
  app.delete('/:id', deleteTask);
  app.patch('/:id/complete', completeTask);

  app.post('/import', importTasks); // sem preHandler!
}
