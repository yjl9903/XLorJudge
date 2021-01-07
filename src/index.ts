import fastify from 'fastify';

async function bootstrap() {
  const server = fastify({ logger: true });

  await server.listen(3000, '127.0.0.1');
}

bootstrap();
