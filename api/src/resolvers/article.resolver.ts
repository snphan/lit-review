
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { CreateArticleDto } from '@dtos/article.dto';
import ArticleRepository from '@repositories/article.repository';
import { Article } from '@typedefs/article.type';

@Resolver()
export class articleResolver extends ArticleRepository {
  @Query(() => [Article], {
    description: 'Aritcle find list',
  })
  async getArticle(): Promise<Article[]> {
    const articles: Article[] = await this.articleFindAll();
    return articles;
  }

//   @Query(() => Article, {
//     description: 'Article find by id',
//   })
//   async getArticleById(@Arg('articleId') articleId: number): Promise<article> {
//     const article: Article = await this.articleFindById(articleId);
//     return article;
//   }

  @Mutation(() => Article, {
    description: 'Article create',
  })
  async createArticle(@Arg('articleData') articleData: CreateArticleDto): Promise<Article> {
    const article: Article = await this.articleCreate(articleData);
    return article;
  }

//   @Mutation(() => Article, {
//     description: 'Article update',
//   })
//   async updateArticle(@Arg('articleId') articleId: number, @Arg('articleData') articleData: CreatearticleDto): Promise<article> {
//     const article: Article = await this.articleUpdate(articleId, articleData);
//     return article;
//   }

//   @Mutation(() => Article, {
//     description: 'Article delete',
//   })
//   async deleteArticle(@Arg('articleId') articleId: number): Promise<article> {
//     const article: Article = await this.articleDelete(articleId);
//     return article;
//   }
}
