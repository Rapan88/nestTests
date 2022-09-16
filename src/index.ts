import "reflect-metadata"
import {DataSource} from "typeorm";
import User from "./user/user.entity"
import {ArticleEntity} from "./article/article.entity";


const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "1111",
    database: "testNodeNest",
    entities: [User, ArticleEntity],
    synchronize: true,
    logging: false,
})


AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))
