import {ArticleEntity} from "../article/article.entity";

export interface ArticlesResponseInterface {
    articles: ArticleEntity[]
    articlesCount: number
}