import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import { Author } from "@entities/author.entity";
import { Book } from "@entities/book.entity";

@Entity()
export class AuthorBook extends BaseEntity {
  @PrimaryColumn()
  authorId: number;

  @PrimaryColumn()
  bookId: number;

  @ManyToOne(() => Author, author => author.bookConnection, { primary: true })
  @JoinColumn({ name: "authorId" })
  author: Promise<Author>;

  @ManyToOne(() => Book, book => book.authorConnection, {
    primary: true
  })
  @JoinColumn({ name: "bookId" })
  book: Promise<Book>;
}