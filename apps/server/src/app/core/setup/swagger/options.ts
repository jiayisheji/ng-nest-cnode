import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerOptions = new DocumentBuilder()
  .setTitle('CNode Application')
  .setDescription('APIs for the CNode application.')
  .setVersion('1.0.0')
  .addServer('/')
  .setExternalDoc('For more information', 'http://swagger.io')
  .addTag('blog', 'application')
  .addTag('nestjs', 'framework')
  .addBearerAuth()
  .build();
