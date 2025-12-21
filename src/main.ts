import { HttpAdapterHost, NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe, VersioningType } from "@nestjs/common"
import { validationExceptionFactory } from "./common/utils/validation-exception.factory"
import { GlobalHttpExceptionFilter } from "./common/exceptions/global-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix("api")

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  })

  app.enableCors({
    origin: "*",
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )

  const httpAdapterHost = app.get(HttpAdapterHost)
  app.useGlobalFilters(new GlobalHttpExceptionFilter(httpAdapterHost))

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log(`🚀 Application is running on: http://localhost:${port}`)
}

bootstrap()
