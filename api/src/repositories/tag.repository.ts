import { EntityRepository } from 'typeorm';
import { TagDto } from '@/dtos/tag.dto'; 
import { TagEntity } from '@/entities/tag.entity';
import { HttpException } from '@/exceptions/HttpException';
import { Tag } from '@/interfaces/tag.interface';
import { isEmpty } from '@utils/util';


@EntityRepository()
export default class TagRepository {
    public async tagFindAll(): Promise<Tag[]> {
        const tags: Tag[] = await TagEntity.find();
        return tags;
    }

    public async tagCreate(tagData: TagDto): Promise<Tag> {
        if (isEmpty(tagData)) throw new HttpException(400, "Tag is Empty");

        const findTag: Tag = await TagEntity.findOne({where: {name: tagData.name}});
        if (findTag) throw new HttpException(409, `This tag ${tagData.name} already exists`);

        const createTagData: Tag = await TagEntity.create(tagData).save();
        return createTagData;
    }

}