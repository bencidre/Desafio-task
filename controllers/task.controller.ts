import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

/*
  Usamos o find para o proprio objeto quando queremos ler ou editar um objeto
  Usamos o findIndex para quando queremos remover um objeto
**/


interface Task {
  id: string;
  title: string;
  description: string;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const tasks: Task[] = [];

export async function createTask(request: FastifyRequest, reply: FastifyReply) {
  const { title, description } = request.body as { title: string; description: string };

  const task: Task = {
    id: uuidv4(),
    title,
    description,
    completed_at: null,
    created_at: new Date(),
    updated_at: new Date()
  };

  tasks.push(task);
  return reply.code(201).send(task);
}

export async function getAllTasks(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(tasks);
}

export async function getTaskById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return reply.status(404).send({ error: 'Task not found' });
  }

  return reply.send(task);
}

export async function updateTask(request: FastifyRequest<{ Params: { id: string }, Body: { title: string; description: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  const { title, description } = request.body;

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return reply.status(404).send({ error: 'Task not found' });
  }

  task.title = title;
  task.description = description;
  task.updated_at = new Date();

  return reply.send(task);
}

export async function deleteTask(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return reply.status(404).send({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  return reply.status(204).send();
}

export async function completeTask(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return reply.status(404).send({ error: 'Task not found' });
  }

  task.completed_at = new Date();
  task.updated_at = new Date();

  return reply.send(task);
}