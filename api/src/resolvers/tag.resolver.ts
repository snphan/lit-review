import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Tag } from '@typedefs/tag.type';
import TagRepository from '@/repositories/tag.repository';
import { TagDto } from '@/dtos/tag.dto';

@Resolver()
export class tagResolver extends TagRepository {
    @Query(() => [Tag], {
        description: "Tag list"
    })
    async getTags(): Promise<Tag[]> {
        const tags: Tag[] = await this.tagFindAll();
        return tags;
    }

    @Mutation(() => Tag, {
        description: "Create a tag"
    })
    async createTag(@Arg('tagData') tagData: TagDto): Promise<Tag> {
        const tag: Tag = await this.tagCreate(tagData);
        return tag;
    }
}