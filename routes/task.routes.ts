import { FastifyInstance } from "fastify";
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask, completeTask } from "../controllers/task.controller";

export default async function taskRoutes(app: FastifyInstance) {
  app.post('/', createTask);
  app.get('/', getAllTasks);
  app.get('/:id', getTaskById);
  app.put('/:id', updateTask);         // ✅ Nova rota
  app.delete('/:id', deleteTask);      // ⬇️ Próxima
  app.patch('/:id/complete', completeTask); // ⬇️ Próxima
}