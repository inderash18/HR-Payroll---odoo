import { env } from './config/env.js';
import { app } from './app.js';
import { connectPrisma } from './config/prisma.js';

async function bootstrap() {
  await connectPrisma();

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`🚀 PeoplePay360 Node/Express Server listening on port ${env.PORT}`);
    console.log(`📡 API Endpoints live at http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
