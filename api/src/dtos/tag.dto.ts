import { Tag } from "@interfaces/tag.interface";
import { InputType, Field } from "type-graphql";

@InputType()
export class TagDto implements Partial<Tag> {
    @Field()
    name: string;
}