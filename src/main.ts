import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS === '*'
      ? '*'
      : (process.env.CORS_ORIGINS || '*').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Exam Results API')
    .setDescription(
      `## Exam Results Analytics & Ranking System
      
Full REST API for managing student exam results with rich analytics and ranking capabilities.

### Modules
- **Students** – CRUD + performance summary + semester trend
- **Subjects** – CRUD for paper catalogue
- **Exam Sessions** – Per-student per-semester session records
- **Subject Results** – Individual subject marks (supports bulk insert)
- **Analytics** – Overview, grade distribution, SGPA buckets, subject histograms, course analytics, student comparison
- **Rankings** – Semester rank, subject rank, course rank, CGPA all-time rank, percentile
      `,
    )
    .setVersion('1.0')
    .addTag('Students')
    .addTag('Subjects')
    .addTag('Exam Sessions')
    .addTag('Subject Results')
    .addTag('Analytics')
    .addTag('Rankings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = parseInt(process.env.PORT, 10) || 3000;
  await app.listen(port);
  console.log(`\n🚀  Server running on http://localhost:${port}`);
  console.log(`📖  Swagger docs at http://localhost:${port}/api/docs\n`);
}

bootstrap();
