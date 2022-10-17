import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Tag } from "@interfaces/tag.interface";
import { ArticleTag } from "./articletag.entity";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class TagEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @Column()
    @Field()
    @IsNotEmpty()
    name: string;

    @OneToMany(() => ArticleTag, at => at.article)
    articleConnection: Promise<ArticleTag[]>
}



