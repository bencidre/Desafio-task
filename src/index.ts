import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import taskRoutes from '../routes/task.routes';
import { ensureTmpFolderExists } from './utils/upload';
import { Database } from './database';

const app = fastify({ logger: true });

// Instancia o banco de dados e inicializa
const db = new Database();

// Garante que a pasta 'tmp' exista
ensureTmpFolderExists();

async function start() {
  await db.init();

  // Registra o plugin multipart para aceitar arquivos CSV
  app.register(fastifyMultipart);

  // Injeta o banco no contexto das rotas usando decorate
  app.decorate('db', db);

  // Rotas da aplicação
  app.register(taskRoutes, { prefix: '/tasks' });

  // Rota raiz
  app.get('/', async () => {
    return { message: 'API Funcionando' };
  });

  // Parser adicional para lidar com corpo vazio em JSON
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      const bodyStr = typeof body === 'string' ? body : body?.toString('utf8');

      if (!bodyStr || bodyStr.trim() === '') return done(null, {});

      try {
        const parsed = JSON.parse(bodyStr);
        done(null, parsed);
      } catch (err) {
        done(err as Error);
      }
    }
  );

  app.listen({ port: 3333 }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Servidor rodando em ${address}`);
  });
}

start();
