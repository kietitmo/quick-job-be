import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('pug');
  app.enableCors({
    origin: '*',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'access-control-allow-origin',
    ],
  });
  const PORT = process.env.PORT || 3333;
  await app.listen(PORT, () => {
    console.log(`quick-job API is running on ${PORT}`);
  });
}
bootstrap();
