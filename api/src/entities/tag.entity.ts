import { BaseEntity, PrimaryGeneratedColumn, Column, Entity } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Tag } from "@interfaces/tag.interface";

@Entity()
export class TagEntity extends BaseEntity implements Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty()
    name: string;
}



