import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ArticleEntity } from "./article.entity";
import { TagEntity } from "./tag.entity";



@Entity()
export class ArticleTag extends BaseEntity {
    @PrimaryColumn()
    articleId: number;

    @PrimaryColumn()
    tagId: number;

    @ManyToOne(() => ArticleEntity, article => article.tagConnection, { primary: true})
    @JoinColumn({name: "articleId"})
    article: Promise<ArticleEntity>

    @ManyToOne(() => TagEntity, tag => tag.articleConnection, { primary: true})
    @JoinColumn({ name: "tagId" })
    tag: Promise<TagEntity>
}