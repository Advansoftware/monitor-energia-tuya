import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3002;

  const logger = new Logger('Bootstrap');

  await app.listen(port);
  logger.log(`🚀 Microservice de coleta de energia rodando na porta ${port}`);
}

bootstrap();