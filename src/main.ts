import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { TimeoutInterceptor } from './timeout.interceptor';
import { Request, Response, NextFunction } from 'express';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((request: Request, response: Response, next: NextFunction) => {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    // response.on('finish', () => {
    //   const { statusCode } = response;
    //   const contentLength = response.get('content-length');
    //
    //   console.log(
    //     `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
    //   );
    // });

    next();
  });

  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: process.env.CLIENT_URL ?? '',
    allowedHeaders:
      'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Origin, Authorization',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  const config = new DocumentBuilder()
    .setTitle('QwikCollab')
    .setDescription('QwikCollab API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 8100);
}
bootstrap();
