import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import appConfig from "./config/appConfig";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  });

  // ✅ Renamed to avoid shadowing appConfig
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Scramble Task Management API")
    .setDescription("A scalable task management system")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  const port = appConfig.port || 3000;
  await app.listen(port);

  console.log("config Test:", appConfig.jwt.secret);
  console.log(`Welcome to Scramble! 🎉`);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
