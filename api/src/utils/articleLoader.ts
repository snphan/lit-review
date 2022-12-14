import { ArticleEntity } from "@/entities/article.entity";
import { ArticleTag } from "@/entities/articletag.entity"
import { In } from "typeorm"
import DataLoader from "dataloader";



const batchArticles = async (tagIds: number[]) => {
  console.log('inside of articleloader', tagIds);
  const articleTags = await ArticleTag.find({
    join: {
      alias: "articleTag",
      innerJoinAndSelect: {
        article: "articleTag.article"
      }
    },
    where: {
      tagId: In(tagIds)
    }
  });

  const tagIdToArticle: { [key: number]: ArticleEntity[] } = {};

  articleTags.forEach(at => {
    const { tagId } = at;
    if (tagId in tagIdToArticle) {
      tagIdToArticle[tagId].push((at as any).__article__);
    } else {
      tagIdToArticle[tagId] = [(at as any).__article__];
    }
  })

  // console.log(tagIdToArticle);
  console.log(tagIds.map(tagId => tagIdToArticle[tagId]));
  return tagIds.map(tagId => tagIdToArticle[tagId]);
}

export const createArticlesLoader = () => new DataLoader(batchArticles);