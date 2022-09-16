import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import UserEntity from "../user/user.entity";
import {CreateArticleDto} from "../dto/createArticle.dto";
import {ArticleEntity} from "./article.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, getConnection, getConnectionManager, getRepository, Repository} from "typeorm";
import {ArticleResponseInterface} from "../types/articleResponse.interface";
import slugify from 'slugify'
import {ArticlesResponseInterface} from "../types/articlesResponse.interface";
import {TypeOrmConfig, typeOrmConfigAsync} from "../config/typeorm.config";

@Injectable()
export class ArticleService {

    constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>) {
    }

    async findAll(currentUserId: number, query: any):Promise<ArticlesResponseInterface> {

        const queryBuilder = this.articleRepository
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')

        queryBuilder.orderBy('articles.createdAt', 'DESC')

        const articlesCount = await queryBuilder.getCount()


        if(query.limit){
            queryBuilder.limit(query.limit)
        }

        if(query.offset){
            queryBuilder.offset(query.offset)
        }

        const articles = await queryBuilder.getMany()

        return  {articles, articlesCount}
    }


    async create(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {

        const article = new ArticleEntity()
        Object.assign(article, createArticleDto)

        if (!article.tagList) {
            article.tagList = []
        }

        article.slug = this.getSlug(createArticleDto.title)

        article.author = currentUser

        return await this.articleRepository.save(article)
    }

    async getArticleBySlug(slug: string): Promise<ArticleEntity> {
        return await this.articleRepository.findOneBy({slug})
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
        const article = await this.getArticleBySlug(slug)

        if (!article) {
            throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND)
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException("You are not author", HttpStatus.FORBIDDEN)
        }

        return await this.articleRepository.delete({slug})
    }

    async putArticle(slug: string, currentUserId: number, newArticle: CreateArticleDto): Promise<ArticleResponseInterface> {
        const article = await this.getArticleBySlug(slug)

        if (!article) {
            throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND)
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException("You are not author", HttpStatus.FORBIDDEN)
        }

        const result = await this.articleRepository.save(Object.assign(article, newArticle))
        return this.buildArticleResponse(result)

    }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return {article}
    }

    private getSlug(title: string): string {
        return slugify(title, {lower: true}) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    }
}