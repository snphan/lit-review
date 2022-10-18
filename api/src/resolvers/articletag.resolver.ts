import { CreateArticleDto } from "@/dtos/article.dto";
import { ArticleEntity } from "@/entities/article.entity";
import { ArticleTag } from "@/entities/articletag.entity";
import { TagEntity } from "@/entities/tag.entity";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { TagDto } from "@dtos/tag.dto";
import { HttpException } from "@/exceptions/HttpException";


@Resolver()
export class ArticleTagResolver {
    @Mutation(() => Boolean)
    async addArticleTag(
        @Arg("articleId", () => Int) articleId: number,
        @Arg("tagId", () => Int) tagId: number
    ) {
        await ArticleTag.create({articleId, tagId}).save();
        return true;
    }

    @Mutation(() => ArticleEntity) 
    async addArticle(@Arg("articleData") articleData: CreateArticleDto): Promise<ArticleEntity> {
        return ArticleEntity.create(articleData).save();
    }

    @Mutation(() => TagEntity) 
    async addTag(@Arg("tagData") tagData: TagDto): Promise<TagEntity> {
        const findTag: TagEntity = await TagEntity.findOne({where: {name: tagData.name}});
        console.log(findTag);
        if (findTag) throw new HttpException(409, `This tag: ${tagData.name} already exists.`);

        const newTag: TagEntity = await TagEntity.create(tagData).save();
        return newTag;
    }

    @Query(() => [ArticleEntity])
    async getArticlesByTag(@Ctx() {articleLoader}: any, @Arg("tagName") tagName: string): Promise<ArticleEntity[]> {
        const findTag = await TagEntity.findOne({where: {name: tagName}});

        if (!findTag) throw new HttpException(404, `Tag ${tagName} Cannot be found`);
        return articleLoader.load(findTag.id);
    }

    @Query(() => [ArticleEntity]) 
    async articles() {
        return ArticleEntity.find();
    }

    @Query(() => [TagEntity])
    async tags() {
        return TagEntity.find();
    }

}