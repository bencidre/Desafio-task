import fastify from "fastify";
import taskRoutes from "../routes/task.routes";

const app = fastify({ logger: true });

app.register(taskRoutes, {
  prefix: "/tasks"
});

app.get("/", async (request, reply) => {
  return { messsage: "API Funcionando" };
});

app.listen({ port: 3333 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Servidor rodando em ${address}`);
});