import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Tag {
    @Field()
    id: number;

    @Field()
    name: string;
}