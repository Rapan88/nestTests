import {Module} from "@nestjs/common";
import {ArticleController} from "./article.controller";

@Module({
    imports: [],
    controllers: [ArticleController],
    providers: []
})

export default class ArticleModule{}