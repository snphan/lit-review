import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Article {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field()
  firstAuthor: string; 

  @Field()
  summary: string;

  @Field()
  year: number;
}
