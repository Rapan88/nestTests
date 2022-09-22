import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import UserEntity from "../user/user.entity";
import {CreateArticleDto} from "../dto/createArticle.dto";
import {ArticleEntity} from "./article.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, Repository} from "typeorm";
import {ArticleResponseInterface} from "../types/articleResponse.interface";
import slugify from 'slugify'
import {ArticlesResponseInterface} from "../types/articlesResponse.interface";

@Injectable()
export class ArticleService {

    constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
                @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {
    }


    async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {

        const queryBuilder = this.articleRepository
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')

        queryBuilder.orderBy('articles.createdAt', 'DESC')

        const articlesCount = await queryBuilder.getCount()

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {tag: `%${query.tag}%`})
        }

        if (query.author) {
            const author = await this.userRepository.findOne({where: {username: query.author}})
            queryBuilder.andWhere('articles.authorId = :id', {id: author.id})
        }

        if (query.favorited) {
            const author = await this.userRepository.findOne({
                where: {username: query.favorited},
                relations: ['favorites']
            })
            const ids = author.favorites.map((el) => el.id)
            if (ids.length > 0) {
                queryBuilder.andWhere('articles.authorId IN (:...ids)', {ids})
                console.log("Тут в нас ноль, чому?")
            } else {
                queryBuilder.andWhere('1=0')
            }
        }

        if (query.limit) {
            queryBuilder.limit(query.limit)
        }

        if (query.offset) {
            queryBuilder.offset(query.offset)
        }

        const articles = await queryBuilder.getMany()

        return {articles, articlesCount}
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

    async addArticleToFavorites(currentUserId: number, slug: any): Promise<ArticleEntity> {
        const article = await this.getArticleBySlug(slug)
        const user = await this.userRepository.findOne({where: {id: currentUserId}, relations: ['favorites']})

        const isNotFavorited = user.favorites.findIndex(
            (articleInFavorites) => articleInFavorites.id === article.id) === -1
        if (isNotFavorited) {
            user.favorites.push(article)
            article.favoritesCount++
            await this.userRepository.save(user)
            await this.articleRepository.save(article)
        }
        return article;
    }

    async deleteArticleFromFavorites(currentUserId: number, slug: any): Promise<ArticleEntity> {
        const article = await this.getArticleBySlug(slug)
        const user = await this.userRepository.findOne({where: {id: currentUserId}, relations: ['favorites']})

        const articleIndex = user.favorites.findIndex(
            (articleInFavorites) => articleInFavorites.id === article.id)
        if (articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1)
            article.favoritesCount--
            await this.userRepository.save(user)
            await this.articleRepository.save(article)
        }
        return article;
    }
}