import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { env } from '@common/config/env.config';
import { GlobalExceptionFilter } from '@common/errors/exception.filter';
import { RequestIdInterceptor } from '@common/interceptors/request-id.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
    }),
  );

  // Security headers & middleware
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: false,
  });

  await app.register(fastifyCors as any, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Organization-Id',
      'Idempotency-Key',
    ],
  });

  await app.register(fastifyCookie as any, {
    secret: env.COOKIE_SECRET,
  });

  // Global prefixes and pipes
  app.setGlobalPrefix(env.API_PREFIX);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new LoggingInterceptor(),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('PeoplePay360 HR & Payroll API')
    .setDescription(
      'Enterprise-grade API for PeoplePay360 multi-tenant HR & Payroll management platform',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Idempotency-Key',
        in: 'header',
        description: 'Unique idempotency key for financial / state mutations',
      },
      'Idempotency-Key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(env.PORT, '0.0.0.0');
  logger.log(`🚀 PeoplePay360 Backend started on port ${env.PORT}`);
  logger.log(`📚 OpenAPI Documentation available at http://localhost:${env.PORT}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
