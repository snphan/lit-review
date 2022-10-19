import { InputType, Field, Int } from 'type-graphql';
import { ArticleEntity } from '@/entities/article.entity';
import { TagEntity } from '@/entities/tag.entity';

// The DTO Is the data transfer object, we fill in the fields for the data
// and it can be used to create objects in our table.

@InputType()
export class CreateArticleDto implements Partial<ArticleEntity> {
  @Field()
  title: string;

  @Field()
  firstAuthor: string;

  @Field()
  summary: string;

  @Field()
  year: number;

  @Field(() => [Int], {nullable: true}) 
  inputTags: number[];
}
