import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(
      'Система управління операційною діяльністю волонтерських фондів · API',
    )
    .setDescription('Операційна платформа волонтерських фондів')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Аутентифікація користувачів фонду')
    .addTag('Platform', 'Аутентифікація суперадміністратора платформи')
    .addTag('Foundations', 'Створення та перелік фондів-клієнтів')
    .addTag('Users', 'Запрошення та керування користувачами фонду')
    .addTag('Counterparties', 'Контрагенти: підрозділи, донори, постачальники')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
