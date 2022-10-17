import { Ctx, Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Author } from "@entities/author.entity";
import { AuthorBook } from "@entities/authorbook.entity";

@ObjectType()
@Entity()
export class Book extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @OneToMany(() => AuthorBook, ab => ab.book)
  authorConnection: Promise<AuthorBook[]>;

  @Field(() => [Author])
  async authors(@Ctx() { authorsLoader }: any): Promise<Author[]> {
    return authorsLoader.load(this.id);
  }

}