import { parse } from 'csv-parse'
import { FastifyReply, FastifyRequest } from 'fastify'
import fs from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '../database'
import { Task } from '../types/task'

// Extend FastifyInstance to include 'db'
declare module 'fastify' {
  interface FastifyInstance {
    db: Database
  }
}

export async function createTask(request: FastifyRequest, reply: FastifyReply) {
  const db = request.server.db as Database
  const { title, description } = request.body as {
    title: string
    description: string
  }

  const task: Task = {
    id: uuidv4(),
    title,
    description,
    completed_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  }

  await db.insert('tasks', task)
  return reply.code(201).send(task)
}

export async function getAllTasks(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const db = request.server.db as Database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search = (request.query as any)?.search

  const tasks = await db.select(
    'tasks',
    search ? { title: search, description: search } : {},
  )
  console.log('🔎 Banco atual:', await db.select('tasks'))
  console.log('Query recebida:', request.query)

  return reply.send(tasks)
}

export async function getTaskById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const db = request.server.db as Database
  const { id } = request.params

  const tasks = await db.select('tasks', {})
  const task = tasks.find((t) => t.id === id)

  if (!task) return reply.status(404).send({ error: 'Task not found' })
  return reply.send(task)
}

export async function updateTask(
  request: FastifyRequest<{
    Params: { id: string }
    Body: { title: string; description: string }
  }>,
  reply: FastifyReply,
) {
  const db = request.server.db as Database
  const { id } = request.params
  const { title, description } = request.body

  await db.update('tasks', id, {
    title,
    description,
    updated_at: new Date(),
  })

  return reply.send({ message: 'Task atualizada com sucesso' })
}

export async function deleteTask(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const db = request.server.db as Database
  const { id } = request.params

  await db.delete('tasks', id)
  return reply.status(204).send()
}

export async function completeTask(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const db = request.server.db as Database
  const { id } = request.params

  await db.update('tasks', id, {
    completed_at: new Date(),
    updated_at: new Date(),
  })

  return reply.send({ message: 'Tarefa marcada como completa' })
}

export async function importTasks(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const db = request.server.db as Database
  const parts = request.parts()
  let importedCount = 0

  for await (const part of parts) {
    // Verifica se é um arquivo CSV
    const isFile =
      part.type === 'file' &&
      ['file', 'upload', 'csv'].includes(part.fieldname) &&
      part.filename?.endsWith('.csv')

    if (!isFile) {
      console.log(`Ignorado: ${part.fieldname}`)
      continue
    }

    const tempFilePath = path.resolve('tmp', `${Date.now()}-${part.filename}`)
    const writeStream = fs.createWriteStream(tempFilePath)

    await new Promise<void>((resolve, reject) => {
      part.file.pipe(writeStream).on('finish', resolve).on('error', reject)
    })

    await new Promise<void>((resolve, reject) => {
      const tasksToInsert: Task[] = []

      fs.createReadStream(tempFilePath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on('data', (row: { title: string; description: string }) => {
          if (row.title && row.description) {
            const task: Task = {
              id: uuidv4(),
              title: row.title.trim(),
              description: row.description.trim(),
              completed_at: null,
              created_at: new Date(),
              updated_at: new Date(),
            }

            tasksToInsert.push(task)
          }
        })
        .on('end', async () => {
          try {
            await Promise.all(
              tasksToInsert.map((task) => db.insert('tasks', task)),
            )
            importedCount = tasksToInsert.length

            fs.unlinkSync(tempFilePath) // limpa o arquivo temporário
            resolve()
          } catch (err) {
            reject(err)
          }
        })
        .on('error', reject)
    })
  }

  return reply.send({
    message: 'Importação concluída',
    imported: importedCount,
  })
}
