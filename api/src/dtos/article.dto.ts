import { InputType, Field } from 'type-graphql';
import { Article } from '@typedefs/article.type';

// The DTO Is the data transfer object, we fill in the fields for the data
// and it can be used to create objects in our table.

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
