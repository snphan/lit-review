import React from 'react';
import { Tag, TagData } from './Tag';
import { Button } from 'react-bootstrap';
import '../App.css';

export interface ArticleData {
  id: string;
  title: string;
  firstAuthor: string;
  summary: string;
  year: number;
  tags: TagData[];
  inputTags: number[] | null;
}


export function Article(props: any) {
  const article: ArticleData = props.article;

  return (
    <tr onDoubleClick={() => {
      props.setEditData(article);
      props.handleShow();
    }}>
      <td>{article.id}</td>
      <td>{article.title}</td>
      <td>{article.firstAuthor}</td>
      <td>{article.year}</td>
      <td dangerouslySetInnerHTML={{ __html: article.summary }}></td>
      <td>
        {article.tags?.map((tag: TagData) =>
          <Tag key={`Tag${tag.id}`} {...tag}></Tag>
        )}
      </td>
    </tr>
  )
}
