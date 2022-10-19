import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
// import { Article } from '@interfaces/article.interface';
import { Ctx, Field, ID, Int, ObjectType } from 'type-graphql';
import { TagEntity } from './tag.entity';
import { ArticleTag } from './articletag.entity';

// An entity is something that goes into the database.

@ObjectType()
@Entity()
export class ArticleEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  @IsNotEmpty()
  title: string;

  @Column()
  @Field()
  firstAuthor: string;

  @Column()
  @Field()
  year: number;

  @Column()
  @Field()
  summary: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ArticleTag, at => at.tag)
  tagConnection: Promise<ArticleTag[]>

  @Field(() => [TagEntity], {nullable: true})
  async tags(@Ctx() { tagsLoader }: any): Promise<TagEntity[]> {
    return tagsLoader.load(this.id);
  }

  @Field(() => [Int], {nullable: true})
  inputTags: number[];
}
