import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import {ArticleService} from "./article.service";
import {AuthGuard} from "../user/guards/auth.guard";
import {User} from "../user/decorators/user.decorator";
import UserEntity from "../user/user.entity";
import {CreateArticleDto} from "../dto/createArticle.dto";
import {ArticleResponseInterface} from "../types/articleResponse.interface";
import {ArticlesResponseInterface} from "../types/articlesResponse.interface";

@Controller('articles')
export class ArticleController {

    constructor(private readonly articleService: ArticleService) {
    }

    @Get()
    async findAll(@User('id') currentUserId: number, @Query() query: any): Promise<ArticlesResponseInterface> {
        return await this.articleService.findAll(currentUserId, query)
    }


    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async create(@User() currentUser: UserEntity,
                 @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
        const article = await this.articleService.create(currentUser, createArticleDto)
        return this.articleService.buildArticleResponse(article)
    }

    @Get(":slug")
    async getArticle(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articleService.getArticleBySlug(slug)
        return this.articleService.buildArticleResponse(article)
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(@User("id") currentUserId: number, @Param('slug') slug: string) {
        return await this.articleService.deleteArticle(slug, currentUserId)
    }

    @Put(':slug')
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthGuard)
    async putArticle(@User('id') currentUserId: number,
                     @Param('slug') slug: string,
                     @Body('article') newArticle: CreateArticleDto):
        Promise<ArticleResponseInterface> {
        return await this.articleService.putArticle(slug, currentUserId, newArticle)
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async addArticleToFavorites(@User('id') currentUserId: number, @Param('slug') slug: any): Promise<ArticleResponseInterface> {
        const article = await this.articleService.addArticleToFavorites(currentUserId, slug)
        return this.articleService.buildArticleResponse(article)
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async deleteArticleFromFavorites(@User('id') currentUserId: number, @Param('slug') slug: any): Promise<ArticleResponseInterface> {
        const article = await this.articleService.deleteArticleFromFavorites(currentUserId, slug)
        return this.articleService.buildArticleResponse(article)
    }
}