// src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType, HttpStatus } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ApiException } from "./common/exceptions/api.exceptions";
import appConfig from "./config/appConfig";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable URI-based API versioning (/api/v1/)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
    prefix: "api/v",
  });

  // Security headers
  app.use(helmet());

  // Global validation pipe for input sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new ApiException(
          "Invalid input data",
          HttpStatus.BAD_REQUEST,
          errors
            .map((e) => `${e.property}: ${Object.values(e.constraints || {})}`)
            .join(", ")
        ),
    })
  );

  // Cors configuration for frontend access
  app.enableCors({
    origin: appConfig.frontendUrl || "http://localhost:3001",
    credentials: true,
  });

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Scramble Task Management API")
    .setDescription("A scalable task management system (v1)")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = appConfig.port;
  await app.listen(port);

  console.log(`Welcome to Scramble! 🎉`);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}

bootstrap();
