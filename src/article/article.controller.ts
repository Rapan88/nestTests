import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {ArticleService} from "./article.service";
import {AuthGuard} from "../user/guards/auth.guard";
import {User} from "../user/decorators/user.decorator";
import UserEntity from "../user/user.entity";
import {CreateArticleDto} from "../dto/createArticle.dto";
import {ArticleResponseInterface} from "../types/articleResponse.interface";
import {ArticleEntity} from "./article.entity";

@Controller('articles')
export class ArticleController {

    constructor(private readonly articleService: ArticleService) {
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
        return await this.articleService.putArticle(slug, currentUserId,newArticle)
    }
}