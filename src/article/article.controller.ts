import {Controller, Post} from "@nestjs/common";

@Controller('articles')
export class ArticleController {

    @Post()
    async create(): Promise<any> {
        return 'ppp';
    }
}