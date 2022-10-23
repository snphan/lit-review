import { CreateArticleDto } from "@/dtos/article.dto";
import { ArticleEntity } from "@/entities/article.entity";
import { ArticleTag } from "@/entities/articletag.entity";
import { TagEntity } from "@/entities/tag.entity";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { TagDto } from "@dtos/tag.dto";
import { HttpException } from "@/exceptions/HttpException";
import { Between, Connection, In, Like, Not, TransactionAlreadyStartedError } from "typeorm";



@Resolver()
export class ArticleTagResolver {
  @Mutation(() => Boolean)
  async addArticleTag(
    @Arg("articleId", () => Int) articleId: number,
    @Arg("tagId", () => Int) tagId: number
  ) {
    await ArticleTag.create({ articleId, tagId }).save();
    return true;
  }

  @Mutation(() => ArticleEntity)
  async updateArticle(
    @Ctx() { connection }: any,
    @Arg('articleId') articleId: number,
    @Arg('articleData') articleData: CreateArticleDto
  ) {
    const changedArticle: ArticleEntity = await ArticleEntity.findOne({ where: { id: articleId } });
    const { inputTags, ...data } = articleData;

    await connection.manager.transaction(async (manager) => {
      await ArticleEntity.update(changedArticle.id, data);

      // Update the connections
      const oldArticleTags: ArticleTag[] = await ArticleTag.find({ where: { articleId: articleId } });
      await ArticleTag.delete({ articleId: articleId });
      if (inputTags) {
        inputTags!.forEach(async (tagId) => {
          // TODO: Batch create
          const newArticleTag = ArticleTag.create({ articleId, tagId });
          await manager.save(newArticleTag);
        })
      }
    });
    const updatedArticle: ArticleEntity = await ArticleEntity.findOne({ where: { id: articleId } });
    return updatedArticle;
  }

  @Mutation(() => ArticleEntity)
  async addArticle(@Ctx() { connection }: any, @Arg("articleData") articleData: CreateArticleDto): Promise<ArticleEntity> {
    // Transaction in case crash halfway. Commit at the end
    let newArticle: ArticleEntity;
    await connection.manager.transaction(async (manager) => {
      let { inputTags, ...data } = articleData;
      newArticle = ArticleEntity.create(data);
      await manager.save(newArticle);
      const articleId = newArticle.id;
      if (inputTags) {
        inputTags!.forEach(async (tagId) => {
          const newArticleTag = ArticleTag.create({ articleId, tagId });
          await manager.save(newArticleTag);
        })
      }
    })
    return newArticle;
  }

  @Mutation(() => Boolean)
  async deleteArticle(@Arg("articleId") articleId: number): Promise<boolean> {
    await ArticleEntity.delete(articleId);
    return true;
  }

  @Mutation(() => TagEntity)
  async addTag(@Arg("tagData") tagData: TagDto): Promise<TagEntity> {
    const findTag: TagEntity = await TagEntity.findOne({ where: { name: tagData.name } });
    if (findTag) throw new HttpException(409, `This tag: ${tagData.name} already exists.`);

    const newTag: TagEntity = await TagEntity.create(tagData).save();
    return newTag;
  }

  @Query(() => [ArticleEntity])
  async filterArticles(
    @Ctx() { articleLoader }: any,
    @Arg("tagNames", () => [String]) tagNames: string[],
    @Arg("dates", () => [Int], { nullable: true }) dates: number[] | null,
    @Arg("summaryKeyword", { nullable: true }) summaryKeyword: string | null,
    @Arg("titleKeyword", { nullable: true }) titleKeyword: string | null,
    @Arg("authorKeyword", { nullable: true }) authorKeyword: string | null,
  ): Promise<ArticleEntity[]> {
    const findTag = await TagEntity.find({ where: { name: In(tagNames) } });
    if (!findTag) throw new HttpException(404, `Tag ${tagNames} Cannot be found`);

    const nonTagFilterArticles = await ArticleEntity.find(
      {
        where: {
          ...(dates && { year: Between(dates[0], dates[1]) }), // Destruct and add to where only if dates exists.
          ...(authorKeyword && { firstAuthor: Like(authorKeyword) }), // Destruct and add to where only if author exists.
          ...(summaryKeyword && { summary: Like(summaryKeyword) }), // Destruct and add to where only if summary exists.
          ...(titleKeyword && { title: Like(titleKeyword) }), // Destruct and add to where only if title exists.
        }
      })

    const result = await articleLoader.loadMany(findTag.map((tag: TagEntity) => tag.id));
    // Contains the result from tags + all other field queries
    result.push(nonTagFilterArticles);
    const intersectionResult = result.reduce((a: ArticleEntity[], c: ArticleEntity[]) => a.filter(i => (c.map((elem) => elem.id)).includes(i.id)));
    console.log('intersectionResult', intersectionResult);
    return intersectionResult;
  }

  @Query(() => [ArticleEntity])
  async articlesFindBySummary(@Arg("summary") summary: string) {
    return ArticleEntity.find({
      where: {
        summary: Like(`%${summary}%`),
      }
    });
  }

  @Query(() => [ArticleEntity])
  async articles() {
    return (await ArticleEntity.find()).sort((a, b) => a.id - b.id);
  }

  @Query(() => [TagEntity])
  async tags() {
    return TagEntity.find();
  }

}
