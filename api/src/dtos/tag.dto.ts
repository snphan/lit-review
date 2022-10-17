import { TagEntity } from "@/entities/tag.entity";
import { Tag } from "@interfaces/tag.interface";
import { InputType, Field } from "type-graphql";

@InputType()
export class TagDto implements Partial<TagEntity> {
    @Field()
    name: string;
}