import { CreateArticleDto } from "@/dtos/article.dto";
import { ArticleEntity } from "@/entities/article.entity";
import { ArticleTag } from "@/entities/articletag.entity";
import { TagEntity } from "@/entities/tag.entity";
import { Article } from "@/typedefs/article.type";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { In } from "typeorm";
import { TagDto } from "@dtos/tag.dto";
import { SHARE_ENV } from "worker_threads";


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
        return TagEntity.create(tagData).save();
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