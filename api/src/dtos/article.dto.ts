import { InputType, Field } from 'type-graphql';
import { Article } from '@typedefs/article.type';

@InputType()
export class CreateArticleDto implements Partial<Article> {
  @Field()
  title: string;

  @Field()
  firstAuthor: string;

  @Field()
  summary: string;

  @Field()
  year: number;
}
