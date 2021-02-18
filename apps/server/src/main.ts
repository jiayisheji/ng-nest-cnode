/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './app/shared/filters/http-exception.filter';
import { environment } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main', true);
  const globalPrefix = '/api';
  app.enableCors();
  const isDev = !environment.production;
  // Build the swagger doc only in dev mode
  if (isDev) {
    const swaggerOptions = new DocumentBuilder()
      .setTitle('CNode Application')
      .setDescription('APIs for the CNode Blog application.')
      .setVersion('1.0.0')
      .addServer(globalPrefix)
      .setExternalDoc('For more information', 'http://swagger.io')
      .addBearerAuth()
      .build();
    const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup(`${globalPrefix}/swagger`, app, swaggerDoc);
  }
  app.setGlobalPrefix(globalPrefix);
  // Validate query params and body
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // Convert exceptions to JSON readable format
  app.useGlobalFilters(new HttpExceptionFilter());
  // Convert all JSON object keys to snake_case
  const port = process.env.PORT || 3333;
  await app.listen(port);
  // Log current url of app
  let baseUrl = app.getHttpServer().address().address;
  if (baseUrl === '0.0.0.0' || baseUrl === '::') {
    baseUrl = 'localhost';
  }
  logger.log(`Listening to http://${baseUrl}:${port}${globalPrefix}`);
  if (isDev) {
    logger.log(`Swagger UI: http://${baseUrl}:${port}${globalPrefix}/swagger`);
  }
}

bootstrap();
