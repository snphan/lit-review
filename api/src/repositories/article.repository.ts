import { hash } from 'bcrypt';
import { EntityRepository } from 'typeorm';
import { CreateArticleDto } from '@dtos/article.dto';
import { ArticleEntity } from '@entities/article.entity';
import { HttpException } from '@exceptions/HttpException';
import { Article } from '@interfaces/article.interface';
import { isEmpty } from '@utils/util';

@EntityRepository()
export default class ArticleRepository {
  public async articleFindAll(): Promise<Article[]> {
    const users: Article[] = await ArticleEntity.find();

    return users;
  }

//   public async userFindById(userId: number): Promise<User> {
//     if (isEmpty(userId)) throw new HttpException(400, "UserId is empty");

//     const user: User = await UserEntity.findOne({ where: { id: userId } });
//     if (!user) throw new HttpException(409, "User doesn't exist");

//     return user;
//   }

  public async articleCreate(articleData: CreateArticleDto): Promise<Article> {
    if (isEmpty(articleData)) throw new HttpException(400, "Article is empty");

    const findArticle: Article = await ArticleEntity.findOne({ where: { title: articleData.title } });
    if (findArticle) throw new HttpException(409, `This title ${articleData.title} already exists`);

    const createArticleData: Article = await ArticleEntity.create(articleData).save();

    return createArticleData;
  }

//   public async userUpdate(userId: number, userData: CreateUserDto): Promise<User> {
//     if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

//     const findUser: User = await UserEntity.findOne({ where: { id: userId } });
//     if (!findUser) throw new HttpException(409, "User doesn't exist");

//     const hashedPassword = await hash(userData.password, 10);
//     await UserEntity.update(userId, { ...userData, password: hashedPassword });

//     const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
//     return updateUser;
//   }

//   public async userDelete(userId: number): Promise<User> {
//     if (isEmpty(userId)) throw new HttpException(400, "User doesn't existId");

//     const findUser: User = await UserEntity.findOne({ where: { id: userId } });
//     if (!findUser) throw new HttpException(409, "User doesn't exist");

//     await UserEntity.delete({ id: userId });
//     return findUser;
//   }
}
