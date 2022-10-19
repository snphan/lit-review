import { CreateArticleDto } from "@/dtos/article.dto";
import { ArticleEntity } from "@/entities/article.entity";
import { ArticleTag } from "@/entities/articletag.entity";
import { TagEntity } from "@/entities/tag.entity";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { TagDto } from "@dtos/tag.dto";
import { HttpException } from "@/exceptions/HttpException";
import { Connection, TransactionAlreadyStartedError } from "typeorm";


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

  @Mutation(() => TagEntity)
  async addTag(@Arg("tagData") tagData: TagDto): Promise<TagEntity> {
    const findTag: TagEntity = await TagEntity.findOne({ where: { name: tagData.name } });
    if (findTag) throw new HttpException(409, `This tag: ${tagData.name} already exists.`);

    const newTag: TagEntity = await TagEntity.create(tagData).save();
    return newTag;
  }

  @Query(() => [ArticleEntity])
  async getArticlesByTag(@Ctx() { articleLoader }: any, @Arg("tagName") tagName: string): Promise<ArticleEntity[]> {
    const findTag = await TagEntity.findOne({ where: { name: tagName } });

    if (!findTag) throw new HttpException(404, `Tag ${tagName} Cannot be found`);
    return articleLoader.load(findTag.id);
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