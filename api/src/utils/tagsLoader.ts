import { ArticleTag } from "@/entities/articletag.entity"
import { In } from "typeorm"
import DataLoader from "dataloader";
import { TagEntity } from "@/entities/tag.entity";

const batchTag = async(articleIds: number[]) => {
    const articleTags = await ArticleTag.find({
        join: {
            alias: "articleTag",
            innerJoinAndSelect: {
                tag: "articleTag.tag"
            }
        },
        where: {
            articleId: In(articleIds)
        }
    });

    console.log(articleTags);
    const articleIdToTag: {[key: number]: TagEntity[] } = {};

    articleTags.forEach(at => {
        const { articleId } = at;
        if (at.articleId in articleIdToTag) {
            articleIdToTag[articleId].push((at as any).__tag__);
        } else {
            articleIdToTag[articleId] = [(at as any).__tag__];
        }
    })

    return articleIds.map(articleId => articleIdToTag[articleId]);
}

export const createTagsLoader = () => new DataLoader(batchTag);