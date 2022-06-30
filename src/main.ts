import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata"
import {DataSource} from "typeorm";
import User from "./user/user.entity"


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}


const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "1111",
  database: "testNodeNest",
  entities: [User],
  synchronize: true,
  logging: false,
})


AppDataSource.initialize()
    .then(() => {
      // here you can start to work with your database
    })
    .catch((error) => console.log(error))

bootstrap();
